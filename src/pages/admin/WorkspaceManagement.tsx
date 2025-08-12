import React, { useState, useEffect, useRef } from 'react';
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
  const location = useLocation();
  
  // State for workspace venues
  const [workspaceVenues, setWorkspaceVenues] = useState<any[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  
  // Extract venue data from userData (fallback)
  const currentVenue = userData?.venue;
  const venues = workspaceVenues.length > 0 ? workspaceVenues : (currentVenue ? [currentVenue] : []);

  const [openVenueDialog, setOpenVenueDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Track if venues have been loaded for this navigation
  const venuesLoadedRef = useRef(false);
  const lastWorkspaceIdRef = useRef<string | null>(null);

  // Manual refresh function for venues
  const refreshWorkspaceVenues = async () => {
    if (!userData?.workspace?.id) {
      console.log('No workspace ID available for refresh');
      return;
    }

    try {
      setLoadingVenues(true);
      console.log('🔄 Manually refreshing venues for workspace:', userData.workspace.id);
      
      const venues = await venueService.getVenuesByWorkspace(userData.workspace.id);
      console.log('✅ Manually refreshed workspace venues:', venues);
      
      setWorkspaceVenues(venues);
      venuesLoadedRef.current = true;
      lastWorkspaceIdRef.current = userData.workspace.id;
    } catch (error) {
      console.error('❌ Error manually refreshing workspace venues:', error);
      setSnackbar({
        open: true,
        message: 'Failed to refresh workspace venues',
        severity: 'error'
      });
      venuesLoadedRef.current = false;
    } finally {
      setLoadingVenues(false);
    }
  };

  // Helper function to get error message for a field
  const getFieldError = (fieldName: string): string => {
    return validationErrors[fieldName] || '';
  };

  // Helper function to check if field has any error
  const hasFieldError = (fieldName: string): boolean => {
    return !!validationErrors[fieldName];
  };

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
    setValidationErrors({});
  };

  const validateVenueForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Venue name validation
    if (!venueFormData.name.trim()) {
      errors.name = 'Venue name is required';
    } else if (venueFormData.name.length < 1) {
      errors.name = 'Venue name must have at least 1 character';
    } else if (venueFormData.name.length > 100) {
      errors.name = 'Venue name must not exceed 100 characters';
    }

    // Address validation
    if (!venueFormData.location.address.trim()) {
      errors.address = 'Address is required';
    } else if (venueFormData.location.address.length < 5) {
      errors.address = 'Address must have at least 5 characters';
    }

    // City validation
    if (!venueFormData.location.city.trim()) {
      errors.city = 'City is required';
    }

    // State validation
    if (!venueFormData.location.state.trim()) {
      errors.state = 'State is required';
    }

    // Postal code validation
    if (!venueFormData.location.postal_code.trim()) {
      errors.postal_code = 'Postal code is required';
    } else if (venueFormData.location.postal_code.length < 3) {
      errors.postal_code = 'Postal code must have at least 3 characters';
    }

    // Phone validation
    if (!venueFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(venueFormData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    // Email validation (required)
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
  };

  const handleSubmitVenue = async () => {
    if (!validateVenueForm()) {
      setSnackbar({ 
        open: true, 
        message: 'Please fix the highlighted errors and try again.', 
        severity: 'error' 
      });
      return;
    }

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
          
          // Refresh workspace venues list
          await refreshWorkspaceVenues();
          
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
          
          // Refresh workspace venues list
          await refreshWorkspaceVenues();
          
          // Also refresh user data
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
    // Convert email fields to lowercase
    if (field === 'email') {
      value = typeof value === 'string' ? value.toLowerCase() : value;
    }
    
    // Restrict phone numbers to digits only (max 10 digits)
    if (field === 'phone') {
      value = typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 10) : value;
    }
    
    // Restrict postal code to digits only (max 6 digits for Indian postal codes)
    if (field === 'location.postal_code') {
      value = typeof value === 'string' ? value.replace(/\D/g, '').slice(0, 6) : value;
    }

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

    // Clear validation error for this field
    const errorKey = field.startsWith('location.') ? field.split('.')[1] : field;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: ''
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
        
        // Refresh workspace venues list
        await refreshWorkspaceVenues();
        
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
        
        // Refresh workspace venues list
        await refreshWorkspaceVenues();
        
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

  // Load workspace venues when component mounts, userData changes, or workspace changes
  // This ensures API calls are made every time user visits the workspace section
  useEffect(() => {
    const loadWorkspaceVenues = async (forceReload = false) => {
      const currentWorkspaceId = userData?.workspace?.id;
      
      if (!currentWorkspaceId) {
        console.log('No workspace ID available');
        setLoadingVenues(false);
        venuesLoadedRef.current = false;
        return;
      }

      // Check if we need to reload venues
      const workspaceChanged = lastWorkspaceIdRef.current !== currentWorkspaceId;
      const shouldLoad = forceReload || workspaceChanged || !venuesLoadedRef.current;
      
      // For workspace navigation, we want to always make API calls (similar to menu management)
      // So we'll skip the early return and always load when user navigates to workspace
      if (!shouldLoad && !forceReload) {
        console.log('Venues already loaded for this workspace, but forcing refresh for workspace navigation...');
        // Don't return here - continue with the API call
      }

      try {
        setLoadingVenues(true);
        console.log('🔄 Loading venues for workspace:', currentWorkspaceId, {
          forceReload,
          workspaceChanged,
          venuesLoaded: venuesLoadedRef.current
        });
        
        const venues = await venueService.getVenuesByWorkspace(currentWorkspaceId);
        console.log('✅ Loaded workspace venues:', venues);
        
        setWorkspaceVenues(venues);
        venuesLoadedRef.current = true;
        lastWorkspaceIdRef.current = currentWorkspaceId;
      } catch (error) {
        console.error('❌ Error loading workspace venues:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load workspace venues',
          severity: 'error'
        });
        venuesLoadedRef.current = false;
      } finally {
        setLoadingVenues(false);
      }
    };

    // Load venues when userData is available and not loading
    if (userData && !userDataLoading) {
      loadWorkspaceVenues();
    }
  }, [userData, userDataLoading]);

  // Force reload venues when component mounts (user navigates to workspace page)
  // This ensures API calls are made every time user navigates to workspace section
  useEffect(() => {
    console.log('🎯 WorkspaceManagement component mounted - user navigated to workspace page');
    
    // Always reset the loaded flag to force a fresh load on every navigation
    venuesLoadedRef.current = false;
    
    // If userData is already available, trigger immediate load
    if (userData?.workspace?.id && !userDataLoading) {
      console.log('🔄 Triggering immediate venues load on navigation (forced refresh)');
      const loadVenuesOnMount = async () => {
        const workspaceId = userData?.workspace?.id;
        if (!workspaceId) return;
        
        try {
          setLoadingVenues(true);
          console.log('📡 Making API call to load workspace venues on navigation...');
          const venues = await venueService.getVenuesByWorkspace(workspaceId);
          console.log('✅ Loaded venues on navigation:', venues);
          setWorkspaceVenues(venues);
          venuesLoadedRef.current = true;
          lastWorkspaceIdRef.current = workspaceId;
        } catch (error) {
          console.error('❌ Error loading venues on navigation:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load workspace venues',
            severity: 'error'
          });
        } finally {
          setLoadingVenues(false);
        }
      };
      
      loadVenuesOnMount();
    }
  }, []); // Empty dependency - runs only when component mounts

  // Detect navigation to workspace page via route changes
  // This ensures API calls are made every time user navigates to workspace section
  useEffect(() => {
    if (location.pathname === '/admin/workspaces' || location.pathname === '/admin/workspace') {
      console.log('🎯 Navigation detected to workspace page via route change:', location.pathname);
      
      // Always reset loaded flag to force fresh load on every route navigation
      venuesLoadedRef.current = false;
      
      // Trigger venues load if userData is available
      if (userData?.workspace?.id && !userDataLoading) {
        console.log('🔄 Triggering venues load due to route navigation (forced API call)');
        const loadVenuesOnRouteChange = async () => {
          const workspaceId = userData?.workspace?.id;
          if (!workspaceId) return;
          
          try {
            setLoadingVenues(true);
            console.log('📡 Making API call to load workspace venues on route change...');
            const venues = await venueService.getVenuesByWorkspace(workspaceId);
            console.log('✅ Loaded venues on route change:', venues);
            setWorkspaceVenues(venues);
            venuesLoadedRef.current = true;
            lastWorkspaceIdRef.current = workspaceId;
          } catch (error) {
            console.error('❌ Error loading venues on route change:', error);
            setSnackbar({
              open: true,
              message: 'Failed to load workspace venues',
              severity: 'error'
            });
          } finally {
            setLoadingVenues(false);
          }
        };
        
        loadVenuesOnRouteChange();
      }
    }
  }, [location.pathname, userData?.workspace?.id, userDataLoading]); // Trigger on route or data changes

  // Additional effect to ensure API calls on workspace navigation (similar to MenuManagement pattern)
  useEffect(() => {
    console.log('🔄 WorkspaceManagement navigation effect triggered');
    console.log('- userDataLoading:', userDataLoading);
    console.log('- userData:', userData);
    console.log('- location.pathname:', location.pathname);
    
    // Only proceed if we're on workspace route and userData is ready
    if ((location.pathname === '/admin/workspaces' || location.pathname === '/admin/workspace') && 
        userData?.workspace?.id && !userDataLoading) {
      
      console.log('📡 Making API call for workspace navigation (ensuring fresh data)...');
      
      // Force a fresh API call every time user navigates to workspace
      const forceLoadWorkspaceData = async () => {
        const workspaceId = userData.workspace?.id;
        if (!workspaceId) {
          console.log('No workspace ID available for forced load');
          return;
        }
        
        try {
          setLoadingVenues(true);
          const venues = await venueService.getVenuesByWorkspace(workspaceId);
          console.log('✅ Fresh workspace venues loaded:', venues);
          setWorkspaceVenues(venues);
          venuesLoadedRef.current = true;
          lastWorkspaceIdRef.current = workspaceId;
        } catch (error) {
          console.error('❌ Error loading fresh workspace venues:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load workspace venues',
            severity: 'error'
          });
        } finally {
          setLoadingVenues(false);
        }
      };
      
      forceLoadWorkspaceData();
    }
  }, [location.pathname, userData, userDataLoading]); // Trigger whenever these change

  // Handle page visibility changes (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && (location.pathname === '/admin/workspaces' || location.pathname === '/admin/workspace')) {
        console.log('🔄 Page became visible on workspace route - checking if venues need refresh');
        
        // Only refresh if we haven't loaded venues for this workspace yet
        if (!venuesLoadedRef.current && userData?.workspace?.id && !userDataLoading) {
          console.log('🔄 Triggering venues load due to page visibility change');
          refreshWorkspaceVenues();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname, userData?.workspace?.id, userDataLoading]);

  const canCreateVenues = hasPermission(PERMISSIONS.VENUE_ACTIVATE);
  const canDeleteItems = isSuperAdmin(); // Use proper role check

  // Show loading state
  if (userDataLoading || loadingVenues) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading workspace venues...
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
            startIcon={<Refresh />}
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
              onClick={() => handleOpenVenueDialog()}
              size="large"
            >
              Add Venue
            </Button>
          )}
        </Box>
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
                error={hasFieldError('name')}
                helperText={getFieldError('name')}
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
                error={hasFieldError('address')}
                helperText={getFieldError('address')}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={String(venueFormData.location?.city || '')}
                onChange={(e) => handleInputChange('location.city', e.target.value)}
                error={hasFieldError('city')}
                helperText={getFieldError('city')}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={String(venueFormData.location?.state || '')}
                onChange={(e) => handleInputChange('location.state', e.target.value)}
                error={hasFieldError('state')}
                helperText={getFieldError('state')}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={String(venueFormData.location?.postal_code || '')}
                onChange={(e) => handleInputChange('location.postal_code', e.target.value)}
                error={hasFieldError('postal_code')}
                helperText={getFieldError('postal_code') || 'Enter 6-digit postal code'}
                required
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 6
                }}
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
                error={hasFieldError('phone')}
                helperText={getFieldError('phone') || 'Required: Exactly 10 digits'}
                required
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 10
                }}
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
                label="Email"
                value={String(venueFormData.email || '')}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={hasFieldError('email')}
                helperText={getFieldError('email') || 'Required: Business email address'}
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