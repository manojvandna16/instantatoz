"use strict";
/**
 * scripts/setAdminClaims.ts — One-time script to bootstrap admin custom claims
 *
 * Usage:
 *   cd firebase/functions
 *   npx tsx src/scripts/setAdminClaims.ts
 *
 * This sets `admin: true` and `role: <role>` custom claims on Firebase Auth users.
 * After running, users must re-authenticate to receive the new claims.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
(0, app_1.initializeApp)({
    credential: (0, app_1.cert)({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
});
const auth = (0, auth_1.getAuth)();
const ADMINS = [
// Add your admin users here. Example:
// { uid: 'firebase-uid-here', email: 'admin@instantatoz.online', role: 'SUPER_ADMIN' },
];
async function setClaims() {
    console.log(`Setting custom claims for ${ADMINS.length} admins...`);
    for (const admin of ADMINS) {
        try {
            await auth.setCustomUserClaims(admin.uid, {
                admin: true,
                role: admin.role,
            });
            console.log(`  ✓ ${admin.email} → ${admin.role}`);
        }
        catch (err) {
            console.error(`  ✗ ${admin.email}: ${err.message}`);
        }
    }
    console.log('Done. All users must re-authenticate to receive updated claims.');
}
setClaims().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
//# sourceMappingURL=setAdminClaims.js.map