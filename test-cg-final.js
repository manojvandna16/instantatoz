const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const envLocal = fs.readFileSync('c:/Users/manoj/Downloads/instantatoz/apps/admin/.env.local', 'utf8');
const env = {};
envLocal.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim();
});

let privateKey = env.FIREBASE_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.replace(/^["']|["']$/g, '');
  privateKey = privateKey.replace(/\\n/g, '\n');
}

const clientEmail = env.FIREBASE_CLIENT_EMAIL?.replace(/^["']|["']$/g, '');
const projectId = env.FIREBASE_PROJECT_ID?.replace(/^["']|["']$/g, '');

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const db = getFirestore();

async function test() {
  try {
    console.log('Testing collectionGroup...');
    const snap = await db.collectionGroup('devices').get();
    console.log('Success:', snap.docs.length, 'devices');
  } catch (err) {
    console.error('Query error:', err.message);
  }
}
test();
