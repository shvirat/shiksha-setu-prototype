import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Badge } from '../ui/Badge';
import { apiRequest } from '../services/api';

export function OfficerAnalytics() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await apiRequest('/officer/analytics');
        setData(res.data);
      } catch (err) {
        console.warn('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-line rounded animate-pulse" />
        <div className="h-28 w-full bg-surface border border-line rounded" />
      </div>
    );
  }

  const keyFigureItems = [
    {
      value: data.keyFigures.totalApplications,
      label: t('analytics.totalApplications'),
      subtext: 'Across all 5 MoTA schemes'
    },
    {
      value: data.keyFigures.flaggedForReview,
      label: t('analytics.flaggedCount'),
      subtext: `${data.keyFigures.flagRatePercentage}% auto-verification flag rate`
    },
    {
      value: data.keyFigures.approvedOrDisbursed,
      label: t('analytics.sanctionedCount'),
      subtext: 'Direct Benefit Transfer sanctioned'
    },
    {
      value: `${data.keyFigures.averageProcessingDays} Days`,
      label: t('analytics.avgProcessingTime'),
      subtext: 'From online filing to sanction'
    }
  ];

  // Chart 1: Applications by Status
  const statusChartData = Object.keys(data.statusBreakdown || {}).map((status) => ({
    status: status.replace(/_/g, ' '),
    count: data.statusBreakdown[status]
  }));

  // Chart 2: Applications by Scheme
  const schemeChartData = (data.schemeBreakdown || []).map((s) => ({
    scheme: s.schemeCode.replace('MOTA-', ''),
    count: s.count
  }));

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-h1 font-semibold text-ink tracking-tight">
          {t('analytics.heading')}
        </h1>
        <p className="text-body text-ink-muted mt-1 font-sans">
          {t('analytics.subheading')}
        </p>
      </div>

      {/* Key Figures Strip */}
      <KeyFigures items={keyFigureItems} />

      {/* Two B8 Compliant Charts (navy-600, square-topped, no gradients, light grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Applications by Status */}
        <div className="border border-line rounded bg-surface p-5 space-y-3">
          <h2 className="text-small font-semibold text-ink uppercase tracking-wider">
            Applications by Workflow Stage
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid stroke="#DAD5CA" strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="status"
                  tick={{ fill: '#4B5666', fontSize: 11, fontFamily: 'IBM Plex Sans' }}
                  axisLine={{ stroke: '#DAD5CA' }}
                  tickLine={false}
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
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#1F487C" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-caption text-ink-muted">
            Figure: Applications across verification, flagged review, approval, and disbursement stages.
          </p>
        </div>

        {/* Chart 2: Applications by Scheme */}
        <div className="border border-line rounded bg-surface p-5 space-y-3">
          <h2 className="text-small font-semibold text-ink uppercase tracking-wider">
            Applications by MoTA Scheme
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schemeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid stroke="#DAD5CA" strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="scheme"
                  tick={{ fill: '#4B5666', fontSize: 12, fontFamily: 'IBM Plex Sans' }}
                  axisLine={{ stroke: '#DAD5CA' }}
                  tickLine={false}
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
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#1F487C" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-caption text-ink-muted">
            Figure: Total submitted applications categorized by central scholarship scheme code.
          </p>
        </div>
      </div>

      {/* Status Breakdown Table */}
      <div className="border border-line rounded bg-surface overflow-x-auto">
        <div className="p-4 border-b border-line">
          <h2 className="text-small font-semibold text-ink uppercase tracking-wider">
            Comprehensive Status Registry
          </h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-paper border-b border-line text-caption font-semibold text-ink-muted">
            <tr>
              <th className="py-2.5 px-4">Status Token</th>
              <th className="py-2.5 px-4">Status Badge</th>
              <th className="py-2.5 px-4">Application Count</th>
              <th className="py-2.5 px-4">Operational Responsibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-small">
            {Object.keys(data.statusBreakdown || {}).map((status) => (
              <tr key={status} className="h-11 hover:bg-paper transition-colors">
                <td className="py-2 px-4 font-mono text-caption text-ink">
                  {status}
                </td>
                <td className="py-2 px-4">
                  <Badge status={status} />
                </td>
                <td className="py-2 px-4 font-mono font-medium text-ink">
                  {data.statusBreakdown[status]}
                </td>
                <td className="py-2 px-4 text-ink-muted">
                  {['FLAGGED', 'UNDER_REVIEW'].includes(status)
                    ? 'Nodal Officer Manual Review'
                    : ['VERIFIED', 'APPROVED_FOR_SANCTION'].includes(status)
                    ? 'Ministry Finance & Sanction Division'
                    : 'Automated Pipeline / Student Action'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
