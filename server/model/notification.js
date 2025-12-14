import mongoose from "mongoose";

const notificationSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The receiver
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // The person who did the action
    type: { type: String, required: true }, // e.g., 'like', 'comment', 'follow', 'post'
    message: { type: String },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "PostMessage" }, // Link to the specific blog post (optional)
    read: { type: Boolean, default: false },
  },
  { timestamps: true } // Auto-adds createdAt and updatedAt
);

export default mongoose.model("Notification", notificationSchema);