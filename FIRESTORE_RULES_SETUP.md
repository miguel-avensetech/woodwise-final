# Firestore Security Rules Setup

## Issue
New user signups are not being stored in Firestore. This could be due to restrictive security rules.

## Required Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules and ensure you have the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - allow users to read/write their own data
    match /users/{userId} {
      // Allow anyone to create a new user document (for signup)
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read and update their own document
      allow read, update: if request.auth != null && request.auth.uid == userId;
      
      // Prevent deletion
      allow delete: if false;
    }
    
    // Treatments collection - allow users to manage their own treatments
    match /treatments/{treatmentId} {
      // Allow authenticated users to create treatments
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Allow users to read, update, and delete their own treatments
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Important Notes

1. **Authentication Required**: Users must be authenticated before writing to Firestore
2. **User ID Matching**: The document ID in the `users` collection must match the authenticated user's UID
3. **Data Validation**: Ensure the `userId` field in treatments matches the authenticated user

## Testing the Rules

After updating the rules:

1. Try signing up a new user from the web app
2. Check the browser console for any Firestore errors
3. Go to Firebase Console → Firestore Database → Data
4. Verify that the new user document appears in the `users` collection

## Common Issues

### Issue 1: "Missing or insufficient permissions"
**Solution**: Update Firestore rules to allow authenticated users to create their own documents

### Issue 2: User created in Authentication but not in Firestore
**Solution**: 
- Check browser console for Firestore errors
- Verify Firebase configuration in `.env.local`
- Ensure Firestore is initialized in the same Firebase project

### Issue 3: Mobile app not syncing
**Solution**:
- Ensure mobile app uses the same Firebase project
- Verify mobile app has correct Firebase configuration
- Check that mobile app has internet connectivity
- Ensure mobile app is using the latest authentication tokens

## Verification Steps

1. **Check Firebase Console**:
   - Go to Firebase Console → Authentication
   - Verify new users appear in the Authentication tab
   - Go to Firestore Database → Data
   - Check if corresponding user documents exist in the `users` collection

2. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for any Firebase or Firestore errors during signup

3. **Test Signup Flow**:
   - Clear browser cache and cookies
   - Try signing up with a new email
   - Check console logs for "User created successfully" and "Firestore document created successfully"

## Enhanced Logging

The signup function now includes:
- Detailed console logging at each step
- Retry logic for Firestore writes
- Verification that the document was created
- Better error messages

Check the browser console during signup to see detailed logs.
