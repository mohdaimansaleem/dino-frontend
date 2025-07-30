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
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Restaurant,
  LocalDining,
  Refresh,
  Receipt,
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
        console.error('Failed to load order tracking:', error);
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
  }, [orderId]);

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
      console.error('Failed to refresh order tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Skeleton variant="text" height={40} />
                <Skeleton variant="text" height={24} />
                <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Order Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your order in real-time
        </Typography>
      </Box>

      {/* Order Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Order #{order.order_number || order.order_id}
                </Typography>
                <Chip
                  label={trackingService.getStatusDisplayInfo(order.status).label}
                  sx={{ 
                    backgroundColor: getStatusColor(order.status),
                    color: 'white'
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {order.table_number && `Table ${order.table_number} • `}
                Ordered at {formatTime(order.created_at)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estimated ready time: {getEstimatedDeliveryTime()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Refresh
              </Button>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {formatPrice(order.pricing.total_amount)}
              </Typography>
            </Grid>
          </Grid>
          
          {/* Progress Bar */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(getProgressPercentage())}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={getProgressPercentage()} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Order Status Steps */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
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
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: step.is_completed || step.is_current ? 'primary.main' : 'grey.300',
                              color: step.is_completed || step.is_current ? 'white' : 'grey.600',
                            }}
                          >
                            {step.is_completed ? <CheckCircle /> : <Schedule />}
                          </Box>
                        )}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          {trackingService.getStatusDisplayInfo(step.status).label}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {step.message}
                        </Typography>
                        {step.is_current && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              icon={<Schedule />}
                              label="In Progress"
                              size="small"
                              color="primary"
                            />
                          </Box>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Order status updates will appear here
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <List>
                {order.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <Avatar
                        src={item.image_url}
                        alt={item.name}
                        sx={{ width: 48, height: 48, mr: 2 }}
                      >
                        {item.name.charAt(0)}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">
                              {item.name}
                            </Typography>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {formatPrice(item.total_price)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity} × {formatPrice(item.unit_price)}
                            </Typography>
                            {item.special_instructions && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ fontStyle: 'italic', mt: 0.5 }}
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatPrice(order.pricing.total_amount)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Customer Name
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {order.customer.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {order.customer.phone}
                  </Typography>
                </Grid>
                {order.table_number && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Table Number
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      Table {order.table_number}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Chip
                    label={order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    size="small"
                    color={order.payment_status === 'paid' ? 'success' : 'warning'}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Help Section */}
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Need help?</strong> If you have any questions about your order, 
            please contact our staff or show them your order ID: <strong>{order.order_number || order.order_id}</strong>
          </Typography>
        </Alert>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
        <Button
          variant="contained"
          onClick={() => window.print()}
        >
          Print Receipt
        </Button>
      </Box>
    </Container>
  );
};

export default OrderTrackingPage;