import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrandMark } from '../ui/BrandMark';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('birsa.munda@example.in');
  const [password, setPassword] = useState('Student@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'officer') {
        navigate('/officer/queue');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoRole === 'officer' ? 'Officer@123' : 'Student@123');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Left 5/12 Flat Navy-700 Panel (Desktop) */}
      <div className="hidden md:flex md:w-5/12 bg-navy-700 p-10 lg:p-14 flex-col justify-between text-white">
        <div>
          <BrandMark showHindi={true} light={true} />

          <h2 className="font-serif text-[32px] leading-[40px] font-semibold text-white mt-12 mb-8">
            {t('brand.tagline')}
          </h2>

          <div className="space-y-4 text-small text-navy-100 font-sans">
            <p className="flex items-start gap-2">
              <span className="text-saffron-400 font-bold">—</span>
              <span>{t('auth.bullet1')}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-saffron-400 font-bold">—</span>
              <span>{t('auth.bullet2')}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-saffron-400 font-bold">—</span>
              <span>{t('auth.bullet3')}</span>
            </p>
          </div>
        </div>

        <div className="border-t border-navy-600 pt-6 text-caption text-navy-100">
          <p>{t('brand.footerNotice')}</p>
          <p className="mt-1">Ministry of Tribal Affairs | Team bytecodex</p>
        </div>
      </div>

      {/* Right Form on Paper */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-16">
        {/* Top Header / Language Switcher */}
        <div className="flex items-center justify-between">
          <div className="md:hidden">
            <BrandMark showHindi={true} />
          </div>
          <div className="ml-auto">
            <button
              type="button"
              onClick={toggleLanguage}
              className="h-8 px-3 rounded border border-line-strong text-caption font-medium hover:bg-surface transition-colors"
            >
              {i18n.language === 'hi' ? 'English (EN)' : 'हिन्दी (हिं)'}
            </button>
          </div>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-[420px] mx-auto my-8">
          <h1 className="font-serif text-h2 font-semibold text-ink mb-1">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-small text-ink-muted mb-6">
            {t('auth.loginSubtitle')}
          </p>

          {error && (
            <div className="p-3 mb-4 rounded bg-danger-50 border border-danger-700 text-small text-danger-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label={t('auth.emailLabel')}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. birsa.munda@example.in"
              required
            />

            <Field
              label={t('auth.passwordLabel')}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Authenticating...' : t('auth.loginButton')}
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/register"
                className="text-small text-navy-700 hover:text-navy-900 font-medium hover:underline focus-visible:outline-navy-600"
              >
                {t('auth.noAccount')}
              </Link>
            </div>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-8 pt-6 border-t border-line">
            <span className="text-caption font-semibold text-ink-muted uppercase tracking-wider block mb-2">
              Demo Credentials (Click to prefill):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('birsa.munda@example.in', 'student')}
                className="px-2.5 py-1 text-caption bg-surface border border-line rounded text-ink hover:border-navy-700 text-left"
              >
                <strong>Birsa Munda</strong> (Clean ST Student)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('shanti.oraon@example.in', 'student')}
                className="px-2.5 py-1 text-caption bg-surface border border-line rounded text-ink hover:border-navy-700 text-left"
              >
                <strong>Shanti Oraon</strong> (Mismatch/Flagged)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('officer.mota@gov.in', 'officer')}
                className="px-2.5 py-1 text-caption bg-surface border border-line rounded text-ink hover:border-navy-700 text-left"
              >
                <strong>Dr. Rameshwar Oraon</strong> (Nodal Officer)
              </button>
            </div>
          </div>
        </div>

        {/* Mobile footer note */}
        <div className="text-caption text-ink-muted text-center md:hidden border-t border-line pt-4">
          {t('brand.footerNotice')}
        </div>
      </div>
    </div>
  );
}
