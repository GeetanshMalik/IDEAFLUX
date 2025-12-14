import React, { createContext } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../theme/darkTheme'; // We only import dark now

export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  // We no longer need state because it is always dark.
  const theme = darkTheme;

  return (
    <ThemeContext.Provider value={{ theme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};