'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import {
  Users, HardHat, CheckCircle, Clock, Wifi, WifiOff, Briefcase,
  Search, PlayCircle, CheckSquare, XCircle, CreditCard, Percent,
  Wallet, MessageSquareWarning, Scale, Star, TrendingUp, AlertTriangle,
  RefreshCw, MapPin
} from 'lucide-react';
import type { DashboardStats } from '@/types';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color, sub, live
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sub?: string;
  live?: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start justify-between hover:border-gray-700 transition-colors">
      <div>
        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
          {label}
          {live && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
        </p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-gray-400" />
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{title}</h2>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalWorkers: 0, verifiedWorkers: 0, pendingVerification: 0,
    onlineWorkers: 0, offlineWorkers: 0, busyWorkers: 0, suspendedWorkers: 0,
    activeJobs: 0, searchingJobs: 0, inProgressJobs: 0,
    completedJobsToday: 0, cancelledJobsToday: 0,
    todayPayments: 0, todayCommission: 0, pendingPayouts: 0,
    openComplaints: 0, openDisputes: 0, averageRating: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [location] = useState('Uttarkashi District, Uttarakhand');

  useEffect(() => {
    const db = getFirebaseDb();
    const unsubscribers: (() => void)[] = [];

    // Users
    unsubscribers.push(onSnapshot(collection(db, 'users'), snap => {
      setStats(s => ({ ...s, totalUsers: snap.size }));
      setLastUpdated(new Date());
    }));

    // Workers
    unsubscribers.push(onSnapshot(collection(db, 'workers'), snap => {
      const workers = snap.docs.map(d => d.data());
      setStats(s => ({
        ...s,
        totalWorkers: snap.size,
        verifiedWorkers: workers.filter(w => w.verificationStatus === 'APPROVED').length,
        pendingVerification: workers.filter(w => w.verificationStatus === 'PENDING').length,
        onlineWorkers: workers.filter(w => w.status === 'ONLINE' || w.status === 'AVAILABLE').length,
        offlineWorkers: workers.filter(w => w.status === 'OFFLINE').length,
        busyWorkers: workers.filter(w => w.status === 'BUSY' || w.status === 'ON_JOB').length,
        suspendedWorkers: workers.filter(w => w.status === 'SUSPENDED').length,
      }));
      setLastUpdated(new Date());
    }));

    // Jobs
    unsubscribers.push(onSnapshot(collection(db, 'jobs'), snap => {
      const jobs = snap.docs.map(d => d.data());
      const today = new Date(); today.setHours(0, 0, 0, 0);
      setStats(s => ({
        ...s,
        activeJobs: jobs.filter(j => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(j.status)).length,
        searchingJobs: jobs.filter(j => j.status === 'SEARCHING').length,
        inProgressJobs: jobs.filter(j => j.status === 'IN_PROGRESS').length,
        completedJobsToday: jobs.filter(j => j.status === 'COMPLETED' && j.completedAt?.toDate?.() >= today).length,
        cancelledJobsToday: jobs.filter(j => j.status === 'CANCELLED' && j.cancelledAt?.toDate?.() >= today).length,
      }));
      setLastUpdated(new Date());
    }));

    // Complaints
    unsubscribers.push(onSnapshot(
      query(collection(db, 'complaints'), where('status', 'in', ['NEW', 'ASSIGNED', 'UNDER_REVIEW'])),
      snap => {
        setStats(s => ({ ...s, openComplaints: snap.size }));
      }
    ));

    // Disputes
    unsubscribers.push(onSnapshot(
      query(collection(db, 'disputes'), where('status', 'in', ['OPEN', 'UNDER_REVIEW'])),
      snap => {
        setStats(s => ({ ...s, openDisputes: snap.size }));
      }
    ));

    return () => unsubscribers.forEach(u => u());
  }, []);

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Operations Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <p className="text-sm text-gray-400">{location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          Live · Updated {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Alert if pending verifications */}
      {stats.pendingVerification > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            <strong>{stats.pendingVerification}</strong> worker verification{stats.pendingVerification > 1 ? 's' : ''} pending review.
          </p>
          <a href="/dashboard/workers/verification" className="ml-auto text-xs text-amber-400 hover:text-amber-300 underline">
            Review now →
          </a>
        </div>
      )}

      {/* Users & Workers */}
      <div>
        <SectionHeader title="Users & Workers" icon={Users} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-600/20 text-blue-400" />
          <StatCard label="Total Workers" value={stats.totalWorkers} icon={HardHat} color="bg-purple-600/20 text-purple-400" />
          <StatCard label="Verified Workers" value={stats.verifiedWorkers} icon={CheckCircle} color="bg-green-600/20 text-green-400" />
          <StatCard label="Pending Verification" value={stats.pendingVerification} icon={Clock} color="bg-amber-600/20 text-amber-400" />
        </div>
      </div>

      {/* Worker Status */}
      <div>
        <SectionHeader title="Worker Status (Real-Time)" icon={Wifi} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Online / Available" value={stats.onlineWorkers} icon={Wifi} color="bg-green-600/20 text-green-400" live />
          <StatCard label="Busy / On Job" value={stats.busyWorkers} icon={Briefcase} color="bg-blue-600/20 text-blue-400" live />
          <StatCard label="Offline" value={stats.offlineWorkers} icon={WifiOff} color="bg-gray-600/20 text-gray-400" live />
          <StatCard label="Suspended" value={stats.suspendedWorkers} icon={AlertTriangle} color="bg-red-600/20 text-red-400" />
        </div>
      </div>

      {/* Jobs */}
      <div>
        <SectionHeader title="Jobs (Real-Time)" icon={Briefcase} />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Active Jobs" value={stats.activeJobs} icon={TrendingUp} color="bg-blue-600/20 text-blue-400" live />
          <StatCard label="Searching" value={stats.searchingJobs} icon={Search} color="bg-amber-600/20 text-amber-400" live />
          <StatCard label="In Progress" value={stats.inProgressJobs} icon={PlayCircle} color="bg-purple-600/20 text-purple-400" live />
          <StatCard label="Completed Today" value={stats.completedJobsToday} icon={CheckSquare} color="bg-green-600/20 text-green-400" />
          <StatCard label="Cancelled Today" value={stats.cancelledJobsToday} icon={XCircle} color="bg-red-600/20 text-red-400" />
        </div>
      </div>

      {/* Finance */}
      <div>
        <SectionHeader title="Finance (Today)" icon={CreditCard} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Payments Today" value={`₹${stats.todayPayments.toLocaleString('en-IN')}`} icon={CreditCard} color="bg-green-600/20 text-green-400" />
          <StatCard label="Commission Today" value={`₹${stats.todayCommission.toLocaleString('en-IN')}`} icon={Percent} color="bg-blue-600/20 text-blue-400" />
          <StatCard label="Pending Payouts" value={`₹${stats.pendingPayouts.toLocaleString('en-IN')}`} icon={Wallet} color="bg-amber-600/20 text-amber-400" />
          <StatCard label="Avg Rating" value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'} icon={Star} color="bg-yellow-600/20 text-yellow-400" />
        </div>
      </div>

      {/* Support */}
      <div>
        <SectionHeader title="Support & Issues" icon={MessageSquareWarning} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Open Complaints" value={stats.openComplaints} icon={MessageSquareWarning} color="bg-orange-600/20 text-orange-400" />
          <StatCard label="Open Disputes" value={stats.openDisputes} icon={Scale} color="bg-red-600/20 text-red-400" />
          <StatCard label="Platform Status" value="Operational" icon={CheckCircle} color="bg-green-600/20 text-green-400" sub="All systems normal" />
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Verify Workers', href: '/dashboard/workers/verification', color: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'Live Operations', href: '/dashboard/live-operations', color: 'bg-purple-600 hover:bg-purple-700' },
            { label: 'Pending Payouts', href: '/dashboard/payouts', color: 'bg-green-600 hover:bg-green-700' },
            { label: 'Open Complaints', href: '/dashboard/complaints', color: 'bg-orange-600 hover:bg-orange-700' },
          ].map(link => (
            <a key={link.href} href={link.href}
              className={`${link.color} text-white text-xs font-medium px-4 py-3 rounded-lg text-center transition-colors`}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
