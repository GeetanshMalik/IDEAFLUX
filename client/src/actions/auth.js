import { AUTH } from '../constants/actionTypes';
import * as api from '../api/index.js';

export const signin = (formData, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signIn(formData);

    dispatch({ type: AUTH, data });

    navigate('/explore'); // Redirect to Explore on success
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

    dispatch({ type: AUTH, data });

    navigate('/explore'); // Redirect to Explore on success
  } catch (error) {
    console.log(error);
    // Alert the specific error from the backend
    const message = error.response?.data?.message || "Signup failed. Try again.";
    alert(`Error: ${message}`);
  }
};