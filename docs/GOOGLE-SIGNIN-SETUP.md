# Google Sign-In Setup Guide for WoodWise

Complete step-by-step instructions to enable Google Sign-In authentication in your WoodWise application.

---

## Prerequisites

- Firebase project already created (woodwise-49648)
- Email/Password authentication already enabled
- `.env.local` file configured with Firebase credentials

---

## Part 1: Enable Google Sign-In in Firebase Console

### Step 1: Navigate to Authentication

1. Go to Firebase Console: https://console.firebase.google.com/project/woodwise-49648
2. Click **"Authentication"** in the left sidebar
3. Click on the **"Sign-in method"** tab

### Step 2: Enable Google Provider

1. In the list of sign-in providers, find **"Google"**
2. Click on **"Google"**
3. Toggle the **"Enable"** switch to ON
4. You'll see two fields:
   - **Project support email**: Select your email from the dropdown
   - **Project public-facing name**: Leave as "WoodWise" (or your project name)
5. Click **"Save"**

**That's it for Firebase Console!** Google Sign-In is now enabled.

---

## Part 2: Configure OAuth Consent Screen (If Required)

If you see a warning about OAuth consent screen:

### Step 1: Go to Google Cloud Console

1. Click the link in the warning message, or go to:
   https://console.cloud.google.com/apis/credentials/consent
2. Make sure you're in the correct project (woodwise-49648)

### Step 2: Configure Consent Screen

1. **User Type**: Select **"External"** (for public apps)
2. Click **"Create"**

### Step 3: Fill in App Information

**App information:**
- **App name**: WoodWise
- **User support email**: Your email
- **App logo**: (Optional) Upload your WoodWise logo

**App domain:**
- **Application home page**: http://localhost:3000 (for development)
- **Application privacy policy link**: (Optional for now)
- **Application terms of service link**: (Optional for now)

**Authorized domains:**
- Add: `localhost` (for development)
- Later add your production domain (e.g., `woodwise.com`)

**Developer contact information:**
- **Email addresses**: Your email

3. Click **"Save and Continue"**

### Step 4: Scopes

1. Click **"Add or Remove Scopes"**
2. Select these scopes:
   - `email`
   - `profile`
   - `openid`
3. Click **"Update"**
4. Click **"Save and Continue"**

### Step 5: Test Users (Optional for Development)

1. Click **"Add Users"**
2. Add your test email addresses
3. Click **"Save and Continue"**

### Step 6: Summary

1. Review your settings
2. Click **"Back to Dashboard"**

---

## Part 3: Test Google Sign-In

### Step 1: Restart Development Server

```bash
# Stop your Next.js server (Ctrl+C)
# Then restart:
cd "WoodWise website"
npm run dev
```

### Step 2: Test Sign-In Flow

1. Open http://localhost:3000/signin
2. You should see a new **"Sign in with Google"** button
3. Click the button
4. A Google Sign-In popup will appear
5. Select your Google account
6. Grant permissions
7. You should be redirected to the dashboard

### Step 3: Verify in Firebase Console

1. Go to Firebase Console → Authentication → Users
2. You should see your Google account listed
3. The "Provider" column will show "google.com"

### Step 4: Check Firestore Data

1. Go to Firebase Console → Firestore Database
2. Open the `users` collection
3. Find your user document
4. It should contain:
   - `uid`
   - `email`
   - `displayName` (from Google)
   - `photoURL` (your Google profile picture)
   - `createdAt`
   - `lastLogin`

---

## Part 4: How It Works

### User Flow

1. **New User (First Time)**:
   - User clicks "Sign in with Google"
   - Google popup appears
   - User selects account and grants permissions
   - Firebase creates authentication record
   - App creates user document in Firestore
   - User redirected to dashboard

2. **Existing User (Returning)**:
   - User clicks "Sign in with Google"
   - Google popup appears (or auto-signs in if already logged in)
   - Firebase authenticates user
   - App updates `lastLogin` timestamp
   - User redirected to dashboard

### Data Stored

**Firebase Authentication:**
- User ID (uid)
- Email
- Display Name
- Profile Photo URL
- Provider: google.com

