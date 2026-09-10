'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { MapPin, CheckCircle2, Info, Plus, Edit3, Trash2, X, Save } from 'lucide-react';

interface ServiceArea {
  id: string;
  name: string;
  district: string;
  state: string;
  active: boolean;
}

export default function ServiceAreasPage() {
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [workerCounts, setWorkerCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', district: 'Uttarkashi', state: 'Uttarakhand', active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const db = getFirebaseDb();
    
    // Listen to service areas
    const q = query(collection(db, 'service_areas'));
    const unsub = onSnapshot(q, async (snap) => {
      const areaData = snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceArea));
      setAreas(areaData);
      
      // Fetch verified workers to compute counts
      try {
        const workersSnap = await getDocs(query(collection(db, 'workers'), where('verificationStatus', '==', 'APPROVED')));
        const workers = workersSnap.docs.map(d => d.data());
        
        const counts: Record<string, number> = {};
        areaData.forEach(area => {
          counts[area.id] = workers.filter(w => {
             const addr = w.address?.toLowerCase() || '';
             return addr.includes(area.name.toLowerCase()) || addr.includes(area.district.toLowerCase());
          }).length;
        });
        setWorkerCounts(counts);
      } catch (err) {
        console.error("Error fetching workers for area counts:", err);
      }
      
      setLoading(false);
    });

    return unsub;
  }, []);

  const activeAreas = areas.filter(a => a.active);
  const totalWorkers = Object.values(workerCounts).reduce((a, b) => a + b, 0);

  const openModal = (area?: ServiceArea) => {
    if (area) {
      setEditingId(area.id);
      setFormData({ name: area.name, district: area.district, state: area.state, active: area.active });
    } else {
      setEditingId(null);
      setFormData({ name: '', district: 'Uttarkashi', state: 'Uttarakhand', active: true });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      const db = getFirebaseDb();
      if (editingId) {
        await updateDoc(doc(db, 'service_areas', editingId), formData);
      } else {
        await addDoc(collection(db, 'service_areas'), formData);
      }
      setShowModal(false);
    } catch (error) {
      console.error("Error saving service area:", error);
      alert("Failed to save. Check permissions.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(getFirebaseDb(), 'service_areas', id), { active: !currentStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteArea = async (id: string) => {
    if (confirm("Are you sure you want to delete this service area?")) {
      try {
        await deleteDoc(doc(getFirebaseDb(), 'service_areas', id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Service Areas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage live geographic coverage regions.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Area
        </button>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400">
          This list dictates where customers can book services. Worker matching still uses geofence radius coordinates dynamically, but this allows you to officially track availability per town/city.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Areas</p>
          <p className="text-2xl font-bold text-white">{areas.length}</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Active Areas</p>
          <p className="text-2xl font-bold text-green-400">{activeAreas.length}</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total Verified Workers (Estimate)</p>
          <p className="text-2xl font-bold text-blue-400">{totalWorkers}</p>
        </div>
      </div>

      {/* Area Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="h-32 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />)
        ) : areas.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-gray-900 border border-gray-800 rounded-xl">
            <MapPin className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No service areas found.</p>
            <button onClick={() => openModal()} className="text-blue-400 hover:text-blue-300 text-sm">Add your first service area</button>
          </div>
        ) : areas.map(area => {
          const workers = workerCounts[area.id] || 0;
          return (
            <div key={area.id} className={`bg-gray-900 border rounded-xl p-4 transition-opacity ${area.active ? 'border-gray-800' : 'border-gray-800/40 opacity-70'}`}>
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
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggleStatus(area.id, area.active)} className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${area.active ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-gray-600 text-gray-400 hover:bg-gray-800'}`}>
                    {area.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  <span><strong className="text-gray-300">{workers}</strong> worker{workers !== 1 ? 's' : ''} here</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                  <button onClick={() => openModal(area)} className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-md"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteArea(area.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Area' : 'Add Service Area'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-semibold">City / Town Name</label>
                <input 
                  type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Bhatwari"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase font-semibold">District</label>
                  <input 
                    type="text" required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase font-semibold">State</label>
                  <input 
                    type="text" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" id="active-status" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-800 bg-gray-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <label htmlFor="active-status" className="text-sm text-white font-medium">Set as Active Immediately</label>
              </div>

              <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-4">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Area'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
