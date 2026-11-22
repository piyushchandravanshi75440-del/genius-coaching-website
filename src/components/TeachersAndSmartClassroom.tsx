import React from 'react';
import { ArrowRight, Monitor } from 'lucide-react';

const PRINCE_SIR_PHOTO =
  '/assets/aistudio/file_00000000cf3882119547c5b8f54511ac_93b50ac2.png';
const SMART_CLASSROOM_WIDE =
  '/assets/aistudio/file_000000003d988211ae397c998fb5c86e_980fd299.png';

export const TeachersAndSmartClassroom: React.FC = () => {
  const scrollToGallery = () => {
    const el = document.querySelector('#gallery');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* 5. OUR TEACHERS */}
          <div
            id="teachers"
            className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <span className="inline-block px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider mb-3">
                OUR TEACHERS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#06183A] font-display tracking-tight">
                Meet Our Teachers
              </h2>
              <p className="text-sm font-medium text-slate-600 mt-1 mb-6">
                Learn from the best, achieve the best.
              </p>

              <div className="max-w-xs mx-auto">
                {/* Prince Sir – Maths & Science */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#06183A]/15 shadow-sm mb-3 bg-white">
                    <img
                      src={PRINCE_SIR_PHOTO}
                      alt="Prince Sir - Maths & Science Teacher at Genius Coaching Centre"
                      className="w-full h-full object-cover object-right-top"
                    />
                  </div>
                  <h3 className="text-base font-black text-[#06183A] font-display">Prince Sir</h3>
                  <p className="text-xs font-extrabold text-blue-700 mt-0.5">Maths &amp; Science</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">
                    Class 9 &amp; 10 (BSEB &amp; CBSE)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#06183A] hover:bg-[#0B2A60] text-white font-extrabold text-xs transition-colors"
              >
                <span>Meet Faculty at Institute</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>
          </div>

          {/* 6. DIGITAL SMART CLASSROOM */}
          <div
            id="smart-classroom"
            className="lg:col-span-7 bg-gradient-to-br from-[#06183A] via-[#0A2558] to-[#071C44] rounded-3xl shadow-lg overflow-hidden text-white flex flex-col sm:flex-row"
          >
            <div className="p-6 sm:p-8 sm:w-[46%] flex flex-col justify-between space-y-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider mb-3">
                  <Monitor className="w-3.5 h-3.5" />
                  <span>DIGITAL SMART CLASSROOM</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display leading-tight">
                  Experience Smart Learning
                </h2>
                <p className="mt-3 text-sm text-blue-100 leading-relaxed">
                  Interactive Digital Board, Concept-Based Teaching and Engaging Learning.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={scrollToGallery}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <span>Explore Classroom</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="sm:w-[54%] relative min-h-[260px] sm:min-h-full">
              <img
                src={SMART_CLASSROOM_WIDE}
                alt="Experience Smart Learning at Genius Coaching Centre Digital Board Classroom"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeachersAndSmartClassroom;
