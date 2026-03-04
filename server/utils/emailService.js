import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// My OTP generator
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: delay for ms
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// My Gmail SMTP service with retry logic
async function sendViaGmailSMTP(email, otp, name) {
  const MAX_RETRIES = 2;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.log('❌ Gmail credentials missing');
    return false;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`📧 Gmail SMTP attempt ${attempt}/${MAX_RETRIES + 1}...`);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        },
        connectionTimeout: 10000,  // 10 second connection timeout
        greetingTimeout: 10000,    // 10 second greeting timeout
        socketTimeout: 15000,      // 15 second socket timeout
      });

      await transporter.verify();
      console.log('✅ Gmail connection verified');

      const mailOptions = {
        from: `"IdeaFlux Team" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'IdeaFlux - Email Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
          @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .header { padding: 20px 15px !important; }
          .content { padding: 20px 15px !important; }
          .otp-box { padding: 15px !important; margin: 20px 0 !important; }
          .otp-code { font-size: 28px !important; letter-spacing: 3px !important; }
          .features { padding: 15px !important; }
          h1 { font-size: 24px !important; }
          h2 { font-size: 20px !important; }
          }
          </style>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
          <!-- Main Container -->
          <div class="container" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; box-sizing: border-box;">
          <!-- Header -->
          <div class="header" style="background: linear-gradient(135deg, #14b8a6, #3b82f6); padding: 30px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">💡IdeaFlux</h1>
          <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.9;">Where Ideas Come to Life</p>
          </div>
          <!-- Main Content -->
          <div class="content" style="padding: 30px 20px; box-sizing: border-box;">
          <!-- Welcome Message -->
          <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 22px; text-align: center;">Welcome ${name}! 🎉</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0; text-align: center;">We're excited to have you join IdeaFlux! You're one step away from connecting with amazing creators.</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.5; margin: 0 0 25px 0; text-align: center;">Please verify your email with the code below:</p>
          <!-- OTP Code Box -->
          <div class="otp-box" style="background: linear-gradient(135deg, #14b8a6, #06b6d4); padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0; box-sizing: border-box;">
          <p style="color: white; margin: 0 0 8px 0; font-size: 12px; font-weight: bold; letter-spacing: 1px;">VERIFICATION CODE</p>
          <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 6px; display: inline-block; min-width: 150px;">
          <span class="otp-code" style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          </div>
          <!-- Timer -->
          <p style="color: #64748b; font-size: 13px; text-align: center; margin: 20px 0;">⏰ This code will expire in <strong>10 minutes</strong> for your security.</p>
          <!-- Features Section -->
          <div class="features" style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0; box-sizing: border-box;">
          <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 16px; text-align: center;">🚀 What's waiting for you:</h3>
          <div style="color: #475569; font-size: 14px; line-height: 1.6;">
          <p style="margin: 8px 0; text-align: center;">✨ Share ideas & get feedback</p>
          <p style="margin: 8px 0; text-align: center;">💬 Real-time chat with creators</p>
          <p style="margin: 8px 0; text-align: center;">🤖 AI assistant to help you</p>
          <p style="margin: 8px 0; text-align: center;">🔥 Discover trending content</p>
          </div>
          </div>
          <!-- Footer Note -->
          <p style="color: #64748b; font-size: 14px; text-align: center; margin: 20px 0 0 0; line-height: 1.4;">If you didn't create this account, you can safely ignore this email.</p>
          </div>
          <!-- Footer -->
          <div style="background: #1e293b; padding: 20px; text-align: center; color: #94a3b8;">
          <p style="margin: 0 0 5px 0; font-size: 13px;">Need Help? We're here for YOU!</p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">© 2025 IdeaFlux Team</p>
          </div>
          </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Gmail email sent successfully');
      return true;
    } catch (error) {
      console.error(`❌ Gmail SMTP attempt ${attempt} error:`, error.message);
      if (attempt <= MAX_RETRIES) {
        console.log(`⏳ Retrying in 1 second...`);
        await delay(1000);
      }
    }
  }

  return false;
}

// My Resend API service
async function sendViaResend(email, otp, name) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return false;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'IdeaFlux <noreply@ideaflux.com>',
      to: email,
      subject: 'IdeaFlux - Email Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
        @media only screen and (max-width: 600px) {
        .container { width: 100% !important; padding: 10px !important; }
        .header { padding: 20px 15px !important; }
        .content { padding: 20px 15px !important; }
        .otp-box { padding: 15px !important; margin: 20px 0 !important; }
        .otp-code { font-size: 28px !important; letter-spacing: 3px !important; }
        .features { padding: 15px !important; }
        h1 { font-size: 24px !important; }
        h2 { font-size: 20px !important; }
        }
        </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <!-- Main Container -->
        <div class="container" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; box-sizing: border-box;">
        <!-- Header -->
        <div class="header" style="background: linear-gradient(135deg, #14b8a6, #3b82f6); padding: 30px 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">💡IdeaFlux</h1>
        <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.9;">Where Ideas Come to Life</p>
        </div>
        <!-- Main Content -->
        <div class="content" style="padding: 30px 20px; box-sizing: border-box;">
        <!-- Welcome Message -->
        <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 22px; text-align: center;">Welcome ${name}! 🎉</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0; text-align: center;">We're excited to have you join IdeaFlux! You're one step away from connecting with amazing creators.</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.5; margin: 0 0 25px 0; text-align: center;">Please verify your email with the code below:</p>
        <!-- OTP Code Box -->
        <div class="otp-box" style="background: linear-gradient(135deg, #14b8a6, #06b6d4); padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0; box-sizing: border-box;">
        <p style="color: white; margin: 0 0 8px 0; font-size: 12px; font-weight: bold; letter-spacing: 1px;">VERIFICATION CODE</p>
        <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 6px; display: inline-block; min-width: 150px;">
        <span class="otp-code" style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 5px; font-family: 'Courier New', monospace;">${otp}</span>
        </div>
        </div>
        <!-- Timer -->
        <p style="color: #64748b; font-size: 13px; text-align: center; margin: 20px 0;">⏰ This code will expire in <strong>10 minutes</strong> for your security.</p>
        <!-- Features Section -->
        <div class="features" style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0; box-sizing: border-box;">
        <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 16px; text-align: center;">🚀 What's waiting for you:</h3>
        <div style="color: #475569; font-size: 14px; line-height: 1.6;">
        <p style="margin: 8px 0; text-align: center;">✨ Share ideas & get feedback</p>
        <p style="margin: 8px 0; text-align: center;">💬 Real-time chat with creators</p>
        <p style="margin: 8px 0; text-align: center;">🤖 AI assistant to help you</p>
        <p style="margin: 8px 0; text-align: center;">🔥 Discover trending content</p>
        </div>
        </div>
        <!-- Footer Note -->
        <p style="color: #64748b; font-size: 14px; text-align: center; margin: 20px 0 0 0; line-height: 1.4;">If you didn't create this account, you can safely ignore this email.</p>
        </div>
        <!-- Footer -->
        <div style="background: #1e293b; padding: 20px; text-align: center; color: #94a3b8;">
        <p style="margin: 0 0 5px 0; font-size: 13px;">Need Help? We're here for YOU!</p>
        <p style="margin: 0; font-size: 11px; color: #64748b;">© 2025 IdeaFlux Team</p>
        </div>
        </div>
        </body>
        </html>
      `
    });

    return true;
  } catch (error) {
    return false;
  }
}

