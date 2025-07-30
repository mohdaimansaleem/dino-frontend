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
import { useWorkspace } from '../../contexts/WorkspaceContext';
import PermissionService from '../../services/permissionService';
import { PERMISSIONS, ROLES } from '../../types/auth';

const UserPermissionsDashboard: React.FC = () => {
  const { user, getUserWithRole, hasPermission, isSuperAdmin } = useAuth();
  const { currentCafe, cafes } = useWorkspace();
  
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
        console.error('Failed to load users:', error);
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
      permissions: [PERMISSIONS.CAFE_ACTIVATE, PERMISSIONS.CAFE_DEACTIVATE, PERMISSIONS.CAFE_VIEW_ALL, PERMISSIONS.CAFE_SWITCH]
    }
  ];

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
      default:
        return 'default';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesActive = showInactive || user.isActive;
    
    return matchesSearch && matchesRole && matchesActive;
  });

  const handleViewPermissions = (user: any) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const exportPermissions = () => {
    const data = filteredUsers.map(user => ({
      Name: `${user.firstName} ${user.lastName}`,
      Email: user.email,
      Role: getRoleDisplayName(user.role),
      Status: user.isActive ? 'Active' : 'Inactive',
      Cafe: cafes.find(c => c.id === user.cafeId)?.name || 'All Cafes',
      Permissions: user.permissions.length,
      LastLogin: user.lastLogin?.toLocaleDateString() || 'Never'
    }));
    
    console.log('Exporting permissions data:', data);
    // In real app, this would generate and download a CSV/Excel file
  };

  const currentUserAuth = getUserWithRole();
  const canViewAllUsers = isSuperAdmin() || hasPermission(PERMISSIONS.USERS_VIEW);

  if (!canViewAllUsers) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning">
          You don't have permission to view user permissions. Contact your administrator.
        </Alert>
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
                  {user?.firstName} {user?.lastName} • {user?.email}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={getRoleDisplayName(typeof currentUserAuth?.role === 'string' ? currentUserAuth.role : currentUserAuth?.role?.name || '')}
                    color={getRoleColor(typeof currentUserAuth?.role === 'string' ? currentUserAuth.role : currentUserAuth?.role?.name || '') as any}
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
                ...currentUserAuth,
                firstName: user?.firstName,
                lastName: user?.lastName,
                email: user?.email,
                isActive: true,
                lastLogin: new Date(),
                cafeId: currentCafe?.id,
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
                  {filteredUsers.map((user) => (
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
                      <Typography variant="body2">
                        {user.cafeId ? 
                          cafes.find(c => c.id === user.cafeId)?.name || 'Unknown Cafe' : 
                          'All Cafes'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${user.permissions.length} permissions`}
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {filteredUsers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No users found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
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
                {selectedUser?.email} • {getRoleDisplayName(selectedUser?.role || '')}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2}>
            {permissionCategories.map((category) => {
              const userPermissions = selectedUser?.permissions || [];
              const categoryPermissions = userPermissions.filter((p: any) => 
                (category.permissions as string[]).includes(p.name)
              );
              
              if (categoryPermissions.length === 0) return null;

              return (
                <Grid item xs={12} sm={6} key={category.name}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: category.color,
                          width: 32,
                          height: 32,
                          mr: 1,
                        }}
                      >
                        {React.cloneElement(category.icon, { fontSize: 'small' })}
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600">
                        {category.name}
                      </Typography>
                    </Box>

                    <List dense>
                      {categoryPermissions.map((permission: any, index: number) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Chip
                              icon={getActionIcon(permission.action || '')}
                              label={permission.action || 'Unknown'}
                              size="small"
                              color={getActionColor(permission.action || '') as any}
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={permission.description || permission.name || 'No description'}
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontSize: '0.875rem'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
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
              Role: {getRoleDisplayName(selectedUser?.role || '')}
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