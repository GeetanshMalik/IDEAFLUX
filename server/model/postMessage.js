import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  title: String,
  message: String,
  name: String,
  creator: String, // Stores the User ID of the author
  tags: [String],
  selectedFile: String, // Base64 string or URL for the image
  
  // Likes: Array of User IDs
  likes: {
    type: [String],
    default: [],
  },
  
  // Comments: Array of strings ("UserName: CommentText")
  comments: { 
    type: [String], 
    default: [] 
  },
  
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const PostMessage = mongoose.model("PostMessage", postSchema);

export default PostMessage;