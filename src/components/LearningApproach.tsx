import React from 'react';
import { LEARNING_STEPS } from '../data/coachingData';
import { ArrowRight, Compass } from 'lucide-react';

export const LearningApproach: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-amber-500 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-400/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-400/20">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Structured Methodology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Our Learning Approach
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-300">
            A proven four-step pedagogical cycle ensuring students master fundamentals, practice diligently, and excel in board examinations.
          </p>
        </div>

        {/* Four-Step Process (Timeline / Connected Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {LEARNING_STEPS.map((stepItem, index) => {
            return (
              <div
                key={stepItem.step}
                className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-amber-400/50 transition-all duration-300 group hover:-translate-y-1"
              >
                <div>
                  {/* Step Index & Connected Arrow */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-extrabold text-amber-400 font-display">
                      {stepItem.step}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
                      Step {index + 1}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white tracking-tight font-display mb-1">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs font-semibold text-amber-300/90 uppercase tracking-wider mb-3">
                    {stepItem.subtitle}
                  </p>

                  <p className="text-base font-semibold text-slate-100 mb-3">
                    “{stepItem.description}”
                  </p>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {stepItem.focus}
                  </p>
                </div>

                {/* Connecting arrow visual on desktop */}
                {index < 3 && (
                  <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-amber-400 text-slate-950 items-center justify-center shadow-md">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Genius Coaching Cycle</span>
                  <span className="font-semibold text-amber-400">Class 9 & 10</span>
                </div>
              </div>
            );
          })}

        </div>

        {/* Process Guarantee Note */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-slate-800/90 px-6 py-3 rounded-xl border border-slate-700 text-xs sm:text-sm text-slate-300">
            <span className="font-bold text-amber-400">Concept-First Guarantee:</span> No memorization without understanding. Each chapter is completed through all 4 steps.
          </div>
        </div>

      </div>
    </section>
  );
};
export default LearningApproach;
