import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Generate OTP function
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// PRIORITY 1: Gmail SMTP using Nodemailer
async function sendViaGmailSMTP(email, otp, name) {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"IdeaFlux Team" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'IdeaFlux - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #14b8a6; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">IF</div>
              <h1 style="color: #1e293b; margin: 20px 0 10px 0;">IdeaFlux</h1>
            </div>
            
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Email Verification</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Welcome to IdeaFlux! Please use the verification code below to complete your account setup:
            </p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #14b8a6; letter-spacing: 4px;">${otp}</div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px;">© 2025 IdeaFlux. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

// PRIORITY 2: Resend API
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #14b8a6; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">IF</div>
              <h1 style="color: #1e293b; margin: 20px 0 10px 0;">IdeaFlux</h1>
            </div>
            
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Email Verification</h2>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
            
            <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
              Welcome to IdeaFlux! Please use the verification code below to complete your account setup:
            </p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #14b8a6; letter-spacing: 4px;">${otp}</div>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px;">© 2025 IdeaFlux. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    });

    return true;
  } catch (error) {
    return false;
  }
}

// HYBRID EMAIL SERVICE - Main export function
export async function sendOTPEmail(email, otp, name) {
  try {
    // Priority 1: Gmail SMTP
    const gmailResult = await sendViaGmailSMTP(email, otp, name);
    if (gmailResult) {
      return { success: true, method: 'gmail' };
    }

    // Priority 2: Resend API
    const resendResult = await sendViaResend(email, otp, name);
    if (resendResult) {
      return { success: true, method: 'resend' };
    }

    // Priority 3: Return false to trigger frontend EmailJS fallback
    return { success: false, method: 'none' };

  } catch (error) {
    return { success: false, method: 'error' };
  }
}