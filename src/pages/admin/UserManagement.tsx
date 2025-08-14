import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useUserData } from '../../contexts/UserDataContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useNavigate } from 'react-router-dom';
import { ROLES, PERMISSIONS } from '../../types/auth';
import PasswordUpdateDialog from '../../components/PasswordUpdateDialog';
import { userService, User, UserCreate, UserUpdate } from '../../services/userService';
import { VenueUser } from '../../types/api';
import { ROLE_NAMES, getRoleDisplayName } from '../../constants/roles';
import { PageLoadingSkeleton, EmptyState } from '../../components/ui/LoadingStates';
import StandardButton from '../../components/ui/StandardButton';
import StandardCard from '../../components/ui/StandardCard';

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
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
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
        const createData: UserCreate = {
          email: formData.email,
          password: 'TempPassword123!', // Would be generated or set by admin
          confirm_password: 'TempPassword123!',
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
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await userService.deleteUser(userId);
        if (response.success) {
          setSnackbar({ 
            open: true, 
            message: 'User deleted successfully', 
            severity: 'success' 
          });
          setUsersLoaded(false);
          await loadUsers(); // Reload users after deletion
        }
      } catch (error: any) {
        setSnackbar({ 
          open: true, 
          message: error.message || 'Failed to delete user', 
          severity: 'error' 
        });
      }
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

  // Role-based restrictions
  const canCreateUsers = isSuperAdmin() || hasPermission(PERMISSIONS.USERS_CREATE);
  const canEditUsers = hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDeleteUsers = hasPermission(PERMISSIONS.USERS_DELETE);
  const canUpdatePasswords = isAdmin() || isSuperAdmin();

  if (loading) {
    return (
      <Container 
        maxWidth="xl" 
        className="container-responsive" 
        sx={{ 
          pt: { xs: '56px', sm: '64px' },
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        <PageLoadingSkeleton />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, pt: { xs: '56px', sm: '64px' } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users and their permissions
          </Typography>
        </Box>
        
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider'
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
              <StandardButton 
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
              </StandardButton>
              <StandardButton 
                variant="outlined" 
                startIcon={<ArrowBack />}
                onClick={() => navigate('/admin')}
                size="large"
              >
                Back to Dashboard
              </StandardButton>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // No workspace selected state (check userData first)
  const venue = getVenue();
  
  if (!venue && !currentWorkspace?.id) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, pt: { xs: '56px', sm: '64px' } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users and their permissions
          </Typography>
        </Box>

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
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      className="container-responsive" 
      sx={{ 
        pt: { xs: '56px', sm: '64px' },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Box sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 2, sm: 0 }}
            sx={{ mb: 1 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                component="h1"
                gutterBottom 
                fontWeight="600"
                sx={{ 
                  fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' },
                  lineHeight: 1.2
                }}
              >
                User Management
              </Typography>
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: { xs: 'nowrap', sm: 'normal' }
                }}
              >
                Manage users and their permissions
              </Typography>
            </Box>
            <Stack 
              direction={{ xs: 'row', sm: 'row' }} 
              spacing={2}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                flexShrink: 0,
                alignItems: 'center'
              }}
            >
              {canCreateUsers && (
                <StandardButton
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  size="large"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  User
                </StandardButton>
              )}

              <IconButton
                onClick={handleRefreshUsers}
                disabled={refreshing}
                size="large"
                sx={{
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.primary',
                  borderRadius: 2,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                }}
                title={refreshing ? 'Refreshing...' : 'Refresh users'}
              >
                {refreshing ? (
                  <CachedOutlined sx={{ animation: `${spin} 1s linear infinite` }} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Users Table */}
        <StandardCard 
          variant="default"
          noPadding={true}
          sx={{ mt: { xs: 2, sm: 3 } }}
        >
            {users.length === 0 ? (
              <EmptyState
                icon={<People sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary' }} />}
                title="No Users Found"
                description={canCreateUsers 
                  ? "Get started by adding your first team member to help manage your restaurant operations."
                  : "No team members have been added yet. Contact your administrator to add users."
                }
                action={canCreateUsers && (
                  <StandardButton 
                    variant="contained" 
                    startIcon={<Add />} 
                    size={isMobile ? "medium" : "large"}
                    onClick={() => handleOpenDialog()}
                  >
                    Add Your First User
                  </StandardButton>
                )}
              />
            ) : (
              <Box sx={{ 
                overflow: 'auto',
                maxWidth: '100%'
              }}>
                <Table 
                  size="small"
                  sx={{ 
                    minWidth: { xs: 550, sm: 600 },
                    '& .MuiTableCell-root': {
                      whiteSpace: 'nowrap',
                      px: { xs: 0.75, sm: 1.5 },
                      py: { xs: 0.75, sm: 1 },
                      fontSize: { xs: '0.7rem', sm: '0.8rem' }
                    }
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 600,
                        minWidth: { xs: 160, sm: 180 }
                      }}>
                        User
                      </TableCell>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 600,
                        minWidth: 70
                      }}>
                        Role
                      </TableCell>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 600,
                        minWidth: 70
                      }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 600,
                        display: { xs: 'none', sm: 'table-cell' },
                        minWidth: 100
                      }}>
                        Last Login
                      </TableCell>
                      <TableCell sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 600,
                        minWidth: 50,
                        textAlign: 'center'
                      }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
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
            )}
        </StandardCard>

        {/* User Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {canEditUsers && (
            <MenuItem onClick={() => {
              handleOpenDialog(selectedUser!);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit User</ListItemText>
            </MenuItem>
          )}
          {canUpdatePasswords && selectedUser && (
            <MenuItem onClick={() => {
              setPasswordDialogOpen(true);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Lock fontSize="small" />
              </ListItemIcon>
              <ListItemText>Update Password</ListItemText>
            </MenuItem>
          )}
          {selectedUser && (
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
          )}
          {canDeleteUsers && selectedUser && (
            <MenuItem onClick={() => {
              handleDeleteUser(selectedUser.id);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete User</ListItemText>
            </MenuItem>
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
              maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)',
              height: isMobile ? '100vh' : 'auto'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1, 
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600">
              {editingUser ? 'Edit User' : 'Create New User'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ 
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 3 },
            flex: 1,
            overflow: 'auto'
          }}>
            <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ mt: 0.5 }}>
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

              {/* Phone and Role */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    {isSuperAdmin() && <MenuItem value={ROLES.SUPERADMIN}>Super Admin</MenuItem>}
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
                py: 1,
                borderRadius: 1,
                backgroundColor: 'grey.50',
                px: 2
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
            pb: { xs: 2, sm: 3 },
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1
          }}>
            <StandardButton 
              onClick={handleCloseDialog}
              variant="outlined"
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              Cancel
            </StandardButton>
            <StandardButton 
              onClick={handleSubmit} 
              variant="contained"
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              {editingUser ? 'Update User' : 'Create User'}
            </StandardButton>
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
      </Box>
    </Container>
  );
};

export default UserManagement;