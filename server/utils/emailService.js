import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter (Gmail configuration)
const createTransporter = () => {
  const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');
  
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword, // Use cleaned App Password for Gmail
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send OTP email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    // Check if email configuration is set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_USER === 'your_gmail@gmail.com' || 
        process.env.EMAIL_PASS === 'your_gmail_app_password') {
      console.error('❌ Email configuration not set. Please configure EMAIL_USER and EMAIL_PASS in .env file');
      return false;
    }

    // Clean up the app password (remove spaces if any)
    const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');
    console.log('📧 Attempting to send email to:', email);
    console.log('📧 Using email account:', process.env.EMAIL_USER);

    const transporter = createTransporter();
    
    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('✅ Email transporter verified successfully');
    } catch (verifyError) {
      console.error('❌ Email transporter verification failed:', verifyError.message);
      return false;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'IdeaFlux - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: white; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #14b8a6; margin: 0;">IdeaFlux</h1>
            <p style="color: #94a3b8; margin: 5px 0;">Welcome to the community!</p>
          </div>
          
          <div style="background-color: #1e293b; padding: 30px; border-radius: 8px; text-align: center;">
            <h2 style="color: white; margin-bottom: 20px;">Hi ${name}!</h2>
            <p style="color: #94a3b8; margin-bottom: 30px;">Please verify your email address to complete your registration.</p>
            
            <div style="background-color: #14b8a6; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
              This OTP will expire in 5 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #64748b; font-size: 12px;">
              © 2024 IdeaFlux. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully to:', email);
    console.log('📧 Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('❌ Full error:', error);
    
    // Common Gmail errors
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Check your EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Check your internet connection');
    }
    
    return false;
  }
};

// Send verification link email (alternative to OTP)
export const sendVerificationEmail = async (email, token, name) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'IdeaFlux - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: white; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #14b8a6; margin: 0;">IdeaFlux</h1>
            <p style="color: #94a3b8; margin: 5px 0;">Welcome to the community!</p>
          </div>
          
          <div style="background-color: #1e293b; padding: 30px; border-radius: 8px;">
            <h2 style="color: white; margin-bottom: 20px;">Hi ${name}!</h2>
            <p style="color: #94a3b8; margin-bottom: 30px;">Please click the button below to verify your email address and complete your registration.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #14b8a6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #14b8a6; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
              This link will expire in 24 hours. If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};