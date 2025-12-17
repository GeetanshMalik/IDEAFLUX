import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const SlideTransition = (props) => {
  return <Slide {...props} direction="down" />;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, severity = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      severity,
      duration,
      open: true
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    showNotification(message, 'success', duration);
  }, [showNotification]);

  const showError = useCallback((message, duration) => {
    showNotification(message, 'error', duration);
  }, [showNotification]);

  const showWarning = useCallback((message, duration) => {
    showNotification(message, 'warning', duration);
  }, [showNotification]);

  const showInfo = useCallback((message, duration) => {
    showNotification(message, 'info', duration);
  }, [showNotification]);

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Render all notifications */}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={notification.open}
          autoHideDuration={notification.duration}
          onClose={() => hideNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          TransitionComponent={SlideTransition}
          sx={{ 
            mt: index * 7, // Stack notifications
            '& .MuiAlert-root': {
              bgcolor: notification.severity === 'error' ? '#dc2626' : 
                     notification.severity === 'success' ? '#059669' :
                     notification.severity === 'warning' ? '#d97706' : '#0284c7',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            }
          }}
        >
          <Alert 
            onClose={() => hideNotification(notification.id)} 
            severity={notification.severity}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;