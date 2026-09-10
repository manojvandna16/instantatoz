'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Tag, Plus, Edit3, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Category {
  id: string;
  name: string;
  nameHindi?: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder?: number;
  baseRate?: number;
  rateUnit?: string;
  createdAt?: any;
}

export default function CategoriesPage() {
  const { adminUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', nameHindi: '', description: '', icon: '', baseRate: '', rateUnit: 'per hour', isActive: true, sortOrder: '' });

  const canEdit = adminUser?.role === 'SUPER_ADMIN' || adminUser?.role === 'CONTENT_ADMIN' || adminUser?.role === 'OPERATIONS_ADMIN';

  useEffect(() => {
    const db = getFirebaseDb();
    const unsub = onSnapshot(query(collection(db, 'categories'), orderBy('sortOrder', 'asc')), snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
      setLoading(false);
    }, () => {
      onSnapshot(collection(db, 'categories'), snap => {
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
        setLoading(false);
      });
    });
    return unsub;
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: '', nameHindi: '', description: '', icon: '', baseRate: '', rateUnit: 'per hour', isActive: true, sortOrder: String(categories.length + 1) });
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({
      name: cat.name, nameHindi: cat.nameHindi || '', description: cat.description || '',
      icon: cat.icon || '', baseRate: cat.baseRate ? String(cat.baseRate) : '',
      rateUnit: cat.rateUnit || 'per hour', isActive: cat.isActive,
      sortOrder: cat.sortOrder ? String(cat.sortOrder) : '',
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { alert('Category name is required'); return; }
    setSaving(true);
    try {
      const db = getFirebaseDb();
      const payload: any = {
        name: form.name.trim(),
        nameHindi: form.nameHindi.trim() || null,
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        baseRate: form.baseRate ? parseFloat(form.baseRate) : null,
        rateUnit: form.rateUnit,
        isActive: form.isActive,
        sortOrder: form.sortOrder ? parseInt(form.sortOrder) : categories.length + 1,
      };

      if (editing) {
        await updateDoc(doc(db, 'categories', editing.id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'categories'), payload);
      }
      setShowForm(false);
    } catch (e: any) {
      alert('Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(cat: Category) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, 'categories', cat.id), { isActive: !cat.isActive });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Service Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">{categories.length} categories · {categories.filter(c => c.isActive).length} active</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-28 animate-pulse" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
          <Tag className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-semibold">No Categories Yet</p>
          <p className="text-gray-500 text-sm mt-1">Add service categories to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className={`bg-gray-900 border rounded-xl p-4 transition-all ${cat.isActive ? 'border-gray-800' : 'border-gray-800/40 opacity-50'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                  <div>
                    <p className="text-white font-semibold text-sm">{cat.name}</p>
                    {cat.nameHindi && <p className="text-gray-500 text-xs">{cat.nameHindi}</p>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-500'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {cat.description && <p className="text-gray-500 text-xs mb-3 leading-relaxed">{cat.description}</p>}

              {cat.baseRate && (
                <p className="text-gray-400 text-xs mb-3">
                  Base rate: <span className="text-white">₹{cat.baseRate} {cat.rateUnit}</span>
                </p>
              )}

              {canEdit && (
                <div className="flex gap-2 pt-3 border-t border-gray-800">
                  <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-white py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => toggleActive(cat)} className="flex-1 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-white py-1.5 rounded-lg hover:bg-gray-800 transition-colors">
                    <Check className="w-3 h-3" /> {cat.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Name (English) *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Plumber" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Name (Hindi)</label>
                  <input value={form.nameHindi} onChange={e => setForm(f => ({ ...f, nameHindi: e.target.value }))}
                    placeholder="e.g. प्लम्बर" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Brief description of the service..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Icon (Emoji)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="🔧" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Base Rate (₹)</label>
                  <input type="number" value={form.baseRate} onChange={e => setForm(f => ({ ...f, baseRate: e.target.value }))}
                    placeholder="150" min="0" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Rate Unit</label>
                  <select value={form.rateUnit} onChange={e => setForm(f => ({ ...f, rateUnit: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    <option>per hour</option>
                    <option>per day</option>
                    <option>per job</option>
                    <option>per visit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
                    placeholder="1" min="1" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                      className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${form.isActive ? 'bg-green-500' : 'bg-gray-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-xs text-gray-400">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
