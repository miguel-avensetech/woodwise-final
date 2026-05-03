// Authentication helper functions
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
  lastLogin: any;
}

/**
 * Sign in with Google using popup
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();
    // Force account selection every time
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    console.log("Google sign-in successful for user:", user.uid);

    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log("Creating new user document for Google user");
      // Create user document for new Google users
      const userData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Google User',
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log("User document created successfully");
    } else {
      console.log("Updating last login for existing user");
      // Update last login for existing users
      await setDoc(
        doc(db, 'users', user.uid),
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return userCredential;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Handle redirect result after Google sign-in
 * Call this on page load to complete the sign-in process
 * @deprecated - Now using popup instead of redirect
 */
export async function handleGoogleRedirect(): Promise<UserCredential | null> {
  // No longer needed with popup method
  return null;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  try {
    console.log("Firebase auth object:", auth);
    console.log("Firebase db object:", db);
    console.log("Attempting to create user with email:", email);
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User created successfully:", user.uid);

    // Update user profile with display name
    try {
      await updateProfile(user, {
        displayName: displayName,
      });
      console.log("Profile updated successfully");
    } catch (profileError) {
      console.error("Error updating profile:", profileError);
      // Continue even if profile update fails
    }

    // Create user document in Firestore with retry logic
    const userData = {
      uid: user.uid,
      email: user.email || email,
      displayName: displayName,
      photoURL: null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };

    console.log("Creating Firestore document with data:", userData);
    
    try {
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log("Firestore document created successfully");
      
      // Verify the document was created
      const verifyDoc = await getDoc(doc(db, 'users', user.uid));
      if (verifyDoc.exists()) {
        console.log("Verified: User document exists in Firestore");
      } else {
        console.error("Warning: User document not found after creation");
      }
    } catch (firestoreError: any) {
      console.error("Firestore write error:", firestoreError);
      console.error("Firestore error code:", firestoreError.code);
      console.error("Firestore error message:", firestoreError.message);
      
      // Try one more time with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log("Firestore document created on retry");
      } catch (retryError) {
        console.error("Firestore retry failed:", retryError);
        // Don't throw - user account is created, just log the error
      }
    }

    return userCredential;
  } catch (error: any) {
    console.error("Firebase signup error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login time
    await setDoc(
      doc(db, 'users', userCredential.user.uid),
      {
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    );

    return userCredential;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Sign out the current user
 */
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error.code));
  }
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Please allow popups and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in method.';
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
