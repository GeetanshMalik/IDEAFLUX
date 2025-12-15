import React from 'react';
import { Container } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Auth from './components/Auth/Auth';
import PostDetails from './components/PostDetails/PostDetails';
import Chat from './pages/Chat/Chat';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SearchPage from './pages/Search/SearchPage'; // 🛑 Make sure this is imported!
import Profile from './pages/Profile/Profile';

const App = () => {
  const user = JSON.parse(localStorage.getItem('profile'));

  return (
    <BrowserRouter>
      <Container maxWidth="xl">
        <Navbar />
        <Routes>
          {/* 🛑 1. Redirect "/" to "/posts" */}
          <Route path="/" element={<Navigate to="/posts" />} />
          
          {/* 🛑 2. Define the Home/Explore Feed */}
          <Route path="/posts" element={<Home />} />
          
          {/* 🛑 3. Define the Search Page (This fixes the blank Search screen) */}
          <Route path="/posts/search" element={<SearchPage />} />
          
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/posts" />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
