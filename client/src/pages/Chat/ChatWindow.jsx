import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, IconButton, Typography, Avatar, CircularProgress, Tooltip, Chip, Menu, MenuItem } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile"; 
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert"; 
import FileBase from 'react-file-base64'; 
import * as api from "../../api";
import ChatMessage from "./ChatMessage";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ChatWindow = ({ selectedChat, socket, user, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [mediaFile, setMediaFile] = useState(null); 
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);

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
      try {
        const messageData = { 
            content: newMessage, 
            chatId: selectedChat._id,
            media: mediaFile ? mediaFile.base64 : "",
            mediaType: mediaFile ? mediaFile.type : "",
            fileName: mediaFile ? mediaFile.name : ""
        };
        setNewMessage(""); 
        setMediaFile(null); 

        const { data } = await api.sendMessage(messageData);
        
        // Emit to socket immediately
        if (socket) {
            socket.emit("new message", data);
        }
        setMessages([...messages, data]);
      } catch (error) {
        console.log(error);
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
            <div style={{ position: 'absolute', opacity: 0, width: '30px', height: '30px', zIndex: 2, cursor: 'pointer', overflow: 'hidden' }}>
                <FileBase type="file" multiple={false} onDone={(file) => setMediaFile(file)} />
            </div>
            <Tooltip title="Attach File"><AttachFileIcon sx={{ color: mediaFile ? '#14b8a6' : '#94a3b8', cursor: 'pointer' }} /></Tooltip>
        </Box>
        {mediaFile && <Chip label={mediaFile.name.substring(0, 10)} onDelete={() => setMediaFile(null)} deleteIcon={<CloseIcon style={{ color: 'white' }} />} sx={{ bgcolor: '#14b8a6', color: 'white', mr: 1 }} />}
        <TextField fullWidth variant="outlined" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} size="small" />
        <IconButton type="submit" sx={{ color: '#14b8a6', bgcolor: 'rgba(20,184,166,0.1)' }}><SendIcon /></IconButton>
      </form>
    </Box>
  );
};

export default ChatWindow;
