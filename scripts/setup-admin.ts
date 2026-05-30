import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function setup() {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountStr) {
    console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
    process.exit(1);
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountStr);
    
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }

    const auth = getAuth();
    const db = getFirestore();

    const email = 'admin@aloneauth.com';
    const password = 'SecurePassword123!';

    console.log(`Checking if admin user ${email} exists...`);
    
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('Admin user already exists.');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log('Creating admin user...');
        userRecord = await auth.createUser({
          email,
          password,
          emailVerified: true,
        });
        console.log('Admin user created successfully.');
      } else {
        throw error;
      }
    }

    // Seed default application if none exists
    const appsSnap = await db.collection('applications').limit(1).get();
    if (appsSnap.empty) {
       console.log('Creating default application...');
       await db.collection('applications').add({
          name: 'Default App',
          apiKey: 'aa_setup_default_key_replace_me',
          enabled: true,
          createdAt: Timestamp.now()
       });
       console.log('Default application created.');
    }

    console.log('Setup complete!');
    console.log('Email:', email);
    console.log('Password:', password);

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setup();
