const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./instantatoz-firebase-adminsdk-fbsvc-60c7a0a02c.json');

initializeApp({
  credential: cert(serviceAccount)
});

const email = 'manojbhatt900@gmail.com';

async function makeAdmin() {
  const auth = getAuth();
  try {
    const user = await auth.getUserByEmail(email);
    console.log('User found:', user.uid);
    
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
      role: 'SUPER_ADMIN'
    });
    console.log('Success: Admin claims set for', email);
    console.log('Next step: Clear browser cookies for admin.instantatoz.online and re-login.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeAdmin();
