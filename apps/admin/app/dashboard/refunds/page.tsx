'use client';

import { useEffect, useState } from 'react';
import {
  RotateCcw, Search, Filter, ChevronDown, X, AlertTriangle,
  CheckCircle2, Clock, XCircle, RefreshCw, IndianRupee, Shield
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency, REFUND_STATUS_STYLES } from '@/lib/finance-utils';
import { useAuth } from '@/lib/auth-context';

interface Refund {
  id: string;
  razorpayRefundId: string | null;
  paymentId: string;
  jobId: string | null;
  customerId: string | null;
  customerName: string;
  workerId: string | null;
  workerName: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  razorpayStatus: string;
  initiatedBy: string;
  initiatedAt: string | null;
  processedAt: string | null;
  failureReason: string | null;
}

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock,
  PROCESSING: RefreshCw,
  PROCESSED: CheckCircle2,
  FAILED: XCircle,
};

export default function RefundsPage() {
  const { adminUser } = useAuth();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Refund | null>(null);
  const [showInitiate, setShowInitiate] = useState(false);

  // For initiating refund
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [refundAmountInput, setRefundAmountInput] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);

  const canManage = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'FINANCE_ADMIN';

  useEffect(() => { loadRefunds(); }, []);

  async function loadRefunds() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/finance/refunds');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRefunds(data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleInitiateRefund() {
    const amount = parseFloat(refundAmountInput);
    if (!selectedPaymentId) { setRefundError('Payment ID is required'); return; }
    if (!amount || amount <= 0) { setRefundError('Enter a valid refund amount'); return; }
    if (!refundReason.trim()) { setRefundError('Reason is required'); return; }

    setRefundLoading(true);
    setRefundError(null);
    try {
      const res = await fetch('/api/finance/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPaymentId,
          refundAmount: amount,
          originalAmount: amount, // Will be overridden by safety check
          reason: refundReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowInitiate(false);
      setSelectedPaymentId('');
      setRefundAmountInput('');
      setRefundReason('');
      await loadRefunds();
    } catch (e: any) {
      setRefundError(e.message);
    } finally {
      setRefundLoading(false);
    }
  }

  const filtered = refunds.filter(r => {
    const q = search.toLowerCase();
    const statusOk = statusFilter === 'ALL' || r.status === statusFilter;
    const searchOk = !q || r.customerName?.toLowerCase().includes(q) || r.paymentId?.toLowerCase().includes(q) || r.reason?.toLowerCase().includes(q);
    return statusOk && searchOk;
  });

  const totalRefunded = refunds.filter(r => r.status === 'PROCESSED').reduce((s, r) => s + r.refundAmount, 0);
  const pendingRefunds = refunds.filter(r => r.status === 'PENDING').length;
  const processedRefunds = refunds.filter(r => r.status === 'PROCESSED').length;
  const failedRefunds = refunds.filter(r => r.status === 'FAILED').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Refund Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Review and process customer refund requests via Razorpay.</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setShowInitiate(true); setRefundError(null); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Initiate Refund
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Refunded</p>
          <p className="text-lg font-bold text-white">{formatCurrency(totalRefunded)}</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Pending</p>
          <p className="text-lg font-bold text-amber-400">{pendingRefunds}</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Processed</p>
          <p className="text-lg font-bold text-green-400">{processedRefunds}</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Failed</p>
          <p className="text-lg font-bold text-red-400">{failedRefunds}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search customer, payment ID, reason..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-8 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
          >
            {['ALL', 'PENDING', 'PROCESSING', 'PROCESSED', 'FAILED'].map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        <button onClick={loadRefunds} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-400 hover:text-white">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-400 text-sm">Loading refunds...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error}</p>
          <button onClick={loadRefunds} className="mt-3 text-sm text-red-400 underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <RotateCcw className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No refunds found</p>
          <p className="text-gray-500 text-sm mt-1">Refund records will appear here after being initiated.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Payment ID</th>
                  <th className="text-right px-4 py-3">Original</th>
                  <th className="text-right px-4 py-3">Refunded</th>
                  <th className="text-left px-4 py-3">Reason</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-center px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(r => {
                  const Icon = STATUS_ICONS[r.status] || Clock;
                  const style = REFUND_STATUS_STYLES[r.status] || 'bg-gray-500/20 text-gray-400';
                  return (
                    <tr key={r.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white">{r.customerName}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.paymentId}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(r.originalAmount)}</td>
                      <td className="px-4 py-3 text-right text-red-400 font-semibold">-{formatCurrency(r.refundAmount)}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[150px] truncate">{r.reason}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
                          <Icon className="w-3 h-3" />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(r.initiatedAt, false)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setSelected(r)} className="text-xs text-blue-400 hover:text-blue-300 underline">View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelected(null)} />
          <div className="w-full max-w-lg bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Refund Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
              </div>

              <Section title="Original Payment">
                <Row label="Payment ID" value={selected.paymentId} mono />
                <Row label="Original Amount" value={formatCurrency(selected.originalAmount)} />
                <Row label="Date" value={formatDate(selected.initiatedAt)} />
              </Section>

              <Section title="Refund">
                <Row label="Refund ID" value={selected.id} mono />
                {selected.razorpayRefundId && <Row label="Razorpay Refund ID" value={selected.razorpayRefundId} mono />}
                <Row label="Refund Amount" value={formatCurrency(selected.refundAmount)} valueClass="text-red-400 font-bold" />
                <Row label="Reason" value={selected.reason} />
                <Row label="Status" value={selected.status} />
                <Row label="Razorpay Status" value={selected.razorpayStatus} />
                <Row label="Initiated By" value={selected.initiatedBy} />
                <Row label="Initiated At" value={formatDate(selected.initiatedAt)} />
                {selected.processedAt && <Row label="Processed At" value={formatDate(selected.processedAt)} />}
                {selected.failureReason && <Row label="Failure Reason" value={selected.failureReason} valueClass="text-red-400" />}
              </Section>

              <Section title="Customer / Job">
                <Row label="Customer" value={selected.customerName} />
                {selected.jobId && <Row label="Job ID" value={selected.jobId} mono />}
                {selected.workerName && <Row label="Worker" value={selected.workerName} />}
              </Section>

              <Section title="Financial Impact">
                <Row label="Original Payment" value={formatCurrency(selected.originalAmount)} />
                <Row label="Refund Amount" value={`-${formatCurrency(selected.refundAmount)}`} valueClass="text-red-400" />
                <Row label="Net" value={formatCurrency(selected.originalAmount - selected.refundAmount)} valueClass="text-white font-bold" />
              </Section>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Refund Modal */}
      {showInitiate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Initiate Refund</h3>
              <button onClick={() => setShowInitiate(false)} className="text-gray-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-5">
              <p className="text-xs text-amber-400">⚠️ This will initiate a real Razorpay refund. The customer's account will be credited. This action cannot be undone.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Razorpay Payment ID *</label>
                <input
                  type="text"
                  value={selectedPaymentId}
                  onChange={e => setSelectedPaymentId(e.target.value)}
                  placeholder="pay_XXXXXXXXXXXX"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Refund Amount (₹) *</label>
                <input
                  type="number"
                  value={refundAmountInput}
                  onChange={e => setRefundAmountInput(e.target.value)}
                  placeholder="e.g. 150"
                  min="1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Reason for Refund *</label>
                <textarea
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Customer requested cancellation before job start..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {refundError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-red-400">{refundError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowInitiate(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleInitiateRefund}
                  disabled={refundLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {refundLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  {refundLoading ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false, valueClass = '' }: { label: string; value: string | number | null; mono?: boolean; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} ${valueClass || 'text-white'} text-right max-w-[60%] break-all`}>{value ?? '—'}</span>
    </div>
  );
}
