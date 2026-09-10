'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart3, TrendingUp, IndianRupee, Users, Briefcase,
  Calendar, RefreshCw, AlertTriangle, HardHat, RotateCcw
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency } from '@/lib/finance-utils';

type DatePreset = 'today' | '7d' | '30d' | 'month' | 'all';

interface FinanceStats {
  totalRevenue: number;
  totalCommission: number;
  totalWorkerEarnings: number;
  totalRefundAmount: number;
  totalGatewayFees: number;
  netPlatformRevenue: number;
  totalPayments: number;
  capturedPayments: number;
  failedPayments: number;
  refundedCount: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  activeJobs: number;
  completionRate: number;
  totalUsers: number;
  totalWorkers: number;
  verifiedWorkers: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;
  revenueTimeSeries: { date: string; revenue: number; commission: number }[];
  jobStatusCounts: Record<string, number>;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
];

function getDateRange(preset: DatePreset): { from?: string; to?: string } {
  const now = new Date();
  const toStr = now.toISOString();

  if (preset === 'all') return {};

  const from = new Date();
  if (preset === 'today') from.setHours(0, 0, 0, 0);
  else if (preset === '7d') { from.setDate(from.getDate() - 7); from.setHours(0, 0, 0, 0); }
  else if (preset === '30d') { from.setDate(from.getDate() - 30); from.setHours(0, 0, 0, 0); }
  else if (preset === 'month') { from.setDate(1); from.setHours(0, 0, 0, 0); }

  return { from: from.toISOString(), to: toStr };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.name.includes('Revenue') || p.name.includes('Commission') ? formatCurrency(p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<DatePreset>('30d');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getDateRange(preset);
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await fetch(`/api/finance/stats?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats(data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [preset]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const jobPieData = stats ? [
    { name: 'Completed', value: stats.jobStatusCounts.COMPLETED || 0 },
    { name: 'Cancelled', value: stats.jobStatusCounts.CANCELLED || 0 },
    { name: 'In Progress', value: stats.jobStatusCounts.IN_PROGRESS || 0 },
    { name: 'Broadcasting', value: stats.jobStatusCounts.BROADCASTING || 0 },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics Overview</h1>
          <p className="text-sm text-gray-400 mt-0.5">Platform performance metrics from real data.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Presets */}
          <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-0.5 gap-0.5">
            {PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${preset === p.value ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={loadStats} className="bg-gray-900 border border-gray-800 rounded-lg p-2 text-gray-400 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
          <button onClick={loadStats} className="mt-2 text-sm text-red-400 underline">Try again</button>
        </div>
      )}

      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-400">Loading analytics...</span>
        </div>
      ) : stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={IndianRupee} color="text-white" bg="bg-blue-600/10 border-blue-600/20" iconColor="text-blue-400" />
            <KpiCard label="Platform Commission" value={formatCurrency(stats.totalCommission)} icon={BarChart3} color="text-blue-400" bg="bg-blue-600/5 border-blue-600/10" iconColor="text-blue-400" />
            <KpiCard label="Worker Earnings" value={formatCurrency(stats.totalWorkerEarnings)} icon={HardHat} color="text-green-400" bg="bg-green-600/5 border-green-600/10" iconColor="text-green-400" />
            <KpiCard label="Total Refunds" value={formatCurrency(stats.totalRefundAmount)} icon={RotateCcw} color="text-red-400" bg="bg-red-600/5 border-red-600/10" iconColor="text-red-400" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Total Jobs" value={stats.totalJobs} icon={Briefcase} color="text-white" bg="bg-gray-900 border-gray-800" iconColor="text-gray-400" />
            <KpiCard label="Completion Rate" value={`${stats.completionRate}%`} icon={TrendingUp} color="text-green-400" bg="bg-gray-900 border-gray-800" iconColor="text-green-400" />
            <KpiCard label="Total Users" value={stats.totalUsers} icon={Users} color="text-white" bg="bg-gray-900 border-gray-800" iconColor="text-gray-400" />
            <KpiCard label="Pending Payouts" value={`${stats.pendingPayouts} (${formatCurrency(stats.pendingPayoutAmount)})`} icon={IndianRupee} color="text-amber-400" bg="bg-amber-500/5 border-amber-500/20" iconColor="text-amber-400" />
          </div>

          {/* Revenue Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              Revenue Over Time (Last 30 Days)
            </h2>
            {stats.revenueTimeSeries.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No payment data in this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.revenueTimeSeries} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={d => {
                    const [, m, day] = d.split('-');
                    return `${day}/${m}`;
                  }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="commission" name="Commission" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bottom Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Job Status Pie */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                Job Status Distribution
              </h2>
              {jobPieData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No job data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={jobPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={{ stroke: '#4b5563' }}>
                      {jobPieData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Payment Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-500" />
                Payment Summary
              </h2>
              <div className="space-y-3 mt-6">
                {[
                  { label: 'Total Payments', value: stats.totalPayments, color: 'bg-gray-600' },
                  { label: 'Captured', value: stats.capturedPayments, color: 'bg-blue-500' },
                  { label: 'Failed', value: stats.failedPayments, color: 'bg-red-500' },
                  { label: 'Refunded', value: stats.refundedCount, color: 'bg-amber-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-medium">{item.value}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${stats.totalPayments > 0 ? Math.round((item.value / stats.totalPayments) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Workers Summary */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Workers</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{stats.totalWorkers}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total</p>
                  </div>
                  <div className="bg-green-600/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-400">{stats.verifiedWorkers}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, bg, iconColor }: {
  label: string; value: string | number; icon: any;
  color: string; bg: string; iconColor: string;
}) {
  return (
    <div className={`border rounded-xl p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-500">{label}</p>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}
