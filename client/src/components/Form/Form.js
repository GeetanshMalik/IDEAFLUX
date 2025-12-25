import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Chip } from '@mui/material';
import FileBase from 'react-file-base64';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill'; // The Rich Text Editor
import 'react-quill/dist/quill.snow.css'; // Editor Styles

import { createPost, updatePost } from '../../actions/posts';
import { useLanguage } from '../../context/LanguageProvider';
import './styles.css'; // We will put the Dark Mode overrides here

const Form = ({ currentId, setCurrentId }) => {
  const { t } = useLanguage();
  const [postData, setPostData] = useState({ title: '', message: '', tags: [], selectedFile: '' });
  const [tagInput, setTagInput] = useState('');
  
  const post = useSelector((state) => (currentId ? state.posts.posts.find((message) => message._id === currentId) : null));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('profile'));

  useEffect(() => {
    if (post) setPostData(post);
  }, [post]);

  const clear = () => {
    setCurrentId(null);
    setPostData({ title: '', message: '', tags: [], selectedFile: '' });
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.result?.name) {
        return alert(t('pleaseSignInToCreate'));
    }

    // Validation
    if (!postData.title.trim()) {
        return alert(t('titleRequired'));
    }

    // Check if message content is empty (strip HTML tags)
    const strippedMessage = postData.message.replace(/<[^>]*>/g, '').trim();
    if (!strippedMessage) {
        return alert(t('contentRequired'));
    }

    if (strippedMessage.length < 10) {
        return alert(t('contentTooShort'));
    }

    try {
      if (currentId) {
        dispatch(updatePost(currentId, { ...postData, name: user?.result?.name }));
        alert(t('postUpdatedSuccessfully'));
      } else {
        // Create post and navigate immediately
        dispatch(createPost({ ...postData, name: user?.result?.name }));
        
        // Clear form and navigate immediately
        clear();
        navigate('/posts');
        
        // Dispatch custom event to refresh home page
        window.dispatchEvent(new CustomEvent('post-created'));
        
        console.log('✅ Post published successfully');
      }
    } catch (error) {
      console.error('Post submission error:', error);
      alert('Failed to publish post. Please try again.');
    }
  };

  // --- TAG HANDLING ---
  const handleAddTag = () => {
      if (tagInput.trim() !== '') {
          setPostData({ ...postData, tags: [...postData.tags, tagInput.trim()] });
          setTagInput('');
      }
  };

  const handleDeleteTag = (tagToDelete) => {
      setPostData({ ...postData, tags: postData.tags.filter((tag) => tag !== tagToDelete) });
  };

  const handleTagKeyPress = (e) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          handleAddTag();
      }
  };

  // --- QUILL EDITOR MODULES (The Toolbar Configuration) ---
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'font': [] }], // Font Family
      [{ 'size': ['small', false, 'large', 'huge'] }], // Font Size
      ['bold', 'italic', 'underline', 'strike'], // Formatting
      [{ 'color': [] }, { 'background': [] }], // Text Color & Highlight
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Lists
      [{ 'align': [] }], // Alignment
      ['link', 'image'], // Media
    ],
  };

  if (!user?.result?.name) {
    return (
      <Typography variant="h6" align="center" color="white">
        {t('pleaseSignInToCreateBlogs')}
      </Typography>
    );
  }

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
        
        {/* Title Input */}
        <Typography variant="body2" sx={{ mb: 1, color: '#e2e8f0', fontWeight: 'bold' }}>{t('title')}</Typography>
        <TextField 
            name="title" 
            variant="outlined" 
            placeholder={t('enterEngagingTitle')} 
            fullWidth 
            value={postData.title} 
            onChange={(e) => setPostData({ ...postData, title: e.target.value })} 
            sx={{ 
                mb: 3, 
                bgcolor: '#1e293b', 
                borderRadius: '8px',
                input: { color: '#94a3b8' }
            }}
        />

        {/* RICH TEXT EDITOR (Replaces standard TextField) */}
        <Typography variant="body2" sx={{ mb: 1, color: '#e2e8f0', fontWeight: 'bold' }}>{t('story')}</Typography>
        <Box sx={{ mb: 3 }}>
            <ReactQuill 
                theme="snow"
                value={postData.message}
                onChange={(content) => setPostData({ ...postData, message: content })}
                modules={modules}
                placeholder={t('writeYourMasterpiece')}
                className="custom-quill"
            />
        </Box>

        {/* Tags Section */}
        <Typography variant="body2" sx={{ mb: 1, color: '#e2e8f0', fontWeight: 'bold' }}>{t('tags')}</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField 
                name="tags" 
                variant="outlined" 
                placeholder={t('addTags')} 
                fullWidth 
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyPress}
                sx={{ 
                    bgcolor: '#1e293b', 
                    borderRadius: '8px',
                    input: { color: '#94a3b8' }
                }}
            />
            <Button 
                variant="contained" 
                onClick={handleAddTag}
                sx={{ 
                    bgcolor: '#14b8a6', 
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#0d9488' }
                }}
            >
                {t('add')}
            </Button>
        </Box>
        
        {/* Render Added Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {postData.tags.map((tag, index) => (
                <Chip 
                    key={index} 
                    label={`#${tag}`} 
                    onDelete={() => handleDeleteTag(tag)}
                    sx={{ 
                        bgcolor: 'rgba(20, 184, 166, 0.2)', 
                        color: '#14b8a6', 
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        '& .MuiChip-deleteIcon': {
                            color: '#14b8a6',
                            '&:hover': { color: 'white' }
                        }
                    }} 
                />
            ))}
        </Box>
        
        {/* File Upload */}
        <div style={{ marginBottom: '20px', color: '#94a3b8' }}>
            <FileBase 
                type="file" 
                multiple={false} 
                onDone={({ base64 }) => setPostData({ ...postData, selectedFile: base64 })} 
            />
        </div>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
                variant="contained" 
                size="large" 
                type="submit" 
                fullWidth
                sx={{ 
                    bgcolor: '#14b8a6', 
                    color: 'white',
                    py: 1.5, 
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#0d9488' } 
                }}
            >
                {t('publishPost')}
            </Button>
            <Button 
                variant="contained" 
                size="large" 
                onClick={clear} 
                sx={{ 
                    bgcolor: '#334155', 
                    color: '#e2e8f0',
                    py: 1.5, 
                    px: 4,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#475569' } 
                }}
            >
                {t('cancel')}
            </Button>
        </Box>
    </form>
  );
};

export default Form;