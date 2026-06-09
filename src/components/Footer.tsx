import React from 'react';
import { Send, Shield, Heart } from 'lucide-react';
import type { InfoModalType } from './InfoModal';

interface FooterProps {
  onOpenInfo: (type: InfoModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInfo }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-white/5 py-12 px-4 sm:px-6 md:px-8 text-center sm:text-left">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sporty-red flex items-center justify-center font-black text-white italic text-base">
              KC
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white italic">
              KWESI CUE <span className="text-sporty-red">ODDS</span> <span className="text-xs text-sporty-gold font-sans font-black tracking-widest ml-1 bg-sporty-gold/10 px-2 py-0.5 rounded border border-sporty-gold/20 uppercase">VIP</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 max-w-sm mx-auto sm:mx-0 leading-relaxed">
            Kwesi Cue Odds VIP is the ultimate dashboard for betting slips, booking codes, and expert football prediction sharing. We analyze, you stake, we win!
          </p>
        </div>

        {/* Responsible Gaming Column */}
        <div className="md:col-span-4 flex flex-col items-center sm:items-start space-y-3">
          <div className="flex items-center space-x-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>18+ RESPONSIBLE GAMBLING</span>
          </div>
          <p className="text-[11px] text-gray-500 max-w-xs leading-normal">
            Sports betting involves risk. We provide mathematical analyses, but winning is never guaranteed. Please gamble responsibly.
          </p>
        </div>

        {/* Community & Links Column */}
        <div className="md:col-span-3 flex flex-col items-center sm:items-end justify-center h-full space-y-4">
          <div className="flex items-center space-x-3">
            <a
              href="https://t.me/+sKQMZfnJmfRiN2Q0"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 rounded-xl text-[#0088cc] hover:text-white transition-all"
              title="Telegram Channel"
            >
              <Send className="w-4 h-4 fill-current" />
            </a>
            <a
              href="https://chat.whatsapp.com/E40y1mm1dGWFKM15Fq75oB?mode=gi_t"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-xl text-[#25D366] hover:text-white transition-all"
              title="WhatsApp Community"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202 0 6.208 1.246 8.47 3.512 2.262 2.266 3.507 5.275 3.507 8.487 0 6.643-5.337 11.981-11.944 11.981-2.007 0-3.974-.503-5.714-1.464L0 24zm6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c5.449 0 9.885-4.437 9.888-9.886 0-2.64-1.026-5.123-2.887-6.988a9.825 9.825 0 00-6.988-2.893c-5.45 0-9.885 4.437-9.889 9.885-.002 2.096.547 4.142 1.588 5.945L1.896 20.06l4.496-1.18c1.747.954 3.712 1.458 5.705 1.458z" />
              </svg>
            </a>
            <a
              href="https://x.com/your_handle"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5"
              title="Twitter / X"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
          
          <div className="text-[10px] text-gray-500 font-mono">
            Developed with <Heart className="w-3 h-3 inline text-sporty-red fill-sporty-red" /> for stakers
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-4">
        <div>
          &copy; {currentYear} Kwesi Cue Odds VIP. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <button onClick={() => onOpenInfo('privacy')} className="hover:text-gray-400 transition-colors cursor-pointer">Privacy Policy</button>
          <button onClick={() => onOpenInfo('terms')} className="hover:text-gray-400 transition-colors cursor-pointer">Terms of Service</button>
          <button onClick={() => onOpenInfo('disclaimer')} className="hover:text-gray-400 transition-colors cursor-pointer">Disclaimer</button>
        </div>
      </div>
    </footer>
  );
};
