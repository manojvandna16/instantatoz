'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Edit3, Save, X, Check, RefreshCw } from 'lucide-react';

const DEFAULT_DOCS = [
  {
    id: 'privacy_policy',
    title: 'Privacy Policy',
    lastUpdated: '2024-01-15',
    version: '1.2',
    summary: 'Describes how Instantatoz collects, uses, and protects user data.',
    content: `PRIVACY POLICY — Instantatoz\n\nLast Updated: January 15, 2024\n\n1. INFORMATION WE COLLECT\nWe collect information you provide when registering (name, phone, email), location data for service matching, payment information (processed securely by Razorpay), and usage data.\n\n2. HOW WE USE YOUR INFORMATION\nTo match customers with nearby service workers, to process payments, to send service notifications, and to improve our platform.\n\n3. DATA SHARING\nWe do not sell your personal data. We share data with service workers only for job fulfillment, and with Razorpay for payment processing.\n\n4. DATA SECURITY\nAll data is stored on Firebase (Google Cloud) with encryption at rest and in transit.\n\n5. YOUR RIGHTS\nYou may request deletion of your account and data by contacting support@instantatoz.com.`,
  },
  {
    id: 'terms_of_service',
    title: 'Terms of Service',
    lastUpdated: '2024-01-15',
    version: '1.1',
    summary: 'Rules governing the use of the Instantatoz platform.',
    content: `TERMS OF SERVICE — Instantatoz\n\nLast Updated: January 15, 2024\n\n1. ACCEPTANCE\nBy using Instantatoz, you agree to these terms.\n\n2. ELIGIBILITY\nUsers must be 18+ years old. Workers must pass verification.\n\n3. SERVICES\nInstantatoz provides a platform to connect customers with local service workers. We do not employ workers directly.\n\n4. PAYMENTS\nAll payments are processed via Razorpay. Platform charges a commission on each transaction.\n\n5. CANCELLATION\nCustomers may cancel before a worker is assigned at no charge. Post-acceptance cancellations may incur a fee.\n\n6. PROHIBITED CONDUCT\nMisuse of the platform, fraudulent reviews, or harassment will result in account termination.\n\n7. LIMITATION OF LIABILITY\nInstantatoz is not liable for the quality of services provided by independent workers.`,
  },
  {
    id: 'worker_agreement',
    title: 'Worker Agreement',
    lastUpdated: '2024-01-15',
    version: '1.0',
    summary: 'Terms for service workers registered on the platform.',
    content: `WORKER AGREEMENT — Instantatoz\n\nLast Updated: January 15, 2024\n\n1. INDEPENDENT CONTRACTOR\nWorkers are independent contractors, not employees of Instantatoz.\n\n2. VERIFICATION\nWorkers must submit valid government ID. False documentation results in permanent ban.\n\n3. SERVICE STANDARDS\nWorkers are expected to maintain professional conduct, arrive on time, and complete jobs as described.\n\n4. PAYMENT\nEarnings are released after job completion minus platform commission. Payout timelines vary.\n\n5. RATING SYSTEM\nWorkers must maintain a minimum rating to remain on the platform.`,
  },
];

interface LegalDoc {
  id: string;
  title: string;
  lastUpdated: string;
  version: string;
  summary: string;
  content: string;
}

export default function LegalPage() {
  const [docs, setDocs] = useState<LegalDoc[]>(DEFAULT_DOCS);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState<string>('privacy_policy');
  
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editVersion, setEditVersion] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const unsub = onSnapshot(collection(db, 'legal_documents'), (snap) => {
      if (snap.empty) {
        setDocs(DEFAULT_DOCS);
      } else {
        const dbDocs: LegalDoc[] = [];
        snap.forEach(docSnap => {
          const def = DEFAULT_DOCS.find(d => d.id === docSnap.id);
          if (def) {
            dbDocs.push({ ...def, ...docSnap.data() });
          }
        });
        
        const merged = DEFAULT_DOCS.map(def => dbDocs.find(d => d.id === def.id) || def);
        setDocs(merged);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const currentDoc = docs.find(d => d.id === activeDoc) || docs[0];

  function startEdit() {
    setEditing(activeDoc);
    setEditContent(currentDoc.content);
    setEditVersion(currentDoc.version);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const db = getFirebaseDb();
      const today = new Date().toISOString().split('T')[0];
      
      await setDoc(doc(db, 'legal_documents', activeDoc), {
        content: editContent,
        version: editVersion,
        lastUpdated: today
      }, { merge: true });
      
      setEditing(null);
      setSavedId(activeDoc);
      setTimeout(() => setSavedId(null), 2000);
    } catch (e) {
      console.error("Error saving document:", e);
      alert("Failed to save legal document.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Legal Documents</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage live Privacy Policy, Terms of Service, and Worker Agreement.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Doc Selector */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-16 border-b border-gray-800 bg-gray-900 animate-pulse" />)
            ) : docs.map(docItem => (
              <button key={docItem.id} onClick={() => { setActiveDoc(docItem.id); setEditing(null); }}
                className={`w-full text-left px-4 py-3 border-b border-gray-800 last:border-0 transition-colors ${activeDoc === docItem.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-gray-800/40'}`}>
                <p className={`text-sm font-medium ${activeDoc === docItem.id ? 'text-white' : 'text-gray-400'}`}>{docItem.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">v{docItem.version} · {docItem.lastUpdated}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Doc Content */}
        <div className="flex-1">
          {loading ? (
             <div className="h-96 bg-gray-900 border border-gray-800 rounded-xl animate-pulse" />
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-white font-bold">{currentDoc.title}</h2>
                  {editing === activeDoc ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Version:</span>
                      <input 
                        type="text" value={editVersion} onChange={e => setEditVersion(e.target.value)}
                        className="bg-gray-950 border border-gray-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 w-20"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs mt-0.5">Version {currentDoc.version} · Last updated {currentDoc.lastUpdated}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-1">{currentDoc.summary}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {savedId === activeDoc && (
                    <span className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />Saved</span>
                  )}
                  {editing !== activeDoc ? (
                    <button onClick={startEdit} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(null)} disabled={saving} className="text-xs text-gray-400 bg-gray-800 hover:text-white px-2 py-1.5 rounded-lg"><X className="w-3 h-3" /></button>
                      <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors">
                        {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editing === activeDoc ? (
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={25}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
                />
              ) : (
                <div className="bg-gray-800/50 rounded-xl p-5">
                  <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{currentDoc.content}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
