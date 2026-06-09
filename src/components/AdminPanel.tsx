import React, { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, Edit, ShieldAlert, Sparkles, Check, RefreshCw,
  Zap, Search, CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react';
import type { Slip, Game } from '../types';
import { sanitizeUrl } from '../lib/security';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  slips: Slip[];
  onAddSlip: (slip: Slip) => void;
  onUpdateSlip: (slip: Slip) => void;
  onDeleteSlip: (id: string) => void;
  onResetMockData: () => void;
}

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

// ─── SportyBet API parser ────────────────────────────────────────────────────
// Attempts to parse multiple possible response structures from the internal API.
function parseSportyBetResponse(json: Record<string, unknown>): {
  games: Omit<Game, 'id'>[];
  totalOdds: number;
} {
  // Expected root: { bizCode: 10000, data: { outcomes: [...], totalOddsValue: "xx" } }
  const data = (json.data ?? json) as Record<string, unknown>;

  type RawOutcome = Record<string, unknown>;
  const outcomes = (data.outcomes ?? data.events ?? data.selections ?? []) as RawOutcome[];

  if (!Array.isArray(outcomes) || outcomes.length === 0) {
    throw new Error('No matches found in the API response.');
  }

  const games: Omit<Game, 'id'>[] = outcomes.map((o) => {
    const home =
      (o.homeTeamName ?? o.home_team ?? o.homeTeam ?? o.team1 ?? '') as string;
    const away =
      (o.awayTeamName ?? o.away_team ?? o.awayTeam ?? o.team2 ?? '') as string;
    const market =
      (o.marketName ?? o.market ?? o.betType ?? '') as string;
    const outcome =
      (o.outcomeName ?? o.outcome ?? o.pick ?? o.selection ?? '') as string;
    const oddsRaw = o.oddsValue ?? o.odds ?? o.odd ?? 1.5;
    const odds = parseFloat(String(oddsRaw)) || 1.5;

    const prediction = market && outcome ? `${market}: ${outcome}` : outcome || market || 'TBD';

    return { homeTeam: home, awayTeam: away, prediction, odds };
  });

  const totalOdds =
    parseFloat(String(data.totalOddsValue ?? data.total_odds ?? data.totalOdds ?? 0)) || 0;

  return { games, totalOdds };
}

