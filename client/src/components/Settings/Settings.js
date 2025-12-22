import React, { useState } from 'react';
import { 
    Container, Paper, Typography, Box, Switch, Button, 
    Divider, TextField, Grow, MenuItem, Select, FormControl,
    InputLabel, Alert
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
import { colors, commonStyles } from '../../theme/globalTheme';
import { useNotification } from '../Notification/NotificationSystem';

const Settings = () => {
  const { currentLanguage, changeLanguage, t, availableLanguages } = useLanguage();
  const { showSuccess, showError } = useNotification();
  const user = JSON.parse(localStorage.getItem('profile'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State for settings
  const [settings, setSettings] = useState({
      allowMessages: true,
      likesNotif: true,
      commentsNotif: true,
      followsNotif: true,
      mentionsNotif: true,
  });
  
  const [userInfo, setUserInfo] = useState({
      name: user?.result?.name || '',
      email: user?.result?.email || '',
  });
  
  const [loading, setLoading] = useState(false);

  const handleToggle = (name) => {
      setSettings({ ...settings, [name]: !settings[name] });
  };

  const handleLanguageChange = (event) => {
      const newLanguage = event.target.value;
      changeLanguage(newLanguage);
      showSuccess(`Language changed to ${availableLanguages.find(lang => lang.code === newLanguage)?.name}`);
  };

  const handleSaveSettings = async () => {
      setLoading(true);
      try {
          // Here you would typically save settings to the server
          // await api.updateUserSettings(settings);
          showSuccess('Settings saved successfully!');
      } catch (error) {
          showError('Failed to save settings. Please try again.');
      } finally {
          setLoading(false);
      }
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
              showSuccess('Account deleted successfully.');
          } catch (error) {
              console.log(error);
              showError('Error deleting account. Please try again.');
          }
      }
  };

  return (
    <Box sx={commonStyles.container}>
      <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            mb: 4, 
            color: colors.textPrimary,
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          {t('settings')}
        </Typography>

        {/* SECTION 1: ACCOUNT */}
        <Paper sx={{ ...commonStyles.card, p: 4, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: `${colors.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AccountCircleIcon sx={{ color: colors.primary, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                {t('accountSettings')}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Manage your account information and preferences
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3, borderColor: colors.darkTertiary }} />
          
          <Box display="flex" flexDirection="column" gap={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 600 }}>
                {t('displayName')}
              </Typography>
              <TextField 
                fullWidth 
                placeholder="Enter your display name"
                value={userInfo.name}
                onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.darkSecondary,
                    color: colors.textPrimary,
                    '& fieldset': { borderColor: colors.darkTertiary },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  }
                }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 600 }}>
                {t('emailAddress')}
              </Typography>
              <TextField 
                fullWidth 
                value={userInfo.email} 
                disabled 
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: colors.darkTertiary,
                    color: colors.textMuted,
                    '& fieldset': { borderColor: colors.darkTertiary },
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: colors.textMuted
                  }
                }}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: colors.textMuted }} />
                }}
              />
              <Typography variant="caption" sx={{ color: colors.textMuted, mt: 0.5, display: 'block' }}>
                Email cannot be changed for security reasons
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: colors.textPrimary, mb: 1, fontWeight: 600 }}>
                {t('languagePreference')}
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  sx={{
                    bgcolor: colors.darkSecondary,
                    color: colors.textPrimary,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.darkTertiary },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }
                  }}
                >
                  {availableLanguages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1.2em' }}>{lang.flag}</span>
                        {lang.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>



        {/* SECTION 2: PRIVACY */}
        <Paper sx={{ ...commonStyles.card, p: 4, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: `${colors.accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LockIcon sx={{ color: colors.accent, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                {t('privacySecurity')}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Control who can interact with you
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3, borderColor: colors.darkTertiary }} />

          <Box display="flex" justifyContent="space-between" alignItems="center" p={2} 
               sx={{ bgcolor: colors.darkSecondary, borderRadius: 2, border: `1px solid ${colors.darkTertiary}` }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 1, 
                bgcolor: `${colors.primary}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChatIcon sx={{ color: colors.primary, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ color: colors.textPrimary, fontWeight: 500 }}>
                  Allow Direct Messages
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Let other users send you private messages
                </Typography>
              </Box>
            </Box>
            <Switch 
              checked={settings.allowMessages} 
              onChange={() => handleToggle('allowMessages')} 
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: colors.primary,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: colors.primary,
                },
              }}
            />
          </Box>
        </Paper>

        {/* SECTION 3: NOTIFICATIONS */}
        <Paper sx={{ ...commonStyles.card, p: 4, mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: `${colors.secondary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <NotificationsActiveIcon sx={{ color: colors.secondary, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                Notification Preferences
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Choose what notifications you want to receive
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3, borderColor: colors.darkTertiary }} />

          <Box display="flex" flexDirection="column" gap={2}>
            {[
              { label: 'Likes on posts', key: 'likesNotif', desc: 'Get notified when someone likes your posts', icon: '👍' },
              { label: 'Comments on posts', key: 'commentsNotif', desc: 'Get notified when someone comments on your posts', icon: '💬' },
              { label: 'New followers', key: 'followsNotif', desc: 'Get notified when someone follows you', icon: '👥' },
              { label: 'Mentions', key: 'mentionsNotif', desc: 'Get notified when someone mentions you', icon: '📢' }
            ].map((item) => (
              <Box key={item.key} 
                   sx={{ 
                     p: 2, 
                     bgcolor: colors.darkSecondary, 
                     borderRadius: 2, 
                     border: `1px solid ${colors.darkTertiary}`,
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center' 
                   }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography sx={{ fontSize: '1.5rem' }}>{item.icon}</Typography>
                  <Box>
                    <Typography sx={{ color: colors.textPrimary, fontWeight: 500 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
                <Switch 
                  checked={settings[item.key]} 
                  onChange={() => handleToggle(item.key)} 
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colors.primary,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: colors.primary,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Paper>

        {/* ACTION BUTTONS */}
        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Button 
            variant="contained"
            size="large" 
            startIcon={<SaveIcon />} 
            onClick={handleSaveSettings}
            disabled={loading}
            sx={{
              ...commonStyles.button.primary,
              flex: 1,
              py: 1.5, 
              fontWeight: 600
            }}
          >
            {loading ? 'Saving...' : t('save')}
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<DeleteForeverIcon />}
            onClick={handleDeleteAccount}
            sx={{
              flex: 1,
              py: 1.5,
              fontWeight: 600,
              borderColor: '#ef4444',
              color: '#ef4444',
              bgcolor: 'transparent',
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': { 
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
                color: '#ff6b6b'
              }
            }}
          >
            Delete Account
          </Button>
        </Box>

      </Container>
    </Box>
  );
};

export default Settings;