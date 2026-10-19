import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { apiRequest } from '../services/api';

export function SchemesDirectory() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchemes() {
      try {
        const res = await apiRequest('/schemes');
        setSchemes(res.data.schemes || []);
      } catch (err) {
        console.warn('Failed to fetch schemes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchemes();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1040px] mx-auto px-4 py-8 space-y-6">
        <div className="h-10 w-64 bg-line rounded animate-pulse" />
        <div className="h-40 w-full bg-surface border border-line rounded" />
      </div>
    );
  }

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8 pb-20 sm:pb-12 space-y-8">
      <div>
        <h1 className="font-serif text-h1 font-semibold text-ink tracking-tight">
          Ministry Scholarship Schemes
        </h1>
        <p className="text-lead text-ink-muted mt-1 font-sans">
          All 5 Ministry of Tribal Affairs (MoTA) scholarship schemes accessible with your single verified profile.
        </p>
      </div>

      <div className="border border-line rounded bg-surface divide-y divide-line">
        {schemes.map((scheme) => {
          const displayName = i18n.language === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name;
          const displayDesc = i18n.language === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description;
          const ceiling = scheme.eligibilityRules?.incomeCeiling
            ? `₹${scheme.eligibilityRules.incomeCeiling.toLocaleString('en-IN')}`
            : 'No income ceiling';

          return (
            <div key={scheme.code} className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-h3 font-semibold text-navy-700">
                    {displayName}
                  </span>
                  <span className="font-mono text-caption px-2 py-0.5 bg-navy-50 text-navy-700 rounded border border-navy-100">
                    {scheme.code}
                  </span>
                  <span className="text-caption font-medium px-2 py-0.5 bg-paper text-ink-muted rounded border border-line">
                    {scheme.level}
                  </span>
                </div>

                <p className="text-body text-ink leading-relaxed">
                  {displayDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-small">
                  <div className="border-l-2 border-line pl-3">
                    <span className="text-caption text-ink-muted block">Income Ceiling:</span>
                    <span className="font-medium text-ink">{ceiling}</span>
                  </div>
                  <div className="border-l-2 border-line pl-3">
                    <span className="text-caption text-ink-muted block">Source Portal:</span>
                    <span className="font-medium text-ink">{scheme.sourcePortal} (Integrated)</span>
                  </div>
                </div>

                {scheme.eligibilityRules?.conflictsWith?.length > 0 && (
                  <p className="text-caption text-warning-700 bg-warning-50 p-2 rounded border border-warning-700">
                    <strong>Rule:</strong> Cannot be held simultaneously with other central scholarships ({scheme.eligibilityRules.conflictsWith.join(', ')}).
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 self-start md:self-center">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/schemes/${scheme.code}/apply`)}
                >
                  Apply with wallet
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
