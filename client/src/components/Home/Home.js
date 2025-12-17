import React, { useState, useEffect } from 'react';
import { Container, Grow, Grid, Box, Button, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts } from '../../actions/posts';
import Posts from '../Posts/Posts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { colors, commonStyles } from '../../theme/globalTheme';

const Home = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const [currentId, setCurrentId] = useState(null);
  const dispatch = useDispatch();
  const { posts, isLoading } = useSelector((state) => state.posts);

  // Load posts when tab changes - load more posts
  useEffect(() => {
    dispatch(getPosts(1, activeTab, 50)); // Load 50 posts at once
  }, [dispatch, activeTab]);

  // Auto-refresh trending posts every 30 seconds to show like changes
  useEffect(() => {
    if (activeTab === 'trending') {
      const interval = setInterval(() => {
        dispatch(getPosts(1, activeTab, 50));
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, dispatch]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getButtonStyle = (tab) => ({
    ...commonStyles.button[activeTab === tab ? 'primary' : 'ghost'],
    borderRadius: 2,
    px: 3,
    py: 1,
    fontWeight: 600,
    textTransform: 'none',
    minWidth: 'auto'
  });

  return (
    <Box sx={commonStyles.container}>
      <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            mb: 4, 
            color: colors.textPrimary,
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Explore
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4,
          justifyContent: { xs: 'center', md: 'flex-start' },
          flexWrap: 'wrap'
        }}>
          <Button 
            variant={activeTab === 'recent' ? "contained" : "outlined"} 
            startIcon={<AccessTimeIcon />}
            onClick={() => handleTabChange('recent')}
            sx={getButtonStyle('recent')}
          >
            Recent
          </Button>
          <Button 
            variant={activeTab === 'trending' ? "contained" : "outlined"} 
            startIcon={<TrendingUpIcon />}
            onClick={() => {
              handleTabChange('trending');
              // Immediately refresh when clicking trending
              setTimeout(() => dispatch(getPosts(1, 'trending', 50)), 100);
            }}
            sx={getButtonStyle('trending')}
          >
            Trending
          </Button>

        </Box>

        <Grow in>
          <Box sx={{ width: '100%' }}>
            <Posts setCurrentId={setCurrentId} />
          </Box>
        </Grow>
      </Container>
    </Box>
  );
};

export default Home;