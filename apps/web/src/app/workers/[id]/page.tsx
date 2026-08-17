import { notFound } from 'next/navigation';
import { getPublicWorkerProfile } from '@/app/actions/worker';
import { Star, MapPin, Briefcase, User as UserIcon, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default async function WorkerProfilePage({ params }: { params: { id: string } }) {
  // `params.id` could be the Firebase UID or the `WRK-XXXXXX` number.
  // For now, we assume it's the Firebase UID based on routing from lists.
  // If we route by workerNumber in the future, we'll need to query by that.
  
  const worker = await getPublicWorkerProfile(params.id);

  if (!worker) {
    notFound();
  }

  // Calculate distance placeholder until we have live geo queries
  const approximateDistance = '1.7'; 

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Worker Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-start">
              
              {/* Profile Photo */}
              <div className="shrink-0 relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md mx-auto md:mx-0">
                {worker.profilePhoto ? (
                  <Image 
                    src={worker.profilePhoto} 
                    alt={worker.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-plus-jakarta flex items-center justify-center md:justify-start gap-2">
                      {worker.name}
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    </h1>
                    <p className="text-sm font-mono text-gray-500 mt-1">{worker.workerNumber}</p>
                  </div>

                  {/* Status & Distance */}
                  <div className="flex flex-col items-center md:items-end gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{approximateDistance} km away</span>
                    </div>
                    {worker.isOnline ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-sm font-medium text-green-700">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Available
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        Offline
                      </div>
                    )}
                  </div>
                </div>

                {/* Ratings Overview */}
                <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-sm">
                  <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg font-semibold">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    {worker.stats.averageRating.toFixed(1)}
                  </div>
                  <span className="text-gray-500">
                    ({worker.stats.ratingCount} ratings)
                  </span>
                  <span className="text-gray-300 mx-2">•</span>
                  <span className="font-semibold text-gray-900">{worker.stats.completedJobs}</span>
                  <span className="text-gray-500">Jobs Completed</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 font-plus-jakarta mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Skills & Services
            </h2>
            <div className="flex flex-wrap gap-2">
              {worker.skills.length > 0 ? (
                worker.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No skills listed.</span>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 font-plus-jakarta mb-4">
              Experience
            </h2>
            <p className="text-gray-700">
              {worker.experience}
            </p>
          </div>
          
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <button 
            className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!worker.isOnline}
          >
            Book This Worker
          </button>
          {!worker.isOnline && (
            <p className="text-center text-sm text-gray-500 mt-2">
              This worker is currently offline and cannot be booked.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
