import { Resend } from 'resend';

// Lazy initialization of Resend
let resend = null;

const getResendInstance = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    console.log('🔧 Initializing Resend with API key...');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email using Resend
export const sendOTPEmailResend = async (email, otp, name) => {
  try {
    // Get Resend instance (lazy initialization)
    const resendInstance = getResendInstance();
    
    if (!resendInstance) {
      console.error('❌ Resend not available - RESEND_API_KEY missing or invalid');
      console.error('🔍 Environment check:');
      console.error('- RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
      console.error('- RESEND_API_KEY length:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0);
      console.error('- RESEND_API_KEY starts with re_:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.startsWith('re_') : false);
      return false;
    }

    console.log('📧 Sending email via Resend to:', email);
    console.log('🔢 OTP:', otp);
    console.log('🔧 Resend instance created successfully');

    const { data, error } = await resendInstance.emails.send({
      from: 'IdeaFlux <onboarding@resend.dev>', // Default Resend domain (works immediately)
      to: [email],
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
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('✅ Email sent successfully via Resend');
    console.log('📧 Message ID:', data.id);
    console.log('📧 Response data:', JSON.stringify(data, null, 2));
    return true;

  } catch (error) {
    console.error('❌ Resend email sending failed:', error.message);
    console.error('❌ Full error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Check if it's an API key issue
    if (error.message && error.message.includes('API key')) {
      console.error('🔑 API Key issue detected');
    }
    
    return false;
  }
};

// Fallback function that tries Resend first, then Gmail
export const sendOTPEmail = async (email, otp, name) => {
  console.log('📧 Attempting to send email with Resend...');
  
  // Try Resend first
  const resendSuccess = await sendOTPEmailResend(email, otp, name);
  
  if (resendSuccess) {
    console.log('✅ Email sent successfully via Resend');
    return true;
  }
  
  console.log('⚠️ Resend failed, trying Gmail fallback...');
  
  // Fallback to Gmail (import the old function)
  try {
    const { sendOTPEmail: sendOTPEmailGmail } = await import('./emailService.js');
    const gmailSuccess = await sendOTPEmailGmail(email, otp, name);
    
    if (gmailSuccess) {
      console.log('✅ Email sent successfully via Gmail fallback');
      return true;
    }
  } catch (error) {
    console.error('❌ Gmail fallback also failed:', error.message);
  }
  
  console.log('❌ Both Resend and Gmail failed');
  return false;
};