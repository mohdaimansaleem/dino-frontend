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
} from '@mui/icons-material';
import { venueService } from '../../services/venueService';
import { useUserData } from '../../contexts/UserDataContext';
import { CircularProgress } from '@mui/material';

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
      
      // Refresh user data to get updated venue information
      console.log('Refreshing user data...');
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
      
      // Refresh user data to get updated venue status
      console.log('Refreshing user data after status change...');
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
    );
  }

  return (
    <Box>
      <Container maxWidth="xl" className="container-responsive">
        <Box sx={{ py: { xs: 2, sm: 4 } }}>
          <Box sx={{ mb: { xs: 3, md: 4 } }}>
            <Paper 
              elevation={2} 
              className="card-responsive"
              sx={{ 
                p: { xs: 2, sm: 4 }, 
                mb: { xs: 3, md: 4 }
              }}
            >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 2, flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mr: 3,
                    bgcolor: 'primary.main',
                    fontSize: '2rem'
                  }}
                >
                  🦕
                </Avatar>
                <Box>
                  <Typography variant="h4" gutterBottom fontWeight="600">
                    Venue Settings
                  </Typography>
                  <Typography variant="h6" color="text.secondary" fontWeight="500">
                    {settings.name || 'Your Venue'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure your venue's information, features, and preferences
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, width: { xs: '100%', md: 'auto' } }}>
                <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                  <Tooltip title={venueActive ? 'Deactivate venue operations' : 'Activate venue operations'}>
                    <Button
                      variant={venueActive ? "outlined" : "contained"}
                      color={venueActive ? "error" : "success"}
                      onClick={handleToggleVenueStatus}
                      startIcon={<PowerSettingsNew />}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        textTransform: 'none',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        px: { xs: 1.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        minWidth: { xs: 'auto', sm: '140px' },
                        width: { xs: 'auto', md: 'auto' }
                      }}
                    >
                      {isMobile ? (venueActive ? 'Deactivate' : 'Activate') : (venueActive ? 'Deactivate Venue' : 'Activate Venue')}
                    </Button>
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Chip 
                    icon={venueActive ? <CheckCircle /> : <Cancel />}
                    label={venueActive ? 'Active' : 'Inactive'} 
                    color={venueActive ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {hasChanges && (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: 'warning.light',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Edit sx={{ color: 'warning.main' }} />
              <Box>
                <Typography variant="body1" color="warning.main" fontWeight="600">
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
              >
                Reset
              </Button>
              <Button 
                variant="contained" 
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />} 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        )}

          <Paper elevation={2} className="card-responsive">
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: { xs: 48, sm: 72 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  fontWeight: 500,
                  textTransform: 'none',
                  minWidth: { xs: 'auto', sm: 120 },
                  px: { xs: 1, sm: 2 }
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
              />
              <Tab 
                icon={<Payment fontSize={isMobile ? "small" : "medium"} />} 
                label="Payment" 
                iconPosition={isMobile ? "start" : "top"} 
              />
              <Tab 
                icon={<Notifications fontSize={isMobile ? "small" : "medium"} />} 
                label={isMobile ? "Alerts" : "Notifications"} 
                iconPosition={isMobile ? "start" : "top"} 
              />
              <Tab 
                icon={<Security fontSize={isMobile ? "small" : "medium"} />} 
                label="Advanced" 
                iconPosition={isMobile ? "start" : "top"} 
              />
            </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Venue Name"
                          value={settings.name}
                          onChange={(e) => handleSettingChange('name' as any, '', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={settings.description}
                          onChange={(e) => handleSettingChange('description' as any, '', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={settings.address}
                          onChange={(e) => handleSettingChange('address' as any, '', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={settings.phone}
                          onChange={(e) => handleSettingChange('phone' as any, '', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={settings.email}
                          onChange={(e) => handleSettingChange('email' as any, '', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
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
                    >
                      Upload Logo
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
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
                          type="number"
                          value={settings.advanced.orderTimeout}
                          onChange={(e) => handleSettingChange('advanced', 'orderTimeout', parseInt(e.target.value))}
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
                          type="number"
                          value={settings.advanced.maxOrdersPerTable}
                          onChange={(e) => handleSettingChange('advanced', 'maxOrdersPerTable', parseInt(e.target.value))}
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
      </Container>
    </Box>
  );
};

export default VenueSettings;