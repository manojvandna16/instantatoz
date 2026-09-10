'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Star, Search, Eye, X, TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface Review {
  id: string;
  jobId?: string;
  reviewerId?: string;
  reviewerName?: string;
  revieweeId?: string;
  revieweeName?: string;
  rating: number;
  comment?: string;
  type?: 'CUSTOMER_TO_WORKER' | 'WORKER_TO_CUSTOMER';
  createdAt: any;
  isHidden?: boolean;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function RatingsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [selected, setSelected] = useState<Review | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  async function toggleHide(review: Review) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, 'reviews', review.id), { isHidden: !review.isHidden });
  }

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    const searchOk = !q || r.reviewerName?.toLowerCase().includes(q) || r.revieweeName?.toLowerCase().includes(q) || r.comment?.toLowerCase().includes(q);
    const ratingOk = ratingFilter === 'ALL' || String(Math.floor(r.rating)) === ratingFilter;
    return searchOk && ratingOk;
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const dist = [5, 4, 3, 2, 1].map(n => ({ star: n, count: reviews.filter(r => Math.round(r.rating) === n).length }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Ratings & Reviews</h1>
        <p className="text-sm text-gray-400 mt-0.5">{reviews.length} total reviews</p>
      </div>

      {/* Overview */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex flex-wrap gap-8 items-center">
          <div className="text-center">
            <p className="text-5xl font-bold text-yellow-400">{avgRating.toFixed(1)}</p>
            <StarDisplay rating={Math.round(avgRating)} />
            <p className="text-xs text-gray-500 mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 min-w-[200px]">
            {dist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400 w-4">{star}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }} />
                </div>
                <span className="text-xs text-gray-500 w-8">{count}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-400">{reviews.filter(r => r.rating >= 4).length}</p>
              <p className="text-xs text-gray-500 mt-0.5">4+ Stars</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-red-400">{reviews.filter(r => r.rating <= 2).length}</p>
              <p className="text-xs text-gray-500 mt-0.5">1-2 Stars</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviewer, reviewee, comment..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {['ALL', '5', '4', '3', '2', '1'].map(r => (
            <button key={r} onClick={() => setRatingFilter(r)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${ratingFilter === r ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white'}`}>
              {r === 'ALL' ? 'All' : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl h-24 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Star className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className={`bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-4 hover:border-gray-700 transition-colors ${r.isHidden ? 'opacity-40' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <StarDisplay rating={r.rating} />
                  <span className="text-xs text-gray-500">by {r.reviewerName || '—'} → {r.revieweeName || '—'}</span>
                  {r.type && <span className="text-xs text-gray-600">{r.type.replace(/_/g, ' ')}</span>}
                  {r.isHidden && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Hidden</span>}
                </div>
                {r.comment && <p className="text-gray-300 text-sm">{r.comment}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(r.createdAt, false)}</span>
                <div className="flex gap-1">
                  <button onClick={() => setSelected(r)} className="text-xs text-blue-400 hover:text-blue-300 underline">View</button>
                  <span className="text-gray-700">·</span>
                  <button onClick={() => toggleHide(r)} className="text-xs text-gray-500 hover:text-red-400 underline">{r.isHidden ? 'Unhide' : 'Hide'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-gray-950 border-l border-gray-800 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Review Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="mb-5 bg-gray-900 border border-gray-800 rounded-xl p-4">
                <StarDisplay rating={selected.rating} />
                {selected.comment && <p className="text-gray-300 text-sm mt-3 leading-relaxed">{selected.comment}</p>}
              </div>

              <RSection title="Reviewer">
                <RRow label="Name" value={selected.reviewerName || '—'} />
                <RRow label="User ID" value={selected.reviewerId || '—'} mono />
              </RSection>

              <RSection title="About">
                <RRow label="Name" value={selected.revieweeName || '—'} />
                <RRow label="User ID" value={selected.revieweeId || '—'} mono />
                <RRow label="Review Type" value={selected.type?.replace(/_/g, ' ') || '—'} />
              </RSection>

              {selected.jobId && (
                <RSection title="Job">
                  <RRow label="Job ID" value={selected.jobId} mono />
                </RSection>
              )}

              <RSection title="Info">
                <RRow label="Review ID" value={selected.id} mono />
                <RRow label="Date" value={formatDate(selected.createdAt)} />
                <RRow label="Status" value={selected.isHidden ? 'Hidden' : 'Visible'} />
              </RSection>

              <button onClick={() => { toggleHide(selected); setSelected(null); }}
                className={`w-full py-2.5 rounded-lg text-sm font-medium mt-4 ${selected.isHidden ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                {selected.isHidden ? 'Make Visible' : 'Hide this Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">{children}</div>
    </div>
  );
}
function RRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} text-white text-right max-w-[60%] break-all`}>{value}</span>
    </div>
  );
}
