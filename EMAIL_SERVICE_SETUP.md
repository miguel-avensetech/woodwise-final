# Email Service Setup for Verification Codes

## Current Status

Currently, verification codes are **logged to the console** for development. To send actual emails, you need to integrate an email service.

## Recommended: Resend (Easiest Setup)

### Why Resend?
- Modern, developer-friendly API
- Free tier: 100 emails/day, 3,000/month
- Simple setup, no complex configuration
- Great deliverability

### Setup Steps:

**1. Sign up for Resend**
- Go to https://resend.com
- Sign up with your email or GitHub
- Verify your email

**2. Get API Key**
- Go to https://resend.com/api-keys
- Click "Create API Key"
- Name it "WoodWise Password Reset"
- Copy the API key (starts with `re_`)

**3. Add to .env.local**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**4. Install Resend Package**
```bash
npm install resend
```

**5. Update send-verification-code API**

Replace the TODO section in `app/api/send-verification-code/route.ts`:

```typescript
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email with verification code
    await resend.emails.send({
      from: 'WoodWise <onboarding@resend.dev>', // Use your verified domain
      to: email,
      subject: 'Password Reset Verification Code - WoodWise',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FFF7EC 0%, #fde68a 100%); padding: 30px; border-radius: 16px; text-align: center;">
              <h1 style="color: #4B2E14; margin: 0 0 10px 0;">Password Reset Request</h1>
              <p style="color: #666; margin: 0;">WoodWise - Wood Care & Maintenance</p>
            </div>
            
            <div style="padding: 30px 0;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                You requested to reset your password. Use the verification code below to continue:
              </p>
              
              <div style="background: #FFF7EC; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; border: 2px solid #4B2E14;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: 600;">VERIFICATION CODE</p>
                <h1 style="color: #4B2E14; font-size: 42px; margin: 0; letter-spacing: 8px; font-weight: 700;">${code}</h1>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              
              <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
            
            <div style="border-top: 1px solid #E5E5E5; padding-top: 20px; text-align: center;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                © ${new Date().getFullYear()} WoodWise. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `
    });

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('\n========================================');
      console.log('📧 EMAIL SENT');
      console.log('========================================');
      console.log(`To: ${email}`);
      console.log(`Code: ${code}`);
      console.log('========================================\n');
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Verification code sent successfully'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
```

**6. Verify Domain (Optional but Recommended)**

For production, verify your own domain:
- Go to Resend Dashboard → Domains
- Add your domain (e.g., woodwise.com)
- Add DNS records as instructed
- Update `from` field to use your domain: `WoodWise <noreply@woodwise.com>`

**7. Test**
- Restart your dev server
- Go to `/forgot-password`
- Enter your email
- Check your inbox for the verification code!

## Alternative: SendGrid

### Setup Steps:

**1. Sign up for SendGrid**
- Go to https://sendgrid.com
- Sign up for free account
- Verify your email

**2. Create API Key**
- Go to Settings → API Keys
- Click "Create API Key"
- Choose "Full Access"
- Copy the API key

**3. Add to .env.local**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

**4. Install SendGrid Package**
```bash
npm install @sendgrid/mail
```

**5. Update API Code**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  to: email,
  from: 'noreply@yourdomain.com', // Must be verified in SendGrid
  subject: 'Password Reset Verification Code - WoodWise',
  html: `<!-- Same HTML template as above -->`
});
```

## Alternative: Gmail SMTP (For Testing)

**1. Enable 2-Factor Authentication**
- Go to Google Account settings
- Enable 2FA

**2. Generate App Password**
- Go to Security → App Passwords
- Generate password for "Mail"
- Copy the 16-character password

**3. Add to .env.local**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

**4. Install Nodemailer**
```bash
npm install nodemailer
```

**5. Update API Code**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: `"WoodWise" <${process.env.SMTP_USER}>`,
  to: email,
  subject: 'Password Reset Verification Code - WoodWise',
  html: `<!-- Same HTML template as above -->`
});
```

## Email Template Best Practices

### Subject Line
- Keep it clear and concise
- Include brand name
- Mention "Password Reset" or "Verification Code"

### Content
- Clear call-to-action (the code)
- Expiration time
- Security notice (if you didn't request this...)
- Brand colors and logo
- Mobile-responsive design

### Security
- Never include clickable password reset links (use codes instead)
- Set code expiration (10 minutes recommended)
- Rate limit requests (prevent spam)
- Log all attempts for security monitoring

## Testing Checklist

- [ ] Email arrives within 30 seconds
- [ ] Code is clearly visible
- [ ] Email looks good on mobile
- [ ] Email looks good on desktop
- [ ] Spam folder check
- [ ] Multiple email providers tested (Gmail, Outlook, etc.)
- [ ] Unsubscribe link (if required by law)
- [ ] Privacy policy link

## Troubleshooting

### Email not received
1. Check spam/junk folder
2. Verify API key is correct
3. Check email service dashboard for errors
4. Verify sender email is authenticated
5. Check rate limits

### "Failed to send" error
1. Verify API key in .env.local
2. Check API key permissions
3. Restart dev server after adding env vars
4. Check console for detailed error message

### Email in spam
1. Verify your domain with email service
2. Add SPF, DKIM, DMARC records
3. Use professional email content
4. Avoid spam trigger words

## Production Checklist

- [ ] Email service configured and tested
- [ ] Domain verified (if using custom domain)
- [ ] DNS records added (SPF, DKIM, DMARC)
- [ ] Rate limiting implemented
- [ ] Code expiration implemented (10 min)
- [ ] Email template tested on multiple clients
- [ ] Error handling and logging in place
- [ ] Monitoring and alerts configured
- [ ] Privacy policy updated
- [ ] Terms of service updated

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Resend | 100/day, 3,000/month | $20/mo for 50,000 |
| SendGrid | 100/day forever | $19.95/mo for 50,000 |
| Gmail SMTP | Limited, not for production | N/A |

## Recommendation

For WoodWise, I recommend **Resend** because:
- ✅ Easy setup (5 minutes)
- ✅ Modern API
- ✅ Great free tier
- ✅ Excellent deliverability
- ✅ Good documentation
- ✅ No credit card required for free tier
