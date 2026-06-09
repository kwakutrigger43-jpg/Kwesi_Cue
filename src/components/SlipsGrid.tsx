import React, { useState, useEffect } from 'react';
import { Grid, Lock, Unlock, CheckCircle2, Clock, Calendar } from 'lucide-react';
import type { Slip } from '../types';
import { SlipCard } from './SlipCard';

interface SlipsGridProps {
  slips: Slip[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  onRequireAuth: () => void;
}

/** How long (ms) before a won/lost slip is hidden from the main feed */
const HIDE_AFTER_MS = 30 * 60 * 1000; // 30 minutes

/** Returns true if a won/lost slip should still appear in the main "All" feed */
const isRecentlyFinished = (slip: Slip) => {
  if (!slip.statusUpdatedAt) return false;
  return Date.now() - slip.statusUpdatedAt < HIDE_AFTER_MS;
};

export const SlipsGrid: React.FC<SlipsGridProps> = ({
  slips,
  activeTab,
  setActiveTab,
  isAuthenticated,
  onRequireAuth,
}) => {
  // Re-render every 60 s so the 30-min cutoff is checked live without a page refresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const tabs = [
    { id: 'all',     label: 'All Slips',  icon: <Grid className="w-3.5 h-3.5" /> },
    { id: 'free',    label: 'Free Slips', icon: <Unlock className="w-3.5 h-3.5 text-sporty-green" /> },
    { id: 'vip',     label: 'VIP Slips',  icon: <Lock className="w-3.5 h-3.5 text-sporty-gold" /> },
    { id: 'won',     label: 'Won ✅',      icon: <CheckCircle2 className="w-3.5 h-3.5 text-sporty-green" /> },
    { id: 'pending', label: 'Pending',    icon: <Clock className="w-3.5 h-3.5 text-yellow-400" /> },
  ];

  const filteredSlips = slips.filter((slip) => {
    const finished = slip.status === 'won' || slip.status === 'lost';

    switch (activeTab) {
      case 'all':
        // Show active slips + won/lost only if they were updated < 30 min ago
        return !finished || isRecentlyFinished(slip);

      case 'free':
        // Free active slips + recently finished free slips
        return !slip.isVip && (!finished || isRecentlyFinished(slip));

      case 'vip':
        return slip.isVip && (!finished || isRecentlyFinished(slip));

      case 'won':
        // All-time won slips — always visible here regardless of age
        return slip.status === 'won';

      case 'pending':
        return slip.status === 'pending';

      default:
        return true;
    }
  });

  return (
    <section id="slips-section" className="py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] text-sporty-red font-bold uppercase tracking-widest font-mono">
            UPDATED LIVE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic mt-1">
            TODAY'S SLIPS &amp; PREDICTIONS
          </h2>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-sporty-red text-white shadow-lg shadow-sporty-red/20 border border-sporty-red/20'
                  : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slips Grid */}
      {filteredSlips.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredSlips.map((slip) => (
            <SlipCard
              key={slip.id}
              slip={slip}
              showWinIndicators={activeTab === 'won' && slip.status === 'won'}
              isAuthenticated={isAuthenticated}
              onRequireAuth={onRequireAuth}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">
            No Slips Found
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {activeTab === 'won'
              ? "No winning slips yet. Check back after today's matches!"
              : `No slips in the "${tabs.find(t => t.id === activeTab)?.label}" category right now.`}
          </p>
          <button
            onClick={() => setActiveTab('all')}
            className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white font-bold transition-all"
          >
            Show All Slips
          </button>
        </div>
      )}

      {/* Info bar for won tab */}
      {activeTab === 'won' && filteredSlips.length > 0 && (
        <div className="mt-6 flex items-center gap-2 text-[11px] text-gray-500 justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-sporty-green" />
          <span>
            Showing <span className="text-white font-bold">{filteredSlips.length}</span> winning slip{filteredSlips.length !== 1 ? 's' : ''} — all matches confirmed ✅
          </span>
        </div>
      )}
    </section>
  );
};
