import React, { useState, useRef, useEffect } from 'react';
import { Typography, TextField, Button, Box, Avatar, Paper, IconButton } from '@mui/material';
import { ThumbUp, Delete } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { commentPost } from '../../actions/posts';
import * as api from '../../api';
import moment from 'moment';

const CommentSection = ({ post }) => {
  const user = JSON.parse(localStorage.getItem('profile'));
  const [comments, setComments] = useState(post?.comments || []);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const commentsRef = useRef();

  // Update comments when post changes
  useEffect(() => {
    setComments(post?.comments || []);
  }, [post?.comments]);

  const handleClick = async () => {
    if (!comment.trim() || loading) return;
    
    setLoading(true);
    try {
      const newComments = await dispatch(commentPost(comment.trim(), post._id));
      
      if (newComments) {
        setComments(newComments);
      }
      setComment('');
      
      // Auto-scroll to bottom of comments
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Comments Display */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0', fontWeight: 'bold' }}>
            Comments ({comments.length})
          </Typography>
          
          <Box sx={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#334155',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#14b8a6',
              borderRadius: '3px',
            },
          }}>
            {comments.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                No comments yet. Be the first to comment!
              </Typography>
            ) : (
              comments.map((c, i) => {
                // Handle both old string format and new object format
                const isObjectComment = typeof c === 'object' && c.author;
                const commentText = isObjectComment ? c.text : (typeof c === 'string' ? (c.split(': ')[1] || c) : 'Invalid comment');
                const authorName = isObjectComment ? c.author.name : (typeof c === 'string' ? (c.split(': ')[0] || 'Unknown') : 'Unknown');
                const authorPicture = isObjectComment ? c.author.picture : null;
                const createdAt = isObjectComment ? c.createdAt : null;
                const commentLikes = isObjectComment ? (c.likes || []) : [];
                
                return (
                  <Paper key={i} sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: '#334155', 
                    border: '1px solid #475569',
                    borderRadius: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Avatar 
                        src={authorPicture} 
                        sx={{ width: 32, height: 32, bgcolor: '#14b8a6' }}
                      >
                        {authorName.charAt(0).toUpperCase()}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ color: '#e2e8f0', fontWeight: 600 }}>
                            {authorName}
                          </Typography>
                          {createdAt && (
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {moment(createdAt).fromNow()}
                            </Typography>
                          )}
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}>
                          {commentText}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!user?.result) return;
                              
                              try {
                                console.log('🔄 Liking comment:', c._id);
                                const response = await api.likeComment(post._id, c._id);
                                console.log('✅ Comment like response:', response.data);
                                
                                // Update local comments state
                                setComments(response.data.comments);
                              } catch (error) {
                                console.error('❌ Error liking comment:', error);
                                alert('Error liking comment. Please try again.');
                              }
                            }}
                            sx={{ 
                              color: commentLikes.includes(user?.result?._id) ? '#14b8a6' : '#94a3b8',
                              '&:hover': { color: '#14b8a6' }
                            }}
                          >
                            <ThumbUp fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            {commentLikes.length}
                          </Typography>
                          
                          {/* Delete button for comment author */}
                          {isObjectComment && c.author._id === (user?.result?._id || user?.result?.googleId) && (
                            <IconButton 
                              size="small" 
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!user?.result) return;
                                
                                if (window.confirm('Delete this comment?')) {
                                  try {
                                    console.log('🗑️ Deleting comment:', c._id);
                                    const response = await api.deleteComment(post._id, c._id);
                                    console.log('✅ Comment delete response:', response.data);
                                    
                                    // Update local comments state
                                    setComments(response.data.comments);
                                  } catch (error) {
                                    console.error('❌ Error deleting comment:', error.response || error);
                                    alert(`Error deleting comment: ${error.response?.data?.message || error.message}`);
                                  }
                                }
                              }}
                              sx={{ 
                                color: '#ef4444',
                                '&:hover': { color: '#ff6b6b' }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                );
              })
            )}
            <div ref={commentsRef} />
          </Box>
        </Box>

        {/* Comment Input */}
        {user?.result?.name && (
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '300px' } }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0', fontWeight: 'bold' }}>
              Write a Comment
            </Typography>
            
            <TextField
              fullWidth
              multiline
              minRows={4}
              maxRows={8}
              variant="outlined"
              placeholder="Share your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#1e293b',
                  color: '#e2e8f0',
                  '& fieldset': {
                    borderColor: '#475569',
                  },
                  '&:hover fieldset': {
                    borderColor: '#14b8a6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#14b8a6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#94a3b8',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#64748b',
                  opacity: 1,
                },
              }}
            />
            
            <Button 
              fullWidth
              variant="contained"
              disabled={!comment.trim() || loading}
              onClick={handleClick}
              sx={{
                bgcolor: '#14b8a6',
                color: 'white',
                py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#0d9488',
                },
                '&:disabled': {
                  bgcolor: '#475569',
                  color: '#94a3b8',
                },
              }}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CommentSection;