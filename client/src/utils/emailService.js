import emailjs from 'emailjs-com';

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email using EmailJS (frontend)
export const sendOTPEmail = async (email, otp, name) => {
  try {
    console.log('📧 Sending email via EmailJS from frontend to:', email);
    console.log('🔢 OTP:', otp);
    
    // EmailJS accounts with rotation
    const emailJSAccounts = [
      {
        service_id: process.env.REACT_APP_EMAILJS_SERVICE_ID_1,
        template_id: process.env.REACT_APP_EMAILJS_TEMPLATE_ID_1,
        public_key: process.env.REACT_APP_EMAILJS_PUBLIC_KEY_1,
        name: 'Primary'
      },
      {
        service_id: process.env.REACT_APP_EMAILJS_SERVICE_ID_2,
        template_id: process.env.REACT_APP_EMAILJS_TEMPLATE_ID_2,
        public_key: process.env.REACT_APP_EMAILJS_PUBLIC_KEY_2,
        name: 'Secondary'
      }
    ].filter(account => account.service_id && account.template_id && account.public_key);

    if (emailJSAccounts.length === 0) {
      console.error('❌ No EmailJS accounts configured in frontend');
      return false;
    }

    console.log(`📧 ${emailJSAccounts.length} EmailJS accounts available`);

    // Try each account
    for (const account of emailJSAccounts) {
      try {
        console.log(`📧 Trying ${account.name} account...`);
        
        const templateParams = {
          to_email: email,
          to_name: name,
          otp: otp,
          app_name: 'IdeaFlux',
          from_name: 'IdeaFlux Team'
        };

        // Initialize EmailJS with public key
        emailjs.init(account.public_key);

        // Send email using EmailJS
        const response = await emailjs.send(
          account.service_id,
          account.template_id,
          templateParams
        );

        if (response.status === 200) {
          console.log(`✅ Email sent successfully via ${account.name}`);
          return true;
        } else {
          console.log(`⚠️ ${account.name} failed with status:`, response.status);
          continue;
        }
      } catch (error) {
        console.log(`❌ ${account.name} error:`, error.message);
        continue;
      }
    }

    console.error('❌ All EmailJS accounts failed');
    return false;
    
  } catch (error) {
    console.error('❌ EmailJS frontend error:', error.message);
    return false;
  }
};