import React from 'react';
import { ArrowRight, Phone, Monitor, Users, Award } from 'lucide-react';
import { BRAND_INFO } from '../data/coachingData';

interface HeroProps {
  onOpenEnquiryModal: () => void;
  onOpenLogoInspector?: () => void;
}

const HERO_CLASSROOM_IMG =
  '/assets/aistudio/file_000000003d988211ae397c998fb5c86e_980fd299.png';

export const Hero: React.FC<HeroProps> = ({ onOpenEnquiryModal }) => {
  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-[#06183A] via-[#0A2558] to-[#081E47] text-white overflow-hidden"
    >
      {/* Subtle decorative radial glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14 sm:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Yellow Pill Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-md">
              Class 9th &amp; 10th | BSEB &amp; CBSE
            </div>

            {/* Bold Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.08] font-display">
              <span className="block text-white">Build Strong Concepts.</span>
              <span className="block text-amber-400 mt-1">Prepare With Confidence.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg font-semibold text-blue-100 tracking-wide">
              Expert Coaching • Smart Learning • Bright Future
            </p>

            {/* 3 Highlight Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur-xs">
                <Monitor className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-white leading-tight">
                  Digital Smart Board
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur-xs">
                <Users className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-white leading-tight">
                  Experienced Faculty
                </span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur-xs">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-white leading-tight">
                  Regular Practice
                </span>
              </div>
            </div>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onOpenEnquiryModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span>Admission Enquiry</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`tel:+91${BRAND_INFO.phone}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 font-extrabold text-sm transition-all"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Now ({BRAND_INFO.phone})</span>
              </a>
            </div>
          </div>

          {/* Right Side: Real GCC Digital Classroom Photo */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white/15 shadow-2xl bg-[#071C44]">
              <img
                src={HERO_CLASSROOM_IMG}
                alt="Genius Coaching Centre Digital Smart Classroom in Bhabua"
                className="w-full h-[300px] sm:h-[380px] lg:h-[420px] object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#06183A]/95 via-[#06183A]/50 to-transparent p-5 flex items-end justify-between gap-3">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider mb-1">
                    GCC Smart Classroom
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
                    Smart Teaching... Better Learning
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 inset-x-0 overflow-hidden leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 48"
          className="w-full h-7 sm:h-10 fill-white"
          preserveAspectRatio="none"
        >
          <path d="M0,32 C360,0 1080,64 1440,16 L1440,48 L0,48 Z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
