// Simple test script to verify email configuration
// Run with: node test-email.js

import dotenv from 'dotenv';
import { sendOTPEmail, generateOTP } from './server/utils/emailService.js';

// Load environment variables
dotenv.config({ path: './server/.env' });

async function testEmail() {
  console.log('🧪 Testing email configuration...');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('📧 Email Pass Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '').length : 0);
  
  const testEmail = 'malikrekha337@gmail.com'; // Use the email from the screenshot
  const testOTP = generateOTP();
  
  console.log('📤 Sending test email to:', testEmail);
  console.log('🔢 Test OTP:', testOTP);
  
  try {
    const result = await sendOTPEmail(testEmail, testOTP, 'Test User');
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Check your inbox (and spam folder)');
      console.log('🔢 Your test OTP is:', testOTP);
    } else {
      console.log('❌ Email sending failed - check server logs for details');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();