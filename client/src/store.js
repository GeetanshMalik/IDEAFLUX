import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from '@reduxjs/toolkit';
import postsReducer from './reducers/posts';
import authReducer from './reducers/auth';
import userReducer from './reducers/user';

const rootReducer = combineReducers({
  posts: postsReducer,
  auth: authReducer,
  user: userReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;