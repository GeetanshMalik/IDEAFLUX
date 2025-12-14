import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, List, Box, IconButton, Divider, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import * as api from "../../api";
import Notifications from "./Notifications"; // Imports the file above
import io from 'socket.io-client';

const ENDPOINT = "http://localhost:5000";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const user = JSON.parse(localStorage.getItem('profile'));

  // 1. Fetch Initial
  const getNotifs = async () => {
    try {
      const { data } = await api.fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getNotifs();
  }, []);

  // 2. Real-time Listener
  useEffect(() => {
    const socket = io(ENDPOINT);
    socket.emit("setup", user?.result);
    
    socket.on("notification received", (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => socket.disconnect();
  }, [user]);

  const handleMarkAllRead = async () => {
      try {
          await api.markNotificationsRead();
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (error) {
          console.log(error);
      }
  };

  const handleClearAll = async () => {
      setNotifications([]);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={0} sx={{ p: 0, borderRadius: '16px', bgcolor: '#1e293b', color: 'white', border: '1px solid #334155', overflow: 'hidden' }}>
        
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={3} bgcolor="#0f172a">
            <Typography variant="h5" fontWeight="bold">Notifications</Typography>
            <Box>
                <IconButton onClick={handleMarkAllRead} sx={{ color: '#14b8a6' }} title="Mark all as read">
                    <CheckCircleOutlineIcon />
                </IconButton>
                <IconButton onClick={handleClearAll} sx={{ color: '#ef4444' }} title="Clear all">
                    <DeleteSweepIcon />
                </IconButton>
            </Box>
        </Box>
        <Divider sx={{ bgcolor: '#334155' }} />

        {loading ? (
            <Box p={4} display="flex" justifyContent="center">
                <CircularProgress sx={{ color: '#14b8a6' }} />
            </Box>
        ) : notifications.length === 0 ? (
          <Box p={4} textAlign="center">
              <Typography color="#94a3b8">No notifications yet.</Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {notifications.map((notif) => (
              <Notifications key={notif._id} notif={notif} />
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;