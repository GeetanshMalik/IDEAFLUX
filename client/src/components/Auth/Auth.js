import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Avatar, Button, Paper, Grid, Typography, Container, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google'; // NEW LIBRARY
import { jwtDecode } from 'jwt-decode'; // TO DECODE TOKEN
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Input from './Input';
import { signin, signup } from '../../actions/auth';
import * as api from '../../api';
import { useLanguage } from '../../context/LanguageProvider';
import { generateOTP, sendOTPEmail } from '../../utils/emailService';

const Auth = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => setShowPassword(!showPassword);

  const switchMode = () => {
    setForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    setIsSignup((prevIsSignup) => !prevIsSignup);
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignup) {
        // Generate OTP and send email via EmailJS (frontend)
        const otp = generateOTP();
        console.log('📧 Generated OTP:', otp);
        
        // Send email using EmailJS from frontend
        const emailSent = await sendOTPEmail(form.email, otp, `${form.firstName} ${form.lastName}`);
        
        if (emailSent) {
          // Email sent successfully, now send signup data with OTP to server
          await dispatch(signup({ ...form, otp }, navigate));
        } else {
          alert('Failed to send verification email. Please try again.');
        }
      } else {
        await dispatch(signin(form, navigate));
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const googleSuccess = async (res) => {
    // New Library returns a "credential" JWT
    const decoded = jwtDecode(res.credential);
    const { name, picture, email, sub } = decoded;

    const user = {
        name,
        email,
        picture,
        googleId: sub
    };

    try {
      // Send to backend to create/find user in DB
      const { data } = await api.googleSignIn(user);
      dispatch({ type: 'AUTH', data });
      
      // Trigger auth state change event
      window.dispatchEvent(new CustomEvent('auth-change'));
      
      navigate('/posts');
    } catch (error) {
      console.log(error);
    }
  };

  const googleError = () => {
      console.log('Google Sign In was unsuccessful. Try again later');
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{
          marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 3,
          backgroundColor: '#1e293b', color: 'white'
      }}>
        <Avatar sx={{ margin: 1, bgcolor: '#14b8a6' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">{isSignup ? t('signup') : t('signin')}</Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', marginTop: 3 }}>
          <Grid container spacing={2}>
            {isSignup && (
              <>
                <Input name="firstName" label="First Name" handleChange={handleChange} autoFocus half />
                <Input name="lastName" label="Last Name" handleChange={handleChange} half />
              </>
            )}
            <Input name="email" label="Email Address" handleChange={handleChange} type="email" />
            <Input name="password" label="Password" handleChange={handleChange} type={showPassword ? 'text' : 'password'} handleShowPassword={handleShowPassword} />
            {isSignup && <Input name="confirmPassword" label="Repeat Password" handleChange={handleChange} type="password" />}
          </Grid>
          
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              bgcolor: '#14b8a6', 
              '&:hover': { bgcolor: '#0d9488' },
              '&:disabled': { bgcolor: '#334155' }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              isSignup ? t('signup') : t('signin')
            )}
          </Button>

          {/* NEW GOOGLE BUTTON */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <GoogleLogin
                onSuccess={googleSuccess}
                onError={googleError}
                theme="filled_blue"
                text="signin_with"
                shape="pill"
            />
          </Box>

          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button onClick={switchMode} sx={{ color: '#94a3b8' }}>
                {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign Up"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Auth;