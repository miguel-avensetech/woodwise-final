# Quick Resend Setup Guide (5 Minutes)

## Step 1: Sign Up for Resend (2 minutes)

1. Go to https://resend.com
2. Click "Sign Up"
3. Sign up with your email or GitHub
4. Verify your email address

## Step 2: Get API Key (1 minute)

1. After logging in, go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "WoodWise Password Reset"
4. Click "Create"
5. **Copy the API key** (starts with `re_`)

## Step 3: Add to .env.local (30 seconds)

Open your `.env.local` file and replace this line:

```env
RESEND_API_KEY=re_123456789_REPLACE_WITH_YOUR_ACTUAL_KEY
```

With your actual API key:

```env
RESEND_API_KEY=re_your_actual_key_here
```

## Step 4: Install Resend Package (1 minute)

Run this command in your terminal:

```bash
npm install resend
```

## Step 5: Restart Dev Server (30 seconds)

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Step 6: Test! (1 minute)

1. Go to http://localhost:3000/forgot-password
2. Enter your email address
3. Click "Send Verification Code"
4. **Check your email inbox!** 📧
5. Enter the 6-digit code
6. Reset your password
7. Success! 🎉

## Troubleshooting

### Email not received?

1. **Check spam folder** - Sometimes it goes there
2. **Wait 1-2 minutes** - Email delivery can take a moment
3. **Check Resend dashboard** - Go to https://resend.com/emails to see if it was sent
4. **Verify API key** - Make sure you copied it correctly
5. **Restart server** - Environment variables need a restart to load

### "Failed to send verification code" error?

1. Check that `RESEND_API_KEY` is in `.env.local`
2. Make sure you restarted the dev server
3. Check terminal for detailed error messages
4. Verify the API key is valid in Resend dashboard

### Still not working?

The code will still be logged to your terminal as a fallback:

```
========================================
⚠️ EMAIL FAILED - CODE LOGGED TO CONSOLE
========================================
Email: user@example.com
Code: 123456
========================================
```

## Free Tier Limits

Resend free tier includes:
- ✅ 100 emails per day
- ✅ 3,000 emails per month
- ✅ No credit card required
- ✅ Perfect for development and testing

## Production Tips

### Use Your Own Domain (Optional)

For production, you can use your own domain instead of `onboarding@resend.dev`:

1. Go to Resend Dashboard → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `woodwise.com`)
4. Add the DNS records shown
5. Wait for verification (usually 5-10 minutes)
6. Update the `from` field in `send-verification-code/route.ts`:

```typescript
from: 'WoodWise <noreply@woodwise.com>',
```

### Monitor Email Delivery

- Check Resend dashboard regularly
- Set up webhooks for delivery notifications
- Monitor bounce rates
- Track open rates (if needed)

## That's It!

Your forgot password feature now sends real emails! 🎉

The verification codes will be delivered to users' inboxes instead of just the console.
