'use client';

import { useEffect, useState } from 'react';
import {
  ServerCrash, CheckCircle2, AlertTriangle, XCircle,
  Database, Key, Flame, CreditCard, RefreshCw, 
  Smartphone, Bug, Terminal, Activity
} from 'lucide-react';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, getDocs, limit, query, onSnapshot, orderBy } from 'firebase/firestore';
import { formatDate } from '@/lib/date-utils';

interface ServiceStatus {
  name: string;
  status: 'checking' | 'healthy' | 'degraded' | 'down';
  latencyMs?: number;
  detail?: string;
  icon: any;
}

interface AppError {
  id: string;
  userId: string;
  errorMessage: string;
  stackTrace?: string;
  os: string;
  appVersion: string;
  deviceModel: string;
  type: string;
  metadata?: any;
  timestamp: any;
  resolved: boolean;
}

const STATUS_COLORS = {
  checking: 'text-gray-400',
  healthy: 'text-green-400',
  degraded: 'text-amber-400',
  down: 'text-red-400',
};
const STATUS_BG = {
  checking: 'bg-gray-500/10 border-gray-500/20',
  healthy: 'bg-green-500/10 border-green-500/20',
  degraded: 'bg-amber-500/10 border-amber-500/20',
  down: 'bg-red-500/10 border-red-500/20',
};
const STATUS_ICONS = {
  checking: RefreshCw,
  healthy: CheckCircle2,
  degraded: AlertTriangle,
  down: XCircle,
};

