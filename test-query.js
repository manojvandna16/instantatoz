const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: 'apps/admin/.env.local' });

let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.replace(/^["']|["']$/g, '');
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/^["']|["']$/g, '');
const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/^["']|["']$/g, '');

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const db = getFirestore();

async function test() {
  try {
    const snap = await db.collection('notifications')
      .where('userId', 'in', ['user123', 'ALL_USERS', 'FILTERED:worker'])
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    console.log('Success:', snap.docs.length, 'docs');
  } catch (err) {
    console.error('Query error:', err.message);
  }
}
test();
