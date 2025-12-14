import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Grid, Avatar, Button, Box, Divider, CircularProgress, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FileBase from 'react-file-base64';
import moment from 'moment';

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
    const [formData, setFormData] = useState({ name: '', bio: '', dob: '', picture: '' });

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
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper elevation={0} sx={{ p: 0, borderRadius: '16px', bgcolor: '#1e293b', color: 'white', border: '1px solid #334155', overflow: 'hidden' }}>
                
                {/* 1. BANNER AREA */}
                <Box sx={{ height: '150px', background: 'linear-gradient(90deg, #0f172a 0%, #14b8a6 100%)' }} />

                <Box sx={{ px: 4, pb: 4 }}>
                    <Grid container spacing={2}>
                        
                        {/* 2. AVATAR */}
                        <Grid item xs={12} sm={3} sx={{ display: 'flex', justifyContent: 'center', mt: -8 }}>
                            <Box position="relative">
                                <Avatar 
                                    src={isEditing ? formData.picture : userProfile.picture} 
                                    alt={userProfile.name} 
                                    sx={{ width: 160, height: 160, fontSize: '4rem', bgcolor: '#0f172a', border: '5px solid #1e293b' }}
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
                                            label="Display Name"
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            sx={{ bgcolor: '#0f172a', mb: 1, borderRadius: '8px', input: { color: 'white' } }}
                                        />
                                    ) : (
                                        <Typography variant="h3" fontWeight="bold">{userProfile.name}</Typography>
                                    )}
                                    <Typography variant="body1" sx={{ color: '#94a3b8' }}>{userProfile.email}</Typography>
                                </Box>

                                {/* BUTTONS */}
                                <Box sx={{ mt: 1 }}>
                                    {isOwner ? (
                                        isEditing ? (
                                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleUpdateProfile} sx={{ bgcolor: '#14b8a6', fontWeight: 'bold' }}>
                                                Save Profile
                                            </Button>
                                        ) : (
                                            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setIsEditing(true)} sx={{ borderColor: '#94a3b8', color: '#94a3b8' }}>
                                                Edit Profile
                                            </Button>
                                        )
                                    ) : (
                                        <Box display="flex" gap={2}>
                                            <Button 
                                                variant="contained" 
                                                onClick={handleFollow}
                                                startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                                                sx={{ bgcolor: isFollowing ? '#334155' : '#14b8a6', color: 'white', fontWeight: 'bold' }}
                                            >
                                                {isFollowing ? 'Unfollow' : 'Follow'}
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                onClick={handleMessage}
                                                startIcon={<MessageIcon />}
                                                sx={{ borderColor: '#14b8a6', color: '#14b8a6', fontWeight: 'bold' }}
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
                                            multiline rows={3}
                                            value={formData.bio} 
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                            sx={{ bgcolor: '#0f172a', borderRadius: '8px', textarea: { color: 'white' }, label: {color: 'grey'} }}
                                        />
                                        <TextField 
                                            label="Date of Birth"
                                            type="date"
                                            value={formData.dob} 
                                            onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ bgcolor: '#0f172a', borderRadius: '8px', input: { color: 'white' }, label: {color: 'grey'} }}
                                        />
                                    </Box>
                                ) : (
                                    <>
                                        <Typography variant="body1" sx={{ color: '#e2e8f0', mb: 2, whiteSpace: 'pre-line' }}>
                                            {userProfile.bio || "No bio yet."}
                                        </Typography>
                                        
                                        {userProfile.dob && (
                                            <Box display="flex" alignItems="center" gap={1} sx={{ color: '#94a3b8', bgcolor: '#0f172a', width: 'fit-content', px: 2, py: 0.5, borderRadius: '20px' }}>
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
                            <Box display="flex" gap={4} mt={3} pt={2} borderTop="1px solid #334155">
                                <Box textAlign="center">
                                    <Typography variant="h6" fontWeight="bold">{userPosts.length}</Typography>
                                    <Typography variant="caption" color="#94a3b8">Posts</Typography>
                                </Box>
                                <Box textAlign="center">
                                    <Typography variant="h6" fontWeight="bold">{userProfile.followers?.length || 0}</Typography>
                                    <Typography variant="caption" color="#94a3b8">Followers</Typography>
                                </Box>
                                <Box textAlign="center">
                                    <Typography variant="h6" fontWeight="bold">{userProfile.following?.length || 0}</Typography>
                                    <Typography variant="caption" color="#94a3b8">Following</Typography>
                                </Box>
                            </Box>

                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* POSTS FEED */}
            <Typography variant="h5" sx={{ mt: 5, mb: 3, fontWeight: 'bold', color: 'white' }}>Recent Activity</Typography>
            <Grid container spacing={3}>
                {userPosts.map((post) => (
                    <Grid item key={post._id} xs={12} sm={6} md={4}>
                        <Post post={post} setCurrentId={() => {}} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Profile;