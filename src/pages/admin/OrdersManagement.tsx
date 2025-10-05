import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  Badge,
  Skeleton,
  useTheme,
  useMediaQuery,
  Stack,
  keyframes,
} from '@mui/material';
import {
  Restaurant,
  Schedule,
  CheckCircle,
  LocalShipping,
  Assignment,
  Refresh,
  Edit,
  Visibility,
  Print,
  Search,
  Timer,
  TableRestaurant,
  Kitchen,
  Notifications,
  TrendingUp,
  AccessTime,
  Store,
  CachedOutlined,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { useUserData } from '../../contexts/UserDataContext';
import { PERMISSIONS } from '../../types/auth';
import { orderService, Order, OrderStatus, PaymentStatus, PaymentMethod } from '../../services/business';
import {
  ORDER_STATUS,
  STATUS_COLORS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  PAGE_TITLES,
  PLACEHOLDERS,
} from '../../constants';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { useOrderFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

// Animation for refresh icon
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Pulse animation for urgent orders
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
`;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const OrdersManagement: React.FC = () => {
  const { hasPermission, isOperator, isAdmin } = useAuth();
  const { 
    userData, 
    loading: userDataLoading, 
    getVenue, 
    getVenueDisplayName,
    refreshUserData 
  } = useUserData();
  const orderFlags = useOrderFlags();
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      const venue = getVenue();
      
      if (!venue?.id) {
        // Try to refresh user data to get venue
        try {
          await refreshUserData();
          setError('No venue assigned to your account. Please contact support.');
        } catch (refreshError) {
          setError('Unable to load venue data. Please contact support.');
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const ordersData = await orderService.getVenueOrders(venue.id);
        setOrders(ordersData);
      } catch (error) {
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Auto-refresh orders every 30 seconds
    const refreshTimer = setInterval(loadOrders, 30000);

    return () => {
      clearInterval(refreshTimer);
    };
  }, [userData?.venue?.id]);

  // Retry loading orders when venue becomes available
  useEffect(() => {
    const venue = getVenue();
    if (venue?.id && orders.length === 0 && !loading) {
      const loadOrders = async () => {
        try {
          setLoading(true);
          setError(null);
          const ordersData = await orderService.getVenueOrders(venue.id);
          setOrders(ordersData);
        } catch (error) {
          setError('Failed to load orders. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      loadOrders();
    }
  }, [userData?.venue?.id]);

  // Filter orders based on search and status (cancelled orders are already excluded from API)
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.table_id && order.table_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.items.some(item => 
          item.menu_item_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getActiveOrders = () => {
    return filteredOrders.filter(order => 
      order.status === 'pending' || 
      order.status === 'confirmed' || 
      order.status === 'preparing' || 
      order.status === 'ready'
    );
  };

  const getServedOrders = () => {
    return filteredOrders.filter(order => order.status === 'served' || order.status === 'delivered');
  };

  // Removed getCancelledOrders function - cancelled orders are no longer displayed

  const getUrgentOrders = () => {
    const now = new Date();
    return getActiveOrders().filter(order => {
      const orderTime = new Date(order.created_at);
      const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
      return diffInMinutes > 30; // Orders older than 30 minutes
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'preparing': '#f97316',
      'ready': '#10b981',
      'out_for_delivery': '#8b5cf6',
      'delivered': '#059669',
      'served': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Assignment />;
      case 'confirmed': return <CheckCircle />;
      case 'preparing': return <Restaurant />;
      case 'ready': return <CheckCircle />;
      case 'served': return <LocalShipping />;
      case 'delivered': return <LocalShipping />;
      case 'cancelled': return <Visibility />;
      default: return <Schedule />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTableNumber = (order: Order) => {
    if (order.table_id) {
      return order.table_id.replace(/^table-/, 'T-').replace(/^dt-/, 'DT-');
    }
    return order.order_number || order.id;
  };

  const getTimeSinceOrder = (orderTime: string) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    if (hours < 24) return minutes > 0 ? `${hours}h ${minutes}m ago` : `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const isOrderUrgent = (orderTime: string) => {
    const now = new Date();
    const orderDate = new Date(orderTime);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    return diffInMinutes > 30;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      setSnackbar({ 
        open: true, 
        message: `Order ${orderId} status updated to ${orderService.formatOrderStatus(newStatus)}`, 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to update order status. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleRefreshOrders = async () => {
    const venue = getVenue();
    if (!venue?.id) return;

    try {
      setLoading(true);
      const ordersData = await orderService.getVenueOrders(venue.id);
      setOrders(ordersData);
      setSnackbar({ 
        open: true, 
        message: 'Orders refreshed successfully', 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to refresh orders. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOpenOrderDialog(true);
  };

  const renderOrderCard = (order: Order) => {
    const isUrgent = isOrderUrgent(order.created_at);
    
    return (
      <Card 
        key={order.id}
        sx={{ 
          mb: 2, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid', 
          borderColor: isUrgent ? 'error.main' : 'divider',
          backgroundColor: 'background.paper',
          borderLeft: `4px solid ${getStatusColor(order.status)}`,
          transition: 'all 0.2s ease-in-out',
          animation: isUrgent ? `${pulse} 2s infinite` : 'none',
          '&:hover': { 
            borderColor: 'primary.main',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <CardContent sx={{ 
          p: { xs: 2, sm: 3 }, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: { xs: 320, sm: 400 }
        }}>
          <Stack 
            direction="row"
            justifyContent="space-between" 
            alignItems="flex-start" 
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Typography 
                  variant={isMobile ? "body1" : "h6"} 
                  fontWeight="600" 
                  color="text.primary"
                  noWrap
                >
                  {order.order_number || order.id}
                </Typography>
                {isUrgent && (
                  <Chip 
                    label="URGENT" 
                    size="small" 
                    color="error" 
                    sx={{ 
                      fontSize: '0.65rem',
                      height: 20,
                      fontWeight: 600
                    }} 
                  />
                )}
              </Stack>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 0.5, sm: 1 }}
                sx={{ mt: 0.5 }}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TableRestaurant fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Table {getTableNumber(order)}
                  </Typography>
                </Stack>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  • {formatTime(order.created_at)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={isUrgent ? "error.main" : "text.secondary"}
                  fontWeight={isUrgent ? 600 : 400}
                >
                  {isMobile ? formatTime(order.created_at) : `• ${getTimeSinceOrder(order.created_at)}`}
                </Typography>
              </Stack>
            </Box>
            <Chip 
              icon={getStatusIcon(order.status)}
              label={orderService.formatOrderStatus(order.status)}
              size="small"
              sx={{ 
                backgroundColor: getStatusColor(order.status),
                color: 'white',
                '& .MuiChip-icon': { color: 'white' },
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
            />
          </Stack>

          <Box sx={{ mb: 2 }}>
            <Typography 
              variant={isMobile ? "body2" : "subtitle2"} 
              fontWeight="600" 
              color="text.primary" 
              sx={{ mb: 1 }}
            >
              Items ({order.items.length})
            </Typography>
            {order.items.slice(0, isMobile ? 2 : 3).map((item, index) => (
              <Stack 
                key={index}
                direction="row"
                justifyContent="space-between" 
                alignItems="center" 
                spacing={1}
                sx={{ mb: 0.5 }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50', // Default to veg, would need menu item data for actual veg/non-veg
                      flexShrink: 0
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.quantity}x {item.menu_item_name}
                  </Typography>
                </Stack>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    flexShrink: 0
                  }}
                >
                  {formatCurrency(item.total_price)}
                </Typography>
              </Stack>
            ))}
            {order.items.length > (isMobile ? 2 : 3) && (
              <Typography 
                variant="body2" 
                color="primary.main" 
                sx={{ 
                  cursor: 'pointer',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => handleViewOrder(order)}
              >
                +{order.items.length - (isMobile ? 2 : 3)} more items
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 'auto' }}>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                fontWeight="600" 
                color="text.primary"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Total: {formatCurrency(order.total_amount)}
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1} 
                sx={{ mt: 0.5 }}
              >
                <Chip 
                  label={orderService.formatPaymentStatus(order.payment_status)} 
                  size="small" 
                  color={order.payment_status === 'paid' ? 'success' : 'warning'}
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
                {order.payment_method && (
                  <Chip 
                    label={order.payment_method.toUpperCase()} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  />
                )}
              </Stack>
            </Box>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1} 
              justifyContent="center"
            >
              {/* View button only for admin */}
              {isAdmin() && (
                <FlagGate flag="orders.showOrderDetails">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewOrder(order)}
                    startIcon={<Visibility />}
                    className="btn-responsive"
                    fullWidth={isMobile}
                    sx={{ 
                      flex: { xs: 'none', sm: isOperator() ? 0 : 1 },
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50'
                      }
                    }}
                  >
                    View
                  </Button>
                </FlagGate>
              )}
              {order.status !== 'served' && (
                <FlagGate flag="orders.showOrderStatusUpdate">
                  <FormControl 
                    size="small" 
                    className="input-responsive"
                    sx={{ flex: { xs: 'none', sm: 1 }, width: { xs: '100%', sm: 'auto' } }}
                  >
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                      size="small"
                      disabled={!hasPermission(PERMISSIONS.ORDERS_UPDATE)}
                      sx={{
                        '& .MuiSelect-select': {
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          fontWeight: 600,
                          '&:focus': {
                            backgroundColor: getStatusColor(order.status),
                          }
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: getStatusColor(order.status),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: getStatusColor(order.status),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: getStatusColor(order.status),
                        }
                      }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="preparing">Preparing</MenuItem>
                      <MenuItem value="ready">Ready</MenuItem>
                      <MenuItem value="served">Served</MenuItem>
                    </Select>
                  </FormControl>
                </FlagGate>
              )}
            </Stack>
          </Box>

          {order.estimated_ready_time && order.status !== 'served' && (
            <Stack 
              direction="row"
              alignItems="center" 
              spacing={1} 
              sx={{ 
                mt: 2, 
                p: { xs: 1, sm: 1.5 }, 
                backgroundColor: 'info.50', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'info.200'
              }}
            >
              <Timer fontSize="small" color="info" />
              <Typography 
                variant="body2" 
                color="info.main"
                fontWeight="500"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Estimated ready: {formatTime(order.estimated_ready_time)}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
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
        }}
      >
        <Container maxWidth="xl" sx={{ pt: { xs: '56px', sm: '64px' } }}>
          <Box sx={{ py: { xs: 2, sm: 4 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card className="card-responsive">
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Skeleton variant="text" height={isMobile ? 28 : 32} />
                      <Skeleton variant="text" height={isMobile ? 20 : 24} />
                      <Skeleton variant="rectangular" height={isMobile ? 100 : 120} sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
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
        }}
      >
        <Container maxWidth="xl" sx={{ pt: { xs: '56px', sm: '64px' } }}>
          <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              color="error" 
              gutterBottom
              fontWeight="600"
            >
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleRefreshOrders} 
              className="btn-responsive"
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </Box>
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
                <Kitchen sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
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
                  {isOperator() ? 'Kitchen Dashboard' : 'Orders Management'}
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
                {isOperator() 
                  ? `Real-time order tracking and kitchen workflow for ${getVenueDisplayName()}` 
                  : `Comprehensive order management and analytics for ${getVenueDisplayName()}`
                }
              </Typography>

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
                  {getVenueDisplayName()}
                </Typography>
              </Box>
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
              {getUrgentOrders().length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Notifications />}
                  size="medium"
                  sx={{
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    color: 'error.main',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.2)',
                      borderColor: 'error.main',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {getUrgentOrders().length} Urgent
                </Button>
              )}

              <IconButton
                onClick={handleRefreshOrders}
                disabled={loading}
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
                title={loading ? 'Refreshing...' : 'Refresh orders'}
              >
                {loading ? (
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
        {/* Kitchen Statistics */}
        <FlagGate flag="orders.showOrderStats">
          <Box sx={{ mb: 4, px: { xs: 3, sm: 4 }, py: 2 }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[
                { 
                  label: 'Total Orders Today', 
                  value: orders.length, 
                  color: '#2196F3', 
                  icon: <Assignment />,
                  description: 'All orders received'
                },
                { 
                  label: 'Active Orders', 
                  value: getActiveOrders().length, 
                  color: '#FF9800', 
                  icon: <Restaurant />,
                  description: 'Currently processing'
                },
                { 
                  label: 'Ready to Serve', 
                  value: orders.filter(o => o.status === 'ready').length, 
                  color: '#4CAF50', 
                  icon: <CheckCircle />,
                  description: 'Awaiting pickup'
                },
                { 
                  label: 'Urgent Orders', 
                  value: getUrgentOrders().length, 
                  color: '#F44336', 
                  icon: <Timer />,
                  description: 'Over 30 minutes'
                },
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
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
          </Box>
        </FlagGate>

        {/* Enhanced Controls */}
        <FlagGate flag="orders.showOrderFilters">
          <Paper 
            sx={{ 
              p: 3, 
              mb: 4, 
              border: '1px solid', 
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              mx: { xs: 3, sm: 4 }
            }}
          >
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  className="input-responsive"
                  placeholder={isMobile ? "Search orders..." : "Search orders by ID, table, or items..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size={isMobile ? "medium" : "medium"}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth className="input-responsive">
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Filter by Status"
                    size={isMobile ? "medium" : "medium"}
                  >
                    <MenuItem value="all">All Orders</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="preparing">Preparing</MenuItem>
                    <MenuItem value="ready">Ready</MenuItem>
                    <MenuItem value="served">Served</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </FlagGate>

        {/* Tabs */}
        <Paper sx={{ 
          border: '1px solid', 
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          mx: { xs: 3, sm: 4 }
        }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 48 },
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                fontWeight: 500,
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: 160 },
                px: { xs: 1, sm: 2 }
              }
            }}
          >
            <Tab 
              icon={
                <Badge badgeContent={getActiveOrders().length} color="warning">
                  <Restaurant fontSize={isMobile ? "small" : "medium"} />
                </Badge>
              } 
              label={isMobile ? "Active" : "Active Orders"}
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab 
              icon={
                <Badge badgeContent={getServedOrders().length} color="success">
                  <CheckCircle fontSize={isMobile ? "small" : "medium"} />
                </Badge>
              } 
              label={isMobile ? "Served" : "Served Orders"}
              iconPosition={isMobile ? "top" : "start"}
            />
          </Tabs>

          {/* Active Orders Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {getActiveOrders().length === 0 ? (
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
                      No Active Orders
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
                      All orders have been served or there are no new orders. The kitchen is ready for the next wave!
                    </Typography>
                  </Box>
                </Card>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {getActiveOrders().map(order => (
                    <Grid item xs={12} md={6} lg={4} key={order.id}>
                      {renderOrderCard(order)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>

          {/* Served Orders Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {getServedOrders().length === 0 ? (
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '2px dashed',
                    borderColor: 'success.light',
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
                        background: 'linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        border: '2px solid',
                        borderColor: 'success.main',
                      }}
                    >
                      <CheckCircle
                        sx={{
                          fontSize: 40,
                          color: '#2e7d32',
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
                      No Served Orders
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
                      Completed orders will appear here. Start serving some delicious meals!
                    </Typography>
                  </Box>
                </Card>
              ) : (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {getServedOrders().map(order => (
                    <Grid item xs={12} md={6} lg={4} key={order.id}>
                      {renderOrderCard(order)}
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>

          {/* Cancelled Orders Tab Removed - Cancelled orders are no longer displayed */}
        </Paper>

        {/* Order Details Dialog */}
        <Dialog 
          open={openOrderDialog} 
          onClose={() => setOpenOrderDialog(false)} 
          maxWidth="md" 
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              m: isMobile ? 0 : 2,
              maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={{ xs: 1, sm: 0 }}
            >
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                fontWeight="600"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                Order Details - {selectedOrder?.order_number || selectedOrder?.id}
              </Typography>
              {selectedOrder && (
                <Chip 
                  icon={getStatusIcon(selectedOrder.status)}
                  label={orderService.formatOrderStatus(selectedOrder.status)}
                  sx={{ 
                    backgroundColor: getStatusColor(selectedOrder.status),
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' },
                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                  }}
                />
              )}
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ 
            px: { xs: 2, sm: 3 }, 
            py: { xs: 3, sm: 4 },
            minHeight: '400px'
          }}>
            {selectedOrder && (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} md={8}>
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    fontWeight="600" 
                    gutterBottom
                  >
                    Order Information
                  </Typography>
                  <List dense={isMobile}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Order ID" 
                        secondary={selectedOrder.order_number || selectedOrder.id}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Table" 
                        secondary={getTableNumber(selectedOrder)}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Order Time" 
                        secondary={formatTime(selectedOrder.created_at)}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Status" 
                        secondary={orderService.formatOrderStatus(selectedOrder.status)}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    {selectedOrder.estimated_ready_time && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Estimated Ready Time" 
                          secondary={formatTime(selectedOrder.estimated_ready_time)}
                          primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    fontWeight="600" 
                    gutterBottom
                  >
                    Payment Information
                  </Typography>
                  <List dense={isMobile}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Payment Status" 
                        secondary={orderService.formatPaymentStatus(selectedOrder.payment_status)}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </ListItem>
                    {selectedOrder.payment_method && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Payment Method" 
                          secondary={selectedOrder.payment_method.toUpperCase()}
                          primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    fontWeight="600" 
                    gutterBottom
                  >
                    Order Items
                  </Typography>
                  <List dense={isMobile}>
                    {selectedOrder.items.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText 
                          primary={`${item.quantity}x ${item.menu_item_name}`}
                          secondary={`${formatCurrency(item.unit_price)} each - Total: ${formatCurrency(item.total_price)}`}
                          primaryTypographyProps={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                          secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              width={{ xs: '100%', sm: 'auto' }}
              alignItems="center"
            >
              <Button 
                onClick={() => setOpenOrderDialog(false)}
                className="btn-responsive"
                fullWidth={isMobile}
              >
                Close
              </Button>
              {selectedOrder && selectedOrder.status !== 'served' && (
                <FormControl 
                  size="small" 
                  className="input-responsive"
                  sx={{ minWidth: { xs: '100%', sm: 120 } }}
                >
                  <Select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as OrderStatus)}
                    size="small"
                    disabled={!hasPermission(PERMISSIONS.ORDERS_UPDATE)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="preparing">Preparing</MenuItem>
                    <MenuItem value="ready">Ready</MenuItem>
                    <MenuItem value="served">Served</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Stack>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default OrdersManagement;