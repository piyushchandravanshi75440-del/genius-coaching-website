import React, { useState } from 'react';
import originalLogoAsset from '../assets/images/original_coaching_logo_1790598360978.jpg';

interface OfficialLogoProps {
  className?: string;
  size?: number | string;
  zoom?: number;
  alt?: string;
}

/**
 * Official Genius Coaching Centre (GCC) Coaching Logo
 * Displays the authentic original coaching logo directly without degradation or distortion.
 * - Genuine circular emblem with "GENIUS COACHING CENTRE", "Bhabua (kaimur)",
 *   twin wheat laurel branches, dynamic dual orbital swooshes, and the GCC monogram.
 * - Crisp, high-definition, sharp edges, and zero visual artifacts.
 */
export const OfficialLogo: React.FC<OfficialLogoProps> = ({
  className = '',
  size = 48,
  zoom = 1.0,
  alt = 'Genius Coaching Centre GCC Official Logo',
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(size, 10) || 48;
  const [hasError, setHasError] = useState(false);

  const safeZoom = Math.max(0.6, Math.min(2.0, zoom || 1.0));

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{
        width: numericSize,
        height: numericSize,
      }}
      title="Genius Coaching Centre (GCC) - Bhabua (kaimur)"
    >
      <div
        className="w-full h-full relative rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm transition-transform duration-150"
        style={{
          transform: safeZoom !== 1.0 ? `scale(${safeZoom})` : undefined,
          transformOrigin: 'center center',
        }}
      >
        {!hasError ? (
          <img
            src={originalLogoAsset || '/original_logo.jpg'}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-contain rounded-full select-none"
            loading="eager"
            draggable={false}
          />
        ) : (
          <img
            src="/original_logo.jpg"
            alt={alt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain rounded-full select-none"
            loading="eager"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
};

export default OfficialLogo;
