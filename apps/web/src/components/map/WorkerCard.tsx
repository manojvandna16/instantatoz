'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Briefcase, X } from 'lucide-react';
import type { NearbyWorker } from '@/app/actions/geo';

interface WorkerCardProps {
  worker: NearbyWorker;
  onClose: () => void;
}

export default function WorkerCard({ worker, onClose }: WorkerCardProps) {
  const avg = worker.stats.averageRating;
  const count = worker.stats.ratingCount;
  const jobs = worker.stats.completedJobs;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 relative animate-in slide-in-from-bottom-4 duration-300">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>

      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
          {worker.profilePhoto ? (
            <Image
              src={worker.profilePhoto}
              alt={worker.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">👷</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{worker.name}</h3>
          <p className="text-xs font-mono text-blue-600 mt-0.5">{worker.workerNumber}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            {avg > 0 ? (
              <>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-900">{avg.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({count} ratings)</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">New Worker</span>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {worker.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Info Row */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-green-500" />
          {worker.distanceKm} km away
        </span>
        <span className="flex items-center gap-1">
          <Briefcase className="w-4 h-4 text-blue-500" />
          {jobs} jobs
        </span>
        <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
          🟢 Online
        </span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/workers/${worker.id}`}
          className="text-center py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
        >
          View Profile
        </Link>
        <button
          className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
          onClick={() => alert('Booking Engine coming soon!')}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
