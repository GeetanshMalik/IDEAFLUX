import React, { useState } from 'react';
import { Container, Grow, Paper, Typography, Box } from '@mui/material';
import Form from '../Form/Form';
import { colors, commonStyles } from '../../theme/globalTheme';

const Create = () => {
    const [currentId, setCurrentId] = useState(null);

    return (
        <Box sx={commonStyles.container}>
            <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
                <Grow in>
                    <Paper sx={{ 
                        ...commonStyles.card,
                        p: 4
                    }}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 700, 
                                mb: 4, 
                                color: colors.textPrimary,
                                textAlign: 'center'
                            }}
                        >
                            Create New Post
                        </Typography>
                        
                        <Form currentId={currentId} setCurrentId={setCurrentId} />
                    </Paper>
                </Grow>
            </Container>
        </Box>
    );
};

export default Create;