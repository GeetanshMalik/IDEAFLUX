import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Grid, Avatar, Button, Box, CircularProgress, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FileBase from 'react-file-base64';
import moment from 'moment';
import { colors, commonStyles } from '../../theme/globalTheme';
import { useLanguage } from '../../context/LanguageContext';

// Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import MessageIcon from '@mui/icons-material/Message';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CakeIcon from '@mui/icons-material/Cake';

import { getUser, followUser, unfollowUser, updateUserProfile } from '../../actions/user';
import { getPosts } from '../../actions/posts';
import * as api from '../../api'; 
import Post from '../../components/Posts/Post/Post';

const Profile = () => {
    const { t } = useLanguage();
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { userProfile, isLoading } = useSelector((state) => state.user);
    const { posts } = useSelector((state) => state.posts);
    const currentUser = JSON.parse(localStorage.getItem('profile'));
    const currentUserId = currentUser?.result?._id || currentUser?.result?.googleId;
    
    const [isFollowing, setIsFollowing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({ 
        name: '', 
        bio: '', 
        dob: '', 
        picture: ''
    });

    useEffect(() => {
        dispatch(getUser(id));
        dispatch(getPosts(1));
    }, [dispatch, id]);

    useEffect(() => {
        if (userProfile) {
            setFormData({ 
                name: userProfile.name, 
                bio: userProfile.bio || '', 
                dob: userProfile.dob || '', 
                picture: userProfile.picture
            });
            
            // Check Follow Status
            if (userProfile.followers?.some(f => f._id === currentUserId || f === currentUserId)) {
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }
        }
    }, [userProfile, currentUserId]);

    const calculateAge = (dob) => {
        if (!dob) return null;
        return moment().diff(dob, 'years');
    };

    const handleFollow = async () => {
        if (!currentUser) return navigate('/auth');
        if (isFollowing) {
            dispatch(unfollowUser(id));
            setIsFollowing(false);
            if(userProfile.followers) userProfile.followers.pop(); 
        } else {
            dispatch(followUser(id));
            setIsFollowing(true);
            if(userProfile.followers) userProfile.followers.push(currentUserId);
        }
    };

    const handleMessage = async () => {
        if (!currentUser) return navigate('/auth');
        try {
            await api.accessChat(id); 
            navigate('/chat');
        } catch (error) {
            console.log("Error chat:", error);
        }
    };

    const handleUpdateProfile = () => {
        dispatch(updateUserProfile(userProfile._id, formData));
        setIsEditing(false);
    };

    if (isLoading || !userProfile) return <CircularProgress sx={{ display: 'block', m: 'auto', mt: 5, color: '#14b8a6' }} />;

    const userPosts = posts.filter(p => p.creator === id);
    const isOwner = currentUserId === userProfile._id;

    return (
        <Box sx={commonStyles.container}>
            <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
                <Paper sx={{ ...commonStyles.card, p: 0, overflow: 'hidden', mb: 4 }}>
                    
                    {/* 1. BANNER AREA */}
                    <Box sx={{ 
                        height: { xs: '120px', md: '200px' }, 
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
                        position: 'relative'
                    }} />

                    <Box sx={{ px: 4, pb: 4 }}>
                        <Grid container spacing={2}>
                            
                            {/* 2. AVATAR */}
                            <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center', mt: -8 }}>
                                <Box position="relative">
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
                                    {isEditing && (
                                        <Box sx={{ mt: 1, textAlign: 'center' }}>
                                            <FileBase type="file" multiple={false} onDone={({ base64 }) => setFormData({ ...formData, picture: base64 })} />
                                        </Box>
                                    )}
                                </Box>
                            </Grid>

                            {/* 3. INFO SECTION */}
                            <Grid item xs={12} sm={9} sx={{ mt: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
                                    <Box>
                                        {isEditing ? (
                                            <TextField 
                                                label={t('displayName')}
                                                value={formData.name} 
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                sx={commonStyles.input}
                                            />
                                        ) : (
                                            <Typography variant="h3" sx={{ color: colors.textPrimary, fontWeight: 700, mb: 1 }}>
                                                {userProfile.name}
                                            </Typography>
                                        )}
                                        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                                            {userProfile.email}
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
                                                    sx={commonStyles.button.primary}
                                                >
                                                    {t('save')}
                                                </Button>
                                            ) : (
                                                <Button 
                                                    variant="outlined" 
                                                    startIcon={<EditIcon />} 
                                                    onClick={() => setIsEditing(true)} 
                                                    sx={commonStyles.button.ghost}
                                                >
                                                    {t('editProfile')}
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
                                                    {isFollowing ? t('unfollow') : t('follow')}
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
                                                    {t('messages')}
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
                                                label={t('bio')}
                                                multiline 
                                                rows={3}
                                                value={formData.bio} 
                                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                sx={commonStyles.input}
                                            />
                                            <TextField 
                                                label={t('dateOfBirth')}
                                                type="date"
                                                value={formData.dob} 
                                                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                                InputLabelProps={{ shrink: true }}
                                                sx={commonStyles.input}
                                            />
                                        </Box>
                                    ) : (
                                        <>
                                            <Typography variant="body1" sx={{ color: colors.textPrimary, mb: 2, whiteSpace: 'pre-line' }}>
                                                {userProfile.bio || t('noBioYet')}
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
                                            {t('posts')}
                                        </Typography>
                                    </Box>
                                    <Box textAlign="center">
                                        <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
                                            {userProfile.followers?.length || 0}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            {t('followers')}
                                        </Typography>
                                    </Box>
                                    <Box textAlign="center">
                                        <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 700 }}>
                                            {userProfile.following?.length || 0}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                            {t('following')}
                                        </Typography>
                                    </Box>
                                </Box>

                            </Grid>
                        </Grid>
                    </Box>
                </Paper>

                {/* POSTS FEED */}
                <Typography variant="h5" sx={{ mt: 5, mb: 3, fontWeight: 700, color: colors.textPrimary }}>
                    {t('recentActivity')}
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
                            <Box sx={{ 
                                textAlign: 'center', 
                                py: 8,
                                color: colors.textSecondary 
                            }}>
                                <Typography variant="h6">{t('noPostsYet')}</Typography>
                                <Typography variant="body2">
                                    {isOwner ? t('shareFirstPost') : "This user hasn't posted anything yet."}
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default Profile;