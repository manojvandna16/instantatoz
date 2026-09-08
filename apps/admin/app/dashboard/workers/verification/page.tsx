'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Clock, CheckCircle, XCircle, Info, AlertTriangle, Eye, Loader2 } from 'lucide-react';
import type { Worker } from '@/types';
import { clsx } from 'clsx';

export default function WorkerVerificationPage() {
  const [pending, setPending] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleVerify = async (workerId: string, status: 'APPROVED' | 'REJECTED' | 'NEEDS_MORE_INFO') => {
    try {
      setProcessingId(workerId);
      const res = await fetch(`/api/workers/${workerId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: '' }),
      });
      if (!res.ok) throw new Error('Failed to update status');
    } catch (error) {
      console.error(error);
      alert('Failed to update worker verification status');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
                <p className="text-xs text-gray-400 mb-2 font-medium">Documents ({worker.documents.length})</p>
                <div className="flex gap-2 flex-wrap">
                  {worker.documents.map(doc => (
                    <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                      📄 {doc.type}
                      {doc.verified && <CheckCircle className="w-3 h-3 text-green-400" />}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
