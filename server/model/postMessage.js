import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  title: String,
  message: String,
  name: String,
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  tags: [String],
  selectedFile: String, // Base64 string or URL for the image
  
  // Likes: Array of User IDs
  likes: {
    type: [String],
    default: [],
  },
  
  // Enhanced Comments with user info and likes
  comments: [{
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    text: { type: String, required: true },
    author: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      picture: String
    },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  
  // New fields for enhanced features
  shares: {
    type: Number,
    default: 0
  },
  
  isPopular: {
    type: Boolean,
    default: false
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const PostMessage = mongoose.model("PostMessage", postSchema);

export default PostMessage;