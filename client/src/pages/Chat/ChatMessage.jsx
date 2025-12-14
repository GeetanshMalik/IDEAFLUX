import React from 'react';
import { Typography, Box, Avatar, IconButton } from '@mui/material';
import moment from 'moment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // Trash Icon
import * as api from "../../api";
import './chat.css';

const ChatMessage = ({ message, isOwnMessage, onDelete }) => {
  
  const handleDelete = async () => {
    if(window.confirm("Delete this message?")) {
        try {
            await api.deleteMessage(message._id);
            if(onDelete) onDelete(message._id); // Update UI
        } catch (error) {
            console.log(error);
        }
    }
  };

  const renderMedia = () => {
      if (!message.media) return null;
      const type = message.mediaType || "";

      if (type.startsWith("image/")) {
          return <img src={message.media} alt="attachment" className="message-media" />;
      } else if (type.startsWith("video/")) {
          return <video controls src={message.media} className="message-media" />;
      } else if (type.startsWith("audio/")) {
          return <audio controls src={message.media} style={{ width: '100%', marginTop: '5px' }} />;
      } else {
          return (
              <a href={message.media} download={message.fileName || "download"} className="message-file" style={{ color: isOwnMessage ? 'white' : '#14b8a6' }}>
                  <InsertDriveFileIcon />
                  <Typography variant="body2" sx={{ textDecoration: 'underline' }}>{message.fileName || "Download File"}</Typography>
              </a>
          );
      }
  };

  return (
    <div className={`message-wrapper ${isOwnMessage ? 'own' : 'other'}`}>
      {!isOwnMessage && (
        <Avatar src={message.sender.picture} alt={message.sender.name} sx={{ width: 28, height: 28, marginRight: '8px', alignSelf: 'flex-end', marginBottom: '4px' }} />
      )}
      
      <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
        {/* DELETE BUTTON (Only for own messages) */}
        {isOwnMessage && (
            <IconButton 
                size="small" 
                onClick={handleDelete}
                sx={{ position: 'absolute', top: 0, left: -30, color: '#ef4444', opacity: 0.5, '&:hover': { opacity: 1 } }}
            >
                <DeleteOutlineIcon fontSize="small" />
            </IconButton>
        )}

        {message.content && <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>}
        {renderMedia()}
        <span className="message-time">{moment(message.createdAt).format('LT')}</span>
      </div>
    </div>
  );
};

export default ChatMessage;