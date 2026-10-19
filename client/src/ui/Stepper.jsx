import React from 'react';
import { Check } from '@phosphor-icons/react';

const STAGES = [
  { id: 'submitted', label: 'Submitted', description: 'Application filed online' },
  { id: 'verification', label: 'Verification', description: 'Automated registry checks' },
  { id: 'review', label: 'Review', description: 'Nodal verification review' },
  { id: 'sanction', label: 'Sanction', description: 'Ministry order issued' },
  { id: 'payment', label: 'Payment (demo)', description: 'Simulated DBT transfer' }
];

function getStageIndex(status) {
  switch (status) {
    case 'DRAFT':
      return -1;
    case 'SUBMITTED':
      return 0;
    case 'AUTO_VERIFYING':
      return 1;
    case 'FLAGGED':
    case 'UNDER_REVIEW':
      return 2;
    case 'VERIFIED':
    case 'APPROVED_FOR_SANCTION':
      return 3;
    case 'DISBURSED_SIMULATED':
      return 4;
    case 'REJECTED':
      return 2;
    default:
      return 0;
  }
}

export function Stepper({ status = 'SUBMITTED', className = '' }) {
  const currentIndex = getStageIndex(status);

  return (
    <div className={`w-full ${className}`}>
      {/* Horizontal on >=640px */}
      <div className="hidden sm:flex items-start justify-between relative">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div key={stage.id} className="flex-1 flex flex-col items-center relative text-center">
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={`absolute top-3 right-1/2 w-full h-[1px] -translate-y-1/2 z-0 ${
                    idx <= currentIndex ? 'bg-navy-700' : 'bg-line'
                  }`}
                />
              )}

              {/* Square Marker */}
              <div
                className={`w-6 h-6 rounded-none flex items-center justify-center z-10 text-caption font-mono transition-colors ${
                  isCompleted
                    ? 'bg-navy-700 text-white'
                    : isCurrent
                    ? 'bg-surface border-2 border-navy-700 text-navy-700 font-bold'
                    : 'bg-surface border border-line-strong text-ink-muted'
                }`}
              >
                {isCompleted ? <Check size={14} weight="bold" /> : idx + 1}
              </div>

              {/* Labels */}
              <div className="mt-2 flex flex-col items-center">
                <span
                  className={`text-small ${
                    isCurrent ? 'font-bold text-navy-700' : isCompleted ? 'font-medium text-ink' : 'text-ink-muted'
                  }`}
                >
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="text-caption text-ink-muted mt-0.5 max-w-[130px]">
                    {stage.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vertical on <640px */}
      <div className="flex sm:hidden flex-col space-y-4">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage.id} className="flex items-start gap-3 relative">
              {/* Vertical connector */}
              {idx < STAGES.length - 1 && (
                <div
                  className={`absolute left-3 top-6 bottom-0 w-[1px] -translate-x-1/2 h-8 ${
                    idx < currentIndex ? 'bg-navy-700' : 'bg-line'
                  }`}
                />
              )}

              {/* Square Marker */}
              <div
                className={`w-6 h-6 flex-shrink-0 flex items-center justify-center z-10 text-caption font-mono ${
                  isCompleted
                    ? 'bg-navy-700 text-white'
                    : isCurrent
                    ? 'bg-surface border-2 border-navy-700 text-navy-700 font-bold'
                    : 'bg-surface border border-line-strong text-ink-muted'
                }`}
              >
                {isCompleted ? <Check size={14} weight="bold" /> : idx + 1}
              </div>

              {/* Stage description */}
              <div className="flex flex-col">
                <span
                  className={`text-small ${
                    isCurrent ? 'font-bold text-navy-700' : isCompleted ? 'font-medium text-ink' : 'text-ink-muted'
                  }`}
                >
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="text-caption text-ink-muted mt-0.5">
                    {stage.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
