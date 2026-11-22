import React, { useState } from 'react';
import { BRAND_INFO } from '../data/coachingData';
import { MessageCircle, Phone, X } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getWhatsAppUrl = () => {
    return `${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(BRAND_INFO.defaultWhatsappMessage)}`;
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      
      {/* Interactive Tooltip bubble */}
      {showTooltip && (
        <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded-xl shadow-xl border border-slate-700 max-w-[220px] animate-in fade-in slide-in-from-bottom-2 duration-150 relative">
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -right-1.5 bg-slate-700 text-slate-300 hover:text-white rounded-full p-0.5"
            aria-label="Dismiss message"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="font-semibold text-amber-400">Class 9 & 10 Admissions</p>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Chat directly with Genius Coaching Centre on WhatsApp.
          </p>
        </div>
      )}

      {/* Floating Action Button Cluster */}
      <div className="flex items-center gap-2.5">
        {/* Quick Phone call button */}
        <a
          href={`tel:${BRAND_INFO.phone}`}
          aria-label="Call Genius Coaching Centre"
          className="sm:hidden w-11 h-11 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-lg border border-slate-700 active:scale-95 transition-transform"
        >
          <Phone className="w-5 h-5" />
        </a>

        {/* Primary WhatsApp floating button */}
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Enquire on WhatsApp with Genius Coaching Centre"
          onMouseEnter={() => setShowTooltip(true)}
          className="group flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-xl shadow-emerald-950/30 active:scale-95 transition-all"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
          <span className="hidden sm:inline">WhatsApp Enquiry</span>
          <span className="sm:hidden text-xs">Enquire</span>
          
          {/* Subtle online pulse beacon */}
          <span className="relative flex h-2.5 w-2.5 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-100 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
        </a>
      </div>

    </div>
  );
};
export default FloatingWhatsApp;
