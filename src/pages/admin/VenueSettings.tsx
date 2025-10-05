import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  Chip,
  Fade,
  Slide,
  Zoom,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Badge,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Restaurant,
  Schedule,
  Palette,
  Notifications,
  Security,
  Payment,
  Language,
  Print,
  Save,
  CloudUpload,
  QrCode,
  Analytics,
  Settings,
  EmojiEvents,
  PowerSettingsNew,
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff,
  Edit,
  Info,
  TrendingUp,
  Star,
  AccessTime,
  LocationOn,
  Phone,
  Email,
  Web,
  Refresh,
  Store,
} from '@mui/icons-material';
import { venueService } from '../../services/business';
import { useUserData } from '../../contexts/UserDataContext';
import { CircularProgress } from '@mui/material';
import StorageManager from '../../utils/storage';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

interface VenueSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;

  logo?: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoPosition: 'left' | 'center' | 'right';
    showLogo: boolean;
  };
  features: {
    onlineOrdering: boolean;
    tableReservation: boolean;
    loyaltyProgram: boolean;
    multiLanguage: boolean;
    printReceipts: boolean;
    analytics: boolean;
  };
  paymentMethods: {
    cash: boolean;
    card: boolean;
    digitalWallet: boolean;
    onlinePayment: boolean;
  };
  notifications: {
    orderAlerts: boolean;
    lowStock: boolean;
    dailyReports: boolean;
    customerFeedback: boolean;
  };
  advanced: {
    autoAcceptOrders: boolean;
    orderTimeout: number;
    maxOrdersPerTable: number;
    requireCustomerInfo: boolean;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
      )}
    </div>
  );
};

