import emailjs from '@emailjs/browser';

// My OTP generator (frontend fallback)
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// My EmailJS fallback when backend fails
export const sendOTPEmailFallback = async (email, otp, name) => {
  try {
    // My EmailJS accounts with rotation
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
      return false;
    }

    // Try each account
    for (const account of emailJSAccounts) {
      try {
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
          return true;
        } else {
          continue;
        }
      } catch (error) {
        continue;
      }
    }

    return false;
    
  } catch (error) {
    return false;
  }
};