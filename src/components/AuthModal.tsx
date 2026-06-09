import React, { useState } from 'react';
import { X, Lock, Mail, AlertTriangle, Loader2, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Basic password validation for sign up
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (mode === 'signup' && !/\d/.test(password)) {
      setError('Password must include at least one number.');
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      // Offline fallback simulator
      setTimeout(() => {
        setLoading(false);
        if (mode === 'signup') {
          setSuccessMsg("Account created! (Simulator Mode)");
          setTimeout(() => {
            setMode('signin');
            setSuccessMsg(null);
          }, 1500);
        } else {
          onClose();
        }
      }, 800);
      return;
    }

    try {
      if (mode === 'signin') {
        const { error: authError } = await supabase!.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (authError) {
          // Never expose raw Supabase error codes to the user
          setError('Invalid email or password. Please try again.');
        } else {
          onClose();
        }
      } else {
        const { data, error: authError } = await supabase!.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });

        if (authError) {
          // Map common Supabase auth errors to user-friendly messages
          if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else if (authError.message.includes('rate limit') || authError.message.includes('too many')) {
            setError('Too many attempts. Please wait a moment before trying again.');
          } else {
            setError('Registration failed. Please try again.');
          }
        } else if (data.user && data.session === null) {
          // If email confirmation is enabled on Supabase
          setSuccessMsg("Registration successful! Please check your email inbox to verify your account.");
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        } else {
          // Email confirmation is disabled, logged in automatically
          setSuccessMsg("Account created successfully!");
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
    setSuccessMsg(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      {/* Modal Card */}
      <div 
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-sporty-charcoal shadow-2xl animate-in fade-in zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sporty-red/10 border border-sporty-red/20 text-sporty-red">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider leading-none">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">
                {mode === 'signin' ? 'Sign in to access winning codes' : 'Join Kwesi Cue VIP platform'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isSupabaseConfigured && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Offline Fallback Mode:</strong> Supabase variables are missing. Enter any credentials to proceed.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sporty-red/10 border border-sporty-red/25 text-red-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sporty-green/10 border border-sporty-green/25 text-sporty-green text-xs">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-sporty-red focus:ring-1 focus:ring-sporty-red transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-sporty-red focus:ring-1 focus:ring-sporty-red transition-all"
              />
            </div>
          </div>

          {/* Confirm Password (only for Sign-Up) */}
          {mode === 'signup' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-sporty-red focus:ring-1 focus:ring-sporty-red transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-sporty-red hover:bg-red-700 disabled:bg-sporty-red/50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-sporty-red/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Unlock Platform</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </>
            )}
          </button>

          {/* Mode Switch Footer */}
          <div className="text-center pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              {mode === 'signin' ? (
                <>
                  New to Kwesi Cue? <span className="text-sporty-green">Register here</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="text-sporty-green">Sign in here</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper SVG Check component
const Check: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2.5} 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
