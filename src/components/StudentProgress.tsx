import React from 'react';
import { PROGRESS_CARDS } from '../data/coachingData';
import { LineChart, Calendar, CheckSquare, TrendingUp, AlertCircle } from 'lucide-react';

export const StudentProgress: React.FC = () => {
  const getIcon = (title: string) => {
    switch (title) {
      case 'Weekly Tests':
        return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'Subject-wise Performance':
        return <LineChart className="w-5 h-5 text-blue-500" />;
      case 'Practice Progress':
        return <CheckSquare className="w-5 h-5 text-emerald-500" />;
      case 'Improvement Tracking':
      default:
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <section id="progress" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Academic Monitoring System</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Track. Practice. Improve.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Transparent, continuous progress monitoring helping students and parents stay informed about real conceptual growth.
          </p>
        </div>

        {/* Notice of Ethical Standards / Transparent Placeholder */}
        <div className="max-w-4xl mx-auto mb-10 p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900">
            <span className="font-bold">Transparent Evaluation Notice:</span> Genius Coaching Centre believes in honest education. We do not display fabricated rank lists or fake toppers. Below is our systematic tracking framework implemented for every enrolled student.
          </div>
        </div>

        {/* Four Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {PROGRESS_CARDS.map((card, idx) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    {getIcon(card.title)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    Module 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display mb-1">
                  {card.title}
                </h3>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">
                  {card.label}
                </p>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {card.description}
                </p>
              </div>

              {/* Framework Specs */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Method</span>
                  <span className="font-semibold text-slate-700">{card.metricType}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cadence</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {card.frequency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Parent Communication Feature */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Regular Parent-Teacher Interaction
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Parents can contact the coaching centre to review test notebooks, attendance, and subject-wise progress updates anytime.
            </p>
          </div>
          <a
            href="tel:8102072380"
            className="shrink-0 px-4 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Call for Student Report
          </a>
        </div>

      </div>
    </section>
  );
};
export default StudentProgress;
