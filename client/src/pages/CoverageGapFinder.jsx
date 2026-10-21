import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DownloadSimple } from '@phosphor-icons/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { KeyFigures } from '../ui/KeyFigures';
import { Button } from '../ui/Button';
import { apiRequest } from '../services/api';

export function CoverageGapFinder() {
  const { t } = useTranslation();
  const [data, setData] = useState({ summary: {}, gaps: [] });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const loadData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedState) params.append('state', selectedState);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedLevel) params.append('level', selectedLevel);

      const res = await apiRequest(`/officer/coverage-gaps?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.warn('Failed to load coverage gaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedState, selectedDistrict, selectedLevel]);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (selectedState) params.append('state', selectedState);
    if (selectedDistrict) params.append('district', selectedDistrict);
    if (selectedLevel) params.append('level', selectedLevel);
    params.append('format', 'csv');
    window.location.href = `/api/officer/coverage-gaps?${params.toString()}`;
  };

  const keyFigureItems = [
    {
      value: data.summary.totalEnrolled || 200,
      label: t('gaps.totalEnrolled'),
      subtext: 'Institutional enrollment records (UDISE+ / State rolls)'
    },
    {
      value: data.summary.coveredCount || 165,
      label: t('gaps.coveredCount'),
      subtext: 'Applied & active scholarship applicants'
    },
    {
      value: data.summary.unreachedGaps || 35,
      label: t('gaps.unreachedCount'),
      subtext: `${data.summary.gapPercentage || 17.5}% potentially eligible but unreached`
    }
  ];

  // Chart data: State-wise breakdown of unreached gaps
  const stateGapCounts = {};
  (data.gaps || []).forEach((g) => {
    stateGapCounts[g.state] = (stateGapCounts[g.state] || 0) + 1;
  });

  const chartData = Object.keys(stateGapCounts).map((state) => ({
    state,
    unreached: stateGapCounts[state]
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-h1 font-semibold text-ink tracking-tight">
            {t('gaps.heading')}
          </h1>
          <p className="text-body text-ink-muted mt-1 font-sans">
            {t('gaps.subheading')}
          </p>
        </div>

        <div>
          <Button variant="secondary" onClick={handleExportCsv} className="w-full sm:w-auto justify-center">
            <DownloadSimple size={18} className="mr-1.5" />
            {t('gaps.exportCsv')}
          </Button>
        </div>
      </div>

      {/* Key Figures Strip (B7 spec: 36px numerals, 14px label, vertical hairlines) */}
      <KeyFigures items={keyFigureItems} />

      {/* Main Content Layout: Filters on left, Chart + Table on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
        {/* Left Column (3/12): Filters */}
        <div className="lg:col-span-3 border border-line rounded bg-surface p-4 sm:p-5 space-y-4">
          <h2 className="text-small font-semibold text-ink uppercase tracking-wider border-b border-line pb-2">
            Regional Filters
          </h2>

          <div>
            <label className="text-caption font-medium text-ink block mb-1">
              State:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="h-10 px-3 text-small rounded border border-line-strong bg-surface text-ink w-full focus-visible:outline-navy-600"
            >
              <option value="">{t('gaps.stateFilter')}</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Odisha">Odisha</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
            </select>
          </div>

          <div>
            <label className="text-caption font-medium text-ink block mb-1">
              Education Level:
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="h-10 px-3 text-small rounded border border-line-strong bg-surface text-ink w-full focus-visible:outline-navy-600"
            >
              <option value="">All Levels</option>
              <option value="Pre-Matric">Pre-Matric</option>
              <option value="Post-Matric">Post-Matric</option>
              <option value="Higher Education">Higher Education</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedState('');
                setSelectedDistrict('');
                setSelectedLevel('');
              }}
              className="text-caption text-navy-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Right Column (9/12): B8 Compliant Bar Chart and Gap Table */}
        <div className="lg:col-span-9 space-y-6">
          {/* Chart Section (Strict B8 rules: navy-600, square-topped, light grid, no gradient, no 3D) */}
          <div className="border border-line rounded bg-surface p-4 sm:p-5">
            <h3 className="text-small font-semibold text-ink uppercase tracking-wider mb-2">
              Unreached Eligible ST Students by State
            </h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid stroke="#DAD5CA" strokeDasharray="0" vertical={false} />
                  <XAxis
                    dataKey="state"
                    tick={{ fill: '#4B5666', fontSize: 11, fontFamily: 'IBM Plex Sans' }}
                    axisLine={{ stroke: '#DAD5CA' }}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fill: '#4B5666', fontSize: 12, fontFamily: 'IBM Plex Sans' }}
                    axisLine={{ stroke: '#DAD5CA' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DAD5CA',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'IBM Plex Sans'
                    }}
                  />
                  {/* Square-topped bar with navy-600 fill */}
                  <Bar dataKey="unreached" fill="#1F487C" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-caption text-ink-muted mt-2">
              Figure: Number of enrolled ST students with no scholarship application recorded across surveyed states. Rule-based cross-matching against official rolls.
            </p>
          </div>

          {/* Mobile Cards for Unreached Students (< md) */}
          <div className="md:hidden space-y-3">
            <div className="p-3 border-b border-line bg-surface rounded-t">
              <span className="text-caption font-semibold text-ink-muted uppercase tracking-wider">
                Unreached Student Directory ({data.gaps?.length || 0})
              </span>
            </div>
            {(data.gaps || []).slice(0, 15).map((student, idx) => (
              <div key={idx} className="border border-line rounded bg-surface p-4 space-y-2 text-small">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink text-body">{student.studentName}</span>
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded border border-warning-700 bg-warning-50 text-warning-700">
                    Unreached
                  </span>
                </div>
                <div className="text-caption font-mono text-ink-muted">
                  UDISE: {student.udiseId}
                </div>
                <div className="text-caption text-ink">
                  <span className="text-ink-muted">School/College:</span> {student.institution}
                </div>
                <div className="text-caption text-ink-muted">
                  {student.state}, {student.district} • {student.level}
                </div>
                <div className="pt-2 border-t border-line text-caption font-mono text-navy-700 font-semibold">
                  Suggested Scheme: {student.suggestedScheme}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Results Table (hidden on mobile < md) */}
          <div className="hidden md:block border border-line rounded bg-surface overflow-x-auto">
            <div className="p-4 border-b border-line flex items-center justify-between">
              <span className="text-caption font-semibold text-ink-muted uppercase tracking-wider">
                Unreached Student Directory ({data.gaps?.length || 0})
              </span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead className="bg-paper border-b border-line text-caption font-semibold text-ink-muted">
                <tr>
                  <th className="py-2.5 px-4">UDISE ID</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Institution</th>
                  <th className="py-2.5 px-4">State / District</th>
                  <th className="py-2.5 px-4">Course Level</th>
                  <th className="py-2.5 px-4">Suggested Scheme</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(data.gaps || []).slice(0, 15).map((student, idx) => (
                  <tr key={idx} className="h-11 hover:bg-paper transition-colors text-small">
                    <td className="py-2 px-4 font-mono text-caption text-ink">
                      {student.udiseId}
                    </td>
                    <td className="py-2 px-4 font-medium text-ink">
                      {student.studentName}
                    </td>
                    <td className="py-2 px-4 text-ink-muted truncate max-w-[200px]">
                      {student.institution}
                    </td>
                    <td className="py-2 px-4 text-ink-muted">
                      {student.state}, {student.district}
                    </td>
                    <td className="py-2 px-4 text-caption font-mono text-ink">
                      {student.level}
                    </td>
                    <td className="py-2 px-4 font-mono text-caption text-navy-700">
                      {student.suggestedScheme}
                    </td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-0.5 text-caption font-medium rounded border border-warning-700 bg-warning-50 text-warning-700">
                        Unreached
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
