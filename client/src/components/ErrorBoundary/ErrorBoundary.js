import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
          <Box sx={{ 
            bgcolor: '#1e293b', 
            borderRadius: 2, 
            p: 4, 
            border: '1px solid #334155' 
          }}>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: '#ef4444', mb: 2 }} />
            
            <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              Oops! Something went wrong
            </Typography>
            
            <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
              We encountered an unexpected error. Don't worry, our team has been notified.
            </Typography>

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.handleRefresh}
              sx={{
                bgcolor: '#14b8a6',
                '&:hover': { bgcolor: '#0d9488' },
                px: 4,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Refresh Page
            </Button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ 
                mt: 4, 
                p: 2, 
                bgcolor: '#0f172a', 
                borderRadius: 1, 
                textAlign: 'left',
                border: '1px solid #ef4444'
              }}>
                <Typography variant="h6" sx={{ color: '#ef4444', mb: 1 }}>
                  Development Error Details:
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#94a3b8', 
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;