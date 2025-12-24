import React, { useState, useEffect } from 'react';
import { Card, CardActions, CardContent, CardMedia, Button, Typography, ButtonBase, Box, Avatar, Chip, Tooltip } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpAltOutlined from '@mui/icons-material/ThumbUpAltOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';

import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { likePost, deletePost, sharePost } from '../../../actions/posts';
import { useLanguage } from '../../../context/LanguageProvider';

const Post = ({ post, setCurrentId }) => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post?.likes || []);
  const [shares, setShares] = useState(post?.shares || 0);

  const user = JSON.parse(localStorage.getItem('profile'));
  const userId = user?.result?.googleId || user?.result?._id;

  // Sync local state with prop changes (when Redux updates)
  useEffect(() => {
    setLikes(post?.likes || []);
    setShares(post?.shares || 0);
  }, [post?.likes, post?.shares]);

  const hasLikedPost = likes.find((like) => like === userId);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user?.result) {
      navigate('/auth');
      return;
    }
    
    // Prevent multiple clicks while processing
    if (e.target.disabled) return;
    e.target.disabled = true;
    
    try {
      // Don't update local state optimistically - wait for server response
      const response = await dispatch(likePost(post._id));
      
      // The Redux store will be updated automatically, but we need to sync local state
      // This will be handled by useEffect when post prop changes
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      // Re-enable button after a short delay
      setTimeout(() => {
        e.target.disabled = false;
      }, 500);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (!user?.result) {
      navigate('/auth');
      return;
    }

    try {
      // Update share count on server first
      dispatch(sharePost(post._id));
      setShares(prev => prev + 1);

      // Then try to share natively or copy to clipboard
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.message.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
          url: `${window.location.origin}/posts/${post._id}`
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`);
        alert(t('linkCopiedToClipboard'));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.log('Share failed:', error);
      }
    }
  };



  const Likes = () => {
    const currentlyLiked = likes.includes(userId);
    
    if (likes.length > 0) {
      return currentlyLiked
        ? <><ThumbUpAltIcon fontSize="small" />&nbsp;{likes.length > 2 ? t('youAndOthers', { count: likes.length - 1 }) : `${likes.length} ${t(likes.length > 1 ? 'likes' : 'like')}`}</>
        : <><ThumbUpAltOutlined fontSize="small" />&nbsp;{likes.length} {t(likes.length === 1 ? 'like' : 'likes')}</>;
    }
    return <><ThumbUpAltOutlined fontSize="small" />&nbsp;{t('like')}</>;
  };

  const openPost = () => {
    if (!user?.result) {
      navigate('/auth');
      return;
    }
    navigate(`/posts/${post._id}`);
  };
  
  const openProfile = (e) => {
    e.stopPropagation();
    if (!user?.result) {
      navigate('/auth');
      return;
    }
    navigate(`/profile/${post.creator._id || post.creator}`);
  };

  // Strip HTML tags for preview
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, '').trim();
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    const stripped = stripHtml(text);
    return stripped.length > maxLength ? stripped.substring(0, maxLength) + "..." : stripped;
  };

  return (
    <Card 
      sx={{ 
        height: '520px', // Fixed height for all cards
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(20, 184, 166, 0.15)',
          borderColor: '#14b8a6'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              src={post.creator?.picture} 
              sx={{ width: 40, height: 40, bgcolor: '#14b8a6', cursor: 'pointer' }}
              onClick={openProfile}
            >
              {(post.creator?.name || post.name || 'U').charAt(0)}
            </Avatar>
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { color: '#14b8a6' }
                }}
                onClick={openProfile}
              >
                {post.creator?.name || post.name || t('unknownUser')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {moment(post.createdAt).fromNow()}
              </Typography>
            </Box>
          </Box>
          
          {(user?.result?.googleId === post?.creator?._id || user?.result?._id === post?.creator?._id || 
            user?.result?.googleId === post?.creator || user?.result?._id === post?.creator) && (
            <Button 
              size="small" 
              sx={{ color: '#94a3b8', minWidth: 'auto', p: 0.5 }}
              onClick={(e) => { 
                e.stopPropagation(); 
                setCurrentId(post._id); 
                navigate('/create'); 
              }}
            >
              <MoreHorizIcon />
            </Button>
          )}
        </Box>
      </Box>

      {/* Image */}
      <Box 
        sx={{ 
          height: 180, // Fixed height for image section
          bgcolor: '#0f172a',
          cursor: 'pointer',
          overflow: 'hidden',
          flexShrink: 0 // Prevent shrinking
        }}
        onClick={openPost}
      >
        {post.selectedFile ? (
          <CardMedia
            component="img"
            height="180"
            image={post.selectedFile}
            alt={post.title}
            sx={{ 
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' }
            }}
          />
        ) : (
          <Box 
            sx={{ 
              height: '180px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: '#0f172a',
              border: '2px dashed #334155'
            }}
          >
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {t('noImage')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 2, pb: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white', 
            fontWeight: 600, 
            mb: 1,
            cursor: 'pointer',
            height: '2.5em', // Fixed height for title
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            '&:hover': { color: '#14b8a6' }
          }}
          onClick={openPost}
        >
          {post.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#94a3b8', 
            mb: 2,
            lineHeight: 1.4,
            height: '4.2em', // Fixed height for exactly 3 lines
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {truncateText(post.message, 120)}
        </Typography>

        {/* Tags */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 0.5, 
          mb: 1,
          height: '32px', // Fixed height for tags section
          overflow: 'hidden'
        }}>
          {post.tags && post.tags.length > 0 ? (
            <>
              {post.tags.slice(0, 2).map((tag, index) => (
                <Chip
                  key={index}
                  label={`#${tag}`}
                  size="small"
                  sx={{
                    bgcolor: '#334155',
                    color: '#14b8a6',
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
              ))}
              {post.tags.length > 2 && (
                <Chip
                  label={`+${post.tags.length - 2}`}
                  size="small"
                  sx={{
                    bgcolor: '#334155',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    height: 24
                  }}
                />
              )}
            </>
          ) : (
            <Box sx={{ height: '24px' }} /> // Placeholder to maintain height
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Button 
            size="small" 
            onClick={handleLike}
            sx={{ 
              color: likes.includes(userId) ? '#14b8a6' : '#94a3b8',
              bgcolor: likes.includes(userId) ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
              border: likes.includes(userId) ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid transparent',
              borderRadius: 2,
              '&:hover': { 
                color: '#14b8a6', 
                bgcolor: 'rgba(20, 184, 166, 0.15)',
                border: '1px solid rgba(20, 184, 166, 0.5)',
                transform: 'scale(1.05)'
              },
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              transition: 'all 0.2s ease',
              '&:disabled': {
                color: '#64748b',
                transform: 'none'
              }
            }}
          >
            <Likes />
          </Button>
          
          <Button 
            size="small" 
            onClick={openPost}
            sx={{ 
              color: '#94a3b8',
              borderRadius: 2,
              '&:hover': { 
                color: '#14b8a6', 
                bgcolor: 'rgba(20, 184, 166, 0.1)',
                transform: 'scale(1.05)'
              },
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            <CommentIcon fontSize="small" />
            &nbsp;{post.comments?.length || 0}
          </Button>

          <Button 
            size="small" 
            onClick={handleShare}
            sx={{ 
              color: '#94a3b8',
              borderRadius: 2,
              '&:hover': { 
                color: '#6366f1', 
                bgcolor: 'rgba(99, 102, 241, 0.1)',
                transform: 'scale(1.05)'
              },
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            <ShareIcon fontSize="small" />
            &nbsp;{shares}
          </Button>


        </Box>

        {(user?.result?.googleId === post?.creator?._id || user?.result?._id === post?.creator?._id || 
          user?.result?.googleId === post?.creator || user?.result?._id === post?.creator) && (
          <Tooltip title={t('deletePost')} arrow>
            <Button 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(t('confirmDeletePost'))) {
                  dispatch(deletePost(post._id));
                }
              }}
              sx={{ 
                color: '#ef4444',
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                border: '1px solid #ef4444',
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#ef4444',
                  color: 'white',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 0.5 }} />
              {t('delete')}
            </Button>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default Post;