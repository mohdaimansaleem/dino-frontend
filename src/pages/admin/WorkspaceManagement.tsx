import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  Skeleton,
  keyframes,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  VisibilityOff,
  Restaurant,
  LocationOn,
  Email,
  Phone,
  Store,
  Refresh,
  CachedOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { PERMISSIONS } from '../../types/auth';
import { venueService } from '../../services/venueService';
import { PriceRange } from '../../types/api';
import StorageManager from '../../utils/storageManager';

// Animation for refresh icon
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

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

interface VenueFormData {
  name: string;
  description: string;
  venueType: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    landmark: string;
  };
  phone: string;
  email: string;
  priceRange: string;
  isActive: boolean;
  isOpen: boolean;
}

const WorkspaceManagement: React.FC = () => {
  const { hasPermission, isSuperAdmin } = useAuth();
  const { userData, loading: userDataLoading, refreshUserData } = useUserData();
  const location = useLocation();
  
  // State management
  const [workspaceVenues, setWorkspaceVenues] = useState<any[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false); // Start with false, will be set to true when loading starts
  const [openVenueDialog, setOpenVenueDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const lastFetchTimeRef = useRef<number>(0);

  // Cache key for workspace venues
  const workspaceCacheKey = useMemo(() => 
    userData?.workspace?.id ? `workspace_venues_${userData.workspace.id}` : null, 
    [userData?.workspace?.id]
  );

  // Extract venue data with caching
  const currentVenue = userData?.venue;
  const venues = useMemo(() => {
    // Always prioritize workspaceVenues if available, regardless of length
    if (workspaceVenues && Array.isArray(workspaceVenues)) {
      return workspaceVenues;
    }
    // Fallback to currentVenue only if workspaceVenues is null/undefined
    const fallback = currentVenue ? [currentVenue] : [];
    return fallback;
  }, [workspaceVenues, currentVenue]);

  const [venueFormData, setVenueFormData] = useState<VenueFormData>({
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

  // Optimized venue loading with caching
  const loadWorkspaceVenues = useCallback(async (forceRefresh = false) => {
    const workspaceId = userData?.workspace?.id;
    if (!workspaceId) {
      setLoadingVenues(false);
      setWorkspaceVenues([]);
      return;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh && workspaceCacheKey) {
      const cachedVenues = StorageManager.getItem(workspaceCacheKey);
      const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
      
      if (cachedVenues && Array.isArray(cachedVenues) && timeSinceLastFetch < 2 * 60 * 1000) { // 2 minutes cache
        setWorkspaceVenues(cachedVenues);
        setLoadingVenues(false);
        return;
      }
    }

    try {
      setLoadingVenues(true);
      
      const venues = await venueService.getVenuesByWorkspace(workspaceId);
      
      setWorkspaceVenues(venues || []);
      const now = Date.now();
      setLastFetchTime(now);
      lastFetchTimeRef.current = now;
      
      // Cache the results
      if (workspaceCacheKey && venues) {
        StorageManager.setItem(workspaceCacheKey, venues, 10 * 60 * 1000); // 10 minutes TTL
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load workspace venues',
        severity: 'error'
      });
      setWorkspaceVenues([]);
    } finally {
      setLoadingVenues(false);
    }
  }, [userData?.workspace?.id, workspaceCacheKey]);

  // Manual refresh function
  const refreshWorkspaceVenues = useCallback(async () => {
    if (workspaceCacheKey) {
      StorageManager.removeItem(workspaceCacheKey); // Clear cache
    }
    await loadWorkspaceVenuesRef.current(true);
  }, [workspaceCacheKey]);

  // Stable reference to avoid infinite loops
  const loadWorkspaceVenuesRef = useRef(loadWorkspaceVenues);
  loadWorkspaceVenuesRef.current = loadWorkspaceVenues;

  // Initial load when component mounts
  useEffect(() => {
    if (userData?.workspace?.id && !userDataLoading) {
      // Always force load on initial mount to ensure venues are displayed
      loadWorkspaceVenuesRef.current(true);
    }
  }, [userData?.workspace?.id, userDataLoading]);

  // Additional effect to ensure venues load when component first mounts
  useEffect(() => {
    if (userData?.workspace?.id) {
      loadWorkspaceVenuesRef.current(true);
    }
  }, []); // Empty dependency array - runs only once on mount

  // Fallback effect - ensure venues are loaded when workspace data becomes available
  useEffect(() => {
    if (userData?.workspace?.id && !userDataLoading && workspaceVenues.length === 0 && !loadingVenues) {
      loadWorkspaceVenuesRef.current(true);
    }
  }, [userData?.workspace?.id, userDataLoading, workspaceVenues.length, loadingVenues]);

  // Route-based refresh (when navigating to workspace page)
  useEffect(() => {
    if ((location.pathname === '/admin/workspaces' || location.pathname === '/admin/workspace') && 
        userData?.workspace?.id && !userDataLoading) {
      
      // If no venues are loaded or cache is stale, load venues
      if (workspaceVenues.length === 0 || Date.now() - lastFetchTimeRef.current > 2 * 60 * 1000) {
        loadWorkspaceVenuesRef.current(true);
      }
    }
  }, [location.pathname, userData?.workspace?.id, userDataLoading, workspaceVenues.length]);

  // Form validation
  const validateVenueForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!venueFormData.name.trim()) {
      errors.name = 'Venue name is required';
    } else if (venueFormData.name.length < 1) {
      errors.name = 'Venue name must have at least 1 character';
    } else if (venueFormData.name.length > 100) {
      errors.name = 'Venue name must not exceed 100 characters';
    }

    if (!venueFormData.location.address.trim()) {
      errors.address = 'Address is required';
    } else if (venueFormData.location.address.length < 5) {
      errors.address = 'Address must have at least 5 characters';
    }

    if (!venueFormData.location.city.trim()) {
      errors.city = 'City is required';
    }

    if (!venueFormData.location.state.trim()) {
      errors.state = 'State is required';
    }

    if (!venueFormData.location.postal_code.trim()) {
      errors.postal_code = 'Postal code is required';
    } else if (venueFormData.location.postal_code.length < 3) {
      errors.postal_code = 'Postal code must have at least 3 characters';
    }

    if (!venueFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(venueFormData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!venueFormData.email.trim()) {
      errors.email = 'Venue email is required';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(venueFormData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    return isValid;
  }, [venueFormData]);

  // Helper functions
  const getFieldError = useCallback((fieldName: string): string => {
    return validationErrors[fieldName] || '';
  }, [validationErrors]);

  const hasFieldError = useCallback((fieldName: string): boolean => {
    return !!validationErrors[fieldName];
  }, [validationErrors]);

  // Permission checks
  const canCreateVenues = hasPermission(PERMISSIONS.VENUE_ACTIVATE);
  const canDeleteItems = isSuperAdmin();

  // Loading state
  if (userDataLoading) {
    return (
      <Container maxWidth="xl" sx={{ pt: { xs: '56px', sm: '64px' }, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading workspace data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        pt: { xs: '56px', sm: '64px' },
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
        maxWidth: '100%',
        overflow: 'visible',
        minHeight: { xs: 'calc(100vh - 120px)', sm: 'auto' }, // Ensure content fits in mobile
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="600"
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
              letterSpacing: '-0.01em'
            }}
          >
            Workspace Venues
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all venues in your workspace
          </Typography>
          {userData?.workspace && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Workspace: {userData.workspace.name || userData.workspace.display_name}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {canCreateVenues && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenVenueDialog(true)}
              size="large"
            >
              Venue
            </Button>
          )}

          <IconButton
            onClick={refreshWorkspaceVenues}
            disabled={loadingVenues}
            size="large"
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main',
                color: 'primary.main',
              },
              '&:disabled': {
                opacity: 0.5,
              },
            }}
            title={loadingVenues ? 'Refreshing...' : 'Refresh venues'}
          >
            {loadingVenues ? (
              <CachedOutlined sx={{ animation: `${spin} 1s linear infinite` }} />
            ) : (
              <Refresh />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* Venues Grid */}
      {loadingVenues ? (
        <Grid container spacing={3} sx={{ width: '100%', m: 0 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={60} height={24} />
                    <Skeleton variant="rectangular" width={60} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : venues.length > 0 ? (
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
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">
                      {venue.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedItem(venue);
                      }}
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
              onClick={() => setOpenVenueDialog(true)}
              size="large"
            >
              Add Your First Venue
            </Button>
          )}
        </Box>
      )}

      {/* Venue Creation/Edit Dialog */}
      <Dialog
        open={openVenueDialog}
        onClose={() => {
          setOpenVenueDialog(false);
          setEditingVenue(null);
          setValidationErrors({});
          // Reset form data
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
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Restaurant color="primary" />
            <Typography variant="h6" fontWeight="600">
              {editingVenue ? 'Edit Venue' : 'Add New Venue'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 3, sm: 4 },
          minHeight: '600px'
        }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Venue Name"
                value={venueFormData.name}
                onChange={(e) => setVenueFormData(prev => ({ ...prev, name: e.target.value }))}
                error={hasFieldError('name')}
                helperText={getFieldError('name')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Store />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Venue Type</InputLabel>
                <Select
                  value={venueFormData.venueType}
                  label="Venue Type"
                  onChange={(e) => setVenueFormData(prev => ({ ...prev, venueType: e.target.value }))}
                >
                  {venueTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={venueFormData.description}
                onChange={(e) => setVenueFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                placeholder="Brief description of your venue..."
              />
            </Grid>
            
            {/* Location Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Location Details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={venueFormData.location.address}
                onChange={(e) => setVenueFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value }
                }))}
                error={hasFieldError('address')}
                helperText={getFieldError('address')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={venueFormData.location.city}
                onChange={(e) => setVenueFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, city: e.target.value }
                }))}
                error={hasFieldError('city')}
                helperText={getFieldError('city')}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State"
                value={venueFormData.location.state}
                onChange={(e) => setVenueFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, state: e.target.value }
                }))}
                error={hasFieldError('state')}
                helperText={getFieldError('state')}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={venueFormData.location.postal_code}
                onChange={(e) => setVenueFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, postal_code: e.target.value }
                }))}
                error={hasFieldError('postal_code')}
                helperText={getFieldError('postal_code')}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={venueFormData.location.country}
                onChange={(e) => setVenueFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, country: e.target.value }
                }))}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                value={venueFormData.location.landmark}
                onChange={(e) => setVenueFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, landmark: e.target.value }
                }))}
                placeholder="Near famous landmark or building..."
              />
            </Grid>
            
            {/* Contact Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={venueFormData.phone}
                onChange={(e) => setVenueFormData(prev => ({ ...prev, phone: e.target.value }))}
                error={hasFieldError('phone')}
                helperText={getFieldError('phone') || 'Enter 10-digit phone number'}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={venueFormData.email}
                onChange={(e) => setVenueFormData(prev => ({ ...prev, email: e.target.value }))}
                error={hasFieldError('email')}
                helperText={getFieldError('email')}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Additional Settings */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Additional Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={venueFormData.priceRange}
                  label="Price Range"
                  onChange={(e) => setVenueFormData(prev => ({ ...prev, priceRange: e.target.value }))}
                >
                  {priceRangeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Expected price range per person</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={venueFormData.isActive}
                      onChange={(e) => setVenueFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      color="primary"
                    />
                  }
                  label="Active Venue"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={venueFormData.isOpen}
                      onChange={(e) => setVenueFormData(prev => ({ ...prev, isOpen: e.target.checked }))}
                      color="success"
                    />
                  }
                  label="Currently Open"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => {
              setOpenVenueDialog(false);
              setEditingVenue(null);
              setValidationErrors({});
            }}
            disabled={saving}
            size="large"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!validateVenueForm()) {
                setSnackbar({
                  open: true,
                  message: 'Please fix the validation errors before saving',
                  severity: 'error'
                });
                return;
              }

              try {
                setSaving(true);
                
                // Ensure workspace ID exists
                const workspaceId = userData?.workspace?.id;
                if (!workspaceId) {
                  throw new Error('No workspace selected. Please select a workspace first.');
                }
                
                const venueData = {
                  name: venueFormData.name,
                  description: venueFormData.description,
                  venue_type: venueFormData.venueType,
                  location: venueFormData.location,
                  phone: venueFormData.phone,
                  email: venueFormData.email,
                  price_range: venueFormData.priceRange as PriceRange,
                  cuisine_types: [venueFormData.venueType], // Default to venue type as cuisine
                  is_active: venueFormData.isActive,
                  is_open: venueFormData.isOpen,
                  workspace_id: workspaceId
                };

                if (editingVenue) {
                  // Update existing venue - only send updatable fields
                  const updateData = {
                    name: venueFormData.name,
                    description: venueFormData.description,
                    location: venueFormData.location,
                    phone: venueFormData.phone,
                    email: venueFormData.email,
                    price_range: venueFormData.priceRange as PriceRange,
                    is_active: venueFormData.isActive,
                    is_open: venueFormData.isOpen,
                  };
                  await venueService.updateVenue(editingVenue.id, updateData);
                  setSnackbar({
                    open: true,
                    message: 'Venue updated successfully!',
                    severity: 'success'
                  });
                } else {
                  // Create new venue
                  await venueService.createVenue(venueData);
                  setSnackbar({
                    open: true,
                    message: 'Venue created successfully!',
                    severity: 'success'
                  });
                }

                // Refresh venues list
                await refreshWorkspaceVenues();
                
                // Refresh user data to get updated venue info
                await refreshUserData();
                
                // Reset form data
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
                
                // Close dialog
                setOpenVenueDialog(false);
                setEditingVenue(null);
                setValidationErrors({});
                
              } catch (error: any) {
                setSnackbar({
                  open: true,
                  message: error.message || 'Failed to save venue',
                  severity: 'error'
                });
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Add />}
            size="large"
          >
            {saving ? 'Saving...' : (editingVenue ? 'Update Venue' : 'Create Venue')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedItem(null);
        }}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedItem) {
              // Populate form with existing venue data
              setVenueFormData({
                name: selectedItem.name || '',
                description: selectedItem.description || '',
                venueType: selectedItem.venue_type || 'restaurant',
                location: {
                  address: selectedItem.location?.address || '',
                  city: selectedItem.location?.city || '',
                  state: selectedItem.location?.state || '',
                  country: selectedItem.location?.country || 'India',
                  postal_code: selectedItem.location?.postal_code || '',
                  landmark: selectedItem.location?.landmark || ''
                },
                phone: selectedItem.phone || '',
                email: selectedItem.email || '',
                priceRange: selectedItem.price_range || 'mid_range',
                isActive: selectedItem.is_active ?? true,
                isOpen: selectedItem.is_open ?? true,
              });
              setEditingVenue(selectedItem);
              setOpenVenueDialog(true);
            }
            setAnchorEl(null);
            setSelectedItem(null);
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Venue</ListItemText>
        </MenuItem>
        
        <MenuItem
          onClick={() => {
            // Toggle venue status
            if (selectedItem) {
              // Implementation for toggling venue status
            }
            setAnchorEl(null);
            setSelectedItem(null);
          }}
        >
          <ListItemIcon>
            {selectedItem?.is_open ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {selectedItem?.is_open ? 'Close Venue' : 'Open Venue'}
          </ListItemText>
        </MenuItem>
        
        {canDeleteItems && (
          <MenuItem
            onClick={() => {
              // Delete venue
              if (selectedItem) {
                // Implementation for deleting venue
              }
              setAnchorEl(null);
              setSelectedItem(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Venue</ListItemText>
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