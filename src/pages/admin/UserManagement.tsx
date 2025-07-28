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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import PermissionService from '../../services/permissionService';
import { ROLES, PERMISSIONS } from '../../types/auth';
import PasswordUpdateDialog from '../../components/PasswordUpdateDialog';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'superadmin' | 'admin' | 'operator';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  cafeId?: string;
  permissions: string[];
}

const UserManagement: React.FC = () => {
  const { user: currentUser, hasPermission, getUserWithRole, isSuperAdmin, isAdmin } = useAuth();
  const { currentWorkspace, currentCafe, cafes } = useWorkspace();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: ROLES.OPERATOR as 'superadmin' | 'admin' | 'operator',
    cafeId: '',
    isActive: true,
  });

  // Mock users data
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@dinecafe.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+91 98765 43210',
      role: ROLES.ADMIN,
      isActive: true,
      lastLogin: new Date('2024-01-20T10:30:00'),
      createdAt: new Date('2024-01-01T00:00:00'),
      cafeId: 'cafe-1',
      permissions: ['dashboard:view', 'orders:view', 'orders:update', 'menu:view', 'menu:update']
    },
    {
      id: '2',
      email: 'operator@dinecafe.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+91 98765 43211',
      role: ROLES.OPERATOR,
      isActive: true,
      lastLogin: new Date('2024-01-20T09:15:00'),
      createdAt: new Date('2024-01-05T00:00:00'),
      cafeId: 'cafe-1',
      permissions: ['orders:view', 'orders:update']
    },
    {
      id: '3',
      email: 'manager@dinecafe.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      phone: '+91 98765 43212',
      role: ROLES.ADMIN,
      isActive: false,
      lastLogin: new Date('2024-01-18T16:45:00'),
      createdAt: new Date('2024-01-10T00:00:00'),
      cafeId: 'cafe-2',
      permissions: ['dashboard:view', 'orders:view', 'menu:view', 'tables:view']
    }
  ];

  useEffect(() => {
    loadUsers();
  }, [currentWorkspace, currentCafe]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        role: user.role,
        cafeId: user.cafeId || '',
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: ROLES.OPERATOR as 'superadmin' | 'admin' | 'operator',
        cafeId: currentCafe?.id || '', // Always default to current cafe
        isActive: true,
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
        const updatedUsers = users.map(user =>
          user.id === editingUser.id
            ? { ...user, ...formData }
            : user
        );
        setUsers(updatedUsers);
      } else {
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          ...formData,
          lastLogin: undefined,
          createdAt: new Date(),
          permissions: PermissionService.getRolePermissions(formData.role).map(p => p.name),
        };
        setUsers([...users, newUser]);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const updatedUsers = users.map(user =>
      user.id === userId
        ? { ...user, isActive: !user.isActive }
        : user
    );
    setUsers(updatedUsers);
  };

  const handlePasswordUpdate = async (userId: string, newPassword: string) => {
    try {
      // In real app, this would be an API call
      console.log(`Updating password for user ${userId}`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message or handle response
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Failed to update password:', error);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case ROLES.SUPERADMIN:
        return 'error';
      case ROLES.ADMIN:
        return 'primary';
      case ROLES.OPERATOR:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleDefinition = PermissionService.getRoleDefinition(role);
    return roleDefinition?.displayName || role;
  };

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  // Role-based restrictions
  const canCreateUsers = isSuperAdmin(); // Only superadmin can create users
  const canEditUsers = hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDeleteUsers = hasPermission(PERMISSIONS.USERS_DELETE);
  const canUpdatePasswords = isAdmin() || isSuperAdmin(); // Admin can only update passwords

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users and their permissions for {currentCafe?.name || 'your restaurant'}
          </Typography>
        </Box>
        
        {isSuperAdmin() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Add User
          </Button>
        )}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {users.length}
                  </Typography>
                </Box>
                <Person sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Active Users
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {users.filter(u => u.isActive).length}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Admins
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {users.filter(u => u.role === ROLES.ADMIN).length}
                  </Typography>
                </Box>
                <Security sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Operators
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {users.filter(u => u.role === ROLES.OPERATOR).length}
                  </Typography>
                </Box>
                <Business sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Cafe</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {user.firstName[0]}{user.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="500">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleDisplayName(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {cafes.find(c => c.id === user.cafeId)?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatLastLogin(user.lastLogin)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
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
        </CardContent>
      </Card>

      {/* User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isSuperAdmin() 
            ? (editingUser ? 'Edit User' : 'Add New User')
            : 'Update User Password'
          }
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Show different fields based on user role */}
            {isSuperAdmin() ? (
              // SuperAdmin can create/edit full user details
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                    disabled={!!editingUser} // Can't change email when editing
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="Role"
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      required
                    >
                      <MenuItem value={ROLES.OPERATOR}>Operator</MenuItem>
                      <MenuItem value={ROLES.ADMIN}>Admin</MenuItem>
                      <MenuItem value={ROLES.SUPERADMIN}>Super Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Cafe</InputLabel>
                    <Select
                      value={formData.cafeId}
                      label="Cafe"
                      onChange={(e) => setFormData({ ...formData, cafeId: e.target.value })}
                      disabled // Always current cafe for superadmin
                    >
                      <MenuItem value={currentCafe?.id || ''}>
                        {currentCafe?.name || 'Current Cafe'}
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                    }
                    label="Active User"
                  />
                </Grid>
              </>
            ) : (
              // Admin can only update password
              <>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    As an Admin, you can only update user passwords. Contact a SuperAdmin to modify other user details.
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    User: {editingUser?.firstName} {editingUser?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email: {editingUser?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    placeholder="Enter new password for user"
                    helperText="Leave empty to keep current password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isSuperAdmin() 
              ? (editingUser ? 'Update User' : 'Create User')
              : 'Update Password'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isSuperAdmin() && (
          <MenuItem onClick={() => {
            handleOpenDialog(selectedUser || undefined);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit User</ListItemText>
          </MenuItem>
        )}
        
        {isAdmin() && !isSuperAdmin() && (
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
        
        <MenuItem onClick={() => {
          if (selectedUser) {
            handleToggleUserStatus(selectedUser.id);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            {selectedUser?.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          setShowPermissions(selectedUser?.id || null);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Permissions</ListItemText>
        </MenuItem>

        {canDeleteUsers && selectedUser?.id !== currentUser?.id && (
          <MenuItem onClick={() => {
            if (selectedUser) {
              handleDeleteUser(selectedUser.id);
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

      {/* Password Update Dialog */}
      <PasswordUpdateDialog
        open={passwordDialogOpen}
        user={selectedUser}
        onClose={() => {
          setPasswordDialogOpen(false);
          setSelectedUser(null);
        }}
        onUpdate={handlePasswordUpdate}
      />
    </Container>
  );
};

export default UserManagement;