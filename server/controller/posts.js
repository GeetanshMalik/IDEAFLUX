import mongoose from 'mongoose';
import PostMessage from '../model/postMessage.js';
import User from '../model/user.js';
import { createNotification } from './notifications.js';

// Input validation helpers
const validatePostData = (title, message, tags) => {
  const errors = [];
  
  if (!title || title.trim().length < 3) {
    errors.push("Title must be at least 3 characters long.");
  }
  
  if (!message || message.trim().length < 10) {
    errors.push("Content must be at least 10 characters long.");
  }
  
  if (tags && tags.length > 10) {
    errors.push("Maximum 10 tags allowed.");
  }
  
  return errors;
};

// 1. Get All Posts with Enhanced Features
export const getPosts = async (req, res) => {
    const { page = 1, sort = 'recent', limit = 8 } = req.query;
    
    try {
        const LIMIT = Math.min(parseInt(limit), 20); // Max 20 posts per page
        const startIndex = (Number(page) - 1) * LIMIT;
        
        let query = {};
        let sortOption = { createdAt: -1 }; // Default: recent
        
        if (sort === 'trending') {
            // Trending: Posts sorted by number of likes (highest first)
            const trendingPosts = await PostMessage.aggregate([
                {
                    $addFields: {
                        likesCount: { $size: "$likes" }
                    }
                },
                {
                    $sort: { likesCount: -1, createdAt: -1 }
                },
                {
                    $skip: startIndex
                },
                {
                    $limit: LIMIT
                }
            ]);

            // Populate creator info
            await PostMessage.populate(trendingPosts, { path: 'creator', select: 'name picture' });
            
            const total = await PostMessage.countDocuments({});
            
            return res.status(200).json({ 
                data: trendingPosts, 
                currentPage: Number(page), 
                numberOfPages: Math.ceil(total / LIMIT),
                totalPosts: total
            });
        }

        // For recent and other sorts
        const total = await PostMessage.countDocuments(query);
        const posts = await PostMessage.find(query)
            .populate('creator', 'name picture')
            .sort({ createdAt: -1 })
            .limit(LIMIT)
            .skip(startIndex);

        res.status(200).json({ 
            data: posts, 
            currentPage: Number(page), 
            numberOfPages: Math.ceil(total / LIMIT),
            totalPosts: total
        });
    } catch (error) {
        console.error("Get posts error:", error);
        res.status(500).json({ message: "Failed to fetch posts. Please try again." });
    }
};

// 2. Get Single Post with Related Posts
export const getPost = async (req, res) => { 
    const { id } = req.params;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid post ID." });
        }

        const post = await PostMessage.findById(id)
            .populate('creator', 'name picture bio followers following');
        
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // Get related posts by same creator or similar tags
        const relatedPosts = await PostMessage.find({
            $and: [
                { _id: { $ne: id } },
                {
                    $or: [
                        { creator: post.creator._id },
                        ...(post.tags && post.tags.length > 0 ? [{ tags: { $in: post.tags } }] : [])
                    ]
                }
            ]
        })
        .populate('creator', 'name picture')
        .limit(4)
        .sort({ createdAt: -1 });

        res.status(200).json({ 
            post, 
            relatedPosts 
        });
    } catch (error) {
        console.error("Get post error:", error);
        res.status(500).json({ message: "Failed to fetch post. Please try again." });
    }
};

// 🛑 FIX: Smart Search (Title OR Tags)
export const getPostsBySearch = async (req, res) => {
    const { searchQuery } = req.query;
    try {
        const title = new RegExp(searchQuery, "i"); // Case-insensitive title match

        const posts = await PostMessage.find({ 
            $or: [ 
                { title }, 
                { tags: { $regex: searchQuery, $options: 'i' } } // Matches if tag contains query
            ]
        });

        res.json({ data: posts });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// 4. Create Post with Enhanced Validation
export const createPost = async (req, res) => {
    const { title, message, tags, selectedFile } = req.body;
    
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Authentication required to create posts." });
        }

        // Enhanced validation
        const validationErrors = validatePostData(title, message, tags);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: validationErrors.join(" ") });
        }

        // Additional validation for empty content
        const strippedMessage = message.replace(/<[^>]*>/g, '').trim();
        if (!strippedMessage && !selectedFile) {
            return res.status(400).json({ 
                message: "Post must contain either text content or an image." 
            });
        }

        if (strippedMessage.length < 10 && !selectedFile) {
            return res.status(400).json({ 
                message: "Post content must be at least 10 characters long or include an image." 
            });
        }

        // Check if user exists
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Clean and process tags
        const processedTags = tags ? 
            tags.map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0 && tag.length <= 20)
                .slice(0, 10) : [];

        const newPostMessage = new PostMessage({ 
            title: title.trim(),
            message: message.trim(),
            tags: processedTags,
            selectedFile,
            creator: req.userId, 
            createdAt: new Date().toISOString(),
            likes: [],
            comments: []
        });

        await newPostMessage.save();
        
        // Populate creator info for response
        await newPostMessage.populate('creator', 'name picture');

        // Send notification to followers (if you want)
        // This could be implemented later for better engagement

        res.status(201).json({
            ...newPostMessage.toObject(),
            success: true,
            message: "Post created successfully!"
        });
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ message: "Failed to create post. Please try again." });
    }
};

// 5. Update Post
export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, message, creator, selectedFile, tags } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };
    await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });
    res.json(updatedPost);
};

// 6. Delete Post
export const deletePost = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    await PostMessage.findByIdAndDelete(id);
    res.json({ message: "Post deleted successfully." });
};

// 7. Like Post with Notifications
export const likePost = async (req, res) => {
    const { id } = req.params;
    
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Invalid post ID." });
        }

        const post = await PostMessage.findById(id).populate('creator', 'name');
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const index = post.likes.findIndex((likeId) => likeId === String(req.userId));
        const isLiking = index === -1;

        if (isLiking) {
            post.likes.push(req.userId);
            
            // Send notification to post creator (if not self-like)
            if (post.creator._id.toString() !== req.userId) {
                console.log(`📤 Sending like notification from ${req.userId} to ${post.creator._id}`);
                await createNotification(
                    post.creator._id,
                    req.userId,
                    'like',
                    'liked your post',
                    post._id
                );
            }
        } else {
            post.likes = post.likes.filter((likeId) => likeId !== String(req.userId));
        }

        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })
            .populate('creator', 'name picture');

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ message: "Failed to like post." });
    }
};

// 8. Comment Post with Enhanced Features
export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;
    
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        if (!value || value.trim().length < 1) {
            return res.status(400).json({ message: "Comment cannot be empty." });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Invalid post ID." });
        }

        const post = await PostMessage.findById(id).populate('creator', 'name');
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Create comment object with user info
        const comment = {
            _id: new mongoose.Types.ObjectId(),
            text: value.trim(),
            author: {
                _id: req.userId,
                name: user.name,
                picture: user.picture
            },
            createdAt: new Date(),
            likes: []
        };

        post.comments.push(comment);
        
        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })
            .populate('creator', 'name picture');

        // Send notification to post creator (if not self-comment)
        if (post.creator._id.toString() !== req.userId) {
            console.log(`📤 Sending comment notification from ${req.userId} to ${post.creator._id}`);
            await createNotification(
                post.creator._id,
                req.userId,
                'comment',
                'commented on your post',
                post._id
            );
        }

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Comment post error:', error);
        res.status(500).json({ message: "Failed to add comment." });
    }
};

// 9. Like Comment
export const likeComment = async (req, res) => {
    const { id, commentId } = req.params;
    
    try {
        console.log(`👍 Like comment request - Post: ${id}, Comment: ${commentId}, User: ${req.userId}`);
        
        if (!req.userId) {
            console.log('❌ No user ID in request');
            return res.status(401).json({ message: "Authentication required." });
        }

        const post = await PostMessage.findById(id);
        if (!post) {
            console.log('❌ Post not found');
            return res.status(404).json({ message: "Post not found." });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            console.log('❌ Comment not found in post');
            console.log('Available comment IDs:', post.comments.map(c => c._id.toString()));
            return res.status(404).json({ message: "Comment not found." });
        }

        const index = comment.likes.findIndex(likeId => likeId.toString() === req.userId);
        const isLiking = index === -1;
        
        if (isLiking) {
            comment.likes.push(req.userId);
            console.log(`✅ User liked comment, total likes: ${comment.likes.length}`);
        } else {
            comment.likes.splice(index, 1);
            console.log(`✅ User unliked comment, total likes: ${comment.likes.length}`);
        }

        await post.save();
        
        const updatedPost = await PostMessage.findById(id).populate('creator', 'name picture');
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('❌ Like comment error:', error);
        res.status(500).json({ message: "Failed to like comment." });
    }
};

// 10. Delete Comment
export const deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    
    try {
        console.log(`🗑️ Delete comment request - Post: ${id}, Comment: ${commentId}, User: ${req.userId}`);
        
        if (!req.userId) {
            console.log('❌ No user ID in request');
            return res.status(401).json({ message: "Authentication required." });
        }

        const post = await PostMessage.findById(id);
        if (!post) {
            console.log('❌ Post not found');
            return res.status(404).json({ message: "Post not found." });
        }

        console.log(`📝 Post found with ${post.comments.length} comments`);
        
        const comment = post.comments.id(commentId);
        if (!comment) {
            console.log('❌ Comment not found in post');
            console.log('Available comment IDs:', post.comments.map(c => c._id.toString()));
            return res.status(404).json({ message: "Comment not found." });
        }

        console.log(`💬 Comment found - Author: ${comment.author._id}, Requester: ${req.userId}`);

        // Check if user owns the comment or the post
        if (comment.author._id.toString() !== req.userId && post.creator.toString() !== req.userId) {
            console.log('❌ User not authorized to delete comment');
            return res.status(403).json({ message: "Not authorized to delete this comment." });
        }

        // Use pull to remove the comment from the array
        console.log(`🗑️ Removing comment ${commentId} from post ${id}`);
        post.comments.pull(commentId);
        await post.save();
        console.log(`✅ Comment deleted successfully, remaining comments: ${post.comments.length}`);
        
        const updatedPost = await PostMessage.findById(id).populate('creator', 'name picture');
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('❌ Delete comment error:', error);
        res.status(500).json({ message: "Failed to delete comment." });
    }
};

// 11. Share Post (Increment Share Count)
export const sharePost = async (req, res) => {
    const { id } = req.params;
    
    try {
        if (!req.userId) {
            return res.status(401).json({ message: "Authentication required." });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: "Invalid post ID." });
        }

        const post = await PostMessage.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // Increment share count
        post.shares = (post.shares || 0) + 1;
        await post.save();

        const updatedPost = await PostMessage.findById(id).populate('creator', 'name picture');
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Share post error:', error);
        res.status(500).json({ message: "Failed to share post." });
    }
};