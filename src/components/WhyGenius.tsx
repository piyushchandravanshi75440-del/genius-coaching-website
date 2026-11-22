import React from 'react';
import { CheckCircle2, Trophy, Users, Monitor, Star } from 'lucide-react';

const REASONS = [
  'Regular Practice',
  'Doubt Solving',
  'Board-Focused Preparation',
  'Personal Attention',
  'Smart Classroom',
  'Consistent Performance',
];

const HIGHLIGHTS = [
  { icon: Trophy, label: 'Proven Results' },
  { icon: Users, label: 'Expert Faculty' },
  { icon: Monitor, label: 'Digital Classroom' },
  { icon: Star, label: 'Student Growth' },
];

export const WhyGenius: React.FC = () => {
  return (
    <section
      id="why-genius"
      className="py-14 sm:py-20 bg-gradient-to-br from-[#06183A] via-[#09224F] to-[#06183A] text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Checklist */}
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-block px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-xs">
              WHY CHOOSE GCC
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
              Why Genius Coaching?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {REASONS.map((reason) => (
                <div key={reason} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-sm sm:text-base font-bold text-blue-50">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 4 Highlight Cards */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/8 border border-blue-400/20 p-5 text-center flex flex-col items-center justify-center gap-3 hover:bg-white/12 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-white leading-snug">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyGenius;