// ─── Component ──────────────────────────────────────────────────────────────
export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  slips,
  onAddSlip,
  onUpdateSlip,
  onDeleteSlip,
  onResetMockData,
}) => {
  // Form state
  const [editingSlip, setEditingSlip] = useState<Slip | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formOdds, setFormOdds] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formStatus, setFormStatus] = useState<'hot' | 'won' | 'pending' | 'lost'>('hot');
  const [formIsVip, setFormIsVip] = useState(false);
  const [formPrice, setFormPrice] = useState('');
  const [formUnlockLink, setFormUnlockLink] = useState('');
  const [formGames, setFormGames] = useState<Omit<Game, 'id'>[]>([
    { homeTeam: '', awayTeam: '', prediction: '', odds: 1.5 },
  ]);

  // Quick-import state
  const [importCode, setImportCode] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [importError, setImportError] = useState('');

  // Auto-calculate total odds when games change
  useEffect(() => {
    const total = formGames.reduce((acc, game) => acc * (Number(game.odds) || 1), 1);
    setFormOdds(total > 1 ? total.toFixed(2) : '');
  }, [formGames]);

  // Set initial date to today
  useEffect(() => {
    if (!editingSlip) {
      const formatted = new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      setFormDate(formatted);
    }
  }, [editingSlip, isOpen]);

  // ── Fetch from SportyBet ──────────────────────────────────────────────────
  const handleFetchFromSportyBet = async () => {
    const code = importCode.trim().toUpperCase();
    if (!code) return;

    setImportStatus('loading');
    setImportError('');

    // SportyBet Ghana internal share-code endpoint
    const sportyUrl = `https://www.sportybet.com/api/gh/factsCenter/publicShareCode?shareCode=${code}`;

    // We try two CORS proxies in sequence
    const proxies = [
      `https://corsproxy.io/?${encodeURIComponent(sportyUrl)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(sportyUrl)}`,
    ];

    let lastError = '';

    for (const proxyUrl of proxies) {
      try {
        const res = await fetch(proxyUrl, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        let payload = await res.json();

        // allorigins wraps the response in { contents: "..." }
        if (typeof payload.contents === 'string') {
          payload = JSON.parse(payload.contents);
        }

        const { games, totalOdds } = parseSportyBetResponse(payload);

        // Populate the form
        setFormCode(code);
        setFormGames(games);
        if (totalOdds > 0) setFormOdds(totalOdds.toFixed(2));
        setImportStatus('success');
        setImportCode('');
        return; // success → stop trying
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown error';
      }
    }

    // All proxies failed
    setImportStatus('error');
    setImportError(
      `Could not auto-load matches (${lastError}). ` +
      `SportyBet may be blocking external requests. ` +
      `The booking code has been pre-filled — please add matches manually below.`
    );
    // Still pre-fill the code so it's not wasted
    setFormCode(code);
  };

  // ── Form helpers ─────────────────────────────────────────────────────────
  const startEdit = (slip: Slip) => {
    setEditingSlip(slip);
    setFormDate(slip.date);
    setFormOdds(slip.totalOdds.toString());
    setFormCode(slip.bookingCode);
    setFormStatus(slip.status);
    setFormIsVip(slip.isVip);
    setFormPrice(slip.price || '');
    setFormUnlockLink(slip.unlockLink || '');
    setFormGames(
      slip.games.map(({ homeTeam, awayTeam, prediction, odds }) => ({
        homeTeam, awayTeam, prediction, odds,
      }))
    );
    setImportStatus('idle');
    setImportError('');
  };

  const cancelEdit = () => {
    setEditingSlip(null);
    clearForm();
  };

  const clearForm = () => {
    const formatted = new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    setFormDate(formatted);
    setFormOdds('');
    setFormCode('');
    setFormStatus('hot');
    setFormIsVip(false);
    setFormPrice('');
    setFormUnlockLink('');
    setFormGames([{ homeTeam: '', awayTeam: '', prediction: '', odds: 1.5 }]);
    setImportStatus('idle');
    setImportError('');
    setImportCode('');
  };

  const handleGameChange = (
    index: number,
    field: keyof Omit<Game, 'id'>,
    value: string | number
  ) => {
    const updated = [...formGames];
    updated[index] = {
      ...updated[index],
      [field]: field === 'odds' ? Number(value) : value,
    };
    setFormGames(updated);
  };

  const addGameRow = () =>
    setFormGames([...formGames, { homeTeam: '', awayTeam: '', prediction: '', odds: 1.5 }]);

  const removeGameRow = (index: number) => {
    if (formGames.length > 1) setFormGames(formGames.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCode || !formDate || formGames.some(g => !g.homeTeam || !g.awayTeam || !g.prediction)) {
      alert('Please fill out all required fields and match details!');
      return;
    }

    const compiledGames: Game[] = formGames.map((game, i) => ({
      id: editingSlip ? (editingSlip.games[i]?.id || `game-${Date.now()}-${i}`) : `game-${Date.now()}-${i}`,
      ...game,
    }));

    // Stamp a timestamp when status becomes won/lost so the 30-min auto-hide can trigger.
    // Preserve an existing timestamp if the status hasn't changed to/from won|lost.
    const isFinished = formStatus === 'won' || formStatus === 'lost';
    const prevFinished = editingSlip?.status === 'won' || editingSlip?.status === 'lost';
    const statusUpdatedAt: number | undefined = isFinished
      ? (prevFinished && editingSlip?.statusUpdatedAt ? editingSlip.statusUpdatedAt : Date.now())
      : undefined;

    const slipData: Slip = {
      id: editingSlip ? editingSlip.id : `slip-${Date.now()}`,
      date: formDate,
      totalOdds: Number(formOdds) || 1.00,
      bookingCode: formCode.toUpperCase().trim(),
      status: formStatus,
      isVip: formIsVip,
      price: formIsVip && formPrice.trim() ? formPrice.trim() : undefined,
      unlockLink: formIsVip && formUnlockLink.trim() ? sanitizeUrl(formUnlockLink) : undefined,
      games: compiledGames,
      stakeLink: 'https://www.sportybet.com/',
      statusUpdatedAt,
    };

    if (editingSlip) {
      onUpdateSlip(slipData);
      setEditingSlip(null);
    } else {
      onAddSlip(slipData);
    }

    clearForm();
    alert(editingSlip ? '✅ Slip updated successfully!' : '✅ Slip uploaded successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-zinc-900 border-l border-white/5 flex flex-col shadow-2xl">

          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-zinc-950">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-sporty-red" />
              <span className="font-extrabold text-lg uppercase italic text-white">
                {editingSlip ? 'Edit Betting Slip' : 'Admin Slip Upload'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* ── Quick Import Card (only for new slips) ── */}
            {!editingSlip && (
              <div className="rounded-2xl border border-sporty-red/30 bg-sporty-red/5 p-5 space-y-4">
                {/* Title */}
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-sporty-red" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">
                    ⚡ Quick Import from SportyBet
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Paste a SportyBet booking code below and click <strong className="text-white">Fetch Matches</strong>. All
                  games, predictions &amp; odds will auto-load into the form.
                </p>

                {/* Input + button */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g.  BC34XYZ"
                    value={importCode}
                    onChange={(e) => {
                      setImportCode(e.target.value.toUpperCase());
                      if (importStatus !== 'idle') setImportStatus('idle');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleFetchFromSportyBet()}
                    className="flex-1 bg-zinc-950 border border-white/10 focus:border-sporty-red focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white uppercase font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={handleFetchFromSportyBet}
                    disabled={importStatus === 'loading' || !importCode.trim()}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-sporty-red hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase rounded-xl transition-all active:scale-95 shrink-0"
                  >
                    {importStatus === 'loading' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>{importStatus === 'loading' ? 'Fetching…' : 'Fetch Matches'}</span>
                  </button>
                </div>

                {/* Status feedback */}
                {importStatus === 'success' && (
                  <div className="flex items-start space-x-2 p-3 bg-sporty-green/10 border border-sporty-green/20 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-sporty-green shrink-0 mt-0.5" />
                    <p className="text-[11px] text-sporty-green font-bold">
                      ✅ {formGames.length} match{formGames.length !== 1 ? 'es' : ''} loaded successfully! Review &amp; upload below.
                    </p>
                  </div>
                )}

                {importStatus === 'error' && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-yellow-300 leading-relaxed">{importError}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Demo/Reset actions ── */}
            {!editingSlip && (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Demo / Reset</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Restore default sample slips.</p>
                </div>
                <button
                  onClick={onResetMockData}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-xl border border-white/5 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Default Slips</span>
                </button>
              </div>
            )}

            {/* ── Slip Form ── */}
            <form onSubmit={handleSubmit} className="space-y-5 bg-white/[0.01] border border-white/5 p-5 rounded-2xl">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sporty-red" />
                {editingSlip ? 'SLIP DETAILS' : 'SLIP DETAILS'}
              </h3>

              {/* Date + Booking Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Event Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., May 26, 2026"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 focus:border-sporty-red focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Booking Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., BC34XYZ"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 focus:border-sporty-red focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white uppercase font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* Status + Total Odds */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Slip Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'hot' | 'won' | 'pending' | 'lost')}
                    className="w-full bg-zinc-950 border border-white/10 focus:border-sporty-red focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white"
                  >
                    <option value="hot">🔥 Hot Bet</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="won">✅ Won</option>
                    <option value="lost">❌ Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Total Odds (Auto)</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="1.00"
                    value={formOdds}
                    className="w-full bg-zinc-950/50 border border-white/5 text-gray-400 rounded-xl px-3.5 py-2.5 text-sm font-mono"
                  />
                </div>
              </div>

              {/* VIP Toggle */}
              <div className="flex items-center space-x-3 bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="formIsVip"
                  checked={formIsVip}
                  onChange={(e) => setFormIsVip(e.target.checked)}
                  className="w-4 h-4 text-sporty-red focus:ring-0 rounded bg-zinc-900 border-white/20"
                />
                <label htmlFor="formIsVip" className="text-xs font-bold text-white uppercase tracking-wider cursor-pointer">
                  Mark as Premium VIP Slip (Locked code)
                </label>
              </div>

              {/* VIP Pricing — only visible when VIP is checked */}
              {formIsVip && (
                <div className="space-y-3 p-4 rounded-xl border border-sporty-gold/20 bg-sporty-gold/5">
                  <p className="text-[9px] font-bold text-sporty-gold uppercase tracking-widest">
                    💰 VIP Pricing — per game
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price (e.g. GH₵10)</label>
                      <input
                        type="text"
                        placeholder="e.g. GH₵10"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full bg-zinc-950 border border-sporty-gold/20 focus:border-sporty-gold focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Payment Link</label>
                      <input
                        type="url"
                        placeholder="https://selar.co/..."
                        value={formUnlockLink}
                        onChange={(e) => setFormUnlockLink(e.target.value)}
                        className="w-full bg-zinc-950 border border-sporty-gold/20 focus:border-sporty-gold focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-500 leading-relaxed">
                    Users who click "Unlock VIP" will see the price above and be redirected to the payment link. Leave blank for a generic unlock prompt.
                  </p>
                </div>
              )}

              {/* Matches section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Matches List ({formGames.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addGameRow}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-gray-300 font-bold border border-white/10"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Match</span>
                  </button>
                </div>

                {formGames.map((game, index) => (
                  <div key={index} className="bg-zinc-950/50 border border-white/5 p-4 rounded-xl space-y-3 relative">
                    {/* Game number badge */}
                    <div className="absolute top-2 left-3 text-[9px] font-black text-gray-600 uppercase font-mono">
                      #{index + 1}
                    </div>

                    {/* Delete row button */}
                    {formGames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGameRow(index)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-sporty-red transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="pt-4 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Home Team</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Chelsea"
                          value={game.homeTeam}
                          onChange={(e) => handleGameChange(index, 'homeTeam', e.target.value)}
                          className="w-full bg-zinc-900 border border-white/15 focus:border-sporty-red focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Away Team</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Arsenal"
                          value={game.awayTeam}
                          onChange={(e) => handleGameChange(index, 'awayTeam', e.target.value)}
                          className="w-full bg-zinc-900 border border-white/15 focus:border-sporty-red focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Prediction</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Over 2.5 / Home Win"
                          value={game.prediction}
                          onChange={(e) => handleGameChange(index, 'prediction', e.target.value)}
                          className="w-full bg-zinc-900 border border-white/15 focus:border-sporty-red focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Odds</label>
                        <input
                          type="number"
                          step="0.01"
                          min="1.01"
                          required
                          placeholder="1.50"
                          value={game.odds}
                          onChange={(e) => handleGameChange(index, 'odds', e.target.value)}
                          className="w-full bg-zinc-900 border border-white/15 focus:border-sporty-red focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center space-x-3 pt-3 border-t border-white/5">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-sporty-green hover:bg-sporty-green-dark text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSlip ? 'Update Betting Slip' : 'Upload Betting Slip'}</span>
                </button>
                {editingSlip && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/5"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* ── Manage existing slips ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-2">
                MANAGE UPLOADED SLIPS ({slips.length})
              </h3>

              <div className="space-y-3">
                {slips.map((slip) => (
                  <div
                    key={slip.id}
                    className="flex items-center justify-between p-4 bg-zinc-950 border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-bold text-white tracking-wide">
                          {slip.bookingCode}
                        </span>
                        {slip.isVip && (
                          <span className="px-1.5 py-0.5 rounded bg-sporty-gold/10 border border-sporty-gold/20 text-[8px] font-bold text-sporty-gold uppercase tracking-wider">
                            VIP
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500">{slip.date}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Odds: <span className="font-bold text-white">{slip.totalOdds.toFixed(2)}x</span> | Matches:{' '}
                        <span className="font-bold text-white">{slip.games.length}</span> | Status:{' '}
                        <span className="uppercase text-sporty-green font-bold">{slip.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => startEdit(slip)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all border border-white/5"
                        title="Edit Slip"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this slip?')) onDeleteSlip(slip.id);
                        }}
                        className="p-2 bg-sporty-red/10 hover:bg-sporty-red/20 border border-sporty-red/20 rounded-lg text-sporty-red transition-all"
                        title="Delete Slip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
