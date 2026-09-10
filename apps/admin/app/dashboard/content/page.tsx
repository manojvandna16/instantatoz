'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { FileText, Plus, Edit3, Check, X, Save, RefreshCw, Trash2 } from 'lucide-react';

const DEFAULT_SECTIONS = [
  {
    id: 'about',
    title: 'About Us',
    description: 'Company description shown in the app and website.',
    content: 'Instantatoz is a hyperlocal service marketplace connecting customers with skilled local service workers in Uttarkashi District, Uttarakhand. We provide a reliable platform for booking home services including plumbing, electrical work, carpentry, cleaning, and more.',
  },
  {
    id: 'tagline',
    title: 'App Tagline',
    description: 'Short tagline displayed on the app splash screen and website.',
    content: 'Your Local Service, Instantly Booked.',
  },
  {
    id: 'how_it_works_customer',
    title: 'How It Works — Customer',
    description: 'Step-by-step guide shown to customers.',
    content: '1. Post a Job — Select a service and describe what you need.\n2. Workers Apply — Nearby verified workers see your request.\n3. Accept a Worker — Review profiles and accept the best match.\n4. Job Done & Pay — Worker completes the job. Pay securely via UPI or card.',
  },
  {
    id: 'how_it_works_worker',
    title: 'How It Works — Worker',
    description: 'Step-by-step guide shown to service workers.',
    content: '1. Register & Verify — Create your profile and upload documents.\n2. Go Online — Set yourself available to receive job requests.\n3. Accept Jobs — Browse nearby jobs and apply to work.\n4. Complete & Earn — Finish the job and receive payment directly.',
  },
];

interface ContentSection {
  id: string;
  title: string;
  description: string;
  content: string;
}

interface FAQ {
  id: string;
  q: string;
  a: string;
}

export default function ContentPage() {
  const [sections, setSections] = useState<ContentSection[]>(DEFAULT_SECTIONS);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // FAQ Modal state
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');
  const [savingFaq, setSavingFaq] = useState(false);

  useEffect(() => {
    const db = getFirebaseDb();
    
    // Listen to content
    const unsubContent = onSnapshot(collection(db, 'app_content'), (snap) => {
      if (snap.empty) {
        setSections(DEFAULT_SECTIONS);
      } else {
        const dbSections: ContentSection[] = [];
        snap.forEach(docSnap => {
          const def = DEFAULT_SECTIONS.find(s => s.id === docSnap.id);
          if (def) {
            dbSections.push({ ...def, content: docSnap.data().content });
          }
        });
        const merged = DEFAULT_SECTIONS.map(def => dbSections.find(s => s.id === def.id) || def);
        setSections(merged);
      }
      setLoading(false);
    });

    // Listen to FAQs
    const unsubFaqs = onSnapshot(collection(db, 'faqs'), (snap) => {
      const faqData: FAQ[] = [];
      snap.forEach(docSnap => {
        faqData.push({ id: docSnap.id, ...docSnap.data() } as FAQ);
      });
      setFaqs(faqData);
    });

    return () => { unsubContent(); unsubFaqs(); };
  }, []);

  function startEdit(id: string, content: string) {
    setEditing(id);
    setEditContent(content);
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, 'app_content', id), {
        content: editContent,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setEditing(null);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (e) {
      console.error("Error saving content:", e);
      alert("Failed to save content.");
    } finally {
      setSavingId(null);
    }
  }

  function openFaqModal(faq?: FAQ) {
    if (faq) {
      setEditingFaqId(faq.id);
      setFaqQ(faq.q);
      setFaqA(faq.a);
    } else {
      setEditingFaqId(null);
      setFaqQ('');
      setFaqA('');
    }
    setShowFaqModal(true);
  }

  async function saveFaq() {
    if (!faqQ.trim() || !faqA.trim()) return;
    setSavingFaq(true);
    try {
      const db = getFirebaseDb();
      if (editingFaqId) {
        await setDoc(doc(db, 'faqs', editingFaqId), {
          q: faqQ.trim(),
          a: faqA.trim(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } else {
        await addDoc(collection(db, 'faqs'), {
          q: faqQ.trim(),
          a: faqA.trim(),
          createdAt: new Date().toISOString()
        });
      }
      setShowFaqModal(false);
    } catch (error) {
      console.error("Error saving FAQ:", error);
      alert("Failed to save FAQ");
    } finally {
      setSavingFaq(false);
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'faqs', id));
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      alert("Failed to delete FAQ");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Content Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage live app and website text content directly from the database.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />)
        ) : sections.map(section => (
          <div key={section.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-white font-semibold text-sm">{section.title}</h2>
                <p className="text-gray-500 text-xs mt-0.5">{section.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {savedId === section.id && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved Live
                  </span>
                )}
                {editing !== section.id ? (
                  <button onClick={() => startEdit(section.id, section.content)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(null)} disabled={savingId === section.id} className="text-xs text-gray-400 hover:text-white bg-gray-800 px-2 py-1.5 rounded-lg">
                      <X className="w-3 h-3" />
                    </button>
                    <button onClick={() => saveEdit(section.id)} disabled={savingId === section.id} className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-1.5 rounded-lg">
                      {savingId === section.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </button>
                  </div>
                )}
              </div>
            </div>

            {editing === section.id ? (
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed mt-2"
              />
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-4 mt-2">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{section.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">FAQ Management</h2>
          <button onClick={() => openFaqModal()} className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-3 h-3" /> Add FAQ
          </button>
        </div>
        <div className="space-y-2">
          {faqs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">No FAQs added yet.</p>
            </div>
          ) : faqs.map((faq) => (
            <details key={faq.id} className="bg-gray-800/40 border border-gray-800 rounded-xl group relative">
              <summary className="px-4 py-3 text-sm text-gray-300 cursor-pointer hover:text-white flex items-center gap-2 pr-20">
                <FileText className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                {faq.q}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400 pt-1 border-t border-gray-800/50 mt-1 whitespace-pre-wrap">{faq.a}</div>
              
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 rounded-lg p-0.5 border border-gray-700">
                <button onClick={(e) => { e.preventDefault(); openFaqModal(faq); }} className="p-1.5 text-gray-400 hover:text-blue-400 rounded-md hover:bg-gray-800">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={(e) => { e.preventDefault(); deleteFaq(faq.id); }} className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-800">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">{editingFaqId ? 'Edit FAQ' : 'Add New FAQ'}</h3>
              <button onClick={() => setShowFaqModal(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Question</label>
                <input
                  type="text"
                  value={faqQ}
                  onChange={e => setFaqQ(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. How do I post a job?"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Answer</label>
                <textarea
                  value={faqA}
                  onChange={e => setFaqA(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                  rows={4}
                  placeholder="Provide the answer here..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowFaqModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
                <button
                  onClick={saveFaq}
                  disabled={savingFaq || !faqQ.trim() || !faqA.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {savingFaq ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingFaq ? 'Saving...' : 'Save FAQ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
