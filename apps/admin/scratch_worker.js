const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(path.join(__dirname, '../../firebase/service-account.json')))
  });
}

const db = admin.firestore();

async function checkWorker() {
  const workerId = 'N4kJsRQZcncNdGRqV3AziWuzaWU2';
  try {
    const docRef = db.collection('workers').doc(workerId);
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('Worker exists:', doc.data());
    } else {
      console.log('Worker does NOT exist with ID:', workerId);
      
      // Let's list all workers to see what the actual ID is
      console.log('\nListing all workers in db:');
      const allWorkers = await db.collection('workers').get();
      allWorkers.forEach(w => {
        console.log(`- ID: ${w.id}, Name: ${w.data().name}, Phone: ${w.data().phone}`);
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkWorker();
