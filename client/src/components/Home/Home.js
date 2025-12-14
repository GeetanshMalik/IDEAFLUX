import React, { useState, useEffect } from 'react';
import { Container, Grow, Grid, Box, Button, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { getPosts } from '../../actions/posts';
import Posts from '../Posts/Posts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const Home = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const dispatch = useDispatch();

  // Load posts immediately when user lands on Explore
  useEffect(() => {
    dispatch(getPosts(1));
  }, [dispatch]);

  return (
    <Grow in>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
            Explore
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button 
                variant={activeTab === 'recent' ? "contained" : "outlined"} 
                startIcon={<AccessTimeIcon />}
                onClick={() => setActiveTab('recent')}
                sx={{ borderColor: '#334155', color: activeTab === 'recent' ? 'white' : '#94a3b8', bgcolor: activeTab === 'recent' ? '#14b8a6' : 'transparent' }}
            >
                Recent
            </Button>
            <Button 
                variant={activeTab === 'trending' ? "contained" : "outlined"} 
                startIcon={<TrendingUpIcon />}
                onClick={() => setActiveTab('trending')}
                sx={{ borderColor: '#334155', color: activeTab === 'trending' ? 'white' : '#94a3b8', bgcolor: activeTab === 'trending' ? '#14b8a6' : 'transparent' }}
            >
                Trending
            </Button>
            <Button 
                variant={activeTab === 'popular' ? "contained" : "outlined"} 
                startIcon={<StarBorderIcon />}
                onClick={() => setActiveTab('popular')}
                sx={{ borderColor: '#334155', color: activeTab === 'popular' ? 'white' : '#94a3b8', bgcolor: activeTab === 'popular' ? '#14b8a6' : 'transparent' }}
            >
                Popular
            </Button>
        </Box>

        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Posts setCurrentId={() => {}} />
            </Grid>
        </Grid>
      </Container>
    </Grow>
  );
};

export default Home;