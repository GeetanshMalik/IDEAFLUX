import dotenv from 'dotenv';
import { sendOTPEmail, generateOTP } from './utils/emailService.js';

dotenv.config();

async function testEmail() {
  console.log('🧪 Testing email service...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
  
  const testEmail = 'geetanshmalik2022@vitbhopal.ac.in'; // Use your email
  const testOTP = generateOTP();
  
  console.log('📤 Sending test email to:', testEmail);
  console.log('🔢 Test OTP:', testOTP);
  
  try {
    const result = await sendOTPEmail(testEmail, testOTP, 'Test User');
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Check your inbox for the OTP:', testOTP);
    } else {
      console.log('❌ Email sending failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();