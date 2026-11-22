import React, { useState, useEffect } from 'react';
import { OfficialLogo } from './OfficialLogo';
import { BRAND_INFO } from '../data/coachingData';
import { MessageCircle, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenEnquiryModal: () => void;
  onOpenLogoInspector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogoInspector }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#why-genius' },
    { name: 'Courses', href: '#courses' },
    { name: 'Smart Learning', href: '#smart-classroom' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getWhatsAppUrl = () => {
    return `${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(BRAND_INFO.defaultWhatsappMessage)}`;
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        isScrolled
          ? 'bg-[#06183A]/95 backdrop-blur-md border-blue-900/60 shadow-lg text-white'
          : 'bg-[#06183A] border-blue-900/40 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Lockup */}
          <button
            type="button"
            onClick={onOpenLogoInspector}
            className="flex items-center gap-3 text-left group cursor-pointer shrink-0"
            title="Click to inspect official GCC logo"
          >
            <OfficialLogo
              size={48}
              zoom={1.0}
              className="transition-transform duration-200 group-hover:scale-105"
            />
            <div>
              <span className="block font-black text-sm sm:text-base tracking-tight text-white uppercase leading-tight font-display">
                GENIUS COACHING CENTRE
              </span>
              <span className="block text-[11px] sm:text-xs font-bold text-amber-400 tracking-wide">
                Bhabua, Kaimur
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, idx) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-colors ${
                  idx === 0
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'text-slate-100 hover:text-amber-300 hover:bg-white/10'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950/15" />
              <span>WhatsApp Enquiry</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#071C44] border-t border-blue-900/60 px-4 pt-2 pb-5 space-y-1 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block px-3 py-2.5 rounded-lg text-sm font-bold text-slate-100 hover:bg-white/10 hover:text-amber-300"
            >
              {link.name}
            </a>
          ))}
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Enquiry</span>
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
