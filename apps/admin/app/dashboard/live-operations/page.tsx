'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Zap, Search, HardHat, Briefcase, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import type { Job, Worker } from '@/types';
import { clsx } from 'clsx';

export default function LiveOperationsPage() {
  const [searchingJobs, setSearchingJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [onlineWorkers, setOnlineWorkers] = useState<Worker[]>([]);
  const [disputedJobs, setDisputedJobs] = useState<Job[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const db = getFirebaseDb();
    const unsubs: (() => void)[] = [];

    unsubs.push(onSnapshot(query(collection(db, 'jobs'), where('status', '==', 'SEARCHING')), snap => {
      setSearchingJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
      setLastUpdated(new Date());
    }));

    unsubs.push(onSnapshot(query(collection(db, 'jobs'), where('status', 'in', ['ACCEPTED', 'WORKER_ARRIVING', 'WORKER_ARRIVED', 'IN_PROGRESS'])), snap => {
      setActiveJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
      setLastUpdated(new Date());
    }));

    unsubs.push(onSnapshot(query(collection(db, 'workers'), where('status', 'in', ['ONLINE', 'AVAILABLE'])), snap => {
      setOnlineWorkers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as Worker)));
      setLastUpdated(new Date());
    }));

    unsubs.push(onSnapshot(query(collection(db, 'jobs'), where('status', '==', 'DISPUTED')), snap => {
      setDisputedJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
      setLastUpdated(new Date());
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Live Operations
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Real-time control room · Updated {lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>
        <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      {/* Alert — disputed jobs */}
      {disputedJobs.length > 0 && (
        <div className="bg-orange-950/40 border border-orange-800/50 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <p className="text-sm text-orange-300"><strong>{disputedJobs.length}</strong> disputed job(s) require attention.</p>
          <a href="/dashboard/disputes" className="ml-auto text-xs text-orange-400 underline">Resolve →</a>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Searching Jobs', value: searchingJobs.length, color: 'border-amber-500/30 bg-amber-500/5', textColor: 'text-amber-400', icon: Search },
          { label: 'Active Jobs', value: activeJobs.length, color: 'border-blue-500/30 bg-blue-500/5', textColor: 'text-blue-400', icon: Briefcase },
          { label: 'Online Workers', value: onlineWorkers.length, color: 'border-green-500/30 bg-green-500/5', textColor: 'text-green-400', icon: HardHat },
          { label: 'Disputed Jobs', value: disputedJobs.length, color: 'border-orange-500/30 bg-orange-500/5', textColor: 'text-orange-400', icon: AlertTriangle },
        ].map(({ label, value, color, textColor, icon: Icon }) => (
          <div key={label} className={clsx('border rounded-xl p-4 flex items-center justify-between', color)}>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={clsx('text-3xl font-bold mt-1', textColor)}>{value}</p>
            </div>
            <Icon className={clsx('w-8 h-8 opacity-30', textColor)} />
          </div>
        ))}
      </div>

      {/* Searching Jobs */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" /> Jobs Searching for Worker
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">{searchingJobs.length}</span>
          </h2>
        </div>
        {searchingJobs.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">No jobs currently searching.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {searchingJobs.map(job => (
              <div key={job.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/30">
                <div>
                  <p className="text-sm font-medium text-white">{job.category} — {job.requestedWorkers} worker(s)</p>
                  <p className="text-xs text-gray-400">{job.location?.district || job.location?.city || '—'} · {job.expectedHours}h · ₹{job.estimatedAmount?.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {job.createdAt ? new Date(job.createdAt).toLocaleTimeString('en-IN') : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Jobs */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" /> Active Jobs (In Progress / Arriving)
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{activeJobs.length}</span>
          </h2>
        </div>
        {activeJobs.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">No active jobs right now.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {activeJobs.map(job => (
              <div key={job.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-800/30">
                <div>
                  <p className="text-sm font-medium text-white">{job.userName} — {job.category}</p>
                  <p className="text-xs text-gray-400">{job.location?.district || '—'} · Workers: {job.assignedWorkers?.length || 0}/{job.requestedWorkers}</p>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-medium">
                  {job.status?.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Online Workers */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <HardHat className="w-4 h-4 text-green-400" /> Online / Available Workers
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">{onlineWorkers.length}</span>
          </h2>
        </div>
        {onlineWorkers.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">No workers currently online.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
            {onlineWorkers.map(w => (
              <div key={w.uid} className="bg-gray-800 rounded-lg px-3 py-2.5 flex items-center gap-2.5">
                <div className="w-7 h-7 bg-green-600/20 border border-green-600/30 rounded-full flex items-center justify-center text-xs font-bold text-green-400 flex-shrink-0">
                  {w.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{w.name}</p>
                  <p className="text-xs text-gray-400 truncate">{w.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
