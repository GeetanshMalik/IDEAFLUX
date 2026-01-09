import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Avatar, Box, IconButton, Tooltip, Typography, Badge, Menu, MenuItem, Snackbar, Alert, Modal } from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import * as api from '../../api';
import * as actionType from '../../constants/actionTypes';

// Icons
import ExploreIcon from '@mui/icons-material/Explore';
import CreateIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/NotificationsNone';
import ChatIcon from '@mui/icons-material/ChatBubbleOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PersonIcon from '@mui/icons-material/Person';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';

// My Heroku backend URL
const ENDPOINT = process.env.REACT_APP_SOCKET_URL || "https://ideaflux-backend-b19efa363bd1.herokuapp.com";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  // Notification States
  const [notificationCount, setNotificationCount] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  // Image modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

  const isActive = (path) => location.pathname === path;

  const logout = () => {
    dispatch({ type: actionType.LOGOUT });
    localStorage.removeItem('profile');
    setUser(null);
    setAnchorEl(null);
    
    // Trigger auth state change event
    window.dispatchEvent(new CustomEvent('auth-change'));
    
    // Force immediate redirect
    window.location.href = '/auth';
  };

  // Check authentication status
  const checkAuth = () => {
    try {
      const profile = localStorage.getItem('profile');
      if (profile) {
        const parsedUser = JSON.parse(profile);
        // Check if token is still valid
        if (parsedUser?.token) {
          const token = parsedUser.token;
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
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error parsing user profile:', error);
      localStorage.removeItem('profile');
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    // Check auth on location change
    checkAuth();
  }, [location]);

  // Real-Time Logic - Optimized to prevent multiple connections
  useEffect(() => {
    if (!user?.result?._id) return;

    let socket = null;
    let isConnecting = false;

    const connectSocket = () => {
      if (isConnecting || socket?.connected) return;
      
      isConnecting = true;
      
      socket = io(ENDPOINT, {
        transports: ['websocket'], // WebSocket only as requested
        timeout: 15000,
        forceNew: false,
        upgrade: false, // Disable upgrade since we only want WebSocket
        autoConnect: true
      });
      
      socket.on('connect', () => {
        console.log('🔌 Navbar socket connected:', socket.id, 'Transport:', socket.io.engine.transport.name);
        isConnecting = false;
        socket.emit("setup", { _id: user.result._id });
      });
      
      socket.on('connect_error', (error) => {
        console.error('❌ Navbar socket connection error:', error);
        isConnecting = false;
      });
      
      socket.on('disconnect', (reason) => {
        console.log('🔌 Navbar socket disconnected:', reason);
        isConnecting = false;
      });
      
      socket.on('connected', () => {
        console.log('✅ Navbar socket setup confirmed for user:', user.result._id);
      });

      const handleNavbarNotification = (newNotif) => {
        // Filter out my system test notifications
        if (newNotif.type === 'system' && newNotif.message?.includes('connection established')) {
          return;
        }
        
        console.log('🔔 Notification received in Navbar:', newNotif);
        setNotificationCount((prev) => prev + 1);
        setSnackbarMsg(`New notification from ${newNotif.sender?.name || 'Someone'}`);
        setOpenSnackbar(true);
      };

      socket.on("notification received", handleNavbarNotification);
    };

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

    // Listen for notification updates from NotificationsPage
    const handleNotificationUpdate = (event) => {
      setNotificationCount(event.detail.count);
    };
    window.addEventListener('notifications-updated', handleNotificationUpdate);

    // Connect socket with delay to prevent rapid connections
    const connectTimer = setTimeout(connectSocket, 1000);

    // My cleanup to prevent duplicate listeners
    return () => {
      clearTimeout(connectTimer);
      window.removeEventListener('notifications-updated', handleNotificationUpdate);
      if (socket) {
        socket.off("notification received");
        socket.disconnect();
        socket = null;
      }
      isConnecting = false;
    };
  }, [user?.result?._id]); // Only reconnect when user ID changes

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSnackbarClose = () => setOpenSnackbar(false);

  // Handle profile picture click
  const handleProfilePicClick = (e) => {
    e.stopPropagation();
    if (user?.result?.picture) {
      setModalImageSrc(user.result.picture);
      setImageModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setImageModalOpen(false);
    setModalImageSrc('');
  };

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && imageModalOpen) {
        handleCloseModal();
      }
    };

    if (imageModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageModalOpen]);

  // Styles
  const iconStyle = (path) => ({
      color: isActive(path) ? '#14b8a6' : '#94a3b8',
      fontSize: { xs: 24, sm: 26, md: 28 },
      '&:hover': { color: '#14b8a6' }
  });

  return (
    // 🛑 FIX: Added style={{ backgroundColor... }} to FORCE dark theme
    <AppBar position="sticky" style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }} elevation={0}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: '70px' }}>
        
        {/* LOGO */}
        <Box display="flex" alignItems="center" sx={{ cursor: 'pointer', minWidth: '150px' }} onClick={() => navigate('/posts')}>
             <Box sx={{ bgcolor: '#14b8a6', borderRadius: '8px', width: 35, height: 35, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>IF</Typography>
             </Box>
             <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: 1, display: { xs: 'none', sm: 'block' } }}>
                 IDEAFLUX
             </Typography>
        </Box>

        {/* CENTER ICONS */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 0.5, sm: 1.5, md: 3 }, flexGrow: 1 }}>
            
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

            <Tooltip title="Create">
                <IconButton component={Link} to="/create">
                    <CreateIcon sx={{ ...iconStyle('/create'), fontSize: { xs: 26, sm: 28, md: 32 } }} />
                </IconButton>
            </Tooltip>

            <Tooltip title="AI Assistant">
                <IconButton component={Link} to="/ai-assistant">
                    <SmartToyIcon sx={iconStyle('/ai-assistant')} />
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

        {/* PROFILE */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: { xs: '60px', sm: '100px', md: '150px' } }}>
             {user ? (
                 <>
                    <Box
                      sx={{
                        position: 'relative',
                        '&:hover .profile-zoom-overlay': {
                          opacity: user?.result?.picture ? 1 : 0
                        }
                      }}
                    >
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
                      
                      {/* Profile Picture Zoom Overlay */}
                      {user?.result?.picture && (
                        <Box
                          className="profile-zoom-overlay"
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            borderRadius: '50%',
                            padding: '4px',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                            pointerEvents: 'none'
                          }}
                        >
                          <ZoomInIcon sx={{ color: 'white', fontSize: '1rem' }} />
                        </Box>
                      )}
                    </Box>
                    
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        PaperProps={{ sx: { bgcolor: '#1e293b', color: 'white', border: '1px solid #334155' } }}
                    >
                        <MenuItem onClick={() => { 
                          const profileUserId = user?.result?._id;
                          if (profileUserId) {
                            navigate(`/profile/${profileUserId}`); 
                          }
                          handleClose(); 
                        }}>
                            <PersonIcon sx={{ mr: 1, fontSize: 20, color: '#94a3b8' }} /> Profile
                        </MenuItem>
                        {user?.result?.picture && (
                          <MenuItem onClick={() => {
                            handleProfilePicClick({ stopPropagation: () => {} });
                            handleClose();
                          }}>
                            <ZoomInIcon sx={{ mr: 1, fontSize: 20, color: '#94a3b8' }} /> View Profile Picture
                          </MenuItem>
                        )}
                        <MenuItem onClick={logout} sx={{ color: '#ef4444' }}>
                            <PowerSettingsNewIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
                        </MenuItem>
                    </Menu>
                 </>
             ) : (
                 <Box component={Link} to="/auth" sx={{ bgcolor: '#14b8a6', color: 'white', px: 3, py: 1, borderRadius: '20px', fontWeight: 'bold', textDecoration: 'none' }}>
                     Sign In
                 </Box>
             )}
        </Box>

      </Toolbar>
      
      {/* POPUP */}
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%', bgcolor: '#334155', color: 'white' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>

      {/* Profile Picture Modal */}
      <Modal
        open={imageModalOpen}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '95vw',
            maxHeight: '95vh',
            outline: 'none'
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              top: -50,
              right: -10,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.9)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {/* Image Title */}
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              top: -50,
              left: 0,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem'
            }}
          >
            {user?.result?.name}'s Profile Picture
          </Typography>
          
          {/* Full Size Image */}
          <img
            src={modalImageSrc}
            alt={`${user?.result?.name}'s Profile Picture`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
            }}
          />
        </Box>
      </Modal>

    </AppBar>
  );
};

export default Navbar;
