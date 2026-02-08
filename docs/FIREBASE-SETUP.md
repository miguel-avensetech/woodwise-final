# Firebase Authentication Setup Guide

Complete step-by-step instructions to set up Firebase Authentication for WoodWise.

---

## Part 1: Create Firebase Project

### Step 1: Go to Firebase Console

1. Open your browser and go to: https://console.firebase.google.com/
2. Sign in with your Google account
3. Click **"Add project"** or **"Create a project"**

### Step 2: Create New Project

1. **Project name:** Enter `WoodWise` (or any name you prefer)
2. Click **"Continue"**
3. **Google Analytics:** Toggle OFF (optional, you can enable it later)
4. Click **"Create project"**
5. Wait for project creation (takes 30-60 seconds)
6. Click **"Continue"** when done

---

## Part 2: Register Your Web App

### Step 1: Add Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. **App nickname:** Enter `WoodWise Web`
3. **Firebase Hosting:** Leave unchecked (we're using Next.js)
4. Click **"Register app"**

### Step 2: Copy Configuration

You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "woodwise-xxxxx.firebaseapp.com",
  projectId: "woodwise-xxxxx",
  storageBucket: "woodwise-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

**IMPORTANT:** Keep this window open! You'll need these values in the next step.

### Step 3: Create Environment File

1. In your `WoodWise website` folder, create a file named `.env.local`
2. Add the following content (replace with YOUR values from Firebase):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=woodwise-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=woodwise-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=woodwise-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

**CRITICAL:** Replace ALL the `xxxxx` values with your actual Firebase config values!

### Step 4: Click Continue

Back in Firebase Console, click **"Continue to console"**

---

## Part 3: Enable Email/Password Authentication

### Step 1: Navigate to Authentication

1. In the left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"** button

### Step 2: Enable Email/Password

1. Click on the **"Sign-in method"** tab
2. Find **"Email/Password"** in the list
3. Click on it
4. Toggle **"Enable"** to ON
5. Leave **"Email link (passwordless sign-in)"** OFF
6. Click **"Save"**

---

## Part 4: Set Up Firestore Database

### Step 1: Create Firestore Database

1. In the left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**

### Step 2: Choose Security Rules

1. Select **"Start in test mode"** (for development)
2. Click **"Next"**

**Note:** Test mode allows read/write access for 30 days. We'll update security rules later.

### Step 3: Choose Location

1. Select your closest region (e.g., `us-central`, `europe-west`, `asia-southeast`)
2. Click **"Enable"**
3. Wait for database creation (30-60 seconds)

### Step 4: Update Security Rules (Important!)

1. Click on the **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more rules for other collections as needed
  }
}
```

3. Click **"Publish"**

---

## Part 5: Test the Integration

### Step 1: Restart Next.js Server

1. Stop your Next.js development server (Ctrl+C)
2. Start it again:
   ```bash
   cd "WoodWise website"
   npm run dev
   ```

### Step 2: Test Sign Up

1. Open http://localhost:3000
2. Click **"Sign Up"**
3. Fill in the form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click **"Create Account"**
5. You should be redirected to the dashboard

### Step 3: Verify in Firebase Console

1. Go back to Firebase Console
2. Click **"Authentication"** in the sidebar
3. Click the **"Users"** tab
4. You should see your test user listed!

### Step 4: Test Sign In

1. Click **"Settings"** → **"Logout"**
2. Click **"Sign In"**
3. Enter:
   - Email: `test@example.com`
   - Password: `password123`
4. Click **"Sign In"**
5. You should be redirected to the dashboard

### Step 5: Check Firestore Data

1. Go to Firebase Console
2. Click **"Firestore Database"**
3. You should see a `users` collection
4. Click on it to see your user document with:
   - uid
   - email
   - displayName
   - createdAt
   - lastLogin

---

## Part 6: Security Best Practices

### 1. Protect Your API Keys

**IMPORTANT:** Never commit `.env.local` to Git!

Add to `.gitignore`:
```
.env.local
.env*.local
```

### 2. Update Firestore Security Rules

For production, use stricter rules:

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
      allow read: if isSignedIn() && isOwner(userId);
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);
      allow delete: if false; // Prevent deletion
    }
    
    // Scans collection (example)
    match /scans/{scanId} {
      allow read, write: if isSignedIn() && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Enable App Check (Optional but Recommended)

1. In Firebase Console, go to **"Build"** → **"App Check"**
2. Click **"Get started"**
3. Follow the setup wizard
4. This prevents abuse of your Firebase resources

---

## Part 7: Common Issues & Solutions

### Issue 1: "Firebase: Error (auth/configuration-not-found)"

**Solution:**
- Check that `.env.local` exists in `WoodWise website` folder
- Verify all environment variables are correctly set
- Restart Next.js server after creating `.env.local`

### Issue 2: "Firebase: Error (auth/invalid-api-key)"

**Solution:**
- Double-check your API key in `.env.local`
- Make sure you copied it correctly from Firebase Console
- No extra spaces or quotes

### Issue 3: "Firebase: Error (auth/network-request-failed)"

**Solution:**
- Check your internet connection
- Verify Firebase project is active
- Check if firewall is blocking Firebase

### Issue 4: Users can't sign in after sign up

**Solution:**
- Check Firebase Console → Authentication → Users
- Verify user was created
- Check browser console for errors
- Verify email/password authentication is enabled

### Issue 5: "Missing or insufficient permissions"

**Solution:**
- Update Firestore security rules (see Part 6)
- Make sure rules allow authenticated users to read/write

---

## Part 8: Additional Features

### Password Reset

The forgot password link is already set up. To test:

1. Click "Forgot password?" on sign-in page
2. Enter your email
3. Check your email for reset link
4. Click the link and set new password

### Email Verification (Optional)

To require email verification:

1. In Firebase Console → Authentication → Settings
2. Scroll to "User account management"
3. Enable "Email verification"

Then update your code to check `user.emailVerified`

### Social Sign-In (Optional)

To add Google, Facebook, etc.:

1. Firebase Console → Authentication → Sign-in method
2. Click on provider (e.g., Google)
3. Enable and configure
4. Update your code to use `signInWithPopup()`

---

## Part 9: Production Deployment

### Before Deploying:

1. **Update Security Rules** (see Part 6)
2. **Set up proper environment variables** on your hosting platform
3. **Enable App Check** for security
4. **Set up billing alerts** in Firebase Console
5. **Review Firebase usage limits**

### Environment Variables for Production:

When deploying to Vercel, Netlify, etc., add these environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## Summary Checklist

- ✅ Created Firebase project
- ✅ Registered web app
- ✅ Created `.env.local` with Firebase config
- ✅ Enabled Email/Password authentication
- ✅ Created Firestore database
- ✅ Updated security rules
- ✅ Tested sign up
- ✅ Tested sign in
- ✅ Verified user in Firebase Console
- ✅ Tested logout

---

## Need Help?

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Authentication Guide: https://firebase.google.com/docs/auth
- Firestore Guide: https://firebase.google.com/docs/firestore
- Stack Overflow: Search "firebase authentication nextjs"

---

## Next Steps

Now that authentication is working:

1. **Add user profile management**
2. **Store scan results in Firestore**
3. **Add user-specific furniture tracking**
4. **Implement maintenance schedules per user**
5. **Add notification preferences**

Your authentication system is now fully functional! 🎉
