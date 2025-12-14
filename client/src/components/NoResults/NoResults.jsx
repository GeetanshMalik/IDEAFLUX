import React from 'react';
import { Paper, Typography } from '@mui/material';

const NoResults = () => {
  return (
    <Paper elevation={3} sx={{ padding: '20px', textAlign: 'center', mt: 2 }}>
      <Typography variant="h5" color="textSecondary">
        No blogs found. Try searching for something else or create the first one!
      </Typography>
    </Paper>
  );
};

export default NoResults;