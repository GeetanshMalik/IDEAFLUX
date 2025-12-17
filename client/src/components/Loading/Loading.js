import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

// Main loading spinner
export const LoadingSpinner = ({ message = "Loading...", size = 40 }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    minHeight: '200px',
    gap: 2
  }}>
    <CircularProgress 
      size={size} 
      sx={{ color: '#14b8a6' }} 
    />
    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
      {message}
    </Typography>
  </Box>
);

// Post card skeleton loader
export const PostSkeleton = () => (
  <Box sx={{ 
    bgcolor: '#1e293b', 
    borderRadius: 2, 
    p: 3, 
    border: '1px solid #334155',
    mb: 2
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Skeleton 
        variant="circular" 
        width={40} 
        height={40} 
        sx={{ bgcolor: '#334155', mr: 2 }} 
      />
      <Box sx={{ flex: 1 }}>
        <Skeleton 
          variant="text" 
          width="30%" 
          height={20} 
          sx={{ bgcolor: '#334155', mb: 0.5 }} 
        />
        <Skeleton 
          variant="text" 
          width="20%" 
          height={16} 
          sx={{ bgcolor: '#334155' }} 
        />
      </Box>
    </Box>
    
    <Skeleton 
      variant="text" 
      width="80%" 
      height={24} 
      sx={{ bgcolor: '#334155', mb: 1 }} 
    />
    <Skeleton 
      variant="text" 
      width="60%" 
      height={20} 
      sx={{ bgcolor: '#334155', mb: 2 }} 
    />
    
    <Skeleton 
      variant="rectangular" 
      width="100%" 
      height={200} 
      sx={{ bgcolor: '#334155', borderRadius: 1, mb: 2 }} 
    />
    
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Skeleton 
        variant="rectangular" 
        width={60} 
        height={24} 
        sx={{ bgcolor: '#334155', borderRadius: 1 }} 
      />
      <Skeleton 
        variant="rectangular" 
        width={80} 
        height={24} 
        sx={{ bgcolor: '#334155', borderRadius: 1 }} 
      />
    </Box>
  </Box>
);

// Multiple post skeletons
export const PostListSkeleton = ({ count = 3 }) => (
  <Box>
    {Array.from({ length: count }).map((_, index) => (
      <PostSkeleton key={index} />
    ))}
  </Box>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <Box sx={{ 
    bgcolor: '#1e293b', 
    borderRadius: 2, 
    p: 4, 
    border: '1px solid #334155',
    textAlign: 'center'
  }}>
    <Skeleton 
      variant="circular" 
      width={120} 
      height={120} 
      sx={{ bgcolor: '#334155', mx: 'auto', mb: 2 }} 
    />
    <Skeleton 
      variant="text" 
      width="40%" 
      height={32} 
      sx={{ bgcolor: '#334155', mx: 'auto', mb: 1 }} 
    />
    <Skeleton 
      variant="text" 
      width="60%" 
      height={20} 
      sx={{ bgcolor: '#334155', mx: 'auto', mb: 3 }} 
    />
    
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Box key={index} sx={{ textAlign: 'center' }}>
          <Skeleton 
            variant="text" 
            width={40} 
            height={24} 
            sx={{ bgcolor: '#334155', mx: 'auto' }} 
          />
          <Skeleton 
            variant="text" 
            width={60} 
            height={16} 
            sx={{ bgcolor: '#334155', mx: 'auto' }} 
          />
        </Box>
      ))}
    </Box>
    
    <Skeleton 
      variant="rectangular" 
      width="100%" 
      height={40} 
      sx={{ bgcolor: '#334155', borderRadius: 1 }} 
    />
  </Box>
);

export default LoadingSpinner;