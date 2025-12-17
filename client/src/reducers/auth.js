import { AUTH, LOGOUT } from '../constants/actionTypes';

const authReducer = (state = { authData: null }, action) => {
  switch (action.type) {
    case AUTH:
      localStorage.setItem('profile', JSON.stringify({ ...action?.data }));
      // Dispatch custom event to trigger re-renders
      window.dispatchEvent(new Event('auth-change'));
      return { ...state, authData: action?.data };
    case LOGOUT:
      localStorage.clear();
      // Dispatch custom event to trigger re-renders
      window.dispatchEvent(new Event('auth-change'));
      return { ...state, authData: null };
    default:
      return state;
  }
};

export default authReducer;