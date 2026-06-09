import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SlipsGrid } from './components/SlipsGrid';
import { VipSection } from './components/VipSection';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { InfoModal } from './components/InfoModal';
import type { Slip } from './types';
import type { InfoModalType } from './components/InfoModal';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { AuthModal } from './components/AuthModal';
import { sanitizeUrl } from './lib/security';

// Hardcoded initial high-quality mock data matching realistic betting odds
const MOCK_SLIPS: Slip[] = [
  {
    id: 'slip-1',
    date: 'May 26, 2026',
    totalOdds: 4.56,
    bookingCode: 'BC45HOT',
    status: 'hot',
    isVip: false,
    stakeLink: 'https://www.sportybet.com/',
    games: [
      {
        id: 'g-1-1',
        homeTeam: 'Manchester City',
        awayTeam: 'Liverpool',
        prediction: 'Home Win',
        odds: 1.85,
      },
      {
        id: 'g-1-2',
        homeTeam: 'Barcelona',
        awayTeam: 'Atletico Madrid',
        prediction: 'Over 1.5 Goals',
        odds: 1.30,
      },
      {
        id: 'g-1-3',
        homeTeam: 'Paris Saint-Germain',
        awayTeam: 'Monaco',
        prediction: 'Home Win (1X)',
        odds: 1.90,
      },
    ],
  },
  {
    id: 'slip-2',
    date: 'May 26, 2026',
    totalOdds: 25.47,
    bookingCode: 'BC99VIP',
    status: 'pending',
    isVip: true,
    price: '70',
    stakeLink: 'https://www.sportybet.com/',
    games: [
      {
        id: 'g-2-1',
        homeTeam: 'Valencia',
        awayTeam: 'Villarreal',
        prediction: 'Draw (X)',
        odds: 3.20,
      },
      {
        id: 'g-2-2',
        homeTeam: 'Inter Milan',
        awayTeam: 'Napoli',
        prediction: 'Home Win',
        odds: 1.80,
      },
      {
        id: 'g-2-3',
        homeTeam: 'Lyon',
        awayTeam: 'Marseille',
        prediction: 'Over 2.5 Goals',
        odds: 1.85,
      },
      {
        id: 'g-2-4',
        homeTeam: 'Sporting CP',
        awayTeam: 'Braga',
        prediction: 'Home Win & BTTS',
        odds: 2.39,
      },
    ],
  },
  {
    id: 'slip-3',
    date: 'May 25, 2026',
    totalOdds: 6.88,
    bookingCode: 'BC77WON',
    status: 'won',
    isVip: false,
    stakeLink: 'https://www.sportybet.com/',
    games: [
      {
        id: 'g-3-1',
        homeTeam: 'Real Madrid',
        awayTeam: 'Borussia Dortmund',
        prediction: 'Home Win',
        odds: 1.50,
      },
      {
        id: 'g-3-2',
        homeTeam: 'Chelsea',
        awayTeam: 'Arsenal',
        prediction: 'Over 2.5 Goals',
        odds: 1.70,
      },
      {
        id: 'g-3-3',
        homeTeam: 'Bayern Munich',
        awayTeam: 'RB Leipzig',
        prediction: 'Both Teams to Score',
        odds: 1.60,
      },
      {
        id: 'g-3-4',
        homeTeam: 'Juventus',
        awayTeam: 'AC Milan',
        prediction: 'Double Chance 1X',
        odds: 1.35,
      },
      {
        id: 'g-3-5',
        homeTeam: 'Benfica',
        awayTeam: 'Porto',
        prediction: 'Over 1.5 Goals',
        odds: 1.25,
      },
    ],
  },
];

