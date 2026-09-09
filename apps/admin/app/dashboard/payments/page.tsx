'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Search, CreditCard, TrendingUp, TrendingDown, X, FileText, Smartphone, Building, ShieldCheck, Calendar, IndianRupee } from 'lucide-react';
import type { Payment } from '@/types';
import { clsx } from 'clsx';

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  CREATED: 'bg-gray-500/20 text-gray-400',
  PENDING: 'bg-amber-500/20 text-amber-400',
  AUTHORIZED: 'bg-blue-500/20 text-blue-400',
  CAPTURED: 'bg-green-500/20 text-green-400',
  FAILED: 'bg-red-500/20 text-red-400',
  CANCELLED: 'bg-red-600/20 text-red-500',
  REFUNDED: 'bg-pink-500/20 text-pink-400',
  PARTIALLY_REFUNDED: 'bg-orange-500/20 text-orange-400',
  DISPUTED: 'bg-orange-600/20 text-orange-500',
};

// Robust date formatter
function formatPaymentDate(val: any): string {
  if (!val) return 'Date unavailable';
  try {
    // Firestore Timestamp
    if (typeof val.toDate === 'function') {
      return val.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    // Firestore Timestamp object (no toDate)
    if (val.seconds) {
      return new Date(val.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    // Standard Date or timestamp number
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'Date unavailable';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return 'Date unavailable';
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Detail Modal State
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rzpDetails, setRzpDetails] = useState<any>(null);
  const [rzpLoading, setRzpLoading] = useState(false);
  const [rzpError, setRzpError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = payments.filter(p => {
    const matchSearch = !search || p.id.includes(search) || p.gatewayTransactionId?.includes(search);
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Finance Totals should exclude mock payments (those starting with 'mock_')
  const isMock = (p: Payment) => p.id?.startsWith('mock_') || p.gatewayTransactionId?.startsWith('mock_');
  const realPayments = payments.filter(p => !isMock(p));

  const totalRevenue = realPayments.filter(p => p.status === 'CAPTURED').reduce((s, p) => s + (p.grossAmount || 0), 0);
  const totalCommission = realPayments.filter(p => p.status === 'CAPTURED').reduce((s, p) => s + (p.platformCommission || 0), 0);
  const totalRefunded = realPayments.filter(p => ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(p.status)).reduce((s, p) => s + (p.refundAmount || 0), 0);

  const openPaymentDetails = async (payment: Payment) => {
    setSelectedPayment(payment);
    setRzpDetails(null);
    setRzpError(null);

    // Don't fetch for mock payments
    if (isMock(payment)) {
      return;
    }

    setRzpLoading(true);
    try {
      const txId = payment.gatewayTransactionId || payment.id;
      const res = await fetch(`/api/payments/razorpay/${txId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch Razorpay details');
      }

      setRzpDetails(data.data);
    } catch (err: any) {
      setRzpError(err.message);
    } finally {
      setRzpLoading(false);
    }
  };

  return (
    <div className="space-y-5 relative">
      <div>
        <h1 className="text-xl font-bold text-white">Payments</h1>
        <p className="text-sm text-gray-400 mt-0.5">{payments.length} transactions ({realPayments.length} real)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-green-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Total Revenue</p>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-1">{realPayments.filter(p => p.status === 'CAPTURED').length} real successful payments</p>
        </div>
        <div className="bg-gray-900 border border-blue-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Platform Commission</p>
            <CreditCard className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">₹{totalCommission.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-1">Net platform earnings</p>
        </div>
        <div className="bg-gray-900 border border-red-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Total Refunded</p>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">₹{totalRefunded.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-1">{realPayments.filter(p => ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(p.status)).length} refunds</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search payment ID, transaction ID..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="ALL">All Status</option>
          {Object.keys(PAYMENT_STATUS_STYLES).map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Payment ID', 'Job ID', 'Amount', 'Commission', 'Worker Payable', 'Gateway', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No payments found.</td></tr>
              ) : filtered.map(p => (
                <tr 
                  key={p.id} 
                  onClick={() => openPaymentDetails(p)}
                  className="hover:bg-gray-800/60 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 flex items-center gap-2">
                    {p.id.slice(0, 10)}...
                    {isMock(p) && <span className="bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded text-[10px]">MOCK</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.jobId?.slice(0, 10)}...</td>
                  <td className="px-4 py-3 font-semibold text-white">₹{p.grossAmount?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-blue-400">₹{p.platformCommission?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-green-400">₹{p.workerPayable?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{p.gatewayName || 'RAZORPAY'}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', PAYMENT_STATUS_STYLES[p.status] || 'bg-gray-500/20 text-gray-400')}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {formatPaymentDate(p.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Modal Sidebar */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-900 border-l border-gray-800 h-full overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800 sticky top-0 bg-gray-900/90 backdrop-blur z-10">
              <div>
                <h2 className="text-lg font-bold text-white">Payment Details</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedPayment.gatewayTransactionId || selectedPayment.id}</p>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              
              {/* Status Banner */}
              {isMock(selectedPayment) && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-orange-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-orange-400">DEMO / MOCK PAYMENT</h4>
                    <p className="text-xs text-orange-400/80 mt-1">This is test data. Razorpay transaction details are not available for mock payments.</p>
                  </div>
                </div>
              )}

              {/* Internal Database Information */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Internal Payment Data
                </h3>
                <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Internal ID</p>
                    <p className="text-sm text-gray-300 font-mono mt-0.5">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Job ID</p>
                    <p className="text-sm text-gray-300 font-mono mt-0.5">{selectedPayment.jobId || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-bold text-white mt-0.5">₹{(selectedPayment.grossAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <div className="mt-1">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', PAYMENT_STATUS_STYLES[selectedPayment.status] || 'bg-gray-500/20 text-gray-400')}>
                        {selectedPayment.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Platform Commission</p>
                    <p className="text-sm text-blue-400 mt-0.5">₹{(selectedPayment.platformCommission || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Worker Payable</p>
                    <p className="text-sm text-green-400 mt-0.5">₹{(selectedPayment.workerPayable || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Payment Date</p>
                    <p className="text-sm text-gray-300 mt-0.5">{formatPaymentDate(selectedPayment.createdAt)}</p>
                  </div>
                </div>
              </section>

              {/* Razorpay Transaction Details */}
              {!isMock(selectedPayment) && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Razorpay Transaction Details
                  </h3>
                  
                  {rzpLoading ? (
                    <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-sm text-gray-400">Loading secure Razorpay details...</p>
                    </div>
                  ) : rzpError ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                      <p className="text-sm text-red-400">{rzpError}</p>
                    </div>
                  ) : rzpDetails ? (
                    <div className="space-y-4">
                      
                      {/* Gateway Overview */}
                      <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Gateway Status</p>
                          <p className="text-sm text-gray-300 font-medium capitalize mt-0.5">{rzpDetails.status || 'Not available'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment Method</p>
                          <p className="text-sm text-gray-300 font-medium capitalize mt-0.5">{rzpDetails.method || 'Not available'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Order ID</p>
                          <p className="text-sm text-gray-300 font-mono mt-0.5">{rzpDetails.order_id || 'Not available'}</p>
                        </div>
                      </div>

                      {/* Payment Method Specific (UPI) */}
                      {rzpDetails.method === 'upi' && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 grid grid-cols-1 gap-4">
                          <h4 className="text-xs font-semibold text-blue-400 uppercase flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5"/> UPI Details</h4>
                          <div>
                            <p className="text-xs text-gray-500">UPI ID / VPA</p>
                            <p className="text-sm text-gray-300 mt-0.5">{rzpDetails.vpa || 'Not available from Razorpay'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">UPI Transaction ID / RRN</p>
                            <p className="text-sm text-gray-300 font-mono mt-0.5">{rzpDetails.acquirer_data?.rrn || 'Not available'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Bank Transaction ID</p>
                            <p className="text-sm text-gray-300 font-mono mt-0.5">{rzpDetails.acquirer_data?.bank_transaction_id || 'Not available'}</p>
                          </div>
                        </div>
                      )}

                      {/* Gateway Charges */}
                      <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 grid grid-cols-2 gap-4">
                        <div className="col-span-2 border-b border-gray-800 pb-2 mb-1">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1.5"><Building className="w-3.5 h-3.5"/> Gateway Charges</h4>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Razorpay Fee</p>
                          <p className="text-sm text-gray-300 mt-0.5">
                            {rzpDetails.fee ? `₹${(rzpDetails.fee / 100).toLocaleString('en-IN')}` : 'Not available'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">GST / Tax</p>
                          <p className="text-sm text-gray-300 mt-0.5">
                            {rzpDetails.tax ? `₹${(rzpDetails.tax / 100).toLocaleString('en-IN')}` : 'Not available'}
                          </p>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 grid grid-cols-1 gap-4">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Timeline</h4>
                        <div>
                          <p className="text-xs text-gray-500">Created At (Razorpay)</p>
                          <p className="text-sm text-gray-300 mt-0.5">
                            {rzpDetails.created_at ? new Date(rzpDetails.created_at * 1000).toLocaleString('en-IN') : 'Not available'}
                          </p>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-8 text-center">
                      <p className="text-sm text-gray-500">No details fetched.</p>
                    </div>
                  )}
                </section>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
