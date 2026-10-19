import React from 'react';

export function Badge({ status, label, className = '' }) {
  // Map application or document status to color token pairs and human labels
  const statusConfig = {
    DRAFT: {
      bg: 'bg-navy-50',
      text: 'text-navy-700',
      border: 'border-navy-100',
      defaultLabel: 'Draft'
    },
    SUBMITTED: {
      bg: 'bg-navy-50',
      text: 'text-navy-700',
      border: 'border-navy-100',
      defaultLabel: 'Submitted'
    },
    AUTO_VERIFYING: {
      bg: 'bg-navy-50',
      text: 'text-navy-700',
      border: 'border-navy-100',
      defaultLabel: 'Verifying'
    },
    FLAGGED: {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      border: 'border-warning-700',
      defaultLabel: 'Needs your action'
    },
    UNDER_REVIEW: {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      border: 'border-warning-700',
      defaultLabel: 'Under review'
    },
    VERIFIED: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-700',
      defaultLabel: 'Verified'
    },
    APPROVED_FOR_SANCTION: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-700',
      defaultLabel: 'Approved'
    },
    REJECTED: {
      bg: 'bg-danger-50',
      text: 'text-danger-700',
      border: 'border-danger-700',
      defaultLabel: 'Rejected'
    },
    DISBURSED_SIMULATED: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-700',
      defaultLabel: 'Paid (demo)'
    },
    EXPIRED: {
      bg: 'bg-danger-50',
      text: 'text-danger-700',
      border: 'border-danger-700',
      defaultLabel: 'Expired'
    },
    PENDING: {
      bg: 'bg-navy-50',
      text: 'text-navy-700',
      border: 'border-navy-100',
      defaultLabel: 'Pending'
    }
  };

  const config = statusConfig[status] || {
    bg: 'bg-navy-50',
    text: 'text-navy-700',
    border: 'border-navy-100',
    defaultLabel: status || 'Unknown'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-caption font-medium rounded border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {label || config.defaultLabel}
    </span>
  );
}