function App() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; type: InfoModalType | null }>({
    isOpen: false,
    type: null,
  });

  const isAuthenticated = !!userEmail;

  const handleOpenInfo = (type: InfoModalType) => {
    setInfoModal({ isOpen: true, type });
  };

  const handleCloseInfo = () => {
    setInfoModal({ isOpen: false, type: null });
  };

  // 1. Listen to Supabase auth state changes OR load from localStorage
  useEffect(() => {
    if (isSupabaseConfigured) {
      // Check current session
      supabase!.auth.getSession().then(({ data: { session } }) => {
        setUserEmail(session?.user?.email ?? null);
      });

      const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
        setUserEmail(session?.user?.email ?? null);
        // Close admin panel if they log out
        if (!session) {
          setIsAdminOpen(false);
        }
      });

      fetchSlips();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Supabase is not configured yet -> load from localStorage
      const stored = localStorage.getItem('sporty_odds_slips');
      if (stored) {
        try {
          setSlips(JSON.parse(stored));
        } catch (err) {
          console.error('Failed to parse stored slips, loading defaults.', err);
          setSlips(MOCK_SLIPS);
          localStorage.setItem('sporty_odds_slips', JSON.stringify(MOCK_SLIPS));
        }
      } else {
        setSlips(MOCK_SLIPS);
        localStorage.setItem('sporty_odds_slips', JSON.stringify(MOCK_SLIPS));
      }
      // For local fallback testing, bypass authentication check with a simulated owner email
      setUserEmail('francisarhin650@gmail.com');
    }
  }, []);

  // 2. Fetch slips from Supabase
  const fetchSlips = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase!
        .from('slips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Don't surface raw DB errors to the user
        console.warn('Slip fetch failed — falling back to mock data.');
        setSlips(MOCK_SLIPS);
      } else if (data && data.length > 0) {
        setSlips(data);
      } else {
        // Fallback to mock slips if db is empty so page isn't blank
        setSlips(MOCK_SLIPS);
      }
    } catch {
      setSlips(MOCK_SLIPS);
    }
  };

  const handleAddSlip = async (newSlip: Slip) => {
    if (!isSupabaseConfigured) {
      const sanitizedSlip: Slip = {
        ...newSlip,
        unlockLink: newSlip.unlockLink ? sanitizeUrl(newSlip.unlockLink) : undefined,
        stakeLink: newSlip.stakeLink ? sanitizeUrl(newSlip.stakeLink) : undefined,
      };
      const updated = [sanitizedSlip, ...slips];
      setSlips(updated);
      localStorage.setItem('sporty_odds_slips', JSON.stringify(updated));
      return;
    }
    try {
      // Sanitise booking code — only allow alphanumeric characters
      const safeCode = newSlip.bookingCode.replace(/[^A-Z0-9]/g, '').slice(0, 32);
      const { error } = await supabase!
        .from('slips')
        .insert([{
          id: newSlip.id,
          date: newSlip.date,
          totalOdds: Number(newSlip.totalOdds) || 1,
          bookingCode: safeCode,
          status: newSlip.status,
          isVip: !!newSlip.isVip,
          price: newSlip.price ?? null,
          unlockLink: newSlip.unlockLink ? (sanitizeUrl(newSlip.unlockLink) ?? null) : null,
          stakeLink: newSlip.stakeLink ? (sanitizeUrl(newSlip.stakeLink) ?? null) : null,
          statusUpdatedAt: newSlip.statusUpdatedAt,
          games: newSlip.games,
        }]);

      if (error) {
        alert('Failed to save slip. Please try again.');
      } else {
        fetchSlips();
      }
    } catch {
      alert('A network error occurred. Please try again.');
    }
  };

  const handleUpdateSlip = async (updatedSlip: Slip) => {
    if (!isSupabaseConfigured) {
      const sanitizedSlip: Slip = {
        ...updatedSlip,
        unlockLink: updatedSlip.unlockLink ? sanitizeUrl(updatedSlip.unlockLink) : undefined,
        stakeLink: updatedSlip.stakeLink ? sanitizeUrl(updatedSlip.stakeLink) : undefined,
      };
      const updated = slips.map((s) => (s.id === sanitizedSlip.id ? sanitizedSlip : s));
      setSlips(updated);
      localStorage.setItem('sporty_odds_slips', JSON.stringify(updated));
      return;
    }
    try {
      const safeCode = updatedSlip.bookingCode.replace(/[^A-Z0-9]/g, '').slice(0, 32);
      const { error } = await supabase!
        .from('slips')
        .update({
          date: updatedSlip.date,
          totalOdds: Number(updatedSlip.totalOdds) || 1,
          bookingCode: safeCode,
          status: updatedSlip.status,
          isVip: !!updatedSlip.isVip,
          price: updatedSlip.price ?? null,
          unlockLink: updatedSlip.unlockLink ? (sanitizeUrl(updatedSlip.unlockLink) ?? null) : null,
          stakeLink: updatedSlip.stakeLink ? (sanitizeUrl(updatedSlip.stakeLink) ?? null) : null,
          statusUpdatedAt: updatedSlip.statusUpdatedAt,
          games: updatedSlip.games,
        })
        .eq('id', updatedSlip.id);

      if (error) {
        alert('Failed to update slip. Please try again.');
      } else {
        fetchSlips();
      }
    } catch {
      alert('A network error occurred. Please try again.');
    }
  };

  const handleDeleteSlip = async (id: string) => {
    if (!isSupabaseConfigured) {
      const updated = slips.filter((s) => s.id !== id);
      setSlips(updated);
      localStorage.setItem('sporty_odds_slips', JSON.stringify(updated));
      return;
    }
    try {
      const { error } = await supabase!
        .from('slips')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Failed to delete slip. Please try again.');
      } else {
        fetchSlips();
      }
    } catch {
      alert('A network error occurred. Please try again.');
    }
  };

  const handleResetMockData = async () => {
    if (!confirm('Are you sure you want to clear all database slips and reload default mock slips?')) {
      return;
    }
    if (!isSupabaseConfigured) {
      setSlips(MOCK_SLIPS);
      localStorage.setItem('sporty_odds_slips', JSON.stringify(MOCK_SLIPS));
      return;
    }
    try {
      // First try to delete existing ones
      await supabase!
        .from('slips')
        .delete()
        .neq('id', '');

      // Insert mock data
      const { error: insertError } = await supabase!
        .from('slips')
        .insert(MOCK_SLIPS);

      if (insertError) {
        alert('Reset failed. Please try again.');
      } else {
        fetchSlips();
      }
    } catch {
      alert('A network error occurred during reset.');
    }
  };

  const handleLogout = async () => {
    if (!isSupabaseConfigured) {
      setUserEmail(null);
      setIsAdminOpen(false);
      return;
    }
    try {
      await supabase!.auth.signOut();
    } catch {
      // Sign out errors are non-critical — clear local state anyway
      setUserEmail(null);
      setIsAdminOpen(false);
    }
  };

  const handleScrollToSlips = () => {
    const el = document.getElementById('slips-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <div className="min-h-screen bg-sporty-dark text-gray-100 flex flex-col selection:bg-sporty-red selection:text-white">
      {/* Global header bar */}
      <Header
        onToggleAdmin={() => setIsAdminOpen(!isAdminOpen)}
        isAdminOpen={isAdminOpen}
        userEmail={userEmail}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Warning banner if Supabase is not configured */}
      {!isSupabaseConfigured && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2.5 text-center text-xs text-yellow-400 font-semibold flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
          <span>Supabase is not configured. Displaying local mock slips (localStorage fallback mode).</span>
        </div>
      )}

      {/* Main hero page display */}
      <main className="flex-grow">
        <Hero
          onScrollToSlips={handleScrollToSlips}
          activeSlipsCount={slips.filter((s) => !s.isVip).length}
        />

        {/* Slips catalog grid */}
        <SlipsGrid
          slips={slips}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAuthenticated={isAuthenticated}
          onRequireAuth={() => {
            setAuthMode('signup');
            setIsAuthOpen(true);
          }}
        />

        {/* Premium VIP locked banner section */}
        <VipSection />
      </main>

      {/* Admin Panel sidebar drawer */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        slips={slips}
        onAddSlip={handleAddSlip}
        onUpdateSlip={handleUpdateSlip}
        onDeleteSlip={handleDeleteSlip}
        onResetMockData={handleResetMockData}
      />

      {/* Global footer with copyright, responsible gaming and socials */}
      <Footer onOpenInfo={handleOpenInfo} />

      {/* Info / Legal Modal */}
      <InfoModal
        isOpen={infoModal.isOpen}
        type={infoModal.type}
        onClose={handleCloseInfo}
      />

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}

export default App;