// My hybrid email system - tries methods in order
export async function sendOTPEmail(email, otp, name) {
  try {
    console.log('📧 Starting hybrid email service for:', email);
    console.log('🔍 Environment check:');
    console.log('- Gmail User:', !!process.env.GMAIL_USER);
    console.log('- Gmail Pass:', !!process.env.GMAIL_PASS);
    console.log('- Resend Key:', !!process.env.RESEND_API_KEY);

    // Try Gmail first
    console.log('📧 Trying Gmail SMTP...');
    const gmailResult = await sendViaGmailSMTP(email, otp, name);
    if (gmailResult) {
      console.log('✅ Gmail SMTP successful');
      return { success: true, method: 'gmail' };
    }
    console.log('❌ Gmail SMTP failed');

    // Try Resend if Gmail fails
    console.log('📧 Trying Resend API...');
    const resendResult = await sendViaResend(email, otp, name);
    if (resendResult) {
      console.log('✅ Resend API successful');
      return { success: true, method: 'resend' };
    }
    console.log('❌ Resend API failed');

    // Frontend EmailJS fallback if both fail
    console.log('📧 Both backend methods failed, triggering frontend fallback');
    return { success: false, method: 'none' };

  } catch (error) {
    console.error('❌ Email service error:', error);
    return { success: false, method: 'error' };
  }
}