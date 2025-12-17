import mongoose from 'mongoose';

const emailVerificationSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3,
  },
});

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

export default EmailVerification;