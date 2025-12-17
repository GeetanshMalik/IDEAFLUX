import React, { useEffect } from 'react';
import { Paper, Typography, CircularProgress, Divider, Box } from '@mui/material';
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
      <div style={{ display: 'flex', width: '100%', flexDirection: 'column-reverse' }}> {/* Mobile friendly reverse */}
        
        {/* TEXT CONTENT */}
        <div style={{ borderRadius: '20px', margin: '10px', flex: 1 }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 'bold' }}>{post.title}</Typography>
          
          <Typography gutterBottom variant="h6" color="#94a3b8" component="h2">
             {post.tags && Array.isArray(post.tags) && post.tags.length > 0 
               ? post.tags.map((tag) => `#${tag} `).join('') 
               : 'No tags'}
          </Typography>
          
          <Typography variant="body1" component="p" gutterBottom sx={{ fontStyle: 'italic', color: '#cbd5e1' }}>
             {post.message && post.message.length > 300 ? 'Scroll down for full story...' : ''}
          </Typography>

          {/* 🛑 FIX: RENDER HTML CONTENT (Removes the <p> tags visually) */}
          <Box 
            component="div" 
            sx={{ 
                marginTop: '20px', 
                fontSize: '1.1rem', 
                lineHeight: '1.8',
                color: '#e2e8f0',
                '& img': { maxWidth: '100%', borderRadius: '10px' }, // Style images inside content
                '& a': { color: '#14b8a6', textDecoration: 'underline' } // Style links
            }}
            dangerouslySetInnerHTML={{ __html: post.message || '' }} 
          />
          
          <Divider style={{ margin: '20px 0', backgroundColor: '#334155' }} />
          
          <Typography variant="h6">Created by: {post.name || post.creator?.name || 'Unknown'}</Typography>
          <Typography variant="body1">{moment(post.createdAt).fromNow()}</Typography>
          
          <Divider style={{ margin: '20px 0', backgroundColor: '#334155' }} />
          
          {/* COMMENT SECTION */}
          <CommentSection post={post} />
          
          <Divider style={{ margin: '20px 0', backgroundColor: '#334155' }} />
        </div>

        {/* IMAGE SECTION */}
        <div style={{ marginLeft: '20px', flex: 1 }}>
          <img 
            style={{ borderRadius: '20px', objectFit: 'cover', width: '100%', maxHeight: '500px' }} 
            src={post.selectedFile || 'https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png'} 
            alt={post.title} 
          />
        </div>
      </div>

      {/* RECOMMENDED POSTS */}
      {recommendedPosts.length > 0 && (
        <div style={{ borderRadius: '20px', margin: '10px', flex: 1 }}>
          <Typography gutterBottom variant="h5" sx={{ fontWeight: 'bold' }}>You might also like:</Typography>
          <Divider style={{ margin: '10px 0', backgroundColor: '#334155' }} />
          
          <div style={{ display: 'flex', overflowX: 'auto', gap: '20px', paddingBottom: '10px' }}>
            {recommendedPosts.map(({ title, name, message, likes, selectedFile, _id }) => (
              <div 
                style={{ margin: '10px', cursor: 'pointer', minWidth: '200px', maxWidth: '200px' }} 
                onClick={() => openPost(_id)} 
                key={_id}
              >
                <img 
                  src={selectedFile || 'https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png'} 
                  width="200px" 
                  height="150px" 
                  style={{ borderRadius: '10px', objectFit: 'cover' }} 
                  alt="post" 
                />
                <Typography gutterBottom variant="h6" sx={{ mt: 1, fontSize: '1rem', fontWeight: 'bold' }}>
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