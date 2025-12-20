import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { NotificationProvider } from './components/Notification/NotificationSystem';
import { LanguageProvider } from './context/LanguageContext';
import { LoadingSpinner } from './components/Loading/Loading';

// Lazy load components for better performance
const Home = lazy(() => import('./components/Home/Home'));
const Auth = lazy(() => import('./components/Auth/Auth'));
const PostDetails = lazy(() => import('./components/PostDetails/PostDetails'));
const Chat = lazy(() => import('./pages/Chat/Chat'));
const NotificationsPage = lazy(() => import('./pages/Notifications/NotificationsPage'));
const SearchPage = lazy(() => import('./pages/Search/SearchPage'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Settings = lazy(() => import('./components/Settings/Settings'));
const AIAssistant = lazy(() => import('./pages/AIAssistant/AIAssistant'));
const Create = lazy(() => import('./components/Create/Create'));
const EmailVerification = lazy(() => import('./components/Auth/EmailVerification'));

// Create a wrapper component to access useLocation
const AppRoutes = () => {
  const [user, setUser] = useState(() => {
    // Initialize user state from localStorage on first load
    try {
      const profile = localStorage.getItem('profile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error parsing profile from localStorage:', error);
      localStorage.removeItem('profile');
      return null;
    }
  });
  const location = useLocation();

  // Update user state when localStorage changes or location changes
  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const profile = localStorage.getItem('profile');
        setUser(profile ? JSON.parse(profile) : null);
      } catch (error) {
        console.error('Error parsing profile from localStorage:', error);
        localStorage.removeItem('profile');
        setUser(null);
      }
    };

    // Listen for custom auth-change events
    window.addEventListener('auth-change', handleAuthChange);
    // Listen for storage changes (for logout)
    window.addEventListener('storage', handleAuthChange);
    
    // Also check on location change (for login/logout navigation)
    handleAuthChange();

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [location]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0f172a',
      color: 'white'
    }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
          <Routes>
            {/* 1. Feed / Explore */}
            <Route path="/" element={<Navigate to="/posts" />} />
            <Route 
              path="/posts" 
              element={user ? <Home /> : <Navigate to="/auth" />} 
            />
            <Route path="/explore" element={<Navigate to="/posts" />} />

            {/* 2. Search */}
            <Route 
              path="/posts/search" 
              element={user ? <SearchPage /> : <Navigate to="/auth" />} 
            />
            <Route path="/search" element={<Navigate to="/posts/search" />} />

            {/* 3. Create */}
            <Route 
              path="/create" 
              element={user ? <Create /> : <Navigate to="/auth" />} 
            /> 
            <Route path="/posts/create" element={<Navigate to="/create" />} />

            {/* 4. Details & Profile */}
            <Route 
              path="/posts/:id" 
              element={user ? <PostDetails /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/profile/:id" 
              element={user ? <Profile /> : <Navigate to="/auth" />} 
            />

            {/* 5. Protected Routes */}
            <Route 
              path="/auth" 
              element={!user ? <Auth /> : <Navigate to="/posts" />} 
            />
            <Route 
              path="/verify-email" 
              element={!user ? <EmailVerification /> : <Navigate to="/posts" />} 
            />
            <Route 
              path="/ai-assistant" 
              element={user ? <AIAssistant /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/chat" 
              element={user ? <Chat /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/notifications" 
              element={user ? <NotificationsPage /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/settings" 
              element={user ? <Settings /> : <Navigate to="/auth" />} 
            />

            {/* 6. 404 Fallback */}
            <Route path="*" element={user ? <Navigate to="/posts" /> : <Navigate to="/auth" />} />
          </Routes>
        </Suspense>
      </Container>
    </Box>
  );
};

const App = () => {

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
