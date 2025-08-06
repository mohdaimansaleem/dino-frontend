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
import { trackingService, OrderTracking } from '../services/trackingService';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
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
      } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ 
        py: { xs: 2, md: 4 },
        px: { xs: 2, sm: 3 }
      }}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={24} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ 
        py: { xs: 2, md: 4 },
        px: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
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
              borderRadius: 2
            }}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ 
      py: { xs: 2, md: 4 },
      px: { xs: 2, sm: 3 }
    }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
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
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  Order #{order.order_number || order.order_id}
                </Typography>
                <Chip
                  label={trackingService.getStatusDisplayInfo(order.status).label}
                  sx={{ 
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    height: { xs: 24, sm: 32 }
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
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={loading}
                sx={{ 
                  mb: { xs: 0, md: 2 },
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  borderRadius: 2
                }}
              >
                Refresh
              </Button>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color="primary"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
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
                borderRadius: 4 
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
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            height: 'fit-content'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
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
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
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
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            height: 'fit-content'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
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
                          alignSelf: { xs: 'center', sm: 'flex-start' }
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
                              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                            >
                              {item.name}
                            </Typography>
                            <Typography 
                              variant="subtitle2" 
                              fontWeight="bold"
                              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
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
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  Total:
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  color="primary"
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
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
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
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
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
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
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
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
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
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
                      height: { xs: 24, sm: 28 }
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
            borderRadius: 2,
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: 300, sm: 'none' }
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
            borderRadius: 2,
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: 300, sm: 'none' }
          }}
        >
          Print Receipt
        </Button>
      </Box>
    </Container>
  );
};

export default OrderTrackingPage;