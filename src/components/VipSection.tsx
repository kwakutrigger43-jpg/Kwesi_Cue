import React from 'react';
import { Crown, CheckCircle2, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export const VipSection: React.FC = () => {
  const vipFeatures = [
    "2 - 5 Daily Premium Banker Slips",
    "High Probability Accumulators (10x - 50x Odds)",
    "Exclusive Telegram Chat Group & Support",
    "Early Bird Booking Codes (12 hours before kickoff)",
    "Rollover betting strategies & advice",
    "Refund guarantee if first banker loses"
  ];

  return (
    <section id="vip-section" className="py-16 sm:py-24 px-4 sm:px-6 md:px-8 bg-black/40 relative overflow-hidden border-t border-b border-white/5">
      {/* Decorative Golden Blur */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-sporty-gold/5 rounded-full blur-3xl -z-10" />
      <div className="absolute right-10 bottom-10 w-96 h-96 bg-sporty-red/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sporty-gold/10 border border-sporty-gold/20 text-xs font-black text-sporty-gold uppercase tracking-wider mb-4 font-mono">
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>VIP ELITE CLUB</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase italic tracking-tight">
            UNLOCK THE LOCKS. <br />
            <span className="bg-gradient-to-r from-sporty-gold to-yellow-500 bg-clip-text text-transparent">
              MULTIPLY YOUR STAKES.
            </span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mt-4">
            Join thousands of successful stakers receiving verified, high-probability banker slips curated by our expert team of sports analysts.
          </p>
        </div>

        {/* Comparison + Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Comparison Table */}
          <div className="lg:col-span-7 rounded-3xl bg-zinc-950/60 border border-white/5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sporty-green" />
                Why Upgrade to VIP?
              </h3>
              
              <div className="space-y-4">
                {vipFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-sporty-green shrink-0 mt-0.5" />
                    <span className="text-gray-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-xs text-gray-500 font-mono">
              * VIP stats are tracked and audited. We average an 89.2% monthly success rate.
            </div>
          </div>

          {/* Pricing Card */}
          <div className="lg:col-span-5 rounded-3xl glassmorphism-premium relative overflow-hidden p-8 sm:p-10 flex flex-col justify-between border-2 border-sporty-gold">
            {/* Top Shine Effect */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-sporty-gold/10 rounded-full blur-xl pointer-events-none" />

            <div>
              {/* Popular Tag */}
              <div className="absolute top-4 right-4 bg-sporty-gold text-black text-[9px] font-black uppercase py-1 px-3 rounded-full tracking-wider">
                MOST POPULAR
              </div>

              <span className="text-xs font-bold text-sporty-gold uppercase tracking-widest block font-mono">
                3-DAY ACCESS PASS
              </span>
              <h3 className="text-2xl font-black text-white uppercase italic mt-1 mb-4">
                VIP ELITE PASS
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black tracking-tight text-white font-mono">GH₵ 50</span>
                <span className="text-gray-400 text-sm font-semibold">/ 3 days</span>
              </div>
              
              {/* Alternative Currency (for global users) */}
              <div className="text-xs text-gray-400 font-medium -mt-4 mb-6 border-b border-white/5 pb-4">
                Secure checkout processed via <span className="font-bold text-white">Paystack Ghana</span>
              </div>

              {/* Quick Details */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-2 text-xs text-gray-300">
                  <Zap className="w-4 h-4 text-sporty-gold fill-sporty-gold" />
                  <span>Instant access via secure Paystack channel</span>
                </li>
                <li className="flex items-center space-x-2 text-xs text-gray-300">
                  <Zap className="w-4 h-4 text-sporty-gold fill-sporty-gold" />
                  <span>After payment, you'll be redirected to WhatsApp for instant code delivery</span>
                </li>
                <li className="flex items-center space-x-2 text-xs text-gray-300">
                  <Zap className="w-4 h-4 text-sporty-gold fill-sporty-gold" />
                  <span>Valid for 3 days — renew anytime</span>
                </li>
              </ul>
            </div>

            {/* Pay buttons */}
            <div className="space-y-3">
              <a
                href={`https://paystack.com/pay/kwesicue-vip?callback_url=${encodeURIComponent('https://wa.me/233531349993?text=' + encodeURIComponent('Hi, I just paid for the VIP Elite 3-Day Pass on Kwesi Cue Odds. Please activate my access.'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-sporty-gold to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-sporty-gold/20"
              >
                <span>Unlock VIP — GH₵50 / 3 Days</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[10px] text-center text-gray-500">
                Powered by Paystack · Secured &amp; Encrypted · WhatsApp delivery after payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
