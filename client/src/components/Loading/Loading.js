import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '200px',
        gap: 2
      }}
    >
      <CircularProgress sx={{ color: '#14b8a6' }} />
      <Typography variant="body1" sx={{ color: '#94a3b8' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;