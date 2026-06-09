import React from 'react';
import { X, Shield, FileText, AlertOctagon } from 'lucide-react';

export type InfoModalType = 'privacy' | 'terms' | 'disclaimer';

interface InfoModalProps {
  isOpen: boolean;
  type: InfoModalType | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield className="w-6 h-6 text-sporty-green" />,
          sections: [
            {
              heading: '1. User Accounts & Registration Data',
              body: 'When you create an account, we securely collect and store your email address using Supabase Auth. This data is strictly used to manage your login session, authorize access to booking codes/VIP content, and verify administrative permissions.'
            },
            {
              heading: '2. Database & Browser Storage',
              body: 'We utilize browser storage (cookies and localStorage) to persist your active login session so you do not need to sign in repeatedly. Betting slips and predictions are loaded from a secure Postgres database hosted on Supabase.'
            },
            {
              heading: '3. Payment Processing Security',
              body: 'All premium VIP transactions are processed directly and securely by Paystack. Kwesi Cue ODDS does not collect, store, or transmit your card numbers, bank credentials, or mobile money details.'
            },
            {
              heading: '4. Third-Party Links',
              body: 'Our platform contains links to SportyBet and Telegram. We are not responsible for the privacy practices, tracking, or contents of these third-party platforms.'
            }
          ]
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText className="w-6 h-6 text-sporty-red" />,
          sections: [
            {
              heading: '1. Age Requirements & Accounts',
              body: 'You must be at least 18 years of age to use our site. By creating an account, you represent that you meet this age requirement. You are responsible for keeping your login credentials confidential and secure.'
            },
            {
              heading: '2. Educational Purpose Only',
              body: 'All betting slips, accumulators, odds, and predictions shared on Kwesi Cue ODDS are provided strictly for educational, informational, and analytical purposes. None of the content constitutes professional financial advice.'
            },
            {
              heading: '3. Stake Responsibility',
              body: 'Users are fully responsible for any stakes they choose to wager on SportyBet. We do not place bets on your behalf, and we do not guarantee specific winning outcomes. Bet only what you can afford to lose.'
            },
            {
              heading: '4. Intellectual Property & Sharing Restrictions',
              body: 'All prediction analyses, branding details, and compiled interfaces are owned by Kwesi Cue ODDS. Account sharing or unauthorized redissemination of premium VIP codes is strictly prohibited.'
            }
          ]
        };
      case 'disclaimer':
      default:
        return {
          title: 'Legal Disclaimer',
          icon: <AlertOctagon className="w-6 h-6 text-sporty-gold" />,
          sections: [
            {
              heading: '1. Inherent Risk of Sports Betting',
              body: 'Sports betting involves a high level of risk and matches can be unpredictable. Statistics and historical win rates (such as our 92.4% rate) represent analytical metrics from past events and are not a guarantee of future wins.'
            },
            {
              heading: '2. Limitation of Liability',
              body: 'Kwesi Cue ODDS, the site owner (Kwesi Cue), and its analysts shall not be held liable for any financial losses, damages, or emotional distress resulting from placing wagers based on the predictions or booking codes shared here.'
            },
            {
              heading: '3. Bookmaker Affiliation',
              body: 'We are an independent sports prediction and accumulator sharing channel. While we provide direct booking codes and links for SportyBet to simplify the staking process, we are not directly affiliated with, sponsored by, or endorsed by SportyBet Group.'
            },
            {
              heading: '4. Responsible Gaming Support',
              body: 'If you feel your gambling habits are becoming problematic, please seek immediate assistance from local responsible gaming organizations and establish limits on your betting accounts.'
            }
          ]
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950">
          <div className="flex items-center space-x-3">
            {content.icon}
            <h3 className="text-lg font-black text-white uppercase tracking-wider italic">
              {content.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {content.sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {section.heading}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-white/5 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all active:scale-95"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
