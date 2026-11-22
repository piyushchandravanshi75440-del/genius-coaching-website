import React, { useState } from 'react';
import { BRAND_INFO } from '../data/coachingData';
import { OfficialLogo } from './OfficialLogo';
import {
  MessageCircle,
  Phone,
  Navigation,
  MapPin,
  CheckCircle2,
  Send,
  BookOpen,
  School,
} from 'lucide-react';

interface ContactCTAProps {
  onOpenLogoInspector?: () => void;
}

export const ContactCTA: React.FC<ContactCTAProps> = ({ onOpenLogoInspector }) => {
  const [studentName, setStudentName] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedBoard, setSelectedBoard] = useState('BSEB');
  const [contactNumber, setContactNumber] = useState('');
  const [enquiryQuery, setEnquiryQuery] = useState('');

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Genius Coaching Centre Bhabua Kaimur Bihar'
  )}`;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParts = [
      `Hello Genius Coaching Centre,`,
      `I want to enquire about admission.`,
      studentName ? `*Student Name:* ${studentName}` : '',
      `*Class:* ${selectedClass}`,
      `*Board:* ${selectedBoard}`,
      contactNumber ? `*Contact Number:* ${contactNumber}` : '',
      enquiryQuery ? `*Query:* ${enquiryQuery}` : '',
    ].filter(Boolean);

    const fullMessage = queryParts.join('\n');
    const url = `${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank');
  };

  const getWhatsAppUrl = () => {
    return `${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(BRAND_INFO.defaultWhatsappMessage)}`;
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-blue-600/10 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Section Heading strictly as requested */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-400/15 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-400/30">
            <School className="w-4 h-4 text-amber-400" />
            <span>Admissions & Inquiries</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Ready to Start Your Preparation?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Contact Genius Coaching Centre for Class 9 & 10 admission information.
          </p>
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-stretch">
          
          {/* Left: Official Institute Details strictly formatted */}
          <div className="lg:col-span-6 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-7 sm:p-9 flex flex-col justify-between shadow-xl">
            <div>
              {/* Logo & Name */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={onOpenLogoInspector}
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
                  title="Click to view official GCC emblem"
                >
                  <OfficialLogo size={74} zoom={1.0} className="shrink-0 hover:scale-105 transition-transform" />
                </button>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
                    {BRAND_INFO.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-bold tracking-widest uppercase mt-0.5">
                    {BRAND_INFO.tagline}
                  </p>
                </div>
              </div>

              {/* Required Details List */}
              <div className="space-y-4 pt-2 text-sm text-slate-200">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                      Target Classes & Curriculum
                    </span>
                    <span className="font-bold text-white text-base">Class 9 & 10</span>
                    <span className="mx-2 text-slate-500">•</span>
                    <span className="font-semibold text-amber-300">BSEB & CBSE</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                      Specialized Subjects
                    </span>
                    <span className="font-bold text-white">Maths • Science • SST • Sanskrit (BSEB)</span>
                    <p className="text-xs text-slate-400 mt-0.5">Regular conceptual classes, numerical practice, Sanskrit vyakaran & doubt resolution.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <MapPin className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                      Location
                    </span>
                    <span className="font-bold text-white">{BRAND_INFO.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <Phone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                      Direct Institute Contact
                    </span>
                    <a
                      href={`tel:${BRAND_INFO.phone}`}
                      className="font-bold text-lg text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      {BRAND_INFO.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* The 3 Required Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row gap-3">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] text-center"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Enquiry</span>
              </a>

              <a
                href={`tel:${BRAND_INFO.phone}`}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm border border-slate-600 transition-all text-center"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call Now</span>
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-all text-center"
              >
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Get Directions</span>
              </a>
            </div>

          </div>

          {/* Right: Quick Direct Admission WhatsApp Form */}
          <div className="lg:col-span-6 bg-white text-slate-900 rounded-2xl p-7 sm:p-9 shadow-xl flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                  Immediate Response
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                  Quick Admission Enquiry
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Fill in your details below and send directly to our WhatsApp admission desk for batch timings & information.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Student Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Student / Parent Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student or guardian name"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>

                {/* Class & Board Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Enrolling For
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                    >
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 9 & 10 Both">Both 9 & 10</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Board
                    </label>
                    <select
                      value={selectedBoard}
                      onChange={(e) => setSelectedBoard(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
                    >
                      <option value="BSEB (Bihar Board)">BSEB (Bihar Board)</option>
                      <option value="CBSE">CBSE Board</option>
                    </select>
                    {selectedBoard.includes('BSEB') && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        ✓ Includes Sanskrit syllabus
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Your Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>

                {/* Optional Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Specific Question (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={enquiryQuery}
                    onChange={(e) => setEnquiryQuery(e.target.value)}
                    placeholder="e.g. Batch timings, syllabus start date, test frequency..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Enquiry via WhatsApp</span>
                </button>
              </form>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400">
                Direct WhatsApp opens instantly with your pre-filled inquiry. No spam.
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
export default ContactCTA;
