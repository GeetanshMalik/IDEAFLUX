import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

// Icons
import ExploreIcon from '@mui/icons-material/Explore';
import CreateIcon from '@mui/icons-material/AddCircleOutline'; // Changed to AddCircle for "Create" look
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/NotificationsNone';
import ChatIcon from '@mui/icons-material/ChatBubbleOutline';
import SettingsIcon from '@mui/icons-material/Settings';

import * as actionType from '../../constants/actionTypes';

const Navbar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Active route state for styling
  const isActive = (path) => location.pathname === path;

  const logout = () => {
    dispatch({ type: actionType.LOGOUT });
    navigate('/auth');
    setUser(null);
  };

  useEffect(() => {
    const token = user?.token;
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < new Date().getTime()) logout();
    }
    setUser(JSON.parse(localStorage.getItem('profile')));
  }, [location]);

  // Common Icon Style
  const iconStyle = (path) => ({
      color: isActive(path) ? '#14b8a6' : '#94a3b8', // Teal if active, Grey if not
      fontSize: 28,
      '&:hover': { color: '#14b8a6' }
  });

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#0f172a', borderBottom: '1px solid #1e293b' }} elevation={0}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: '70px' }}>
        
        {/* --- EXTREME LEFT: LOGO --- */}
        <Box display="flex" alignItems="center" sx={{ cursor: 'pointer', minWidth: '150px' }} onClick={() => navigate('/explore')}>
             <Box sx={{ bgcolor: '#14b8a6', borderRadius: '8px', width: 35, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>IF</Typography>
             </Box>
             <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: 1, display: { xs: 'none', sm: 'block' } }}>
                 IDEAFLUX
             </Typography>
        </Box>

        {/* --- CENTER: ALL OPTIONS WITH EQUAL DISTANCE --- */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 2, md: 5 }, flexGrow: 1 }}>
            
            <Tooltip title="Explore">
                <IconButton component={Link} to="/explore">
                    <ExploreIcon sx={iconStyle('/explore')} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Search">
                <IconButton component={Link} to="/search">
                    <SearchIcon sx={iconStyle('/search')} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Create Post">
                <IconButton component={Link} to="/create">
                    <CreateIcon sx={{ ...iconStyle('/create'), fontSize: 32 }} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Messages">
                <IconButton component={Link} to="/chat">
                    <ChatIcon sx={iconStyle('/chat')} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
                <IconButton component={Link} to="/notifications">
                    <NotificationsIcon sx={iconStyle('/notifications')} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
                <IconButton component={Link} to="/settings">
                    <SettingsIcon sx={iconStyle('/settings')} />
                </IconButton>
            </Tooltip>

        </Box>

        {/* --- EXTREME RIGHT: PROFILE --- */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: '150px' }}>
             {user ? (
                 <Avatar 
                    src={user.result.picture} 
                    alt={user.result.name}
                    onClick={() => navigate(`/profile/${user.result._id}`)}
                    sx={{ 
                        cursor: 'pointer', 
                        bgcolor: '#14b8a6', 
                        width: 40, height: 40,
                        border: isActive(`/profile/${user.result._id}`) ? '2px solid white' : 'none'
                    }}
                 >
                     {user.result.name.charAt(0)}
                 </Avatar>
             ) : (
                 <Box 
                    component={Link} to="/auth"
                    sx={{ 
                        bgcolor: '#14b8a6', color: 'white', px: 3, py: 1, borderRadius: '20px', 
                        fontWeight: 'bold', textDecoration: 'none',
                        '&:hover': { bgcolor: '#0d9488' }
                    }}
                 >
                     Sign In
                 </Box>
             )}
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;