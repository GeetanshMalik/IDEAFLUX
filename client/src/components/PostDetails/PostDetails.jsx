import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress, Divider, Box, Modal, IconButton } from '@mui/material';
import { Close as CloseIcon, ZoomIn as ZoomInIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';

import { getPost, getPostsBySearch } from '../../actions/posts';
import CommentSection from './CommentSection';

const PostDetails = () => {
  const { post, posts, isLoading } = useSelector((state) => state.posts);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State for image modal
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(getPost(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (post && post.tags && post.tags.length > 0) {
      dispatch(getPostsBySearch({ search: 'none', tags: post.tags.join(',') }));
    }
  }, [post, dispatch]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && imageModalOpen) {
        handleCloseModal();
      }
    };

    if (imageModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageModalOpen]);

  // Handle image click
  const handleImageClick = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setImageModalOpen(true);
  };

  const handleCloseModal = () => {
    setImageModalOpen(false);
    setModalImageSrc('');
  };

  // Show loading while fetching
  if (isLoading) {
    return (
      <Paper elevation={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, borderRadius: '15px', bgcolor: '#1e293b', height: '300px' }}>
        <CircularProgress size="7em" sx={{ color: '#14b8a6' }} />
      </Paper>
    );
  }

  // Show error if no post found
  if (!post) {
    return (
      <Paper elevation={6} sx={{ p: 4, borderRadius: '15px', bgcolor: '#1e293b', color: 'white', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Post not found</Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8', mb: 3 }}>
          The post you're looking for doesn't exist or has been removed.
        </Typography>
        <button 
          onClick={() => navigate('/posts')}
          style={{
            backgroundColor: '#14b8a6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Back to Posts
        </button>
      </Paper>
    );
  }

  // 🛑 FIX: Filter out the current post from recommended posts
  const recommendedPosts = posts && Array.isArray(posts) ? posts.filter(({ _id }) => _id !== post._id) : [];

  const openPost = (_id) => navigate(`/posts/${_id}`);

  return (
    <Paper style={{ padding: '20px', borderRadius: '15px', marginTop: '20px', backgroundColor: '#1e293b', color: 'white' }} elevation={6}>
      <div style={{ display: 'flex', width: '100%', flexDirection: window.innerWidth < 768 ? 'column' : 'column-reverse' }}> {/* Always column on mobile */}
        
        {/* TEXT CONTENT */}
        <div style={{ borderRadius: '20px', margin: '10px', flex: 1 }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 'bold', fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>{post.title}</Typography>
          
          <Typography gutterBottom variant="h6" color="#94a3b8" component="h2" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
             {post.tags && Array.isArray(post.tags) && post.tags.length > 0 
               ? post.tags.map((tag) => `#${tag} `).join('') 
               : 'No tags'}
          </Typography>
          
          <Typography variant="body1" component="p" gutterBottom sx={{ fontStyle: 'italic', color: '#cbd5e1', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
             {post.message && post.message.length > 300 ? 'Scroll down for full story...' : ''}
          </Typography>

          {/* 🛑 FIX: RENDER HTML CONTENT (Removes the <p> tags visually) */}
          <Box 
            component="div" 
            sx={{ 
                marginTop: '20px', 
                fontSize: { xs: '1rem', sm: '1.1rem' }, 
                lineHeight: '1.8',
                color: '#e2e8f0',
                '& img': { maxWidth: '100%', borderRadius: '10px' }, // Style images inside content
                '& a': { color: '#14b8a6', textDecoration: 'underline' } // Style links
            }}
            dangerouslySetInnerHTML={{ __html: post.message || '' }} 
          />
          
          <Divider style={{ margin: '20px 0', backgroundColor: '#334155' }} />
          
          <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Created by: {post.name || post.creator?.name || 'Unknown'}</Typography>
          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>{moment(post.createdAt).fromNow()}</Typography>
          
          <Divider style={{ margin: '20px 0', backgroundColor: '#334155' }} />
          
          {/* COMMENT SECTION */}
          <CommentSection post={post} />
          
          <Divider style={{ margin: '20px 0', backgroundColor: '#334155' }} />
        </div>

        {/* IMAGE SECTION */}
        <div style={{ marginLeft: window.innerWidth < 768 ? '0' : '20px', flex: 1, marginBottom: window.innerWidth < 768 ? '20px' : '0' }}>
          <Box 
            sx={{ 
              position: 'relative',
              cursor: 'pointer',
              '&:hover .zoom-icon': {
                opacity: 1
              },
              '&:hover .image-hint': {
                opacity: 1
              }
            }}
            onClick={() => handleImageClick(post.selectedFile || 'https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png')}
          >
            <img 
              style={{ 
                borderRadius: '20px', 
                objectFit: 'cover', 
                width: '100%', 
                maxHeight: window.innerWidth < 768 ? '300px' : '500px', // Smaller on mobile
                transition: 'transform 0.3s ease'
              }} 
              src={post.selectedFile || 'https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png'} 
              alt={post.title} 
            />
            {/* Zoom Icon Overlay */}
            <Box
              className="zoom-icon"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '50%',
                padding: { xs: '8px', sm: '12px' },
                opacity: 0,
                transition: 'opacity 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ZoomInIcon sx={{ color: 'white', fontSize: { xs: '1.5rem', sm: '2rem' } }} />
            </Box>
            {/* Hint Text */}
            <Box
              className="image-hint"
              sx={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: { xs: '3px 8px', sm: '4px 12px' },
                borderRadius: '20px',
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                opacity: 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              Click to view full size
            </Box>
          </Box>
        </div>
      </div>

      {/* Image Modal */}
      <Modal
        open={imageModalOpen}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 1, sm: 2 }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: { xs: '98vw', sm: '95vw' },
            maxHeight: { xs: '98vh', sm: '95vh' },
            outline: 'none',
            width: '100%',
            height: 'auto'
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: { xs: -40, sm: -50 },
              right: { xs: 0, sm: -10 },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              zIndex: 1,
              width: { xs: 36, sm: 48 },
              height: { xs: 36, sm: 48 },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)'
              }
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </IconButton>
          
          {/* Full Size Image */}
          <img
            src={modalImageSrc}
            alt={post?.title || 'Full size image'}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
            }}
          />
        </Box>
      </Modal>

      {/* RECOMMENDED POSTS */}
      {recommendedPosts.length > 0 && (
        <div style={{ borderRadius: '20px', margin: '10px', flex: 1 }}>
          <Typography gutterBottom variant="h5" sx={{ fontWeight: 'bold' }}>You might also like:</Typography>
          <Divider style={{ margin: '10px 0', backgroundColor: '#334155' }} />
          
          <div style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '10px' }}>
            {recommendedPosts.map(({ title, name, message, likes, selectedFile, _id }) => (
              <div 
                style={{ margin: '10px', cursor: 'pointer', minWidth: '200px', maxWidth: '200px' }} 
                key={_id}
              >
                <Box
                  sx={{
                    position: 'relative',
                    '&:hover .zoom-overlay': {
                      opacity: 1
                    }
                  }}
                >
                  <img 
                    src={selectedFile || 'https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png'} 
                    width="200px" 
                    height="150px" 
                    style={{ borderRadius: '10px', objectFit: 'cover', cursor: 'pointer' }} 
                    alt="post" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(selectedFile || 'https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png');
                    }}
                  />
                  {/* Zoom overlay for recommended images */}
                  <Box
                    className="zoom-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    <ZoomInIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                  </Box>
                </Box>
                <Typography 
                  gutterBottom 
                  variant="h6" 
                  sx={{ mt: 1, fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => openPost(_id)}
                >
                  {title || 'Untitled'}
                </Typography>
                <Typography gutterBottom variant="subtitle2" sx={{ color: '#94a3b8' }}>
                  {name || 'Unknown'}
                </Typography>
                <Typography gutterBottom variant="subtitle2" sx={{ color: '#cbd5e1' }}>
                  {message ? message.replace(/<[^>]+>/g, '').substring(0, 50) + '...' : 'No content'}
                </Typography>
                <Typography gutterBottom variant="subtitle1" sx={{ color: '#14b8a6' }}>
                  Likes: {likes ? likes.length : 0}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </Paper>
  );
};

export default PostDetails;