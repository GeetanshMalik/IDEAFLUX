import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#14b8a6', // The Teal color from your screenshots
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a', // Deep Navy background
      paper: '#1e293b',   // Lighter Navy for cards
    },
    text: {
      primary: '#f1f5f9', // White/Grey text
      secondary: '#94a3b8', // Muted text
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }, // No CAPS buttons
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 20px',
        },
        containedPrimary: {
            color: 'white',
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '12px', // Rounded corners
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f172a', 
          boxShadow: 'none',
          borderBottom: '1px solid #1e293b',
        },
      },
    },
  },
});