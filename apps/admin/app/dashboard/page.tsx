'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import {
  Users, HardHat, CheckCircle, Clock, Wifi, WifiOff, Briefcase,
  Search, PlayCircle, CheckSquare, XCircle, CreditCard, Percent,
  Wallet, MessageSquareWarning, Scale, Star, TrendingUp, AlertTriangle,
  RefreshCw, MapPin
} from 'lucide-react';
import type { DashboardStats } from '@/types';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    const db = getFirebaseDb();
    const unsubscribers: (() => void)[] = [];

    const getMidnight = () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    const parseDate = (val: any) => {
      if (!val) return 0;
      if (val.toDate) return val.toDate().getTime();
      if (val._seconds) return val._seconds * 1000;
      return new Date(val).getTime();
    };

    // Fetch 7-day trend
    const fetchTrend = async () => {
      try {
        const from = new Date();
        from.setDate(from.getDate() - 7);
        const res = await fetch(`/api/finance/stats?from=${from.toISOString()}`);
        if (res.ok) {
          const json = await res.json();
          // Map data to short date format for the chart
          const formattedData = (json.data.revenueTimeSeries || []).map((item: any) => {
            const dateObj = new Date(item.date);
            const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return {
              ...item,
              shortDate,
              workerEarnings: item.revenue - item.commission
            };
          });
          setRevenueData(formattedData);
        }
      } catch (e) {
        console.error('Failed to fetch stats', e);
      }
    };
    fetchTrend();

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
      const midnight = getMidnight();
      setStats(s => ({
        ...s,
        activeJobs: jobs.filter(j => !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(j.status)).length,
        searchingJobs: jobs.filter(j => j.status === 'SEARCHING').length,
        inProgressJobs: jobs.filter(j => j.status === 'IN_PROGRESS').length,
        completedJobsToday: jobs.filter(j => j.status === 'COMPLETED' && parseDate(j.completedAt) >= midnight).length,
        cancelledJobsToday: jobs.filter(j => j.status === 'CANCELLED' && parseDate(j.cancelledAt || j.updatedAt) >= midnight).length,
      }));
      setLastUpdated(new Date());
    }));

    // Payments
    unsubscribers.push(onSnapshot(collection(db, 'payments'), snap => {
      const payments = snap.docs.map(d => d.data());
      const midnight = getMidnight();
      let todayPayments = 0;
      let todayCommission = 0;

      payments.forEach(p => {
        if (p.status === 'COMPLETED' && parseDate(p.createdAt) >= midnight) {
          todayPayments += Number(p.amount || 0);
          todayCommission += Number(p.platformFee || 0);
        }
      });

      setStats(s => ({ ...s, todayPayments, todayCommission }));
    }));

    // Payouts
    unsubscribers.push(onSnapshot(collection(db, 'payouts'), snap => {
      const payouts = snap.docs.map(d => d.data());
      let pendingPayouts = 0;
      payouts.forEach(p => {
        if (p.status === 'PENDING') {
          pendingPayouts += Number(p.amount || 0);
        }
      });
      setStats(s => ({ ...s, pendingPayouts }));
    }));

    // Ratings
    unsubscribers.push(onSnapshot(collection(db, 'ratings'), snap => {
      const ratings = snap.docs.map(d => d.data());
      let total = 0;
      ratings.forEach(r => { total += Number(r.rating || 0); });
      const averageRating = ratings.length > 0 ? total / ratings.length : 0;
      setStats(s => ({ ...s, averageRating }));
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

  // Prepare Chart Data
  const workerStatusData = [
    { name: 'Online', value: stats.onlineWorkers, color: '#4ade80' },
    { name: 'Busy', value: stats.busyWorkers, color: '#60a5fa' },
    { name: 'Offline', value: stats.offlineWorkers, color: '#9ca3af' },
    { name: 'Suspended', value: stats.suspendedWorkers, color: '#f87171' },
  ].filter(d => d.value > 0);

  if (workerStatusData.length === 0) {
    workerStatusData.push({ name: 'No Workers', value: 1, color: '#374151' });
  }

  const jobsData = [
    { name: 'Completed Today', value: stats.completedJobsToday, color: '#4ade80' },
    { name: 'Cancelled Today', value: stats.cancelledJobsToday, color: '#f87171' },
    { name: 'Active Now', value: stats.activeJobs, color: '#a78bfa' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 text-sm mb-2 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-400">{entry.name}:</span>
              <span className="text-white font-bold">
                {entry.name.includes('evenue') || entry.name.includes('ommission') || entry.name.includes('arning') 
                  ? `₹${entry.value}` 
                  : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Payments Today" value={`₹${stats.todayPayments.toLocaleString('en-IN')}`} icon={CreditCard} color="bg-green-600/20 text-green-400" live />
        <StatCard label="Commission Today" value={`₹${stats.todayCommission.toLocaleString('en-IN')}`} icon={Percent} color="bg-blue-600/20 text-blue-400" live />
        <StatCard label="Active Jobs" value={stats.activeJobs} icon={TrendingUp} color="bg-purple-600/20 text-purple-400" live />
        <StatCard label="Online Workers" value={stats.onlineWorkers} icon={Wifi} color="bg-emerald-600/20 text-emerald-400" live />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <SectionHeader title="Revenue Trend (Last 7 Days)" icon={TrendingUp} />
          {revenueData.length > 0 ? (
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="shortDate" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="workerEarnings" name="Worker Earnings" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="commission" name="Platform Commission" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full mt-4 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
              <p className="text-gray-500 text-sm">Waiting for transaction data...</p>
            </div>
          )}
        </div>

        {/* Worker Status Pie Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
          <SectionHeader title="Worker Distribution" icon={Users} />
          <div className="flex-1 min-h-[250px] relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workerStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {workerStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-white">{stats.totalWorkers}</span>
              <span className="text-xs text-gray-500">Total Workers</span>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {workerStatusData.map(w => (
              <div key={w.name} className="flex items-center justify-between bg-gray-800/50 rounded-md px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: w.color }} />
                  <span className="text-xs text-gray-300">{w.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{w.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Status Overview */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <SectionHeader title="Today's Job Status" icon={Briefcase} />
          <div className="mt-4 space-y-4">
            {jobsData.map(job => (
              <div key={job.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{job.name}</span>
                  <span className="text-white font-bold">{job.value}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      backgroundColor: job.color, 
                      width: `${Math.max(2, (job.value / Math.max(1, stats.activeJobs + stats.completedJobsToday + stats.cancelledJobsToday)) * 100)}%` 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <SectionHeader title="Operational Metrics" icon={CheckCircle} />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <StatCard label="Pending Payouts" value={`₹${stats.pendingPayouts.toLocaleString('en-IN')}`} icon={Wallet} color="bg-amber-600/20 text-amber-400" />
            <StatCard label="Avg Rating" value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'} icon={Star} color="bg-yellow-600/20 text-yellow-400" />
            <StatCard label="Open Complaints" value={stats.openComplaints} icon={MessageSquareWarning} color="bg-orange-600/20 text-orange-400" />
            <StatCard label="Open Disputes" value={stats.openDisputes} icon={Scale} color="bg-red-600/20 text-red-400" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: 'Verify Workers', href: '/dashboard/workers/verification', color: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'Live Operations', href: '/dashboard/live-operations', color: 'bg-purple-600 hover:bg-purple-700' },
            { label: 'Pending Payouts', href: '/dashboard/payouts', color: 'bg-emerald-600 hover:bg-emerald-700' },
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
