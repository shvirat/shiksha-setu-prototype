import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { Badge } from '../ui/Badge';
import { Stepper } from '../ui/Stepper';
import { BrandMark } from '../ui/BrandMark';
import { ComparisonTable } from '../ui/ComparisonTable';
import { KeyFigures } from '../ui/KeyFigures';

export function Styleguide() {
  const { i18n } = useTranslation();

  const colorTokens = [
    { name: 'paper', hex: '#F6F4EF', text: 'text-ink', use: 'Page background' },
    { name: 'surface', hex: '#FFFFFF', text: 'text-ink', border: true, use: 'Tables, forms, drawers' },
    { name: 'ink', hex: '#14202E', text: 'text-white', use: 'Primary text' },
    { name: 'ink-muted', hex: '#4B5666', text: 'text-white', use: 'Secondary text' },
    { name: 'ink-subtle', hex: '#647084', text: 'text-white', use: 'Captions on white only' },
    { name: 'line', hex: '#DAD5CA', text: 'text-ink', use: 'Hairline dividers, 1 px' },
    { name: 'line-strong', hex: '#B9B2A3', text: 'text-ink', use: 'Input borders' },
    { name: 'navy-900', hex: '#0E2542', text: 'text-white', use: 'Deep brand tone' },
    { name: 'navy-700', hex: '#17375E', text: 'text-white', use: 'Brand fill, headings' },
    { name: 'navy-600', hex: '#1F487C', text: 'text-white', use: 'Links, interactive focus' },
    { name: 'navy-100', hex: '#D6E2F0', text: 'text-ink', use: 'Selected rows' },
    { name: 'navy-50', hex: '#EAF0F7', text: 'text-ink', use: 'Info backgrounds' },
    { name: 'saffron-700', hex: '#9A4308', text: 'text-white', use: 'Needs your action accent' },
    { name: 'saffron-400', hex: '#F59240', text: 'text-ink', use: 'Graphic accent on navy' },
    { name: 'saffron-50', hex: '#FDF0E1', text: 'text-ink', use: 'Accent background' },
    { name: 'success-700', hex: '#1B5E3C', text: 'text-white', use: 'Verified status' },
    { name: 'success-50', hex: '#E6F2EB', text: 'text-ink', use: 'Verified tint' },
    { name: 'warning-700', hex: '#7A5200', text: 'text-white', use: 'Needs action status' },
    { name: 'warning-50', hex: '#FBF0D5', text: 'text-ink', use: 'Warning tint' },
    { name: 'danger-700', hex: '#9B2218', text: 'text-white', use: 'Rejected, error text' },
    { name: 'danger-50', hex: '#FBE8E5', text: 'text-ink', use: 'Danger tint' }
  ];

  const statuses = [
    'DRAFT',
    'SUBMITTED',
    'AUTO_VERIFYING',
    'FLAGGED',
    'UNDER_REVIEW',
    'VERIFIED',
    'APPROVED_FOR_SANCTION',
    'REJECTED',
    'DISBURSED_SIMULATED'
  ];

  const sampleMismatches = [
    {
      field: 'fullName',
      userValue: 'Shanti Oraon',
      recordValue: 'Shanti Uraon',
      source: 'MOCK_DIGILOCKER'
    },
    {
      field: 'familyIncome',
      userValue: '₹1,60,000',
      recordValue: '₹2,60,000',
      source: 'MOCK_EDISTRICT'
    }
  ];

  return (
    <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8 pb-24 space-y-12">
      {/* Page Header */}
      <div>
        <span className="text-caption font-semibold text-ink-muted uppercase tracking-wider">
          Design System & Component Showcase
        </span>
        <h1 className="font-serif text-h1 font-semibold text-ink tracking-tight mt-1">
          Shiksha Setu Styleguide
        </h1>
        <p className="text-body text-ink-muted mt-1 leading-relaxed">
          Quiet, typographic, and accessible public-service design system. Strict zero-gradient flat palette, WCAG AA compliance, and native bilingual typography (English + Hindi).
        </p>
      </div>

      {/* 1. Brand Mark */}
      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="font-serif text-h2 font-semibold text-ink">
          1. Brand Mark & Wordmark
        </h2>
        <div className="flex flex-wrap items-center gap-8 p-6 bg-surface border border-line rounded">
          <div>
            <span className="text-caption text-ink-muted block mb-2">Standard (Navy-700):</span>
            <BrandMark />
          </div>
          <div>
            <span className="text-caption text-ink-muted block mb-2">With Native Devanagari (Login):</span>
            <BrandMark showHindi={true} />
          </div>
          <div className="bg-navy-700 p-4 rounded">
            <span className="text-caption text-navy-100 block mb-2">Inverted (Officer Sidebar):</span>
            <BrandMark light={true} />
          </div>
        </div>
      </section>

      {/* 2. Color Palette Tokens */}
      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="font-serif text-h2 font-semibold text-ink">
          2. Color Tokens (PART B3 Spec)
        </h2>
        <p className="text-small text-ink-muted">
          All default Tailwind blues, purples, and gradients have been replaced with these audited tokens.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {colorTokens.map((token) => (
            <div
              key={token.name}
              className={`p-3 rounded border ${token.border ? 'border-line-strong' : 'border-line'} flex flex-col justify-between h-24`}
              style={{ backgroundColor: token.hex }}
            >
              <div className="flex justify-between items-start">
                <span className={`text-caption font-bold font-mono ${token.text}`}>
                  {token.name}
                </span>
                <span className={`text-caption font-mono ${token.text}`}>
                  {token.hex}
                </span>
              </div>
              <span className={`text-[11px] ${token.text} opacity-90 truncate`}>
                {token.use}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Typography Scale */}
      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="font-serif text-h2 font-semibold text-ink">
          3. Typography Scale & Fonts (PART B4 Spec)
        </h2>
        <div className="p-6 bg-surface border border-line rounded space-y-4">
          <div>
            <span className="text-caption font-mono text-ink-muted">H1 / 36px / Source Serif 4 & Noto Serif Devanagari 600</span>
            <h1 className="font-serif text-h1 font-semibold text-ink">
              One login for every tribal scholarship. (प्रत्येक जनजातीय छात्रवृत्ति के लिए एक प्रवेश)
            </h1>
          </div>
          <div>
            <span className="text-caption font-mono text-ink-muted">H2 / 28px / Source Serif 4</span>
            <h2 className="font-serif text-h2 font-semibold text-ink">
              Digital Document Wallet (डिजिटल दस्तावेज़ वॉलेट)
            </h2>
          </div>
          <div>
            <span className="text-caption font-mono text-ink-muted">H3 / 22px / Source Serif 4</span>
            <h3 className="font-serif text-h3 font-semibold text-ink">
              Pre-Matric ST Scholarship (मैट्रिक-पूर्व छात्रवृत्ति)
            </h3>
          </div>
          <div>
            <span className="text-caption font-mono text-ink-muted">Lead / 18px / IBM Plex Sans 400</span>
            <p className="text-lead text-ink">
              Lead editorial text setting context for complex application steps.
            </p>
          </div>
          <div>
            <span className="text-caption font-mono text-ink-muted">Body / 16px (Minimum for Inputs)</span>
            <p className="text-body text-ink">
              Body copy set in IBM Plex Sans with 24px line height and 60-72 characters per line.
            </p>
          </div>
          <div>
            <span className="text-caption font-mono text-ink-muted">Monospace / IBM Plex Mono (IDs, Reference Numbers, Codes)</span>
            <p className="font-mono text-small text-ink">
              UDISE-2026-1049 · APAAR-90048192 · MOTA-2026-88129 · ₹2,50,000
            </p>
          </div>
        </div>
      </section>

      {/* 4. Status Chips (No Dots Rule) */}
      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="font-serif text-h2 font-semibold text-ink">
          4. Status Chips (Never a Dot - B6 Spec)
        </h2>
        <p className="text-small text-ink-muted">
          Text only, 12/16 weight 500, padding 2px 8px, 4px radius, tinted background, dark text, inset border.
        </p>

        <div className="flex flex-wrap gap-3 p-6 bg-surface border border-line rounded">
          {statuses.map((s) => (
            <Badge key={s} status={s} />
          ))}
        </div>
      </section>

      {/* 5. Buttons */}
      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="font-serif text-h2 font-semibold text-ink">
          5. Buttons (44px Height & Focus Ring)
        </h2>
        <div className="flex flex-wrap items-center gap-4 p-6 bg-surface border border-line rounded">
          <Button variant="primary">Submit application</Button>
          <Button variant="secondary">Upload document</Button>
          <Button variant="tertiary">Edit profile details</Button>
          <Button variant="danger">Reject application</Button>
          <Button variant="primary" disabled={true} helperText="Verification in progress">
            Disabled action
          </Button>
          <Button variant="primary" size="dense">
            Dense table button (36px)
          </Button>
        </div>
      </section>

      {/* 6. Form Fields */}
      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="font-serif text-h2 font-semibold text-ink">
          6. Form Fields (44px, Prefilled & Error States)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-surface border border-line rounded">
          <Field
            label="Applicant Full Name"
            value="Birsa Munda"
            disabled={true}
            isPrefilled={true}
          />
          <Field
            label="Annual Family Income"
            value="₹1,40,000"
            helperText="Must match your active state revenue certificate."
          />
          <Field
            label="UDISE School Code"
            value="INVALID-CODE"
            error="School code not recognized in UDISE+ database. Check with your principal."
          />
        </div>
      </section>

      {/* 7. Stepper Component */}
      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="font-serif text-h2 font-semibold text-ink">
          7. Stepper (5 Stages, Square Markers, No Dots)
        </h2>
        <div className="p-6 bg-surface border border-line rounded space-y-6">
          <div>
            <span className="text-caption text-ink-muted block mb-2">Stage: AUTO_VERIFYING</span>
            <Stepper status="AUTO_VERIFYING" />
          </div>
          <div>
            <span className="text-caption text-ink-muted block mb-2">Stage: FLAGGED (Needs Review)</span>
            <Stepper status="FLAGGED" />
          </div>
          <div>
            <span className="text-caption text-ink-muted block mb-2">Stage: DISBURSED_SIMULATED</span>
            <Stepper status="DISBURSED_SIMULATED" />
          </div>
        </div>
      </section>

      {/* 8. Comparison Table */}
      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="font-serif text-h2 font-semibold text-ink">
          8. Comparison Table (Mismatch Saffron-700 Underline)
        </h2>
        <ComparisonTable mismatches={sampleMismatches} />
      </section>

      {/* 9. Key Figures Strip */}
      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="font-serif text-h2 font-semibold text-ink">
          9. Key Figures Strip (Source Serif 36px Numerals)
        </h2>
        <KeyFigures
          items={[
            { value: 200, label: 'Enrolled ST students', subtext: 'Institutional rolls' },
            { value: 165, label: 'Scholarship applicants', subtext: 'Active records' },
            { value: 35, label: 'Unreached coverage gap', subtext: '17.5% unreached rate' }
          ]}
        />
      </section>
    </div>
  );
}
