/**
 * geo.ts — Cloud Function for nearby worker geo-matching
 * Ported from apps/web/src/app/actions/geo.ts
 * Uses GeoHash for candidate discovery + Haversine for precise distance
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { geohashQueryBounds, distanceBetween } from 'geofire-common';

export interface NearbyWorker {
  id: string;
  workerNumber: string;
  name: string;
  profilePhoto: string | null;
  category: string;
  skills: string[];
  experience: string;
  hourlyRate: number;
  distanceKm: number;
  isOnline: boolean;
  stats: {
    completedJobs: number;
    averageRating: number;
    ratingCount: number;
  };
}

/**
 * Find nearby ONLINE + ACTIVE workers using GeoHash + Haversine.
 * 
 * Matching criteria:
 * - isOnline == true
 * - verificationStatus == 'ACTIVE'
 * - Within radiusKm of customer location
 * - If category provided: matches category
 * - If skills provided: has at least one matching skill
 * 
 * Called from mobile: (customer)/search.tsx
 * Called from web: apps/web/src/app/find-a-worker/page.tsx
 */
export const getNearbyWorkers = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in.');
    }

    const { 
      lat, 
      lng, 
      radiusKm = 5,    // Default 5km, configurable
      category,        // Optional filter
      skills           // Optional skill filter
    } = request.data as {
      lat: number;
      lng: number;
      radiusKm?: number;
      category?: string;
      skills?: string[];
    };

    if (!lat || !lng) {
      throw new HttpsError('invalid-argument', 'lat and lng are required.');
    }

    // Clamp radius to reasonable bounds
    const clampedRadius = Math.min(Math.max(radiusKm, 1), 50);
    const center: [number, number] = [lat, lng];
    const radiusM = clampedRadius * 1000;

    const db = getFirestore();
    const workersCol = db.collection('workers');

    // GeoHash range queries for candidate discovery
    const bounds = geohashQueryBounds(center, radiusM);
    const queries = bounds.map(([start, end]) =>
      workersCol
        .where('isOnline', '==', true)
        .where('verificationStatus', '==', 'ACTIVE')
        .where('geohash', '>=', start)
        .where('geohash', '<=', end)
        .get()
    );

    const snapshots = await Promise.all(queries);
    const results: NearbyWorker[] = [];
    const seen = new Set<string>();

    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        if (seen.has(doc.id)) continue;
        seen.add(doc.id);

        const data = doc.data();
        const loc = data.liveLocation;

        // Must have live location
        if (!loc?.lat || !loc?.lng) continue;

        // Precise Haversine distance check (GeoHash has edge false-positives)
        const distanceKm = distanceBetween([loc.lat, loc.lng], center);
        if (distanceKm > clampedRadius) continue;

        // Optional category filter
        if (category && data.category !== category) continue;

        // Optional skill filter — worker must have AT LEAST ONE matching skill
        if (skills && skills.length > 0) {
          const workerSkills: string[] = data.skills || [];
          const hasMatchingSkill = skills.some((s) =>
            workerSkills.some(
              (ws) => ws.toLowerCase().includes(s.toLowerCase())
            )
          );
          if (!hasMatchingSkill) continue;
        }

        results.push({
          id: doc.id,
          workerNumber: data.workerNumber || '',
          name: data.name || 'Worker',
          profilePhoto: data.profilePhoto || null,
          category: data.category || '',
          skills: data.skills || [],
          experience: data.experience || '',
          hourlyRate: data.hourlyRate || 0,
          distanceKm: Math.round(distanceKm * 10) / 10,
          isOnline: true,
          stats: {
            completedJobs: data.stats?.completedJobs || 0,
            averageRating: data.stats?.averageRating || 0,
            ratingCount: data.stats?.ratingCount || 0,
          },
          // NOTE: phone, liveLocation exact coords, address are NOT returned
        });
      }
    }

    // Sort by distance (closest first)
    results.sort((a, b) => a.distanceKm - b.distanceKm);

    return { workers: results, count: results.length, radiusKm: clampedRadius };
  }
);
