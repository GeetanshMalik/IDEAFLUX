import React, { useState, useEffect } from "react";
import { Container, Paper, Box, Typography } from "@mui/material";
import io from "socket.io-client";

import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import "./chat.css";

//Point this to your Render Server URL
const ENDPOINT = "https://ideaflux-54zk.onrender.com"; 
var socket;

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [user] = useState(JSON.parse(localStorage.getItem("profile")));
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user?.result);
    socket.on("connected", () => setSocketConnected(true));
    return () => socket.disconnect();
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
                socket={socket} 
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
