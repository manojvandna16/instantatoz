const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const env = fs.readFileSync('apps/web/.env.local', 'utf8');
const pkLine = env.split('\n').find(l => l.startsWith('FIREBASE_PRIVATE_KEY='));
let pk = pkLine.substring(21);
pk = pk.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

initializeApp({
  credential: cert({
    projectId: 'instantatoz',
    clientEmail: 'firebase-adminsdk-fbsvc@instantatoz.iam.gserviceaccount.com',
    privateKey: pk
  })
});

async function run() {
  const db = getFirestore();
  const snap = await db.collectionGroup('devices').get();
  let count = 0;
  snap.docs.forEach(d => {
    const data = d.data();
    if (data.expoToken) {
      console.log('Found token:', data.expoToken);
      count++;
    }
  });
  console.log('Total tokens found:', count);
}
run();
