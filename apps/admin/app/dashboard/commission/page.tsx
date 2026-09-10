'use client';

import { useEffect, useState } from 'react';
import { Percent, Edit3, History, Calculator, Shield, Check, X, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { formatCurrency, calculateCommission } from '@/lib/finance-utils';
import { useAuth } from '@/lib/auth-context';

interface CommissionConfig {
  id: string | null;
  defaultRate: number;
  minAmount: number | null;
  maxAmount: number | null;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string;
  reason: string;
  history: HistoryEntry[];
}

interface HistoryEntry {
  rate: number;
  updatedAt: string | null;
  updatedBy: string;
  updatedByName: string;
  reason: string;
}

export default function CommissionPage() {
  const { adminUser } = useAuth();
  const [config, setConfig] = useState<CommissionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal
  const [showEdit, setShowEdit] = useState(false);
  const [editRate, setEditRate] = useState('');
  const [editReason, setEditReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Calculator
  const [calcAmount, setCalcAmount] = useState('1000');

  const canEdit = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'FINANCE_ADMIN';

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/finance/commission');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConfig(data.data);
    } catch (e: any) {
      setError(e.message || 'Failed to load commission config');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const rate = parseFloat(editRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setSaveError('Rate must be between 0 and 100');
      return;
    }
    if (!editReason.trim()) {
      setSaveError('Please provide a reason for this change');
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/finance/commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultRate: rate, reason: editReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowEdit(false);
      setEditReason('');
      await loadConfig();
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const gross = parseFloat(calcAmount) || 0;
  const breakdown = config ? calculateCommission(gross, config.defaultRate) : null;

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-white">Commission Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure platform commission rates.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-400 text-sm">Loading commission config...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-white">Commission Management</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error}</p>
          <button onClick={loadConfig} className="mt-3 text-sm text-red-400 underline">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Commission Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure and manage platform commission rates.</p>
        </div>
        {canEdit && (
          <button
            onClick={() => { setEditRate(String(config?.defaultRate ?? 10)); setEditReason(''); setSaveError(null); setShowEdit(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Commission
          </button>
        )}
      </div>

      {!canEdit && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <p className="text-sm text-amber-400">You have read-only access to commission settings.</p>
        </div>
      )}

      {/* Current Config Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Percent className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Current Configuration</h2>
          <span className="ml-auto bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Active</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Platform Commission</p>
            <p className="text-4xl font-bold text-blue-400">{config?.defaultRate}%</p>
            <p className="text-xs text-gray-500 mt-1">of gross job amount</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Worker Receives</p>
            <p className="text-4xl font-bold text-green-400">{100 - (config?.defaultRate ?? 10)}%</p>
            <p className="text-xs text-gray-500 mt-1">of gross job amount</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Last Updated</p>
            <p className="text-sm text-white mt-1">{formatDate(config?.updatedAt)}</p>
            <p className="text-xs text-gray-500 mt-0.5">by {config?.updatedByName || '—'}</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Last Change Reason</p>
            <p className="text-sm text-white mt-1">{config?.reason || '—'}</p>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Commission Preview Calculator</h2>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Job Amount (₹)</label>
            <input
              type="number"
              value={calcAmount}
              onChange={e => setCalcAmount(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm w-40 focus:outline-none focus:border-blue-500"
              placeholder="1000"
              min="0"
            />
          </div>
          <div className="text-gray-500 text-sm pb-2">at {config?.defaultRate}% commission →</div>
        </div>

        {breakdown && gross > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Customer Pays</p>
              <p className="text-xl font-bold text-white">{formatCurrency(gross)}</p>
            </div>
            <div className="bg-blue-600/5 border border-blue-600/20 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Platform Commission</p>
              <p className="text-xl font-bold text-blue-400">{formatCurrency(breakdown.platformCommission)}</p>
              <p className="text-xs text-gray-600 mt-0.5">{config?.defaultRate}%</p>
            </div>
            <div className="bg-green-600/5 border border-green-600/20 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Worker Receives</p>
              <p className="text-xl font-bold text-green-400">{formatCurrency(breakdown.workerPayable)}</p>
              <p className="text-xs text-gray-600 mt-0.5">{100 - (config?.defaultRate ?? 10)}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Commission History */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Change History</h2>
          <span className="ml-auto text-xs text-gray-500">{config?.history?.length || 0} entries</span>
        </div>

        {!config?.history?.length ? (
          <p className="text-gray-500 text-sm text-center py-6">No commission changes recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {[...config.history].reverse().map((h, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-4 py-3 text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold text-base">{h.rate}%</span>
                  <div>
                    <p className="text-gray-300">{h.reason}</p>
                    <p className="text-gray-500 text-xs mt-0.5">by {h.updatedByName}</p>
                  </div>
                </div>
                <span className="text-gray-500 text-xs whitespace-nowrap">{formatDate(h.updatedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Update Commission Rate</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-5">
              <p className="text-xs text-amber-400">⚠️ This change will only apply to <strong>new</strong> transactions. Historical payments remain unchanged.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">New Commission Rate (%)</label>
                <input
                  type="number"
                  value={editRate}
                  onChange={e => setEditRate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  min="0" max="100" step="0.5"
                  placeholder="e.g. 10"
                />
                {parseFloat(editRate) >= 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Worker will receive {100 - parseFloat(editRate)}% → {formatCurrency((1000 * (100 - parseFloat(editRate))) / 100)} per ₹1,000 job
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Reason for Change *</label>
                <textarea
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="e.g. Revised to be competitive with market rates..."
                />
              </div>

              {saveError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-red-400">{saveError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEdit(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
