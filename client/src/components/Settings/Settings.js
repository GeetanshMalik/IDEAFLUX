import React, { useState } from 'react';
import { 
    Container, Paper, Typography, Box, Switch, Button, 
    Divider, TextField, Grow, MenuItem, Select 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as api from '../../api';
import * as actionType from '../../constants/actionTypes';

// Icons
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LockIcon from '@mui/icons-material/Lock';
import LanguageIcon from '@mui/icons-material/Language';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';

import { useLanguage } from '../../context/LanguageContext';

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();
  const user = JSON.parse(localStorage.getItem('profile'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [setUser] = useState(user); // Dummy state setter if needed for local updates
  
  // State for toggles
  const [settings, setSettings] = useState({
      allowMessages: true,
      likesNotif: true,
      commentsNotif: true,
      followsNotif: true,
      mentionsNotif: true,
  });

  const handleToggle = (name) => {
      setSettings({ ...settings, [name]: !settings[name] });
  };

  // DELETE ACCOUNT LOGIC
  const handleDeleteAccount = async () => {
      if(window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
          try {
              const userId = user?.result?._id || user?.result?.googleId;
              await api.deleteAccount(userId);
              
              // Logout user
              dispatch({ type: actionType.LOGOUT });
              navigate('/auth');
          } catch (error) {
              console.log(error);
              alert("Error deleting account.");
          }
      }
  };

  return (
    <Grow in>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
                {t('settings')}
            </Typography>

            {/* SECTION 1: ACCOUNT */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <AccountCircleIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" color="text.primary">{t('account')}</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Box display="flex" flexDirection="column" gap={3}>
                    <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{t('displayName')}</Typography>
                        <TextField 
                            fullWidth variant="outlined" defaultValue={user?.result?.name} 
                            sx={{ borderRadius: '8px' }}
                        />
                    </Box>

                    <Box>
                        <Box display="flex" gap={1} mb={1}>
                            <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{t('email')}</Typography>
                        </Box>
                        <TextField 
                            fullWidth variant="outlined" value={user?.result?.email} disabled 
                            sx={{ borderRadius: '8px', opacity: 0.7 }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>{t('language')}</Typography>
                        <Select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            fullWidth
                            startAdornment={<LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                            sx={{ borderRadius: '8px' }}
                        >
                            <MenuItem value="en">English (US)</MenuItem>
                            <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
                            <MenuItem value="es">Español (Spanish)</MenuItem>
                        </Select>
                    </Box>
                </Box>
            </Paper>

            {/* SECTION 2: PRIVACY */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <LockIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" color="text.primary">{t('preferences')}</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                            <ChatIcon sx={{ color: 'text.secondary' }} />
                            <Typography color="text.primary">Allow Direct Messages</Typography>
                        </Box>
                        <Switch checked={settings.allowMessages} onChange={() => handleToggle('allowMessages')} color="primary" />
                    </Box>
                </Box>
            </Paper>

            {/* SECTION 3: NOTIFICATIONS */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <NotificationsActiveIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" color="text.primary">{t('notifications')}</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                     {[
                        { label: t('notif_likes'), key: 'likesNotif' },
                        { label: t('notif_comments'), key: 'commentsNotif' },
                        { label: t('notif_follows'), key: 'followsNotif' },
                        { label: t('notif_mentions'), key: 'mentionsNotif' }
                     ].map((item) => (
                        <Box key={item.key} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography color="text.primary">{item.label}</Typography>
                            <Switch checked={settings[item.key]} onChange={() => handleToggle(item.key)} color="primary" />
                        </Box>
                     ))}
                </Box>
            </Paper>

            {/* DANGER ZONE */}
            <Box display="flex" gap={2} flexDirection="column">
                <Button 
                    variant="outlined" startIcon={<DeleteForeverIcon />}
                    onClick={handleDeleteAccount}
                    sx={{ color: 'error.main', borderColor: 'error.main', py: 1.5, '&:hover': { bgcolor: 'error.light', borderColor: 'error.main', opacity: 0.1 } }}
                >
                    {t('deleteAccount')}
                </Button>
                
                <Button variant="contained" size="large" startIcon={<SaveIcon />} sx={{ py: 1.5, fontWeight: 'bold' }}>
                    {t('save')}
                </Button>
            </Box>

        </Container>
    </Grow>
  );
};

export default Settings;