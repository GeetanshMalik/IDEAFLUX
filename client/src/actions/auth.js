import { AUTH } from '../constants/actionTypes';
import * as api from '../api/index.js';

export const signin = (formData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signIn(formData);

    dispatch({ type: AUTH, data });

    // Navigate to posts page after successful login
    navigate('/posts');
  } catch (error) {
    console.log(error);
    // Alert the specific error from the backend
    const message = error.response?.data?.message || "Login failed. Check your internet or server.";
    alert(`Error: ${message}`);
  }
};

export const signup = (formData, navigate) => async (dispatch) => {
  try {
    // Basic validation before sending
    if (formData.password !== formData.confirmPassword) {
        return alert("Passwords do not match!");
    }
    
    const { data } = await api.signUp(formData);

    // Check if email verification is required
    if (data.requiresVerification) {
      navigate('/verify-email', { 
        state: { 
          email: data.email
        } 
      });
      return;
    }

    dispatch({ type: AUTH, data });
    navigate('/posts'); // Redirect to posts on success
  } catch (error) {
    console.log(error);
    // Alert the specific error from the backend
    const message = error.response?.data?.message || "Please check your email for verification code.";
    
    // If it's a verification required response, don't show as error
    if (error.response?.data?.requiresVerification) {
      // This is actually success - user needs to verify email
      return;
    }
    
    alert(`Error: ${message}`);
  }
};