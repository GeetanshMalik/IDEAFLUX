import React from 'react';
import { Container } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Auth from './components/Auth/Auth';
import PostDetails from './components/PostDetails/PostDetails';
import Chat from './pages/Chat/Chat';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SearchPage from './pages/Search/SearchPage';
import Profile from './pages/Profile/Profile';
import Settings from './components/Settings/Settings'; // Imported Settings

const App = () => {
  const user = JSON.parse(localStorage.getItem('profile'));

  return (
    <BrowserRouter>
      <Container maxWidth="xl">
        <Navbar />
        <Routes>
          {/* 1. Feed / Explore */}
          <Route path="/" element={<Navigate to="/posts" />} />
          <Route path="/posts" element={<Home />} />
          <Route path="/explore" element={<Navigate to="/posts" />} /> {/* Fixes Explore Link */}

          {/* 2. Search */}
          <Route path="/posts/search" element={<SearchPage />} />
          <Route path="/search" element={<Navigate to="/posts/search" />} /> {/* Fixes Search Link */}

          {/* 3. Create (Redirects to Home where Form is, or dedicated page if you have one) */}
          <Route path="/create" element={<Home />} /> 
          <Route path="/posts/create" element={<Home />} />

          {/* 4. Details & Profile */}
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* 5. Auth, Chat, Settings */}
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/posts" />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          
          {/* 🛑 FIX: Added Settings Route */}
          <Route path="/settings" element={<Settings />} /> 
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
