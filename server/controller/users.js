import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../model/user.js";
import Notification from "../model/notification.js";
import { pushNotification } from "../socket.js";

// --- AUTHENTICATION ---

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: "User doesn't exist." });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, "test", { expiresIn: "1h" });

    res.status(200).json({ result: existingUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match." });

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await User.create({ 
        email, 
        password: hashedPassword, 
        name: `${firstName} ${lastName}`,
        bio: "",
        dob: "" 
    });

    const token = jwt.sign({ email: result.email, id: result._id }, "test", { expiresIn: "1h" });

    res.status(200).json({ result, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const googleSignin = async (req, res) => {
    const { email, name, picture, googleId } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,
                name,
                picture,
                googleId,
                password: "GOOGLE_AUTH_NO_PASSWORD" 
            });
        }
        const token = jwt.sign({ email: user.email, id: user._id }, "test", { expiresIn: "1h" });
        res.status(200).json({ result: user, token });
    } catch (error) {
        res.status(500).json({ message: "Google Signin failed" });
    }
};

// --- USER DATA & ACTIONS ---

export const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id)
            .populate('followers', 'name picture')
            .populate('following', 'name picture');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const searchUsers = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const name = new RegExp(searchQuery, "i");
        const users = await User.find({ name });
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, bio, dob, picture } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);

    const updatedUser = { name, bio, dob, picture, _id: id };

    await User.findByIdAndUpdate(id, updatedUser, { new: true });

    res.json(updatedUser);
};

export const followUser = async (req, res) => {
    const { id } = req.params;
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    try {
        const targetUser = await User.findById(id);
        const currentUser = await User.findById(req.userId);

        if (!targetUser.followers.includes(req.userId)) {
            await targetUser.updateOne({ $push: { followers: req.userId } });
            await currentUser.updateOne({ $push: { following: id } });

            const notification = await Notification.create({
                user: targetUser._id,
                sender: currentUser._id,
                type: 'follow',
                message: `${currentUser.name} started following you.`,
            });
            await targetUser.updateOne({ $push: { notifications: notification._id }});
            // Ensure socket function exists or comment out if not using socket in controller
            if(pushNotification) pushNotification(targetUser._id.toString(), notification);
            
            res.status(200).json({ message: "User followed successfully." });
        } else {
            res.status(400).json({ message: "You already follow this user." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const unfollowUser = async (req, res) => {
    const { id } = req.params;
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    try {
        const targetUser = await User.findById(id);
        const currentUser = await User.findById(req.userId);

        if (targetUser.followers.includes(req.userId)) {
            await targetUser.updateOne({ $pull: { followers: req.userId } });
            await currentUser.updateOne({ $pull: { following: id } });
            res.status(200).json({ message: "User unfollowed successfully." });
        } else {
            res.status(400).json({ message: "You do not follow this user." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- NOTIFICATIONS ---
export const getNotifications = async (req, res) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    try {
        const notifications = await Notification.find({ user: req.userId })
            .populate("sender", "name picture") // Ensure this runs
            .populate("post", "selectedFile") 
            .sort({ createdAt: -1 }); // Newest first
        
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markNotificationsRead = async (req, res) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    try {
        await Notification.updateMany(
            { user: req.userId, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: "Marked all as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- DELETE ACCOUNT ---
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};