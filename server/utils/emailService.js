import nodemailer from 'nodemailer';
import crypto from 'crypto';

// EmailJS API function with optimized rotation (fast failover)
const sendEmailViaEmailJS = async (email, otp, name) => {
  try {
    console.log('📧 Sending email via EmailJS with smart rotation...');
    
    // Multiple EmailJS accounts for rotation (600-800 emails/month)
    const emailJSAccounts = [
      {
        service_id: process.env.EMAILJS_SERVICE_ID_1,
        template_id: process.env.EMAILJS_TEMPLATE_ID_1,
        public_key: process.env.EMAILJS_PUBLIC_KEY_1,
        name: 'Primary'
      },
      {
        service_id: process.env.EMAILJS_SERVICE_ID_2,
        template_id: process.env.EMAILJS_TEMPLATE_ID_2,
        public_key: process.env.EMAILJS_PUBLIC_KEY_2,
        name: 'Backup-1'
      },
      {
        service_id: process.env.EMAILJS_SERVICE_ID_3,
        template_id: process.env.EMAILJS_TEMPLATE_ID_3,
        public_key: process.env.EMAILJS_PUBLIC_KEY_3,
        name: 'Backup-2'
      },
      {
        service_id: process.env.EMAILJS_SERVICE_ID_4,
        template_id: process.env.EMAILJS_TEMPLATE_ID_4,
        public_key: process.env.EMAILJS_PUBLIC_KEY_4,
        name: 'Backup-3'
      }
    ].filter(account => account.service_id && account.template_id && account.public_key);

    if (emailJSAccounts.length === 0) {
      console.error('❌ No EmailJS accounts configured');
      return false;
    }

    console.log(`📧 ${emailJSAccounts.length} accounts available for rotation`);

    // Try each account with fast timeout (only when needed)
    for (let i = 0; i < emailJSAccounts.length; i++) {
      const account = emailJSAccounts[i];
      
      try {
        console.log(`📧 Trying ${account.name}...`);
        
        const emailData = {
          service_id: account.service_id,
          template_id: account.template_id,
          user_id: account.public_key,
          template_params: {
            to_email: email,        // Works with ANY email provider (Gmail, Yahoo, Outlook, etc.)
            to_name: name,          
            otp: otp,              
            app_name: 'IdeaFlux',  
            from_name: 'IdeaFlux Team'
          }
        };

        // Fast API call with 5-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`✅ Email sent via ${account.name} to: ${email}`);
          return true;
        } else {
          const errorText = await response.text();
          console.log(`⚠️ ${account.name} failed (${response.status}): ${errorText}`);
          
          // Quick check: if quota exceeded (429), try next immediately
          if (response.status === 429) {
            console.log(`🔄 ${account.name} quota exceeded, trying next...`);
            continue; // Fast failover to next account
          }
          
          // For other errors, also try next account
          continue;
        }
      } catch (accountError) {
        if (accountError.name === 'AbortError') {
          console.log(`⏰ ${account.name} timeout, trying next...`);
        } else {
          console.log(`❌ ${account.name} error: ${accountError.message}`);
        }
        continue; // Try next account
      }
    }

    console.error('❌ All EmailJS accounts failed');
    return false;
    
  } catch (error) {
    console.error('❌ EmailJS rotation system failed:', error.message);
    return false;
  }
};

// Fallback: Resend API
const sendEmailViaResend = async (email, otp, name) => {
  try {
    console.log('📧 Attempting Resend API fallback...');
    
    if (!process.env.RESEND_API_KEY) {
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'IdeaFlux <noreply@yourdomain.com>',
        to: [email],
        subject: 'IdeaFlux - Email Verification',
        html: getEmailHTML(otp, name)
      }),
    });
    
    if (response.ok) {
      console.log('✅ Email sent via Resend API');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Resend API failed:', error.message);
    return false;
  }
};

// Fallback: SMTP (for localhost development)
const sendEmailViaSMTP = async (email, otp, name) => {
  try {
    console.log('📧 Attempting SMTP fallback...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return false;
    }

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s/g, ''),
      },
      tls: { rejectUnauthorized: false }
    });

    await transporter.verify();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'IdeaFlux - Email Verification',
      html: getEmailHTML(otp, name)
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent via SMTP');
    return true;
  } catch (error) {
    console.error('❌ SMTP failed:', error.message);
    return false;
  }
};

// Email HTML template
const getEmailHTML = (otp, name) => `
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
`;

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Main email sending function with multiple fallbacks
export const sendOTPEmail = async (email, otp, name) => {
  console.log('📧 Starting email delivery to:', email);
  console.log('🔢 OTP:', otp);

  // Method 1: EmailJS (Primary - works on Vercel)
  const emailJSResult = await sendEmailViaEmailJS(email, otp, name);
  if (emailJSResult) {
    return true;
  }

  // Method 2: Resend API (Fallback)
  const resendResult = await sendEmailViaResend(email, otp, name);
  if (resendResult) {
    return true;
  }

  // Method 3: SMTP (Development fallback)
  const smtpResult = await sendEmailViaSMTP(email, otp, name);
  if (smtpResult) {
    return true;
  }

  // All methods failed
  console.error('❌ All email delivery methods failed');
  console.error('🔍 Debug Info:');
  console.error('- EmailJS Service ID:', !!process.env.EMAILJS_SERVICE_ID);
  console.error('- EmailJS Template ID:', !!process.env.EMAILJS_TEMPLATE_ID);
  console.error('- EmailJS Public Key:', !!process.env.EMAILJS_PUBLIC_KEY);
  console.error('- Resend API Key:', !!process.env.RESEND_API_KEY);
  console.error('- Gmail User:', !!process.env.EMAIL_USER);
  
  return false;
};

// Send verification link email (alternative to OTP)
export const sendVerificationEmail = async (email, token, name) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    // Try EmailJS first
    if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY) {
      const emailData = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          to_name: name,
          verification_url: verificationUrl,
          app_name: 'IdeaFlux',
          from_name: 'IdeaFlux Team'
        }
      };

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        console.log('✅ Verification email sent via EmailJS');
        return true;
      }
    }

    // Fallback to SMTP
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/\s/g, ''),
      }
    });
    
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