import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../model/user.js";
import Notification from "../model/notification.js";
import EmailVerification from "../model/emailVerification.js";
// import { pushNotification } from "../socket.js"; // Not needed - using global.io approach
import { generateOTP, sendOTPEmail } from "../utils/emailService.js";

// Input validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// --- AUTHENTICATION ---

export const signin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist." });
    }

    // Check if user used Google auth (no password set)
    if (existingUser.password === "GOOGLE_AUTH_NO_PASSWORD") {
      return res.status(400).json({ message: "Please sign in with Google." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id }, 
      process.env.JWT_SECRET || "fallback_secret_key", 
      { expiresIn: "24h" }
    );

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = existingUser.toObject();
    
    res.status(200).json({ 
      result: userWithoutPassword, 
      token,
      message: "Sign in successful!" 
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Step 1: Initial signup - send OTP
export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  
  try {
    // Input validation
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    
    // Generate OTP and store verification data
    const otp = generateOTP();
    
    // Store verification data temporarily
    await EmailVerification.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: fullName,
      otp,
      attempts: 0
    });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, fullName);
    
    if (!emailSent) {
      // Clean up verification record if email fails
      await EmailVerification.deleteOne({ email: email.toLowerCase() });
      return res.status(500).json({ message: "Failed to send verification email. Please check your email configuration and try again." });
    }

    res.status(200).json({ 
      requiresVerification: true,
      email: email.toLowerCase(),
      message: "Verification code sent to your email. Please check your inbox." 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Step 2: Verify OTP and complete signup
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const verification = await EmailVerification.findOne({ 
      email: email.toLowerCase(),
      otp: otp.toString()
    });

    if (!verification) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Check attempts
    if (verification.attempts >= 3) {
      await EmailVerification.deleteOne({ _id: verification._id });
      return res.status(400).json({ message: "Too many failed attempts. Please signup again." });
    }

    // Create user account
    const result = await User.create({ 
      email: verification.email, 
      password: verification.password, 
      name: verification.name,
      bio: "",
      dob: "",
      followers: [],
      following: [],
      notifications: [],
      isEmailVerified: true
    });

    // Delete verification record
    await EmailVerification.deleteOne({ _id: verification._id });

    const token = jwt.sign(
      { email: result.email, id: result._id }, 
      process.env.JWT_SECRET || "fallback_secret_key", 
      { expiresIn: "24h" }
    );

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = result.toObject();

    res.status(201).json({ 
      result: userWithoutPassword, 
      token,
      message: "Account created and verified successfully!" 
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const verification = await EmailVerification.findOne({ email: email.toLowerCase() });
    
    if (!verification) {
      return res.status(400).json({ message: "No pending verification found. Please signup again." });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    verification.otp = newOTP;
    verification.attempts = 0;
    verification.createdAt = new Date();
    await verification.save();

    // Send new OTP
    const emailSent = await sendOTPEmail(email, newOTP, verification.name);
    
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    res.status(200).json({ 
      message: "New verification code sent to your email." 
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const googleSignin = async (req, res) => {
    const { email, name, picture, googleId } = req.body;
    
    try {
        if (!email || !name || !googleId) {
            return res.status(400).json({ message: "Missing required Google authentication data." });
        }

        let user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            // Create new user for Google signin
            user = await User.create({
                email: email.toLowerCase(),
                name: name.trim(),
                picture,
                googleId,
                password: "GOOGLE_AUTH_NO_PASSWORD",
                bio: "",
                dob: "",
                followers: [],
                following: [],
                notifications: []
            });
        } else {
            // Update existing user's Google info if needed
            if (!user.googleId) {
                user.googleId = googleId;
                user.picture = picture || user.picture;
                await user.save();
            }
        }

        const token = jwt.sign(
            { email: user.email, id: user._id }, 
            process.env.JWT_SECRET || "fallback_secret_key", 
            { expiresIn: "24h" }
        );

        // Don't send password in response
        const { password: _, ...userWithoutPassword } = user.toObject();
        
        res.status(200).json({ 
            result: userWithoutPassword, 
            token,
            message: "Google signin successful!" 
        });
    } catch (error) {
        console.error("Google signin error:", error);
        res.status(500).json({ message: "Google signin failed. Please try again." });
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
            // Send real-time notification using global.io (consistent with current implementation)
            if (global.io) {
                global.io.to(targetUser._id.toString()).emit('notification received', notification);
                console.log(`🔔 Follow notification sent to ${targetUser._id}`);
            }
            
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