import React from 'react';
import { Container, Grow } from '@mui/material';
import Chat from './Chat'; // The main chat logic file I gave you earlier

const ChatPage = () => {
  return (
    <Grow in>
      <Container maxWidth="xl" sx={{ paddingTop: '20px', paddingBottom: '20px' }}>
        {/* We render the complex Chat layout here */}
        <Chat />
      </Container>
    </Grow>
  );
};

export default ChatPage;