export default function SystemHealthPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Firestore Database', status: 'checking', icon: Database },
    { name: 'Razorpay Gateway', status: 'checking', icon: CreditCard },
    { name: 'Firebase Auth', status: 'checking', icon: Flame },
    { name: 'Admin Session', status: 'checking', icon: Key },
  ]);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  // Telemetry States
  const [appErrors, setAppErrors] = useState<AppError[]>([]);
  const [selectedError, setSelectedError] = useState<AppError | null>(null);

  async function runHealthChecks() {
    setChecking(true);

    const update = (name: string, updates: Partial<ServiceStatus>) => {
      setServices(prev => prev.map(s => s.name === name ? { ...s, ...updates } : s));
    };

    // 1. Firestore
    try {
      const t0 = performance.now();
      const db = getFirebaseDb();
      await getDocs(query(collection(db, 'categories'), limit(1)));
      const ms = Math.round(performance.now() - t0);
      update('Firestore Database', {
        status: ms < 2000 ? 'healthy' : 'degraded',
        latencyMs: ms,
        detail: ms < 2000 ? `Connected · ${ms}ms` : `Slow response · ${ms}ms`,
      });
    } catch (e: any) {
      update('Firestore Database', { status: 'down', detail: e.message?.slice(0, 60) });
    }

    // 2. Razorpay
    try {
      const t0 = performance.now();
      const res = await fetch('/api/health/razorpay', { cache: 'no-store' });
      const ms = Math.round(performance.now() - t0);
      if (res.ok) {
        update('Razorpay Gateway', { status: 'healthy', latencyMs: ms, detail: `Connected · ${ms}ms` });
      } else {
        update('Razorpay Gateway', { status: 'degraded', detail: `HTTP ${res.status}` });
      }
    } catch {
      update('Razorpay Gateway', { status: 'degraded', detail: 'Health check not configured' });
    }

    // 3. Firebase Auth
    update('Firebase Auth', { status: 'healthy', detail: 'SDK Initialized' });

    // 4. Admin Session
    try {
      const t0 = performance.now();
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const ms = Math.round(performance.now() - t0);
      if (res.ok) {
        update('Admin Session', { status: 'healthy', latencyMs: ms, detail: `Session active · ${ms}ms` });
      } else {
        update('Admin Session', { status: 'degraded', detail: `Invalid session: HTTP ${res.status}` });
      }
    } catch {
      update('Admin Session', { status: 'down', detail: 'Could not verify session' });
    }

    setLastChecked(new Date());
    setChecking(false);
  }

  useEffect(() => { 
    runHealthChecks(); 
    
    // Telemetry Listener
    const db = getFirebaseDb();
    const q = query(collection(db, 'app_errors'), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(q, snap => {
      setAppErrors(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppError)));
    });
    return unsub;
  }, []);

  const allHealthy = services.every(s => s.status === 'healthy');
  const anyDown = services.some(s => s.status === 'down');
  const anyDegraded = services.some(s => s.status === 'degraded');

  const overallStatus = anyDown ? 'down' : anyDegraded ? 'degraded' : allHealthy ? 'healthy' : 'checking';
  const overallLabels = { healthy: 'All Systems Operational', degraded: 'Partial Degradation', down: 'Outage Detected', checking: 'Checking...' };

  return (
    <div className="space-y-5 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">System Health & Telemetry</h1>
          <p className="text-sm text-gray-400 mt-0.5">Real-time status of backend services and mobile app crashes.</p>
        </div>
        <button onClick={runHealthChecks} disabled={checking}
          className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : 'Re-check Now'}
        </button>
      </div>

      {/* Backend Infrastructure Health */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Backend Infrastructure</h2>
        <div className={`border rounded-xl p-5 mb-3 flex items-center gap-4 ${STATUS_BG[overallStatus]}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${overallStatus === 'healthy' ? 'bg-green-500/20' : overallStatus === 'down' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
            {overallStatus === 'healthy' ? <CheckCircle2 className="w-6 h-6 text-green-400" /> :
            overallStatus === 'down' ? <XCircle className="w-6 h-6 text-red-400" /> :
            <AlertTriangle className="w-6 h-6 text-amber-400" />}
          </div>
          <div>
            <p className={`font-bold text-lg ${STATUS_COLORS[overallStatus]}`}>{overallLabels[overallStatus]}</p>
            {lastChecked && <p className="text-xs text-gray-500">Last checked: {lastChecked.toLocaleTimeString()}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {services.map(svc => {
            const StatusIcon = STATUS_ICONS[svc.status];
            return (
              <div key={svc.name} className={`border rounded-xl p-4 transition-all ${STATUS_BG[svc.status]}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-800/60 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svc.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">{svc.name}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 truncate pr-2" title={svc.detail}>{svc.detail || 'Checking...'}</p>
                  <div className="flex items-center gap-1">
                    <StatusIcon className={`w-3.5 h-3.5 ${STATUS_COLORS[svc.status]} ${svc.status === 'checking' ? 'animate-spin' : ''}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile App Telemetry (New Section) */}
      <div className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Live Mobile App Telemetry</h2>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800 bg-gray-950/50">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Time</th>
                  <th className="text-left px-4 py-3">Device & OS</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Error Message</th>
                  <th className="text-left px-4 py-3">User ID</th>
                  <th className="text-left px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {appErrors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500/50 mx-auto mb-2" />
                      <p className="text-gray-500">No mobile app errors logged recently.</p>
                    </td>
                  </tr>
                ) : (
                  appErrors.map(err => (
                    <tr key={err.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(err.timestamp)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-300 text-xs">{err.os} {err.appVersion}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          err.type === 'NETWORK' ? 'bg-orange-500/20 text-orange-400' : 
                          err.type === 'CRASH' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {err.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs max-w-[250px] truncate" title={err.errorMessage}>
                        {err.errorMessage}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {err.userId.slice(0, 10)}...
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedError(err)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          <Terminal className="w-3 h-3" /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedError(null)} />
          <div className="relative w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-bold text-white">Error Inspector</h2>
              </div>
              <button onClick={() => setSelectedError(null)} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-5">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Message</p>
                <p className="text-red-400 font-mono text-sm break-all">{selectedError.errorMessage}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-white font-medium text-sm mt-0.5">{selectedError.type}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                  <p className="text-xs text-gray-500">OS</p>
                  <p className="text-white font-medium text-sm mt-0.5">{selectedError.os}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                  <p className="text-xs text-gray-500">App Version</p>
                  <p className="text-white font-medium text-sm mt-0.5">{selectedError.appVersion}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-white font-medium text-sm mt-0.5">{formatDate(selectedError.timestamp)}</p>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">User ID</p>
                <p className="text-blue-400 font-mono text-sm">{selectedError.userId}</p>
              </div>

              {selectedError.stackTrace && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Stack Trace</p>
                  <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300 font-mono leading-relaxed">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                </div>
              )}

              {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Context Metadata</p>
                  <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono">
                      {JSON.stringify(selectedError.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
