import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretDown, CaretUp, ArrowRight, WarningCircle } from '@phosphor-icons/react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Stepper } from '../ui/Stepper';
import { ComparisonTable } from '../ui/ComparisonTable';
import { apiRequest } from '../services/api';

export function StudentHome() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [eligibilityData, setEligibilityData] = useState({ eligible: [], conflicts: [] });
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [appRes, eligRes] = await Promise.all([
          apiRequest('/applications'),
          apiRequest('/schemes/eligibility')
        ]);
        setApplications(appRes.data.applications || []);
        setEligibilityData(eligRes.data || { eligible: [], conflicts: [] });
      } catch (err) {
        console.warn('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const inProgressApps = applications.filter((a) => !['REJECTED', 'DISBURSED_SIMULATED'].includes(a.status));
  const flaggedApps = applications.filter((a) => a.status === 'FLAGGED');
  const eligibleSchemes = eligibilityData.eligible || [];

  // Plain summary sentence per B7 spec
  const summarySentence = i18n.language === 'hi'
    ? `${inProgressApps.length} आवेदन प्रक्रियाधीन हैं, ${flaggedApps.length} पर आपकी कार्रवाई आवश्यक है, और ${eligibleSchemes.length} योजनाएं हैं जिनके लिए आप पात्र हो सकते हैं।`
    : `${inProgressApps.length} application${inProgressApps.length === 1 ? '' : 's'} in progress, ${flaggedApps.length} need${flaggedApps.length === 1 ? 's' : ''} your action, ${eligibleSchemes.length} scheme${eligibleSchemes.length === 1 ? '' : 's'} you may be eligible for.`;

  const toggleExpand = (id) => {
    setExpandedAppId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="max-w-[1040px] mx-auto px-4 py-8 space-y-6">
        <div className="h-10 w-64 bg-line rounded animate-pulse" />
        <div className="h-5 w-96 bg-line rounded animate-pulse" />
        <div className="h-40 w-full bg-surface border border-line rounded p-6 space-y-3">
          <div className="h-4 w-3/4 bg-line rounded" />
          <div className="h-4 w-1/2 bg-line rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8 pb-20 sm:pb-12 space-y-10">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-h1 font-semibold text-ink tracking-tight">
          {t('home.heading')}
        </h1>
        <p className="text-lead text-ink-muted mt-1 font-sans">
          {summarySentence}
        </p>
      </div>

      {/* 1. Needs your action (Shown only when non-empty) */}
      {flaggedApps.length > 0 && (
        <section aria-labelledby="needs-action-heading" className="space-y-3">
          <h2 id="needs-action-heading" className="text-caption font-semibold text-saffron-700 uppercase tracking-wider">
            {t('home.needsAction')}
          </h2>

          <div className="space-y-3">
            {flaggedApps.map((app) => (
              <div
                key={app._id}
                className="bg-warning-50 border border-warning-700 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <WarningCircle size={22} className="text-warning-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-small font-semibold text-warning-700 block">
                      Application #{app.applicationNumber} ({app.schemeCode})
                    </span>
                    <p className="text-small text-ink mt-0.5">
                      Smart verification detected a data discrepancy. The application has been routed to the Nodal Officer for manual review.
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    variant="primary"
                    size="dense"
                    onClick={() => toggleExpand(app._id)}
                  >
                    View comparison
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Your applications */}
      <section aria-labelledby="your-applications-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="your-applications-heading" className="text-caption font-semibold text-ink-muted uppercase tracking-wider">
            {t('home.yourApplications')}
          </h2>
          <span className="text-caption text-ink-subtle">
            {applications.length} total
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="border border-line rounded bg-surface p-6 text-center text-small text-ink-muted">
            {t('home.noApplications')}{' '}
            <Link to="/schemes" className="text-navy-600 hover:underline ml-1">
              Browse eligible schemes
            </Link>
          </div>
        ) : (
          <div className="border border-line rounded bg-surface divide-y divide-line">
            {applications.map((app) => {
              const isExpanded = expandedAppId === app._id;
              const lastUpdatedDate = new Date(app.updatedAt || app.createdAt).toLocaleDateString(
                i18n.language === 'hi' ? 'hi-IN' : 'en-IN',
                { day: 'numeric', month: 'short', year: 'numeric' }
              );

              return (
                <div key={app._id} className="transition-colors">
                  {/* Summary Row (56px standard height) */}
                  <div
                    onClick={() => toggleExpand(app._id)}
                    tabIndex={0}
                    role="button"
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleExpand(app._id)}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-paper focus-visible:outline-navy-600"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-body font-medium text-ink truncate">
                          {app.schemeCode}
                        </span>
                        <span className="font-mono text-caption text-ink-muted">
                          #{app.applicationNumber}
                        </span>
                      </div>
                      <span className="text-caption text-ink-subtle block mt-0.5">
                        Last updated {lastUpdatedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge status={app.status} />
                      <span className="text-ink-muted">
                        {isExpanded ? <CaretUp size={18} /> : <CaretDown size={18} />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-paper border-t border-line space-y-6">
                      {/* Stepper Component */}
                      <div>
                        <h4 className="text-caption font-semibold text-ink-muted uppercase tracking-wider mb-4">
                          Application Progress
                        </h4>
                        <Stepper status={app.status} />
                      </div>

                      {/* Verification Mismatch Comparison (if present) */}
                      {app.mismatches && app.mismatches.length > 0 && (
                        <ComparisonTable mismatches={app.mismatches} />
                      )}

                      {/* Timeline entries */}
                      {app.timeline && app.timeline.length > 0 && (
                        <div className="border border-line rounded bg-surface p-4">
                          <h4 className="text-caption font-semibold text-ink-muted uppercase tracking-wider mb-3">
                            Verification & Processing History
                          </h4>
                          <div className="space-y-3">
                            {app.timeline.map((entry, idx) => (
                              <div key={idx} className="flex items-start gap-3 text-small">
                                <span className="font-mono text-caption text-ink-subtle w-24 flex-shrink-0">
                                  {new Date(entry.at).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short'
                                  })}
                                </span>
                                <div className="flex-1">
                                  <span className="font-medium text-ink mr-2">
                                    {entry.status.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-caption text-ink-muted">
                                    ({entry.by})
                                  </span>
                                  {entry.note && (
                                    <p className="text-ink-muted text-caption mt-0.5">
                                      {entry.note}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Schemes you may be eligible for */}
      <section aria-labelledby="eligible-schemes-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="eligible-schemes-heading" className="text-caption font-semibold text-ink-muted uppercase tracking-wider">
            {t('home.eligibleSchemes')}
          </h2>
          <Link to="/schemes" className="text-caption text-navy-600 hover:underline">
            View all 5 MoTA schemes
          </Link>
        </div>

        <div className="border border-line rounded bg-surface divide-y divide-line">
          {eligibleSchemes.map(({ scheme, hasConflict, conflictDetails, reasons }) => {
            const displayName = i18n.language === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name;
            const displayDesc = i18n.language === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description;

            return (
              <div key={scheme.code} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lead font-semibold text-navy-700">
                      {displayName}
                    </span>
                    <span className="font-mono text-caption px-2 py-0.5 bg-navy-50 text-navy-700 rounded border border-navy-100">
                      {scheme.code}
                    </span>
                  </div>

                  <p className="text-small text-ink-muted mt-1 leading-relaxed">
                    {displayDesc}
                  </p>

                  {/* Plain reasons list */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink">
                    {reasons.map((reason, idx) => (
                      <span key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-navy-700" />
                        <span>{reason}</span>
                      </span>
                    ))}
                  </div>

                  {/* Conflict explanation sentence */}
                  {hasConflict && conflictDetails && (
                    <div className="mt-3 p-2.5 bg-saffron-50 border border-saffron-700 rounded text-caption text-saffron-700 font-medium">
                      {i18n.language === 'hi' ? conflictDetails.messageHi : conflictDetails.message}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 self-start md:self-center">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/schemes/${scheme.code}/apply`)}
                  >
                    {t('home.applyNow')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
