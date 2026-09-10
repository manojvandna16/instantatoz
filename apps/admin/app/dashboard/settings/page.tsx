'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Settings, Save, Percent, MapPin, Clock, Star, AlertTriangle, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [commission, setCommission] = useState('15');
  const [matchRadius, setMatchRadius] = useState('2');
  const [workerResponseTime, setWorkerResponseTime] = useState('5');
  const [arrivalTimeLimit, setArrivalTimeLimit] = useState('30');
  const [minRating, setMinRating] = useState('3.5');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const db = getFirebaseDb();
    const unsub = onSnapshot(doc(db, 'platformConfig', 'main'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.commission !== undefined) setCommission(String(data.commission));
        if (data.matchRadius !== undefined) setMatchRadius(String(data.matchRadius));
        if (data.workerResponseTime !== undefined) setWorkerResponseTime(String(data.workerResponseTime));
        if (data.arrivalTimeLimit !== undefined) setArrivalTimeLimit(String(data.arrivalTimeLimit));
        if (data.minRating !== undefined) setMinRating(String(data.minRating));
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, 'platformConfig', 'main'), {
        commission: Number(commission),
        matchRadius: Number(matchRadius),
        workerResponseTime: Number(workerResponseTime),
        arrivalTimeLimit: Number(arrivalTimeLimit),
        minRating: Number(minRating),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save settings. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold text-white">Platform Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Configure core platform parameters.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-400 text-sm">Loading config...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-white">Platform Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Configure core platform parameters. Changes apply to new jobs.</p>
      </div>

      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300">
          Commission changes do <strong>not</strong> affect historical jobs. Only new jobs will use updated commission rate.
        </p>
      </div>

      {/* Commission */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Percent className="w-4 h-4 text-blue-400" /> Commission & Fees
        </h2>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Platform Commission (%)</label>
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="50" value={commission} onChange={e => setCommission(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-32 focus:outline-none focus:border-blue-500" />
            <span className="text-gray-400 text-sm">% of job total</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Current: Worker receives {100 - parseInt(commission || '0')}% of job amount.</p>
        </div>
      </div>

      {/* Matching */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-400" /> Worker Matching
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Default Matching Radius (km)</label>
            <input type="number" min="0.5" max="50" step="0.5" value={matchRadius} onChange={e => setMatchRadius(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-full focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Minimum Worker Rating</label>
            <input type="number" min="1" max="5" step="0.1" value={minRating} onChange={e => setMinRating(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-full focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" /> Time Limits
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Worker Response Time (minutes)</label>
            <input type="number" min="1" max="30" value={workerResponseTime} onChange={e => setWorkerResponseTime(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-full focus:outline-none focus:border-blue-500" />
            <p className="text-xs text-gray-500 mt-1">Worker must accept within this time.</p>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Arrival Time Limit (minutes)</label>
            <input type="number" min="5" max="120" value={arrivalTimeLimit} onChange={e => setArrivalTimeLimit(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-full focus:outline-none focus:border-blue-500" />
            <p className="text-xs text-gray-500 mt-1">Worker must arrive within this time.</p>
          </div>
        </div>
      </div>

      {/* Launch Region */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-400" /> Launch Region
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Default District</label>
            <input defaultValue="Uttarkashi"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-full focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Default State</label>
            <input defaultValue="Uttarakhand"
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm w-full focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        <p className="text-xs text-gray-500">These are display defaults only. Service areas are managed separately in Service Areas.</p>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && <span className="text-sm text-green-400 flex items-center gap-1.5"><span className="w-2 h-2 bg-green-400 rounded-full" />Saved successfully!</span>}
      </div>
    </div>
  );
}
