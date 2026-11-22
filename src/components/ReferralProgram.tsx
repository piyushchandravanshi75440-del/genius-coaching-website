import React from 'react';
import { REFERRAL_TIERS, BRAND_INFO } from '../data/coachingData';
import { Users, Gift, MessageCircle, Info } from 'lucide-react';

export const ReferralProgram: React.FC = () => {
  const getWhatsAppReferralUrl = () => {
    return `${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(
      'Hello Genius Coaching Centre, I want to ask about the Student Referral Program and rewards.'
    )}`;
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-400/15 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-400/30">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Student Referral Challenge</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Bring Your Friend. Learn Together.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-300">
            Refer a friend to Genius Coaching and participate in the Student Referral Challenge.
          </p>
        </div>

        {/* Reward Structure Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {REFERRAL_TIERS.map((tier, idx) => {
            const isHighest = tier.friends === 5;
            return (
              <div
                key={tier.friends}
                className={`rounded-2xl p-6 sm:p-7 border flex flex-col justify-between transition-all duration-200 relative ${
                  isHighest
                    ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border-amber-400/60 shadow-xl shadow-amber-950/20'
                    : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {isHighest && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Top Tier
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-amber-400 font-display">
                      0{tier.friends}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-700/60 flex items-center justify-center text-amber-400">
                      <Gift className="w-4 h-4" />
                    </div>
                  </div>

                  <span className="inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
                    {tier.badge}
                  </span>

                  <h3 className="text-lg font-bold text-white font-display leading-snug mb-2">
                    {tier.reward}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {tier.detail}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Level {idx + 1}</span>
                  <span className="text-amber-400 font-semibold">GCC Scholar</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer / Condition Note strictly as requested */}
        <div className="mt-10 max-w-2xl mx-auto text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Rewards are subject to successful admission and coaching rules.</span>
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <a
            href={getWhatsAppReferralUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950" />
            <span>Ask About Referral Program</span>
          </a>
        </div>

      </div>
    </section>
  );
};
export default ReferralProgram;
