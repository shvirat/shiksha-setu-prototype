import React from 'react';

export function BrandMark({ showHindi = false, light = false, className = '' }) {
  const strokeColor = light ? '#FFFFFF' : '#17375E';
  const textColor = light ? 'text-white' : 'text-navy-700';
  const hindiColor = light ? 'text-navy-100' : 'text-ink-muted';

  return (
    <div className={`inline-flex flex-col items-start select-none ${className}`}>
      <div className="flex items-center gap-2">
        {/* Single-stroke bridge glyph: 24x24 arch made from arc and baseline */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Baseline */}
          <line x1="2" y1="20" x2="22" y2="20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          {/* Bridge Arch */}
          <path
            d="M3 20C5 11 19 11 21 20"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <span className={`font-serif text-h3 font-semibold tracking-tight ${textColor}`}>
          Shiksha Setu
        </span>
      </div>

      {showHindi && (
        <span className={`font-serif text-small font-normal ml-8 -mt-1 ${hindiColor}`}>
          शिक्षा सेतु
        </span>
      )}
    </div>
  );
}
