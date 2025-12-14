import React from 'react';
import { Container, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Auth from './components/Auth/Auth';
import Create from './components/Create/Create';
import PostDetails from './components/PostDetails/PostDetails';
import Settings from './components/Settings/Settings';
import ChatPage from './pages/Chat/ChatPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import Profile from './pages/Profile/Profile';
import SearchPage from './pages/Search/SearchPage';

import { ThemeContextProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// 🛑 NEW: Live Route Protector
// This checks for the user EVERY time you try to change pages
const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('profile'));
  return user ? children : <Navigate to="/auth" replace />;
};

const App = () => {
  return (
    <LanguageProvider>
      <ThemeContextProvider>
        <CssBaseline />
        <BrowserRouter>
          <Container maxWidth="xl">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/explore" replace />} />
              <Route path="/explore" element={<Home />} />
              <Route path="/search" element={<SearchPage />} /> 
              <Route path="/posts/:id" element={<PostDetails />} />
              
              {/* Auth Route */}
              <Route path="/auth" element={<AuthRedirect />} />

              {/* 🔒 PROTECTED ROUTES (Fixed for Sunny) */}
              <Route path="/create" element={<PrivateRoute><Create /></PrivateRoute>} />
              <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            </Routes>
          </Container>
        </BrowserRouter>
      </ThemeContextProvider>
    </LanguageProvider>
  );
};

// Helper to keep Auth logic clean
const AuthRedirect = () => {
  const user = JSON.parse(localStorage.getItem('profile'));
  return !user ? <Auth /> : <Navigate to="/explore" replace />;
};

export default App;