import { FETCH_USER, START_LOADING, END_LOADING, FOLLOW } from '../constants/actionTypes';
import * as api from '../api/index';

export const getUser = (id) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING });
    const { data } = await api.fetchUser(id);
    dispatch({ type: FETCH_USER, payload: data });
    dispatch({ type: END_LOADING });
  } catch (error) {
    console.log(error);
  }
};

export const updateUserProfile = (id, user) => async (dispatch) => {
    try {
      const { data } = await api.updateUserProfile(id, user);
      
      // Update Redux state immediately
      dispatch({ type: FETCH_USER, payload: data });
      
      // Update local storage so Navbar avatar updates instantly
      const profile = JSON.parse(localStorage.getItem('profile'));
      if (profile && profile.result) {
        profile.result = { ...profile.result, ...data };
        localStorage.setItem('profile', JSON.stringify(profile));
        
        // Trigger auth state change event for components that listen to it
        window.dispatchEvent(new CustomEvent('auth-change'));
      }
      
      return data; // Return the updated data
    } catch (error) {
      console.log(error);
      throw error; // Re-throw so component can handle it
    }
};

export const followUser = (id) => async (dispatch) => {
    try {
        await api.followUser(id);
        dispatch({ type: FOLLOW, payload: id });
    } catch (error) {
        console.log(error);
    }
};

export const unfollowUser = (id) => async (dispatch) => {
    try {
        await api.unfollowUser(id);
        dispatch({ type: FOLLOW, payload: id });
    } catch (error) {
        console.log(error);
    }
};