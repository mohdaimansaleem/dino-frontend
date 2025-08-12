import { createTheme, ThemeOptions } from '@mui/material/styles';

// Enhanced spacing system
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Professional shadow system
const shadows = {
  subtle: '0 1px 3px rgba(0, 0, 0, 0.08)',
  soft: '0 2px 8px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.12)',
  strong: '0 8px 24px rgba(0, 0, 0, 0.15)',
  intense: '0 12px 32px rgba(0, 0, 0, 0.18)',
};

// Common theme configuration with enhanced professional design
const commonTheme = {
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    fontWeightExtraBold: 700,
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '0em',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      letterSpacing: '0.01em',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },
    overline: {
      fontWeight: 600,
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 8, // More conservative for professional look
  },
  spacing: (factor: number) => `${spacing.xs * factor}px`,
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      professional: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          transition: 'background-color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
        body: {
          transition: 'background-color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          scrollBehavior: 'smooth',
        },
        html: {
          scrollBehavior: 'smooth',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: 1.4,
          letterSpacing: '0.02em',
          textTransform: 'none' as const,
          minHeight: 40,
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
          minHeight: 32,
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '0.9375rem',
          minHeight: 48,
        },
        contained: {
          boxShadow: shadows.soft,
          '&:hover': {
            boxShadow: shadows.medium,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: shadows.subtle,
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            transform: 'translateY(-1px)',
            boxShadow: shadows.subtle,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        text: {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.08)',
          boxShadow: shadows.subtle,
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: shadows.medium,
            borderColor: 'rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
        elevation1: {
          boxShadow: shadows.subtle,
        },
        elevation2: {
          boxShadow: shadows.soft,
        },
        elevation4: {
          boxShadow: shadows.medium,
        },
        elevation8: {
          boxShadow: shadows.strong,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.8125rem',
          height: 28,
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            transform: 'scale(1.02)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        sizeSmall: {
          height: 24,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            backgroundColor: '#ffffff',
            fontSize: '0.875rem',
            '& input': {
              color: '#1a1a1a',
              fontSize: '0.875rem',
              fontWeight: 400,
              padding: '12px 14px',
              '&::placeholder': {
                color: '#666666',
                opacity: 1,
              },
              '&:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                WebkitTextFillColor: '#1a1a1a',
              },
            },
            '& textarea': {
              color: '#1a1a1a',
              fontSize: '0.875rem',
              fontWeight: 400,
            },
            '& fieldset': {
              borderColor: '#e0e0e0',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#1976d2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
              borderWidth: '2px',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
            },
            '&.Mui-error fieldset': {
              borderColor: '#d32f2f',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#1976d2',
            },
            '&.Mui-error': {
              color: '#d32f2f',
            },
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            marginTop: 4,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          minHeight: 40,
          transition: 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.16)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: shadows.strong,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 44,
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiSnackbarContent-root': {
            borderRadius: 8,
            fontSize: '0.875rem',
          },
        },
      },
    },
  },
};

