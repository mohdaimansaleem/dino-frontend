import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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
  Alert,
  InputAdornment,
  AlertColor,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Snackbar,
  useTheme,
  useMediaQuery,
  Stack,
  keyframes,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Business,
  Block,
  CheckCircle,
  Cancel,
  Lock,
  People,
  Refresh,
  ArrowBack,
  CachedOutlined,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useUserData } from '../../contexts/UserDataContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useNavigate } from 'react-router-dom';
import { ROLES, PERMISSIONS } from '../../types/auth';
import { PasswordUpdateDialog } from '../../components/auth';
import { userService, User, UserCreate, UserUpdate } from '../../services/auth';
import { VenueUser } from '../../types/api';
import { ROLE_NAMES, getRoleDisplayName } from '../../constants/roles';
import { PageLoadingSkeleton, EmptyState } from '../../components/ui/LoadingStates';
import { hashPassword, getFixedSalt, isValidHashedPassword } from '../../utils/security';
import { DeleteConfirmationModal } from '../../components/modals';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { useUserFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

// Simple password validation function
const validatePasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  return {
    score,
    checks,
    isValid: score === 5,
    strength: score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
  };
};

// Animation for refresh icon
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const UserManagement: React.FC = () => {
  const { hasPermission, isSuperAdmin, isAdmin } = useAuth();
  const userFlags = useUserFlags();
  const { currentWorkspace, currentVenue, venues } = useWorkspace();
  const { 
    userData, 
    loading: userDataLoading,
    getVenue,
    getWorkspace,
    getVenueDisplayName
  } = useUserData();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [users, setUsers] = useState<VenueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as AlertColor });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    userId: '',
    userName: '',
    loading: false
  });

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirm_password: '',
    role_name: ROLES.OPERATOR as string,
    workspace_id: '',
    venue_id: '',
    is_active: true,
  });

  // Track if users have been loaded to prevent duplicate API calls
  const [usersLoaded, setUsersLoaded] = useState(false);

  const loadUsers = useCallback(async () => {
    // Get venue from userData first, then fallback to context
    const venue = getVenue() || currentVenue;
    
    if (!venue?.id) {
      setUsers([]);
      setLoading(false);
      setError('No venue selected. Please select a venue to view users.');
      setUsersLoaded(true); // Mark as loaded even if no venue
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Use the new venue-specific API
      const response = await userService.getUsersByVenueId(venue.id);
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
        setError(response.error || 'No users found for this venue.');
      }
    } catch (error: any) {
      // Use the error handler to analyze and handle the error
      const errorInfo = handleError(error, { 
        logError: true,
        showToast: false // We'll handle the error display ourselves
      });
      
      // Set appropriate error message based on error type
      if (errorInfo.type === 'network') {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (errorInfo.code === 404 || errorInfo.code === '404') {
        setError('User management is not available for this venue. Please contact your administrator.');
      } else if (errorInfo.type === 'auth') {
        setError('Your session has expired. Please log in again.');
      } else if (errorInfo.type === 'permission') {
        setError('You don\'t have permission to view users for this venue.');
      } else {
        setError(errorInfo.userFriendlyMessage);
      }
      
      setUsers([]);
    } finally {
      setLoading(false);
      setUsersLoaded(true); // Mark as loaded after API call completes
    }
  }, [getVenue, handleError, currentVenue]);

  useEffect(() => {
    // Reset loaded state when workspace/venue changes
    setUsersLoaded(false);
    
    // Only load if userData is available (navigation scenario)
    if (userData && !userDataLoading) {
      loadUsers();
    }
  }, [currentWorkspace, currentVenue, loadUsers, userData, userDataLoading]);

  // Load users when userData becomes available (page refresh scenario)
  useEffect(() => {
    // Only load if:
    // 1. We have userData (context is ready)
    // 2. Not currently loading userData
    // 3. Users haven't been loaded yet
    if (userData && !userDataLoading && !usersLoaded) {
      loadUsers();
    }
  }, [userData, userDataLoading, usersLoaded, loadUsers]);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        password: '', // Don't populate password for editing
        confirm_password: '', // Don't populate password for editing
        role_name: user.role as string,
        workspace_id: user.workspace_id,
        venue_id: user.venue_id || '',
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        confirm_password: '',
        role_name: ROLES.OPERATOR as string,
        workspace_id: getWorkspace()?.id || currentWorkspace?.id || '',
        venue_id: getVenue()?.id || currentVenue?.id || '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.first_name.trim()) {
        setSnackbar({ 
          open: true, 
          message: 'First name is required', 
          severity: 'error' 
        });
        return;
      }
      
      if (!formData.last_name.trim()) {
        setSnackbar({ 
          open: true, 
          message: 'Last name is required', 
          severity: 'error' 
        });
        return;
      }
      
      if (!formData.email.trim()) {
        setSnackbar({ 
          open: true, 
          message: 'Email is required', 
          severity: 'error' 
        });
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setSnackbar({ 
          open: true, 
          message: 'Please enter a valid email address', 
          severity: 'error' 
        });
        return;
      }
      
      // Password validation for new users
      if (!editingUser) {
        if (!formData.password) {
          setSnackbar({ 
            open: true, 
            message: 'Password is required for new users', 
            severity: 'error' 
          });
          return;
        }
        
        // Validate password strength
        if (formData.password.length < 8) {
          setSnackbar({ 
            open: true, 
            message: 'Password must be at least 8 characters long', 
            severity: 'error' 
          });
          return;
        }
        
        if (!/(?=.*[a-z])/.test(formData.password)) {
          setSnackbar({ 
            open: true, 
            message: 'Password must contain at least one lowercase letter', 
            severity: 'error' 
          });
          return;
        }
        
        if (!/(?=.*[A-Z])/.test(formData.password)) {
          setSnackbar({ 
            open: true, 
            message: 'Password must contain at least one uppercase letter', 
            severity: 'error' 
          });
          return;
        }
        
        if (!/(?=.*\d)/.test(formData.password)) {
          setSnackbar({ 
            open: true, 
            message: 'Password must contain at least one number', 
            severity: 'error' 
          });
          return;
        }
        
        if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
          setSnackbar({ 
            open: true, 
            message: 'Password must contain at least one special character (@$!%*?&)', 
            severity: 'error' 
          });
          return;
        }
        
        // Validate password is plain text (not already hashed)
        if (isValidHashedPassword(formData.password)) {
          setSnackbar({ 
            open: true, 
            message: 'Password appears to be already hashed. Please provide plain text password.', 
            severity: 'error' 
          });
          return;
        }
        
        if (formData.password !== formData.confirm_password) {
          setSnackbar({ 
            open: true, 
            message: 'Passwords do not match', 
            severity: 'error' 
          });
          return;
        }
      }

      if (editingUser) {
        // Update user
        const updateData: UserUpdate = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          is_active: formData.is_active,
        };
        
        const response = await userService.updateUser(editingUser.id, updateData);
        if (response.success) {
          setSnackbar({ 
            open: true, 
            message: 'User updated successfully', 
            severity: 'success' 
          });
        }
      } else {
        // Create new user
        const salt = getFixedSalt();
        const hashedPassword = await hashPassword(formData.password, salt);
        const createData: UserCreate = {
          email: formData.email,
          password: hashedPassword,
          confirm_password: hashedPassword,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          workspace_id: formData.workspace_id,
          venue_id: formData.venue_id,
        };
        
        const response = await userService.createUser(createData);
        if (response.success) {
          setSnackbar({ 
            open: true, 
            message: 'User created successfully', 
            severity: 'success' 
          });
        }
      }
      
      // Reload users after successful operation
      setUsersLoaded(false);
      await loadUsers();
      handleCloseDialog();
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to save user', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setDeleteModal({
      open: true,
      userId: userId,
      userName: user.user_name || `${user.first_name} ${user.last_name}`,
      loading: false
    });
  };

  const confirmDeleteUser = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const response = await userService.deleteUser(deleteModal.userId);
      if (response.success) {
        setSnackbar({ 
          open: true, 
          message: 'User deleted successfully', 
          severity: 'success' 
        });
        setUsersLoaded(false);
        await loadUsers(); // Reload users after deletion
        setDeleteModal({ open: false, userId: '', userName: '', loading: false });
      }
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to delete user', 
        severity: 'error' 
      });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await userService.toggleUserStatus(userId, !currentStatus);
      if (response.success) {
        setSnackbar({ 
          open: true, 
          message: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 
          severity: 'success' 
        });
        setUsersLoaded(false);
        await loadUsers(); // Reload users after status change
      }
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to update user status', 
        severity: 'error' 
      });
    }
  };

  const handlePasswordUpdate = async (userId: string, newPassword: string) => {
    try {
      // TODO: Implement password update API call
      // This would use the userService password update method
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({ 
        open: true, 
        message: 'Password updated successfully', 
        severity: 'success' 
      });
    } catch (error: any) {
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to update password', 
        severity: 'error' 
      });
      throw error;
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshUsers = async () => {
    const venue = getVenue() || currentVenue;
    
    if (!venue?.id) {
      setSnackbar({
        open: true,
        message: 'No venue available to refresh users',
        severity: 'error'
      });
      return;
    }

    setRefreshing(true);
    setError(null);
    
    try {
      const response = await userService.getUsersByVenueId(venue.id);
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
        setSnackbar({
          open: true,
          message: response.error || 'No users found for this venue.',
          severity: 'warning'
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh users. Please try again.',
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case ROLE_NAMES.SUPERADMIN:
        return 'error';
      case ROLE_NAMES.ADMIN:
        return 'primary';
      case ROLE_NAMES.OPERATOR:
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Use the centralized role display name function
  const getDisplayName = (role: User['role']) => {
    return getRoleDisplayName(role);
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    return userService.formatLastLogin(dateString);
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const email = user.email || '';
    const userName = user.user_name || '';
    
    const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesActive = showInactive || user.status === 'active';
    
    return matchesSearch && matchesRole && matchesActive;
  });

  // Role-based restrictions
  const canCreateUsers = isSuperAdmin() || hasPermission(PERMISSIONS.USERS_CREATE);
  const canEditUsers = hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDeleteUsers = hasPermission(PERMISSIONS.USERS_DELETE);
  const canUpdatePasswords = isAdmin() || isSuperAdmin();

  if (loading) {
    return (
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, py: 4, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading users...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, py: 4, width: '100%' }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users and their permissions
            </Typography>
          </Box>
          
          <Card sx={{ 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: 3,
              transform: 'translateY(-2px)',
            },
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <People sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="600" gutterBottom color="error.main">
                Unable to Load Users
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                {error}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button 
                  variant="contained" 
                  startIcon={<Refresh />}
                  onClick={() => {
                    setUsersLoaded(false);
                    setError(null);
                    loadUsers();
                  }}
                  size="large"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/admin')}
                  size="large"
                >
                  Back to Dashboard
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // No workspace selected state (check userData first)
  const venue = getVenue();
  
  if (!venue && !currentWorkspace?.id) {
    return (
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, py: 4, width: '100%' }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users and their permissions
            </Typography>
          </Box>

          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 4,
              transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <Business
              sx={{
                fontSize: 80,
                color: 'text.secondary',
                mb: 2,
              }}
            />
            <Typography variant="h5" fontWeight="600" gutterBottom color="text.secondary">
              No Workspace Found
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
              You need to select a workspace first to manage users. Please select or create a workspace to continue.
            </Typography>
          </Card>
        </Container>
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
                <People sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
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
                  User Management
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
                Manage users and their permissions across your venue
              </Typography>

              {venue && (
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
                  <Business sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                  <Typography variant="body2" fontWeight="500" color="text.primary">
                    {venue.name}
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
              {canCreateUsers && (
                <FlagGate flag="users.showAddUser">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
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
                    Add New User
                  </Button>
                </FlagGate>
              )}

              <IconButton
                onClick={handleRefreshUsers}
                disabled={refreshing}
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
                title={refreshing ? 'Refreshing...' : 'Refresh users'}
              >
                {refreshing ? (
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
        {/* Content Area */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 3, sm: 4 }, pb: 4 }}>

          {/* Statistics Cards */}
          <FlagGate flag="users.showUserStats">
            <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                label: 'Total Users',
                value: users.length,
                color: '#2196F3',
                icon: <People />,
                description: 'All registered users'
              },
              {
                label: 'Active Users',
                value: users.filter(user => user.status === 'active').length,
                color: '#4CAF50',
                icon: <CheckCircle />,
                description: 'Currently active'
              },
              {
                label: 'Recent Logins',
                value: users.filter(user => {
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  const lastLogin = user.last_logged_in ? new Date(user.last_logged_in) : null;
                  return lastLogin && lastLogin > sevenDaysAgo;
                }).length,
                color: '#2196F3',
                icon: <Business />,
                description: 'Last 7 days'
              },
              {
                label: 'Role Types',
                value: [...new Set(users.map(user => user.role))].length,
                color: '#FF9800',
                icon: <Business />,
                description: 'Different roles'
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 2,
                    backgroundColor: `${stat.color}08`,
                    border: `1px solid ${stat.color}33`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${stat.color}33`,
                      backgroundColor: `${stat.color}12`,
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {/* Icon on the left */}
                    <Box
                      sx={{
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        borderRadius: 2,
                        backgroundColor: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {React.cloneElement(stat.icon, { 
                        fontSize: isMobile ? 'medium' : 'large' 
                      })}
                    </Box>
                    
                    {/* Text content on the right */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant={isMobile ? "h6" : "h4"} 
                        fontWeight="700" 
                        color="text.primary"
                        sx={{ 
                          fontSize: { xs: '1.25rem', sm: '2rem' },
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
                </Card>
              </Grid>
            ))}
            </Grid>
          </FlagGate>

          {/* Filters and Search */}
          <FlagGate flag="users.showUserFilters">
            <Card sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Filter by Role"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="all">All Roles</option>
                    <option value={ROLES.SUPERADMIN}>Super Admin</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                    <option value={ROLES.OPERATOR}>Operator</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                      />
                    }
                    label="Show Inactive Users"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          </FlagGate>

          {/* Users Table */}
          <Card 
            sx={{ 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
              },
            }}
          >
            {filteredUsers.length === 0 ? (
              <CardContent>
                <Box sx={{ 
                  overflow: 'auto',
                  maxWidth: '100%'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Login</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            py: 6,
                            textAlign: 'center'
                          }}>
                            <People sx={{ 
                              fontSize: 64, 
                              color: 'text.secondary', 
                              mb: 2,
                              opacity: 0.5 
                            }} />
                            <Typography variant="h6" fontWeight="600" gutterBottom color="text.secondary">
                              No Users Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                              No users found for this venue. Users will appear here once they are assigned to this venue.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            ) : (
              <CardContent>
                <Box sx={{ 
                  overflow: 'auto',
                  maxWidth: '100%'
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Login</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                            <Avatar sx={{ width: { xs: 28, sm: 36 }, height: { xs: 28, sm: 36 }, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography 
                                variant="subtitle2" 
                                fontWeight="600"
                                sx={{ 
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.2
                                }}
                              >
                                {user.user_name || `${user.first_name} ${user.last_name}`}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ 
                                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.1
                                }}
                              >
                                {user.email}
                              </Typography>
                              {user.phone && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                    display: { xs: 'none', sm: 'block' },
                                    lineHeight: 1.1
                                  }}
                                >
                                  {user.phone}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role_display_name || getDisplayName(user.role)}
                            color={getRoleColor(user.role) as any}
                            size="small"
                            sx={{ 
                              fontSize: { xs: '0.55rem', sm: '0.65rem' },
                              height: { xs: 20, sm: 24 },
                              '& .MuiChip-label': {
                                px: { xs: 0.5, sm: 1 }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status === 'active' ? 'Active' : 'Inactive'}
                            color={user.status === 'active' ? 'success' : 'default'}
                            size="small"
                            icon={user.status === 'active' ? <CheckCircle sx={{ fontSize: '0.8rem' }} /> : <Cancel sx={{ fontSize: '0.8rem' }} />}
                            sx={{ 
                              fontSize: { xs: '0.55rem', sm: '0.65rem' },
                              height: { xs: 20, sm: 24 },
                              '& .MuiChip-label': {
                                px: { xs: 0.5, sm: 1 }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                            {formatLastLogin(user.last_logged_in || user.updated_at || user.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton
                            onClick={(e) => handleMenuClick(e, user)}
                            size="small"
                            sx={{ p: 0.5 }}
                          >
                            <MoreVert sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              </CardContent>
            )}
          </Card>
        </Box>
      </Box>

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {canEditUsers && (
          <FlagGate flag="users.showEditUser">
            <MenuItem onClick={() => {
              handleOpenDialog(selectedUser!);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit User</ListItemText>
            </MenuItem>
          </FlagGate>
        )}
        {canUpdatePasswords && selectedUser && (
          <FlagGate flag="users.showUserPasswordUpdate">
            <MenuItem onClick={() => {
              setPasswordDialogOpen(true);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Lock fontSize="small" />
              </ListItemIcon>
              <ListItemText>Update Password</ListItemText>
            </MenuItem>
          </FlagGate>
        )}
        {selectedUser && (
          <FlagGate flag="users.showUserStatusToggle">
            <MenuItem onClick={() => {
              handleToggleUserStatus(selectedUser.id, selectedUser.is_active);
              handleMenuClose();
            }}>
              <ListItemIcon>
                {selectedUser.is_active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
              </ListItemIcon>
              <ListItemText>
                {selectedUser.is_active ? 'Deactivate' : 'Activate'}
              </ListItemText>
            </MenuItem>
          </FlagGate>
        )}
        {canDeleteUsers && selectedUser && (
          <FlagGate flag="users.showDeleteUser">
            <MenuItem onClick={() => {
              handleDeleteUser(selectedUser.id);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete User</ListItemText>
            </MenuItem>
          </FlagGate>
        )}
      </Menu>

      {/* User Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '90vh' : 'calc(100vh - 64px)',
            height: isMobile ? 'auto' : 'auto',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: { xs: 1, sm: 1 }, 
          px: { xs: 2, sm: 3 },
          pt: { xs: 1.5, sm: 2 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600">
            {editingUser ? 'Edit User' : 'Create New User'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          flex: 1,
          overflow: 'auto'
        }}>
          <Stack spacing={{ xs: 3.5, sm: 4 }} sx={{ mt: { xs: 3.5, sm: 1 } }}>
            {/* Name Fields */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                size={isMobile ? "medium" : "medium"}
              />
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                size={isMobile ? "medium" : "medium"}
              />
            </Stack>

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editingUser}
              required
              size={isMobile ? "medium" : "medium"}
            />

            {/* Password Fields - Only show for new users */}
            {editingUser && (
              <Alert severity="info" sx={{ my: { xs: 3, sm: 2 } }}>
                To update the password for this user, use the "Update Password" option from the user actions menu.
              </Alert>
            )}
            {!editingUser && (
              <>
                <Box>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    size={isMobile ? "medium" : "medium"}
                    helperText="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                  />
                  {formData.password && (
                    <Box sx={{ mt: { xs: 1, sm: 1 } }}>
                      {(() => {
                        const validation = validatePasswordStrength(formData.password);
                        const color = validation.strength === 'weak' ? 'error' : 
                                     validation.strength === 'medium' ? 'warning' : 'success';
                        return (
                          <Box>
                            <Typography variant="caption" color={`${color}.main`} sx={{ fontWeight: 500 }}>
                              Password strength: {validation.strength.toUpperCase()}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              {[1, 2, 3, 4, 5].map((level) => (
                                <Box
                                  key={level}
                                  sx={{
                                    height: 4,
                                    flex: 1,
                                    backgroundColor: level <= validation.score 
                                      ? `${color}.main` 
                                      : 'grey.300',
                                    borderRadius: 1
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        );
                      })()}
                    </Box>
                  )}
                </Box>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  required
                  size={isMobile ? "medium" : "medium"}
                  error={formData.password !== formData.confirm_password && formData.confirm_password !== ''}
                  helperText={formData.password !== formData.confirm_password && formData.confirm_password !== '' ? 'Passwords do not match' : ''}
                />
              </>
            )}

            {/* Phone and Role */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[0-9]+$/.test(value)) {
                    setFormData({ ...formData, phone: value });
                  }
                }}
                placeholder="e.g., 9876543210"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 10
                }}
                size={isMobile ? "medium" : "medium"}
              />
              <FormControl fullWidth required size={isMobile ? "medium" : "medium"}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role_name}
                  onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                  label="Role"
                >
                  <MenuItem value={ROLES.OPERATOR}>Operator</MenuItem>
                  {isAdmin() && <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>}
                </Select>
              </FormControl>
            </Stack>

            {/* Venue Selection */}
            {venues.length > 1 && (
              <FormControl fullWidth size={isMobile ? "medium" : "medium"}>
                <InputLabel>Venue</InputLabel>
                <Select
                  value={formData.venue_id}
                  onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                  label="Venue"
                >
                  <MenuItem value="">All Venues</MenuItem>
                  {venues.map((venue) => (
                    <MenuItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Active Status */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              py: { xs: 1, sm: 1 },
              borderRadius: 1,
              backgroundColor: 'grey.50',
              px: { xs: 2, sm: 2 }
            }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      Active User
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      User can log in and access the system
                    </Typography>
                  </Box>
                }
                sx={{ margin: 0 }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          pb: { xs: 1.5, sm: 2 },
          pt: { xs: 1.5, sm: 1.5 },
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Update Dialog */}
      {selectedUser && (
        <PasswordUpdateDialog
          open={passwordDialogOpen}
          onClose={() => setPasswordDialogOpen(false)}
          onUpdate={(userId, newPassword) => handlePasswordUpdate(userId, newPassword)}
          user={{
            id: selectedUser.id,
            email: selectedUser.email,
            firstName: selectedUser.first_name,
            lastName: selectedUser.last_name,
            role: selectedUser.role
          }}
        />
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, userId: '', userName: '', loading: false })}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        itemName={deleteModal.userName}
        itemType="user account"
        description="This user account will be permanently removed from the system. The user will lose access to all restaurant management features."
        loading={deleteModal.loading}
        additionalWarnings={[
          'All user activity history will be preserved for audit purposes',
          'Any ongoing tasks assigned to this user may be affected',
          'User permissions and role assignments will be revoked',
          'This action cannot be undone'
        ]}
      />
    </Box>
  );
};

export default UserManagement;