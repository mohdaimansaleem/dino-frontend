import { createTheme, ThemeOptions } from '@mui/material/styles';

// Common theme configuration
const commonTheme = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
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
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
        },
        body: {
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            backgroundColor: '#ffffff',
            '& input': {
              color: '#1a1a1a !important',
              fontSize: '1rem',
              fontWeight: 400,
              '&::placeholder': {
                color: '#666666 !important',
                opacity: 1,
              },
              '&:-webkit-autofill': {
                WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                WebkitTextFillColor: '#1a1a1a !important',
              },
            },
            '& textarea': {
              color: '#1a1a1a !important',
              fontSize: '1rem',
              fontWeight: 400,
            },
            '& fieldset': {
              borderColor: '#e0e0e0',
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
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            '&.Mui-focused': {
              color: '#1976d2',
            },
          },
        },
      },
    },
  },
};

// Light theme configuration
const lightThemeOptions: ThemeOptions = {
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    divider: '#e0e0e0',
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
};

// Dark theme configuration - Softer, warmer dark mode
const darkThemeOptions: ThemeOptions = {
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#7bb3f0',
      light: '#a8c8f5',
      dark: '#5a9bd4',
      contrastText: '#000000',
    },
    secondary: {
      main: '#e091a3',
      light: '#e8b4c2',
      dark: '#d16b85',
      contrastText: '#000000',
    },
    success: {
      main: '#81c784',
      light: '#a5d6a7',
      dark: '#66bb6a',
    },
    warning: {
      main: '#ffb74d',
      light: '#ffc947',
      dark: '#ffa726',
    },
    error: {
      main: '#ef5350',
      light: '#f28b8b',
      dark: '#e53935',
    },
    info: {
      main: '#4fc3f7',
      light: '#7dd3fc',
      dark: '#29b6f6',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#e8e8e8',
      secondary: '#a8a8a8',
    },
    divider: '#2a2a2a',
    grey: {
      50: '#1a1a1a',
      100: '#242424',
      200: '#2a2a2a',
      300: '#3a3a3a',
      400: '#4a4a4a',
      500: '#6a6a6a',
      600: '#8a8a8a',
      700: '#a8a8a8',
      800: '#c8c8c8',
      900: '#e8e8e8',
    },
  },
  components: {
    ...commonTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s ease-in-out',
          backgroundColor: '#242424',
          border: '1px solid #2a2a2a',
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: '#3a3a3a',
            backgroundColor: '#282828',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s ease-in-out',
          backgroundColor: '#1e1e1e',
          border: '1px solid #2a2a2a',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderBottom: '1px solid #2a2a2a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#3a3a3a',
          '&:hover': {
            borderColor: '#4a4a4a',
            backgroundColor: 'rgba(123, 179, 240, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            backgroundColor: '#242424',
            '& fieldset': {
              borderColor: '#3a3a3a',
            },
            '&:hover fieldset': {
              borderColor: '#4a4a4a',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7bb3f0',
            },
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

export type ThemeMode = 'light' | 'dark';