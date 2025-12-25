import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../model/user.js";
import Notification from "../model/notification.js";
import EmailVerification from "../model/emailVerification.js";

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

// Step 1: Initial signup - store user data and OTP
export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, otp } = req.body;
  
  try {
    console.log('📝 Signup attempt for:', email);
    
    // Input validation
    if (!email || !password || !confirmPassword || !firstName || !lastName || !otp) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: "All fields including OTP are required." });
    }

    if (!validateEmail(email)) {
      console.log('❌ Invalid email format');
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (!validatePassword(password)) {
      console.log('❌ Invalid password');
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      return res.status(400).json({ message: "Passwords don't match." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: "User already exists with this email." });
    }

    console.log('✅ Validation passed, storing verification record');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    
    // Store verification data with frontend-provided OTP
    const verificationRecord = await EmailVerification.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: fullName,
      otp: otp.toString(),
      attempts: 0
    });
    console.log('✅ Verification record created with ID:', verificationRecord._id);

    // Respond immediately - email was sent by frontend
    res.status(200).json({ 
      requiresVerification: true,
      email: email.toLowerCase(),
      message: "Please check your email for the verification code." 
    });

  } catch (error) {
    console.error("❌ Signup error:", error);
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

// Resend OTP - frontend will handle email sending
export const resendOTP = async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and new OTP are required." });
    }

    const verification = await EmailVerification.findOne({ email: email.toLowerCase() });
    
    if (!verification) {
      return res.status(400).json({ message: "No pending verification found. Please signup again." });
    }

    // Update with new OTP provided by frontend
    verification.otp = otp.toString();
    verification.attempts = 0;
    verification.createdAt = new Date();
    await verification.save();

    // Respond immediately - frontend handles email sending
    res.status(200).json({ 
      message: "New verification code has been sent to your email." 
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

export const getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id)
            .populate('followers', 'name picture username')
            .populate('following', 'name picture username')
            .select('-password'); // Exclude password from response
        
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { name, username, bio, dateOfBirth, picture, backgroundImage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: `No user with id: ${id}` });
    }

    // Check if user is updating their own profile
    if (req.userId !== id) {
        return res.status(403).json({ message: "You can only update your own profile" });
    }

    try {
        // If username is being updated, check if it's available
        if (username) {
            const existingUser = await User.findOne({ 
                username: username.toLowerCase(),
                _id: { $ne: id } // Exclude current user
            });
            
            if (existingUser) {
                return res.status(400).json({ message: "Username is already taken" });
            }
        }

        const updateData = {
            name,
            bio,
            dateOfBirth
        };

        // Only add username if it's provided
        if (username) {
            updateData.username = username.toLowerCase();
        }

        // Add picture if provided
        if (picture !== undefined) {
            updateData.picture = picture;
        }

        // Add background image if provided
        if (backgroundImage !== undefined) {
            updateData.backgroundImage = backgroundImage;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const checkUsernameAvailability = async (req, res) => {
    const { username } = req.params;
    
    try {
        if (!username || username.length < 3) {
            return res.status(400).json({ 
                available: false, 
                message: "Username must be at least 3 characters long" 
            });
        }

        // Check if username contains only allowed characters
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ 
                available: false, 
                message: "Username can only contain letters, numbers, and underscores" 
            });
        }

        const existingUser = await User.findOne({ username: username.toLowerCase() });
        
        res.status(200).json({ 
            available: !existingUser,
            message: existingUser ? "Username is already taken" : "Username is available"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const searchUsers = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const searchRegex = new RegExp(searchQuery, "i");
        
        // Search by name or username
        const users = await User.find({
            $or: [
                { name: searchRegex },
                { username: searchRegex }
            ]
        }).select('name username picture bio'); // Only return necessary fields
        
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

export const clearNotifications = async (req, res) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });

    try {
        await Notification.deleteMany({ user: req.userId });
        res.status(200).json({ message: "All notifications cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
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