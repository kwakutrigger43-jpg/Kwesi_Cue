import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar, Copy, Check, ExternalLink, Lock,
  Flame, CheckCircle2, Clock, AlertTriangle,
  ChevronLeft, ChevronRight, Eye, EyeOff, Timer, Trophy,
} from 'lucide-react';
import type { Slip } from '../types';

interface SlipCardProps {
  slip: Slip;
  /** When true renders the dedicated Won-slip layout (all matches + win marks, no code/stake) */
  showWinIndicators?: boolean;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

const AUTO_HIDE_MS = 10 * 60 * 1000; // 10 minutes

// ─────────────────────────────────────────────────────────────────────────────
// WON SLIP CARD — full match list with ✅ per row, no booking code / stake btn
// ─────────────────────────────────────────────────────────────────────────────
const WonSlipCard: React.FC<{ slip: Slip }> = ({ slip }) => (
  <div className="relative flex flex-col rounded-2xl overflow-hidden border border-sporty-green/30 bg-sporty-green/5 shadow-lg shadow-sporty-green/5 hover:border-sporty-green/50 transition-all duration-300">


    {/* Green trophy header */}
    <div className="bg-gradient-to-r from-sporty-green/20 to-transparent border-b border-sporty-green/20 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-sporty-green" />
        <span className="text-[10px] font-black text-sporty-green uppercase tracking-widest">
          Winning Slip 🏆
        </span>
      </div>
      <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
        <Calendar className="w-3 h-3" />{slip.date}
      </span>
    </div>

    {/* Odds summary row */}
    <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
      <div>
        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">Total Odds</span>
        <span className="text-xl font-black italic text-sporty-green leading-none">
          {slip.totalOdds.toFixed(2)}<span className="text-base">x</span>
        </span>
      </div>
      <div className="text-right">
        <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">Matches</span>
        <span className="text-xl font-black text-white leading-none">{slip.games.length}</span>
      </div>
    </div>

    {/* All matches listed — each with ✅ */}
    <div className="flex-1 px-4 py-3 space-y-2">
      {slip.games.map((game) => (
        <div
          key={game.id}
          className="flex items-start gap-2 p-2 rounded-xl bg-sporty-green/5 border border-sporty-green/10"
        >
          {/* Win tick */}
          <CheckCircle2 className="w-3.5 h-3.5 text-sporty-green shrink-0 mt-0.5" />

          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-white truncate leading-tight">
              {game.homeTeam} <span className="text-gray-500 font-normal">vs</span> {game.awayTeam}
            </div>
            <div className="text-[10px] text-sporty-green font-bold uppercase truncate mt-0.5">
              {game.prediction}
            </div>
          </div>

          {/* Odds badge */}
          <span className="shrink-0 text-[10px] font-mono font-bold bg-sporty-green/15 text-sporty-green border border-sporty-green/25 px-1.5 py-0.5 rounded">
            {game.odds.toFixed(2)}
          </span>
        </div>
      ))}
    </div>

    {/* Won footer — no code, no stake button */}
    <div className="px-4 py-3 bg-sporty-green/10 border-t border-sporty-green/20 flex items-center justify-center gap-2">
      <CheckCircle2 className="w-3.5 h-3.5 text-sporty-green" />
      <span className="text-[10px] font-black text-sporty-green uppercase tracking-widest">
        All {slip.games.length} Match{slip.games.length !== 1 ? 'es' : ''} Won ✅
      </span>
    </div>
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// STANDARD SLIP CARD — carousel view with show/hide, code, stake button
// ─────────────────────────────────────────────────────────────────────────────
export const SlipCard: React.FC<SlipCardProps> = ({ 
  slip, 
  showWinIndicators = false,
  isAuthenticated,
  onRequireAuth
}) => {

  // Delegate entirely to WonSlipCard when viewing the Won tab
  if (showWinIndicators) return <WonSlipCard slip={slip} />;

  return (
    <StandardSlipCard 
      slip={slip} 
      isAuthenticated={isAuthenticated}
      onRequireAuth={onRequireAuth}
    />
  );
};


// Internal standard card — keeps all original carousel/timer logic clean
const StandardSlipCard: React.FC<{ 
  slip: Slip; 
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}> = ({ slip, isAuthenticated, onRequireAuth }) => {
  const [copied, setCopied]           = useState(false);
  const [gamesVisible, setGamesVisible] = useState(false);
  const [activeGame, setActiveGame]   = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    hideTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  const startAutoHide = useCallback(() => {
    clearAllTimers();
    setSecondsLeft(AUTO_HIDE_MS / 1000);
    hideTimerRef.current = setTimeout(() => {
      setGamesVisible(false);
      setSecondsLeft(0);
      clearAllTimers();
    }, AUTO_HIDE_MS);
    countdownRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearAllTimers(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [clearAllTimers]);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slip.isVip) return;
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    if (gamesVisible) {
      setGamesVisible(false);
      setSecondsLeft(0);
      clearAllTimers();
    } else {
      setGamesVisible(true);
      setActiveGame(0);
      startAutoHide();
    }
  };

  const prevGame = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGame(i => (i - 1 + slip.games.length) % slip.games.length);
  };

  const nextGame = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGame(i => (i + 1) % slip.games.length);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    try {
      await navigator.clipboard.writeText(slip.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const statusMap: Record<Slip['status'], { bg: string; icon: React.ReactNode; label: string }> = {
    won:     { bg: 'bg-sporty-green/10 border-sporty-green/30 text-sporty-green', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Won'     },
    lost:    { bg: 'bg-red-500/10 border-red-500/30 text-red-400',                icon: <AlertTriangle className="w-3 h-3" />, label: 'Lost'    },
    pending: { bg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',       icon: <Clock className="w-3 h-3" />,         label: 'Pending' },
    hot:     { bg: 'bg-sporty-red/10 border-sporty-red/30 text-sporty-red',       icon: <Flame className="w-3 h-3 fill-current" />, label: 'Hot' },
  };

  const status = statusMap[slip.status];
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const game = slip.games[activeGame];

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
      slip.isVip
        ? 'glassmorphism-premium border border-sporty-gold/30 hover:border-sporty-gold/50 shadow-lg shadow-sporty-gold/5'
        : 'glassmorphism border border-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-black/20'
    }`}>

      {/* VIP ribbon */}
      {slip.isVip && (
        <div className="absolute top-0 right-0 z-10 bg-gradient-to-l from-sporty-gold to-yellow-600 text-black text-[9px] font-black uppercase py-0.5 px-3 rounded-bl-xl tracking-wider flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" /> VIP
        </div>
      )}

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
            <Calendar className="w-3 h-3" />{slip.date}
          </span>
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.bg}`}>
            {status.icon}{status.label}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">Total Odds</span>
            <span className="text-2xl font-black italic tracking-tight text-white leading-none">
              {slip.totalOdds.toFixed(2)}<span className="text-sporty-red text-base">x</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold block">Matches</span>
            <span className="text-2xl font-black text-white leading-none">{slip.games.length}</span>
          </div>
        </div>
      </div>

      {/* ── Fixed-height games zone ── */}
      <div className="h-[88px] border-b border-white/5 shrink-0 relative">

        {slip.isVip ? (
          /* VIP blurred rows */
          <div className="h-full flex flex-col justify-center gap-1.5 px-4">
            {[0, 1].map(i => (
              <div key={i} className="h-8 rounded-lg bg-white/[0.03] border border-white/5 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center px-3 gap-2 select-none pointer-events-none blur-sm opacity-30">
                  <span className="text-[10px] text-gray-400 font-mono">██████ vs ██████</span>
                  <span className="ml-auto text-[9px] text-sporty-green font-bold">██████</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sporty-gold/5 to-transparent" />
              </div>
            ))}
          </div>

        ) : !gamesVisible ? (
          /* Collapsed — single centred button */
          <button
            onClick={handleToggle}
            className="absolute inset-0 w-full h-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-sporty-green bg-sporty-green/5 hover:bg-sporty-green/10 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Show Games ({slip.games.length})
          </button>

        ) : (
          /* Expanded carousel */
          <div className="h-full flex flex-col">
            {/* Nav bar */}
            <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
              <button onClick={prevGame} disabled={slip.games.length <= 1}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-all active:scale-90">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-gray-500">{activeGame + 1} / {slip.games.length}</span>
                {secondsLeft > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] font-mono text-yellow-400/80">
                    <Timer className="w-2.5 h-2.5" />{fmt(secondsLeft)}
                  </span>
                )}
              </div>

              <button onClick={nextGame} disabled={slip.games.length <= 1}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-all active:scale-90">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current game */}
            <div className="flex-1 px-3 pb-1 flex flex-col justify-center">
              <div className="text-[11px] font-bold text-white leading-tight truncate">
                {game.homeTeam} <span className="text-gray-500 font-normal">vs</span> {game.awayTeam}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-sporty-green font-bold uppercase truncate max-w-[70%]">
                  {game.prediction}
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-300 bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                  {game.odds.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Dot pagination */}
            {slip.games.length > 1 && (
              <div className="flex justify-center gap-1 pb-1.5 shrink-0">
                {slip.games.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setActiveGame(i); }}
                    className={`rounded-full transition-all ${i === activeGame ? 'w-3 h-1.5 bg-sporty-green' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'}`} />
                ))}
              </div>
            )}

            {/* Hide button */}
            <button onClick={handleToggle}
              className="absolute top-1.5 right-1.5 p-0.5 rounded text-gray-600 hover:text-gray-300 transition-colors"
              title="Hide games">
              <EyeOff className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3 mt-auto bg-black/20 shrink-0">
        {slip.isVip ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <Lock className="w-3 h-3 text-sporty-gold animate-pulse" />
              <span>VIP Premium Code Locked</span>
            </div>
            {slip.unlockLink ? (
              <a
                href={slip.unlockLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 text-center bg-gradient-to-r from-sporty-gold to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-sporty-gold/20"
              >
                🔓 Unlock VIP — {slip.price ? (slip.price.toLowerCase().includes('gh') || slip.price.toLowerCase().includes('₵') ? slip.price : `GH₵ ${slip.price}`) : 'GH₵ 50'}
              </a>
            ) : (
              <a
                href={`https://wa.me/233531349993?text=${encodeURIComponent(`Hi, I want to unlock the VIP Slip (${slip.totalOdds.toFixed(2)}x Odds) for ${slip.price ? (slip.price.toLowerCase().includes('gh') || slip.price.toLowerCase().includes('₵') ? slip.price : 'GH₵ ' + slip.price) : 'GH₵ 50'} on ${slip.date}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 text-center bg-gradient-to-r from-sporty-gold to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-sporty-gold/20"
              >
                🔓 Unlock VIP — {slip.price ? (slip.price.toLowerCase().includes('gh') || slip.price.toLowerCase().includes('₵') ? slip.price : `GH₵ ${slip.price}`) : 'GH₵ 50'}
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 hover:bg-white/[0.05] transition-all">
              <span className="font-mono text-sm font-extrabold text-white tracking-wider">
                {isAuthenticated ? slip.bookingCode : '••••••'}
              </span>
              <button onClick={handleCopy}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  copied ? 'bg-sporty-green text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}>
                {copied ? <><Check className="w-3 h-3" /><span>Copied!</span></> : <><Copy className="w-3 h-3" /><span>Copy</span></>}
              </button>
            </div>
            {!isAuthenticated ? (
              <button onClick={(e) => { e.stopPropagation(); onRequireAuth(); }}
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-sporty-red hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-sporty-red/20 group cursor-pointer active:scale-95">
                <span>Stake on SportyBet</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            ) : (
              <a href={slip.stakeLink || 'https://www.sportybet.com/'} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-sporty-red hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-sporty-red/20 group active:scale-95">
                <span>Stake on SportyBet</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
