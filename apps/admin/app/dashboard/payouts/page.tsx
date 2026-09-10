'use client';

import { useEffect, useState } from 'react';
import {
  Wallet, Search, Filter, ChevronDown, X, AlertTriangle,
  CheckCircle2, Clock, XCircle, RefreshCw, ArrowRight, IndianRupee
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency, PAYOUT_STATUS_STYLES } from '@/lib/finance-utils';
import { useAuth } from '@/lib/auth-context';

interface Payout {
  id: string;
  workerId: string;
  workerName: string;
  jobId: string | null;
  paymentId: string;
  grossAmount: number;
  platformCommission: number;
  workerPayable: number;
  payoutStatus: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'FAILED';
  payoutMethod: string;
  payoutReference: string | null;
  notes: string | null;
  createdAt: string | null;
  paidAt: string | null;
  approvedBy: string | null;
}

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  PROCESSING: RefreshCw,
  PAID: CheckCircle2,
  FAILED: XCircle,
};

const TRANSITIONS: Record<string, { label: string; color: string; next: string }[]> = {
  PENDING: [
    { label: 'Approve', color: 'bg-blue-600 hover:bg-blue-700', next: 'APPROVED' },
    { label: 'Reject', color: 'bg-red-600 hover:bg-red-700', next: 'FAILED' },
  ],
  APPROVED: [
    { label: 'Mark Processing', color: 'bg-purple-600 hover:bg-purple-700', next: 'PROCESSING' },
    { label: 'Mark Failed', color: 'bg-red-600 hover:bg-red-700', next: 'FAILED' },
  ],
  PROCESSING: [
    { label: 'Mark Paid', color: 'bg-green-600 hover:bg-green-700', next: 'PAID' },
    { label: 'Mark Failed', color: 'bg-red-600 hover:bg-red-700', next: 'FAILED' },
  ],
  PAID: [],
  FAILED: [
    { label: 'Retry (Reset to Pending)', color: 'bg-amber-600 hover:bg-amber-700', next: 'PENDING' },
  ],
};

