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
  Stack,
  alpha,
  useTheme,
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
  Business,
  CheckCircle,
  Cancel,
  TrendingUp,
  LocalCafe,
  Fastfood,
  LocalBar,
  LocalDining,
  LocalShipping,
  Kitchen,
  MoreHoriz,
  AttachMoney,
  Public,
  Home,
  Apartment,
  Map,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useVenueTheme } from '../../contexts/VenueThemeContext';
import { useUserData } from '../../contexts/UserDataContext';
import { PERMISSIONS } from '../../types/auth';
import { venueService } from '../../services/business';
import { PriceRange } from '../../types/api';

import { DeleteConfirmationModal } from '../../components/modals';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

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

// Function to get venue type icon
const getVenueTypeIcon = (venueType: string) => {
  switch (venueType?.toLowerCase()) {
    case 'restaurant':
    case 'fine_dining':
      return <Store />;
    case 'cafe':
      return <LocalCafe />;
    case 'bar':
      return <LocalBar />;
    case 'fast_food':
    case 'food_truck':
      return <Fastfood />;
    case 'bakery':
      return <LocalDining />;
    case 'cloud_kitchen':
      return <Kitchen />;
    default:
      return <Store />;
  }
};

// Function to get venue type color
const getVenueTypeColor = (venueType: string) => {
  switch (venueType?.toLowerCase()) {
    case 'restaurant':
    case 'fine_dining':
      return '#d32f2f';
    case 'cafe':
      return '#8d6e63';
    case 'bar':
      return '#7b1fa2';
    case 'fast_food':
    case 'food_truck':
      return '#ff9800';
    case 'bakery':
      return '#f57c00';
    case 'cloud_kitchen':
      return '#455a64';
    default:
      return '#2196f3';
  }
};

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
  theme: string;
  isOpen: boolean;
}

/**
 * WorkspaceManagement Component
 * 
 * This component ONLY calls the venues API when the user clicks on the workspace module.
 * It does not make any other API calls for workspace data, user data, or other resources.
 * 
 * API Calls Made:
 * - venueService.getVenuesByWorkspace(workspaceId) - Gets venues for the current workspace
 * 
 * All other data (workspace info, user data) comes from existing context/storage.
 */
