import React from 'react';
import { ArrowRight, CheckCircle2, Smartphone, FileText } from 'lucide-react';

const GCC_TEST_RANK_URL =
  'https://www.androidhit.de/en/app/gcc-test-rank-com-geniuscoaching-gccquiz';

export const TestRankAppSection: React.FC = () => {
  const scrollToStudyMaterial = () => {
    const el = document.querySelector('#study-material');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="gcc-app" className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Card: GCC Test Rank App */}
          <div className="rounded-3xl bg-gradient-to-br from-[#06183A] via-[#0B2A60] to-[#081E47] text-white p-6 sm:p-8 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-block px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider">
                  GCC TEST RANK APP
                </span>
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-6 h-6" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white font-display leading-tight">
                Your Digital Test Practice Platform
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 mb-5">
                Practice chapter-wise objective tests and track your exam readiness on our dedicated Android app.
              </p>

              <ul className="space-y-2.5 mb-6">
                {['Online MCQs', 'Test & Rankings', 'Exam Preparation'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10">
              <a
                href={GCC_TEST_RANK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all active:scale-95"
              >
                <span>Explore App</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Card: Free Study Resources Shortcut */}
          <div className="rounded-3xl bg-gradient-to-br from-[#0A2558] via-[#0E367A] to-[#06183A] text-white p-6 sm:p-8 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-block px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider">
                  FREE STUDY RESOURCES
                </span>
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white font-display leading-tight">
                Download Free Study Material
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 mb-5">
                Access published PDF notes, formula sheets, and sample papers directly below — no login required.
              </p>

              <ul className="space-y-2.5 mb-6">
                {['Sample Papers', 'Important Questions', 'Board Notes'].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10">
              <button
                type="button"
                onClick={scrollToStudyMaterial}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Download Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestRankAppSection;
