import React from 'react';
import { PhoneCall, MapPin, ClipboardList, BookOpenCheck, ArrowRight } from 'lucide-react';

interface AdmissionProcessProps {
  onOpenEnquiryModal: () => void;
}

const STEPS = [
  {
    number: '1',
    title: 'Contact Us',
    description: 'Call or WhatsApp us for batch timings and class details.',
    icon: PhoneCall,
  },
  {
    number: '2',
    title: 'Visit Institute',
    description: 'Visit our campus at Sundar Nagar Colony, Ward No. 2, Bhabua.',
    icon: MapPin,
  },
  {
    number: '3',
    title: 'Get Information',
    description: 'Discuss syllabus, fees, and attend a counselling session.',
    icon: ClipboardList,
  },
  {
    number: '4',
    title: 'Start Learning',
    description: 'Join your Class 9 or 10 batch and begin smart preparation.',
    icon: BookOpenCheck,
  },
];

export const AdmissionProcess: React.FC<AdmissionProcessProps> = ({ onOpenEnquiryModal }) => {
  return (
    <section id="admission-process" className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider mb-3 shadow-xs">
            ADMISSION PROCESS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#06183A] tracking-tight font-display">
            Easy Steps to Join GCC
          </h2>
          <p className="mt-2 text-sm sm:text-base font-medium text-slate-600">
            Simple and transparent enrollment process for Class 9 &amp; 10 students.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center flex flex-col items-center shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-[#06183A] text-amber-400 font-black text-lg flex items-center justify-center shadow-sm mb-4">
                  {step.number}
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-[#06183A] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#06183A] font-display">{step.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={onOpenEnquiryModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#06183A] hover:bg-[#0B2A60] text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>Start Your Admission Enquiry</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdmissionProcess;
