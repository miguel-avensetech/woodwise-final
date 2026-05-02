# Forgot Password Feature Setup

## Overview
The forgot password feature implements a secure 4-step flow:
1. **Enter Email** - User enters their email address
2. **Verify Email** - User receives a 6-digit verification code via email
3. **Reset Password** - User enters new password
4. **Success** - User is redirected back to sign in

## Files Created

### Frontend
- `app/forgot-password/page.tsx` - Main forgot password page with 4-step flow
- Updated `app/signin/page.tsx` - Added link to forgot password page

### Backend APIs
- `app/api/send-verification-code/route.ts` - Sends verification code to email
- `app/api/reset-password/route.ts` - Resets user password using Firebase Admin SDK

### Styles
- Updated `styles/auth.module.css` - Added success icon animation

## Firebase Admin SDK Setup

The password reset feature requires Firebase Admin SDK to update user passwords server-side.

### Step 1: Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (woodwise-49648)
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### Step 2: Add Environment Variables

Add these to your `.env.local` file:

```env
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=woodwise-49648
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@woodwise-49648.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**How to get these values from the downloaded JSON:**
- `FIREBASE_ADMIN_PROJECT_ID` = `project_id` field
- `FIREBASE_ADMIN_CLIENT_EMAIL` = `client_email` field
- `FIREBASE_ADMIN_PRIVATE_KEY` = `private_key` field (keep the quotes and \n characters)

### Step 3: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

## Email Service Setup (Required for Production)

Currently, the verification code is only logged to the console. For production, you need to integrate an email service.

### Recommended Email Services:

#### Option 1: Resend (Recommended - Simple & Modern)
```bash
npm install resend
```

Add to `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

Update `app/api/send-verification-code/route.ts`:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'WoodWise <noreply@woodwise.com>',
  to: email,
  subject: 'Password Reset Verification Code',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4B2E14;">Password Reset Request</h2>
      <p>Your verification code is:</p>
      <div style="background: #FFF7EC; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #4B2E14; font-size: 36px; margin: 0;">${code}</h1>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p style="color: #666;">If you didn't request this, please ignore this email.</p>
    </div>
  `
});
```

#### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

Add to `.env.local`:
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

#### Option 3: Nodemailer (Self-hosted SMTP)
```bash
npm install nodemailer
```

Add to `.env.local`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## How It Works

### User Flow:

1. **User clicks "Forgot password?" on sign-in page**
   - Redirects to `/forgot-password`

2. **Step 1: Enter Email**
   - User enters email address
   - System generates 6-digit code
   - Code is sent to email (currently logged to console)
   - User proceeds to verification step

3. **Step 2: Verify Code**
   - User enters 6-digit code from email
   - System validates code
   - If correct, proceeds to password reset
   - If incorrect, shows error
   - User can click "Resend Code" to go back to step 1

4. **Step 3: Reset Password**
   - User enters new password
   - User confirms new password
   - System validates:
     - Password is at least 6 characters
     - Passwords match
   - Firebase Admin SDK updates user password
   - Proceeds to success screen

5. **Step 4: Success**
   - Shows success message with checkmark animation
   - "Back to Sign In" button redirects to `/signin`
   - User can now sign in with new password

### Security Features:

- **6-digit verification code** - Random code generated server-side
- **Code validation** - Code must match to proceed
- **Password requirements** - Minimum 6 characters
- **Password confirmation** - Must match to prevent typos
- **Server-side password update** - Uses Firebase Admin SDK for security
- **No password exposure** - New password never sent to client

## Testing

### Development Testing (Without Email Service):

1. Go to `/forgot-password`
2. Enter any registered email
3. Click "Send Verification Code"
4. Check your terminal/console for the code (it will be logged)
5. Enter the code from console
6. Enter new password
7. Confirm password
8. Click "Reset Password"
9. Success! Go back to sign in

### Production Testing (With Email Service):

1. Set up email service (Resend recommended)
2. Add API key to `.env.local`
3. Update `send-verification-code/route.ts` with email code
4. Test the full flow with real email delivery

## Troubleshooting

### "Failed to send verification code"
- Check that email service is configured
- Verify API keys in `.env.local`
- Check console logs for detailed error

### "Failed to reset password"
- Ensure Firebase Admin SDK is properly configured
- Check that all three environment variables are set
- Verify the private key format (should include \n characters)
- Make sure the email exists in Firebase Auth

### "Invalid verification code"
- In development, check console for the generated code
- Code is case-sensitive (numbers only)
- Make sure you're entering all 6 digits

### Email not received
- Check spam folder
- Verify email service is configured correctly
- Check email service dashboard for delivery status
- In development, code is logged to console

## Environment Variables Checklist

Make sure these are in your `.env.local`:

```env
# Existing Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK (NEW - Required)
FIREBASE_ADMIN_PROJECT_ID=woodwise-49648
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@woodwise-49648.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email Service (NEW - Required for production)
RESEND_API_KEY=re_xxxxxxxxxxxxx
# OR
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Next Steps

1. ✅ Install Firebase Admin SDK: `npm install firebase-admin`
2. ✅ Get Firebase Admin credentials from Firebase Console
3. ✅ Add environment variables to `.env.local`
4. ✅ Choose and set up email service (Resend recommended)
5. ✅ Update `send-verification-code/route.ts` with email code
6. ✅ Test the complete flow
7. ✅ Deploy to production

## Production Considerations

### Security:
- Never expose Firebase Admin credentials to client
- Use environment variables for all sensitive data
- Implement rate limiting on verification code endpoint
- Add CAPTCHA to prevent abuse
- Set code expiration (10 minutes recommended)

### User Experience:
- Add loading states for all async operations
- Show clear error messages
- Allow code resend with cooldown period
- Add "Didn't receive code?" help text
- Consider SMS verification as alternative

### Monitoring:
- Log all password reset attempts
- Monitor for suspicious activity
- Track email delivery success rate
- Set up alerts for failed attempts

## Support

If you encounter issues:
1. Check console logs for detailed errors
2. Verify all environment variables are set
3. Ensure Firebase Admin SDK is properly initialized
4. Test email service separately
5. Check Firebase Console for user existence