const VenueSettings: React.FC = () => {
  const { getVenue, getVenueDisplayName, refreshUserData, userData, loading: userDataLoading } = useUserData();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [settings, setSettings] = useState<VenueSettings>({
    name: 'Dino Venue',
    description: 'Authentic Indian flavors with modern digital ordering experience',
    address: 'Hyderabad, Telangana, India',
    phone: '+91 98765 43210',
    email: 'info@dinovenue.com',

    operatingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false },
    },
    theme: {
      primaryColor: '#2196F3',
      secondaryColor: '#FF9800',
      logoPosition: 'left',
      showLogo: true,
    },
    features: {
      onlineOrdering: true,
      tableReservation: true,
      loyaltyProgram: false,
      multiLanguage: true,
      printReceipts: true,
      analytics: true,
    },
    paymentMethods: {
      cash: true,
      card: true,
      digitalWallet: true,
      onlinePayment: true,
    },
    notifications: {
      orderAlerts: true,
      lowStock: true,
      dailyReports: true,
      customerFeedback: true,
    },
    advanced: {
      autoAcceptOrders: false,
      orderTimeout: 30,
      maxOrdersPerTable: 5,
      requireCustomerInfo: false,
    },
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [hasChanges, setHasChanges] = useState(false);
  const [venueActive, setVenueActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load venue settings from API
  useEffect(() => {
    const loadVenueSettings = async () => {
      // If no userData and not loading, try to refresh
      if (!userData && !userDataLoading) {
        try {
          await refreshUserData();
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
        return;
      }
      
      const venue = getVenue();
      
      if (!venue?.id) {
        console.error('No venue found in UserData context');
        setError('No venue assigned to your account. Please contact support.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Use venue data from UserDataContext - it already contains all necessary information
        let venueData = venue;
        
        // REMOVED: Unnecessary API call to /venues/{venueId}
        // The /auth/user-data endpoint already provides complete venue information
        // This eliminates the duplicate API call that was happening
        console.log('Using venue data from UserDataContext:', venueData);
        
        if (venueData) {
          console.log('Mapping venue data to settings:', venueData);
          
          // Map venue data to settings format with proper fallbacks
          setSettings(prevSettings => ({
            name: venueData.name || '',
            description: venueData.description || '',
            address: venueData.location?.address || venueData.address || '',
            phone: venueData.phone || '',
            email: venueData.email || '',
 
            operatingHours: prevSettings.operatingHours, // Keep existing operating hours settings
            theme: prevSettings.theme, // Keep existing theme settings
            features: prevSettings.features, // Keep existing feature settings
            paymentMethods: prevSettings.paymentMethods, // Keep existing payment settings
            notifications: prevSettings.notifications, // Keep existing notification settings
            advanced: prevSettings.advanced, // Keep existing advanced settings
          }));
          
          const isActive = venueData.is_active !== undefined ? venueData.is_active : venueData.isActive;
          setVenueActive(isActive || false);
          console.log('Venue settings loaded successfully, active status:', isActive);
        }
      } catch (error) {
        console.error('Error loading venue settings:', error);
        setSnackbar({ 
          open: true, 
          message: 'Failed to load venue settings', 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    loadVenueSettings();
  }, [getVenue, userData, userDataLoading, refreshUserData]);

  const handleSettingChange = (section: keyof VenueSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleDirectSettingChange = (field: keyof VenueSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const venue = getVenue();
    console.log('Saving venue settings for venue:', venue);
    
    if (!venue?.id) {
      console.error('No venue available for saving');
      setSnackbar({ open: true, message: 'No venue available', severity: 'error' });
      return;
    }

    try {
      setSaving(true);
      
      // Prepare venue update data with proper structure
      const updateData = {
        name: settings.name,
        description: settings.description,
        location: {
          address: settings.address,
          city: venue.location?.city || '',
          state: venue.location?.state || '',
          country: venue.location?.country || 'India',
          postal_code: venue.location?.postal_code || '',
          landmark: venue.location?.landmark || ''
        },
        phone: settings.phone,
        email: settings.email,

      };

      console.log('Updating venue with data:', updateData);

      // Update venue
      const updateResponse = await venueService.updateVenue(venue.id, updateData);
      console.log('Venue update response:', updateResponse);

      // Update operating hours if changed
      const operatingHours = Object.entries(settings.operatingHours).map(([day, hours], index) => ({
        day_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(day),
        is_open: !hours.closed,
        open_time: hours.closed ? undefined : hours.open + ':00',
        close_time: hours.closed ? undefined : hours.close + ':00',
        is_24_hours: false
      }));

      console.log('Updating operating hours:', operatingHours);
      
      try {
        await venueService.updateOperatingHours(venue.id, operatingHours);
        console.log('Operating hours updated successfully');
      } catch (hoursError) {
        console.warn('Failed to update operating hours:', hoursError);
        // Don't fail the entire save operation for operating hours
      }
      
      // Clear venue cache and refresh user data to get updated venue information
      console.log('Clearing venue cache and refreshing user data...');
      StorageManager.clearVenueData();
      await refreshUserData();

      setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setHasChanges(false);
    setSnackbar({ open: true, message: 'Settings reset to defaults', severity: 'success' });
  };

  const handleToggleVenueStatus = async () => {
    const venue = getVenue();
    console.log('Toggling venue status for venue:', venue);
    
    if (!venue?.id) {
      console.error('No venue available for status toggle');
      setSnackbar({ open: true, message: 'No venue available', severity: 'error' });
      return;
    }

    try {
      const newStatus = !venueActive;
      console.log('Changing venue status from', venueActive, 'to', newStatus);
      
      if (newStatus) {
        console.log('Activating venue...');
        await venueService.activateVenue(venue.id);
      } else {
        console.log('Deactivating venue...');
        // Deactivate by updating is_active to false
        await venueService.updateVenue(venue.id, { is_active: false });
      }
      
      // Clear venue cache and refresh user data to get updated venue status
      console.log('Clearing venue cache and refreshing user data after status change...');
      StorageManager.clearVenueData();
      await refreshUserData();

      setVenueActive(newStatus);
      setSnackbar({ 
        open: true, 
        message: `Venue ${newStatus ? 'activated' : 'deactivated'} successfully`, 
        severity: 'success' 
      });
      console.log('Venue status updated successfully');
    } catch (error) {
      console.error('Error toggling venue status:', error);
      setSnackbar({ 
        open: true, 
        message: `Failed to update venue status: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        severity: 'error' 
      });
    }
  };

  const handleRefreshSettings = async () => {
    try {
      setLoading(true);
      console.log('Refreshing venue settings...');
      
      // Refresh user data to get latest venue information
      await refreshUserData();
      
      setSnackbar({
        open: true,
        message: 'Settings refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to refresh settings. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#607D8B', '#795548', '#FF5722'
  ];

  const days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  if (loading) {
    return (
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, py: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading venue settings...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, py: 4, width: '100%' }}>
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Reload Page
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'auto',
        height: 'auto',
        backgroundColor: '#f8f9fa',
        padding: 0,
        margin: 0,
        width: '100%',
        overflow: 'visible',
        '& .MuiContainer-root': {
          padding: '0 !important',
          margin: '0 !important',
          maxWidth: 'none !important',
        },
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
          padding: 0,
          margin: 0,
          width: '100%',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 2, md: 3 },
              py: { xs: 3, sm: 4 },
              px: { xs: 3, sm: 4 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Settings sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  Venue Settings
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400,
                  mb: 1,
                  maxWidth: '500px',
                  color: 'text.secondary',
                }}
              >
                Configure your venue's information, features, and operational preferences
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Restaurant sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                <Typography variant="body2" fontWeight="500" color="text.primary">
                  {settings.name || 'Your Venue'}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'row', sm: 'row' },
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Tooltip title={venueActive ? 'Deactivate venue operations' : 'Activate venue operations'}>
                <Button
                  variant={venueActive ? "outlined" : "contained"}
                  color={venueActive ? "error" : "success"}
                  onClick={handleToggleVenueStatus}
                  startIcon={<PowerSettingsNew />}
                  size="medium"
                  sx={{
                    backgroundColor: venueActive ? 'transparent' : 'success.main',
                    color: venueActive ? 'error.main' : 'white',
                    borderColor: venueActive ? 'error.main' : 'success.main',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    boxShadow: venueActive ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      backgroundColor: venueActive ? 'rgba(211, 47, 47, 0.1)' : 'success.dark',
                      color: venueActive ? 'error.dark' : 'white',
                      borderColor: venueActive ? 'error.dark' : 'success.dark',
                      transform: 'translateY(-1px)',
                      boxShadow: venueActive ? '0 2px 8px rgba(211, 47, 47, 0.3)' : '0 4px 12px rgba(46, 125, 50, 0.4)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {venueActive ? 'Deactivate Venue' : 'Activate Venue'}
                </Button>
              </Tooltip>

              <IconButton
                onClick={handleRefreshSettings}
                disabled={loading}
                size="medium"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                title={loading ? 'Refreshing...' : 'Refresh settings'}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          width: '100%',
          padding: 0,
          margin: 0,
        }}
      >


        {/* Unsaved Changes Banner */}
        {hasChanges && (
          <Box sx={{ px: { xs: 3, sm: 4 }, mb: 3 }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                bgcolor: 'rgba(255, 193, 7, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(255, 193, 7, 0.3)',
                marginTop:3
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Edit sx={{ color: '#ed6c02' }} />
                <Box>
                  <Typography variant="body1" color="#ed6c02" fontWeight="600">
                    You have unsaved changes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Don't forget to save your modifications
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleReset}
                  sx={{
                    borderColor: '#fafafaff',
                    color: '#eae7e5ff',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    },
                  }}
                >
                  Reset
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />} 
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Settings Tabs */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 4 }, pb: 4 }}>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => {
                // Only allow tab 0 (Basic Info) to be selected
                if (newValue === 0) {
                  setTabValue(newValue);
                }
              }}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                backgroundColor: 'grey.50',
                '& .MuiTab-root': {
                  minHeight: { xs: 48, sm: 72 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: { xs: 'auto', sm: 120 },
                  px: { xs: 1, sm: 2 },
                  '&.Mui-selected': {
                    backgroundColor: 'white',
                    fontWeight: 600,
                  },
                }
              }}
            >
              <Tab 
                icon={<Restaurant fontSize={isMobile ? "small" : "medium"} />} 
                label="Basic Info" 
                iconPosition={isMobile ? "start" : "top"} 
              />
              <Tab 
                icon={<Settings fontSize={isMobile ? "small" : "medium"} />} 
                label="Features" 
                iconPosition={isMobile ? "start" : "top"} 
                disabled
              />
              <Tab 
                icon={<Payment fontSize={isMobile ? "small" : "medium"} />} 
                label="Payment" 
                iconPosition={isMobile ? "start" : "top"} 
                disabled
              />
              <Tab 
                icon={<Notifications fontSize={isMobile ? "small" : "medium"} />} 
                label={isMobile ? "Alerts" : "Notifications"} 
                iconPosition={isMobile ? "start" : "top"} 
                disabled
              />
              <Tab 
                icon={<Security fontSize={isMobile ? "small" : "medium"} />} 
                label="Advanced" 
                iconPosition={isMobile ? "start" : "top"} 
                disabled
              />
            </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                      Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Venue Name"
                          value={settings.name}
                          onChange={(e) => handleDirectSettingChange('name', e.target.value)}
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '1rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '1rem',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={settings.description}
                          onChange={(e) => handleDirectSettingChange('description', e.target.value)}
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '1rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '1rem',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={settings.address}
                          onChange={(e) => handleDirectSettingChange('address', e.target.value)}
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '1rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '1rem',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={settings.phone}
                          onChange={(e) => handleDirectSettingChange('phone', e.target.value)}
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '1rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '1rem',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleDirectSettingChange('email', e.target.value)}
                          sx={{
                            '& .MuiInputLabel-root': {
                              fontSize: '1rem',
                              fontWeight: 500,
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '1rem',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 3, sm: 4 } }}>
                    <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                      Venue Logo
                    </Typography>
                    <Avatar
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 2,
                        bgcolor: 'primary.main',
                        fontSize: '2rem'
                      }}
                    >
                      🦕
                    </Avatar>
                    <Button
                      variant="contained"
                      startIcon={<CloudUpload />}
                      fullWidth
                      onClick={() => {
                        setSnackbar({ 
                          open: true, 
                          message: 'Logo upload feature coming soon', 
                          severity: 'info' 
                        });
                      }}
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 500,
                        py: 1.5,
                      }}
                    >
                      Upload Logo
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, display: 'block', fontSize: '0.875rem' }}>
                      Recommended: 512x512px, PNG or JPG
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Features & Capabilities
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(settings.features).map(([key, value]) => (
                    <Grid item xs={12} md={6} key={key}>
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2,
                          border: value ? '1px solid' : 'none',
                          borderColor: value ? 'primary.main' : 'transparent'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: value ? 'primary.main' : 'grey.200',
                                color: value ? 'white' : 'grey.600',
                                width: 48,
                                height: 48
                              }}
                            >
                              {key === 'onlineOrdering' && <QrCode />}
                              {key === 'tableReservation' && <Schedule />}
                              {key === 'loyaltyProgram' && <EmojiEvents />}
                              {key === 'multiLanguage' && <Language />}
                              {key === 'printReceipts' && <Print />}
                              {key === 'analytics' && <Analytics />}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight="600" gutterBottom>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {key === 'onlineOrdering' ? 'Allow customers to order via QR code and mobile app' : 
                                 key === 'tableReservation' ? 'Enable table booking and reservation management' :
                                 key === 'loyaltyProgram' ? 'Reward returning customers with points and discounts' :
                                 key === 'multiLanguage' ? 'Support multiple languages for international customers' :
                                 key === 'printReceipts' ? 'Print order receipts and kitchen tickets' :
                                 'Track sales analytics and customer insights'}
                              </Typography>
                              {value && (
                                <Chip 
                                  icon={<CheckCircle />}
                                  label="Active" 
                                  color="success" 
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </Box>
                          </Box>
                          <Switch
                            checked={value}
                            onChange={(e) => handleSettingChange('features', key, e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-thumb': {
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                              }
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Methods
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(settings.paymentMethods).map(([key, value]) => (
                    <Grid item xs={12} md={6} key={key}>
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2,
                          border: value ? '1px solid' : 'none',
                          borderColor: value ? 'primary.main' : 'transparent'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: value ? 'primary.main' : 'grey.200',
                                color: value ? 'white' : 'grey.600',
                                width: 48,
                                height: 48
                              }}
                            >
                              <Payment />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight="600" gutterBottom>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Accept {key.toLowerCase()} payments
                              </Typography>
                              {value && (
                                <Chip 
                                  icon={<CheckCircle />}
                                  label="Active" 
                                  color="success" 
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </Box>
                          </Box>
                          <Switch
                            checked={value}
                            onChange={(e) => handleSettingChange('paymentMethods', key, e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-thumb': {
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                              }
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <Grid item xs={12} key={key}>
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 2,
                          border: value ? '1px solid' : 'none',
                          borderColor: value ? 'primary.main' : 'transparent'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: value ? 'primary.main' : 'grey.200',
                                color: value ? 'white' : 'grey.600',
                                width: 48,
                                height: 48
                              }}
                            >
                              <Notifications />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight="600" gutterBottom>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {key === 'orderAlerts' ? 'Get notified when new orders are placed' :
                                 key === 'lowStock' ? 'Receive alerts when inventory is running low' :
                                 key === 'dailyReports' ? 'Daily summary of sales and performance' :
                                 'Notifications about customer feedback and reviews'}
                              </Typography>
                              {value && (
                                <Chip 
                                  icon={<CheckCircle />}
                                  label="Active" 
                                  color="success" 
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </Box>
                          </Box>
                          <Switch
                            checked={value}
                            onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-thumb': {
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                              }
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Advanced Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="600">
                      Order Management
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.advanced.autoAcceptOrders}
                                onChange={(e) => handleSettingChange('advanced', 'autoAcceptOrders', e.target.checked)}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1" fontWeight="600">
                                  Auto Accept Orders
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Automatically accept incoming orders without manual confirmation
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Order Timeout (minutes)"
                          type="text"
                          value={settings.advanced.orderTimeout === 0 ? '' : settings.advanced.orderTimeout.toString()}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d+$/.test(value)) {
                              const numValue = value === '' ? 30 : parseInt(value) || 30;
                              handleSettingChange('advanced', 'orderTimeout', numValue);
                            }
                          }}
                          onFocus={(e) => {
                            if (e.target.value === '0') {
                              e.target.select();
                            }
                          }}
                          placeholder="Enter timeout in minutes"
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                          }}
                          InputProps={{
                            startAdornment: <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                          }}
                          helperText="Time before order expires if not confirmed"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Max Orders Per Table"
                          type="text"
                          value={settings.advanced.maxOrdersPerTable === 0 ? '' : settings.advanced.maxOrdersPerTable.toString()}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d+$/.test(value)) {
                              const numValue = value === '' ? 5 : parseInt(value) || 5;
                              handleSettingChange('advanced', 'maxOrdersPerTable', numValue);
                            }
                          }}
                          onFocus={(e) => {
                            if (e.target.value === '0') {
                              e.target.select();
                            }
                          }}
                          placeholder="Enter max orders"
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                          }}
                          InputProps={{
                            startAdornment: <Restaurant sx={{ mr: 1, color: 'text.secondary' }} />
                          }}
                          helperText="Maximum simultaneous orders per table"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="600">
                      Customer Requirements
                    </Typography>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.advanced.requireCustomerInfo}
                            onChange={(e) => handleSettingChange('advanced', 'requireCustomerInfo', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              Require Customer Information
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Mandate customer details (name, phone) for all orders
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
          </Paper>
        </Box>
      </Box>

      <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ 
              vertical: 'bottom', 
              horizontal: isMobile ? 'center' : 'right' 
            }}
          >
            <Alert 
              severity={snackbar.severity} 
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
              sx={{
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                },
                width: { xs: '90vw', sm: 'auto' },
                maxWidth: { xs: '400px', sm: 'none' }
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
    </Box>
  );
};

export default VenueSettings;