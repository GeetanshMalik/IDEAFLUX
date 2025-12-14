import React, { useState } from 'react';
import { Container, TextField, Button, Grid, Typography, Box, Paper, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getPostsBySearch } from '../../actions/posts';
import * as api from '../../api'; 
import Posts from '../../components/Posts/Posts';

const SearchPage = () => {
  const [search, setSearch] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // 🛑 Controls visibility
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (search.trim()) {
      setHasSearched(true); // Reveal results
      
      // 1. Search Posts (By Title OR Tags via Backend update)
      // Note: We send 'tags' as empty string because we handle logic in backend now
      dispatch(getPostsBySearch({ search, tags: '' })); 
      
      // 2. Search Users
      try {
        const { data } = await api.searchUsers(search);
        setFoundUsers(data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
        {/* TOP SECTION: Only this is visible initially */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                Discover
            </Typography>
            
            {/* 🛑 NEW: Fancy Tagline */}
            <Typography variant="h6" sx={{ color: '#94a3b8', mb: 4, fontStyle: 'italic' }}>
                "Find people, stories, and ideas that matter to you."
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', maxWidth: '600px', mx: 'auto' }}>
                <TextField 
                    fullWidth variant="outlined" 
                    placeholder="Search by Name, Title, or #Tag..."
                    value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyPress}
                    sx={{ bgcolor: '#1e293b', borderRadius: '12px', input: { color: 'white' } }}
                    InputProps={{
                        endAdornment: (
                            <Button onClick={handleSearch} sx={{ bgcolor: '#14b8a6', color: 'white', px: 3 }}>
                                <SearchIcon />
                            </Button>
                        )
                    }}
                />
            </Box>
        </Box>

        {/* RESULTS SECTION: Only visible AFTER search */}
        {hasSearched && (
            <>
                {/* 1. USERS FOUND */}
                {foundUsers.length > 0 && (
                    <Box mb={5}>
                        <Typography variant="h5" color="white" fontWeight="bold" mb={2}>People Found</Typography>
                        <Grid container spacing={2}>
                            {foundUsers.map((user) => (
                                <Grid item key={user._id} xs={12} sm={6} md={4}>
                                    <Paper 
                                        onClick={() => navigate(`/profile/${user._id}`)}
                                        sx={{ 
                                            p: 2, display: 'flex', alignItems: 'center', gap: 2, 
                                            bgcolor: '#1e293b', cursor: 'pointer',
                                            '&:hover': { bgcolor: '#334155' }
                                        }}
                                    >
                                        <Avatar src={user.picture} alt={user.name}>{user.name.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" color="white" fontWeight="bold">{user.name}</Typography>
                                            <Typography variant="caption" color="#94a3b8">{user.email}</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* 2. POSTS FOUND (Titles or Tags) */}
                <Box>
                    <Typography variant="h5" color="white" fontWeight="bold" mb={2}>Posts Found</Typography>
                    <Posts setCurrentId={() => {}} />
                </Box>
            </>
        )}
    </Container>
  );
};

export default SearchPage;