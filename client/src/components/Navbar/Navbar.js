import React, { useState, useEffect } from 'react';
import { AppBar, Avatar, Button, Toolbar, Typography, Box, IconButton, Badge, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import * as actionType from '../../constants/actionTypes';
import io from 'socket.io-client';
import * as api from '../../api';

// ICONS - Restoring your exact design
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

// 🛑 Your Render URL
const ENDPOINT = "https://ideaflux-54zk.onrender.com";

const Navbar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  // 🔔 Notification States
  const [notificationCount, setNotificationCount] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

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

  // 🔔 REAL-TIME LISTENER
  useEffect(() => {
    if (!user) return;

    // 1. Initial Count
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

    // 2. Socket Connection
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

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSnackbarClose = () => setOpenSnackbar(false);

  return (
    <AppBar position="static" color="inherit" sx={{ bgcolor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        
        {/* LOGO */}
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'white' }}>
            <Box sx={{ bgcolor: '#14b8a6', borderRadius: '4px', p: 0.5, mr: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>IF</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: '1px' }}>IDEAFLUX</Typography>
        </Box>

        {/* ICONS */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user ? (
            <>
                {/* 1. Explore */}
                <IconButton component={Link} to="/posts" sx={{ color: '#94a3b8' }}>
                    <ExploreOutlinedIcon />
                </IconButton>

                {/* 2. Search */}
                <IconButton component={Link} to="/posts/search" sx={{ color: '#14b8a6' }}>
                    <SearchIcon />
                </IconButton>

                {/* 3. Create */}
                <IconButton component={Link} to="/posts/create" sx={{ color: '#94a3b8' }}>
                    <AddCircleOutlineIcon />
                </IconButton>

                {/* 4. Chat */}
                <IconButton component={Link} to="/chat" sx={{ color: '#94a3b8' }}>
                    <ChatBubbleOutlineIcon />
                </IconButton>

                {/* 5. Notifications */}
                <IconButton component={Link} to="/notifications" sx={{ color: '#94a3b8' }}>
                    <Badge badgeContent={notificationCount} color="error">
                        <NotificationsNoneIcon />
                    </Badge>
                </IconButton>

                {/* 6. Settings */}
                <IconButton component={Link} to="/settings" sx={{ color: '#94a3b8' }}>
                    <SettingsOutlinedIcon />
                </IconButton>

                {/* 7. Avatar */}
                <IconButton onClick={handleMenu} sx={{ p: 0, ml: 1 }}>
                    <Avatar alt={user.result.name} src={user.result.picture} sx={{ width: 35, height: 35 }}>
                        {user.result.name.charAt(0)}
                    </Avatar>
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{ sx: { bgcolor: '#1e293b', color: 'white' } }}
                >
                    <MenuItem component={Link} to={`/profile/${user.result._id}`} onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={logout} sx={{ color: '#ef4444' }}>
                        <PowerSettingsNewIcon sx={{ mr: 1 }} /> Logout
                    </MenuItem>
                </Menu>
            </>
          ) : (
            <Button component={Link} to="/auth" variant="contained" sx={{ bgcolor: '#14b8a6' }}>Sign In</Button>
          )}
        </Box>
      </Toolbar>

      {/* NOTIFICATION POPUP */}
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%', bgcolor: '#334155', color: 'white' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </AppBar>
  );
};

export default Navbar;