// Professional light theme configuration
const lightThemeOptions: ThemeOptions = {
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0', // Professional blue
      light: '#1976d2',
      dark: '#0d47a1',
      contrastText: '#ffffff',
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#1565c0',
      600: '#1976d2',
      700: '#1565c0',
      800: '#0d47a1',
      900: '#0a3d91',
    },
    secondary: {
      main: '#c62828', // Professional red
      light: '#d32f2f',
      dark: '#b71c1c',
      contrastText: '#ffffff',
      50: '#ffebee',
      100: '#ffcdd2',
      200: '#ef9a9a',
      300: '#e57373',
      400: '#ef5350',
      500: '#c62828',
      600: '#d32f2f',
      700: '#c62828',
      800: '#b71c1c',
      900: '#a31515',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
      50: '#e8f5e8',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: '#2e7d32',
      600: '#4caf50',
      700: '#2e7d32',
      800: '#1b5e20',
      900: '#0f4c0f',
    },
    warning: {
      main: '#f57c00',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff',
      50: '#fff3e0',
      100: '#ffe0b2',
      200: '#ffcc80',
      300: '#ffb74d',
      400: '#ffa726',
      500: '#f57c00',
      600: '#ff9800',
      700: '#f57c00',
      800: '#e65100',
      900: '#cc4400',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#ffffff',
      50: '#ffebee',
      100: '#ffcdd2',
      200: '#ef9a9a',
      300: '#e57373',
      400: '#ef5350',
      500: '#d32f2f',
      600: '#f44336',
      700: '#d32f2f',
      800: '#c62828',
      900: '#b71c1c',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#ffffff',
      50: '#e1f5fe',
      100: '#b3e5fc',
      200: '#81d4fa',
      300: '#4fc3f7',
      400: '#29b6f6',
      500: '#0288d1',
      600: '#03a9f4',
      700: '#0288d1',
      800: '#01579b',
      900: '#014477',
    },
    background: {
      default: '#f8fafc', // Slightly cooler white
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Professional dark gray
      secondary: '#64748b', // Balanced secondary text
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
    action: {
      hover: 'rgba(21, 101, 192, 0.04)',
      selected: 'rgba(21, 101, 192, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      focus: 'rgba(21, 101, 192, 0.12)',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
};

// Professional dark theme configuration
const darkThemeOptions: ThemeOptions = {
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Professional blue for dark mode
      light: '#93c5fd',
      dark: '#3b82f6',
      contrastText: '#0f172a',
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      main: '#f87171', // Professional red for dark mode
      light: '#fca5a5',
      dark: '#ef4444',
      contrastText: '#0f172a',
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    success: {
      main: '#4ade80',
      light: '#86efac',
      dark: '#22c55e',
      contrastText: '#0f172a',
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#f59e0b',
      contrastText: '#0f172a',
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#ef4444',
      contrastText: '#0f172a',
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      main: '#38bdf8',
      light: '#7dd3fc',
      dark: '#0ea5e9',
      contrastText: '#0f172a',
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    background: {
      default: '#0f172a', // Professional dark background
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
    divider: '#334155',
    action: {
      hover: 'rgba(96, 165, 250, 0.08)',
      selected: 'rgba(96, 165, 250, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      focus: 'rgba(96, 165, 250, 0.16)',
    },
    grey: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
  },
  components: {
    ...commonTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#475569',
            backgroundColor: '#334155',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
        },
        elevation4: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        },
        elevation8: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 500,
          fontSize: '0.875rem',
          lineHeight: 1.4,
          letterSpacing: '0.02em',
          textTransform: 'none' as const,
          minHeight: 40,
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
          },
        },
        outlined: {
          borderColor: '#475569',
          borderWidth: '1.5px',
          '&:hover': {
            borderColor: '#60a5fa',
            borderWidth: '1.5px',
            backgroundColor: 'rgba(96, 165, 250, 0.08)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(96, 165, 250, 0.08)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            backgroundColor: '#334155',
            fontSize: '0.875rem',
            '& input': {
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: 400,
              padding: '12px 14px',
              '&::placeholder': {
                color: '#94a3b8',
                opacity: 1,
              },
              '&:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 1000px #334155 inset',
                WebkitTextFillColor: '#f1f5f9',
              },
            },
            '& textarea': {
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: 400,
            },
            '& fieldset': {
              borderColor: '#475569',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#60a5fa',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#60a5fa',
              borderWidth: '2px',
            },
            '&.Mui-focused': {
              backgroundColor: '#334155',
            },
            '&.Mui-error fieldset': {
              borderColor: '#f87171',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94a3b8',
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#60a5fa',
            },
            '&.Mui-error': {
              color: '#f87171',
            },
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem',
            marginTop: 4,
            color: '#94a3b8',
            '&.Mui-error': {
              color: '#f87171',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#475569',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#60a5fa',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#60a5fa',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          minHeight: 40,
          color: '#f1f5f9',
          '&:hover': {
            backgroundColor: 'rgba(96, 165, 250, 0.12)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(96, 165, 250, 0.16)',
            '&:hover': {
              backgroundColor: 'rgba(96, 165, 250, 0.2)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#334155',
          color: '#f1f5f9',
          '&:hover': {
            backgroundColor: '#475569',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&:hover': {
            backgroundColor: 'rgba(96, 165, 250, 0.08)',
            color: '#60a5fa',
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

export type ThemeMode = 'light' | 'dark';