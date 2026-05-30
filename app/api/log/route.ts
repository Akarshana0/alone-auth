import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ valid: false, message: 'Missing X-API-Key header' }, { status: 401 });
    }

    // 1. Verify API Key
    const appsSnapshot = await adminDb.collection('applications').where('apiKey', '==', apiKey).limit(1).get();
    if (appsSnapshot.empty) {
      return NextResponse.json({ valid: false, message: 'Invalid API Key' }, { status: 401 });
    }

    const appDoc = appsSnapshot.docs[0].data();
    if (!appDoc.enabled) {
      return NextResponse.json({ valid: false, message: 'Application is disabled' }, { status: 403 });
    }

    const body = await req.json();
    const { status, message, key, hwid, username } = body;

    if (!message) {
      return NextResponse.json({ valid: false, message: 'Missing message in request body' }, { status: 400 });
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    await adminDb.collection('logs').add({
      type: 'custom',
      status: status || 'success',
      message,
      key: key || null,
      hwid: hwid || null,
      username: username || null,
      ip: clientIp,
      appName: appDoc.name,
      timestamp: Timestamp.now()
    });

    return NextResponse.json({ success: true, message: 'Log added' });
  } catch (error) {
    console.error('Log API Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
