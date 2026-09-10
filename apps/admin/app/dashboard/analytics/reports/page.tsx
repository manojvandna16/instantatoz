'use client';

import { useState, useCallback } from 'react';
import {
  FileText, Download, Filter, RefreshCw, AlertTriangle,
  IndianRupee, Briefcase, Users, HardHat, RotateCcw, ChevronDown
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/finance-utils';

type ReportType = 'payments' | 'commission' | 'payouts' | 'refunds' | 'jobs';

type DatePreset = 'today' | '7d' | '30d' | 'month' | 'all' | 'custom';

const REPORT_TYPES: { label: string; value: ReportType; icon: any; description: string }[] = [
  { label: 'Payment Report', value: 'payments', icon: IndianRupee, description: 'All payment transactions with status and amounts' },
  { label: 'Commission Report', value: 'commission', icon: Filter, description: 'Platform commission earned per transaction' },
  { label: 'Payout Report', value: 'payouts', icon: HardHat, description: 'Worker payout records and status' },
  { label: 'Refund Report', value: 'refunds', icon: RotateCcw, description: 'All refund records and gateway status' },
  { label: 'Jobs Report', value: 'jobs', icon: Briefcase, description: 'Job completion, cancellation and status summary' },
];

function getDateRange(preset: DatePreset, customFrom?: string, customTo?: string) {
  if (preset === 'all') return {};
  if (preset === 'custom') return { from: customFrom, to: customTo };
  const now = new Date();
  const from = new Date();
  if (preset === 'today') from.setHours(0, 0, 0, 0);
  else if (preset === '7d') { from.setDate(from.getDate() - 7); from.setHours(0, 0, 0, 0); }
  else if (preset === '30d') { from.setDate(from.getDate() - 30); from.setHours(0, 0, 0, 0); }
  else if (preset === 'month') { from.setDate(1); from.setHours(0, 0, 0, 0); }
  return { from: from.toISOString(), to: now.toISOString() };
}

function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
}

