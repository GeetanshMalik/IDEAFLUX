import React, { useState, useRef } from 'react';
import { Typography, TextField, Button, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import { commentPost } from '../../actions/posts';

const CommentSection = ({ post }) => {
  const user = JSON.parse(localStorage.getItem('profile'));
  const [comments, setComments] = useState(post?.comments);
  const [comment, setComment] = useState('');
  const dispatch = useDispatch();
  const commentsRef = useRef();

  const handleClick = async () => {
    // Format: "UserName: CommentText"
    const finalComment = `${user.result.name}: ${comment}`;
    
    const newComments = await dispatch(commentPost(finalComment, post._id));
    
    setComments(newComments);
    setComment('');
    
    // Auto-scroll to bottom of comments
    commentsRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '40%', height: '200px', overflowY: 'auto' }}>
          <Typography gutterBottom variant="h6">Comments</Typography>
          {comments?.map((c, i) => (
            <Typography key={i} gutterBottom variant="subtitle1">
              <strong>{c.split(': ')[0]}</strong>
              {c.split(':')[1]}
            </Typography>
          ))}
          <div ref={commentsRef} />
        </div>
        {user?.result?.name && (
          <div style={{ width: '50%' }}>
            <Typography gutterBottom variant="h6">Write a Comment</Typography>
            <TextField
              fullWidth
              minRows={4}
              variant="outlined"
              label="Comment"
              multiline
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button style={{ marginTop: '10px', backgroundColor: '#00BFFF' }} fullWidth disabled={!comment} variant="contained" onClick={handleClick}>
              Comment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;