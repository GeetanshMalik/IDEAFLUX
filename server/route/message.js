import express from 'express';
import { sendMessage, allMessages, accessChat } from '../controller/message.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.route('/').post(auth, sendMessage);        // Send a new message
router.route('/:chatId').get(auth, allMessages);  // Fetch messages for a specific chat
router.route('/chat').post(auth, accessChat);     // Create or retrieve a chat room

export default router;