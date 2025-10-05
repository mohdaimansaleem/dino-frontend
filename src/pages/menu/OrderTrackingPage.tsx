import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Alert,
  Grid,
  LinearProgress,
  Avatar,
  Divider,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Refresh,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { trackingService, OrderTracking } from '../../services/api';
import { OrderStatusUpdate } from '../../components/orders';
import { OrderStatus } from '../../services/business';

// Mapping function to convert between OrderTrackingStatus and OrderStatus
const mapTrackingStatusToOrderStatus = (trackingStatus: string): OrderStatus => {
  const mapping: Record<string, OrderStatus> = {
    'placed': 'pending',
    'confirmed': 'confirmed',
    'preparing': 'preparing',
    'ready': 'ready',
    'out_for_delivery': 'out_for_delivery',
    'delivered': 'delivered',
    'served': 'served',
    'cancelled': 'cancelled'
  };
  return mapping[trackingStatus] || 'pending';
};

const mapOrderStatusToTrackingStatus = (orderStatus: OrderStatus): string => {
  const mapping: Record<OrderStatus, string> = {
    'pending': 'placed',
    'confirmed': 'confirmed',
    'preparing': 'preparing',
    'ready': 'ready',
    'out_for_delivery': 'out_for_delivery',
    'delivered': 'delivered',
    'served': 'served',
    'cancelled': 'cancelled'
  };
  return mapping[orderStatus] || 'placed';
};

// Default order structure for loading states
const defaultOrder: OrderTracking = {
  order_id: '',
  order_number: '',
  venue_id: '',
  customer: {
    name: '',
    phone: '',
  },
  status: 'placed',
  payment_status: 'pending',
  items: [],
  pricing: {
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    delivery_fee: 0,
    total_amount: 0,
  },
  timeline: [],
  created_at: '',
  updated_at: '',
};

const OrderTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderTracking>(defaultOrder);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load order tracking data
  useEffect(() => {
    const loadOrderTracking = async () => {
      if (!orderId) {
        setError('No order ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const trackingData = await trackingService.getOrderTrackingByNumber(orderId);
        
        if (trackingData) {
          setOrder(trackingData);
        } else {
          setError('Order not found');
        }
      } catch (error) {
        setError('Failed to load order tracking. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrderTracking();

    // Set up real-time updates if order is active
    let unsubscribe: (() => void) | undefined;
    
    if (orderId && order.status !== 'served' && order.status !== 'cancelled') {
      trackingService.subscribeToOrderUpdates(orderId, (update) => {
        setOrder(prev => ({
          ...prev,
          status: update.status,
          estimated_ready_time: update.estimated_ready_time,
        }));
      }).then(unsub => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [orderId, order.status]);

  const getStatusColor = (status: string) => {
    const colors = trackingService.getStatusDisplayInfo(status as any);
    return colors.color;
  };

  const formatPrice = (price: number) => {
    return trackingService.formatCurrency(price);
  };

  const formatTime = (dateString: string) => {
    return trackingService.formatTime(dateString);
  };

  const getEstimatedDeliveryTime = () => {
    if (order.estimated_ready_time) {
      return formatTime(order.estimated_ready_time);
    }
    return 'Calculating...';
  };

  const getProgressPercentage = () => {
    return trackingService.getProgressPercentage(order.status);
  };

  const handleRefresh = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const trackingData = await trackingService.getOrderTrackingByNumber(orderId);
      
      if (trackingData) {
        setOrder(trackingData);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default, 
        display: 'flex', 
        flexDirection: 'column',
        pt: { xs: '56px', sm: '64px' },
      }}>
        <Container maxWidth="md" sx={{ 
          py: { xs: 2, md: 4 },
          px: { xs: 2, sm: 3 },
          flex: 1
        }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default, 
        display: 'flex', 
        flexDirection: 'column',
        pt: { xs: '56px', sm: '64px' },
      }}>
        <Container maxWidth="md" sx={{ 
          py: { xs: 2, md: 4 },
          px: { xs: 2, sm: 3 },
          flex: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 }, width: '100%' }}>
            <Typography 
              variant="h6" 
              color="error" 
              gutterBottom
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleRefresh} 
              sx={{ 
                mt: 2,
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                borderRadius: 1,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: theme.shadows[2]
                }
              }}
            >
              Try Again
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: theme.palette.background.default, 
      display: 'flex', 
      flexDirection: 'column',
      pt: { xs: '56px', sm: '64px' },
    }}>
      <Container maxWidth="md" sx={{ 
        py: { xs: 2, md: 4 },
        px: { xs: 2, sm: 3 },
        flex: 1
      }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              fontWeight: 600,
              color: 'text.primary',
              letterSpacing: '-0.01em'
            }}
          >
            Order Tracking
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Track your order in real-time
          </Typography>
        </Box>

        {/* Order Status Card */}
        <Card sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 2 }, 
                  mb: 2,
                  flexWrap: 'wrap'
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    Order #{order.order_number || order.order_id}
                  </Typography>
                  <Chip
                    label={trackingService.getStatusDisplayInfo(order.status).label}
                    sx={{ 
                      backgroundColor: getStatusColor(order.status),
                      color: 'white',
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      height: { xs: 24, sm: 32 },
                      fontWeight: 500
                    }}
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {order.table_number && `Table ${order.table_number} • `}
                  Ordered at {formatTime(order.created_at)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Estimated ready time: {getEstimatedDeliveryTime()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ 
                textAlign: { xs: 'left', md: 'right' },
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                justifyContent: { xs: 'space-between', md: 'flex-end' },
                alignItems: { xs: 'center', md: 'flex-end' },
                gap: { xs: 2, md: 0 }
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{ 
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.75, sm: 1 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      borderRadius: 1,
                      fontWeight: 500,
                      textTransform: 'none'
                    }}
                  >
                    Refresh
                  </Button>
                  
                  {/* Order Status Update - Only show for staff/admin */}
                  <OrderStatusUpdate
                    orderId={order.order_id}
                    currentStatus={mapTrackingStatusToOrderStatus(order.status)}
                    orderNumber={order.order_number}
                    onStatusUpdated={(newStatus: OrderStatus) => {
                      const trackingStatus = mapOrderStatusToTrackingStatus(newStatus);
                      setOrder(prev => ({ ...prev, status: trackingStatus as any }));
                      handleRefresh(); // Refresh to get updated data
                    }}
                    onError={(error: string) => {
                      console.error('Status update error:', error);
                      // You could show a toast notification here
                    }}
                    variant="button"
                  />
                </Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                >
                  {formatPrice(order.pricing.total_amount)}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Progress Bar */}
            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Progress
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {Math.round(getProgressPercentage())}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getProgressPercentage()} 
                sx={{ 
                  height: { xs: 6, sm: 8 }, 
                  borderRadius: 4,
                  backgroundColor: 'grey.200'
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Order Status Steps */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider',
              height: 'fit-content'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Order Status
                </Typography>
                {order.timeline.length > 0 ? (
                  <Stepper orientation="vertical">
                    {order.timeline.map((step, index) => (
                      <Step key={index} active={step.is_current} completed={step.is_completed}>
                        <StepLabel
                          StepIconComponent={() => (
                            <Box
                              sx={{
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: step.is_completed || step.is_current ? 'primary.main' : 'grey.300',
                                color: step.is_completed || step.is_current ? 'white' : 'grey.600',
                              }}
                            >
                              {step.is_completed ? 
                                <CheckCircle sx={{ fontSize: { xs: 16, sm: 20 } }} /> : 
                                <Schedule sx={{ fontSize: { xs: 16, sm: 20 } }} />
                              }
                            </Box>
                          )}
                        >
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              fontWeight: 600,
                              color: 'text.primary'
                            }}
                          >
                            {trackingService.getStatusDisplayInfo(step.status).label}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {step.message}
                          </Typography>
                          {step.is_current && (
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                icon={<Schedule sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                                label="In Progress"
                                size="small"
                                color="primary"
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                  height: { xs: 24, sm: 28 }
                                }}
                              />
                            </Box>
                          )}
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                ) : (
                  <Box sx={{ textAlign: 'center', py: { xs: 3, sm: 4 } }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Order status updates will appear here
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider',
              height: 'fit-content'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Order Items
                </Typography>
                <List sx={{ px: 0 }}>
                  {order.items.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ 
                        px: 0,
                        py: { xs: 1, sm: 1.5 },
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1, sm: 0 }
                      }}>
                        <Avatar
                          src={item.image_url}
                          alt={item.name}
                          sx={{ 
                            width: { xs: 40, sm: 48 }, 
                            height: { xs: 40, sm: 48 }, 
                            mr: { xs: 0, sm: 2 },
                            alignSelf: { xs: 'center', sm: 'flex-start' },
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          {item.name.charAt(0)}
                        </Avatar>
                        <ListItemText
                          sx={{ 
                            textAlign: { xs: 'center', sm: 'left' },
                            width: { xs: '100%', sm: 'auto' }
                          }}
                          primary={
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'center', sm: 'flex-start' },
                              gap: { xs: 0.5, sm: 0 }
                            }}>
                              <Typography 
                                variant="subtitle2"
                                sx={{ 
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  fontWeight: 600,
                                  color: 'text.primary'
                                }}
                              >
                                {item.name}
                              </Typography>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                  fontWeight: 600,
                                  color: 'primary.main'
                                }}
                              >
                                {formatPrice(item.total_price)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                Quantity: {item.quantity} × {formatPrice(item.unit_price)}
                              </Typography>
                              {item.special_instructions && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontStyle: 'italic', 
                                    mt: 0.5,
                                    fontSize: { xs: '0.7rem', sm: '0.875rem' }
                                  }}
                                >
                                  Note: {item.special_instructions}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < order.items.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    Total:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      fontWeight: 600,
                      color: 'primary.main'
                    }}
                  >
                    {formatPrice(order.pricing.total_amount)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Information */}
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Order Details
                </Typography>
                <Grid container spacing={{ xs: 2, sm: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Customer Name
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      {order.customer.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Phone Number
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      {order.customer.phone}
                    </Typography>
                  </Grid>
                  {order.table_number && (
                    <Grid item xs={12} sm={6}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Table Number
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 500,
                          color: 'text.primary'
                        }}
                      >
                        Table {order.table_number}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        mb: 1
                      }}
                    >
                      Payment Status
                    </Typography>
                    <Chip
                      label={order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      size="small"
                      color={order.payment_status === 'paid' ? 'success' : 'warning'}
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        height: { xs: 24, sm: 28 },
                        fontWeight: 500
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Help Section */}
        <Box sx={{ mt: { xs: 3, md: 4 } }}>
          <Alert 
            severity="info"
            sx={{ 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'info.light',
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography 
              variant="body2"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              <strong>Need help?</strong> If you have any questions about your order, 
              please contact our staff or show them your order ID: <strong>{order.order_number || order.order_id}</strong>
            </Typography>
          </Alert>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          justifyContent: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center'
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              borderRadius: 1,
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: 300, sm: 'none' },
              fontWeight: 500,
              textTransform: 'none'
            }}
          >
            Back to Home
          </Button>
          <Button
            variant="contained"
            onClick={() => window.print()}
            sx={{
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              borderRadius: 1,
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: 300, sm: 'none' },
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: theme.shadows[2]
              }
            }}
          >
            Print Receipt
          </Button>
        </Box>
      </Container>

      {/* Dashboard-style Footer */}
      <Box 
        sx={{ 
          flexShrink: 0,
          textAlign: 'center',
          py: { xs: 2, lg: 3 },
          px: { xs: 2, lg: 3 },
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          mt: '2vh',
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 500 
          }}
        >
          © 2024 Dino. All rights reserved.
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.65rem', sm: '0.75rem' },
            display: 'block',
            mt: 0.5
          }}
        >
          Digital Menu Revolution
        </Typography>
      </Box>
    </Box>
  );
};

export default OrderTrackingPage;