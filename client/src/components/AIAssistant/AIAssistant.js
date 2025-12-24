import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Fade,
  Divider
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Send as SendIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Person as UserIcon,
  AutoAwesome as SparkleIcon,
  Create as WriteIcon,
  Lightbulb as IdeaIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import { colors, commonStyles } from '../../theme/globalTheme';
import { useLanguage } from '../../context/LanguageProvider';

const AIAssistant = () => {
  const { t } = useLanguage();
  
  const [messages, setMessages] = useState([{
    id: 1,
    type: 'ai',
    content: t('aiGreeting'),
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    {
      icon: <WriteIcon />,
      label: t('writeCaption'),
      prompt: 'Help me write an engaging caption for my social media post about'
    },
    {
      icon: <IdeaIcon />,
      label: t('suggestTopics'),
      prompt: 'Suggest 5 trending post topics for my blog about'
    },
    {
      icon: <BrainIcon />,
      label: t('improveContent'),
      prompt: 'Help me improve and make this content more engaging:'
    },
    {
      icon: <SparkleIcon />,
      label: t('creativeIdeas'),
      prompt: 'Give me creative content ideas for'
    }
  ];

  const callGroqAPI = async (prompt) => {
    try {
      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      
      if (!apiKey) {
        throw new Error('GROQ API key not configured. Please restart your development server after adding the key to .env file.');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [{
            role: "system",
            content: "You are a helpful AI assistant for a social media platform called IdeaFlux. Help users create engaging content, write captions, suggest topics, and improve their writing. Keep responses concise, creative, and actionable."
          }, {
            role: "user",
            content: prompt
          }],
          model: "llama-3.1-8b-instant",
          stream: false,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Failed to get AI response'}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
      console.error('GROQ API Error:', error);
      throw new Error(error.message || 'Failed to connect to AI service. Please try again.');
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const aiResponse = await callGroqAPI(input.trim());
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt + ' ');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      type: 'ai',
      content: "Chat cleared! I'm ready to help you with new content. What would you like to create?",
      timestamp: new Date()
    }]);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 150px)' }}>
        {/* Sidebar with Quick Prompts */}
        <Paper sx={{ 
          ...commonStyles.card, 
          width: { xs: '100%', md: '300px' }, 
          p: 3,
          display: { xs: 'none', md: 'block' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AIIcon sx={{ color: colors.primary, mr: 1 }} />
            <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
              {t('quickActions')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outlined"
                startIcon={prompt.icon}
                onClick={() => handleQuickPrompt(prompt.prompt)}
                sx={{
                  ...commonStyles.button.ghost,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  p: 2
                }}
              >
                {prompt.label}
              </Button>
            ))}
          </Box>
          
          <Divider sx={{ my: 3, borderColor: colors.darkTertiary }} />
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={clearChat}
            fullWidth
            sx={commonStyles.button.ghost}
          >
            {t('clearChat')}
          </Button>
        </Paper>

        {/* Main Chat Area */}
        <Paper sx={{ 
          ...commonStyles.card, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            borderBottom: `1px solid ${colors.darkTertiary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: colors.primary, mr: 2 }}>
                <AIIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: colors.textPrimary, fontWeight: 600 }}>
                  {t('aiWritingAssistant')}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {t('poweredByGroq')}
                </Typography>
              </Box>
            </Box>
            <Chip 
              label="Online" 
              size="small" 
              sx={{ 
                bgcolor: colors.success, 
                color: 'white',
                '& .MuiChip-label': { fontWeight: 600 }
              }} 
            />
          </Box>

          {/* Messages */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {messages.map((message) => (
              <Fade in={true} key={message.id}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}>
                  <Box sx={{ 
                    maxWidth: '80%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: message.type === 'user' ? colors.secondary : colors.primary,
                      width: 32,
                      height: 32
                    }}>
                      {message.type === 'user' ? <UserIcon /> : <AIIcon />}
                    </Avatar>
                    
                    <Paper sx={{
                      p: 2,
                      bgcolor: message.type === 'user' ? colors.secondary : colors.darkSecondary,
                      border: `1px solid ${message.type === 'user' ? colors.secondary : colors.darkTertiary}`,
                      borderRadius: 2,
                      position: 'relative'
                    }}>
                      <Typography variant="body1" sx={{ 
                        color: colors.textPrimary,
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.6
                      }}>
                        {message.content}
                      </Typography>
                      
                      {message.type === 'ai' && (
                        <Tooltip title="Copy to clipboard">
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(message.content)}
                            sx={{ 
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              color: colors.textMuted,
                              '&:hover': { color: colors.primary }
                            }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Paper>
                  </Box>
                </Box>
              </Fade>
            ))}
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: colors.primary, width: 32, height: 32 }}>
                    <AIIcon />
                  </Avatar>
                  <Paper sx={{
                    p: 2,
                    bgcolor: colors.darkSecondary,
                    border: `1px solid ${colors.darkTertiary}`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CircularProgress size={16} sx={{ color: colors.primary }} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {t('aiThinking')}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Error Alert */}
          {error && (
            <Box sx={{ p: 2 }}>
              <Alert 
                severity="error" 
                onClose={() => setError('')}
                sx={{ bgcolor: colors.danger, color: 'white' }}
              >
                {error}
              </Alert>
            </Box>
          )}

          {/* Input Area */}
          <Box sx={{ 
            p: 3, 
            borderTop: `1px solid ${colors.darkTertiary}`,
            display: 'flex',
            gap: 2,
            alignItems: 'flex-end'
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('askMeToHelp')}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: colors.darkSecondary,
                  color: colors.textPrimary,
                  '& fieldset': {
                    borderColor: colors.darkTertiary,
                  },
                  '&:hover fieldset': {
                    borderColor: colors.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.primary,
                  },
                },
                '& .MuiInputBase-input': {
                  color: colors.textPrimary,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: colors.textMuted,
                  opacity: 1,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{
                ...commonStyles.button.primary,
                minWidth: 'auto',
                p: 1.5,
                borderRadius: 2
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AIAssistant;