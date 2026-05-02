# How to Get Firebase Admin Credentials

## Step-by-Step Guide

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/

### 2. Select Your Project
Click on **woodwise-49648**

### 3. Open Project Settings
Click the **gear icon (⚙️)** next to "Project Overview" → Select **Project Settings**

### 4. Go to Service Accounts Tab
Click on the **Service Accounts** tab at the top

### 5. Generate Private Key
1. Scroll down to the "Firebase Admin SDK" section
2. Click the **"Generate New Private Key"** button
3. A popup will appear - click **"Generate Key"**
4. A JSON file will be downloaded to your computer

### 6. Open the Downloaded JSON File
The file will be named something like: `woodwise-49648-firebase-adminsdk-xxxxx.json`

Open it with a text editor. It will look like this:

```json
{
  "type": "service_account",
  "project_id": "woodwise-49648",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@woodwise-49648.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### 7. Copy Values to .env.local

From the JSON file, copy these three values:

#### FIREBASE_ADMIN_PROJECT_ID
Copy the value of `"project_id"`
```
FIREBASE_ADMIN_PROJECT_ID=woodwise-49648
```

#### FIREBASE_ADMIN_CLIENT_EMAIL
Copy the value of `"client_email"`
```
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@woodwise-49648.iam.gserviceaccount.com
```

#### FIREBASE_ADMIN_PRIVATE_KEY
Copy the **ENTIRE** value of `"private_key"` including the quotes and \n characters
```
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

**IMPORTANT:** 
- Keep the double quotes around the private key
- Keep all the `\n` characters (they represent line breaks)
- Copy the entire key from `"-----BEGIN` to `-----\n"`

### 8. Update .env.local

Replace the placeholder values in your `.env.local` file:

**BEFORE:**
```env
FIREBASE_ADMIN_PROJECT_ID=woodwise-49648
FIREBASE_ADMIN_CLIENT_EMAIL=YOUR_CLIENT_EMAIL_HERE
FIREBASE_ADMIN_PRIVATE_KEY="YOUR_PRIVATE_KEY_HERE"
```

**AFTER:**
```env
FIREBASE_ADMIN_PROJECT_ID=woodwise-49648
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc123@woodwise-49648.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

### 9. Restart Your Development Server

After updating `.env.local`, restart your Next.js server:

```bash
# Stop the server (Ctrl+C)
# Then start it again
npm run dev
```

### 10. Test the Forgot Password Feature

1. Go to http://localhost:3000/forgot-password
2. Enter a registered email
3. Check your terminal/console for the 6-digit code
4. Enter the code
5. Set a new password
6. Success!

## Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS:**

1. **Never commit the JSON file to Git**
   - Add `*-firebase-adminsdk-*.json` to your `.gitignore`
   - The file contains sensitive credentials

2. **Never share your private key**
   - Don't post it in forums, Discord, or GitHub issues
   - Don't send it via email or messaging apps

3. **Keep .env.local private**
   - It should already be in `.gitignore`
   - Never commit it to version control

4. **Rotate keys if exposed**
   - If you accidentally expose your key, delete it immediately
   - Generate a new key from Firebase Console

## Troubleshooting

### "Failed to reset password" error

**Check 1: Verify all three variables are set**
```bash
# In your terminal, check if variables are loaded:
echo $FIREBASE_ADMIN_PROJECT_ID
echo $FIREBASE_ADMIN_CLIENT_EMAIL
echo $FIREBASE_ADMIN_PRIVATE_KEY
```

**Check 2: Verify private key format**
- Must start with `"-----BEGIN PRIVATE KEY-----\n`
- Must end with `\n-----END PRIVATE KEY-----\n"`
- Must include all `\n` characters
- Must be wrapped in double quotes

**Check 3: Restart server**
- Environment variables are only loaded on server start
- Stop and restart your dev server after changing `.env.local`

### "Cannot find module 'firebase-admin'" error

Install the package:
```bash
npm install firebase-admin
```

### Private key format issues

If you're having trouble with the private key format, try this:

1. Open the JSON file
2. Copy the entire `private_key` value (including quotes)
3. Paste it directly into `.env.local`
4. Make sure there are no extra spaces or line breaks

Example of correct format:
```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC...(very long string)...xyz\n-----END PRIVATE KEY-----\n"
```

## Need Help?

If you're still having issues:
1. Double-check all three environment variables are set correctly
2. Verify the JSON file was downloaded successfully
3. Make sure you restarted the dev server
4. Check the console for detailed error messages
5. Verify the email exists in Firebase Authentication
