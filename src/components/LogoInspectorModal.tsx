import React, { useState } from 'react';
import { OfficialLogo } from './OfficialLogo';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Download, ShieldCheck } from 'lucide-react';
import { BRAND_INFO } from '../data/coachingData';

interface LogoInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoInspectorModal: React.FC<LogoInspectorModalProps> = ({ isOpen, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1.0);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(1.4, +(prev + 0.05).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.7, +(prev - 0.05).toFixed(2)));
  };

  const handleReset = () => {
    setZoomLevel(1.0);
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
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base font-display uppercase tracking-tight">
                Official GCC Emblem
              </h3>
              <p className="text-xs text-slate-400">
                Genius Coaching Centre • Bhabua (Kaimur)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logo Display Stage */}
        <div className="p-8 bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

          {/* Logo with dynamic zoom */}
          <div className="relative z-10 transition-transform duration-200">
            <OfficialLogo size={240} zoom={zoomLevel} />
          </div>

          <div className="mt-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-white border border-slate-700">
            Current Fit Zoom: {Math.round(zoomLevel * 100)}%
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="p-5 bg-white border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Zoom Adjuster
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.7}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs disabled:opacity-40 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span>Zoom Out</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                title="Reset to 100% full fit"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Fit 100%</span>
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 1.35}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-40 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Zoom In</span>
              </button>
            </div>
          </div>

          {/* Verification Specs */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Official GCC Coaching Centre Emblem</span>
            </div>
            <p className="text-[11px] text-slate-500 pl-5">
              “GENIUS COACHING CENTRE”, “Bhabua (kaimur)”, twin laurel wheat branches, dual dynamic orbital swooshes, and bold stylized “GCC” monogram.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href="/original_logo.jpg"
              download="genius-coaching-centre-logo.jpg"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Original Logo (HD)</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default LogoInspectorModal;
