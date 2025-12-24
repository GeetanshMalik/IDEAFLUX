import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String },
  googleId: { type: String },
  picture: { type: String },
  
  // New Profile Fields
  username: { 
    type: String, 
    unique: true, 
    sparse: true, // Allows null values while maintaining uniqueness for non-null values
    lowercase: true, // Automatically convert to lowercase
    trim: true, // Remove whitespace
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/ // Only letters, numbers, and underscores
  },
  bio: { type: String, default: "", maxlength: 500 },
  dob: { type: String, default: "" }, // Format: YYYY-MM-DD (legacy field)
  dateOfBirth: { type: Date }, // New field for date of birth
  backgroundImage: { type: String, default: "" }, // Profile background image
  
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // Additional fields for better user experience
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);