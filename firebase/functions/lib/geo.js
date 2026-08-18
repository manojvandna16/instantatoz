"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyWorkers = void 0;
/**
 * geo.ts � Cloud Function for nearby worker geo-matching
 * Ported from apps/web/src/app/actions/geo.ts
 * Uses GeoHash for candidate discovery + Haversine for precise distance
 */
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const geofire_common_1 = require("geofire-common");
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
exports.getNearbyWorkers = (0, https_1.onCall)({ region: 'asia-south1' }, async (request) => {
    var _a, _b, _c;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const { lat, lng, radiusKm = 5, // Default 5km, configurable
    category, // Optional filter
    skills // Optional skill filter
     } = request.data;
    if (!lat || !lng) {
        throw new https_1.HttpsError('invalid-argument', 'lat and lng are required.');
    }
    // Clamp radius to reasonable bounds
    const clampedRadius = Math.min(Math.max(radiusKm, 1), 50);
    const center = [lat, lng];
    const radiusM = clampedRadius * 1000;
    const db = (0, firestore_1.getFirestore)();
    const workersCol = db.collection('workers');
    // GeoHash range queries for candidate discovery
    const bounds = (0, geofire_common_1.geohashQueryBounds)(center, radiusM);
    const queries = bounds.map(([start, end]) => workersCol
        .where('isOnline', '==', true)
        .where('verificationStatus', '==', 'ACTIVE')
        .where('geohash', '>=', start)
        .where('geohash', '<=', end)
        .get());
    const snapshots = await Promise.all(queries);
    const results = [];
    const seen = new Set();
    for (const snap of snapshots) {
        for (const doc of snap.docs) {
            if (seen.has(doc.id))
                continue;
            seen.add(doc.id);
            const data = doc.data();
            const loc = data.liveLocation;
            // Must have live location
            if (!(loc === null || loc === void 0 ? void 0 : loc.lat) || !(loc === null || loc === void 0 ? void 0 : loc.lng))
                continue;
            // Precise Haversine distance check (GeoHash has edge false-positives)
            const distanceKm = (0, geofire_common_1.distanceBetween)([loc.lat, loc.lng], center);
            if (distanceKm > clampedRadius)
                continue;
            // Optional category filter
            if (category && data.category !== category)
                continue;
            // Optional skill filter � worker must have AT LEAST ONE matching skill
            if (skills && skills.length > 0) {
                const workerSkills = data.skills || [];
                const hasMatchingSkill = skills.some((s) => workerSkills.some((ws) => ws.toLowerCase().includes(s.toLowerCase())));
                if (!hasMatchingSkill)
                    continue;
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
                    completedJobs: ((_a = data.stats) === null || _a === void 0 ? void 0 : _a.completedJobs) || 0,
                    averageRating: ((_b = data.stats) === null || _b === void 0 ? void 0 : _b.averageRating) || 0,
                    ratingCount: ((_c = data.stats) === null || _c === void 0 ? void 0 : _c.ratingCount) || 0,
                },
                // NOTE: phone, liveLocation exact coords, address are NOT returned
            });
        }
    }
    // Sort by distance (closest first)
    results.sort((a, b) => a.distanceKm - b.distanceKm);
    return { workers: results, count: results.length, radiusKm: clampedRadius };
});
//# sourceMappingURL=geo.js.map