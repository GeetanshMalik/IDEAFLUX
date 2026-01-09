import React, { useEffect, useState } from "react";
import { Container, Paper, Typography, List, Box, IconButton, Divider, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import * as api from "../../api";
import Notifications from "./Notifications";
import io from 'socket.io-client';
import { useLanguage } from '../../context/LanguageProvider';

// Use Heroku backend URL
const ENDPOINT = process.env.REACT_APP_SOCKET_URL || "https://ideaflux-backend-b19efa363bd1.herokuapp.com";

const NotificationsPage = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('profile'));

  // 1. Fetch Initial (Persistent)
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

  // 2. Real-time Listener (Using Chat Pattern - Fixed)
  useEffect(() => {
    if (!user?.result?._id) return;

    const socket = io(ENDPOINT, {
      transports: ['websocket'], // WebSocket only as requested
      timeout: 15000,
      upgrade: false, // Disable upgrade since we only want WebSocket
      forceNew: false // Don't force new connection - reuse existing
    });

    socket.emit("setup", { _id: user.result._id });

    socket.on('connected', () => {
      console.log('✅ Notifications socket setup confirmed');
    });

    const handleNotificationReceived = (newNotif) => {
      console.log('🔔 New notification received:', newNotif);
      // Only add if it's not already in the list (prevent duplicates)
      setNotifications((prev) => {
        const exists = prev.find(n => n._id === newNotif._id);
        if (exists) return prev;
        return [newNotif, ...prev];
      });
    };

    socket.on("notification received", handleNotificationReceived);

    socket.on('connect_error', (error) => {
      console.error('❌ Notification socket connection failed:', error);
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected to server');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected from server');
    });

    // Cleanup to prevent duplicate listeners
    return () => {
      socket.off("notification received", handleNotificationReceived);
      socket.off('connected');
      socket.off('connect_error');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
      console.log('🔌 Notifications socket disconnected and cleaned up');
    };
  }, [user?.result?._id]);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      // Trigger event to update navbar badge
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: 0 } }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearNotifications(); // Actually clear notifications from database
      setNotifications([]); // Clear from UI
      // Trigger event to update navbar badge
      window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: 0 } }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleMarkSingleRead = (notificationId) => {
    // Just update the local state - the API call is already made in Notifications component
    setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={0} sx={{ 
        p: 0, 
        borderRadius: '16px', 
        bgcolor: '#1e293b', 
        color: 'white', 
        border: '1px solid #334155', 
        overflow: 'hidden' 
      }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={3} bgcolor="#0f172a">
          <Typography variant="h5" fontWeight="bold">
            {t('notifications')}
          </Typography>
          <Box>
            <IconButton 
              onClick={handleMarkAllRead} 
              sx={{ color: '#14b8a6' }} 
              title={t('markAllRead')}
            >
              <CheckCircleOutlineIcon />
            </IconButton>
            <IconButton 
              onClick={handleClearAll} 
              sx={{ color: '#ef4444' }} 
              title={t('clearAll')}
            >
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
            <Typography color="#94a3b8">
              {t('noNotificationsYet')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {notifications.map((notif) => (
              <Notifications 
                key={notif._id} 
                notif={notif} 
                onMarkRead={handleMarkSingleRead} 
              />
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default NotificationsPage;