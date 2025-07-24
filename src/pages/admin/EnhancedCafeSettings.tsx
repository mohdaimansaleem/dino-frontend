import React, { useState } from 'react';
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

interface CafeSettings {
  // Basic Information
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  
  // Operating Hours
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  
  // Appearance
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoPosition: 'left' | 'center' | 'right';
    showLogo: boolean;
  };
  
  // Features
  features: {
    onlineOrdering: boolean;
    tableReservation: boolean;
    loyaltyProgram: boolean;
    multiLanguage: boolean;
    printReceipts: boolean;
    analytics: boolean;
  };
  
  // Payment
  paymentMethods: {
    cash: boolean;
    card: boolean;
    digitalWallet: boolean;
    onlinePayment: boolean;
  };
  
  // Notifications
  notifications: {
    orderAlerts: boolean;
    lowStock: boolean;
    dailyReports: boolean;
    customerFeedback: boolean;
  };
  
  // Advanced
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

const EnhancedCafeSettings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
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

  const handleSave = () => {
    // In a real app, this would save to the backend
    setSnackbar({ open: true, message: 'Settings saved successfully', severity: 'success' });
    setHasChanges(false);
  };

  const handleReset = () => {
    // Reset to default values
    setHasChanges(false);
    setSnackbar({ open: true, message: 'Settings reset to defaults', severity: 'success' });
  };

  const handleToggleCafeStatus = () => {
    setCafeActive(!cafeActive);
    setSnackbar({ 
      open: true, 
      message: `Cafe ${!cafeActive ? 'activated' : 'deactivated'} successfully`, 
      severity: 'success' 
    });
  };



  const colorOptions = [
    '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#607D8B', '#795548', '#FF5722'
  ];

  const days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
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

      {/* Save Bar */}
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
            <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        </Paper>
      )}

      {/* Tabs */}
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

        {/* Basic Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                    Restaurant Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Restaurant Name"
                        value={settings.name}
                        onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={3}
                        value={settings.description}
                        onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        multiline
                        rows={2}
                        value={settings.address}
                        onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={settings.phone}
                        onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Website"
                        value={settings.website}
                        onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                    Restaurant Logo
                  </Typography>
                  <Avatar
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mx: 'auto', 
                      mb: 3,
                      backgroundColor: 'grey.100',
                      border: '2px dashed',
                      borderColor: 'grey.300'
                    }}
                  >
                    <Restaurant sx={{ fontSize: 48, color: 'grey.500' }} />
                  </Avatar>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Upload Logo
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Recommended: 200x200px, PNG or JPG
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Operating Hours Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                Operating Hours
              </Typography>
              <Grid container spacing={3}>
                {days.map(day => (
                  <Grid item xs={12} key={day}>
                    <Paper elevation={0} sx={{ p: 3, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={2}>
                          <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!settings.operatingHours[day].closed}
                                onChange={(e) => {
                                  setSettings(prev => ({
                                    ...prev,
                                    operatingHours: {
                                      ...prev.operatingHours,
                                      [day]: {
                                        ...prev.operatingHours[day],
                                        closed: !e.target.checked
                                      }
                                    }
                                  }));
                                  setHasChanges(true);
                                }}
                              />
                            }
                            label="Open"
                          />
                        </Grid>
                        {!settings.operatingHours[day].closed && (
                          <>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                label="Opening Time"
                                type="time"
                                value={settings.operatingHours[day].open}
                                onChange={(e) => {
                                  setSettings(prev => ({
                                    ...prev,
                                    operatingHours: {
                                      ...prev.operatingHours,
                                      [day]: {
                                        ...prev.operatingHours[day],
                                        open: e.target.value
                                      }
                                    }
                                  }));
                                  setHasChanges(true);
                                }}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <TextField
                                fullWidth
                                label="Closing Time"
                                type="time"
                                value={settings.operatingHours[day].close}
                                onChange={(e) => {
                                  setSettings(prev => ({
                                    ...prev,
                                    operatingHours: {
                                      ...prev.operatingHours,
                                      [day]: {
                                        ...prev.operatingHours[day],
                                        close: e.target.value
                                      }
                                    }
                                  }));
                                  setHasChanges(true);
                                }}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                    Color Theme
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Primary Color
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                        {colorOptions.map(color => (
                          <Box
                            key={color}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: color,
                              cursor: 'pointer',
                              border: settings.theme.primaryColor === color ? '3px solid #000' : '1px solid #ccc',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                transition: 'transform 0.2s',
                              },
                            }}
                            onClick={() => handleSettingChange('theme', 'primaryColor', color)}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Current: {settings.theme.primaryColor}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Secondary Color
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {colorOptions.map(color => (
                          <Box
                            key={color}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              backgroundColor: color,
                              cursor: 'pointer',
                              border: settings.theme.secondaryColor === color ? '3px solid #000' : '1px solid #ccc',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                transition: 'transform 0.2s',
                              },
                            }}
                            onClick={() => handleSettingChange('theme', 'secondaryColor', color)}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Current: {settings.theme.secondaryColor}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                    Logo Settings
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.theme.showLogo}
                            onChange={(e) => handleSettingChange('theme', 'showLogo', e.target.checked)}
                          />
                        }
                        label="Show Logo"
                      />
                    </Grid>
                    <Grid item xs={12}>
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
                  </Grid>
                  
                  {/* Theme Preview */}
                  <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Theme Preview
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 2, 
                        backgroundColor: settings.theme.primaryColor,
                        color: 'white',
                        borderRadius: 1,
                        mb: 1,
                        textAlign: settings.theme.logoPosition,
                      }}
                    >
                      {settings.theme.showLogo && '🦕'} Dino Cafe
                    </Box>
                    <Box 
                      sx={{ 
                        p: 1, 
                        backgroundColor: settings.theme.secondaryColor,
                        color: 'white',
                        borderRadius: 1,
                        fontSize: '0.875rem',
                      }}
                    >
                      Secondary elements
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Features Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={4}>
            {Object.entries(settings.features).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {key === 'onlineOrdering' && <QrCode color="primary" />}
                      {key === 'tableReservation' && <Schedule color="primary" />}
                      {key === 'loyaltyProgram' && <EmojiEvents color="primary" />}
                      {key === 'multiLanguage' && <Language color="primary" />}
                      {key === 'printReceipts' && <Print color="primary" />}
                      {key === 'analytics' && <Analytics color="primary" />}
                      <Typography variant="h6" sx={{ ml: 1, fontWeight: 600, color: 'text.primary' }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {key === 'onlineOrdering' && 'Allow customers to place orders online'}
                      {key === 'tableReservation' && 'Enable table reservation system'}
                      {key === 'loyaltyProgram' && 'Reward returning customers'}
                      {key === 'multiLanguage' && 'Support multiple languages'}
                      {key === 'printReceipts' && 'Print receipts for orders'}
                      {key === 'analytics' && 'Track sales and customer data'}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={value}
                          onChange={(e) => handleSettingChange('features', key, e.target.checked)}
                        />
                      }
                      label={value ? 'Enabled' : 'Disabled'}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Payment Tab */}
        <TabPanel value={tabValue} index={4}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                Payment Methods
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(settings.paymentMethods).map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={3} key={key}>
                    <Paper elevation={0} sx={{ p: 3, backgroundColor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Payment color="primary" />
                        <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600, color: 'text.primary' }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value}
                            onChange={(e) => handleSettingChange('paymentMethods', key, e.target.checked)}
                          />
                        }
                        label={value ? 'Enabled' : 'Disabled'}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={5}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                Notification Settings
              </Typography>
              <List>
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <ListItem key={key} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
                    <ListItemIcon>
                      <Notifications color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      secondary={
                        key === 'orderAlerts' ? 'Get notified when new orders arrive' :
                        key === 'lowStock' ? 'Alert when inventory is running low' :
                        key === 'dailyReports' ? 'Receive daily sales reports' :
                        'Get notified about customer feedback'
                      }
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

        {/* Advanced Tab */}
        <TabPanel value={tabValue} index={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                Advanced Settings
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.advanced.autoAcceptOrders}
                        onChange={(e) => handleSettingChange('advanced', 'autoAcceptOrders', e.target.checked)}
                      />
                    }
                    label="Auto Accept Orders"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Automatically accept incoming orders without manual confirmation
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.advanced.requireCustomerInfo}
                        onChange={(e) => handleSettingChange('advanced', 'requireCustomerInfo', e.target.checked)}
                      />
                    }
                    label="Require Customer Information"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Require customers to provide contact information when ordering
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Order Timeout (minutes)"
                    type="number"
                    value={settings.advanced.orderTimeout}
                    onChange={(e) => handleSettingChange('advanced', 'orderTimeout', parseInt(e.target.value))}
                    helperText="Time before pending orders are automatically cancelled"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Max Orders Per Table"
                    type="number"
                    value={settings.advanced.maxOrdersPerTable}
                    onChange={(e) => handleSettingChange('advanced', 'maxOrdersPerTable', parseInt(e.target.value))}
                    helperText="Maximum number of active orders allowed per table"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Snackbar */}
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

export default EnhancedCafeSettings;