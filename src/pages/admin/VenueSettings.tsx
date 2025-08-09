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
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Fade in timeout={400}>
          <Box sx={{ p: 4 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
};

const VenueSettings: React.FC = () => {
  const { getVenue, getVenueDisplayName, refreshUserData, userData, loading: userDataLoading } = useUserData();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        
        // Try to get fresh venue data from API if needed
        let venueData = venue;
        
        // If venue data seems incomplete, try to fetch fresh data
        if (!venue.name || !venue.location) {
          console.log('Venue data incomplete, fetching fresh data...');
          try {
            const freshVenueData = await venueService.getVenue(venue.id);
            if (freshVenueData) {
              // Ensure postal_code is always a string for compatibility
              venueData = {
                ...freshVenueData,
                location: {
                  ...freshVenueData.location,
                  postal_code: freshVenueData.location?.postal_code || ''
                }
              };
              console.log('Fresh venue data loaded:', venueData);
            }
          } catch (fetchError) {
            console.warn('Could not fetch fresh venue data, using context data:', fetchError);
          }
        }
        
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
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pb: 4
    }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                mb: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      mr: 3,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      fontSize: '2rem'
                    }}
                  >
                    🦕
                  </Avatar>
                  <Box>
                    <Typography variant="h4" gutterBottom fontWeight="700" 
                      sx={{ 
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}
                    >
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
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Tooltip title={venueActive ? 'Deactivate venue operations' : 'Activate venue operations'}>
                      <Button
                        variant={venueActive ? "outlined" : "contained"}
                        color={venueActive ? "error" : "success"}
                        onClick={handleToggleVenueStatus}
                        startIcon={<PowerSettingsNew />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: venueActive ? 'none' : '0 4px 12px rgba(76, 175, 80, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        {venueActive ? 'Deactivate Venue' : 'Activate Venue'}
                      </Button>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      Current Status:
                    </Typography>
                    <Chip 
                      icon={venueActive ? <CheckCircle /> : <Cancel />}
                      label={venueActive ? 'Active' : 'Inactive'} 
                      color={venueActive ? 'success' : 'error'}
                      variant="filled"
                      sx={{ 
                        fontWeight: 600,
                        px: 1,
                        '& .MuiChip-icon': {
                          fontSize: '1rem'
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>

        <Slide direction="down" in={hasChanges} mountOnEnter unmountOnExit>
          <Paper 
            elevation={4} 
            sx={{ 
              p: 3, 
              mb: 3, 
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              border: '1px solid',
              borderColor: 'warning.300',
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.15)'
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
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
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
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Slide>

        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              px: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                minHeight: 72,
                borderRadius: 2,
                mx: 0.5,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.08)',
                  transform: 'translateY(-2px)'
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  color: 'white',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            <Tab icon={<Restaurant />} label="Basic Info" iconPosition="top" />
            <Tab icon={<Schedule />} label="Hours" iconPosition="top" />
            <Tab icon={<Palette />} label="Appearance" iconPosition="top" />
            <Tab icon={<Settings />} label="Features" iconPosition="top" />
            <Tab icon={<Payment />} label="Payment" iconPosition="top" />
            <Tab icon={<Notifications />} label="Notifications" iconPosition="top" />
            <Tab icon={<Security />} label="Advanced" iconPosition="top" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Fade in timeout={600}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ 
                    borderRadius: 3, 
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <Restaurant />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="700" color="text.primary">
                            Basic Information
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Essential details about your venue
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Venue Name"
                            value={settings.name}
                            onChange={(e) => handleSettingChange('name' as any, '', e.target.value)}
                            InputProps={{
                              startAdornment: <Restaurant sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover fieldset': {
                                  borderColor: 'primary.main',
                                },
                              }
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
                            onChange={(e) => handleSettingChange('description' as any, '', e.target.value)}
                            InputProps={{
                              startAdornment: <Info sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Address"
                            value={settings.address}
                            onChange={(e) => handleSettingChange('address' as any, '', e.target.value)}
                            InputProps={{
                              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={settings.phone}
                            onChange={(e) => handleSettingChange('phone' as any, '', e.target.value)}
                            InputProps={{
                              startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={settings.email}
                            onChange={(e) => handleSettingChange('email' as any, '', e.target.value)}
                            InputProps={{
                              startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    borderRadius: 3, 
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden'
                  }}>
                    <Box sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h6" fontWeight="700" gutterBottom>
                        Venue Logo
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Upload your brand identity
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Zoom in timeout={800}>
                        <Avatar
                          sx={{ 
                            width: 120, 
                            height: 120, 
                            mx: 'auto', 
                            mb: 3,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            fontSize: '3rem',
                            boxShadow: '0 8px 24px rgba(33, 150, 243, 0.3)',
                            border: '4px solid white',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 12px 32px rgba(33, 150, 243, 0.4)'
                            }
                          }}
                        >
                          🦕
                        </Avatar>
                      </Zoom>
                      <Button
                        variant="contained"
                        startIcon={<CloudUpload />}
                        fullWidth
                        onClick={() => {
                          // TODO: Implement logo upload
                          setSnackbar({ 
                            open: true, 
                            message: 'Logo upload feature coming soon', 
                            severity: 'info' 
                          });
                        }}
                        sx={{
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        Upload Logo
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Recommended: 512x512px, PNG or JPG
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Fade>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Fade in timeout={600}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                      <Schedule />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700">
                        Operating Hours
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Set your venue's daily schedule
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {days.map((day, index) => (
                      <Grid item xs={12} key={day}>
                        <Slide direction="right" in timeout={300 + index * 100}>
                          <Paper 
                            elevation={1} 
                            sx={{ 
                              p: 3, 
                              borderRadius: 2,
                              border: '1px solid rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  minWidth: 120, 
                                  textTransform: 'capitalize',
                                  fontWeight: 600,
                                  color: 'text.primary'
                                }}
                              >
                                {day}
                              </Typography>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={!settings.operatingHours[day].closed}
                                    onChange={(e) => handleSettingChange('operatingHours', day, {
                                      ...settings.operatingHours[day],
                                      closed: !e.target.checked
                                    })}
                                    color="success"
                                  />
                                }
                                label={
                                  <Typography variant="body1" fontWeight="500">
                                    {settings.operatingHours[day].closed ? 'Closed' : 'Open'}
                                  </Typography>
                                }
                              />
                              {!settings.operatingHours[day].closed && (
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                  <TextField
                                    type="time"
                                    label="Opening Time"
                                    value={settings.operatingHours[day].open}
                                    onChange={(e) => handleSettingChange('operatingHours', day, {
                                      ...settings.operatingHours[day],
                                      open: e.target.value
                                    })}
                                    sx={{ 
                                      width: 160,
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                      }
                                    }}
                                    size="small"
                                  />
                                  <Typography variant="body2" color="text.secondary">to</Typography>
                                  <TextField
                                    type="time"
                                    label="Closing Time"
                                    value={settings.operatingHours[day].close}
                                    onChange={(e) => handleSettingChange('operatingHours', day, {
                                      ...settings.operatingHours[day],
                                      close: e.target.value
                                    })}
                                    sx={{ 
                                      width: 160,
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                      }
                                    }}
                                    size="small"
                                  />
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Slide>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Fade in timeout={600}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                      <Palette />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700">
                        Theme & Appearance
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Customize your venue's visual identity
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                          Brand Colors
                        </Typography>
                        <Typography variant="subtitle1" gutterBottom fontWeight="500" color="text.secondary">
                          Primary Color
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                          {colorOptions.map((color) => (
                            <Tooltip key={color} title={`Select ${color}`}>
                              <Box
                                sx={{
                                  width: 56,
                                  height: 56,
                                  backgroundColor: color,
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: settings.theme.primaryColor === color ? '4px solid #000' : '2px solid rgba(0, 0, 0, 0.1)',
                                  transition: 'all 0.2s ease-in-out',
                                  position: 'relative',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: `0 4px 12px ${color}40`
                                  }
                                }}
                                onClick={() => handleSettingChange('theme', 'primaryColor', color)}
                              >
                                {settings.theme.primaryColor === color && (
                                  <CheckCircle 
                                    sx={{ 
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      color: 'white',
                                      fontSize: '1.5rem'
                                    }} 
                                  />
                                )}
                              </Box>
                            </Tooltip>
                          ))}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Selected: {settings.theme.primaryColor}
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                          Logo Settings
                        </Typography>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <InputLabel>Logo Position</InputLabel>
                          <Select
                            value={settings.theme.logoPosition}
                            onChange={(e) => handleSettingChange('theme', 'logoPosition', e.target.value)}
                            label="Logo Position"
                            sx={{
                              borderRadius: 2,
                            }}
                          >
                            <MenuItem value="left">Left Aligned</MenuItem>
                            <MenuItem value="center">Center Aligned</MenuItem>
                            <MenuItem value="right">Right Aligned</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.theme.showLogo}
                              onChange={(e) => handleSettingChange('theme', 'showLogo', e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body1" fontWeight="500">
                                Show Logo in Menu
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Display your logo on customer-facing menus
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                          Preview
                        </Typography>
                        <Box 
                          sx={{ 
                            p: 3, 
                            borderRadius: 2, 
                            backgroundColor: settings.theme.primaryColor,
                            color: 'white',
                            textAlign: settings.theme.logoPosition,
                            minHeight: 120,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: settings.theme.logoPosition === 'center' ? 'center' : 
                                       settings.theme.logoPosition === 'right' ? 'flex-end' : 'flex-start'
                          }}
                        >
                          {settings.theme.showLogo && (
                            <Typography variant="h4" sx={{ mb: 1 }}>🦕</Typography>
                          )}
                          <Typography variant="h6" fontWeight="600">
                            {settings.name || 'Your Venue'}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Menu Preview
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Fade in timeout={600}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                      <Settings />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700">
                        Features & Capabilities
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Enable powerful features for your venue
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {Object.entries(settings.features).map(([key, value], index) => (
                      <Grid item xs={12} md={6} key={key}>
                        <Slide direction="up" in timeout={300 + index * 100}>
                          <Paper 
                            elevation={value ? 3 : 1}
                            sx={{ 
                              p: 3, 
                              borderRadius: 2,
                              border: value ? '2px solid' : '1px solid rgba(0, 0, 0, 0.05)',
                              borderColor: value ? 'primary.main' : 'transparent',
                              background: value ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 203, 243, 0.05) 100%)' : 'white',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                              }
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
                        </Slide>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Fade in timeout={600}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                      <Payment />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700">
                        Payment Methods
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Configure accepted payment options
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {Object.entries(settings.paymentMethods).map(([key, value], index) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Zoom in timeout={400 + index * 100}>
                          <Paper 
                            elevation={value ? 3 : 1}
                            sx={{ 
                              p: 3, 
                              borderRadius: 2,
                              border: value ? '2px solid' : '1px solid rgba(0, 0, 0, 0.05)',
                              borderColor: value ? 'success.main' : 'transparent',
                              background: value ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)' : 'white',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: value ? 'success.main' : 'grey.200',
                                    color: value ? 'white' : 'grey.600',
                                    width: 40,
                                    height: 40
                                  }}
                                >
                                  <Payment />
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight="600">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Accept {key.toLowerCase()} payments
                                  </Typography>
                                </Box>
                              </Box>
                              <Switch
                                checked={value}
                                onChange={(e) => handleSettingChange('paymentMethods', key, e.target.checked)}
                                color="success"
                              />
                            </Box>
                          </Paper>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Fade in timeout={600}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  color: 'text.primary'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      <Notifications />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700">
                        Notification Settings
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage your notification preferences
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {Object.entries(settings.notifications).map(([key, value], index) => (
                      <Grid item xs={12} key={key}>
                        <Slide direction="left" in timeout={300 + index * 100}>
                          <Paper 
                            elevation={1}
                            sx={{ 
                              p: 3, 
                              borderRadius: 2,
                              border: '1px solid rgba(0, 0, 0, 0.05)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: value ? 'info.main' : 'grey.200',
                                    color: value ? 'white' : 'grey.600',
                                    width: 40,
                                    height: 40
                                  }}
                                >
                                  <Notifications />
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight="600">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {key === 'orderAlerts' ? 'Get notified when new orders are placed' :
                                     key === 'lowStock' ? 'Receive alerts when inventory is running low' :
                                     key === 'dailyReports' ? 'Daily summary of sales and performance' :
                                     'Notifications about customer feedback and reviews'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {value && (
                                  <Chip 
                                    icon={<CheckCircle />}
                                    label="Enabled" 
                                    color="info" 
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                  />
                                )}
                                <Switch
                                  checked={value}
                                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                                  color="info"
                                />
                              </Box>
                            </Box>
                          </Paper>
                        </Slide>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <Fade in timeout={600}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
                      <Security />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700">
                        Advanced Settings
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Fine-tune your venue operations
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                          Order Management
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'grey.50' }}>
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
                            </Box>
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
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
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
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                              helperText="Maximum simultaneous orders per table"
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
                          Customer Requirements
                        </Typography>
                        <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'grey.50' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.advanced.requireCustomerInfo}
                                onChange={(e) => handleSettingChange('advanced', 'requireCustomerInfo', e.target.checked)}
                                color="secondary"
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
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </TabPanel>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            sx={{
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default VenueSettings;