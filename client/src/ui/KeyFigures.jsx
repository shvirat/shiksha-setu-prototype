import React from 'react';

export function KeyFigures({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <div
      className={`w-full flex flex-wrap items-center border border-line bg-surface rounded divide-y sm:divide-y-0 sm:divide-x divide-line ${className}`}
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex-1 min-w-[200px] p-5 flex flex-col items-start">
          <span className="font-serif text-h1 font-semibold text-ink leading-none">
            {typeof item.value === 'number'
              ? item.value.toLocaleString('en-IN')
              : item.value}
          </span>
          <span className="text-small text-ink-muted mt-2 font-sans font-medium">
            {item.label}
          </span>
          {item.subtext && (
            <span className="text-caption text-ink-subtle mt-0.5">
              {item.subtext}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