function downloadCSV(rows: Record<string, any>[], filename: string) {
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('payments');
  const [preset, setPreset] = useState<DatePreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGenerated(false);

    const { from, to } = getDateRange(preset, customFrom || undefined, customTo || undefined);

    try {
      let data: Record<string, any>[] = [];

      if (reportType === 'payments' || reportType === 'commission') {
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        const res = await fetch(`/api/finance/stats?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        // For payments, fetch raw list
        const pRes = await fetch('/api/finance/payouts?status=ALL&limit=500');
        // Actually fetch from existing payments endpoint logic
        // Use stats time series as report data
        if (reportType === 'commission') {
          data = json.data.revenueTimeSeries.map((r: any) => ({
            Date: r.date,
            'Revenue (₹)': r.revenue,
            'Commission (₹)': r.commission,
            'Worker Earnings (₹)': r.revenue - r.commission,
          }));
        } else {
          data = json.data.revenueTimeSeries.map((r: any) => ({
            Date: r.date,
            'Total Revenue (₹)': r.revenue,
            'Commission (₹)': r.commission,
            'Worker Payable (₹)': r.revenue - r.commission,
          }));
        }
      }

      if (reportType === 'payouts') {
        const res = await fetch('/api/finance/payouts?status=ALL&limit=500');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        data = json.data.map((p: any) => ({
          'Payout ID': p.id,
          'Worker': p.workerName,
          'Worker ID': p.workerId,
          'Payment ID': p.paymentId,
          'Job ID': p.jobId || '—',
          'Gross Amount (₹)': p.grossAmount,
          'Commission (₹)': p.platformCommission,
          'Worker Payable (₹)': p.workerPayable,
          'Status': p.payoutStatus,
          'Method': p.payoutMethod,
          'Reference': p.payoutReference || '—',
          'Created': formatDate(p.createdAt),
          'Paid At': p.paidAt ? formatDate(p.paidAt) : '—',
          'Approved By': p.approvedBy || '—',
        }));
      }

      if (reportType === 'refunds') {
        const res = await fetch('/api/finance/refunds');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        data = json.data.map((r: any) => ({
          'Refund ID': r.id,
          'Razorpay Refund ID': r.razorpayRefundId || '—',
          'Payment ID': r.paymentId,
          'Job ID': r.jobId || '—',
          'Customer': r.customerName,
          'Worker': r.workerName,
          'Original Amount (₹)': r.originalAmount,
          'Refund Amount (₹)': r.refundAmount,
          'Reason': r.reason,
          'Status': r.status,
          'Razorpay Status': r.razorpayStatus,
          'Initiated By': r.initiatedBy,
          'Initiated At': formatDate(r.initiatedAt),
          'Processed At': r.processedAt ? formatDate(r.processedAt) : '—',
        }));
      }

      if (reportType === 'jobs') {
        // Use stats summary
        const params = new URLSearchParams();
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        const res = await fetch(`/api/finance/stats?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        const s = json.data;
        data = [
          { Metric: 'Total Jobs', Value: s.totalJobs },
          { Metric: 'Completed Jobs', Value: s.completedJobs },
          { Metric: 'Cancelled Jobs', Value: s.cancelledJobs },
          { Metric: 'Active Jobs', Value: s.activeJobs },
          { Metric: 'Completion Rate', Value: `${s.completionRate}%` },
          { Metric: 'Total Payments', Value: s.totalPayments },
          { Metric: 'Captured Payments', Value: s.capturedPayments },
          { Metric: 'Failed Payments', Value: s.failedPayments },
          { Metric: 'Total Revenue', Value: formatCurrency(s.totalRevenue) },
          { Metric: 'Platform Commission', Value: formatCurrency(s.totalCommission) },
          { Metric: 'Worker Earnings', Value: formatCurrency(s.totalWorkerEarnings) },
          { Metric: 'Total Refunds', Value: formatCurrency(s.totalRefundAmount) },
          { Metric: 'Total Users', Value: s.totalUsers },
          { Metric: 'Total Workers', Value: s.totalWorkers },
          { Metric: 'Verified Workers', Value: s.verifiedWorkers },
        ];
      }

      setRows(data);
      setGenerated(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [reportType, preset, customFrom, customTo]);

  const currentReport = REPORT_TYPES.find(r => r.value === reportType)!;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Reports</h1>
        <p className="text-sm text-gray-400 mt-0.5">Generate financial and operational reports from real data.</p>
      </div>

      {/* Config Panel */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Configure Report</h2>

        {/* Report Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-5">
          {REPORT_TYPES.map(rt => (
            <button
              key={rt.value}
              onClick={() => { setReportType(rt.value); setGenerated(false); setRows([]); }}
              className={`border rounded-xl p-3 text-left transition-all ${reportType === rt.value ? 'border-blue-500 bg-blue-600/10' : 'border-gray-800 bg-gray-800/30 hover:border-gray-700'}`}
            >
              <rt.icon className={`w-4 h-4 mb-2 ${reportType === rt.value ? 'text-blue-400' : 'text-gray-500'}`} />
              <p className={`text-xs font-medium ${reportType === rt.value ? 'text-white' : 'text-gray-400'}`}>{rt.label}</p>
              <p className="text-xs text-gray-600 mt-0.5 leading-tight">{rt.description}</p>
            </button>
          ))}
        </div>

        {/* Date Range */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Date Range</label>
            <div className="relative">
              <select
                value={preset}
                onChange={e => setPreset(e.target.value as DatePreset)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
                <option value="custom">Custom Range</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {preset === 'custom' && (
            <>
              <div>
                <label className="text-xs text-gray-500 block mb-1">From</label>
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">To</label>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <button
            onClick={generateReport}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg transition-colors"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {generated && !loading && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <currentReport.icon className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">{currentReport.label}</h2>
              <span className="text-xs text-gray-500 ml-2">{rows.length} records</span>
            </div>
            <button
              onClick={() => downloadCSV(rows, `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`)}
              disabled={rows.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No data for selected period</p>
              <p className="text-gray-500 text-sm mt-1">Try a different date range or report type.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-800">
                  <tr className="text-xs text-gray-500 uppercase tracking-wider">
                    {Object.keys(rows[0]).map(col => (
                      <th key={col} className="text-left px-4 py-3 whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {rows.slice(0, 200).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-800/40 transition-colors">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="px-4 py-2.5 text-gray-300 whitespace-nowrap">{val ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 200 && (
                <div className="px-4 py-3 text-xs text-gray-500 text-center border-t border-gray-800">
                  Showing first 200 of {rows.length} records. Export CSV to get all data.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
