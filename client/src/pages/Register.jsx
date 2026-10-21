import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrandMark } from '../ui/BrandMark';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { useAuth } from '../context/AuthContext';

export function Register() {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  // Basic Account Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  // Initial Student Profile Details
  const [dob, setDob] = useState('2005-04-14');
  const [gender, setGender] = useState('female');
  const [state, setState] = useState('Jharkhand');
  const [district, setDistrict] = useState('Ranchi');
  const [familyIncome, setFamilyIncome] = useState(150000);
  const [institution, setInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState(1);
  const [udiseId, setUdiseId] = useState('');
  const [apaarId, setApaarId] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (mobile.length < 10) {
      setError('Mobile number must be at least 10 digits.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name,
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
        role: 'student',
        language: i18n.language || 'en',
        profile: {
          fullName: name,
          dob,
          gender,
          category: 'ST',
          state,
          district,
          familyIncome: Number(familyIncome) || 0,
          institution: institution || 'Government College, Ranchi',
          course: course || 'B.A General',
          year: Number(year) || 1,
          udiseId: udiseId.trim() || undefined,
          apaarId: apaarId.trim() || undefined
        }
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the entered details.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      {/* Left 5/12 Navy-700 Panel (Desktop) */}
      <div className="hidden md:flex md:w-5/12 bg-navy-700 p-10 lg:p-14 flex-col justify-between text-white">
        <div>
          <BrandMark showHindi={true} light={true} />

          <h2 className="font-serif text-[32px] leading-[40px] font-semibold text-white mt-12 mb-6">
            {t('auth.registerTitle')}
          </h2>

          <p className="text-body text-navy-100 mb-8 font-sans">
            {t('auth.registerSubtitle')}
          </p>

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

        <div className="text-caption text-navy-200 border-t border-navy-600 pt-6">
          {t('brand.footerNotice')}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="md:hidden">
            <BrandMark />
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="ml-auto h-8 px-2.5 rounded border border-line-strong text-caption font-medium hover:bg-paper transition-colors focus-visible:outline-navy-600"
          >
            {i18n.language === 'hi' ? 'English (EN)' : 'हिन्दी (हिं)'}
          </button>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-[620px] mx-auto my-4">
          <h1 className="font-serif text-h2 font-semibold text-ink mb-1">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-small text-ink-muted mb-6">
            {t('auth.registerSubtitle')}
          </p>

          {error && (
            <div className="p-3 mb-5 rounded bg-danger-50 border border-danger-700 text-small text-danger-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Credentials Section */}
            <div className="bg-surface p-4 sm:p-5 rounded border border-line space-y-4">
              <h2 className="text-small font-semibold text-navy-700 uppercase tracking-wide border-b border-line pb-2">
                1. Account Credentials
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label={t('auth.nameLabel')}
                  id="reg_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Birsa Munda"
                  required
                />

                <Field
                  label={t('auth.mobileLabel')}
                  id="reg_mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label={t('auth.emailLabel')}
                  id="reg_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@example.in"
                  required
                />

                <Field
                  label={t('auth.passwordLabel')}
                  id="reg_password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            </div>

            {/* Academic & Demographic Details Section */}
            <div className="bg-surface p-4 sm:p-5 rounded border border-line space-y-4">
              <h2 className="text-small font-semibold text-navy-700 uppercase tracking-wide border-b border-line pb-2">
                2. Academic & Eligibility Details (Prefills Applications)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field
                  label={t('profile.dob')}
                  id="reg_dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />

                <div className="flex flex-col">
                  <label htmlFor="reg_gender" className="text-small font-medium text-ink mb-1">
                    {t('profile.gender')} <span className="text-danger-700">*</span>
                  </label>
                  <select
                    id="reg_gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-11 px-3 text-body rounded border border-line-strong bg-surface text-ink transition-colors focus:border-navy-600 focus-visible:outline-navy-600"
                  >
                    <option value="female">Female (महिला)</option>
                    <option value="male">Male (पुरुष)</option>
                    <option value="other">Other (अन्य)</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-small font-medium text-ink mb-1">
                    {t('profile.category')}
                  </label>
                  <input
                    type="text"
                    value="Scheduled Tribe (ST) - अनिवार्य"
                    disabled
                    className="h-11 px-3 text-body rounded border border-line bg-paper text-ink-muted cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field
                  label={t('profile.state')}
                  id="reg_state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Jharkhand"
                  required
                />

                <Field
                  label={t('profile.district')}
                  id="reg_district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Ranchi"
                  required
                />

                <Field
                  label={t('profile.familyIncome')}
                  id="reg_income"
                  type="number"
                  value={familyIncome}
                  onChange={(e) => setFamilyIncome(e.target.value)}
                  placeholder="e.g. 150000"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Field
                    label={t('profile.institution')}
                    id="reg_institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Birsa Munda College, Khunti"
                    required
                  />
                </div>

                <div>
                  <Field
                    label={t('profile.year')}
                    id="reg_year"
                    type="number"
                    min="1"
                    max="6"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Field
                label={t('profile.course')}
                id="reg_course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. B.Sc Botany / Class 11 / B.Tech"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Field
                  label={`${t('profile.udiseId')} (Optional)`}
                  id="reg_udise"
                  value={udiseId}
                  onChange={(e) => setUdiseId(e.target.value)}
                  placeholder="e.g. UDISE-2026-9042"
                />

                <Field
                  label={`${t('profile.apaarId')} (Optional)`}
                  id="reg_apaar"
                  value={apaarId}
                  onChange={(e) => setApaarId(e.target.value)}
                  placeholder="e.g. APAAR-90081234"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Registering...' : t('auth.registerButton')}
              </Button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-small text-navy-700 hover:text-navy-900 font-medium hover:underline focus-visible:outline-navy-600"
              >
                {t('auth.hasAccount')}
              </Link>
            </div>
          </form>
        </div>

        {/* Mobile footer note */}
        <div className="text-caption text-ink-muted text-center md:hidden border-t border-line pt-4">
          {t('brand.footerNotice')}
        </div>
      </div>
    </div>
  );
}
