import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email with Resend
    try {
      const emailResult = await resend.emails.send({
        from: 'WoodWise <onboarding@resend.dev>',
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
      console.log('\n========================================');
      console.log('📧 EMAIL SENT VIA RESEND');
      console.log('========================================');
      console.log(`To: ${email}`);
      console.log(`Code: ${code}`);
      console.log(`Email ID: ${emailResult.data?.id || 'N/A'}`);
      console.log(`Status: Success`);
      console.log('========================================\n');

      return NextResponse.json(
        { 
          success: true, 
          message: 'Verification code sent successfully',
          emailId: emailResult.data?.id
        },
        { status: 200 }
      );
    } catch (emailError: any) {
      console.error('Resend email error:', emailError);
      
      // Log detailed error
      console.log('\n========================================');
      console.log('⚠️ EMAIL FAILED');
      console.log('========================================');
      console.log(`Email: ${email}`);
      console.log(`Code: ${code}`);
      console.log(`Error: ${emailError.message}`);
      console.log(`Error Details:`, emailError);
      console.log('========================================\n');
      
      // Return error to frontend
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          message: emailError.message || 'Email service error',
          details: 'Please check if the email address is correct or try again later.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
