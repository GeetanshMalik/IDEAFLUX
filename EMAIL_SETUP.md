# Email Verification Setup

Email verification is now **ENABLED** in your IdeaFlux application! 🎉

## Current Status
- ✅ Email verification system is active
- ✅ OTP-based verification implemented
- ✅ Development mode fallback included

## For Development (Local Testing)

If you haven't configured email yet, the system will:
1. Show the OTP in the server console
2. Display the OTP in the verification page
3. Allow you to test the verification flow

## For Production (Email Configuration Required)

### Step 1: Get Gmail App Password
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → 2-Step Verification → App passwords
4. Generate an "App Password" for IdeaFlux
5. Copy the 16-character app password (no spaces)

### Step 2: Update Server Environment
Edit `server/.env` file:

```env
# Replace with your actual Gmail credentials
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**Important Notes:**
- Use your full Gmail address (including @gmail.com)
- Use the 16-character app password (not your regular Gmail password)
- Remove any spaces from the app password
- Make sure 2-Factor Authentication is enabled on your Gmail

### Step 3: Test Email Configuration
You can test if email is working by making a POST request to:
```
POST http://localhost:5000/test-email
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Step 4: Restart Server
```bash
cd server
npm start
```

## How It Works

1. **User signs up** → System generates 6-digit OTP
2. **Email sent** → User receives verification email
3. **User enters OTP** → Account is created and verified
4. **Auto-login** → User is redirected to posts page

## Features

- ✅ 6-digit OTP verification
- ✅ 5-minute expiration (temporary database)
- ✅ 3 attempt limit
- ✅ Resend OTP functionality
- ✅ Beautiful email templates
- ✅ Real email sending (no development mode display)
- ✅ Error handling and validation
- ✅ Test email endpoint for debugging

## Troubleshooting

### Email Not Sending?
1. Check server console for error messages
2. Verify Gmail App Password is correct (16 characters, no spaces)
3. Ensure 2-Factor Authentication is enabled on Gmail
4. Test with the `/test-email` endpoint
5. Check spam folder in recipient's email

### Common Errors:
- `EAUTH`: Wrong email/password
- `ECONNECTION`: Internet connection issue
- `Invalid login`: Need to use App Password, not regular password

## Testing

1. Try signing up with any email
2. Check server console for OTP (development mode)
3. Enter the OTP in verification page
4. Should redirect to posts page

## Notes

- Email verification is **required** for new signups
- Google OAuth users bypass email verification
- Existing users are not affected
- All existing functionality remains unchanged