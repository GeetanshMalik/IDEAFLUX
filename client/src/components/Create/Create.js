import React, { useState } from 'react';
import { Container, Grow, Paper, Typography } from '@mui/material';
import Form from '../Form/Form';

const Create = () => {
    const [currentId, setCurrentId] = useState(null);

    return (
        <Grow in>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper elevation={0} sx={{ 
                    p: 4, 
                    borderRadius: '16px', 
                    bgcolor: '#0f172a', // Dark Background matching screenshot
                    color: 'white',
                    border: '1px solid #1e293b' 
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
                        Create New Post
                    </Typography>
                    
                    <Form currentId={currentId} setCurrentId={setCurrentId} />
                </Paper>
            </Container>
        </Grow>
    );
};

export default Create;