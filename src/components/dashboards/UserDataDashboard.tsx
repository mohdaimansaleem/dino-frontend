import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  Visibility,
  Edit,
  Add,
  Dashboard as DashboardIcon,
  BugReport,
  Restaurant,
  TableBar,
  Receipt,
  People,
} from '@mui/icons-material';
import { useUserData } from '../../contexts/UserDataContext';
import { useAuth } from '../../contexts/AuthContext';
import WorkspaceDebug from '../debug/WorkspaceDebug';

interface UserDataDashboardProps {
  className?: string;
}

const UserDataDashboard: React.FC<UserDataDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const {
    userData,
    loading,
    refreshUserData,
    hasPermission,
    getUserRole,
    isSuperAdmin,
    isAdmin,
    getVenueDisplayName,
    getWorkspaceDisplayName,
    getUserDisplayName,
    getVenueStatsSummary,
    getStatistics,
    getMenuItems,
    getTables,
    getRecentOrders,
    getUsers,
  } = useUserData();

  const [currentTab, setCurrentTab] = useState(0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="h6">No Data Available</Typography>
        <Typography>
          Unable to load your venue data. Please ensure you have a venue assigned to your account.
        </Typography>
        <Button onClick={refreshUserData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  const statistics = getStatistics();
  const menuItems = getMenuItems();
  const tables = getTables();
  const recentOrders = getRecentOrders();
  const users = getUsers();

  return (
    <Box className={className} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon color="primary" />
              {getUserRole() === 'superadmin' ? 'Super Admin' : getUserRole() === 'admin' ? 'Admin' : 'Operator'} Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {getUserDisplayName()}! Managing {getVenueDisplayName()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getVenueStatsSummary()}
            </Typography>
          </Box>
          
          {/* SECURITY FIX: Removed venue switcher - users should only access their assigned venue */}
          {isSuperAdmin() && (
            <Alert severity="info" sx={{ maxWidth: 300 }}>
              <Typography variant="body2">
                🔒 Security Enhancement: Venue switching has been disabled. Users now only access their assigned venue.
              </Typography>
            </Alert>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Dashboard" />
          <Tab label="Menu Items" />
          <Tab label="Tables" />
          <Tab label="Recent Orders" />
          {hasPermission('can_manage_users') && <Tab label="Users" />}
          <Tab label="Debug" icon={<BugReport />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Receipt color="primary" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {statistics?.total_orders || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUp color="success" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        ₹{statistics?.total_revenue?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TableBar color="warning" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {statistics?.active_tables || 0}/{statistics?.total_tables || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Tables
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Restaurant color="info" sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {statistics?.total_menu_items || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Menu Items
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Orders Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              
              {recentOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No recent orders yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Orders will appear here once customers start placing them
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Table</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id.slice(-6)}</TableCell>
                          <TableCell>Table {order.table_number || 'N/A'}</TableCell>
                          <TableCell>₹{order.total_amount?.toLocaleString() || 0}</TableCell>
                          <TableCell>
                            <Chip
                              label={order.status || 'pending'}
                              color={order.status === 'completed' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {recentOrders.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Showing 5 of {recentOrders.length} recent orders
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Menu Items Tab */}
      {currentTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Menu Items ({menuItems.length})
              </Typography>
              {hasPermission('can_manage_menu') && (
                <Button variant="contained" startIcon={<Add />}>
                  Add Menu Item
                </Button>
              )}
            </Box>
            
            {menuItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Menu Items Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {hasPermission('can_manage_menu') 
                    ? "Get started by adding your first menu item to showcase your delicious offerings."
                    : "Menu items will appear here once they are added by the restaurant manager."
                  }
                </Typography>
                {hasPermission('can_manage_menu') && (
                  <Button variant="contained" startIcon={<Add />} size="large">
                    Add Your First Menu Item
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {menuItems.slice(0, 10).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.is_available ? 'Available' : 'Unavailable'}
                            color={item.is_available ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {hasPermission('can_manage_menu') && (
                            <>
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                              <IconButton size="small">
                                <Edit />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {menuItems.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Showing 10 of {menuItems.length} menu items
                          </Typography>
                          <Button size="small" sx={{ mt: 1 }}>
                            View All Menu Items
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tables Tab */}
      {currentTab === 2 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Tables ({tables.length})
              </Typography>
              {hasPermission('can_manage_tables') && (
                <Button variant="contained" startIcon={<Add />}>
                  Add Table
                </Button>
              )}
            </Box>
            
            {tables.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <TableBar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Tables Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {hasPermission('can_manage_tables') 
                    ? "Set up your dining area by adding tables for customers to book and dine."
                    : "Tables will appear here once they are configured by the restaurant manager."
                  }
                </Typography>
                {hasPermission('can_manage_tables') && (
                  <Button variant="contained" startIcon={<Add />} size="large">
                    Add Your First Table
                  </Button>
                )}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Table Number</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>QR Code</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tables.map((table) => (
                      <TableRow key={table.id}>
                        <TableCell>{table.table_number}</TableCell>
                        <TableCell>{table.capacity} seats</TableCell>
                        <TableCell>
                          <Chip
                            label={table.is_active ? 'Active' : 'Inactive'}
                            color={table.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {table.qr_code ? (
                            <Chip label="Generated" color="success" size="small" />
                          ) : (
                            <Chip label="Not Generated" color="warning" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {hasPermission('can_manage_tables') && (
                            <>
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                              <IconButton size="small">
                                <Edit />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Orders Tab */}
      {currentTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Orders ({recentOrders.length})
            </Typography>
            
            {recentOrders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Orders Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Orders from customers will appear here once they start placing orders through your menu.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  💡 Make sure your menu items and tables are set up to start receiving orders!
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Table</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id.slice(-6)}</TableCell>
                        <TableCell>{order.customer_name || 'Guest'}</TableCell>
                        <TableCell>Table {order.table_number || 'N/A'}</TableCell>
                        <TableCell>{order.items?.length || 0} items</TableCell>
                        <TableCell>₹{order.total_amount?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status || 'pending'}
                            color={
                              order.status === 'completed' ? 'success' :
                              order.status === 'preparing' ? 'warning' :
                              order.status === 'cancelled' ? 'error' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          {hasPermission('can_manage_orders') && (
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Tab */}
      {currentTab === 4 && hasPermission('can_manage_users') && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Users ({users.length})
              </Typography>
              <Button variant="contained" startIcon={<Add />}>
                Add User
              </Button>
            </Box>
            
            {users.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Team Members Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Build your team by adding staff members who can help manage your restaurant operations.
                </Typography>
                <Button variant="contained" startIcon={<Add />} size="large">
                  Add Your First Team Member
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.first_name} {user.last_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={
                              user.role === 'superadmin' ? 'error' :
                              user.role === 'admin' ? 'primary' : 'secondary'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.is_active ? 'Active' : 'Inactive'}
                            color={user.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <Edit />
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
      )}

      {/* Debug Tab */}
      {currentTab === (hasPermission('can_manage_users') ? 5 : 4) && (
        <WorkspaceDebug />
      )}
    </Box>
  );
};

export default UserDataDashboard;