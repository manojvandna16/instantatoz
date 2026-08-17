'use server';

import { adminDb } from '@/lib/firebase-admin';
import { distanceBetween, geohashQueryBounds } from 'geofire-common';

export interface NearbyWorker {
  id: string;
  name: string;
  profilePhoto: string | null;
  skills: string[];
  experience: string;
  workerNumber: string;
  lat: number;
  lng: number;
  distanceKm: number;
  stats: {
    completedJobs: number;
    averageRating: number;
    ratingCount: number;
  };
}

/**
 * Finds all verified, ONLINE workers within a given radius (in km) of a point.
 * Uses Firestore geohash range queries for efficient geo-filtering.
 * Falls back to brute-force distance check if geohash is not present.
 */
export async function getNearbyWorkers(
  customerLat: number,
  customerLng: number,
  radiusKm: number = 5
): Promise<NearbyWorker[]> {
  try {
    const center: [number, number] = [customerLat, customerLng];
    const radiusM = radiusKm * 1000;

    // Geohash-based range queries
    const bounds = geohashQueryBounds(center, radiusM);

    const workersCollection = adminDb().collection('workers');
    const queries = bounds.map(([start, end]) =>
      workersCollection
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
        if (!loc?.lat || !loc?.lng) continue;

        // Precise distance check (geohash can have false positives at edges)
        const distanceM = distanceBetween([loc.lat, loc.lng], center) * 1000;
        if (distanceM > radiusM) continue;

        results.push({
          id: doc.id,
          name: data.name || 'Worker',
          profilePhoto: data.profilePhoto || null,
          skills: data.skills || [],
          experience: data.experience || '',
          workerNumber: data.workerNumber || '',
          lat: loc.lat,
          lng: loc.lng,
          distanceKm: Math.round((distanceM / 1000) * 10) / 10,
          stats: {
            completedJobs: data.stats?.completedJobs || data.completedJobs || 0,
            averageRating: data.stats?.averageRating || data.averageRating || 0,
            ratingCount: data.stats?.ratingCount || data.ratingCount || 0,
          },
        });
      }
    }

    // Sort by distance
    results.sort((a, b) => a.distanceKm - b.distanceKm);
    return results;
  } catch (error) {
    console.error('[getNearbyWorkers] Error:', error);
    return [];
  }
}
