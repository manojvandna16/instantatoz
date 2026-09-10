import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// GET: Fetch commission config
// POST: Update commission config (FINANCE_ADMIN or SUPER_ADMIN only)

async function verifyAdmin(requiredFinance = false) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin-session')?.value;
  if (!sessionCookie) return null;
  try {
    const claims = await adminAuth().verifySessionCookie(sessionCookie, true);
    if (!claims.admin) return null;
    return claims;
  } catch {
    return null;
  }
}

export async function GET() {
  const claims = await verifyAdmin();
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = adminDb();
    const snap = await db.collection('commission_config').orderBy('updatedAt', 'desc').limit(1).get();

    if (snap.empty) {
      // Return sensible default if no config exists yet
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          defaultRate: 10,
          minAmount: null,
          maxAmount: null,
          updatedAt: null,
          updatedBy: null,
          updatedByName: 'System Default',
          reason: 'Initial default configuration',
          history: [],
        }
      });
    }

    const doc = snap.docs[0];
    const data = doc.data();

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        defaultRate: data.defaultRate ?? 10,
        minAmount: data.minAmount ?? null,
        maxAmount: data.maxAmount ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
        updatedBy: data.updatedBy ?? null,
        updatedByName: data.updatedByName ?? 'Unknown',
        reason: data.reason ?? '',
        history: (data.history ?? []).map((h: any) => ({
          rate: h.rate,
          updatedAt: h.updatedAt?.toDate?.()?.toISOString() ?? null,
          updatedBy: h.updatedBy,
          updatedByName: h.updatedByName,
          reason: h.reason,
        })).slice(0, 20), // last 20 entries
      }
    });
  } catch (error: any) {
    console.error('[Commission API] GET error:', error.message);
    return NextResponse.json({ error: 'Failed to load commission config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const claims = await verifyAdmin();
  if (!claims) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only SUPER_ADMIN or FINANCE_ADMIN can update commission
  const role = claims.role;
  if (role !== 'SUPER_ADMIN' && role !== 'FINANCE_ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { defaultRate, minAmount, maxAmount, reason } = body;

    if (typeof defaultRate !== 'number' || defaultRate < 0 || defaultRate > 100) {
      return NextResponse.json({ error: 'Invalid commission rate (must be 0-100)' }, { status: 400 });
    }
    if (!reason || reason.trim().length < 3) {
      return NextResponse.json({ error: 'Reason is required (min 3 characters)' }, { status: 400 });
    }

    const db = adminDb();
    const { FieldValue } = await import('firebase-admin/firestore');

    // Get current config for history
    const existingSnap = await db.collection('commission_config').orderBy('updatedAt', 'desc').limit(1).get();
    const existingData = existingSnap.empty ? null : existingSnap.docs[0].data();
    const oldRate = existingData?.defaultRate ?? 10;

    const historyEntry = {
      rate: oldRate,
      updatedAt: existingData?.updatedAt ?? FieldValue.serverTimestamp(),
      updatedBy: existingData?.updatedBy ?? 'system',
      updatedByName: existingData?.updatedByName ?? 'System',
      reason: existingData?.reason ?? 'Previous config',
    };

    const newConfig = {
      defaultRate: Number(defaultRate),
      minAmount: minAmount ? Number(minAmount) : null,
      maxAmount: maxAmount ? Number(maxAmount) : null,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: claims.uid,
      updatedByName: claims.name || claims.email || 'Admin',
      reason: reason.trim(),
      history: FieldValue.arrayUnion(historyEntry),
    };

    // Always use a single "current" config doc
    const configRef = db.collection('commission_config').doc('current');
    await configRef.set(newConfig, { merge: false });

    // Write audit log
    await db.collection('audit_logs').add({
      adminId: claims.uid,
      adminRole: claims.role ?? 'ADMIN',
      action: 'COMMISSION_UPDATED',
      targetId: 'commission_config/current',
      oldValue: { rate: oldRate },
      newValue: { rate: Number(defaultRate) },
      reason: reason.trim(),
      timestamp: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Commission config updated successfully' });
  } catch (error: any) {
    console.error('[Commission API] POST error:', error.message);
    return NextResponse.json({ error: 'Failed to update commission config' }, { status: 500 });
  }
}
