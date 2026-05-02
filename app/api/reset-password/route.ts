import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Update user password
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password reset successfully' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error resetting password:', error);
    
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
