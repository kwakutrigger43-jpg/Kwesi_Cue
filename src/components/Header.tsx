import React from 'react';
import { Send, Shield, LogOut, LogIn, User } from 'lucide-react';

interface HeaderProps {
  onToggleAdmin: () => void;
  isAdminOpen: boolean;
  userEmail: string | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleAdmin,
  isAdminOpen,
  userEmail,
  onOpenAuth,
  onLogout,
}) => {
  const isAuthenticated = !!userEmail;
  // Always compare trimmed lowercase to prevent case-variation bypass
  const isAdmin = (userEmail?.trim().toLowerCase() ?? '') === 'francisarhin650@gmail.com';

  // Get a short display email
  const displayEmail = userEmail ? userEmail.split('@')[0] : '';

  return (
    <header className="sticky top-0 z-40 w-full glassmorphism border-b border-white/5 py-4 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sporty-red to-orange-600 flex items-center justify-center font-bold text-xl text-white italic tracking-wider shadow-lg shadow-sporty-red/20 border border-white/10">
            KC
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white italic">
              KWESI CUE <span className="text-sporty-red">ODDS</span>
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-sporty-green font-bold -mt-1 font-mono">
              VIP sharing hub
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Admin Toggle Button (Only visible if the logged in user is the owner) */}
          {isAdmin && (
            <button
              onClick={onToggleAdmin}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-300 ${
                isAdminOpen
                  ? 'bg-sporty-red border-sporty-red text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Admin Panel"
            >
              <Shield className="w-3.5 h-3.5 text-sporty-green fill-sporty-green/20" />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
          )}

          {/* User Profile / Sign In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-xl">
              <User className="w-3.5 h-3.5 text-sporty-green" />
              <span className="text-xs font-bold text-gray-300 max-w-[80px] sm:max-w-[120px] truncate">
                {displayEmail}
              </span>
              <button
                onClick={onLogout}
                className="ml-1 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                title="Log Out"
              >
                <LogOut className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('signin')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all duration-300"
              title="Sign In / Register"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Glowing Telegram Button */}
          {/* Glowing Telegram Button */}
          <a
            href="https://t.me/+sKQMZfnJmfRiN2Q0"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center space-x-1.5 px-3 py-2 bg-sporty-green hover:bg-sporty-green-dark text-black font-bold text-xs rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 animate-pulse-glow"
          >
            <Send className="w-3.5 h-3.5 fill-black" />
            <span className="hidden xs:inline">TELEGRAM</span>
            {/* Pulsing Dot */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          </a>

          {/* WhatsApp Button */}
          <a
            href="https://chat.whatsapp.com/E40y1mm1dGWFKM15Fq75oB?mode=gi_t"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
            title="Join WhatsApp Community"
          >
            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202 0 6.208 1.246 8.47 3.512 2.262 2.266 3.507 5.275 3.507 8.487 0 6.643-5.337 11.981-11.944 11.981-2.007 0-3.974-.503-5.714-1.464L0 24zm6.335-1.662c1.746.953 3.71 1.455 5.703 1.456h.004c5.449 0 9.885-4.437 9.888-9.886 0-2.64-1.026-5.123-2.887-6.988a9.825 9.825 0 00-6.988-2.893c-5.45 0-9.885 4.437-9.889 9.885-.002 2.096.547 4.142 1.588 5.945L1.896 20.06l4.496-1.18c1.747.954 3.712 1.458 5.705 1.458z" />
            </svg>
            <span className="hidden xs:inline">WHATSAPP</span>
          </a>
        </div>
      </div>
    </header>
  );
};
