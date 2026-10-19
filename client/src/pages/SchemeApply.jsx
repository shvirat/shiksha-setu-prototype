import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export function SchemeApply() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t, i18n } = useTranslation();

  const [scheme, setScheme] = useState(null);
  const [walletDocs, setWalletDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [schemeRes, docsRes] = await Promise.all([
          apiRequest(`/schemes/${code}`),
          apiRequest('/documents')
        ]);
        setScheme(schemeRes.data.scheme);
        setWalletDocs(docsRes.data.documents || []);
      } catch (err) {
        setError(err.message || 'Failed to load scheme details');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [code]);

  const handleSubmitApplication = async () => {
    setError('');
    setSubmitting(true);
    try {
      // 1. Create Draft
      const draftRes = await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify({ schemeCode: code.toUpperCase() })
      });
      const appId = draftRes.data.application._id;

      // 2. Submit & trigger smart auto-verification
      await apiRequest(`/applications/${appId}/submit`, {
        method: 'POST'
      });

      // 3. Return to home to view results / stepper
      navigate('/');
    } catch (err) {
      setError(err.message || 'Application submission failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1040px] mx-auto px-4 py-8 space-y-6">
        <div className="h-10 w-64 bg-line rounded animate-pulse" />
        <div className="h-64 w-full bg-surface border border-line rounded" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="max-w-[1040px] mx-auto px-4 py-8">
        <p className="text-small text-danger-700">Scheme not found.</p>
      </div>
    );
  }

  const walletDocTypes = new Set(walletDocs.map((d) => d.type));
  const displayName = i18n.language === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name;
  const displayDesc = i18n.language === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description;

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8 pb-20 sm:pb-12 space-y-8">
      {/* Title */}
      <div>
        <span className="text-caption font-semibold text-ink-muted uppercase tracking-wider">
          Scheme Application
        </span>
        <h1 className="font-serif text-h1 font-semibold text-ink tracking-tight mt-1">
          {displayName}
        </h1>
        <p className="text-body text-ink-muted mt-1 leading-relaxed">
          {displayDesc}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger-50 border border-danger-700 rounded text-small text-danger-700">
          {error}
        </div>
      )}

      {/* Split layout: Left Summary & Docs, Right Pre-filled Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column (5/12): Required Documents & Wallet Status */}
        <div className="md:col-span-5 space-y-6">
          <div className="border border-line rounded bg-surface p-5 space-y-4">
            <h2 className="text-lead font-serif font-semibold text-ink">
              Required Documents
            </h2>
            <p className="text-caption text-ink-muted">
              Documents already verified in your wallet will automatically attach to this application.
            </p>

            <div className="space-y-3 pt-2">
              {scheme.requiredDocs?.map((doc, idx) => {
                const inWallet = walletDocTypes.has(doc.type);
                return (
                  <div key={idx} className="flex items-start justify-between gap-3 text-small border-b border-line pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <span className="font-medium text-ink block">{doc.name}</span>
                      <span className="text-caption text-ink-subtle">
                        {doc.mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>

                    <div className="flex-shrink-0">
                      {inWallet ? (
                        <span className="inline-flex items-center gap-1 text-caption text-success-700 bg-success-50 px-2 py-0.5 rounded border border-success-700 font-medium">
                          <CheckCircle size={14} /> Already in wallet
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-caption text-warning-700 bg-warning-50 px-2 py-0.5 rounded border border-warning-700 font-medium">
                          <WarningCircle size={14} /> Upload needed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-line rounded bg-paper p-4 text-small text-ink-muted space-y-2">
            <span className="font-semibold text-ink block">Consent Notice:</span>
            <p className="text-caption">
              By submitting, you authorize Shiksha Setu to perform automated verification of your caste status, enrollment, and income against DigiLocker, UDISE+, and State Revenue registries.
            </p>
          </div>
        </div>

        {/* Right Column (7/12): Pre-filled Form from Profile */}
        <div className="md:col-span-7 border border-line rounded bg-surface p-6 space-y-6">
          <h2 className="text-lead font-serif font-semibold text-ink border-b border-line pb-3">
            Pre-filled Application Data
          </h2>

          <div className="space-y-4">
            <Field
              label="Applicant Full Name"
              value={profile?.fullName || ''}
              disabled={true}
              isPrefilled={true}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Caste Category"
                value={profile?.category || 'ST'}
                disabled={true}
                isPrefilled={true}
              />
              <Field
                label="Annual Family Income"
                value={profile?.familyIncome ? `₹${profile.familyIncome.toLocaleString('en-IN')}` : ''}
                disabled={true}
                isPrefilled={true}
              />
            </div>

            <Field
              label="Enrolled Educational Institution"
              value={profile?.institution || ''}
              disabled={true}
              isPrefilled={true}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Course of Study"
                value={profile?.course || ''}
                disabled={true}
                isPrefilled={true}
              />
              <Field
                label="Academic Year"
                value={profile?.year ? `Year ${profile.year}` : ''}
                disabled={true}
                isPrefilled={true}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="State"
                value={profile?.state || ''}
                disabled={true}
                isPrefilled={true}
              />
              <Field
                label="District"
                value={profile?.district || ''}
                disabled={true}
                isPrefilled={true}
              />
            </div>

            <Field
              label="Aadhaar Seeded Bank Reference"
              value={profile?.maskedBankRef || 'XXXX-XXXX-8921'}
              disabled={true}
              isPrefilled={true}
              helperText="Funds are directly disbursed into this Aadhaar-linked account under DBT."
            />
          </div>

          <div className="pt-4 border-t border-line">
            <Button
              variant="primary"
              onClick={handleSubmitApplication}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? 'Running automated verification checks...' : 'Submit application'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
