import Notification from '../model/notification.js';

export const getNotifications = async (req, res) => {
    try {
        // Fetch notifications where 'user' is the current logged-in user
        const notifications = await Notification.find({ user: req.userId })
            .populate("sender", "name picture") // Get details of who triggered it
            .populate("post", "title")          // Get details of the post (if applicable)
            .sort({ createdAt: -1 });           // Newest first

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.userId, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: "Notifications marked as read." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};