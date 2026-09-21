import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const FAST2SMS_API_KEY = "F0kbl43spHtY6EhxfUGwJImdLNWVO8KyTgoSaBDqrQ7CezXj298ogfBvzQVCqUAiYhXb0nkR9j651tLc";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, otp } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const cleanPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    const tenDigitNumber = cleanPhone.replace('+91', '');

    if (action === 'send') {
      // 1. Generate 6 digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // 2. Save to Firestore
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry
      await adminDb().collection('otps').doc(cleanPhone).set({
        otp: generatedOtp,
        expiresAt,
        createdAt: FieldValue.serverTimestamp(),
      });

      // 3. Send SMS via Fast2SMS
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": FAST2SMS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: generatedOtp,
          numbers: tenDigitNumber
        })
      });

      const data = await response.json();
      if (!data.return) {
        console.error("Fast2SMS API Error:", data);
        return NextResponse.json({ error: 'Failed to send SMS via provider' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'OTP sent successfully' });
    }

    if (action === 'verify') {
      if (!otp) return NextResponse.json({ error: 'OTP is required' }, { status: 400 });

      // Special bypass for App Store review or Dev test number
      let isVerified = false;
      if (cleanPhone === '+919286599208' && otp === '123456') {
        isVerified = true;
      } else {
        // Verify from Firestore
        const docRef = adminDb().collection('otps').doc(cleanPhone);
        const doc = await docRef.get();
        
        if (!doc.exists) {
          return NextResponse.json({ error: 'Invalid OTP or expired' }, { status: 400 });
        }
        
        const data = doc.data();
        if (data?.otp !== otp) {
          return NextResponse.json({ error: 'Incorrect OTP' }, { status: 400 });
        }
        
        if (data?.expiresAt.toDate() < new Date()) {
          return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }
        
        // Mark verified and delete
        isVerified = true;
        await docRef.delete();
      }

      if (isVerified) {
        // 1. Get or create user in Firebase Auth
        let userRecord;
        try {
          userRecord = await adminAuth().getUserByPhoneNumber(cleanPhone);
        } catch (err: any) {
          if (err.code === 'auth/user-not-found') {
            userRecord = await adminAuth().createUser({ phoneNumber: cleanPhone });
          } else {
            throw err;
          }
        }

        // 2. Generate Custom Token
        const customToken = await adminAuth().createCustomToken(userRecord.uid);

        return NextResponse.json({ success: true, customToken });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('OTP API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
