import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String },
  googleId: { type: String },
  picture: { type: String },
  
  // New Profile Fields
  bio: { type: String, default: "" },
  dob: { type: String, default: "" }, // Format: YYYY-MM-DD
  
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
});

export default mongoose.model("User", userSchema);