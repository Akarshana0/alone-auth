import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  where,
  writeBatch,
  getCountFromServer,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { License, LicenseTier, Log, LogType, LogStatus, Application } from '@/types';
import { generateKey, generateApiKey } from './keygen';

// ==================== LICENSES ====================

export async function createLicenses(
  count: number,
  tier: LicenseTier
): Promise<string[]> {
  const batch = writeBatch(db);
  const keys: string[] = [];
  const now = Timestamp.now();

  for (let i = 0; i < Math.min(count, 100); i++) {
    const key = generateKey();
    const ref = doc(db, 'licenses', key);
    const expiry = calculateExpiry(tier);

    batch.set(ref, {
      key,
      status: 'unused',
      expiry,
      tier,
      hwid: null,
      boundAt: null,
      createdAt: now,
      usedBy: null,
    });

    keys.push(key);
  }

  await batch.commit();
  return keys;
}

export function calculateExpiry(tier: LicenseTier): Timestamp | null {
  if (tier === 'lifetime') return null;

  const now = new Date();
  switch (tier) {
    case '1day':
      now.setDate(now.getDate() + 1);
      break;
    case '1week':
      now.setDate(now.getDate() + 7);
      break;
    case '1month':
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return Timestamp.fromDate(now);
}

export async function banLicense(key: string): Promise<void> {
  const ref = doc(db, 'licenses', key);
  await updateDoc(ref, { status: 'banned' });
  await addLog('ban', 'warning', `License ${key} has been banned`, key);
}

export async function deleteLicense(key: string): Promise<void> {
  const ref = doc(db, 'licenses', key);
  await deleteDoc(ref);
  await addLog('delete', 'warning', `License ${key} has been deleted`, key);
}

export async function resetHWID(key: string): Promise<void> {
  const ref = doc(db, 'licenses', key);
  await updateDoc(ref, { hwid: null, boundAt: null });
  await addLog('reset_hwid', 'success', `HWID reset for license ${key}`, key);
}

export function subscribeLicenses(
  callback: (licenses: License[]) => void,
  constraints: QueryConstraint[] = []
) {
  const q = query(
    collection(db, 'licenses'),
    orderBy('createdAt', 'desc'),
    ...constraints
  );

  return onSnapshot(q, (snapshot) => {
    const licenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as License[];
    callback(licenses);
  });
}

// ==================== USERS ====================

export function subscribeUsers(
  callback: (users: import('@/types').User[]) => void
) {
  const q = query(
    collection(db, 'users'),
    orderBy('lastSeen', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as import('@/types').User[];
    callback(users);
  });
}

export async function banUser(userId: string, banned: boolean): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, { banned });
}

// ==================== LOGS ====================

export async function addLog(
  type: LogType,
  status: LogStatus,
  message: string,
  key?: string | null,
  extra?: Partial<Log>
): Promise<void> {
  const ref = doc(collection(db, 'logs'));
  await setDoc(ref, {
    type,
    status,
    message,
    key: key || null,
    username: extra?.username || null,
    hwid: extra?.hwid || null,
    ip: extra?.ip || null,
    appName: extra?.appName || null,
    timestamp: Timestamp.now(),
  });
}

export function subscribeLogs(
  callback: (logs: Log[]) => void,
  maxLogs: number = 50
) {
  const q = query(
    collection(db, 'logs'),
    orderBy('timestamp', 'desc'),
    limit(maxLogs)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Log[];
    callback(logs);
  });
}

// ==================== APPLICATIONS ====================

export async function createApplication(name: string): Promise<Application> {
  const ref = doc(collection(db, 'applications'));
  const apiKey = generateApiKey();
  const data = {
    name,
    apiKey,
    enabled: true,
    createdAt: Timestamp.now(),
  };
  await setDoc(ref, data);
  return { id: ref.id, ...data } as Application;
}

export async function deleteApplication(appId: string): Promise<void> {
  await deleteDoc(doc(db, 'applications', appId));
}

export async function toggleApplication(appId: string, enabled: boolean): Promise<void> {
  await updateDoc(doc(db, 'applications', appId), { enabled });
}

export async function regenerateApiKey(appId: string): Promise<string> {
  const newKey = generateApiKey();
  await updateDoc(doc(db, 'applications', appId), { apiKey: newKey });
  return newKey;
}

export function subscribeApplications(
  callback: (apps: Application[]) => void
) {
  const q = query(
    collection(db, 'applications'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Application[];
    callback(apps);
  });
}

// ==================== STATS ====================

export async function getDashboardStats() {
  const [licensesSnap, usersSnap, appsSnap] = await Promise.all([
    getDocs(collection(db, 'licenses')),
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(collection(db, 'applications')),
  ]);

  let activeKeys = 0;
  let blockedHWIDs = 0;
  const hwids = new Set<string>();

  licensesSnap.docs.forEach((doc) => {
    const data = doc.data();
    if (data.status === 'active' || data.status === 'unused') activeKeys++;
    if (data.status === 'banned' && data.hwid) {
      hwids.add(data.hwid);
    }
  });

  blockedHWIDs = hwids.size;

  return {
    totalLicenses: licensesSnap.size,
    activeKeys,
    blockedHWIDs,
    totalUsers: usersSnap.data().count,
    totalApplications: appsSnap.data().count,
  };
}
