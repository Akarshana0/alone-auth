import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    try {
      const parsed = JSON.parse(serviceAccount);
      adminApp = initializeApp({
        credential: cert(parsed),
      });
    } catch {
      // Fallback: use application default credentials
      adminApp = initializeApp();
    }
  } else {
    // Use application default credentials (works in GCP/Firebase hosting)
    adminApp = initializeApp({
      projectId: 'alone-auth-1aee6',
    });
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export { adminApp };
