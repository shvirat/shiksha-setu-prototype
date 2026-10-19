import React from 'react';

export function ComparisonTable({ mismatches = [], className = '' }) {
  if (!mismatches || mismatches.length === 0) {
    return null;
  }

  const fieldLabels = {
    fullName: 'Applicant Name',
    familyIncome: 'Annual Family Income',
    year: 'Academic Enrolment Year',
    category: 'Caste Category'
  };

  return (
    <div className={`w-full border border-line rounded bg-surface p-4 ${className}`}>
      <h3 className="text-small font-semibold text-ink uppercase tracking-wider mb-2">
        Verification Mismatch Comparison
      </h3>
      <p className="text-caption text-ink-muted mb-4">
        Our automated registry verification detected the following differences. Your application has been forwarded to the Nodal Officer for manual review.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line text-caption font-semibold text-ink-muted">
              <th className="py-2 pr-4">Field</th>
              <th className="py-2 pr-4">You entered</th>
              <th className="py-2 pr-4">Record shows</th>
              <th className="py-2">Source Registry</th>
            </tr>
          </thead>
          <tbody>
            {mismatches.map((m, idx) => (
              <tr key={idx} className="border-b border-line text-small">
                <td className="py-3 pr-4 font-medium text-ink">
                  {fieldLabels[m.field] || m.field}
                </td>
                <td className="py-3 pr-4 text-ink font-mono">{m.userValue}</td>
                <td className="py-3 pr-4 font-mono font-bold text-ink border-b-2 border-saffron-700">
                  {m.recordValue}
                </td>
                <td className="py-3 text-caption text-ink-muted">{m.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-warning-50 border border-warning-700 rounded text-small text-warning-700">
        <strong>Next step:</strong> The Nodal Officer will verify your uploaded supporting documents (caste certificate, income certificate, college ID) against the flagged records. No further submission is required at this stage unless requested.
      </div>
    </div>
  );
}
