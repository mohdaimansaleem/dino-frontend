import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Tooltip,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Person,
  Email,
  Phone,
  Business,
  Security,
  Visibility,
  Block,
  CheckCircle,
  Cancel,
  Lock,
  People,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useUserData } from '../../contexts/UserDataContext';
import PermissionService from '../../services/permissionService';
import { ROLES, PERMISSIONS } from '../../types/auth';
import PasswordUpdateDialog from '../../components/PasswordUpdateDialog';
import { userService, User, UserCreate, UserUpdate } from '../../services/userService';
import { STORAGE_KEYS } from '../../constants/storage';
import { ROLE_NAMES, getRoleDisplayName } from '../../constants/roles';

const UserManagement: React.FC = () => {
  const { user: currentUser, hasPermission, getUserWithRole, isSuperAdmin, isAdmin } = useAuth();
  const { currentWorkspace, currentVenue, venues } = useWorkspace();
  const { 
    userData, 
    hasPermission: hasUserDataPermission, 
    getUsers: getUserDataUsers,
    getVenue,
    getWorkspace,
    getVenueDisplayName
  } = useUserData();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

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

  useEffect(() => {
    loadUsers();
  }, [currentWorkspace, currentVenue]);

  const loadUsers = async () => {
    // Try to use userData first
    if (userData) {
      const venueUsers = getUserDataUsers();
      setUsers(venueUsers);
      setLoading(false);
      return;
    }

    // Fallback to old method
    if (!currentWorkspace?.id) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const filters = {
        workspace_id: currentWorkspace.id,
        venue_id: currentVenue?.id,
      };
      
      const usersData = await userService.getUsers(filters);
      setUsers(usersData.data || []);
    } catch (error) {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      await loadUsers();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving user:', error);
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
          await loadUsers(); // Reload users after deletion
        }
      } catch (error: any) {
        console.error('Error deleting user:', error);
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
        await loadUsers(); // Reload users after status change
      }
    } catch (error: any) {
      console.error('Error toggling user status:', error);
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
      console.error('Error updating password:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to update password', 
        severity: 'error' 
      });
      throw error;
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="rectangular" height={120} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadUsers}>
          Retry
        </Button>
      </Container>
    );
  }

  // No workspace selected state (check userData first)
  const venue = getVenue();
  const workspace = getWorkspace();
  
  if (!venue && !currentWorkspace?.id) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>


      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="600">
              User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users and their permissions for {getVenueDisplayName()}
            </Typography>
          </Box>
          {canCreateUsers && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add User
            </Button>
          )}
        </Box>
      </Box>

      {/* Users Table */}
      <Card>
        <CardContent>
          {users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Users Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {canCreateUsers 
                  ? "Get started by adding your first team member to help manage your restaurant operations."
                  : "No team members have been added yet. Contact your administrator to add users."
                }
              </Typography>
              {canCreateUsers && (
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  size="large"
                  onClick={() => handleOpenDialog()}
                >
                  Add Your First User
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar>
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">
                              {user.first_name} {user.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            {user.phone && (
                              <Typography variant="body2" color="text.secondary">
                                {user.phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getDisplayName(user.role)}
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? 'Active' : 'Inactive'}
                          color={user.is_active ? 'success' : 'default'}
                          size="small"
                          icon={user.is_active ? <CheckCircle /> : <Cancel />}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatLastLogin(user.updated_at || user.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuClick(e, user)}
                          size="small"
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editingUser}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
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
            </Grid>
            {venues.length > 1 && (
              <Grid item xs={12}>
                <FormControl fullWidth>
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
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Active User"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
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
    </Container>
  );
};

export default UserManagement;