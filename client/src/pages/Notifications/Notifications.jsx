import React from 'react';
import { ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box } from '@mui/material';
import moment from 'moment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChatIcon from '@mui/icons-material/Chat';
import CommentIcon from '@mui/icons-material/Comment';
import { useNavigate } from 'react-router-dom';
import * as api from '../../api';

const Notifications = ({ notif, onMarkRead }) => {
  const navigate = useNavigate();

  // Determine Icon based on type
  const getIcon = () => {
      switch(notif.type) {
          case 'like': return <FavoriteIcon fontSize="small" sx={{ color: '#ef4444' }} />;
          case 'follow': return <PersonAddIcon fontSize="small" sx={{ color: '#14b8a6' }} />;
          case 'message': return <ChatIcon fontSize="small" sx={{ color: '#3b82f6' }} />;
          default: return <CommentIcon fontSize="small" sx={{ color: '#eab308' }} />;
      }
  };

  // Click Handler
  const handleClick = async () => {
      // Mark as read if not already read
      if (!notif.read) {
          try {
              await api.markNotificationRead(notif._id);
              onMarkRead(notif._id); // Update parent state
          } catch (error) {
              console.log('Error marking notification as read:', error);
          }
      }

      // Navigate to appropriate page
      if (notif.type === 'message') {
          navigate('/chat');
      } else if (notif.post) {
          navigate(`/posts/${notif.post._id || notif.post}`);
      } else {
          navigate(`/profile/${notif.sender._id}`);
      }
  };

  return (
    <ListItem 
        alignItems="flex-start" 
        onClick={handleClick}
        sx={{ 
            bgcolor: notif.read ? 'transparent' : 'rgba(20, 184, 166, 0.1)', // Highlight if unread
            cursor: 'pointer',
            borderBottom: '1px solid #334155',
            '&:hover': { bgcolor: '#334155' },
            transition: '0.2s'
        }}
    >
      <ListItemAvatar>
        <Box position="relative">
            <Avatar alt={notif.sender?.name} src={notif.sender?.picture} sx={{ width: 40, height: 40 }} />
            <Box 
                sx={{ 
                    position: 'absolute', bottom: -4, right: -4, 
                    bgcolor: '#0f172a', borderRadius: '50%', p: 0.5, display: 'flex' 
                }}
            >
                {getIcon()}
            </Box>
        </Box>
      </ListItemAvatar>
      
      <ListItemText
        primary={
            <Typography sx={{ color: 'white', fontWeight: notif.read ? 'normal' : 'bold', fontSize: '0.95rem' }}>
                {notif.sender?.name}
                <span style={{ fontWeight: 'normal', color: '#cbd5e1', marginLeft: '6px' }}>
                    {notif.type === 'like' && 'liked your post.'}
                    {notif.type === 'comment' && 'commented on your post.'}
                    {notif.type === 'follow' && 'started following you.'}
                    {notif.type === 'message' && 'sent you a message.'}
                </span>
            </Typography>
        }
        secondary={
          <React.Fragment>
            <Typography component="span" variant="body2" sx={{ color: '#94a3b8', display: 'block', mt: 0.5, fontSize: '0.8rem' }}>
              {notif.message && notif.type !== 'follow' && notif.type !== 'like' && `"${notif.message.substring(0, 50)}..."`}
            </Typography>
            <Typography component="span" variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              {moment(notif.createdAt).fromNow()}
            </Typography>
          </React.Fragment>
        }
      />
      
      {!notif.read && (
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#14b8a6', mt: 2 }} />
      )}
    </ListItem>
  );
};

export default Notifications;