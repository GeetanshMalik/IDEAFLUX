import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Avatar, Box, IconButton, Tooltip, Typography, Badge, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import * as api from '../../api';
import * as actionType from '../../constants/actionTypes';

// Icons
import ExploreIcon from '@mui/icons-material/Explore';
import CreateIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/NotificationsNone';
import ChatIcon from '@mui/icons-material/ChatBubbleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PersonIcon from '@mui/icons-material/Person';

// 🛑 Your Render URL
const ENDPOINT = "https://ideaflux-54zk.onrender.com";

const Navbar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Menu State (For Logout)
  const [anchorEl, setAnchorEl] = useState(null);

  // Notification States
  const [notificationCount, setNotificationCount] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    dispatch({ type: actionType.LOGOUT });
    navigate('/auth');
    setUser(null);
    setAnchorEl(null);
  };

  useEffect(() => {
    const token = user?.token;
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < new Date().getTime()) logout();
    }
    setUser(JSON.parse(localStorage.getItem('profile')));
  }, [location]);

  // 🔔 REAL-TIME SOCKET LOGIC
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.fetchNotifications();
            const unread = data.filter((n) => !n.read).length;
            setNotificationCount(unread);
        } catch (error) {
            console.log(error);
        }
    };
    fetchUnreadCount();

    const socket = io(ENDPOINT);
    if (user?.result?._id) {
        socket.emit("setup", { _id: user.result._id });
    }

    socket.on("notification received", (newNotif) => {
        setNotificationCount((prev) => prev + 1);
        setSnackbarMsg(`New message from ${newNotif.sender.name}`);
        setOpenSnackbar(true);
    });

    return () => socket.disconnect();
  }, [user]);

  // Styles
  const iconStyle = (path) => ({
      color: isActive(path) ? '#14b8a6' : '#94a3b8',
      fontSize: 28,
      '&:hover': { color: '#14b8a6' }
  });

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSnackbarClose = () => setOpenSnackbar(false);

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#0f172a', borderBottom: '1px solid #1e293b' }} elevation={0}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: '70px' }}>
        
        {/* --- EXTREME LEFT: LOGO --- */}
        <Box display="flex" alignItems="center" sx={{ cursor: 'pointer', minWidth: '150px' }} onClick={() => navigate('/posts')}>
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
                <IconButton component={Link} to="/posts">
                    <ExploreIcon sx={iconStyle('/posts')} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Search">
                <IconButton component={Link} to="/posts/search">
                    <SearchIcon sx={iconStyle('/posts/search')} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Create Post">
                <IconButton component={Link} to="/posts/create">
                    <CreateIcon sx={{ ...iconStyle('/posts/create'), fontSize: 32 }} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Messages">
                <IconButton component={Link} to="/chat">
                    <ChatIcon sx={iconStyle('/chat')} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
                <IconButton component={Link} to="/notifications">
                    <Badge badgeContent={notificationCount} color="error">
                        <NotificationsIcon sx={iconStyle('/notifications')} />
                    </Badge>
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
                 <>
                    <Avatar 
                       src={user.result.picture} 
                       alt={user.result.name}
                       onClick={handleMenu}
                       sx={{ 
                           cursor: 'pointer', 
                           bgcolor: '#14b8a6', 
                           width: 40, height: 40,
                           border: isActive(`/profile/${user.result._id}`) ? '2px solid white' : 'none'
                       }}
                    >
                        {user.result.name.charAt(0)}
                    </Avatar>
                    
                    {/* DROPDOWN MENU FOR LOGOUT */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        PaperProps={{ 
                            sx: { 
                                bgcolor: '#1e293b', 
                                color: 'white', 
                                mt: 1,
                                border: '1px solid #334155'
                            } 
                        }}
                    >
                        <MenuItem onClick={() => { navigate(`/profile/${user.result._id}`); handleClose(); }}>
                            <PersonIcon sx={{ mr: 1, fontSize: 20, color: '#94a3b8' }} /> Profile
                        </MenuItem>
                        <MenuItem onClick={logout} sx={{ color: '#ef4444' }}>
                            <PowerSettingsNewIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
                        </MenuItem>
                    </Menu>
                 </>
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
      
      {/* 🔔 SNACKBAR POPUP */}
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%', bgcolor: '#334155', color: 'white', border: '1px solid #14b8a6' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>

    </AppBar>
  );
};

export default Navbar;
