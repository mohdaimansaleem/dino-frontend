import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Refresh,
  CachedOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import PermissionService from '../../services/permissionService';
import { PERMISSIONS } from '../../types/auth';
import { venueService } from '../../services/venueService';
import StorageManager from '../../utils/storageManager';

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
  const { user: currentUser, hasPermission, isSuperAdmin } = useAuth();
  const { userData, loading: userDataLoading, refreshUserData } = useUserData();
  const location = useLocation();
  
  // State management
  const [workspaceVenues, setWorkspaceVenues] = useState<any[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [openVenueDialog, setOpenVenueDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Cache key for workspace venues
  const workspaceCacheKey = useMemo(() => 
    userData?.workspace?.id ? `workspace_venues_${userData.workspace.id}` : null, 
    [userData?.workspace?.id]
  );

  // Extract venue data with caching
  const currentVenue = userData?.venue;
  const venues = useMemo(() => {
    return workspaceVenues.length > 0 ? workspaceVenues : (currentVenue ? [currentVenue] : []);
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
      console.log('No workspace ID available');
      setLoadingVenues(false);
      return;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh && workspaceCacheKey) {
      const cachedVenues = StorageManager.getItem(workspaceCacheKey);
      if (cachedVenues && Array.isArray(cachedVenues) && Date.now() - lastFetchTime < 5 * 60 * 1000) { // 5 minutes cache
        console.log('📦 Using cached workspace venues');
        setWorkspaceVenues(cachedVenues);
        setLoadingVenues(false);
        return;
      }
    }

    try {
      setLoadingVenues(true);
      console.log('🔄 Loading venues for workspace:', workspaceId);
      
      const venues = await venueService.getVenuesByWorkspace(workspaceId);
      console.log('✅ Loaded workspace venues:', venues);
      
      setWorkspaceVenues(venues);
      setLastFetchTime(Date.now());
      
      // Cache the results
      if (workspaceCacheKey) {
        StorageManager.setItem(workspaceCacheKey, venues, 10 * 60 * 1000); // 10 minutes TTL
      }
    } catch (error) {
      console.error('❌ Error loading workspace venues:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load workspace venues',
        severity: 'error'
      });
    } finally {
      setLoadingVenues(false);
    }
  }, [userData?.workspace?.id, workspaceCacheKey, lastFetchTime]);

  // Manual refresh function
  const refreshWorkspaceVenues = useCallback(async () => {
    if (workspaceCacheKey) {
      StorageManager.removeItem(workspaceCacheKey); // Clear cache
    }
    await loadWorkspaceVenues(true);
  }, [loadWorkspaceVenues, workspaceCacheKey]);

  // Load venues on component mount and workspace change
  useEffect(() => {
    if (userData?.workspace?.id && !userDataLoading) {
      loadWorkspaceVenues();
    }
  }, [userData?.workspace?.id, userDataLoading, loadWorkspaceVenues]);

  // Route-based refresh (only when navigating to workspace page)
  useEffect(() => {
    if ((location.pathname === '/admin/workspaces' || location.pathname === '/admin/workspace') && 
        userData?.workspace?.id && !userDataLoading && !loadingVenues) {
      // Only refresh if cache is stale (older than 2 minutes)
      if (Date.now() - lastFetchTime > 2 * 60 * 1000) {
        console.log('🎯 Route navigation detected - refreshing stale data');
        loadWorkspaceVenues(true);
      }
    }
  }, [location.pathname, userData?.workspace?.id, userDataLoading, loadingVenues, lastFetchTime, loadWorkspaceVenues]);

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
    return Object.keys(errors).length === 0;
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={loadingVenues ? <CachedOutlined className="animate-spin" /> : <Refresh />}
            onClick={refreshWorkspaceVenues}
            disabled={loadingVenues}
            size="large"
          >
            {loadingVenues ? 'Refreshing...' : 'Refresh'}
          </Button>
          {canCreateVenues && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenVenueDialog(true)}
              size="large"
            >
              Add Venue
            </Button>
          )}
        </Box>
      </Box>

      {/* Venues Grid */}
      {loadingVenues ? (
        <Grid container spacing={3}>
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