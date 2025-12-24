import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, CircularProgress } from "@mui/material";
import * as api from "../../api";
import { useLanguage } from '../../context/LanguageProvider';

const ChatSidebar = ({ user, chats, setChats, selectedChat, setSelectedChat }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  
  // Memoized chat loading function
  const loadChats = useCallback(async () => {
    if (!user?.result?._id) return;
    
    try {
      setLoading(true);
      const { data } = await api.fetchChats(); 
      setChats(data || []);
    } catch (error) {
      console.error("Error loading chats:", error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [user?.result?._id, setChats]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Memoized sender function for better performance
  const getSender = useCallback((users) => {
    if (!users || !Array.isArray(users)) return null;
    return users[0]?._id === user?.result?._id ? users[1] : users[0];
  }, [user?.result?._id]);

  // Memoized chat list to prevent unnecessary re-renders
  const chatList = useMemo(() => {
    if (!chats || chats.length === 0) return [];
    
    return chats.map((chat) => {
      const sender = getSender(chat.users);
      return {
        ...chat,
        sender,
        displayName: sender?.name || t('unknownUser') || 'Unknown User',
        displayMessage: chat.latestMessage?.content 
          ? (chat.latestMessage.content.length > 25 
              ? chat.latestMessage.content.substring(0, 25) + "..." 
              : chat.latestMessage.content)
          : "Start a conversation"
      };
    });
  }, [chats, getSender, t]);

  return (
    <Box className="chat-sidebar">
      <Box sx={{ 
        height: '70px', 
        display: 'flex', 
        alignItems: 'center', 
        px: 3, 
        borderBottom: '1px solid #334155', 
        color: 'white' 
      }}>
        <Typography variant="h6" fontWeight="bold">
          {t('messages')} {chats.length > 0 && `(${chats.length})`}
        </Typography>
      </Box>
      
      <List className="chat-list" sx={{ height: 'calc(100% - 70px)', overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#14b8a6' }} />
          </Box>
        ) : chatList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
            <Typography variant="body2">{t('noConversationsYet')}</Typography>
          </Box>
        ) : (
          chatList.map((chat) => (
            <React.Fragment key={chat._id}>
              <ListItem 
                button 
                onClick={() => setSelectedChat(chat)}
                selected={selectedChat?._id === chat._id}
                sx={{ 
                  py: 2,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(20, 184, 166, 0.1)',
                    borderRight: '3px solid #14b8a6'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(20, 184, 166, 0.05)'
                  }
                }} 
              >
                <ListItemAvatar>
                  <Avatar 
                    src={chat.sender?.picture} 
                    alt={chat.displayName}
                    sx={{ bgcolor: '#14b8a6', width: 48, height: 48 }}
                  >
                    {chat.displayName.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: 'white', 
                        fontWeight: selectedChat?._id === chat._id ? 'bold' : 'normal',
                        fontSize: '1rem'
                      }}
                    >
                      {chat.displayName}
                    </Typography>
                  } 
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#94a3b8', 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {chat.displayMessage}
                    </Typography>
                  } 
                />
              </ListItem>
              <Divider sx={{ bgcolor: '#334155' }} component="li" />
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

export default ChatSidebar;