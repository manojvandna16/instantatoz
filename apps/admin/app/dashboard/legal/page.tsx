'use client';

import { useState } from 'react';
import { Scale, Edit3, Save, X, Check, ExternalLink } from 'lucide-react';

const LEGAL_DOCS = [
  {
    id: 'privacy_policy',
    title: 'Privacy Policy',
    lastUpdated: '2024-01-15',
    version: '1.2',
    summary: 'Describes how Instantatoz collects, uses, and protects user data.',
    content: `PRIVACY POLICY — Instantatoz

Last Updated: January 15, 2024

1. INFORMATION WE COLLECT
We collect information you provide when registering (name, phone, email), location data for service matching, payment information (processed securely by Razorpay), and usage data.

2. HOW WE USE YOUR INFORMATION
To match customers with nearby service workers, to process payments, to send service notifications, and to improve our platform.

3. DATA SHARING
We do not sell your personal data. We share data with service workers only for job fulfillment, and with Razorpay for payment processing.

4. DATA SECURITY
All data is stored on Firebase (Google Cloud) with encryption at rest and in transit.

5. YOUR RIGHTS
You may request deletion of your account and data by contacting support@instantatoz.com.

6. CONTACT
Email: support@instantatoz.com | Phone: [Add contact number]`,
  },
  {
    id: 'terms_of_service',
    title: 'Terms of Service',
    lastUpdated: '2024-01-15',
    version: '1.1',
    summary: 'Rules governing the use of the Instantatoz platform.',
    content: `TERMS OF SERVICE — Instantatoz

Last Updated: January 15, 2024

1. ACCEPTANCE
By using Instantatoz, you agree to these terms.

2. ELIGIBILITY
Users must be 18+ years old. Workers must pass verification.

3. SERVICES
Instantatoz provides a platform to connect customers with local service workers. We do not employ workers directly.

4. PAYMENTS
All payments are processed via Razorpay. Platform charges a commission on each transaction.

5. CANCELLATION
Customers may cancel before a worker is assigned at no charge. Post-acceptance cancellations may incur a fee.

6. PROHIBITED CONDUCT
Misuse of the platform, fraudulent reviews, or harassment will result in account termination.

7. LIMITATION OF LIABILITY
Instantatoz is not liable for the quality of services provided by independent workers.`,
  },
  {
    id: 'worker_agreement',
    title: 'Worker Agreement',
    lastUpdated: '2024-01-15',
    version: '1.0',
    summary: 'Terms for service workers registered on the platform.',
    content: `WORKER AGREEMENT — Instantatoz

Last Updated: January 15, 2024

1. INDEPENDENT CONTRACTOR
Workers are independent contractors, not employees of Instantatoz.

2. VERIFICATION
Workers must submit valid government ID. False documentation results in permanent ban.

3. SERVICE STANDARDS
Workers are expected to maintain professional conduct, arrive on time, and complete jobs as described.

4. PAYMENT
Earnings are released after job completion minus platform commission. Payout timelines vary.

5. RATING SYSTEM
Workers must maintain a minimum rating to remain on the platform.`,
  },
];

export default function LegalPage() {
  const [docs, setDocs] = useState(LEGAL_DOCS);
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [activeDoc, setActiveDoc] = useState(LEGAL_DOCS[0].id);
  const [saved, setSaved] = useState<string | null>(null);

  const currentDoc = docs.find(d => d.id === activeDoc)!;

  function startEdit() {
    setEditing(activeDoc);
    setEditContent(currentDoc.content);
  }

  function saveEdit() {
    setDocs(prev => prev.map(d => d.id === activeDoc ? { ...d, content: editContent, lastUpdated: new Date().toISOString().split('T')[0] } : d));
    setEditing(null);
    setSaved(activeDoc);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Legal Documents</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage Privacy Policy, Terms of Service, and Worker Agreement.</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-xs text-amber-400">
          ⚠️ Changes made here are session-only. To persist legal documents, connect to a Firestore <code className="bg-black/30 px-1 rounded">legal_documents</code> collection or your CMS.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Doc Selector */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {docs.map(doc => (
              <button key={doc.id} onClick={() => { setActiveDoc(doc.id); setEditing(null); }}
                className={`w-full text-left px-4 py-3 border-b border-gray-800 last:border-0 transition-colors ${activeDoc === doc.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'hover:bg-gray-800/40'}`}>
                <p className={`text-sm font-medium ${activeDoc === doc.id ? 'text-white' : 'text-gray-400'}`}>{doc.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">v{doc.version} · {doc.lastUpdated}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Doc Content */}
        <div className="flex-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold">{currentDoc.title}</h2>
                <p className="text-gray-500 text-xs mt-0.5">Version {currentDoc.version} · Last updated {currentDoc.lastUpdated}</p>
                <p className="text-gray-400 text-sm mt-1">{currentDoc.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                {saved === activeDoc && (
                  <span className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />Saved</span>
                )}
                {editing !== activeDoc ? (
                  <button onClick={startEdit} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(null)} className="text-xs text-gray-400 bg-gray-800 px-2 py-1.5 rounded-lg"><X className="w-3 h-3" /></button>
                    <button onClick={saveEdit} className="flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg">
                      <Save className="w-3 h-3" /> Save
                    </button>
                  </div>
                )}
              </div>
            </div>

            {editing === activeDoc ? (
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={20}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
              />
            ) : (
              <div className="bg-gray-800/50 rounded-xl p-5">
                <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{currentDoc.content}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
