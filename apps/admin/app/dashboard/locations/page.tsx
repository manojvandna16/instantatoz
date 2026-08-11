'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase'; const db = getFirebaseDb();
import { MapPin, ChevronRight, Users, HardHat, Briefcase, TrendingUp } from 'lucide-react';

interface LocationStat {
  location: string;
  type: 'state' | 'district' | 'tehsil';
  users: number;
  workers: number;
  verifiedWorkers: number;
  onlineWorkers: number;
  activeJobs: number;
  completedJobs: number;
}

export default function LocationAnalyticsPage() {
  const [usersByDistrict, setUsersByDistrict] = useState<Record<string, number>>({});
  const [workersByDistrict, setWorkersByDistrict] = useState<Record<string, { total: number; verified: number; online: number }>>({});
  const [jobsByDistrict, setJobsByDistrict] = useState<Record<string, { active: number; completed: number }>>({});
  const [selectedState] = useState('Uttarakhand');
  const [selectedDistrict, setSelectedDistrict] = useState('Uttarkashi');

  useEffect(() => {
    // Users by district
    const u1 = onSnapshot(collection(db, 'users'), snap => {
      const byDistrict: Record<string, number> = {};
      snap.docs.forEach(d => {
        const district = d.data().location?.district || d.data().registeredLocation?.district || 'Unknown';
        byDistrict[district] = (byDistrict[district] || 0) + 1;
      });
      setUsersByDistrict(byDistrict);
    });

    // Workers by district
    const u2 = onSnapshot(collection(db, 'workers'), snap => {
      const byDistrict: Record<string, { total: number; verified: number; online: number }> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        const district = data.registeredLocation?.district || 'Unknown';
        if (!byDistrict[district]) byDistrict[district] = { total: 0, verified: 0, online: 0 };
        byDistrict[district].total++;
        if (data.verificationStatus === 'APPROVED') byDistrict[district].verified++;
        if (['ONLINE', 'AVAILABLE'].includes(data.status)) byDistrict[district].online++;
      });
      setWorkersByDistrict(byDistrict);
    });

    // Jobs by district
    const u3 = onSnapshot(collection(db, 'jobs'), snap => {
      const byDistrict: Record<string, { active: number; completed: number }> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        const district = data.location?.district || 'Unknown';
        if (!byDistrict[district]) byDistrict[district] = { active: 0, completed: 0 };
        if (!['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(data.status)) byDistrict[district].active++;
        if (data.status === 'COMPLETED') byDistrict[district].completed++;
      });
      setJobsByDistrict(byDistrict);
    });

    return () => { u1(); u2(); u3(); };
  }, []);

  const allDistricts = new Set([
    ...Object.keys(usersByDistrict),
    ...Object.keys(workersByDistrict),
    ...Object.keys(jobsByDistrict),
  ]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Location Analytics</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span>India</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-blue-400">{selectedState}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white">{selectedDistrict}</span>
        </div>
      </div>

      {/* Region selector */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Country</label>
          <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
            <option>India</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">State</label>
          <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
            <option>Uttarakhand</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">District</label>
          <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
            <option value="ALL">All Districts</option>
            {[...allDistricts].sort().map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* District summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Users</p>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {selectedDistrict === 'ALL' ? Object.values(usersByDistrict).reduce((a, b) => a + b, 0) : (usersByDistrict[selectedDistrict] || 0)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardHat className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400">Workers</p>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {selectedDistrict === 'ALL' ? Object.values(workersByDistrict).reduce((a, b) => a + b.total, 0) : (workersByDistrict[selectedDistrict]?.total || 0)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Active Jobs</p>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {selectedDistrict === 'ALL' ? Object.values(jobsByDistrict).reduce((a, b) => a + b.active, 0) : (jobsByDistrict[selectedDistrict]?.active || 0)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-gray-400">Completed Jobs</p>
          </div>
          <p className="text-2xl font-bold text-amber-400">
            {selectedDistrict === 'ALL' ? Object.values(jobsByDistrict).reduce((a, b) => a + b.completed, 0) : (jobsByDistrict[selectedDistrict]?.completed || 0)}
          </p>
        </div>
      </div>

      {/* District breakdown table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">District Breakdown — {selectedState}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['District', 'Users', 'Workers', 'Verified', 'Online', 'Active Jobs', 'Completed', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[...allDistricts].filter(d => d !== 'Unknown').sort().map(district => {
                const users = usersByDistrict[district] || 0;
                const workers = workersByDistrict[district] || { total: 0, verified: 0, online: 0 };
                const jobs = jobsByDistrict[district] || { active: 0, completed: 0 };
                const supplyDemand = workers.online === 0 && jobs.active > 0 ? 'shortage' : workers.online > jobs.active * 2 ? 'surplus' : 'balanced';
                return (
                  <tr key={district} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{district}</td>
                    <td className="px-4 py-3 text-blue-400">{users}</td>
                    <td className="px-4 py-3 text-purple-400">{workers.total}</td>
                    <td className="px-4 py-3 text-green-400">{workers.verified}</td>
                    <td className="px-4 py-3 text-emerald-400">{workers.online}</td>
                    <td className="px-4 py-3 text-amber-400">{jobs.active}</td>
                    <td className="px-4 py-3 text-gray-300">{jobs.completed}</td>
                    <td className="px-4 py-3">
                      <span className={{
                        shortage: 'bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full',
                        surplus: 'bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full',
                        balanced: 'bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full',
                      }[supplyDemand]}>
                        {supplyDemand === 'shortage' ? '⚠ Shortage' : supplyDemand === 'surplus' ? '✓ Surplus' : '~ Balanced'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {allDistricts.size === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No location data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
