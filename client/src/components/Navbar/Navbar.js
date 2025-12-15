import React, { useState, useEffect } from 'react';
import { AppBar, Avatar, Button, Toolbar, Typography, Box, IconButton, Badge, Menu, MenuItem, InputBase, Snackbar, Alert } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode'; // Updated import for v4+
import * as actionType from '../../constants/actionTypes';
import useStyles from './styles'; // If you use CSS file, otherwise standard MUI styling below
import io from 'socket.io-client';
import * as api from '../../api';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

// Render URL
const ENDPOINT = "https://ideaflux-54zk.onrender.com";

const Navbar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Search State
  const [search, setSearch] = useState('');

  // 🔔 Notification States
  const [notificationCount, setNotificationCount] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const logout = () => {
    dispatch({ type: actionType.LOGOUT });
    navigate('/auth');
    setUser(null);
  };

  // 1. Check Token Expiry
  useEffect(() => {
    const token = user?.token;
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < new Date().getTime()) logout();
    }
    setUser(JSON.parse(localStorage.getItem('profile')));
  }, [location]);

  // 2. 🔔 Real-Time Notifications Logic
  useEffect(() => {
    if (!user) return;

    // A. Fetch Initial Unread Count
    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.fetchNotifications();
            // Count only unread
            const unread = data.filter((n) => !n.read).length;
            setNotificationCount(unread);
        } catch (error) {
            console.log(error);
        }
    };
    fetchUnreadCount();

    // B. Setup Socket Listener
    const socket = io(ENDPOINT);
    
    // Setup connection
    if (user?.result?._id) {
        socket.emit("setup", { _id: user.result._id });
    }

    // Listen for new notifications
    socket.on("notification received", (newNotif) => {
        // Increment Badge
        setNotificationCount((prev) => prev + 1);
        
        // Show Popup
        setSnackbarMsg(`New message from ${newNotif.sender.name}`);
        setOpenSnackbar(true);
    });

    return () => socket.disconnect();
  }, [user]);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSnackbarClose = () => setOpenSnackbar(false);

  const handleSearchKeyPress = (e) => {
    if(e.keyCode === 13) {
        // Navigate to search page
        if(search.trim()) {
            // dispatch(getPostsBySearch({ search })); // Optional if you want to trigger redux
            navigate(`/posts/search?searchQuery=${search || 'none'}`);
        }
    }
  };

  return (
    <AppBar position="static" color="inherit" sx={{ bgcolor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        
        {/* LOGO */}
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 1, color: '#14b8a6' }}>IF</Typography>
            <Typography variant="h6" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 'bold' }}>IDEAFLUX</Typography>
        </Box>

        {/* SEARCH BAR (Only if logged in) */}
        {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#1e293b', borderRadius: '20px', px: 2, py: 0.5, mx: 2, width: { xs: '40%', md: '30%' } }}>
                <SearchIcon sx={{ color: '#94a3b8' }} />
                <InputBase 
                    placeholder="Search..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyPress}
                    sx={{ ml: 1, color: 'white', width: '100%' }} 
                />
            </Box>
        )}

        {/* ICONS & PROFILE */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user ? (
            <>
                {/* Create Post */}
                <IconButton component={Link} to="/posts/create" sx={{ color: '#94a3b8', display: { xs: 'none', md: 'flex' } }}>
                    <AddCircleOutlineIcon />
                </IconButton>

                {/* Chat */}
                <IconButton component={Link} to="/chat" sx={{ color: '#94a3b8' }}>
                    <ChatBubbleOutlineIcon />
                </IconButton>

                {/* Notifications with Badge */}
                <IconButton component={Link} to="/notifications" sx={{ color: '#94a3b8' }}>
                    <Badge badgeContent={notificationCount} color="error">
                        <NotificationsNoneIcon />
                    </Badge>
                </IconButton>

                {/* Profile Avatar */}
                <IconButton onClick={handleMenu} sx={{ p: 0, ml: 1 }}>
                    <Avatar alt={user.result.name} src={user.result.picture} sx={{ width: 35, height: 35 }}>
                        {user.result.name.charAt(0)}
                    </Avatar>
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{ sx: { bgcolor: '#1e293b', color: 'white' } }}
                >
                    <MenuItem component={Link} to={`/profile/${user.result._id}`} onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={logout} sx={{ color: '#ef4444' }}>
                        <PowerSettingsNewIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
                    </MenuItem>
                </Menu>
            </>
          ) : (
            <Button component={Link} to="/auth" variant="contained" sx={{ bgcolor: '#14b8a6' }}>Sign In</Button>
          )}
        </Box>
      </Toolbar>

      {/* 🔔 POPUP SNACKBAR */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%', bgcolor: '#334155', color: 'white' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>

    </AppBar>
  );
};

export default Navbar;
