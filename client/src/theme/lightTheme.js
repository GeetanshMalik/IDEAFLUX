import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00BFFF', // Sky Blue
    },
    background: {
      default: '#f5f5f5',
    },
  },
});