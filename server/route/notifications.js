import express from 'express';
import { getNotifications, markNotificationsRead } from '../controller/notifications.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All notification routes require authentication
router.get('/', auth, getNotifications);
router.patch('/read', auth, markNotificationsRead);

export default router;