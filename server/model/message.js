import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true }, // Text content
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    
    // New Fields for Media
    media: { type: String, default: "" },      // Base64 string
    mediaType: { type: String, default: "" },  // e.g., 'image/png', 'application/pdf'
    fileName: { type: String, default: "" },   // e.g., 'homework.docx'

    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);