import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAvX3nsAbCXR5uneRP_OiGnoFpR6Ynvuag",
  authDomain: "alone-auth-1aee6.firebaseapp.com",
  projectId: "alone-auth-1aee6",
  storageBucket: "alone-auth-1aee6.firebasestorage.app",
  messagingSenderId: "1076031640512",
  appId: "1:1076031640512:web:6e79579d3e90fea9d4ee25",
  measurementId: "G-NCTF2NYQG5"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
