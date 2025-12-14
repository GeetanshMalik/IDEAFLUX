import React, { useState, useEffect } from "react";
import { Container, Paper, Box, Typography } from "@mui/material";
import io from "socket.io-client";

import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import "./chat.css";

// 🛑 Ensure this matches your Render URL
const ENDPOINT = "https://ideaflux-54zk.onrender.com"; 

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [user] = useState(JSON.parse(localStorage.getItem("profile")));
  
  // 🛑 FIX: Store socket in State so React tracks it
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Initialize Socket
    const newSocket = io(ENDPOINT);
    
    // 2. Setup (Send only ID)
    if (user?.result?._id) {
        newSocket.emit("setup", { _id: user.result._id });
    }
    
    // 3. Save to State (Triggers re-render for children)
    setSocket(newSocket);

    // 4. Cleanup
    return () => newSocket.disconnect();
  }, [user]);

  // Auto-select first chat
  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
        setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

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
                socket={socket} // Now passing the STATE variable
                user={user}
                onBack={() => setSelectedChat(null)} 
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  IdeaFlux Chat
                </Typography>
                <Typography variant="body1" sx={{ color: '#94a3b8' }}>
                  Loading conversations...
                </Typography>
              </Box>
            )}
        </Box>

      </Paper>
    </Container>
  );
};

export default Chat;
