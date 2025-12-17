// Global Theme Configuration with Limited Color Palette
export const colors = {
  // Primary Colors (4 main colors)
  primary: '#14b8a6',      // Teal - Main brand color
  secondary: '#6366f1',    // Indigo - Secondary actions
  accent: '#f59e0b',       // Amber - Highlights and warnings
  danger: '#ef4444',       // Red - Errors and delete actions
  
  // Neutral Colors (Grayscale)
  dark: '#0f172a',         // Darkest background
  darkSecondary: '#1e293b', // Card backgrounds
  darkTertiary: '#334155',  // Borders and dividers
  
  // Text Colors
  textPrimary: '#ffffff',   // Primary text
  textSecondary: '#94a3b8', // Secondary text
  textMuted: '#64748b',     // Muted text
  
  // Status Colors
  success: '#10b981',       // Success states
  warning: '#f59e0b',       // Warning states
  info: '#3b82f6',         // Info states
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: `0 0 20px ${colors.primary}40`,
};

export const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Common component styles
export const commonStyles = {
  card: {
    backgroundColor: colors.darkSecondary,
    border: `1px solid ${colors.darkTertiary}`,
    borderRadius: borderRadius.lg,
    color: colors.textPrimary,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadows.lg,
      borderColor: colors.primary,
    },
  },
  
  button: {
    primary: {
      backgroundColor: colors.primary,
      color: colors.textPrimary,
      '&:hover': {
        backgroundColor: '#0d9488',
        boxShadow: shadows.glow,
      },
    },
    secondary: {
      backgroundColor: colors.secondary,
      color: colors.textPrimary,
      '&:hover': {
        backgroundColor: '#5b21b6',
      },
    },
    danger: {
      backgroundColor: colors.danger,
      color: colors.textPrimary,
      '&:hover': {
        backgroundColor: '#dc2626',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.textSecondary,
      border: `1px solid ${colors.darkTertiary}`,
      '&:hover': {
        backgroundColor: colors.darkTertiary,
        color: colors.textPrimary,
      },
    },
  },
  
  input: {
    backgroundColor: colors.darkSecondary,
    border: `1px solid ${colors.darkTertiary}`,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
    '&:focus': {
      borderColor: colors.primary,
      boxShadow: `0 0 0 3px ${colors.primary}20`,
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: colors.darkTertiary },
      '&:hover fieldset': { borderColor: colors.primary },
      '&.Mui-focused fieldset': { borderColor: colors.primary },
    },
    '& .MuiInputLabel-root': { color: colors.textSecondary },
    '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
  },
  
  container: {
    backgroundColor: colors.dark,
    minHeight: '100vh',
    color: colors.textPrimary,
  },
  
  navbar: {
    backgroundColor: colors.dark,
    borderBottom: `1px solid ${colors.darkTertiary}`,
    backdropFilter: 'blur(10px)',
  },
  
  sidebar: {
    backgroundColor: colors.darkSecondary,
    borderRight: `1px solid ${colors.darkTertiary}`,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  commonStyles,
};