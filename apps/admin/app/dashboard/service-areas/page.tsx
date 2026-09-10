'use client';

import { MapPin, CheckCircle2, Info } from 'lucide-react';

const SERVICE_AREAS = [
  { name: 'Bhatwari', district: 'Uttarkashi', state: 'Uttarakhand', active: true, workers: 8 },
  { name: 'Uttarkashi', district: 'Uttarkashi', state: 'Uttarakhand', active: true, workers: 23 },
  { name: 'Gangotri', district: 'Uttarkashi', state: 'Uttarakhand', active: true, workers: 3 },
  { name: 'Dharali', district: 'Uttarkashi', state: 'Uttarakhand', active: true, workers: 5 },
  { name: 'Sukhi', district: 'Uttarkashi', state: 'Uttarakhand', active: false, workers: 0 },
  { name: 'Harsil', district: 'Uttarkashi', state: 'Uttarakhand', active: true, workers: 4 },
  { name: 'Naugaon', district: 'Uttarkashi', state: 'Uttarakhand', active: false, workers: 1 },
  { name: 'Chiniyalisaur', district: 'Uttarkashi', state: 'Uttarakhand', active: true, workers: 6 },
];

export default function ServiceAreasPage() {
  const activeAreas = SERVICE_AREAS.filter(a => a.active);
  const totalWorkers = SERVICE_AREAS.reduce((s, a) => s + a.workers, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Service Areas</h1>
        <p className="text-sm text-gray-400 mt-0.5">Geographic coverage of the Instantatoz platform.</p>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400">
          Service areas are currently configured for <strong className="text-white">Uttarkashi District, Uttarakhand</strong>. 
          Worker-customer matching uses a 15km geofence radius from job location. 
          To add new service areas, update the geofence logic in the mobile app and Cloud Functions.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Areas</p>
          <p className="text-2xl font-bold text-white">{SERVICE_AREAS.length}</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Active Areas</p>
          <p className="text-2xl font-bold text-green-400">{activeAreas.length}</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Workers</p>
          <p className="text-2xl font-bold text-blue-400">{totalWorkers}</p>
        </div>
      </div>

      {/* Area Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SERVICE_AREAS.map(area => (
          <div key={area.name} className={`bg-gray-900 border rounded-xl p-4 ${area.active ? 'border-gray-800' : 'border-gray-800/40 opacity-50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${area.active ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  <MapPin className={`w-4 h-4 ${area.active ? 'text-green-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{area.name}</p>
                  <p className="text-gray-500 text-xs">{area.district}, {area.state}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${area.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-500'}`}>
                {area.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <CheckCircle2 className="w-3 h-3 text-blue-400" />
              <span><strong className="text-gray-300">{area.workers}</strong> verified worker{area.workers !== 1 ? 's' : ''}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Coverage Map Note */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Geographic Coverage</h2>
        <div className="bg-gray-800/50 rounded-xl p-4 text-center">
          <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Uttarkashi District</p>
          <p className="text-white font-bold text-lg mt-1">30°43'N — 78°26'E</p>
          <p className="text-gray-500 text-xs mt-2">~4,093 km² coverage area · Himalayan terrain</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-800/40 rounded-lg p-3">
            <p className="text-gray-500 mb-1">Matching Radius</p>
            <p className="text-white font-semibold">15 km geofence</p>
          </div>
          <div className="bg-gray-800/40 rounded-lg p-3">
            <p className="text-gray-500 mb-1">District HQ</p>
            <p className="text-white font-semibold">Uttarkashi Town</p>
          </div>
        </div>
      </div>
    </div>
  );
}
