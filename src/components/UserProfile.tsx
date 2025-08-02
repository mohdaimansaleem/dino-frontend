import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  LocationOn,
  Add,
  Delete,
  Home,
  Work,
  Person,
  Security,
  Restaurant
} from '@mui/icons-material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile as UserProfileType, UserAddress } from '../types';
import { authService } from '../services/authService';
import ImageUpload from './ImageUpload';
import UserPermissions from './UserPermissions';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile data
  const [profileData, setProfileData] = useState<Partial<UserProfileType>>({});
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [preferences, setPreferences] = useState<any>({});
  
  // Dialog states
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  
  // Form states
  const [newAddress, setNewAddress] = useState<Partial<UserAddress>>({
    label: 'Home',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData(user);
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [addressesData, preferencesData] = await Promise.all([
        authService.getAddresses(),
        authService.getPreferences()
      ]);
      
      setAddresses(addressesData);
      setPreferences(preferencesData);
    } catch (err: any) {
      }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await updateUser(profileData);
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.addAddress(newAddress);
      await loadUserData();
      
      setAddressDialogOpen(false);
      setNewAddress({
        label: 'Home',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
      });
      setSuccess('Address added successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressDelete = async (addressId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.deleteAddress(addressId);
      await loadUserData();
      
      setSuccess('Address deleted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);
      setError(null);
      
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccess('Password changed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.updatePreferences(preferences);
      setSuccess('Preferences updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (response: any) => {
    try {
      await updateUser({ profileImageUrl: response.fileUrl });
      setImageUploadOpen(false);
      setSuccess('Profile image updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile image');
    }
  };

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
    'Keto', 'Paleo', 'Halal', 'Kosher'
  ];

  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese',
    'Mediterranean', 'American', 'French', 'Korean'
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user?.profileImageUrl}
                sx={{ width: 100, height: 100 }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
                size="small"
                onClick={() => setImageUploadOpen(true)}
              >
                <PhotoCamera />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<LocationOn />} label="Addresses" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Restaurant />} label="Preferences" />
          <Tab icon={<Security />} label="Permissions" />
        </Tabs>

        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Personal Information</Typography>
            <Button
              variant={editing ? "outlined" : "contained"}
              startIcon={editing ? <Cancel /> : <Edit />}
              onClick={() => {
                if (editing) {
                  setProfileData(user || {});
                }
                setEditing(!editing);
              }}
            >
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.firstName || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.lastName || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!editing}
                type="email"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value ? new Date(e.target.value) : undefined }))}
                disabled={!editing}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!editing}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={profileData.gender || ''}
                  label="Gender"
                  onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' | 'prefer_not_to_say' }))}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {editing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleProfileUpdate}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Addresses Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Saved Addresses</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddressDialogOpen(true)}
            >
              Add Address
            </Button>
          </Box>

          {addresses.length === 0 ? (
            <Box textAlign="center" py={4}>
              <LocationOn sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No addresses saved
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add your addresses for faster checkout
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {addresses.map((address) => (
                <Grid item xs={12} sm={6} key={address.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {address.label === 'Home' ? <Home /> : <Work />}
                          {address.label}
                        </Typography>
                        {address.isDefault && (
                          <Chip label="Default" size="small" color="primary" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {address.addressLine1}<br />
                        {address.addressLine2 && `${address.addressLine2}`}<br />
                        {address.city}, {address.state} {address.postalCode}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<Edit />}>
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<Delete />}
                        onClick={() => address.id && handleAddressDelete(address.id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Security />
              </ListItemIcon>
              <ListItemText
                primary="Password"
                secondary="Change your account password"
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText
                primary="Account Status"
                secondary={user?.isVerified ? "Verified account" : "Unverified account"}
              />
              <ListItemSecondaryAction>
                <Chip
                  label={user?.isVerified ? "Verified" : "Unverified"}
                  color={user?.isVerified ? "success" : "warning"}
                  size="small"
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Food Preferences
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={dietaryOptions}
                value={preferences.dietaryRestrictions || []}
                onChange={(_, value) => setPreferences((prev: any) => ({ ...prev, dietaryRestrictions: value }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Dietary Restrictions"
                    placeholder="Select dietary restrictions"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={cuisineOptions}
                value={preferences.favoriteCuisines || []}
                onChange={(_, value) => setPreferences((prev: any) => ({ ...prev, favoriteCuisines: value }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Favorite Cuisines"
                    placeholder="Select favorite cuisines"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Spice Level Preference</InputLabel>
                <Select
                  value={preferences.spiceLevel || 'medium'}
                  label="Spice Level Preference"
                  onChange={(e) => setPreferences((prev: any) => ({ ...prev, spiceLevel: e.target.value }))}
                >
                  <MenuItem value="mild">Mild 🌶️</MenuItem>
                  <MenuItem value="medium">Medium 🌶️🌶️</MenuItem>
                  <MenuItem value="hot">Hot 🌶️🌶️🌶️</MenuItem>
                  <MenuItem value="extra_hot">Extra Hot 🌶️🌶️🌶️🌶️</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Notification Preferences
          </Typography>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications || false}
                  onChange={(e) => setPreferences((prev: any) => ({ ...prev, emailNotifications: e.target.checked }))}
                />
              }
              label="Email notifications for order updates"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.smsNotifications || false}
                  onChange={(e) => setPreferences((prev: any) => ({ ...prev, smsNotifications: e.target.checked }))}
                />
              }
              label="SMS notifications for order updates"
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handlePreferencesUpdate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            >
              Save Preferences
            </Button>
          </Box>
        </TabPanel>

        {/* Permissions Tab */}
        <TabPanel value={tabValue} index={4}>
          <UserPermissions />
        </TabPanel>
      </Paper>

      {/* Add Address Dialog */}
      <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Label"
                value={newAddress.label}
                onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Home, Work, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={newAddress.addressLine1}
                onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address Line 2 (Optional)"
                value={newAddress.addressLine2}
                onChange={(e) => setNewAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newAddress.isDefault || false}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                }
                label="Set as default address"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddressAdd} 
            variant="contained"
            disabled={loading || !newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.postalCode}
          >
            Add Address
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                helperText="Password must be at least 8 characters with uppercase, lowercase, and number"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                error={passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword}
                helperText={passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword ? 'Passwords do not match' : ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={imageUploadOpen} onClose={() => setImageUploadOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Profile Image</DialogTitle>
        <DialogContent>
          <ImageUpload
            variant="profile"
            multiple={false}
            onUpload={handleImageUpload}
            onError={(error) => setError(error)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageUploadOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;