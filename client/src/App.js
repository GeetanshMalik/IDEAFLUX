import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';

import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { NotificationProvider } from './components/Notification/NotificationSystem';
import { LanguageProvider } from './context/LanguageProvider';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Auth from './components/Auth/Auth';
import EmailVerification from './components/Auth/EmailVerification';
import Settings from './components/Settings/Settings';
import SearchPage from './components/Search/SearchPage';
import Chat from './components/Chat/Chat';
import NotificationsPage from './components/Notifications/NotificationsPage';
import AIAssistant from './components/AIAssistant/AIAssistant';
import Create from './components/Create/Create';
import Profile from './components/Profile/Profile';
import PostDetails from './components/PostDetails/PostDetails';
import store from './store';

const App = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Check authentication status on app load
  React.useEffect(() => {
    const checkAuth = () => {
      try {
        const profile = localStorage.getItem('profile');
        if (profile) {
          const parsedUser = JSON.parse(profile);
          // Check if token is still valid
          if (parsedUser?.token) {
            const token = parsedUser.token;
            // Basic token validation - check if it's not expired
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload.exp * 1000 > Date.now()) {
                setUser(parsedUser);
              } else {
                // Token expired, clear it
                localStorage.removeItem('profile');
                setUser(null);
              }
            } catch (e) {
              // Invalid token format, clear it
              localStorage.removeItem('profile');
              setUser(null);
            }
          } else {
            setUser(parsedUser); // Google auth might not have JWT token
          }
        }
      } catch (error) {
        console.error('Error parsing user profile:', error);
        localStorage.removeItem('profile');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Show loading while checking auth
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#0f172a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <NotificationProvider>
          <LanguageProvider>
            <BrowserRouter>
              <Box sx={{ 
                minHeight: '100vh', 
                bgcolor: '#0f172a',
                color: 'white'
              }}>
                <Navbar />
                <Container maxWidth="xl" sx={{ pb: 4 }}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/posts" />} />
                    <Route path="/posts" element={user ? <Home /> : <Navigate to="/auth" />} />
                    <Route path="/posts/:id" element={user ? <PostDetails /> : <Navigate to="/auth" />} />
                    <Route path="/posts/search" element={user ? <SearchPage /> : <Navigate to="/auth" />} />
                    <Route path="/create" element={user ? <Create /> : <Navigate to="/auth" />} />
                    <Route path="/chat" element={user ? <Chat /> : <Navigate to="/auth" />} />
                    <Route path="/notifications" element={user ? <NotificationsPage /> : <Navigate to="/auth" />} />
                    <Route path="/ai-assistant" element={user ? <AIAssistant /> : <Navigate to="/auth" />} />
                    <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" />} />
                    <Route path="/profile/:userId" element={user ? <Profile /> : <Navigate to="/auth" />} />
                    <Route path="/verify-email" element={<EmailVerification />} />
                    <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/posts" />} />
                    <Route path="*" element={<Navigate to="/posts" />} />
                  </Routes>
                </Container>
              </Box>
            </BrowserRouter>
          </LanguageProvider>
        </NotificationProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;