const WorkspaceManagement: React.FC = () => {
  const { hasPermission, isSuperAdmin } = useAuth();
  const { userData, loading: userDataLoading } = useUserData(); // Removed refreshUserData to prevent API calls
  const location = useLocation();
  const { setTheme } = useVenueTheme();
  const theme = useTheme();
  
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

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    venueId: '',
    venueName: '',
    loading: false
  });



  // Extract venue data with caching
  const currentVenue = userData?.venue;
  const venues = useMemo(() => {
    // Always prioritize workspaceVenues if available, regardless of length
    if (workspaceVenues && Array.isArray(workspaceVenues)) {
      // Sort venues to put the selected/current venue first
      const sortedVenues = [...workspaceVenues].sort((a, b) => {
        // If 'a' is the current venue, it should come first (return -1)
        if (currentVenue && a.id === currentVenue.id) return -1;
        // If 'b' is the current venue, it should come first (return 1)
        if (currentVenue && b.id === currentVenue.id) return 1;
        // Otherwise, maintain original order
        return 0;
      });
      return sortedVenues;
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
    theme: 'pet', // Default to pet theme as requested
  });

  // Load workspace venues directly (no caching) - ONLY calls venues API
  const loadWorkspaceVenues = useCallback(async (forceRefresh = false) => {
    const workspaceId = userData?.workspace?.id;
    if (!workspaceId) {
      setLoadingVenues(false);
      setWorkspaceVenues([]);
      return;
    }

    try {
      setLoadingVenues(true);
      console.log('🏢 WorkspaceManagement: Calling venues API for workspace:', workspaceId);
      
      // ONLY API CALL: Get venues by workspace (Venus API)
      const venues = await venueService.getVenuesByWorkspace(workspaceId);
      console.log('✅ WorkspaceManagement: Venues API response:', venues);
      
      setWorkspaceVenues(venues || []);
      const now = Date.now();
      setLastFetchTime(now);
      lastFetchTimeRef.current = now;
    } catch (error) {
      console.error('❌ WorkspaceManagement: Error calling venues API:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load workspace venues',
        severity: 'error'
      });
      setWorkspaceVenues([]);
    } finally {
      setLoadingVenues(false);
    }
  }, [userData?.workspace?.id]);

  // Manual refresh function
  const refreshWorkspaceVenues = useCallback(async () => {
    await loadWorkspaceVenuesRef.current(true);
  }, []);

  // Stable reference to avoid infinite loops
  const loadWorkspaceVenuesRef = useRef(loadWorkspaceVenues);
  loadWorkspaceVenuesRef.current = loadWorkspaceVenues;

  // Initial load when component mounts - ONLY calls venues API
  useEffect(() => {
    if (userData?.workspace?.id && !userDataLoading) {
      console.log('🏢 WorkspaceManagement: Component mounted, calling venues API for workspace:', userData.workspace.id);
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

  // Route-based refresh (when navigating to workspace page) - ONLY calls venues API
  useEffect(() => {
    if ((location.pathname === '/admin/workspaces' || location.pathname === '/admin/workspace') && 
        userData?.workspace?.id && !userDataLoading) {
      
      console.log('🏢 WorkspaceManagement: User clicked on workspace module, checking if venues API call needed');
      
      // If no venues are loaded or cache is stale, call ONLY venues API
      if (workspaceVenues.length === 0 || Date.now() - lastFetchTimeRef.current > 2 * 60 * 1000) {
        console.log('🏢 WorkspaceManagement: Calling venues API due to route navigation');
        loadWorkspaceVenuesRef.current(true);
      } else {
        console.log('🏢 WorkspaceManagement: Using cached venues data, no API call needed');
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

  // Delete venue confirmation
  const confirmDeleteVenue = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      await venueService.deleteVenue(deleteModal.venueId);
      setSnackbar({
        open: true,
        message: `Venue "${deleteModal.venueName}" deleted successfully`,
        severity: 'success'
      });
      
      // Refresh venues list
      await refreshWorkspaceVenues();
      // Note: Not refreshing user data to avoid unnecessary API calls
      
      setDeleteModal({ open: false, venueId: '', venueName: '', loading: false });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete venue',
        severity: 'error'
      });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Loading state
  if (userDataLoading) {
    return (
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, py: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading workspace data...
          </Typography>
        </Box>
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
                <Restaurant sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
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
                  Workspace Venues
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
                Centralized management for all your restaurant locations and venues
              </Typography>

              {userData?.workspace && (
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
                  <Store sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                  <Typography variant="body2" fontWeight="500" color="text.primary">
                    {userData.workspace.name || userData.workspace.display_name}
                  </Typography>
                </Box>
              )}
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
              {canCreateVenues && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenVenueDialog(true)}
                  size="medium"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Add New Venue
                </Button>
              )}

              <IconButton
                onClick={refreshWorkspaceVenues}
                disabled={loadingVenues}
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
        {/* Stats Section */}
        {venues.length > 0 && (
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 2 }}>
            <Box sx={{ 
              px: { xs: 3, sm: 4 }, 
              py: { xs: 3, sm: 4 }, 
              backgroundColor: 'background.paper', 
              borderRadius: 3, 
              mb: 4,
              border: `1px solid ${theme.palette.grey[100]}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ mb: 3 }}>
                Workspace Overview
              </Typography>
              
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {[
                  { 
                    label: 'Total Venues', 
                    value: venues.length, 
                    color: '#2196F3', 
                    icon: <Business />,
                    description: 'All workspace venues'
                  },
                  { 
                    label: 'Active Venues', 
                    value: venues.filter(v => v.is_active).length, 
                    color: '#4CAF50', 
                    icon: <CheckCircle />,
                    description: 'Currently active'
                  },
                  { 
                    label: 'Currently Open', 
                    value: venues.filter(v => v.is_open).length, 
                    color: '#FF9800', 
                    icon: <Store />,
                    description: 'Open for business'
                  },
                  { 
                    label: 'Selected Venue', 
                    value: currentVenue ? '1' : '0', 
                    color: '#9C27B0', 
                    icon: <TrendingUp />,
                    description: 'Currently selected'
                  },
                ].map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        borderRadius: 2,
                        backgroundColor: alpha(stat.color, 0.05),
                        border: `1px solid ${alpha(stat.color, 0.2)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(stat.color, 0.2)}`,
                          backgroundColor: alpha(stat.color, 0.08),
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {/* Icon on the left */}
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            backgroundColor: stat.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0,
                          }}
                        >
                          {React.cloneElement(stat.icon, { fontSize: 'medium' })}
                        </Box>
                        
                        {/* Text content on the right */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h4" 
                            fontWeight="700" 
                            color="text.primary" 
                            sx={{ 
                              fontSize: { xs: '1.5rem', sm: '2rem' },
                              lineHeight: 1.2,
                              mb: 0.5
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            fontWeight="600"
                            sx={{ 
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              lineHeight: 1.2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}

        {/* Section Header */}
        <Box sx={{ mb: 4, px: { xs: 3, sm: 4 }, py: 2 }}>
          <Typography
            variant="h6"
            fontWeight="600"
            color="text.primary"
            gutterBottom
            sx={{ fontSize: { xs: '1.25rem', sm: '1.375rem' }, mb: 1 }}
          >
            Your Venues
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
            {venues.length > 0 
              ? `Manage and monitor all ${venues.length} venue${venues.length > 1 ? 's' : ''} in your workspace`
              : 'No venues found in your workspace'
            }
          </Typography>
        </Box>

      {/* Venues Grid */}
      <Box sx={{ px: { xs: 3, sm: 4 }, pb: 4 }}>
      {loadingVenues ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} lg={4} xl={3} key={i}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  height: '100%',
                }}
              >
                {/* Header Skeleton */}
                <Box sx={{ p: 3, pb: 2, backgroundColor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1, pr: 2 }}>
                      <Skeleton variant="text" width="70%" height={28} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </Box>

                {/* Content Skeleton */}
                <CardContent sx={{ p: 3, pt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Skeleton variant="circular" width={18} height={18} sx={{ mt: 0.2, mr: 1 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="90%" height={20} />
                      <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>

                  <Skeleton variant="text" width="85%" height={20} sx={{ mb: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton variant="circular" width={16} height={16} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width="50%" height={20} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Skeleton variant="circular" width={16} height={16} sx={{ mr: 1 }} />
                      <Skeleton variant="text" width="70%" height={20} />
                    </Box>
                  </Box>

                  <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2, mb: 2 }} />
                </CardContent>

                {/* Footer Skeleton */}
                <Box sx={{ p: 3, pt: 0, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 2 }} />
                      <Skeleton variant="rectangular" width={45} height={24} sx={{ borderRadius: 2 }} />
                    </Box>
                    <Skeleton variant="text" width={60} height={16} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : venues.length > 0 ? (
        <Grid container spacing={3}>
          {venues.map((venue) => (
            <Grid item xs={12} sm={6} lg={6} xl={4} key={venue.id}>
              <Card
                sx={{
                  position: 'relative',
                  height: 280,
                  display: 'flex',
                  flexDirection: 'row',
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: venue.id === currentVenue?.id ? '2px solid' : '1px solid',
                  borderColor: venue.id === currentVenue?.id ? 'primary.main' : 'divider',
                  background: 'white',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                    borderColor: venue.id === currentVenue?.id ? 'primary.main' : 'primary.light',
                  },
                }}
              >
                {/* Selected Badge */}
                {venue.id === currentVenue?.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      zIndex: 3,
                      backgroundColor: 'grey.600',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    Selected
                  </Box>
                )}

                {/* Image Section - 30% */}
                <Box
                  sx={{
                    width: '30%',
                    height: '100%',
                    position: 'relative',
                    backgroundImage: venue.image_url 
                      ? `url(${venue.image_url})`
                      : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23666\'%3E%3Cpath d=\'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\'/%3E%3C/path%3E%3C/svg%3E")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!venue.image_url && (
                    <Store sx={{ fontSize: 48, color: '#999' }} />
                  )}
                </Box>

                {/* Content Section - 70% */}
                <Box
                  sx={{
                    width: '70%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {/* Three Dots Menu */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setSelectedItem(venue);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'text.secondary',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        color: 'primary.main',
                      },
                    }}
                  >
                    <MoreVert sx={{ fontSize: 18 }} />
                  </IconButton>

                  {/* Header */}
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="700"
                      sx={{ 
                        color: 'text.primary',
                        fontSize: '1.25rem',
                        lineHeight: 1.3,
                        mb: 1,
                        pr: 4, // Space for menu button
                        textTransform: 'capitalize',
                      }}
                    >
                      {venue.name}
                    </Typography>
                    
                    {/* Description */}
                    {venue.description && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                          lineHeight: 1.4,
                          mb: 1.5,
                          fontWeight: 400,
                          fontStyle: 'italic',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textTransform: 'capitalize',
                        }}
                      >
                        {venue.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'grey.400',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {React.cloneElement(getVenueTypeIcon(venue.venue_type || 'restaurant'), {
                          sx: { color: 'white', fontSize: 14 }
                        })}
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.85rem',
                          textTransform: 'capitalize',
                          fontWeight: 500,
                        }}
                      >
                        {venue.venue_type?.replace('_', ' ') || 'Restaurant'}
                      </Typography>
                    </Box>

                    {/* Status Icons */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        {venue.is_active ? (
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <Cancel sx={{ fontSize: 16, color: 'grey.400' }} />
                        )}
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary', fontWeight: 400, textTransform: 'capitalize' }}>
                          {venue.is_active ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        {venue.is_open ? (
                          <Visibility sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <VisibilityOff sx={{ fontSize: 16, color: 'error.main' }} />
                        )}
                        <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary', fontWeight: 400, textTransform: 'capitalize' }}>
                          {venue.is_open ? 'Open' : 'Closed'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box sx={{ px: 3, flex: 1, overflow: 'hidden' }}>
                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <LocationOn sx={{ color: 'text.secondary', fontSize: 18, mt: 0.2, mr: 1.5 }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.9rem',
                          lineHeight: 1.4,
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textTransform: 'uppercase',
                        }}
                      >
                        {venue.location?.address || 'NO ADDRESS AVAILABLE'}
                        {venue.location?.city && (
                          <Box component="span" sx={{ display: 'block', fontWeight: 400, mt: 0.5, textTransform: 'uppercase' }}>
                            {venue.location.city}, {venue.location.state}
                          </Box>
                        )}
                      </Typography>
                    </Box>

                    {/* Contact Info */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {venue.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Phone sx={{ color: 'text.secondary', fontSize: 16, mr: 1.5 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                            {venue.phone}
                          </Typography>
                        </Box>
                      )}
                      {venue.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Email sx={{ color: 'text.secondary', fontSize: 16, mr: 1.5 }} />
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: '0.9rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {venue.email}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card
          sx={{
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'primary.light',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            textAlign: 'center',
            py: { xs: 4, sm: 6 },
            px: { xs: 2, sm: 3 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(0, 0, 0, 0.02) 50%, transparent 70%)',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              <Restaurant
                sx={{
                  fontSize: 40,
                  color: '#1565c0',
                }}
              />
            </Box>
            
            <Typography 
              variant="h6" 
              fontWeight="600" 
              gutterBottom 
              color="text.primary"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.375rem' } }}
            >
              No Venues Yet
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                maxWidth: '400px',
                mx: 'auto',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                lineHeight: 1.5,
              }}
            >
              Start building your restaurant empire by adding your first venue location. 
              You can manage multiple locations from this central dashboard.
            </Typography>

            {canCreateVenues && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenVenueDialog(true)}
                  size="medium"
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Create Your First Venue
                </Button>
                
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  It only takes a few minutes to get started
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      )}
      </Box>
      </Box>

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
            theme: 'pet',
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Business sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight="600">
                  Basic Information
                </Typography>
              </Box>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: 'grey.400',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {React.cloneElement(getVenueTypeIcon(type), {
                            sx: { color: 'white', fontSize: 12 }
                          })}
                        </Box>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Box>
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
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={venueFormData.theme}
                  label="Theme"
                  onChange={(e) => setVenueFormData(prev => ({ ...prev, theme: e.target.value }))}
                >
                  <MenuItem value="default">Default Theme</MenuItem>
                  <MenuItem value="pet">Pet Theme (Cats & Dogs)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Location Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Map sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight="600">
                  Location Details
                </Typography>
              </Box>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Phone sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight="600">
                  Contact Information
                </Typography>
              </Box>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoney sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight="600">
                  Additional Settings
                </Typography>
              </Box>
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
                  theme: venueFormData.theme,
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
                    theme: venueFormData.theme,
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
                  theme: 'pet',
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
                theme: selectedItem.theme || 'pet', // Default to pet theme
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
          onClick={async () => {
            // Toggle venue status
            if (selectedItem) {
              try {
                const newStatus = !selectedItem.is_open;
                await venueService.updateVenue(selectedItem.id, {
                  is_open: newStatus
                });
                
                setSnackbar({
                  open: true,
                  message: `Venue ${newStatus ? 'opened' : 'closed'} successfully`,
                  severity: 'success'
                });
                
                // Refresh venues list
                await refreshWorkspaceVenues();
                
              } catch (error: any) {
                setSnackbar({
                  open: true,
                  message: error.message || 'Failed to update venue status',
                  severity: 'error'
                });
              }
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
              // Delete venue permanently
              if (selectedItem) {
                setDeleteModal({
                  open: true,
                  venueId: selectedItem.id,
                  venueName: selectedItem.name,
                  loading: false
                });
              }
              setAnchorEl(null);
              setSelectedItem(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Permanently</ListItemText>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, venueId: '', venueName: '', loading: false })}
        onConfirm={confirmDeleteVenue}
        title="Delete Venue Permanently"
        itemName={deleteModal.venueName}
        itemType="venue"
        description="⚠️ WARNING: This action will PERMANENTLY DELETE the venue and ALL associated data. This cannot be undone!"
        loading={deleteModal.loading}
        additionalWarnings={[
          'All tables and seating areas will be deleted',
          'Menu items and categories will be permanently removed',
          'Order history and customer data will be lost',
          'Staff access to this venue will be revoked',
          'QR codes and payment integrations will be disabled',
          'This action cannot be undone'
        ]}
      />
    </Box>
  );
};

export default WorkspaceManagement;