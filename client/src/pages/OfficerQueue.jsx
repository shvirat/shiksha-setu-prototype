import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle, XCircle } from '@phosphor-icons/react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ComparisonTable } from '../ui/ComparisonTable';
import { apiRequest } from '../services/api';

export function OfficerQueue() {
  const { t } = useTranslation();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Filters
  const [selectedScheme, setSelectedScheme] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Decision Form
  const [remarks, setRemarks] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

  const loadQueue = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedScheme) params.append('schemeCode', selectedScheme);
      if (selectedState) params.append('state', selectedState);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await apiRequest(`/officer/queue?${params.toString()}`);
      setQueue(res.data.applications || []);
    } catch (err) {
      console.warn('Failed to load officer queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [selectedScheme, selectedState, selectedStatus]);

  const openDetailDrawer = (app) => {
    setSelectedApp(app);
    setRemarks('');
    setDecisionError('');
  };

  const closeDrawer = () => {
    setSelectedApp(null);
  };

  const handleDecision = async (decision) => {
    if (!remarks.trim()) {
      setDecisionError('Officer remarks are mandatory before making a decision.');
      return;
    }
    setDecisionError('');
    setDecisionSubmitting(true);
    try {
      await apiRequest(`/officer/applications/${selectedApp._id}/decision`, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          remarks: remarks.trim()
        })
      });

      closeDrawer();
      await loadQueue();
    } catch (err) {
      setDecisionError(err.message || 'Decision submission failed');
    } finally {
      setDecisionSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-h1 font-semibold text-ink tracking-tight">
          {t('officer.queueHeading')}
        </h1>
        <p className="text-body text-ink-muted mt-1 font-sans">
          {t('officer.queueSubheading')}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 bg-surface p-3.5 sm:p-4 border border-line rounded">
        <div className="w-full sm:w-auto">
          <label className="text-caption font-semibold text-ink-muted block mb-1">
            Filter Scheme:
          </label>
          <select
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="w-full sm:w-auto h-10 px-3 text-small rounded border border-line-strong bg-surface text-ink focus-visible:outline-navy-600"
          >
            <option value="">All Schemes</option>
            <option value="MOTA-PRE-MATRIC">Pre-Matric ST</option>
            <option value="MOTA-POST-MATRIC">Post-Matric ST</option>
            <option value="MOTA-TOP-CLASS">Top Class Education</option>
            <option value="MOTA-FELLOWSHIP">National Fellowship</option>
            <option value="MOTA-OVERSEAS">National Overseas</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label className="text-caption font-semibold text-ink-muted block mb-1">
            Filter State:
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full sm:w-auto h-10 px-3 text-small rounded border border-line-strong bg-surface text-ink focus-visible:outline-navy-600"
          >
            <option value="">All States</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Odisha">Odisha</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
          </select>
        </div>

        <div className="w-full sm:w-auto">
          <label className="text-caption font-semibold text-ink-muted block mb-1">
            Filter Status:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto h-10 px-3 text-small rounded border border-line-strong bg-surface text-ink focus-visible:outline-navy-600"
          >
            <option value="">All Queue Statuses</option>
            <option value="FLAGGED">FLAGGED (Needs review)</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          </select>
        </div>

        <div className="sm:ml-auto self-start sm:self-end pt-1 sm:pt-0">
          <span className="text-small font-medium text-ink-muted">
            Showing {queue.length} applications
          </span>
        </div>
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-small text-ink-muted border border-line rounded bg-surface">
            Loading verification queue...
          </div>
        ) : queue.length === 0 ? (
          <div className="p-8 text-center text-small text-ink-muted border border-line rounded bg-surface">
            No applications currently awaiting nodal officer review.
          </div>
        ) : (
          queue.map((app) => (
            <div
              key={app._id}
              onClick={() => openDetailDrawer(app)}
              className="border border-line rounded bg-surface p-4 space-y-2.5 cursor-pointer active:bg-paper transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-small font-semibold text-ink">
                  #{app.applicationNumber}
                </span>
                <Badge status={app.status} />
              </div>

              <div>
                <div className="font-semibold text-ink text-body">
                  {app.prefilled?.fullName || app.userId?.name}
                </div>
                <div className="text-caption font-mono text-navy-700 mt-0.5">
                  {app.schemeCode}
                </div>
                <div className="text-caption text-ink-muted mt-0.5">
                  {app.prefilled?.state}, {app.prefilled?.district}
                </div>
              </div>

              {app.mismatches?.length > 0 && (
                <div className="p-2 rounded bg-warning-50 border border-warning-200 text-caption">
                  <span className="font-semibold text-saffron-800 block">Flagged differences:</span>
                  <span className="text-saffron-700 font-medium">
                    {app.mismatches.map((m) => m.field).join(', ')}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-line flex items-center justify-between text-caption">
                <span className="text-ink-muted">Tap to review application</span>
                <span className="text-navy-700 font-semibold flex items-center">
                  Review &rarr;
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Dense Table (hidden on mobile < md) */}
      <div className="hidden md:block border border-line rounded bg-surface overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-paper sticky top-0 border-b border-line text-caption font-semibold text-ink-muted uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Application #</th>
              <th className="py-2.5 px-4">Applicant Name</th>
              <th className="py-2.5 px-4">Scheme</th>
              <th className="py-2.5 px-4">State / District</th>
              <th className="py-2.5 px-4">Flagged Differences</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-small text-ink-muted">
                  Loading verification queue...
                </td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-small text-ink-muted">
                  No applications currently awaiting nodal officer review.
                </td>
              </tr>
            ) : (
              queue.map((app) => (
                <tr
                  key={app._id}
                  onClick={() => openDetailDrawer(app)}
                  className="h-11 hover:bg-paper cursor-pointer transition-colors text-small"
                >
                  <td className="py-2 px-4 font-mono font-medium text-ink">
                    #{app.applicationNumber}
                  </td>
                  <td className="py-2 px-4 font-medium text-ink">
                    {app.prefilled?.fullName || app.userId?.name}
                  </td>
                  <td className="py-2 px-4 text-ink-muted font-mono text-caption">
                    {app.schemeCode}
                  </td>
                  <td className="py-2 px-4 text-ink-muted">
                    {app.prefilled?.state}, {app.prefilled?.district}
                  </td>
                  <td className="py-2 px-4">
                    {app.mismatches?.length > 0 ? (
                      <span className="text-caption text-saffron-700 font-semibold">
                        {app.mismatches.map((m) => m.field).join(', ')}
                      </span>
                    ) : (
                      <span className="text-caption text-ink-subtle">None</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    <Badge status={app.status} />
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button
                      type="button"
                      className="text-navy-600 font-medium hover:underline text-caption"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Right-Side Review Detail Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 bg-ink/30 z-50 flex justify-end">
          <div className="w-full sm:max-w-[580px] bg-surface h-full shadow-overlay border-l border-line flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div>
              <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between sticky top-0 bg-surface z-10">
                <div className="min-w-0 pr-2">
                  <span className="text-caption font-mono text-ink-muted block">
                    #{selectedApp.applicationNumber}
                  </span>
                  <h3 className="font-serif text-h3 font-semibold text-ink truncate">
                    {selectedApp.prefilled?.fullName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="p-1.5 text-ink-muted hover:text-ink rounded focus:outline-none"
                  aria-label="Close drawer"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* Status & Scheme Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge status={selectedApp.status} />
                  <span className="font-mono text-caption text-ink-muted">
                    Scheme: {selectedApp.schemeCode}
                  </span>
                </div>

                {/* Mismatch Comparison Table */}
                {selectedApp.mismatches?.length > 0 && (
                  <ComparisonTable mismatches={selectedApp.mismatches} />
                )}

                {/* Applicant Profile Snapshot */}
                <div className="border border-line rounded p-4 space-y-3 bg-paper">
                  <h4 className="text-caption font-semibold text-ink-muted uppercase tracking-wider">
                    Institutional Enrolment Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-small">
                    <div>
                      <span className="text-caption text-ink-muted block">Category:</span>
                      <span className="font-medium text-ink">{selectedApp.prefilled?.category || 'ST'}</span>
                    </div>
                    <div>
                      <span className="text-caption text-ink-muted block">Declared Income:</span>
                      <span className="font-medium text-ink font-mono">
                        ₹{Number(selectedApp.prefilled?.familyIncome || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-caption text-ink-muted block">Institution:</span>
                      <span className="font-medium text-ink">{selectedApp.prefilled?.institution}</span>
                    </div>
                    <div>
                      <span className="text-caption text-ink-muted block">Course & Year:</span>
                      <span className="font-medium text-ink">
                        {selectedApp.prefilled?.course} (Year {selectedApp.prefilled?.year})
                      </span>
                    </div>
                    <div>
                      <span className="text-caption text-ink-muted block">Bank DBT Ref:</span>
                      <span className="font-medium text-ink font-mono">
                        {selectedApp.prefilled?.maskedBankRef}
                      </span>
                    </div>
                    <div>
                      <span className="text-caption text-ink-muted block">UDISE Registry ID:</span>
                      <span className="font-medium text-ink font-mono">
                        {selectedApp.prefilled?.udiseId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attached Documents */}
                <div>
                  <h4 className="text-caption font-semibold text-ink-muted uppercase tracking-wider mb-2">
                    Attached Supporting Documents
                  </h4>
                  <div className="space-y-2">
                    {selectedApp.attachedDocs?.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 border border-line rounded bg-surface text-small"
                      >
                        <span className="font-medium text-ink truncate max-w-[200px]">{doc.originalName}</span>
                        <span className="text-caption font-mono text-ink-muted uppercase ml-2 flex-shrink-0">
                          {doc.docType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision Form */}
                <div className="border-t border-line pt-4 space-y-3">
                  <h4 className="text-caption font-semibold text-ink uppercase tracking-wider">
                    Officer Decision & Remarks
                  </h4>

                  {decisionError && (
                    <p className="text-caption text-danger-700 bg-danger-50 p-2 rounded border border-danger-700">
                      {decisionError}
                    </p>
                  )}

                  <div>
                    <label className="text-small font-medium text-ink block mb-1">
                      {t('officer.remarksLabel')}{' '}
                      <span className="text-danger-700">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder={t('officer.remarksPlaceholder')}
                      className="w-full p-2.5 text-small border border-line-strong rounded text-ink bg-surface focus:border-navy-600"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
                    <Button
                      variant="primary"
                      onClick={() => handleDecision('APPROVE')}
                      disabled={decisionSubmitting}
                      className="flex-1 justify-center"
                    >
                      <CheckCircle size={18} className="mr-1.5" />
                      {decisionSubmitting ? 'Recording...' : t('officer.approve')}
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => handleDecision('REJECT')}
                      disabled={decisionSubmitting}
                      className="flex-1 justify-center"
                    >
                      <XCircle size={18} className="mr-1.5" />
                      {decisionSubmitting ? 'Recording...' : t('officer.reject')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
