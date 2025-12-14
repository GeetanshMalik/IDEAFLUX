import { FETCH_USER, START_LOADING, END_LOADING, FOLLOW } from '../constants/actionTypes';

export default (state = { isLoading: true, userProfile: null }, action) => {
    switch (action.type) {
        case START_LOADING:
            return { ...state, isLoading: true };
        case END_LOADING:
            return { ...state, isLoading: false };
        case FETCH_USER:
            return { ...state, userProfile: action.payload };
        case FOLLOW:
             // Optimistically update the follower count/list in state
             // (In a real app, you might re-fetch the user to be safe, but this is faster)
            return { ...state }; 
        default:
            return state;
    }
};