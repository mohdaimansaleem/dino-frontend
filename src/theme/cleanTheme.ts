import { createTheme, ThemeOptions } from '@mui/material/styles';

// Clean, official color palette with minimal gradients
const cleanColors = {
  // Primary Blues (Professional)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary - cleaner blue
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Secondary (Minimal accent)
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // Main secondary
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },
  
  // Neutral grays (Professional)
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Success, warning, error (Clean)
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Minimal gradients (only where necessary)
  gradients: {
    primary: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    secondary: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
    subtle: 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)',
    card: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)',
  },
};

const cleanThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: cleanColors.primary[500],
      light: cleanColors.primary[300],
      dark: cleanColors.primary[700],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: cleanColors.secondary[500],
      light: cleanColors.secondary[300],
      dark: cleanColors.secondary[700],
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
    },
    grey: cleanColors.gray,
    success: {
      main: cleanColors.success,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: cleanColors.warning,
      contrastText: '#FFFFFF',
    },
    error: {
      main: cleanColors.error,
      contrastText: '#FFFFFF',
    },
    info: {
      main: cleanColors.info,
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      color: '#212121',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.75rem',
      lineHeight: 1.3,
      color: '#212121',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.4,
      color: '#212121',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      color: '#212121',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.5,
      color: '#212121',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      color: '#212121',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#424242',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#616161',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      fontSize: '0.95rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.12)',
    '0px 2px 6px rgba(0, 0, 0, 0.12)',
    '0px 4px 12px rgba(0, 0, 0, 0.12)',
    '0px 6px 18px rgba(0, 0, 0, 0.12)',
    '0px 8px 24px rgba(0, 0, 0, 0.12)',
    '0px 10px 30px rgba(0, 0, 0, 0.12)',
    '0px 12px 36px rgba(0, 0, 0, 0.12)',
    '0px 14px 42px rgba(0, 0, 0, 0.12)',
    '0px 16px 48px rgba(0, 0, 0, 0.12)',
    '0px 18px 54px rgba(0, 0, 0, 0.12)',
    '0px 20px 60px rgba(0, 0, 0, 0.12)',
    '0px 22px 66px rgba(0, 0, 0, 0.12)',
    '0px 24px 72px rgba(0, 0, 0, 0.12)',
    '0px 26px 78px rgba(0, 0, 0, 0.12)',
    '0px 28px 84px rgba(0, 0, 0, 0.12)',
    '0px 30px 90px rgba(0, 0, 0, 0.12)',
    '0px 32px 96px rgba(0, 0, 0, 0.12)',
    '0px 34px 102px rgba(0, 0, 0, 0.12)',
    '0px 36px 108px rgba(0, 0, 0, 0.12)',
    '0px 38px 114px rgba(0, 0, 0, 0.12)',
    '0px 40px 120px rgba(0, 0, 0, 0.12)',
    '0px 42px 126px rgba(0, 0, 0, 0.12)',
    '0px 44px 132px rgba(0, 0, 0, 0.12)',
    '0px 46px 138px rgba(0, 0, 0, 0.12)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(33, 150, 243, 0.3)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: 'rgba(33, 150, 243, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #F0F0F0',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation4: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#212121',
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
          borderBottom: '1px solid #E0E0E0',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: cleanColors.primary[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: cleanColors.primary[500],
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          marginBottom: 2,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.04)',
            transform: 'translateX(4px)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
            transform: 'translateX(4px)',
          },
        },
      },
    },
  },
};

// Create the clean theme
const cleanTheme = createTheme(cleanThemeOptions);

// Add custom properties
declare module '@mui/material/styles' {
  interface Theme {
    clean: {
      gradients: typeof cleanColors.gradients;
      colors: typeof cleanColors;
    };
  }
  interface ThemeOptions {
    clean?: {
      gradients?: typeof cleanColors.gradients;
      colors?: typeof cleanColors;
    };
  }
}

// Extend theme with clean properties
const extendedCleanTheme = createTheme({
  ...cleanTheme,
  clean: {
    gradients: cleanColors.gradients,
    colors: cleanColors,
  },
});

export default extendedCleanTheme;