**Firestore Database (`users` collection):**
```javascript
{
  uid: "abc123...",
  email: "user@gmail.com",
  displayName: "John Doe",
  photoURL: "https://lh3.googleusercontent.com/...",
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

---

## Part 5: Common Issues & Solutions

### Issue 1: "Popup blocked" error

**Solution:**
- Allow popups in your browser for localhost
- Chrome: Click the popup icon in address bar → Always allow
- Firefox: Click "Options" → Allow popups

### Issue 2: "auth/popup-closed-by-user"

**Solution:**
- User closed the popup before completing sign-in
- This is normal - just try again
- Error message is shown to user

### Issue 3: "OAuth consent screen not configured"

**Solution:**
- Follow Part 2 of this guide
- Configure OAuth consent screen in Google Cloud Console

### Issue 4: "This app isn't verified"

**Solution:**
- During development, click "Advanced" → "Go to WoodWise (unsafe)"
- For production, submit app for verification in Google Cloud Console

### Issue 5: Google Sign-In works but user not created in Firestore

**Solution:**
- Check Firestore security rules
- Make sure authenticated users can write to `users` collection
- Check browser console for errors

### Issue 6: "auth/unauthorized-domain"

**Solution:**
- Go to Firebase Console → Authentication → Settings
- Scroll to "Authorized domains"
- Add your domain (localhost is already authorized by default)

---

## Part 6: Security Best Practices

### 1. Firestore Security Rules

Update your Firestore rules to handle Google Sign-In users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Allow read if signed in and is owner
      allow read: if isSignedIn() && isOwner(userId);
      
      // Allow create if signed in and is owner
      allow create: if isSignedIn() && isOwner(userId);
      
      // Allow update if signed in and is owner
      allow update: if isSignedIn() && isOwner(userId);
      
      // Prevent deletion
      allow delete: if false;
    }
  }
}
```

### 2. Validate User Data

The app automatically validates:
- Email is from Google
- Display name is provided
- Photo URL is from Google's CDN

### 3. Handle Multiple Sign-In Methods

If a user signs up with email/password and later tries Google with the same email:
- Firebase will link the accounts automatically
- User can sign in with either method

---

## Part 7: Production Deployment

### Before Going Live:

1. **Update Authorized Domains**
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add your production domain (e.g., `woodwise.com`)

2. **Update OAuth Consent Screen**
   - Google Cloud Console → OAuth consent screen
   - Update authorized domains
   - Add production URLs

3. **Verify Your App (Optional but Recommended)**
   - Google Cloud Console → OAuth consent screen
   - Click "Publish App"
   - Submit for verification to remove "unverified app" warning

4. **Update Environment Variables**
   - Set Firebase config in your hosting platform
   - Same variables as in `.env.local`

5. **Test Thoroughly**
   - Test Google Sign-In on production domain
   - Verify user creation in Firestore
   - Check that redirects work correctly

---

## Part 8: Additional Features

### Display User Profile Picture

The Google Sign-In provides a profile picture URL. You can display it:

```typescript
import { getCurrentUser } from '@/lib/auth';

const user = getCurrentUser();
if (user?.photoURL) {
  return <img src={user.photoURL} alt="Profile" />;
}
```

### Update Profile Page

You can enhance the profile page to show:
- Google profile picture
- Sign-in method (Email or Google)
- Last login time

### Add Sign-In Method Indicator

Show users how they signed in:
```typescript
const user = getCurrentUser();
const provider = user?.providerData[0]?.providerId;
// Returns: "password" or "google.com"
```

---

## Part 9: Testing Checklist

- ✅ Google Sign-In button appears on sign-in page
- ✅ Clicking button opens Google popup
- ✅ Can select Google account
- ✅ Redirected to dashboard after sign-in
- ✅ User appears in Firebase Authentication
- ✅ User document created in Firestore
- ✅ Display name and photo URL saved
- ✅ Can sign out and sign in again
- ✅ Existing users can sign in with Google
- ✅ Error messages display correctly

---

## Part 10: Troubleshooting Commands

### Check Firebase Configuration
```bash
# In browser console (F12)
console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
```

### Check Authentication State
```bash
# In browser console
import { auth } from '@/lib/firebase';
console.log(auth.currentUser);
```

### Clear Browser Cache
```bash
# Chrome DevTools
Application → Storage → Clear site data
```

---

## Summary

You've successfully added Google Sign-In to WoodWise! Users can now:
- Sign in with their Google account
- Have their profile automatically created
- Access all features without creating a password

**Benefits:**
- ✅ Faster sign-up process
- ✅ No password to remember
- ✅ Secure authentication via Google
- ✅ Profile picture automatically available
- ✅ Better user experience

---

## Need Help?

- Firebase Auth Documentation: https://firebase.google.com/docs/auth/web/google-signin
- Google Cloud Console: https://console.cloud.google.com/
- Stack Overflow: Search "firebase google signin nextjs"

---

## Next Steps

Consider adding more sign-in providers:
- Facebook Login
- Apple Sign-In
- Microsoft Account
- GitHub

Each follows a similar setup process in Firebase Console!

🎉 **Google Sign-In is now fully functional!**
