import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Menu,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  FormHelperText,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  VisibilityOff,
  SwapHoriz,
  Restaurant,
  LocationOn,
  Email,
  Phone,
  Store,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import PermissionService from '../../services/permissionService';
import { PERMISSIONS } from '../../types/auth';
import { venueService } from '../../services/venueService';

const priceRangeOptions = [
  { value: 'budget', label: 'Budget (₹ - Under ₹500 per person)' },
  { value: 'mid_range', label: 'Mid Range (₹₹ - ₹500-₹1500 per person)' },
  { value: 'premium', label: 'Premium (₹₹₹ - ₹1500-₹3000 per person)' },
  { value: 'luxury', label: 'Luxury (₹₹₹₹ - Above ₹3000 per person)' }
];

const venueTypeOptions = [
  'restaurant',
  'cafe',
  'bar',
  'fast_food',
  'fine_dining',
  'bakery',
  'food_truck',
  'cloud_kitchen',
  'other'
];

const WorkspaceManagement: React.FC = () => {
  const { user: currentUser, hasPermission, isSuperAdmin } = useAuth();
  const { userData, loading: userDataLoading, refreshUserData } = useUserData();
  
  // Extract venue data from userData
  const currentVenue = userData?.venue;
  const venues = currentVenue ? [currentVenue] : [];

  const [openVenueDialog, setOpenVenueDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [venueFormData, setVenueFormData] = useState({
    name: '',
    description: '',
    venueType: 'restaurant',
    location: {
      address: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: '',
      landmark: ''
    },
    phone: '',
    email: '',

    priceRange: 'mid_range',
    isActive: true,
    isOpen: true,
  });

  // Venue Management
  const handleOpenVenueDialog = (venue?: any) => {
    if (venue) {
      setEditingVenue(venue);
      
      // Debug logging to see the venue object structure
      console.log('Editing venue:', venue);
      
      setVenueFormData({
        name: String(venue.name || ''),
        description: String(venue.description || ''),
        venueType: String(venue.venueType || venue.venue_type || 'restaurant'),
        location: {
          address: String(venue.location?.address || ''),
          city: String(venue.location?.city || ''),
          state: String(venue.location?.state || ''),
          country: String(venue.location?.country || 'India'),
          postal_code: String(venue.location?.postal_code || venue.location?.postalCode || ''),
          landmark: String(venue.location?.landmark || '')
        },
        phone: String(venue.phone || ''),
        email: String(venue.email || ''),

        priceRange: String(venue.priceRange || venue.price_range || 'mid_range'),
        isActive: Boolean(venue.is_active !== undefined ? venue.is_active : venue.isActive !== undefined ? venue.isActive : true),
        isOpen: Boolean(venue.is_open !== undefined ? venue.is_open : venue.isOpen !== undefined ? venue.isOpen : true),
      });
    } else {
      setEditingVenue(null);
      setVenueFormData({
        name: '',
        description: '',
        venueType: 'restaurant',
        location: {
          address: '',
          city: '',
          state: '',
          country: 'India',
          postal_code: '',
          landmark: ''
        },
        phone: '',
        email: '',
    
        priceRange: 'mid_range',
        isActive: true,
        isOpen: true,
      });
    }
    setOpenVenueDialog(true);
  };

  const handleCloseVenueDialog = () => {
    setOpenVenueDialog(false);
    setEditingVenue(null);
  };

  const handleSubmitVenue = async () => {
    try {
      setSaving(true);
      
      if (editingVenue) {
        // Update existing venue
        const updateData = {
          name: venueFormData.name,
          description: venueFormData.description,
          location: {
            address: venueFormData.location.address,
            city: venueFormData.location.city,
            state: venueFormData.location.state,
            country: venueFormData.location.country,
            postal_code: venueFormData.location.postal_code,
            landmark: venueFormData.location.landmark
          },
          phone: venueFormData.phone,
          email: venueFormData.email,

          cuisine_types: [venueFormData.venueType],
          price_range: venueFormData.priceRange as any,
          is_active: venueFormData.isActive
        };
        
        const response = await venueService.updateVenue(editingVenue.id, updateData);
        if (response.success) {
          setSnackbar({ 
            open: true, 
            message: 'Venue updated successfully', 
            severity: 'success' 
          });
          // Refresh user data to get updated venue information
          await refreshUserData();
        }
      } else {
        // Create new venue
        const createData = {
          name: venueFormData.name,
          description: venueFormData.description,
          location: {
            address: venueFormData.location.address,
            city: venueFormData.location.city,
            state: venueFormData.location.state,
            country: venueFormData.location.country,
            postal_code: venueFormData.location.postal_code,
            landmark: venueFormData.location.landmark
          },
          phone: venueFormData.phone,
          email: venueFormData.email,

          cuisine_types: [venueFormData.venueType],
          price_range: venueFormData.priceRange as any,
          workspace_id: currentUser?.workspace_id || ''
        };
        
        const response = await venueService.createVenue(createData);
        if (response.success) {
          setSnackbar({ 
            open: true, 
            message: 'Venue created successfully', 
            severity: 'success' 
          });
          // Refresh user data to get updated venue information
          await refreshUserData();
        }
      }
      
      handleCloseVenueDialog();
    } catch (error: any) {
      console.error('Error saving venue:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to save venue', 
        severity: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('location.')) {
      const locationField = field.split('.')[1];
      setVenueFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setVenueFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSwitchVenue = async (venueId: string) => {
    // For single venue users, switching is not needed
    setSnackbar({ 
      open: true, 
      message: 'You are already using this venue', 
      severity: 'success' 
    });
  };

  const handleToggleVenueStatus = async (venueId: string, isOpen: boolean) => {
    try {
      // Update venue status via API
      const response = await venueService.updateVenue(venueId, { is_active: isOpen });
      if (response.success) {
        setSnackbar({ 
          open: true, 
          message: `Venue ${isOpen ? 'opened' : 'closed'} successfully`, 
          severity: 'success' 
        });
        // Refresh user data to get updated venue information
        await refreshUserData();
      }
    } catch (error: any) {
      console.error('Error toggling venue status:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to update venue status', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteVenue = async (venueId: string) => {
    try {
      const response = await venueService.deleteVenue(venueId);
      if (response.success) {
        setSnackbar({ 
          open: true, 
          message: 'Venue deleted successfully', 
          severity: 'success' 
        });
        // Refresh user data to get updated venue information
        await refreshUserData();
      }
    } catch (error: any) {
      console.error('Error deleting venue:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to delete venue', 
        severity: 'error' 
      });
    }
  };

  const canCreateVenues = hasPermission(PERMISSIONS.VENUE_ACTIVATE);
  const canDeleteItems = isSuperAdmin(); // Use proper role check

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Venues
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your venue locations
          </Typography>
        </Box>
        {canCreateVenues && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenVenueDialog()}
            size="large"
          >
            Add Venue
          </Button>
        )}
      </Box>

      {/* Venues Grid */}
      {venues.length > 0 ? (
        <Grid container spacing={3}>
          {venues.map((venue) => (
            <Grid item xs={12} sm={6} md={4} key={venue.id}>
              <Card
                sx={{
                  border: venue.id === currentVenue?.id ? '2px solid' : '1px solid',
                  borderColor: venue.id === currentVenue?.id ? 'secondary.main' : 'divider',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">
                      {venue.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, venue)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {venue.location?.address || 'No address available'}
                  </Typography>
                  
                  {venue.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
                      {venue.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={venue.is_active ? 'Active' : 'Inactive'}
                      color={venue.is_active ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={venue.is_open ? 'Open' : 'Closed'}
                      color={venue.is_open ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Button
                      size="small"
                      startIcon={venue.is_open ? <VisibilityOff /> : <Visibility />}
                      onClick={() => handleToggleVenueStatus(venue.id, !venue.is_open)}
                    >
                      {venue.is_open ? 'Close' : 'Open'}
                    </Button>
                    
                    {venue.id !== currentVenue?.id && (
                      <Button
                        size="small"
                        startIcon={<SwapHoriz />}
                        onClick={() => handleSwitchVenue(venue.id)}
                      >
                        Switch
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            p: 4,
          }}
        >
          <Restaurant
            sx={{
              fontSize: 80,
              color: 'text.secondary',
              mb: 2,
            }}
          />
          <Typography variant="h5" fontWeight="600" gutterBottom color="text.secondary">
            No Venues Found
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
            You haven't added any venues yet. Get started by creating your first venue location.
          </Typography>
          {canCreateVenues && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenVenueDialog()}
              size="large"
            >
              Add Your First Venue
            </Button>
          )}
        </Box>
      )}

      {/* Venue Dialog */}
      <Dialog open={openVenueDialog} onClose={handleCloseVenueDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Store color="primary" />
            {editingVenue ? 'Edit Venue' : 'Add New Venue'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Store color="primary" />
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Venue Name"
                value={String(venueFormData.name || '')}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Venue Type</InputLabel>
                <Select
                  value={String(venueFormData.venueType || 'restaurant')}
                  label="Venue Type"
                  onChange={(e) => handleInputChange('venueType', e.target.value)}
                >
                  {venueTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={String(venueFormData.description || '')}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={2}
                helperText="Describe your venue's atmosphere and specialties"
              />
            </Grid>

            {/* Location Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" />
                Location Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={String(venueFormData.location?.address || '')}
                onChange={(e) => handleInputChange('location.address', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={String(venueFormData.location?.city || '')}
                onChange={(e) => handleInputChange('location.city', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={String(venueFormData.location?.state || '')}
                onChange={(e) => handleInputChange('location.state', e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code (Optional)"
                value={String(venueFormData.location?.postal_code || '')}
                onChange={(e) => handleInputChange('location.postal_code', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={String(venueFormData.location?.country || 'India')}
                onChange={(e) => handleInputChange('location.country', e.target.value)}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                value={String(venueFormData.location?.landmark || '')}
                onChange={(e) => handleInputChange('location.landmark', e.target.value)}
                helperText="Nearby landmark to help customers find you"
              />
            </Grid>

            {/* Contact & Business Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Contact & Business Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={String(venueFormData.phone || '')}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email (Optional)"
                value={String(venueFormData.email || '')}
                onChange={(e) => handleInputChange('email', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            

            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={String(venueFormData.priceRange || 'mid_range')}
                  label="Price Range"
                  onChange={(e) => handleInputChange('priceRange', e.target.value)}
                >
                  {priceRangeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Average cost per person</FormHelperText>
              </FormControl>
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVenueDialog} disabled={saving}>Cancel</Button>
          <Button 
            onClick={handleSubmitVenue} 
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Saving...' : (editingVenue ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleOpenVenueDialog(selectedItem);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedItem) {
            handleToggleVenueStatus(selectedItem.id, !selectedItem.is_open);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            {selectedItem?.is_open ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {selectedItem?.is_open ? 'Close Venue' : 'Open Venue'}
          </ListItemText>
        </MenuItem>

        {canDeleteItems && (
          <MenuItem onClick={() => {
            if (window.confirm('Are you sure you want to delete this venue?')) {
              if (selectedItem) {
                handleDeleteVenue(selectedItem.id);
              }
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Snackbar for notifications */}
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

export default WorkspaceManagement;