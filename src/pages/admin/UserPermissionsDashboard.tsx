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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Security,
  Person,
  Business,
  Restaurant,
  Settings,
  TableRestaurant,
  ShoppingCart,
  MenuBook,
  People,
  Visibility,
  CheckCircle,
  Cancel,
  Search,
  Download,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import PermissionService from '../../services/permissionService';
import { PERMISSIONS, ROLES } from '../../types/auth';

const UserPermissionsDashboard: React.FC = () => {
  const { user, getUserWithRole, hasPermission, isSuperAdmin } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showInactive, setShowInactive] = useState(false);

  // Users data will be loaded from API
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const usersData = await userService.getUsers();
        // setUsers(usersData);
        setUsers([]); // Empty for now until API is implemented
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const permissionCategories = [
    {
      name: 'Dashboard',
      icon: <Business />,
      color: '#1976d2',
      permissions: [PERMISSIONS.DASHBOARD_VIEW]
    },
    {
      name: 'Orders',
      icon: <ShoppingCart />,
      color: '#388e3c',
      permissions: [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_CREATE, PERMISSIONS.ORDERS_UPDATE, PERMISSIONS.ORDERS_DELETE]
    },
    {
      name: 'Menu',
      icon: <MenuBook />,
      color: '#f57c00',
      permissions: [PERMISSIONS.MENU_VIEW, PERMISSIONS.MENU_CREATE, PERMISSIONS.MENU_UPDATE, PERMISSIONS.MENU_DELETE]
    },
    {
      name: 'Tables',
      icon: <TableRestaurant />,
      color: '#7b1fa2',
      permissions: [PERMISSIONS.TABLES_VIEW, PERMISSIONS.TABLES_CREATE, PERMISSIONS.TABLES_UPDATE, PERMISSIONS.TABLES_DELETE]
    },
    {
      name: 'Settings',
      icon: <Settings />,
      color: '#d32f2f',
      permissions: [PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_UPDATE]
    },
    {
      name: 'Users',
      icon: <People />,
      color: '#0288d1',
      permissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_UPDATE, PERMISSIONS.USERS_DELETE]
    },
    {
      name: 'Workspace',
      icon: <Business />,
      color: '#5d4037',
      permissions: [PERMISSIONS.WORKSPACE_VIEW, PERMISSIONS.WORKSPACE_CREATE, PERMISSIONS.WORKSPACE_UPDATE, PERMISSIONS.WORKSPACE_DELETE, PERMISSIONS.WORKSPACE_SWITCH]
    },
    {
      name: 'Cafe Management',
      icon: <Restaurant />,
      color: '#00796b',
      permissions: [PERMISSIONS.VENUE_ACTIVATE, PERMISSIONS.VENUE_DEACTIVATE, PERMISSIONS.VENUE_VIEW_ALL, PERMISSIONS.VENUE_SWITCH]
    }
  ];

  const getRoleColor = (role: string | any) => {
    // Extract role name from object or use string directly
    let roleName = role;
    if (typeof role === 'object' && role !== null) {
      roleName = role.name || role.displayName || 'unknown';
    }
    
    // Convert to lowercase for comparison
    const roleStr = String(roleName).toLowerCase();
    
    switch (roleStr) {
      case ROLES.SUPERADMIN.toLowerCase():
      case 'superadmin':
        return 'error';
      case ROLES.ADMIN.toLowerCase():
      case 'admin':
        return 'primary';
      case ROLES.OPERATOR.toLowerCase():
      case 'operator':
      case 'staff':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleDisplayName = (role: string | any) => {
    // Handle role object (from getUserWithRole)
    if (typeof role === 'object' && role !== null) {
      if (role.displayName) return String(role.displayName);
      if (role.name) return String(role.name);
    }
    
    // Handle string role
    if (!role || (typeof role !== 'string' && typeof role !== 'object')) {
      return 'Unknown Role';
    }
    
    if (typeof role === 'string') {
      const roleDefinition = PermissionService.getRoleDefinition(role);
      
      // Ensure we always return a string
      if (typeof roleDefinition === 'object' && roleDefinition?.displayName) {
        return String(roleDefinition.displayName);
      }
      
      return String(role);
    }
    
    return 'Unknown Role';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <Visibility fontSize="small" />;
      case 'create':
        return <CheckCircle fontSize="small" />;
      case 'update':
        return <CheckCircle fontSize="small" />;
      case 'delete':
        return <Cancel fontSize="small" />;
      default:
        return <CheckCircle fontSize="small" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view':
        return 'info';
      case 'create':
        return 'success';
      case 'update':
        return 'warning';
      case 'delete':
        return 'error';
      case 'activate':
      case 'deactivate':
        return 'warning';
      case 'switch':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getPermissionDescription = (permissionName: string): string => {
    const descriptions: { [key: string]: string } = {
      // Dashboard
      'dashboard:view': 'View dashboard',
      
      // Orders
      'orders:view': 'View orders',
      'orders:create': 'Create orders',
      'orders:update': 'Update orders',
      'orders:delete': 'Delete orders',
      
      // Menu
      'menu:view': 'View menu',
      'menu:create': 'Create menu items',
      'menu:update': 'Update menu',
      'menu:delete': 'Delete menu items',
      
      // Tables
      'tables:view': 'View tables',
      'tables:create': 'Create tables',
      'tables:update': 'Update tables',
      'tables:delete': 'Delete tables',
      
      // Settings
      'settings:view': 'View settings',
      'settings:update': 'Update settings',
      
      // Users
      'users:view': 'View users',
      'users:create': 'Create users',
      'users:update': 'Update users',
      'users:delete': 'Delete users',
      
      // Workspace
      'workspace:view': 'View workspaces',
      'workspace:create': 'Create workspaces',
      'workspace:update': 'Update workspaces',
      'workspace:delete': 'Delete workspaces',
      'workspace:switch': 'Switch workspaces',
      
      // Cafe Management
      'venue:activate': 'Activate venues',
      'venue:deactivate': 'Deactivate venues',
      'venue:view_all': 'View all venues',
      'venue:switch': 'Switch venues',
    };
    
    return descriptions[permissionName] || permissionName.replace(/[_:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const email = user.email || '';
    
    const matchesSearch = firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesActive = showInactive || user.isActive;
    
    return matchesSearch && matchesRole && matchesActive;
  });

  const handleViewPermissions = (user: any) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const exportPermissions = () => {
    if (filteredUsers.length === 0) {
      alert('No users available to export');
      return;
    }
    
    const data = filteredUsers.map(user => ({
      Name: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`,
      Email: user.email || 'No email',
      Role: getRoleDisplayName(user.role || 'unknown'),
      Status: user.isActive ? 'Active' : 'Inactive',
      Cafe: userData?.venue?.name || 'All Cafes',
      Permissions: user.permissions?.length || 0,
      LastLogin: user.lastLogin?.toLocaleDateString() || 'Never'
    }));
    
    // In real app, this would generate and download a CSV/Excel file
    console.log('Export data:', data);
  };

  const currentUserAuth = getUserWithRole();
  const canViewAllUsers = isSuperAdmin() || hasPermission(PERMISSIONS.USERS_VIEW);

  // Add error handling for currentUserAuth
  if (!currentUserAuth && !userDataLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Unable to load user authentication data. Please try refreshing the page or contact support.
        </Alert>
      </Container>
    );
  }

  // Debug logging
  console.log('currentUserAuth:', currentUserAuth);
  console.log('currentUserAuth.role:', currentUserAuth?.role);

  if (!canViewAllUsers) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning">
          You don't have permission to view user permissions. Contact your administrator.
        </Alert>
      </Container>
    );
  }

  // Don't render if currentUserAuth is still loading or null
  if (!currentUserAuth) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading user permissions...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          User Permissions Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor and manage user permissions across your organization
        </Typography>
      </Box>

      {/* Current User Permissions Card */}
      <Card sx={{ mb: 4, border: '2px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: 56,
                  height: 56,
                }}
              >
                <Security />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  Your Current Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.first_name || user?.firstName} {user?.last_name || user?.lastName} • {user?.email}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={getRoleDisplayName(
                      typeof currentUserAuth?.role === 'string' 
                        ? currentUserAuth.role 
                        : (currentUserAuth?.role?.displayName || currentUserAuth?.role?.name || user?.role || 'Unknown')
                    )}
                    color={getRoleColor(
                      typeof currentUserAuth?.role === 'string' 
                        ? currentUserAuth.role 
                        : (currentUserAuth?.role?.name || currentUserAuth?.role?.displayName || user?.role || 'unknown')
                    ) as any}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${currentUserAuth?.permissions?.length || 0} Permissions`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => handleViewPermissions({
                ...(currentUserAuth || {}),
                firstName: user?.first_name || user?.firstName,
                lastName: user?.last_name || user?.lastName,
                email: user?.email,
                isActive: true,
                lastLogin: new Date(),
                cafeId: userData?.venue?.id,
              })}
            >
              View My Permissions
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 4 }}>
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
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={exportPermissions}
                  size="small"
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography>Loading users...</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Cafe</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id || Math.random()}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ width: 40, height: 40 }}>
                                {(user.firstName?.[0] || '?')}{(user.lastName?.[0] || '')}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="500">
                                  {user.firstName || 'Unknown'} {user.lastName || 'User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {user.email || 'No email'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getRoleDisplayName(user.role || 'unknown')}
                              color={getRoleColor(user.role || 'unknown') as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {user.cafeId ? 
                                userData?.venue?.name || 'Unknown Cafe' : 
                                'All Cafes'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${user.permissions?.length || 0} permissions`}
                              variant="outlined"
                              size="small"
                            />
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
                              {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() => handleViewPermissions(user)}
                              sx={{ 
                                minWidth: 'auto', 
                                whiteSpace: 'nowrap',
                                px: 2
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Box sx={{ py: 6 }}>
                            <Security sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No Users Available
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              The user management API is not yet implemented. This page will show user permissions once the backend API is ready.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              💡 Check back later or contact your administrator for updates.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>

      {/* Permissions Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: getRoleColor(selectedUser?.role || '') + '.main',
                mr: 2,
              }}
            >
              <Security />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedUser?.email} • {String(getRoleDisplayName(
                  typeof selectedUser?.role === 'string' 
                    ? selectedUser.role 
                    : (selectedUser?.role?.displayName || selectedUser?.role?.name || 'Unknown')
                ))}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {permissionCategories.map((category) => {
              const userPermissions = selectedUser?.permissions || [];
              const categoryPermissions = userPermissions.filter((p: any) => 
                (category.permissions as string[]).includes(p.name)
              );
              
              // Show all categories, even if user doesn't have permissions for them
              const allCategoryPermissions = category.permissions.map(permName => {
                const userPerm = categoryPermissions.find((p: any) => p.name === permName);
                const action = permName.split(':')[1] || permName.split('_')[1] || 'view';
                return {
                  name: permName,
                  action: action,
                  description: getPermissionDescription(permName),
                  hasPermission: !!userPerm
                };
              });

              return (
                <Grid item xs={12} sm={6} md={4} key={category.name}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      {/* Category Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: category.color,
                            width: 36,
                            height: 36,
                            mr: 1.5,
                          }}
                        >
                          {React.cloneElement(category.icon, { fontSize: 'small' })}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem' }}>
                            {String(category.name)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {allCategoryPermissions.filter(p => p.hasPermission).length} of {allCategoryPermissions.length} permissions
                          </Typography>
                        </Box>
                      </Box>

                      {/* Permissions List */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {allCategoryPermissions.map((permission, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1,
                              borderRadius: 1,
                              backgroundColor: permission.hasPermission ? 'success.50' : 'grey.50',
                              border: '1px solid',
                              borderColor: permission.hasPermission ? 'success.200' : 'grey.200',
                              opacity: permission.hasPermission ? 1 : 0.6,
                            }}
                          >
                            <Box sx={{ mr: 1 }}>
                              {permission.hasPermission ? (
                                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                              ) : (
                                <Cancel sx={{ fontSize: 16, color: 'grey.400' }} />
                              )}
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight={permission.hasPermission ? 500 : 400}
                                sx={{ 
                                  fontSize: '0.875rem',
                                  color: permission.hasPermission ? 'text.primary' : 'text.secondary'
                                }}
                              >
                                {permission.description}
                              </Typography>
                            </Box>
                            <Chip
                              label={permission.action}
                              size="small"
                              color={permission.hasPermission ? getActionColor(permission.action) as any : 'default'}
                              variant={permission.hasPermission ? 'filled' : 'outlined'}
                              sx={{ 
                                fontSize: '0.7rem', 
                                height: 20,
                                opacity: permission.hasPermission ? 1 : 0.5
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight="600">
              Permission Summary:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Permissions: {selectedUser?.permissions?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {String(getRoleDisplayName(selectedUser?.role || ''))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {selectedUser?.isActive ? 'Active' : 'Inactive'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Login: {selectedUser?.lastLogin ? selectedUser.lastLogin.toLocaleString() : 'Never'}
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserPermissionsDashboard;