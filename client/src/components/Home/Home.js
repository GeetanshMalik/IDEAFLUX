import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grow, Grid, Box, Button, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts } from '../../actions/posts';
import Posts from '../Posts/Posts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLanguage } from '../../context/LanguageProvider';

import { colors, commonStyles } from '../../theme/globalTheme';

const Home = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('recent');
  const [currentId, setCurrentId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { posts, isLoading } = useSelector((state) => state.posts);

  // Memoized refresh function
  const refreshPosts = useCallback(async (tab = activeTab, showLoader = false) => {
    if (showLoader) setRefreshing(true);
    try {
      await dispatch(getPosts(1, tab, 50));
    } finally {
      if (showLoader) setRefreshing(false);
    }
  }, [dispatch, activeTab]);

  // Load posts when tab changes - immediate load
  useEffect(() => {
    refreshPosts(activeTab, true);
  }, [activeTab]);

  // Auto-refresh trending posts every 30 seconds
  useEffect(() => {
    if (activeTab === 'trending') {
      const interval = setInterval(() => {
        refreshPosts('trending', false); // Silent refresh
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [activeTab, refreshPosts]);

  // Listen for new posts created (from localStorage events or custom events)
  useEffect(() => {
    const handlePostCreated = () => {
      console.log('📝 New post detected, refreshing...');
      // Immediate refresh when new post is created
      refreshPosts(activeTab, false);
    };

    // Listen for custom post creation events
    window.addEventListener('post-created', handlePostCreated);
    
    // Also refresh when user comes back to the tab
    const handleVisibilityChange = () => {
      if (!document.hidden && activeTab) {
        refreshPosts(activeTab, false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('post-created', handlePostCreated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab, refreshPosts]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleManualRefresh = () => {
    refreshPosts(activeTab, true);
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
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: colors.textPrimary,
            }}
          >
            {t('explore')}
          </Typography>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleManualRefresh}
            disabled={refreshing}
            sx={{
              ...commonStyles.button.ghost,
              minWidth: 'auto',
              px: 2
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

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
            {t('recent')}
          </Button>
          <Button 
            variant={activeTab === 'trending' ? "contained" : "outlined"} 
            startIcon={<TrendingUpIcon />}
            onClick={() => handleTabChange('trending')}
            sx={getButtonStyle('trending')}
          >
            {t('trending')}
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