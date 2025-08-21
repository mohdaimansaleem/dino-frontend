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
  Container,
  useTheme,
  useMediaQuery,
  Stack,

} from '@mui/material';
import {
  TrendingUp,
  Visibility,
  Edit,
  Add,
  Dashboard as DashboardIcon,

  Restaurant,
  TableBar,
  Receipt,
  People,
} from '@mui/icons-material';
import { useUserData } from '../../contexts/UserDataContext';

import { ROLE_NAMES, getRoleDisplayName, isAdminLevel } from '../../constants/roles';

interface UserDataDashboardProps {
  className?: string;
}

const UserDataDashboard: React.FC<UserDataDashboardProps> = ({ className }) => {
  const {
    userData,
    loading,
    refreshUserData,
    hasPermission,
    getUserRole,
    isSuperAdmin,
    getVenueDisplayName,
    getUserDisplayName,
    getVenueStatsSummary,
    getStatistics,
    getRecentOrders,
    getUsers,
  } = useUserData();

  const [currentTab, setCurrentTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Container maxWidth="xl" className="container-responsive">
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
          textAlign="center"
          gap={2}
        >
          <CircularProgress size={isMobile ? 48 : 60} />
          <Typography variant={isMobile ? "body1" : "h6"}>
            Loading Dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxWidth="xl" className="container-responsive">
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant={isMobile ? "body1" : "h6"} fontWeight="600">
            No Data Available
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Unable to load your venue data. Please ensure you have a venue assigned to your account.
          </Typography>
          <Button 
            onClick={refreshUserData} 
            className="btn-responsive"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  const statistics = getStatistics();
  const menuItems = []; // Menu items are managed by MenuManagement component directly
  const tables = []; // Tables are managed by TableManagement component directly
  const recentOrders = getRecentOrders();
  const users = getUsers();

  return (
    <Container maxWidth="xl" className={`container-responsive ${className || ''}`} sx={{ pt: { xs: '56px', sm: '64px' } }}>
      <Box sx={{ py: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Stack 
            direction={{ xs: 'column', lg: 'row' }}
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', lg: 'center' }}
            spacing={{ xs: 2, lg: 0 }}
            sx={{ mb: 2 }}
          >
            <Box sx={{ width: '100%' }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                sx={{ mb: 1 }}
              >
                <DashboardIcon 
                  color="primary" 
                  sx={{ fontSize: { xs: 28, sm: 32 } }}
                />
                <Typography 
                  variant={isMobile ? "h5" : "h4"} 
                  component="h1"
                  fontWeight="bold"
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    lineHeight: 1.2
                  }}
                >
                  {getRoleDisplayName(getUserRole())} Dashboard
                </Typography>
              </Stack>
              
              <Typography 
                variant={isMobile ? "body2" : "body1"} 
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Welcome back, {getUserDisplayName()}!
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Managing {getVenueDisplayName()}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                display="block"
              >
                {getVenueStatsSummary()}
              </Typography>
            </Box>
            
            {/* SECURITY FIX: Removed venue switcher - users should only access their assigned venue */}
            {isSuperAdmin() && (
              <Alert 
                severity="info" 
                sx={{ 
                  maxWidth: { xs: '100%', lg: 300 },
                  width: { xs: '100%', lg: 'auto' }
                }}
              >
                <Typography variant="body2">
                  🔒 Security Enhancement: Venue switching has been disabled. Users now only access their assigned venue.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, md: 3 } }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 48 },
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                fontWeight: 500,
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: 160 },
                px: { xs: 2, sm: 3 }
              }
            }}
          >
            <Tab label="Dashboard" />
            <Tab label="Menu Items" />
            <Tab label="Tables" />
            <Tab label="Recent Orders" />
            {hasPermission('can_manage_users') && <Tab label="Users" />}
          </Tabs>
        </Box>

        {/* Tab Content */}
        {currentTab === 0 && (
          <>
            {/* Stats Cards */}
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card className="card-responsive">
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'center', sm: 'flex-start' }}
                      spacing={{ xs: 1, sm: 2 }}
                      textAlign={{ xs: 'center', sm: 'left' }}
                    >
                      <Receipt 
                        color="primary" 
                        sx={{ fontSize: { xs: 32, sm: 40 } }} 
                      />
                      <Box>
                        <Typography 
                          variant={isMobile ? "h5" : "h4"} 
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                        >
                          {statistics?.total_orders || 0}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          Total Orders
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card className="card-responsive">
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'center', sm: 'flex-start' }}
                      spacing={{ xs: 1, sm: 2 }}
                      textAlign={{ xs: 'center', sm: 'left' }}
                    >
                      <TrendingUp 
                        color="success" 
                        sx={{ fontSize: { xs: 32, sm: 40 } }} 
                      />
                      <Box>
                        <Typography 
                          variant={isMobile ? "h6" : "h4"} 
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}
                        >
                          ₹{statistics?.total_revenue?.toLocaleString() || 0}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          Total Revenue
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card className="card-responsive">
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'center', sm: 'flex-start' }}
                      spacing={{ xs: 1, sm: 2 }}
                      textAlign={{ xs: 'center', sm: 'left' }}
                    >
                      <TableBar 
                        color="warning" 
                        sx={{ fontSize: { xs: 32, sm: 40 } }} 
                      />
                      <Box>
                        <Typography 
                          variant={isMobile ? "h6" : "h4"} 
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}
                        >
                          {statistics?.active_tables || 0}/{statistics?.total_tables || 0}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          Active Tables
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6} sm={6} md={3}>
                <Card className="card-responsive">
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'center', sm: 'flex-start' }}
                      spacing={{ xs: 1, sm: 2 }}
                      textAlign={{ xs: 'center', sm: 'left' }}
                    >
                      <Restaurant 
                        color="info" 
                        sx={{ fontSize: { xs: 32, sm: 40 } }} 
                      />
                      <Box>
                        <Typography 
                          variant={isMobile ? "h6" : "h4"} 
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}
                        >
                          {statistics?.total_menu_items || 0}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          Menu Items
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Orders Summary */}
            <Card className="card-responsive">
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  fontWeight="600"
                  gutterBottom
                >
                  Recent Orders
                </Typography>
                
                {recentOrders.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                    <Receipt sx={{ fontSize: { xs: 40, sm: 48 }, color: 'text.secondary', mb: 2 }} />
                    <Typography 
                      variant={isMobile ? "body2" : "body1"} 
                      color="text.secondary"
                      gutterBottom
                    >
                      No recent orders yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Orders will appear here once customers start placing them
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ 
                    '& .MuiTable-root': {
                      minWidth: { xs: 'auto', sm: 650 }
                    }
                  }}>
                    <Table size={isMobile ? "small" : "medium"}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Order ID
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Table
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Amount
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: { xs: 'none', sm: 'table-cell' }
                          }}>
                            Time
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentOrders.slice(0, 5).map((order: any) => (
                          <TableRow key={order.id}>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              #{order.id.slice(-6)}
                            </TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              Table {order.table_number || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              ₹{order.total_amount?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.status || 'pending'}
                                color={order.status === 'completed' ? 'success' : 'warning'}
                                size="small"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              />
                            </TableCell>
                            <TableCell sx={{ 
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              display: { xs: 'none', sm: 'table-cell' }
                            }}>
                              {new Date(order.created_at).toLocaleTimeString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        {recentOrders.length > 5 && (
                          <TableRow>
                            <TableCell 
                              colSpan={isMobile ? 4 : 5} 
                              sx={{ textAlign: 'center', py: 1 }}
                            >
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
          <Card className="card-responsive">
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, sm: 0 }}
                sx={{ mb: 3 }}
              >
                <Typography variant={isMobile ? "body1" : "h6"} fontWeight="600">
                  Menu Items ({menuItems.length})
                </Typography>
                {hasPermission('can_manage_menu') && (
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    className="btn-responsive"
                    size={isMobile ? "medium" : "large"}
                  >
                    Add Menu Item
                  </Button>
                )}
              </Stack>
              
              <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
                <Restaurant sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  color="text.secondary" 
                  fontWeight="600"
                  gutterBottom
                >
                  Menu Management
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
                >
                  {hasPermission('can_manage_menu') 
                    ? "Use the dedicated Menu Management page to create and manage your restaurant's menu items, categories, and pricing."
                    : "Menu items are managed by the restaurant manager through the Menu Management section."
                  }
                </Typography>
                {hasPermission('can_manage_menu') && (
                  <Button 
                    variant="contained" 
                    startIcon={<Restaurant />} 
                    className="btn-responsive"
                    size={isMobile ? "medium" : "large"}
                    onClick={() => window.location.href = '/admin/menu'}
                  >
                    Go to Menu Management
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tables Tab */}
        {currentTab === 2 && (
          <Card className="card-responsive">
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, sm: 0 }}
                sx={{ mb: 3 }}
              >
                <Typography variant={isMobile ? "body1" : "h6"} fontWeight="600">
                  Tables ({tables.length})
                </Typography>
                {hasPermission('can_manage_tables') && (
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    className="btn-responsive"
                    size={isMobile ? "medium" : "large"}
                  >
                    Add Table
                  </Button>
                )}
              </Stack>
              
              <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
                <TableBar sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  color="text.secondary" 
                  fontWeight="600"
                  gutterBottom
                >
                  Table Management
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
                >
                  {hasPermission('can_manage_tables') 
                    ? "Use the dedicated Table Management page to set up and manage your dining area, add tables, and generate QR codes."
                    : "Tables are managed by the restaurant manager through the Table Management section."
                  }
                </Typography>
                {hasPermission('can_manage_tables') && (
                  <Button 
                    variant="contained" 
                    startIcon={<TableBar />} 
                    className="btn-responsive"
                    size={isMobile ? "medium" : "large"}
                    onClick={() => window.location.href = '/admin/tables'}
                  >
                    Go to Table Management
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders Tab */}
        {currentTab === 3 && (
          <Card className="card-responsive">
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                fontWeight="600"
                gutterBottom
              >
                Recent Orders ({recentOrders.length})
              </Typography>
              
              {recentOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
                  <Receipt sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    color="text.secondary" 
                    fontWeight="600"
                    gutterBottom
                  >
                    No Orders Found
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}
                  >
                    Orders from customers will appear here once they start placing orders through your menu.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    💡 Make sure your menu items and tables are set up to start receiving orders!
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ 
                  '& .MuiTable-root': {
                    minWidth: { xs: 'auto', sm: 800 }
                  }
                }}>
                  <Table size={isMobile ? "small" : "medium"}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Order ID
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          display: { xs: 'none', sm: 'table-cell' }
                        }}>
                          Customer
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Table
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          display: { xs: 'none', md: 'table-cell' }
                        }}>
                          Items
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Amount
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          display: { xs: 'none', lg: 'table-cell' }
                        }}>
                          Time
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            #{order.id.slice(-6)}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: { xs: 'none', sm: 'table-cell' }
                          }}>
                            {order.customer_name || 'Guest'}
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            Table {order.table_number || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: { xs: 'none', md: 'table-cell' }
                          }}>
                            {order.items?.length || 0} items
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            ₹{order.total_amount?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status || 'pending'}
                              color={
                                order.status === 'completed' ? 'success' :
                                order.status === 'preparing' ? 'warning' :
                                order.status === 'cancelled' ? 'error' : 'default'
                              }
                              size="small"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: { xs: 'none', lg: 'table-cell' }
                          }}>
                            {new Date(order.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton 
                                size="small"
                                className="btn-responsive"
                                sx={{ minWidth: 44, minHeight: 44 }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                              {hasPermission('can_manage_orders') && (
                                <IconButton 
                                  size="small"
                                  className="btn-responsive"
                                  sx={{ minWidth: 44, minHeight: 44 }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
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
          <Card className="card-responsive">
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between" 
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, sm: 0 }}
                sx={{ mb: 3 }}
              >
                <Typography variant={isMobile ? "body1" : "h6"} fontWeight="600">
                  Users ({users.length})
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  className="btn-responsive"
                  size={isMobile ? "medium" : "large"}
                >
                  Add User
                </Button>
              </Stack>
              
              {users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6 } }}>
                  <People sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    color="text.secondary" 
                    fontWeight="600"
                    gutterBottom
                  >
                    No Team Members Found
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
                  >
                    Build your team by adding staff members who can help manage your restaurant operations.
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    className="btn-responsive"
                    size={isMobile ? "medium" : "large"}
                  >
                    Add Your First Team Member
                  </Button>
                </Box>
              ) : (
                <TableContainer sx={{ 
                  '& .MuiTable-root': {
                    minWidth: { xs: 'auto', sm: 650 }
                  }
                }}>
                  <Table size={isMobile ? "small" : "medium"}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Name
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          display: { xs: 'none', sm: 'table-cell' }
                        }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Role
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: { xs: 'none', sm: 'table-cell' }
                          }}>
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              color={
                                user.role === ROLE_NAMES.SUPERADMIN ? 'error' :
                                isAdminLevel(user.role) ? 'primary' : 'secondary'
                              }
                              size="small"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.is_active ? 'Active' : 'Inactive'}
                              color={user.is_active ? 'success' : 'error'}
                              size="small"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton 
                                size="small"
                                className="btn-responsive"
                                sx={{ minWidth: 44, minHeight: 44 }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small"
                                className="btn-responsive"
                                sx={{ minWidth: 44, minHeight: 44 }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Stack>
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
      </Box>
    </Container>
  );
};

export default UserDataDashboard;