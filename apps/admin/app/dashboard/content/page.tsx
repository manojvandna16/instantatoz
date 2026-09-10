'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { FileText, Plus, Edit3, Check, X, Save, RefreshCw } from 'lucide-react';

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

export default function ContentPage() {
  const [sections, setSections] = useState<ContentSection[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const unsub = onSnapshot(collection(db, 'app_content'), (snap) => {
      if (snap.empty) {
        // Fallback to defaults if collection is empty
        setSections(DEFAULT_SECTIONS);
      } else {
        const dbSections: ContentSection[] = [];
        snap.forEach(doc => {
          // Merge db data with default descriptions for UI consistency
          const def = DEFAULT_SECTIONS.find(s => s.id === doc.id);
          if (def) {
            dbSections.push({ ...def, content: doc.data().content });
          }
        });
        
        // Ensure all defaults are present even if not in DB yet
        const merged = DEFAULT_SECTIONS.map(def => {
          const dbItem = dbSections.find(s => s.id === def.id);
          return dbItem || def;
        });
        setSections(merged);
      }
      setLoading(false);
    });

    return unsub;
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

      {/* FAQ Section (Static Example placeholder for future dynamic expansion) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">FAQ Management</h2>
          <button className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-600/10 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg" title="Coming soon">
            <Plus className="w-3 h-3" /> Add FAQ
          </button>
        </div>
        <div className="space-y-2">
          {[
            { q: 'How do I post a job?', a: 'Open the app, select a service category, describe your requirement, and post. Nearby workers will see your request.' },
            { q: 'Is it safe to let workers into my home?', a: 'All workers on Instantatoz are verified with government ID and background checks before being approved.' },
          ].map((faq, i) => (
            <details key={i} className="bg-gray-800/40 border border-gray-800 rounded-xl">
              <summary className="px-4 py-3 text-sm text-gray-300 cursor-pointer hover:text-white flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                {faq.q}
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
