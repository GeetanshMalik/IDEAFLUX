import crypto from 'crypto';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendOTPEmail = async (email, otp, name) => {
  try {
    console.log('📧 EmailJS delivery to:', email);
    console.log('🔢 OTP:', otp);
    
    console.log('🔍 Environment Check:');
    console.log('- SERVICE_ID_1:', !!process.env.EMAILJS_SERVICE_ID_1);
    console.log('- TEMPLATE_ID_1:', !!process.env.EMAILJS_TEMPLATE_ID_1);
    console.log('- PUBLIC_KEY_1:', !!process.env.EMAILJS_PUBLIC_KEY_1);
    
    const accounts = [
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
        name: 'Secondary'
      }
    ].filter(acc => acc.service_id && acc.template_id && acc.public_key);

    if (accounts.length === 0) {
      console.error('❌ No EmailJS accounts configured');
      return false;
    }

    console.log(`📧 ${accounts.length} EmailJS accounts ready`);

    for (const account of accounts) {
      try {
        console.log(`📧 Trying ${account.name}...`);
        
        const emailData = {
          service_id: account.service_id,
          template_id: account.template_id,
          user_id: account.public_key,
          template_params: {
            to_email: email,
            to_name: name,
            otp: otp,
            app_name: 'IdeaFlux',
            from_name: 'IdeaFlux Team'
          }
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        });

        if (response.ok) {
          console.log(`✅ Email sent via ${account.name}`);
          return true;
        } else {
          const errorText = await response.text();
          console.log(`⚠️ ${account.name} failed (${response.status}): ${errorText}`);
          continue;
        }
      } catch (error) {
        console.log(`❌ ${account.name} error: ${error.message}`);
        continue;
      }
    }

    console.error('❌ All EmailJS accounts failed');
    return false;
    
  } catch (error) {
    console.error('❌ EmailJS system error:', error.message);
    return false;
  }
};

export const sendVerificationEmail = async (email, token, name) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    const accounts = [
      {
        service_id: process.env.EMAILJS_SERVICE_ID_1,
        template_id: process.env.EMAILJS_TEMPLATE_ID_1,
        public_key: process.env.EMAILJS_PUBLIC_KEY_1,
        name: 'Primary'
      }
    ].filter(acc => acc.service_id && acc.template_id && acc.public_key);

    for (const account of accounts) {
      try {
        const emailData = {
          service_id: account.service_id,
          template_id: account.template_id,
          user_id: account.public_key,
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
          console.log(`✅ Verification email sent via ${account.name}`);
          return true;
        }
      } catch (error) {
        console.log(`❌ ${account.name} failed:`, error.message);
        continue;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Verification email error:', error);
    return false;
  }
};