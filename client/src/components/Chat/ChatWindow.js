import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, IconButton, Typography, Avatar, CircularProgress, Tooltip, Chip, Menu, MenuItem, Alert, Snackbar } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile"; 
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert"; 
import * as api from "../../api";
import ChatMessage from "./ChatMessage";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLanguage } from '../../context/LanguageProvider';

const ChatWindow = ({ selectedChat, socket, user, onBack }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [mediaFile, setMediaFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const scrollRef = useRef();

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);

  // File size limit (50MB in bytes)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  // 1. Fetch Previous Messages
  useEffect(() => {
    if (!selectedChat) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await api.fetchMessages(selectedChat._id);
        setMessages(data);
        
        // Join the room
        if (socket) {
            socket.emit("join chat", selectedChat._id);
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [selectedChat, socket]);

  // 2. 🛑 FIX: Real-time Listener (Robust Version)
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (newMessageReceived) => {
      // Only update if the message belongs to THIS open chat
      if (selectedChat && selectedChat._id === newMessageReceived.chat._id) {
         setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };

    socket.on("message received", handleMessageReceived);

    // Cleanup to prevent double messages
    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [socket, selectedChat]); // Runs whenever socket or chat changes

  // 3. Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() || mediaFile) {
      // Store current values before clearing
      const tempMessage = newMessage;
      const tempMedia = mediaFile;
      
      try {
        const messageData = { 
            content: tempMessage, 
            chatId: selectedChat._id,
            media: tempMedia ? tempMedia.base64 : "",
            mediaType: tempMedia ? tempMedia.type : "",
            fileName: tempMedia ? tempMedia.name : ""
        };
        
        // Clear inputs immediately for better UX
        setNewMessage(""); 
        setMediaFile(null); 

        const { data } = await api.sendMessage(messageData);
        
        // Add message to local state immediately
        setMessages(prevMessages => [...prevMessages, data]);
        
        // Emit to socket for real-time delivery to other users
        if (socket) {
            socket.emit("new message", data);
        }
      } catch (error) {
        console.log(error);
        // Restore inputs on error
        setNewMessage(tempMessage);
        setMediaFile(tempMedia);
      }
    }
  };

  const handleDeleteMessageUI = (id) => {
      setMessages(messages.filter(m => m._id !== id));
  };

  const handleDeleteChat = async () => {
      if(window.confirm("Delete entire conversation? This cannot be undone.")) {
          try {
              await api.deleteChat(selectedChat._id);
              window.location.reload(); 
          } catch (error) {
              console.log(error);
          }
      }
  };

  const getSender = (users) => users[0]?._id === user?.result?._id ? users[1] : users[0];
  const otherUser = getSender(selectedChat.users);

  return (
    <Box className="chat-window">
      {/* Header */}
      <Box className="chat-header" sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center">
            <IconButton onClick={onBack} sx={{ display: { md: "none" }, color: 'white', mr: 1 }}>
                <ArrowBackIcon />
            </IconButton>
            <Avatar src={otherUser?.picture} alt={otherUser?.name} />
            <Typography variant="h6" style={{ marginLeft: "10px", fontWeight: 'bold' }}>
            {otherUser?.name}
            </Typography>
        </Box>
        
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'white' }}>
            <MoreVertIcon />
        </IconButton>
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
        >
            <MenuItem onClick={handleDeleteChat} sx={{ color: 'red' }}>Delete Chat</MenuItem>
        </Menu>
      </Box>

      {/* Messages */}
      <Box className="messages-area">
        {loading ? (
          <CircularProgress style={{ color: "#14b8a6", margin: "auto" }} />
        ) : (
          messages.map((m, i) => (
            <ChatMessage 
               key={i} 
               message={m} 
               isOwnMessage={m.sender._id === user.result._id} 
               onDelete={handleDeleteMessageUI} 
            />
          ))
        )}
        <div ref={scrollRef} />
      </Box>

      {/* Input */}
      <form className="input-area" onSubmit={sendMessage}>
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="file"
              style={{ 
                position: 'absolute', 
                opacity: 0, 
                width: '30px', 
                height: '30px', 
                zIndex: 2, 
                cursor: 'pointer' 
              }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Check file size before processing
                  if (file.size > MAX_FILE_SIZE) {
                    setFileError('File size too large for free tier. Please use files below 50MB.');
                    e.target.value = ''; // Clear the input
                    return;
                  }
                  
                  // Convert to base64 using FileReader
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const fileData = {
                      base64: event.target.result,
                      name: file.name,
                      type: file.type,
                      size: file.size
                    };
                    setMediaFile(fileData);
                    setFileError('');
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <Tooltip title="Attach File"><AttachFileIcon sx={{ color: mediaFile ? '#14b8a6' : '#94a3b8', cursor: 'pointer' }} /></Tooltip>
        </Box>
        {mediaFile && <Chip label={mediaFile.name.substring(0, 10)} onDelete={() => setMediaFile(null)} deleteIcon={<CloseIcon style={{ color: 'white' }} />} sx={{ bgcolor: '#14b8a6', color: 'white', mr: 1 }} />}
        <TextField 
          fullWidth 
          variant="outlined" 
          placeholder={t('typeMessage')} 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          size="small" 
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: '#334155' },
              '&:hover fieldset': { borderColor: '#14b8a6' },
              '&.Mui-focused fieldset': { borderColor: '#14b8a6' }
            },
            '& .MuiInputLabel-root': { color: '#94a3b8' },
            '& input': { color: 'white' }
          }}
        />
        <IconButton type="submit" sx={{ color: '#14b8a6', bgcolor: 'rgba(20,184,166,0.1)' }}><SendIcon /></IconButton>
      </form>

      {/* File Error Snackbar */}
      <Snackbar 
        open={!!fileError} 
        autoHideDuration={6000} 
        onClose={() => setFileError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setFileError('')} severity="error" sx={{ width: '100%' }}>
          {fileError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatWindow;