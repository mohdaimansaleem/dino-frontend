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
} from '@mui/icons-material';
import { venueService } from '../../services/venueService';
import { useUserData } from '../../contexts/UserDataContext';
import { CircularProgress } from '@mui/material';

interface CafeSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const CafeSettings: React.FC = () => {
  const { getVenue, getVenueDisplayName, refreshUserData } = useUserData();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CafeSettings>({
    name: 'Dino Cafe',
    description: 'Authentic Indian flavors with modern digital ordering experience',
    address: 'Hyderabad, Telangana, India',
    phone: '+91 98765 43210',
    email: 'info@dinocafe.com',
    website: 'https://dinocafe.com',
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
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [hasChanges, setHasChanges] = useState(false);
  const [cafeActive, setCafeActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cafe settings from API
  useEffect(() => {
    const loadCafeSettings = async () => {
      const venue = getVenue();
      
      if (!venue?.id) {
        setError('No venue assigned to your account. Please contact support.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const venueData = venue;
        
        if (venueData) {
          // Map venue data to settings format
          setSettings({
            name: venueData.name,
            description: venueData.description || '',
            address: venueData.location?.address || '',
            phone: venueData.phone || '',
            email: venueData.email || '',
            website: '', // Website not available in venue data
            operatingHours: settings.operatingHours, // Keep existing operating hours settings
            theme: settings.theme, // Keep existing theme settings
            features: settings.features, // Keep existing feature settings
            paymentMethods: settings.paymentMethods, // Keep existing payment settings
            notifications: settings.notifications, // Keep existing notification settings
            advanced: settings.advanced, // Keep existing advanced settings
          });
          
          setCafeActive(venueData.is_active || false);
        }
      } catch (error) {
        console.error('Error loading cafe settings:', error);
        setSnackbar({ 
          open: true, 
          message: 'Failed to load cafe settings', 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    loadCafeSettings();
  }, [getVenue]);

  const handleSettingChange = (section: keyof CafeSettings, field: string, value: any) => {
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
    
    if (!venue?.id) {
      setSnackbar({ open: true, message: 'No venue available', severity: 'error' });
      return;
    }

    try {
      setSaving(true);
      
      // Prepare venue update data
      const updateData = {
        name: settings.name,
        description: settings.description,
        location: {
          address: settings.address,
          city: '',
          state: '',
          country: 'India',
          postal_code: ''
        },
        phone: settings.phone,
        email: settings.email,
        website: settings.website
      };

      // Update venue
      await venueService.updateVenue(venue.id, updateData);

      // Update operating hours if changed
      const operatingHours = Object.entries(settings.operatingHours).map(([day, hours], index) => ({
        day_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].indexOf(day),
        is_open: !hours.closed,
        open_time: hours.closed ? undefined : hours.open,
        close_time: hours.closed ? undefined : hours.close,
        is_24_hours: false
      }));

      await venueService.updateOperatingHours(venue.id, operatingHours);
      
      // Refresh user data to get updated venue information
      await refreshUserData();

      setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({ open: true, message: 'Failed to save settings', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setHasChanges(false);
    setSnackbar({ open: true, message: 'Settings reset to defaults', severity: 'success' });
  };

  const handleToggleCafeStatus = async () => {
    const venue = getVenue();
    
    if (!venue?.id) {
      setSnackbar({ open: true, message: 'No venue available', severity: 'error' });
      return;
    }

    try {
      const newStatus = !cafeActive;
      
      if (newStatus) {
        await venueService.activateVenue(venue.id);
      } else {
        // Deactivate by updating is_active to false
        await venueService.updateVenue(venue.id, { is_active: false });
      }
      
      // Refresh user data to get updated venue status
      await refreshUserData();

      setCafeActive(newStatus);
      setSnackbar({ 
        open: true, 
        message: `Cafe ${newStatus ? 'activated' : 'deactivated'} successfully`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error toggling cafe status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update cafe status', 
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
              Cafe Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure your cafe's information, features, and preferences
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'flex-end' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={cafeActive ? "outlined" : "contained"}
                color={cafeActive ? "error" : "success"}
                onClick={handleToggleCafeStatus}
                startIcon={<PowerSettingsNew />}
              >
                {cafeActive ? 'Deactivate Cafe' : 'Activate Cafe'}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Status:
              </Typography>
              <Chip 
                label={cafeActive ? 'Active' : 'Inactive'} 
                color={cafeActive ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {hasChanges && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 3, 
            backgroundColor: 'warning.50',
            border: '1px solid',
            borderColor: 'warning.200',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" color="warning.main">
            You have unsaved changes
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={handleReset}>
              Reset
            </Button>
            <Button 
              variant="contained" 
              startIcon={saving ? <CircularProgress size={16} /> : <Save />} 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      )}

      <Paper elevation={1} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            px: 2,
          }}
        >
          <Tab icon={<Restaurant />} label="Basic Info" />
          <Tab icon={<Schedule />} label="Hours" />
          <Tab icon={<Palette />} label="Appearance" />
          <Tab icon={<Settings />} label="Features" />
          <Tab icon={<Payment />} label="Payment" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Security />} label="Advanced" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Basic Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Cafe Name"
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
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Website"
                        value={settings.website}
                        onChange={(e) => handleSettingChange('website' as any, '', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Logo
                  </Typography>
                  <Avatar
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mx: 'auto', 
                      mb: 2,
                      backgroundColor: 'primary.main',
                      fontSize: '2rem'
                    }}
                  >
                    🦕
                  </Avatar>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    fullWidth
                    onClick={() => {
                      // TODO: Implement logo upload
                      setSnackbar({ 
                        open: true, 
                        message: 'Logo upload feature coming soon', 
                        severity: 'success' 
                      });
                    }}
                  >
                    Upload Logo
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Operating Hours
              </Typography>
              <Grid container spacing={2}>
                {days.map((day) => (
                  <Grid item xs={12} key={day}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ minWidth: 100, textTransform: 'capitalize' }}>
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
                          />
                        }
                        label="Open"
                      />
                      {!settings.operatingHours[day].closed && (
                        <>
                          <TextField
                            type="time"
                            label="Open"
                            value={settings.operatingHours[day].open}
                            onChange={(e) => handleSettingChange('operatingHours', day, {
                              ...settings.operatingHours[day],
                              open: e.target.value
                            })}
                            sx={{ width: 150 }}
                          />
                          <TextField
                            type="time"
                            label="Close"
                            value={settings.operatingHours[day].close}
                            onChange={(e) => handleSettingChange('operatingHours', day, {
                              ...settings.operatingHours[day],
                              close: e.target.value
                            })}
                            sx={{ width: 150 }}
                          />
                        </>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Theme & Appearance
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Primary Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {colorOptions.map((color) => (
                      <Box
                        key={color}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: color,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: settings.theme.primaryColor === color ? '3px solid #000' : '1px solid #ddd',
                        }}
                        onClick={() => handleSettingChange('theme', 'primaryColor', color)}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Logo Position</InputLabel>
                    <Select
                      value={settings.theme.logoPosition}
                      onChange={(e) => handleSettingChange('theme', 'logoPosition', e.target.value)}
                      label="Logo Position"
                    >
                      <MenuItem value="left">Left</MenuItem>
                      <MenuItem value="center">Center</MenuItem>
                      <MenuItem value="right">Right</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.theme.showLogo}
                        onChange={(e) => handleSettingChange('theme', 'showLogo', e.target.checked)}
                      />
                    }
                    label="Show Logo in Menu"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Features & Capabilities
              </Typography>
              <List>
                {Object.entries(settings.features).map(([key, value]) => (
                  <ListItem key={key}>
                    <ListItemIcon>
                      {key === 'onlineOrdering' && <QrCode />}
                      {key === 'tableReservation' && <Schedule />}
                      {key === 'loyaltyProgram' && <EmojiEvents />}
                      {key === 'multiLanguage' && <Language />}
                      {key === 'printReceipts' && <Print />}
                      {key === 'analytics' && <Analytics />}
                    </ListItemIcon>
                    <ListItemText
                      primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      secondary={`${key === 'onlineOrdering' ? 'Allow customers to order via QR code' : 
                                  key === 'tableReservation' ? 'Enable table booking system' :
                                  key === 'loyaltyProgram' ? 'Reward returning customers' :
                                  key === 'multiLanguage' ? 'Support multiple languages' :
                                  key === 'printReceipts' ? 'Print order receipts' :
                                  'Track sales and customer analytics'}`}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={value}
                        onChange={(e) => handleSettingChange('features', key, e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Payment Methods
              </Typography>
              <List>
                {Object.entries(settings.paymentMethods).map(([key, value]) => (
                  <ListItem key={key}>
                    <ListItemIcon>
                      <Payment />
                    </ListItemIcon>
                    <ListItemText
                      primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      secondary={`Accept ${key} payments`}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={value}
                        onChange={(e) => handleSettingChange('paymentMethods', key, e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Notification Settings
              </Typography>
              <List>
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <ListItem key={key}>
                    <ListItemIcon>
                      <Notifications />
                    </ListItemIcon>
                    <ListItemText
                      primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      secondary={`Receive ${key} notifications`}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={value}
                        onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Advanced Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.advanced.autoAcceptOrders}
                        onChange={(e) => handleSettingChange('advanced', 'autoAcceptOrders', e.target.checked)}
                      />
                    }
                    label="Auto Accept Orders"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Order Timeout (minutes)"
                    type="number"
                    value={settings.advanced.orderTimeout}
                    onChange={(e) => handleSettingChange('advanced', 'orderTimeout', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Orders Per Table"
                    type="number"
                    value={settings.advanced.maxOrdersPerTable}
                    onChange={(e) => handleSettingChange('advanced', 'maxOrdersPerTable', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.advanced.requireCustomerInfo}
                        onChange={(e) => handleSettingChange('advanced', 'requireCustomerInfo', e.target.checked)}
                      />
                    }
                    label="Require Customer Information"
                  />
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
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CafeSettings;