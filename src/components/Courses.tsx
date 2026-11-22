import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface CoursesProps {
  onOpenClassEnquiry: (className: string) => void;
}

const COURSE_CARDS = [
  {
    id: 'class-9',
    grade: 'Class 9',
    boards: 'BSEB & CBSE',
    subtitle: 'Strong conceptual foundation for board readiness',
    subjects: [
      'Mathematics',
      'Science (Physics, Chemistry, Biology)',
      'Social Science (History, Geography, Civics, Economics)',
      'Sanskrit (for BSEB Students)',
    ],
  },
  {
    id: 'class-10',
    grade: 'Class 10',
    boards: 'BSEB & CBSE',
    subtitle: 'Board-focused preparation, PYQs & weekly tests',
    subjects: [
      'Mathematics',
      'Science (Physics, Chemistry, Biology)',
      'Social Science (History, Geography, Civics, Economics)',
      'Sanskrit (for BSEB Students)',
    ],
  },
];

export const Courses: React.FC<CoursesProps> = ({ onOpenClassEnquiry }) => {
  return (
    <section id="courses" className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs">
            OUR COURSES
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#06183A] tracking-tight font-display">
            What We Teach
          </h2>
          <p className="mt-2 text-sm sm:text-base font-medium text-slate-600">
            Complete Syllabus Coverage for Class 9 &amp; 10 Students
          </p>
        </div>

        {/* Two Side-by-Side Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {COURSE_CARDS.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl border border-slate-200 bg-white shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col justify-between"
            >
              {/* Navy Card Header */}
              <div className="bg-gradient-to-r from-[#06183A] via-[#0B2A60] to-[#0E367A] px-6 py-5 text-white flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-amber-400 font-display leading-none">
                    {course.grade}
                  </h3>
                  <p className="text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase mt-1">
                    {course.boards}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold text-blue-100">
                  Full Syllabus
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-4">
                    {course.subtitle}
                  </p>
                  <ul className="space-y-3">
                    {course.subjects.map((sub) => (
                      <li key={sub} className="flex items-start gap-2.5 text-sm font-bold text-slate-800">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenClassEnquiry(course.grade)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Know More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;
