import React, { useState, useEffect } from 'react';
import { BRAND_INFO } from '../data/coachingData';
import { OfficialLogo } from './OfficialLogo';
import { X, Send, Phone, MessageCircle, CheckCircle } from 'lucide-react';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  initialClass = 'Class 10',
}) => {
  const [studentName, setStudentName] = useState('');
  const [targetClass, setTargetClass] = useState(initialClass);
  const [targetBoard, setTargetBoard] = useState('BSEB (Bihar Board)');
  const [contactNumber, setContactNumber] = useState('');
  const [preferredBatch, setPreferredBatch] = useState('Morning Batch');

  useEffect(() => {
    if (initialClass) {
      setTargetClass(initialClass);
    }
  }, [initialClass]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = [
      `*Admission Enquiry - Genius Coaching Centre*`,
      studentName ? `• Student Name: ${studentName}` : '',
      `• Class: ${targetClass}`,
      `• Board: ${targetBoard}`,
      `• Preferred Timing: ${preferredBatch}`,
      contactNumber ? `• Phone: ${contactNumber}` : '',
      `Please provide the new session admission details and timetable.`,
    ].filter(Boolean);

    const fullMessage = parts.join('\n');
    const url = `${BRAND_INFO.whatsappBaseUrl}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-300 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <OfficialLogo size={46} zoom={1.0} className="shrink-0" />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg font-display tracking-tight text-white uppercase">
                {BRAND_INFO.admissionBanner.heading}
              </h3>
              <p className="text-xs text-amber-400 font-semibold">
                Class 9 & 10 • BSEB & CBSE • Bhabua
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Student / Guardian Name
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Piyush Chandravanshi"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Class
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-slate-50 font-semibold"
              >
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 9 & 10 Both">Class 9 & 10 (Both)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Board
              </label>
              <select
                value={targetBoard}
                onChange={(e) => setTargetBoard(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-slate-50 font-semibold"
              >
                <option value="BSEB (Bihar Board)">BSEB (Bihar Board)</option>
                <option value="CBSE">CBSE Board</option>
              </select>
              {targetBoard.includes('BSEB') && (
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  ✓ Includes dedicated Sanskrit coaching
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="10-digit number"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Preferred Shift
              </label>
              <select
                value={preferredBatch}
                onChange={(e) => setPreferredBatch(e.target.value)}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-slate-50 font-semibold"
              >
                <option value="Morning Batch">Morning Batch</option>
                <option value="Evening Batch">Evening Batch</option>
                <option value="Any Available Batch">Any Available Batch</option>
              </select>
            </div>
          </div>

          {/* Subjects Included Notice */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Coaching covers: Mathematics • Science (Phy/Chem/Bio) • Social Science</span>
          </div>

          {/* Submit on WhatsApp */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Connect on WhatsApp</span>
            </button>

            <a
              href={`tel:${BRAND_INFO.phone}`}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Direct Call</span>
            </a>
          </div>
        </form>

        <div className="px-6 pb-4 text-center">
          <p className="text-[11px] text-slate-400">
            Genius Coaching Centre • Bhabua, Kaimur, Bihar • Phone: {BRAND_INFO.phone}
          </p>
        </div>
      </div>
    </div>
  );
};
export default EnquiryModal;
