import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter (Gmail configuration)
const createTransporter = () => {
  // Check if email configuration exists
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
  }
  
  const cleanPassword = process.env.EMAIL_PASS.replace(/\s/g, '');
  
  console.log('🔧 Creating email transporter with config:');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 Password Length:', cleanPassword.length);
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
  
  // Try different configurations for better cloud compatibility
  const configs = [
    // Configuration 1: Standard Gmail with service
    {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: cleanPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    },
    // Configuration 2: Direct SMTP without service (better for cloud)
    {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: cleanPassword,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    },
    // Configuration 3: Alternative port for restrictive networks
    {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: cleanPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  ];
  
  // Use the first config by default, but log all options
  console.log('📧 Available email configurations:', configs.length);
  
  return nodemailer.createTransport(configs[1]); // Use direct SMTP config for cloud
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
    console.error('❌ Full error stack:', error.stack);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error response:', error.response);
    
    // Detailed error logging for deployment debugging
    console.error('🔍 Deployment Debug Info:');
    console.error('- NODE_ENV:', process.env.NODE_ENV);
    console.error('- Platform:', process.platform);
    console.error('- Email User Set:', !!process.env.EMAIL_USER);
    console.error('- Email Pass Set:', !!process.env.EMAIL_PASS);
    console.error('- Email Pass Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
    
    // Common Gmail errors
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Check your EMAIL_USER and EMAIL_PASS');
    } else if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
      console.error('🌐 Network/DNS issue. Render might be blocking SMTP connections');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timeout. Render network restrictions');
    } else if (error.message && error.message.includes('createTransporter')) {
      console.error('⚙️ Email configuration error. Check environment variables.');
    } else if (error.message && error.message.includes('SMTP')) {
      console.error('📧 SMTP server issue. Try alternative email service for deployment.');
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