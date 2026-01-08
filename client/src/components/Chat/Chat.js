import React, { useState, useEffect, useMemo } from "react";
import { Container, Paper, Box, Typography } from "@mui/material";
import io from "socket.io-client";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { LoadingSpinner } from "../../components/Loading/Loading";
import { useLanguage } from '../../context/LanguageProvider';
import "./chat.css";

// Use local endpoint for development
const ENDPOINT = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"; 

const Chat = () => {
  const { t } = useLanguage();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Memoize user to prevent unnecessary re-renders
  const user = useMemo(() => JSON.parse(localStorage.getItem("profile")), []);

  // Initialize socket connection once
  useEffect(() => {
    if (!user?.result?._id) return;

    const newSocket = io(ENDPOINT, {
      transports: ['websocket', 'polling'], // WebSocket first, polling backup
      timeout: 10000,
      forceNew: false, // Reuse connections for efficiency
      upgrade: true,
      rememberUpgrade: true
    });

    // My connection debugging
    newSocket.on('connect', () => {
      console.log('🔌 Chat socket connected:', newSocket.id, 'Transport:', newSocket.io.engine.transport.name);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('❌ Chat socket connection error:', error);
    });
    
    // Log my transport upgrades
    newSocket.io.engine.on('upgrade', () => {
      console.log('🔄 Chat transport upgraded to:', newSocket.io.engine.transport.name);
    });

    newSocket.emit("setup", { _id: user.result._id });

    newSocket.on("connected", () => {
      console.log("✅ Chat socket setup confirmed for user:", user.result._id);
      setLoading(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection failed:", error);
      setLoading(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.result?._id]);

  // Auto-select first chat (optimized)
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats.length, selectedChat]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <LoadingSpinner message={t('connectingToChat')} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="chat-container">
      <Paper elevation={4} className="chat-paper">
        {/* SIDEBAR */}
        <Box className={`chat-sidebar ${selectedChat ? "hidden-mobile" : ""}`}>
          <ChatSidebar 
            user={user} 
            chats={chats} 
            setChats={setChats} 
            selectedChat={selectedChat} 
            setSelectedChat={setSelectedChat} 
          />
        </Box>

        {/* WINDOW */}
        <Box className={`chat-window ${!selectedChat ? "hidden-mobile" : ""}`}>
          {selectedChat ? (
            <ChatWindow 
              selectedChat={selectedChat} 
              socket={socket}
              user={user}
              onBack={() => setSelectedChat(null)} 
            />
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              color: 'white' 
            }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                {t('ideafluxChat')}
              </Typography>
              <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                {chats.length === 0 ? t('noConversationsYet') : "Select a conversation to start chatting"}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;