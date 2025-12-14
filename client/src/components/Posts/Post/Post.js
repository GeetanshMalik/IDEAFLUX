import React, { useState } from 'react';
import { Card, CardActions, CardContent, CardMedia, Button, Typography, ButtonBase, Box } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpAltOutlined from '@mui/icons-material/ThumbUpAltOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { likePost, deletePost } from '../../../actions/posts';
import { styles } from './styles';

const Post = ({ post, setCurrentId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post?.likes);
  const user = JSON.parse(localStorage.getItem('profile'));
  const userId = user?.result?.googleId || user?.result?._id;

  const hasLikedPost = post.likes.find((like) => like === userId);

  const handleLike = async () => {
    dispatch(likePost(post._id));
    if (hasLikedPost) {
      setLikes(post.likes.filter((id) => id !== userId));
    } else {
      setLikes([...post.likes, userId]);
    }
  };

  const Likes = () => {
    if (likes.length > 0) {
      return likes.find((like) => like === userId)
        ? <><ThumbUpAltIcon fontSize="small" />&nbsp;{likes.length > 2 ? `You and ${likes.length - 1} others` : `${likes.length} like${likes.length > 1 ? 's' : ''}`}</>
        : <><ThumbUpAltOutlined fontSize="small" />&nbsp;{likes.length} {likes.length === 1 ? 'Like' : 'Likes'}</>;
    }
    return <><ThumbUpAltOutlined fontSize="small" />&nbsp;Like</>;
  };

  const openPost = () => navigate(`/posts/${post._id}`);
  
  const openProfile = (e) => {
      e.stopPropagation();
      navigate(`/profile/${post.creator}`);
  };

  // 🛑 FIX: Robust regex to strip all HTML tags for the preview card
  const stripHtml = (html) => {
      if (!html) return "";
      return html.replace(/<[^>]+>/g, '');
  };

  return (
    <Card sx={styles.card} raised elevation={6}>
      <ButtonBase component="span" sx={styles.cardAction} onClick={openPost}>
        <CardMedia sx={styles.media} image={post.selectedFile || 'https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png'} title={post.title} />
        
        <div style={styles.overlay}>
          <Box display="flex" alignItems="center" gap={1}>
             <Typography 
                variant="h6" 
                onClick={openProfile} 
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
             >
                 {post.name}
             </Typography>
          </Box>
          <Typography variant="body2">{moment(post.createdAt).fromNow()}</Typography>
        </div>
        
        {(user?.result?.googleId === post?.creator || user?.result?._id === post?.creator) && (
          <div style={styles.overlay2}>
            <Button style={{ color: 'white' }} size="small" onClick={(e) => { e.stopPropagation(); setCurrentId(post._id); navigate('/create'); }}>
              <MoreHorizIcon fontSize="default" />
            </Button>
          </div>
        )}

        <div style={styles.details}>
          <Typography variant="body2" color="textSecondary">{post.tags.map((tag) => `#${tag} `)}</Typography>
        </div>
        <Typography sx={styles.title} gutterBottom variant="h5">{post.title}</Typography>
        
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p" sx={{
              display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3,
          }}>
              {/* Uses the Regex strip function */}
              {stripHtml(post.message)}
          </Typography>
        </CardContent>

      </ButtonBase>
      <CardActions sx={styles.cardActions}>
        <Button size="small" color="primary" disabled={!user?.result} onClick={handleLike}>
          <Likes />
        </Button>
        {(user?.result?.googleId === post?.creator || user?.result?._id === post?.creator) && (
          <Button size="small" sx={{ color: '#ef4444' }} onClick={() => dispatch(deletePost(post._id))}>
            <DeleteIcon fontSize="small" />
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default Post;