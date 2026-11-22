import React from 'react';
import { BRAND_INFO } from '../data/coachingData';
import { OfficialLogo } from './OfficialLogo';
import { MessageCircle, Phone, MapPin, ArrowUp } from 'lucide-react';

interface FooterProps {
  onOpenLogoInspector?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLogoInspector }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Courses', href: '#courses' },
    { name: 'Why Genius', href: '#why-genius' },
    { name: 'Progress', href: '#progress' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-800">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenLogoInspector}
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
                title="Click to view official GCC emblem"
              >
                <OfficialLogo size={58} zoom={1.0} className="shrink-0 hover:scale-105 transition-transform" />
              </button>
              <div>
                <h3 className="font-extrabold text-white text-lg tracking-tight font-display uppercase">
                  {BRAND_INFO.name}
                </h3>
                <p className="text-xs text-amber-400 font-bold tracking-widest uppercase">
                  “{BRAND_INFO.tagline}”
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              Focused educational coaching for Class 9 & 10 students in Bhabua, Kaimur, Bihar. Preparing students thoroughly for BSEB & CBSE examinations with conceptual clarity, weekly testing, and active doubt solving.
            </p>

            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Class 9 & 10 | BSEB & CBSE</p>
              <p className="text-amber-400 font-medium">Maths • Science • SST • Sanskrit (BSEB)</p>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-amber-400 transition-colors text-xs text-slate-300 block py-0.5"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Institute Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {BRAND_INFO.name}<br />
                  {BRAND_INFO.location}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${BRAND_INFO.phone}`}
                  className="hover:text-white font-semibold transition-colors"
                >
                  Phone: {BRAND_INFO.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(
                    BRAND_INFO.defaultWhatsappMessage
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 font-semibold transition-colors"
                >
                  WhatsApp: {BRAND_INFO.phone}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(
                  'Hello Genius Coaching Centre, I would like to get admission details.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp Admission Desk</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back-to-top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Genius Coaching Centre. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>Bhabua, Kaimur (Bihar)</span>
            <span>•</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
export default Footer;
