import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { ValidationRequest, ValidationResponse, License } from '@/types';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ valid: false, message: 'Missing X-API-Key header' }, { status: 401 });
    }

    // 1. Verify API Key against `applications` collection
    const appsSnapshot = await adminDb.collection('applications').where('apiKey', '==', apiKey).limit(1).get();
    
    if (appsSnapshot.empty) {
      return NextResponse.json({ valid: false, message: 'Invalid API Key' }, { status: 401 });
    }

    const appDoc = appsSnapshot.docs[0].data();
    if (!appDoc.enabled) {
      return NextResponse.json({ valid: false, message: 'Application is disabled' }, { status: 403 });
    }
    
    const appName = appDoc.name;

    // 2. Parse request body
    const body: ValidationRequest = await req.json();
    const { key, hwid, username } = body;

    if (!key || !hwid) {
      return NextResponse.json({ valid: false, message: 'Missing key or hwid in request' }, { status: 400 });
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Helper to write to logs
    const writeLog = async (status: 'success' | 'failure' | 'warning', message: string, type: string = 'validate') => {
      await adminDb.collection('logs').add({
        type,
        status,
        message,
        key,
        hwid,
        username: username || null,
        ip: clientIp,
        appName,
        timestamp: Timestamp.now()
      });
    };

    // 3. Fetch License
    const licenseRef = adminDb.collection('licenses').doc(key);
    const licenseSnap = await licenseRef.get();

    if (!licenseSnap.exists) {
      await writeLog('failure', 'Invalid license key');
      return NextResponse.json({ valid: false, message: 'Invalid license key' }, { status: 401 });
    }

    const license = licenseSnap.data() as License;

    // 4. Check status
    if (license.status === 'banned') {
      await writeLog('failure', 'Attempted to use banned key');
      return NextResponse.json({ valid: false, message: 'This license has been banned' }, { status: 403 });
    }

    if (license.status === 'expired') {
      await writeLog('failure', 'Attempted to use expired key');
      return NextResponse.json({ valid: false, message: 'This license has expired' }, { status: 403 });
    }

    // 5. Check Expiry
    if (license.expiry) {
      const now = Timestamp.now();
      if (now.toMillis() > license.expiry.toMillis()) {
        await licenseRef.update({ status: 'expired' });
        await writeLog('failure', 'License expired');
        return NextResponse.json({ valid: false, message: 'This license has expired' }, { status: 403 });
      }
    }

    // 6. HWID Binding
    let updatedLicense = { ...license };
    if (!license.hwid) {
      // First time use, bind HWID
      const updateData = {
        hwid,
        boundAt: Timestamp.now(),
        status: 'active',
        usedBy: username || null
      };
      await licenseRef.update(updateData);
      updatedLicense = { ...license, ...updateData } as any;
    } else if (license.hwid !== hwid) {
      // HWID mismatch
      await writeLog('failure', 'HWID mismatch on valid key');
      return NextResponse.json({ valid: false, message: 'Hardware ID mismatch' }, { status: 403 });
    }

    // 7. Upsert User
    if (username) {
      const userRef = adminDb.collection('users').doc(username);
      const userSnap = await userRef.get();
      
      if (userSnap.exists && userSnap.data()?.banned) {
         await writeLog('failure', 'Banned user attempted to login');
         return NextResponse.json({ valid: false, message: 'User account is banned' }, { status: 403 });
      }

      const userData = {
        username,
        licenseKey: key,
        hwid,
        ip: clientIp,
        lastSeen: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (!userSnap.exists) {
        await userRef.set({ ...userData, createdAt: Timestamp.now(), banned: false });
      } else {
        await userRef.update(userData);
      }
    }

    // 8. Success Log
    await writeLog('success', 'Successful authentication');

    const response: ValidationResponse = {
      valid: true,
      message: 'Authenticated successfully',
      tier: updatedLicense.tier,
      expiry: updatedLicense.expiry ? updatedLicense.expiry.toDate().toISOString() : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Validation Error:', error);
    return NextResponse.json({ valid: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
