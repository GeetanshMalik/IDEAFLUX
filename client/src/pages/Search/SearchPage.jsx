import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Grid, Typography, Box, Paper, Avatar, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPostsBySearch } from '../../actions/posts';
import * as api from '../../api'; 
import Posts from '../../components/Posts/Posts';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const [search, setSearch] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = useQuery();
  const location = useLocation();

  // 🔄 1. AUTO-SEARCH LOGIC (Fixes blank page)
  useEffect(() => {
    const searchQuery = query.get('searchQuery');
    if (searchQuery) {
        setSearch(searchQuery);
        setHasSearched(true);
        executeSearch(searchQuery);
    }
  }, [location]); 

  const executeSearch = async (searchTerm) => {
      dispatch(getPostsBySearch({ search: searchTerm, tags: '' })); 
      try {
        const { data } = await api.searchUsers(searchTerm);
        setFoundUsers(data);
      } catch (error) {
        console.log(error);
      }
  };

  const handleSearchBtn = () => {
    if (search.trim()) {
      navigate(`/posts/search?searchQuery=${search || 'none'}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearchBtn();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* HEADER SECTION (Matching your design) */}
        <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
            Discover
        </Typography>
        
        <Typography variant="subtitle1" sx={{ color: '#94a3b8', fontStyle: 'italic', mb: 4 }}>
            "Find people, stories, and ideas that matter to you."
        </Typography>

        {/* SEARCH BAR (Matching your design) */}
        <Box sx={{ width: '100%', maxWidth: '600px', mb: 6 }}>
            <TextField 
                fullWidth 
                variant="outlined" 
                placeholder="Search by Name, Title, or #Tag..."
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                onKeyDown={handleKeyPress}
                sx={{ 
                    bgcolor: '#1e293b', 
                    borderRadius: '8px', 
                    '& .MuiOutlinedInput-root': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#334155' }
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <Button 
                                onClick={handleSearchBtn} 
                                variant="contained"
                                sx={{ 
                                    bgcolor: '#14b8a6', 
                                    color: 'white', 
                                    minWidth: '50px',
                                    height: '40px',
                                    borderRadius: '6px',
                                    '&:hover': { bgcolor: '#0d9488' }
                                }}
                            >
                                <SearchIcon />
                            </Button>
                        </InputAdornment>
                    )
                }}
            />
        </Box>

        {/* RESULTS SECTION */}
        {hasSearched ? (
            <Box sx={{ width: '100%' }}>
                {/* Users Found */}
                {foundUsers.length > 0 && (
                    <Box mb={5}>
                        <Typography variant="h5" color="white" fontWeight="bold" mb={2}>People Found</Typography>
                        <Grid container spacing={2}>
                            {foundUsers.map((user) => (
                                <Grid item key={user._id} xs={12} sm={6}>
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

                {/* Posts Found */}
                <Box>
                    <Typography variant="h5" color="white" fontWeight="bold" mb={2} sx={{ borderBottom: '1px solid #334155', pb: 1 }}>
                        Posts
                    </Typography>
                    <Posts setCurrentId={() => {}} />
                </Box>
            </Box>
        ) : null}
    </Container>
  );
};

export default SearchPage;
