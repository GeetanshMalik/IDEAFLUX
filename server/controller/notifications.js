import Notification from '../model/notification.js';
import User from '../model/user.js';

// Create notification helper
export const createNotification = async (userId, senderId, type, message, postId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      sender: senderId,
      type,
      message,
      post: postId,
      read: false,
      createdAt: new Date()
    });

    await notification.populate('sender', 'name picture');
    if (postId) {
      await notification.populate('post', 'title selectedFile');
    }

    // Send real-time notification using global io
    if (global.io) {
      console.log(`📤 Attempting to send notification to room: ${userId.toString()}`);
      global.io.to(userId.toString()).emit('notification received', notification);
      console.log(`🔔 Notification sent to ${userId}: ${type} - ${message}`);
      
      // Also emit to all connected sockets for debugging
      global.io.emit('debug-notification', {
        targetUser: userId.toString(),
        notification: notification,
        timestamp: new Date()
      });
    } else {
      console.log('⚠️ Socket.io not available for notification');
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const notifications = await Notification.find({ user: req.userId })
      .populate('sender', 'name picture')
      .populate('post', 'title selectedFile')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// Mark notifications as read
export const markNotificationsRead = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    await Notification.updateMany(
      { user: req.userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Notifications marked as read." });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ message: "Failed to mark notifications as read." });
  }
};

// Mark single notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    await Notification.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: "Failed to mark notification as read." });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    await Notification.findOneAndDelete({ _id: id, user: req.userId });

    res.status(200).json({ message: "Notification deleted." });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: "Failed to delete notification." });
  }
};