import React, { useState, useEffect } from "react";
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from "@mui/material";
import * as api from "../../api";

const ChatSidebar = ({ user, chats, setChats, selectedChat, setSelectedChat }) => {
  
  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await api.fetchChats(); 
        setChats(data);
      } catch (error) {
        console.log("Error loading chats:", error);
      }
    };
    if (user) loadChats();
  }, [user, setChats]);

  const getSender = (users) => {
    return users[0]?._id === user?.result?._id ? users[1] : users[0];
  };

  return (
    <Box className="chat-sidebar">
      {/* ALIGNMENT FIX: Flexbox with padding ensures it doesn't overlap */}
      <Box sx={{ height: '70px', display: 'flex', alignItems: 'center', px: 3, borderBottom: '1px solid #334155', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">Messages</Typography>
      </Box>
      
      <List className="chat-list">
        {chats?.map((chat) => {
          const sender = getSender(chat.users);
          return (
            <React.Fragment key={chat._id}>
                <ListItem 
                  button 
                  onClick={() => setSelectedChat(chat)}
                  selected={selectedChat?._id === chat._id}
                  sx={{ py: 2 }} 
                >
                  <ListItemAvatar>
                    <Avatar 
                        src={sender?.picture} 
                        alt={sender?.name}
                        sx={{ bgcolor: '#14b8a6' }}
                    >
                        {sender?.name?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {sender?.name}
                        </Typography>
                    } 
                    secondary={
                        <Typography variant="body2" sx={{ color: '#94a3b8', noWrap: true }}>
                            {chat.latestMessage ? 
                              (chat.latestMessage.content.length > 25 ? chat.latestMessage.content.substring(0, 25) + "..." : chat.latestMessage.content) 
                              : "Start a conversation"}
                        </Typography>
                    } 
                  />
                </ListItem>
                <Divider sx={{ bgcolor: '#334155' }} component="li" />
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default ChatSidebar;