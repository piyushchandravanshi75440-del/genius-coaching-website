import React from 'react';
import { BRAND_INFO } from '../data/coachingData';
import { BellRing, ArrowRight, MessageCircle } from 'lucide-react';

interface AdmissionBannerProps {
  onOpenEnquiryModal: () => void;
}

export const AdmissionBanner: React.FC<AdmissionBannerProps> = ({ onOpenEnquiryModal }) => {
  const whatsappUrl = `${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(
    'Hello Genius Coaching Centre, I would like to get admission information for Class 9/10 new session.'
  )}`;

  return (
    <section className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 py-5 sm:py-6 shadow-md border-y border-amber-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Info */}
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="hidden sm:flex p-2.5 rounded-full bg-slate-950 text-amber-400 shrink-0 shadow-sm">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <span className="inline-block bg-slate-950 text-amber-400 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide">
                  Official Announcement
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  BSEB & CBSE Boards
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 font-display">
                {BRAND_INFO.admissionBanner.heading}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5">
                {BRAND_INFO.admissionBanner.subheading} —{' '}
                <span className="font-normal text-slate-800">{BRAND_INFO.admissionBanner.ctaText}</span>
              </p>
            </div>
          </div>

          {/* Action Button: Get Admission Information */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenEnquiryModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>{BRAND_INFO.admissionBanner.buttonText}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-white/90 hover:bg-white text-slate-950 font-bold text-sm border border-slate-900/10 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>WhatsApp Admission Desk</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
export default AdmissionBanner;
