import { AUTH } from '../constants/actionTypes';
import * as api from '../api/index.js';

export const signin = (formData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signIn(formData);

    dispatch({ type: AUTH, data });

    // Trigger auth state change event
    window.dispatchEvent(new CustomEvent('auth-change'));

    // Navigate to posts page after successful login
    navigate('/posts');
    return Promise.resolve();
  } catch (error) {
    console.log(error);
    // Alert the specific error from the backend
    const message = error.response?.data?.message || "Login failed. Check your internet or server.";
    alert(`Error: ${message}`);
    return Promise.reject(error);
  }
};

export const signup = (formData, navigate) => async (dispatch) => {
  try {
    // Basic validation before sending
    if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return Promise.reject(new Error("Passwords do not match"));
    }
    
    const { data } = await api.signUp(formData);

    // Check if email verification is required (successful response)
    if (data.requiresVerification) {
      navigate('/verify-email', { 
        state: { 
          email: data.email
        } 
      });
      return Promise.resolve();
    }

    // If no verification required, user is logged in directly
    dispatch({ type: AUTH, data });
    navigate('/posts');
    return Promise.resolve();
  } catch (error) {
    console.log('Signup error:', error);
    
    // Show actual errors
    const message = error.response?.data?.message || error.message || "Signup failed. Please try again.";
    alert(`Error: ${message}`);
    return Promise.reject(error);
  }
};