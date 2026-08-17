import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // 1. Authenticate user using Firebase ID Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Firebase Auth Error:', authError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 3. Validate file type (Images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // 4. Validate file size (e.g., max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // 5. Upload to Vercel Blob
    // Use user ID in filename to ensure uniqueness and structure
    const extension = file.name.split('.').pop();
    const filename = `workers/${decodedToken.uid}/profile-${Date.now()}.${extension}`;

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true, // extra safety
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
  }
}
