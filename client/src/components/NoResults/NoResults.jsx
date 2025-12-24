import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useLanguage } from '../../context/LanguageProvider';

const NoResults = () => {
  const { t } = useLanguage();
  
  return (
    <Paper elevation={3} sx={{ padding: '20px', textAlign: 'center', mt: 2 }}>
      <Typography variant="h5" color="textSecondary">
        {t('noBlogsFound')}
      </Typography>
    </Paper>
  );
};

export default NoResults;