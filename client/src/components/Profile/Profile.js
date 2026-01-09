import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Grid, Avatar, Button, Box, CircularProgress, TextField, Modal, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FileBase from 'react-file-base64';
import moment from 'moment';
import { colors, commonStyles } from '../../theme/globalTheme';

// Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import MessageIcon from '@mui/icons-material/Message';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CakeIcon from '@mui/icons-material/Cake';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';

import { getUser, followUser, unfollowUser, updateUserProfile } from '../../actions/user';
import { getPosts } from '../../actions/posts';
import * as api from '../../api'; 
import Post from '../../components/Posts/Post/Post';

const Profile = () => {
  const { userId } = useParams(); // Changed from id to userId
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userProfile, isLoading } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const currentUser = JSON.parse(localStorage.getItem('profile'));
  const currentUserId = currentUser?.result?._id || currentUser?.result?.googleId;

  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [userPosts, setUserPosts] = useState([]); // Add state for user posts
  
  // Image modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const [modalImageTitle, setModalImageTitle] = useState('');

  // Form State - Added username and backgroundImage fields
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', // Added username
    bio: '', 
    dob: '', 
    picture: '',
    backgroundImage: '' // Added background image
  });

  useEffect(() => {
    dispatch(getUser(userId)); // Changed from id to userId
    // Fetch user's posts specifically
    if (userId) {
      fetchUserPosts();
    }
  }, [dispatch, userId]); // Changed from id to userId

  // Fetch user posts directly from API
  const fetchUserPosts = async () => {
    try {
      const { data } = await api.fetchPostsByUser(userId);
      setUserPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setUserPosts([]);
    }
  };

  // Handle image modal
  const handleImageClick = (imageSrc, title) => {
    setModalImageSrc(imageSrc);
    setModalImageTitle(title);
    setImageModalOpen(true);
  };

  const handleCloseModal = () => {
    setImageModalOpen(false);
    setModalImageSrc('');
    setModalImageTitle('');
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

  useEffect(() => {
    if (userProfile) {
      setFormData({ 
        name: userProfile.name, 
        username: userProfile.username || '', // Added username
        bio: userProfile.bio || '', 
        dob: userProfile.dob || '', 
        picture: userProfile.picture,
        backgroundImage: userProfile.backgroundImage || '' // Added background image
      });

      // Check Follow Status
      if (userProfile.followers?.some(f => f._id === currentUserId || f === currentUserId)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    }
  }, [userProfile, currentUserId]);

  // Check username availability
  const checkUsername = async (username) => {
    if (!username || username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    try {
      const { data } = await api.checkUsernameAvailability(username);
      if (!data.available && username !== userProfile?.username) {
        setUsernameError('Username is already taken');
        return false;
      }
      setUsernameError('');
      return true;
    } catch (error) {
      setUsernameError('Error checking username availability');
      return false;
    }
  };

  // Handle username change
  const handleUsernameChange = async (e) => {
    const username = e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
    setFormData({ ...formData, username });
    
    if (username && username !== userProfile?.username) {
      await checkUsername(username);
    } else {
      setUsernameError('');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    return moment().diff(dob, 'years');
  };

  const handleFollow = async () => {
    if (!currentUser) return navigate('/auth');
    
    if (isFollowing) {
      dispatch(unfollowUser(userId)); // Changed from id to userId
      setIsFollowing(false);
      if(userProfile.followers) userProfile.followers.pop(); 
    } else {
      dispatch(followUser(userId)); // Changed from id to userId
      setIsFollowing(true);
      if(userProfile.followers) userProfile.followers.push(currentUserId);
    }
  };

  const handleMessage = async () => {
    if (!currentUser) return navigate('/auth');
    try {
      await api.accessChat(userId); // Changed from id to userId
      navigate('/chat');
    } catch (error) {
      console.log("Error chat:", error);
    }
  };

  const handleUpdateProfile = async () => {
    // Check username if it's being updated
    if (formData.username && formData.username !== userProfile?.username) {
      const isValid = await checkUsername(formData.username);
      if (!isValid) return;
    }

    try {
      // Prepare data for backend (convert dob to dateOfBirth)
      const profileData = {
        ...formData,
        dateOfBirth: formData.dob // Backend expects dateOfBirth
      };
      delete profileData.dob; // Remove the old field

      await dispatch(updateUserProfile(userProfile._id, profileData));
      
      // Force immediate re-fetch to get updated data
      await dispatch(getUser(userProfile._id));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  if (isLoading || !userProfile) return <CircularProgress sx={{ display: 'block', m: 'auto', mt: 5, color: '#14b8a6' }} />;

  const isOwner = currentUserId === userProfile._id;

  return (
    <Box sx={commonStyles.container}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
        <Paper sx={{ ...commonStyles.card, p: 0, overflow: 'hidden', mb: 4 }}>
          {/* 1. BANNER AREA */}
          <Box sx={{ 
            height: { xs: '120px', md: '200px' }, 
            background: (isEditing ? formData.backgroundImage : userProfile.backgroundImage) 
              ? `url(${isEditing ? formData.backgroundImage : userProfile.backgroundImage})` 
              : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            p: 2,
            cursor: (isEditing ? formData.backgroundImage : userProfile.backgroundImage) ? 'pointer' : 'default',
            '&:hover .bg-zoom-overlay': {
              opacity: (isEditing ? formData.backgroundImage : userProfile.backgroundImage) ? 1 : 0
            }
          }}
          onClick={() => {
            const bgImage = isEditing ? formData.backgroundImage : userProfile.backgroundImage;
            if (bgImage) {
              handleImageClick(bgImage, `${userProfile.name}'s Background`);
            }
          }}
          >
            {/* Background Image Zoom Overlay */}
            {(isEditing ? formData.backgroundImage : userProfile.backgroundImage) && (
              <Box
                className="bg-zoom-overlay"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '50%',
                  padding: '8px',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
              >
                <ZoomInIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>
            )}

            {isEditing && (
              <Box sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16,
                bgcolor: 'rgba(0,0,0,0.7)',
                borderRadius: 2,
                p: 1,
                zIndex: 2
              }}>
                <Typography variant="caption" sx={{ color: 'white', display: 'block', mb: 1 }}>
                  Background Image
                </Typography>
                <FileBase 
                  type="file" 
                  multiple={false} 
                  onDone={({ base64 }) => setFormData({ ...formData, backgroundImage: base64 })} 
                />
                {formData.backgroundImage && (
                  <Button 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, backgroundImage: '' });
                    }}
                    sx={{ mt: 1, color: 'white', fontSize: '0.7rem' }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ px: 4, pb: 4 }}>
            <Grid container spacing={2}>
              {/* 2. AVATAR */}
              <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center', mt: -8 }}>
                <Box position="relative">
                  <Box
                    sx={{
                      position: 'relative',
                      cursor: (isEditing ? formData.picture : userProfile.picture) ? 'pointer' : 'default',
                      '&:hover .avatar-zoom-overlay': {
                        opacity: (isEditing ? formData.picture : userProfile.picture) ? 1 : 0
                      }
                    }}
                    onClick={() => {
                      const profilePic = isEditing ? formData.picture : userProfile.picture;
                      if (profilePic) {
                        handleImageClick(profilePic, `${userProfile.name}'s Profile Picture`);
                      }
                    }}
                  >
                    <Avatar 
                      src={isEditing ? formData.picture : userProfile.picture} 
                      alt={userProfile.name} 
                      sx={{ 
                        width: { xs: 120, md: 160 }, 
                        height: { xs: 120, md: 160 }, 
                        fontSize: '4rem', 
                        bgcolor: colors.primary, 
                        border: `5px solid ${colors.darkSecondary}` 
                      }}
                    >
                      {userProfile.name.charAt(0)}
                    </Avatar>
                    
                    {/* Avatar Zoom Overlay */}
                    {(isEditing ? formData.picture : userProfile.picture) && (
                      <Box
                        className="avatar-zoom-overlay"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '50%',
                          padding: '8px',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ZoomInIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                      </Box>
                    )}
                  </Box>
                  
                  {isEditing && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <FileBase 
                        type="file" 
                        multiple={false} 
                        onDone={({ base64 }) => setFormData({ ...formData, picture: base64 })} 
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* 3. INFO SECTION */}
              <Grid item xs={12} sm={9} sx={{ mt: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
                  <Box>
                    {isEditing ? (
                      <Box display="flex" flexDirection="column" gap={2} mb={2}>
                        <TextField 
                          label="Display Name"
                          value={formData.name} 
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          sx={{
                            ...commonStyles.input,
                            '& .MuiOutlinedInput-root': {
                              bgcolor: colors.darkPrimary,
                              color: colors.textPrimary,
                              '& fieldset': { borderColor: colors.darkTertiary },
                              '&:hover fieldset': { borderColor: colors.primary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                            '& .MuiInputLabel-root': { color: colors.textSecondary },
                            '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
                            '& input': { color: colors.textPrimary }
                          }}
                        />
                        <TextField 
                          label="Username"
                          value={formData.username} 
                          onChange={handleUsernameChange}
                          error={!!usernameError}
                          helperText={usernameError || 'Choose a unique username (letters, numbers, underscore only)'}
                          sx={{
                            ...commonStyles.input,
                            '& .MuiOutlinedInput-root': {
                              bgcolor: colors.darkPrimary,
                              color: colors.textPrimary,
                              '& fieldset': { borderColor: colors.darkTertiary },
                              '&:hover fieldset': { borderColor: colors.primary },
                              '&.Mui-focused fieldset': { borderColor: colors.primary },
                            },
                            '& .MuiInputLabel-root': { color: colors.textSecondary },
                            '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
                            '& .MuiFormHelperText-root': { color: usernameError ? colors.danger : colors.textMuted },
                            '& input': { color: colors.textPrimary }
                          }}
                        />
                      </Box>
                    ) : (
                      <>
                        <Typography variant="h3" sx={{ color: colors.textPrimary, fontWeight: 700, mb: 1 }}>
                          {userProfile.name}
                        </Typography>
                        {userProfile.username && (
                          <Typography variant="h6" sx={{ color: colors.textSecondary, mb: 1 }}>
                            @{userProfile.username}
                          </Typography>
                        )}
                        {!userProfile.username && isOwner && (
                          <Typography variant="body2" sx={{ color: colors.textMuted, mb: 1, fontStyle: 'italic' }}>
                            Set your username in profile settings
                          </Typography>
                        )}
                      </>
                    )}
                    <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                      {isOwner ? userProfile.email : 'Email hidden'}
                    </Typography>
                  </Box>

                  {/* BUTTONS */}
                  <Box sx={{ mt: 1 }}>
                    {isOwner ? (
                      isEditing ? (
                        <Button 
                          variant="contained" 
                          startIcon={<SaveIcon />} 
                          onClick={handleUpdateProfile} 
                          disabled={!!usernameError}
                          sx={commonStyles.button.primary}
                        >
                          Save Profile
                        </Button>
                      ) : (
                        <Button 
                          variant="outlined" 
                          startIcon={<EditIcon />} 
                          onClick={() => setIsEditing(true)} 
                          sx={commonStyles.button.ghost}
                        >
                          Edit Profile
                        </Button>
                      )
                    ) : (
                      <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
                        <Button 
                          variant="contained" 
                          onClick={handleFollow}
                          startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                          sx={{
                            ...commonStyles.button[isFollowing ? 'ghost' : 'primary'],
                            minWidth: 120
                          }}
                        >
                          {isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                        <Button 
                          variant="outlined" 
                          onClick={handleMessage}
                          startIcon={<MessageIcon />}
                          sx={{
                            ...commonStyles.button.secondary,
                            minWidth: 120
                          }}
                        >
                          Message
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* 4. BIO & DOB */}
                <Box sx={{ mt: 3, maxWidth: '600px' }}>
                  {isEditing ? (
                    <Box display="flex" flexDirection="column" gap={2}>
                      <TextField 
                        label="Bio / About Me"
                        multiline 
                        rows={3}
                        value={formData.bio} 
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        sx={{
                          ...commonStyles.input,
                          '& .MuiOutlinedInput-root': {
                            bgcolor: colors.darkPrimary,
                            color: colors.textPrimary,
                            '& fieldset': { borderColor: colors.darkTertiary },
                            '&:hover fieldset': { borderColor: colors.primary },
                            '&.Mui-focused fieldset': { borderColor: colors.primary },
                          },
                          '& .MuiInputLabel-root': { color: colors.textSecondary },
                          '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
                          '& textarea': { color: colors.textPrimary }
                        }}
                      />
                      <TextField 
                        label="Date of Birth"
                        type="date"
                        value={formData.dob} 
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          ...commonStyles.input,
                          '& .MuiOutlinedInput-root': {
                            bgcolor: colors.darkPrimary,
                            color: colors.textPrimary,
                            '& fieldset': { borderColor: colors.darkTertiary },
                            '&:hover fieldset': { borderColor: colors.primary },
                            '&.Mui-focused fieldset': { borderColor: colors.primary },
                          },
                          '& .MuiInputLabel-root': { color: colors.textSecondary },
                          '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
                          '& input': { color: colors.textPrimary }
                        }}
                      />
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body1" sx={{ color: colors.textPrimary, mb: 2, whiteSpace: 'pre-line' }}>
                        {userProfile.bio || "No bio yet."}
                      </Typography>
                      {userProfile.dob && (
                        <Box display="flex" alignItems="center" gap={1} sx={{ 
                          color: colors.textSecondary, 
                          bgcolor: colors.dark, 
                          width: 'fit-content', 
                          px: 2, 
                          py: 0.5, 
                          borderRadius: '20px',
                          border: `1px solid ${colors.darkTertiary}`
                        }}>
                          <CakeIcon fontSize="small" />
                          <Typography variant="body2">
                            {calculateAge(userProfile.dob)} years old
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Box>

                {/* 5. STATS */}
                <Box display="flex" gap={4} mt={3} pt={2} sx={{ borderTop: `1px solid ${colors.darkTertiary}` }}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
                      {userPosts.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Posts
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
                      {userProfile.followers?.length || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Followers
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
                      {userProfile.following?.length || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Following
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* POSTS FEED */}
        <Typography variant="h5" sx={{ mt: 5, mb: 3, fontWeight: 700, color: colors.textPrimary }}>
          Recent Activity
        </Typography>
        <Grid container spacing={3}>
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <Grid item key={post._id} xs={12} sm={6} md={4}>
                <Post post={post} setCurrentId={() => {}} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, color: colors.textSecondary }}>
                <Typography variant="h6">No posts yet</Typography>
                <Typography variant="body2">
                  {isOwner ? "Share your first post!" : "This user hasn't posted anything yet."}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Image Modal */}
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
          {modalImageTitle && (
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
              {modalImageTitle}
            </Typography>
          )}
          
          {/* Full Size Image */}
          <img
            src={modalImageSrc}
            alt={modalImageTitle || 'Full size image'}
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
    </Box>
  );
};

export default Profile;