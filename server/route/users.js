import express from 'express';
import { 
    signin, 
    signup,
    verifyEmail,
    resendOTP,
    googleSignin, 
    getUser,
    getUserProfile,
    updateUserProfile,
    checkUsernameAvailability,
    searchUsers, 
    followUser, 
    unfollowUser,
    updateUser,
    getNotifications, 
    markNotificationsRead,
    clearNotifications,
    deleteUser 
} from '../controller/users.js';
import { markNotificationRead } from '../controller/notifications.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Auth
router.post('/signin', signin);
router.post('/signup', signup);
router.post('/google', googleSignin);

// Public User Data
router.get('/search', searchUsers);
router.get('/:id', getUser);

// Protected User Actions
router.patch('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser); // Delete Route
router.patch('/:id/follow', auth, followUser);
router.patch('/:id/unfollow', auth, unfollowUser);

// Notifications
router.get('/notifications', auth, getNotifications); 

/* CORRECT ORDER FOR ROUTES */
const safeRouter = express.Router();

safeRouter.post('/signin', signin);
safeRouter.post('/signup', signup);
safeRouter.post('/verify-email', verifyEmail);
safeRouter.post('/resend-otp', resendOTP);
safeRouter.post('/google', googleSignin);

// Specific routes first
safeRouter.get('/search', searchUsers);
safeRouter.get('/check-username/:username', checkUsernameAvailability);
safeRouter.get('/profile/:id', getUserProfile);
safeRouter.patch('/profile/:id', auth, updateUserProfile);
safeRouter.get('/notifications', auth, getNotifications); 
safeRouter.patch('/notifications/read', auth, markNotificationsRead);
safeRouter.delete('/notifications', auth, clearNotifications);
safeRouter.patch('/notifications/:id/read', auth, markNotificationRead);

// Dynamic routes last
safeRouter.get('/:id', getUser);
safeRouter.patch('/:id', auth, updateUser);
safeRouter.delete('/:id', auth, deleteUser);
safeRouter.patch('/:id/follow', auth, followUser);
safeRouter.patch('/:id/unfollow', auth, unfollowUser);

export default safeRouter;