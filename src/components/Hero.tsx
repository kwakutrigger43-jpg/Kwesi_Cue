import React from 'react';
import { Send, Award, Flame, TrendingUp } from 'lucide-react';

interface HeroProps {
  onScrollToSlips: () => void;
  activeSlipsCount: number;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToSlips, activeSlipsCount }) => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 md:px-8 bg-grid-pattern border-b border-white/5">
      {/* Background Gradient Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sporty-red/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sporty-green/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 mb-6 backdrop-blur-md animate-bounce">
          <Flame className="w-4 h-4 text-sporty-red fill-sporty-red" />
          <span>TODAY'S ODDS ARE NOW LIVE!</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase italic leading-none mb-6">
          Get Today's Winning <br />
          <span className="bg-gradient-to-r from-sporty-red via-orange-500 to-sporty-green bg-clip-text text-transparent">
            SportyBet Booking Codes
          </span> <br />
          &amp; Predictions
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-lg md:text-xl font-normal leading-relaxed mb-8">
          Stop guessing and start winning. We publish professionally analyzed banker slips, daily single bets, and high-odds sporty codes absolutely free. Join our winning streak today!
        </p>

        {/* Dual CTA Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mb-14">
          <a
            href="https://t.me/+sKQMZfnJmfRiN2Q0"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-6 py-3.5 bg-[#0088cc] hover:bg-[#0077b3] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/10 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
          >
            <Send className="w-4 h-4 fill-white" />
            <span>TELEGRAM CHANNEL</span>
          </a>

          <a
            href="https://chat.whatsapp.com/E40y1mm1dGWFKM15Fq75oB?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-green-500/10 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 animate-pulse-glow"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202 0 6.208 1.246 8.47 3.512 2.262 2.266 3.507 5.275 3.507 8.487 0 6.643-5.337 11.981-11.944 11.981-2.007 0-3.974-.503-5.714-1.464L0 24zm6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c5.449 0 9.885-4.437 9.888-9.886 0-2.64-1.026-5.123-2.887-6.988a9.825 9.825 0 00-6.988-2.893c-5.45 0-9.885 4.437-9.889 9.885-.002 2.096.547 4.142 1.588 5.945L1.896 20.06l4.496-1.18c1.747.954 3.712 1.458 5.705 1.458z" />
            </svg>
            <span>WHATSAPP COMMUNITY</span>
          </a>

          <button
            onClick={onScrollToSlips}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 active:scale-95"
          >
            <TrendingUp className="w-4 h-4 text-sporty-green" />
            <span>VIEW FREE SLIPS ({activeSlipsCount})</span>
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white italic">92.4%</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold flex items-center justify-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-sporty-green" /> Win Rate
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 text-center">
            <div className="text-2xl sm:text-3xl font-black text-sporty-green italic">1500</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold flex items-center justify-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sporty-green" /> Max Odds Won
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white italic">10K+</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold flex items-center justify-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-sporty-red" /> Active Stakers
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300 text-center">
            <div className="text-2xl sm:text-3xl font-black text-sporty-red italic">24/7</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold flex items-center justify-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-sporty-red" /> Analyst Support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
