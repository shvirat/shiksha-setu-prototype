import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ShieldCheck, Bank, IdentificationCard, UserCircle } from '@phosphor-icons/react';
import { Field } from '../ui/Field';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const { t } = useTranslation();
  const { user, profile, updateProfile, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('female');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  const [institution, setInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState(1);
  const [udiseId, setUdiseId] = useState('');
  const [apaarId, setApaarId] = useState('');
  const [maskedBankRef, setMaskedBankRef] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile || user) {
      setFullName(profile?.fullName || user?.name || '');
      setDob(profile?.dob ? profile.dob.split('T')[0] : '2004-01-01');
      setGender(profile?.gender || 'female');
      setState(profile?.state || 'Jharkhand');
      setDistrict(profile?.district || 'Ranchi');
      setFamilyIncome(profile?.familyIncome !== undefined ? profile.familyIncome : 140000);
      setInstitution(profile?.institution || '');
      setCourse(profile?.course || '');
      setYear(profile?.year || 1);
      setUdiseId(profile?.udiseId || '');
      setApaarId(profile?.apaarId || '');
      setMaskedBankRef(profile?.maskedBankRef || 'XXXX-XXXX-8921');
    }
  }, [profile, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSaving(true);

    try {
      await updateProfile({
        fullName,
        dob,
        gender,
        category: 'ST',
        state,
        district,
        familyIncome: Number(familyIncome) || 0,
        institution,
        course,
        year: Number(year) || 1,
        udiseId: udiseId.trim(),
        apaarId: apaarId.trim(),
        maskedBankRef
      });
      await refreshUser();
      setSuccessMsg(t('profile.savedSuccess'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1040px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-surface p-6 rounded border border-line flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy-50 border border-navy-200 text-navy-700 flex items-center justify-center flex-shrink-0">
            <UserCircle size={36} weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-h3 font-semibold text-ink">
                {profile?.fullName || user?.name || 'Student Profile'}
              </h1>
              <Badge status="VERIFIED" label="Scheduled Tribe (ST)" />
            </div>
            <p className="text-small text-ink-muted mt-0.5">
              {user?.email} • {user?.mobile}
            </p>
          </div>
        </div>

        <div className="text-caption text-ink-muted bg-paper px-3 py-2 rounded border border-line">
          <span>Student ID: </span>
          <strong className="font-mono text-navy-700">{profile?.apaarId || profile?.udiseId || user?._id?.slice(-8).toUpperCase()}</strong>
        </div>
      </div>

      {/* Registry Auto-Verification Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-surface rounded border border-line flex items-center gap-3">
          <ShieldCheck size={24} className="text-forest-700 flex-shrink-0" weight="fill" />
          <div className="min-w-0">
            <div className="text-caption font-semibold text-ink">DigiLocker ST Caste</div>
            <div className="text-[11px] text-forest-700 font-medium">Auto-Verified & Active</div>
          </div>
        </div>

        <div className="p-3 bg-surface rounded border border-line flex items-center gap-3">
          <IdentificationCard size={24} className="text-navy-700 flex-shrink-0" weight="fill" />
          <div className="min-w-0">
            <div className="text-caption font-semibold text-ink">e-District Domicile</div>
            <div className="text-[11px] text-forest-700 font-medium">Verified by State Portal</div>
          </div>
        </div>

        <div className="p-3 bg-surface rounded border border-line flex items-center gap-3">
          <CheckCircle size={24} className="text-saffron-600 flex-shrink-0" weight="fill" />
          <div className="min-w-0">
            <div className="text-caption font-semibold text-ink">UDISE+ Enrolment</div>
            <div className="text-[11px] text-ink-muted font-medium">Linked to Institutional Roll</div>
          </div>
        </div>

        <div className="p-3 bg-surface rounded border border-line flex items-center gap-3">
          <Bank size={24} className="text-navy-700 flex-shrink-0" weight="fill" />
          <div className="min-w-0">
            <div className="text-caption font-semibold text-ink">Aadhaar PFMS / DBT</div>
            <div className="text-[11px] text-forest-700 font-medium font-mono">{maskedBankRef}</div>
          </div>
        </div>
      </div>

      {/* Success & Error alerts */}
      {successMsg && (
        <div className="p-4 rounded bg-forest-50 border border-forest-700 text-small text-forest-700 flex items-center gap-2">
          <CheckCircle size={20} weight="fill" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded bg-danger-50 border border-danger-700 text-small text-danger-700">
          {errorMsg}
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Demographic Info */}
        <div className="bg-surface p-5 sm:p-6 rounded border border-line space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-body font-semibold text-navy-700">
              1. {t('profile.personalInfo')}
            </h2>
            <p className="text-caption text-ink-muted">
              These details are matched against your DigiLocker ST Certificate and Aadhaar identity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label={t('profile.fullName')}
              id="prof_fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Birsa Munda"
              required
            />

            <Field
              label={t('profile.dob')}
              id="prof_dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label htmlFor="prof_gender" className="text-small font-medium text-ink mb-1">
                {t('profile.gender')} <span className="text-danger-700">*</span>
              </label>
              <select
                id="prof_gender"
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
                value="Scheduled Tribe (ST) - Verified"
                disabled
                className="h-11 px-3 text-body rounded border border-line bg-paper text-forest-700 font-semibold cursor-not-allowed"
              />
            </div>

            <Field
              label={t('profile.familyIncome')}
              id="prof_income"
              type="number"
              value={familyIncome}
              onChange={(e) => setFamilyIncome(e.target.value)}
              placeholder="e.g. 150000"
              helperText="Determines scholarship scheme eligibility"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label={t('profile.state')}
              id="prof_state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Jharkhand"
              required
            />

            <Field
              label={t('profile.district')}
              id="prof_district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Ranchi"
              required
            />
          </div>
        </div>

        {/* Section 2: Academic & Institutional Information */}
        <div className="bg-surface p-5 sm:p-6 rounded border border-line space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-body font-semibold text-navy-700">
              2. {t('profile.academicInfo')}
            </h2>
            <p className="text-caption text-ink-muted">
              Institution and course details determine Pre-Matric, Post-Matric, or Higher Education scheme eligibility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Field
                label={t('profile.institution')}
                id="prof_inst"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Birsa Munda College, Khunti"
                required
              />
            </div>

            <div>
              <Field
                label={t('profile.year')}
                id="prof_year"
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
            id="prof_course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. B.Sc Botany / Higher Secondary Science"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Field
              label={t('profile.udiseId')}
              id="prof_udise"
              value={udiseId}
              onChange={(e) => setUdiseId(e.target.value)}
              placeholder="e.g. UDISE-2026-1000"
            />

            <Field
              label={t('profile.apaarId')}
              id="prof_apaar"
              value={apaarId}
              onChange={(e) => setApaarId(e.target.value)}
              placeholder="e.g. APAAR-90000000"
            />

            <Field
              label={t('profile.maskedBankRef')}
              id="prof_bank"
              value={maskedBankRef}
              onChange={(e) => setMaskedBankRef(e.target.value)}
              placeholder="e.g. XXXX-XXXX-2000"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="px-8"
          >
            {saving ? 'Updating Profile...' : t('profile.saveButton')}
          </Button>
        </div>
      </form>
    </div>
  );
}
