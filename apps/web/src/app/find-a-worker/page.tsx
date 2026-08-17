'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getNearbyWorkers } from '@/app/actions/geo';
import type { NearbyWorker } from '@/app/actions/geo';
import WorkerCard from '@/components/map/WorkerCard';
import { MapPin, Loader2, RefreshCw, AlertCircle, Users, SlidersHorizontal } from 'lucide-react';

// Dynamically import map to avoid SSR errors (Leaflet needs browser)
const WorkerMap = dynamic(() => import('@/components/map/WorkerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  ),
});

type LocationState = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

export default function FindWorkerMapPage() {
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [workers, setWorkers] = useState<NearbyWorker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<NearbyWorker | null>(null);
  const [loading, setLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [error, setError] = useState('');

  const fetchWorkers = useCallback(async (lat: number, lng: number, radius: number) => {
    setLoading(true);
    setError('');
    try {
      const nearby = await getNearbyWorkers(lat, lng, radius);
      setWorkers(nearby);
    } catch (err) {
      setError('Could not fetch nearby workers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationState('error');
      setError('Your browser does not support location access.');
      return;
    }

    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setLocationState('granted');
        fetchWorkers(lat, lng, radiusKm);
      },
      (err) => {
        setLocationState('denied');
        setError('Location access was denied. Please allow location to find nearby workers.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchWorkers, radiusKm]);

  const handleRefresh = () => {
    if (coords) fetchWorkers(coords.lat, coords.lng, radiusKm);
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    if (coords) fetchWorkers(coords.lat, coords.lng, newRadius);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-plus-jakarta">
            Find Workers Near You
          </h1>
          <p className="text-gray-500 mt-2">
            See verified workers available right now in your area.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Location Request Screen */}
        {locationState === 'idle' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Allow Location Access</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
              Instantatoz needs your location to show you verified workers nearby. 
              Your exact location is never shared with workers — only approximate distance is shown.
            </p>
            <button
              onClick={requestLocation}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              <MapPin className="w-5 h-5" />
              Share My Location
            </button>
            <p className="text-xs text-gray-400 mt-4">
              By sharing your location, you agree to our{' '}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        )}

        {/* Requesting */}
        {locationState === 'requesting' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Getting your location...</p>
          </div>
        )}

        {/* Denied */}
        {locationState === 'denied' && (
          <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-10 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Location Access Denied</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Please allow location access in your browser settings and try again.
            </p>
            <button
              onClick={requestLocation}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Map View */}
        {locationState === 'granted' && coords && (
          <div className="space-y-4">
            
            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <SlidersHorizontal className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm font-medium text-gray-700">Search radius:</span>
                {[2, 5, 10].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRadiusChange(r)}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      radiusKm === r
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-gray-900">{workers.length}</span> online
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Map */}
            <WorkerMap
              customerLat={coords.lat}
              customerLng={coords.lng}
              workers={workers}
              onWorkerSelect={(w) => setSelectedWorker(w)}
            />

            {/* Worker Card (when selected from map pin) */}
            {selectedWorker && (
              <WorkerCard
                worker={selectedWorker}
                onClose={() => setSelectedWorker(null)}
              />
            )}

            {/* Workers List below map */}
            {workers.length > 0 ? (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Nearby Workers ({workers.length})
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {workers.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWorker(w)}
                      className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">
                          👷
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{w.name}</p>
                          <p className="text-xs text-gray-500 truncate">{w.skills.slice(0, 2).join(', ')}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {w.stats.averageRating > 0 && (
                              <span className="text-xs font-medium text-yellow-700">
                                ⭐ {w.stats.averageRating.toFixed(1)}
                              </span>
                            )}
                            <span className="text-xs text-blue-600">📍 {w.distanceKm} km</span>
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Online</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : !loading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-3xl mb-3">🔍</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers online nearby</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try increasing the search radius or check back later.
                </p>
                <button
                  onClick={() => handleRadiusChange(10)}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Expand to 10 km
                </button>
              </div>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