export default function PayoutsPage() {
  const { adminUser } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Payout | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  const canManage = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'FINANCE_ADMIN';

  useEffect(() => { loadPayouts(); }, [statusFilter]);

  async function loadPayouts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/finance/payouts?status=${statusFilter}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPayouts(data.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(payoutId: string, newStatus: string) {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/finance/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus, payoutReference: payoutRef || null, notes: payoutNotes || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelected(null);
      setPayoutRef('');
      setPayoutNotes('');
      await loadPayouts();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = payouts.filter(p => {
    const q = search.toLowerCase();
    return !q || p.workerName?.toLowerCase().includes(q) || p.paymentId?.toLowerCase().includes(q) || p.jobId?.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  // Summary stats
  const allReal = payouts;
  const totalEarned = allReal.reduce((s, p) => s + (p.workerPayable || 0), 0);
  const pendingAmt = allReal.filter(p => p.payoutStatus === 'PENDING').reduce((s, p) => s + (p.workerPayable || 0), 0);
  const paidAmt = allReal.filter(p => p.payoutStatus === 'PAID').reduce((s, p) => s + (p.workerPayable || 0), 0);

  const summaryCards = [
    { label: 'Total Worker Earnings', value: formatCurrency(totalEarned), color: 'text-white', bg: 'bg-gray-800/50' },
    { label: 'Pending Payouts', value: `${allReal.filter(p => p.payoutStatus === 'PENDING').length} (${formatCurrency(pendingAmt)})`, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/10' },
    { label: 'Paid Out', value: `${allReal.filter(p => p.payoutStatus === 'PAID').length} (${formatCurrency(paidAmt)})`, color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/10' },
    { label: 'Failed', value: allReal.filter(p => p.payoutStatus === 'FAILED').length, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/10' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Worker Payouts</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage and track earnings payouts to service workers.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map(c => (
          <div key={c.label} className={`${c.bg} border border-gray-800 rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{String(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Note about payout system */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Wallet className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-300 font-medium">Manual Payout Workflow</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Payouts follow a manual approval workflow: <span className="text-amber-400">Pending</span> → <span className="text-blue-400">Approved</span> → <span className="text-purple-400">Processing</span> → <span className="text-green-400">Paid</span>.
            Bank/UPI transfer is done externally. Mark "Paid" only after confirming the transfer is complete.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search worker, payment ID, job ID..."
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
            {['ALL', 'PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED'].map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
        <button onClick={loadPayouts} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-400 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-400 text-sm">Loading payouts...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error}</p>
          <button onClick={loadPayouts} className="mt-3 text-sm text-red-400 underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No payouts found</p>
          <p className="text-gray-500 text-sm mt-1">Payouts are created automatically when jobs are completed and payments are captured.</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Worker</th>
                  <th className="text-left px-4 py-3">Payment ID</th>
                  <th className="text-right px-4 py-3">Gross</th>
                  <th className="text-right px-4 py-3">Commission</th>
                  <th className="text-right px-4 py-3">Payable</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(p => {
                  const Icon = STATUS_ICONS[p.payoutStatus] || Clock;
                  const style = PAYOUT_STATUS_STYLES[p.payoutStatus] || 'bg-gray-500/20 text-gray-400';
                  return (
                    <tr key={p.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{p.workerName}</p>
                        <p className="text-gray-500 text-xs">{p.workerId?.slice(0, 8)}...</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.paymentId}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(p.grossAmount)}</td>
                      <td className="px-4 py-3 text-right text-blue-400">{formatCurrency(p.platformCommission)}</td>
                      <td className="px-4 py-3 text-right text-green-400 font-semibold">{formatCurrency(p.workerPayable)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
                          <Icon className="w-3 h-3" />
                          {p.payoutStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(p.createdAt, false)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => { setSelected(p); setActionError(null); setPayoutRef(''); setPayoutNotes(''); }}
                          className="text-xs text-blue-400 hover:text-blue-300 underline whitespace-nowrap"
                        >
                          View Details
                        </button>
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
                <h2 className="text-lg font-bold text-white">Payout Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Worker Info */}
              <Section title="Worker Information">
                <Row label="Name" value={selected.workerName} />
                <Row label="Worker ID" value={selected.workerId} mono />
                <Row label="Payout Method" value={selected.payoutMethod || 'MANUAL'} />
                {selected.payoutReference && <Row label="Reference/UTR" value={selected.payoutReference} mono />}
              </Section>

              {/* Financial Breakdown */}
              <Section title="Financial Breakdown">
                <Row label="Customer Paid" value={formatCurrency(selected.grossAmount)} />
                <Row label="Platform Commission" value={formatCurrency(selected.platformCommission)} valueClass="text-blue-400" />
                <Row label="Worker Payable" value={formatCurrency(selected.workerPayable)} valueClass="text-green-400 font-bold" />
              </Section>

              {/* Payout Status */}
              <Section title="Payout Information">
                <Row label="Payout ID" value={selected.id} mono />
                <Row label="Payment ID" value={selected.paymentId} mono />
                {selected.jobId && <Row label="Job ID" value={selected.jobId} mono />}
                <Row label="Status" value={selected.payoutStatus} valueClass={PAYOUT_STATUS_STYLES[selected.payoutStatus]?.includes('green') ? 'text-green-400' : PAYOUT_STATUS_STYLES[selected.payoutStatus]?.includes('amber') ? 'text-amber-400' : 'text-blue-400'} />
                <Row label="Created" value={formatDate(selected.createdAt)} />
                {selected.paidAt && <Row label="Paid At" value={formatDate(selected.paidAt)} />}
                {selected.approvedBy && <Row label="Approved By" value={selected.approvedBy} />}
                {selected.notes && <Row label="Notes" value={selected.notes} />}
              </Section>

              {/* Actions */}
              {canManage && TRANSITIONS[selected.payoutStatus]?.length > 0 && (
                <div className="border border-gray-800 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-300">Update Status</p>

                  {(selected.payoutStatus === 'APPROVED' || selected.payoutStatus === 'PROCESSING') && (
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Payment Reference / UTR (optional)</label>
                      <input
                        type="text"
                        value={payoutRef}
                        onChange={e => setPayoutRef(e.target.value)}
                        placeholder="e.g. UTR12345678"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      value={payoutNotes}
                      onChange={e => setPayoutNotes(e.target.value)}
                      placeholder="Internal notes..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {actionError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      <p className="text-sm text-red-400">{actionError}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {TRANSITIONS[selected.payoutStatus].map(t => (
                      <button
                        key={t.next}
                        onClick={() => handleStatusChange(selected.id, t.next)}
                        disabled={actionLoading}
                        className={`flex-1 ${t.color} text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                      >
                        {actionLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selected.payoutStatus === 'PAID' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-green-400 font-medium">Payout Completed</p>
                  {selected.paidAt && <p className="text-xs text-gray-500 mt-1">Paid on {formatDate(selected.paidAt)}</p>}
                </div>
              )}
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
