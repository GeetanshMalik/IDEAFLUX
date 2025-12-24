import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  CircularProgress 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as api from '../../api';
import { useNotification } from '../Notification/NotificationSystem';
import { useLanguage } from '../../context/LanguageProvider';

const EmailVerification = () => {
  const { t } = useLanguage();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();
  
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/auth');
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.verifyEmail({ email, otp });
      
      localStorage.setItem('profile', JSON.stringify(data));
      dispatch({ type: 'AUTH', data });
      
      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('auth-change'));
      
      showSuccess('Email verified successfully! Welcome to IdeaFlux!');
      navigate('/posts');
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed. Please try again.';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      await api.resendOTP({ email });
      showSuccess('New verification code sent to your email!');
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(message);
      showError(message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  if (!email) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper 
        elevation={6} 
        sx={{ 
          p: 4, 
          bgcolor: '#1e293b', 
          border: '1px solid #334155',
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#14b8a6', fontWeight: 'bold', mb: 1 }}>
            Verify Your Email
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mb: 2 }}>
            We've sent a 6-digit verification code to:
          </Typography>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            {email}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: '#dc2626', color: 'white' }}>
            {error}
          </Alert>
        )}



        <form onSubmit={handleVerify}>
          <TextField
            fullWidth
            label="Enter 6-digit OTP"
            value={otp}
            onChange={handleOtpChange}
            placeholder="123456"
            autoComplete="one-time-code"
            inputProps={{ 
              maxLength: 6,
              style: { 
                textAlign: 'center', 
                fontSize: '1.5rem', 
                letterSpacing: '0.5rem',
                color: 'white'
              }
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#0f172a',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#14b8a6' },
                '&.Mui-focused fieldset': { borderColor: '#14b8a6' }
              },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#14b8a6' },
              '& input': { color: 'white !important' }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || otp.length !== 6}
            sx={{
              mb: 2,
              py: 1.5,
              bgcolor: '#14b8a6',
              '&:hover': { bgcolor: '#0d9488' },
              '&:disabled': { bgcolor: '#334155' }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              t('verifyEmail')
            )}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
            Didn't receive the code?
          </Typography>
          
          <Button
            onClick={handleResendOTP}
            disabled={countdown > 0 || resendLoading}
            sx={{ 
              color: countdown > 0 ? '#64748b' : '#14b8a6',
              '&:hover': { bgcolor: 'rgba(20, 184, 166, 0.1)' }
            }}
          >
            {resendLoading ? (
              <CircularProgress size={20} sx={{ color: '#14b8a6' }} />
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              t('resendCode')
            )}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid #334155' }}>
          <Button
            onClick={() => navigate('/auth')}
            sx={{ color: '#94a3b8' }}
          >
            Back to Sign Up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerification;