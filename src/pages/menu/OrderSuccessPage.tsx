import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Restaurant,
  Share,
  Home,
  Phone,
  LocationOn,
  Person,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CustomerNavbar from '../../components/CustomerNavbar';
import { OrderStatusUpdate } from '../../components/orders';
import { OrderStatus } from '../../services/business';

interface OrderSuccessState {
  orderId: string;
  orderNumber?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  deliveryFee?: number;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  tableId: string;
  venueId: string;
  status?: string;
  estimatedTime?: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  createdAt?: string;
  paymentMethod?: string;
  specialInstructions?: string;
}

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [orderData, setOrderData] = useState<OrderSuccessState | null>(null);

  useEffect(() => {
    console.log('🔍 OrderSuccessPage: Loading order data for orderId:', orderId);
    console.log('🔍 OrderSuccessPage: Navigation state:', location.state);
    
    // Get order data from navigation state or localStorage
    const stateData = location.state as OrderSuccessState;
    
    if (stateData) {
      console.log('✅ OrderSuccessPage: Using navigation state data:', stateData);
      setOrderData(stateData);
      // Store in localStorage for page refresh
      localStorage.setItem(`order_${orderId}`, JSON.stringify(stateData));
    } else {
      // Try to get from localStorage
      const storedData = localStorage.getItem(`order_${orderId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('✅ OrderSuccessPage: Using localStorage data:', parsedData);
        setOrderData(parsedData);
      } else {
        console.log('❌ OrderSuccessPage: No order data found in state or localStorage');
        // Set a minimal fallback order data
        setOrderData({
          orderId: orderId || 'UNKNOWN',
          orderNumber: orderId || 'UNKNOWN',
          total: 0,
          customerInfo: {
            name: 'Customer',
            phone: 'N/A'
          },
          tableId: 'N/A',
          venueId: 'N/A',
          status: 'pending',
          estimatedTime: 30,
          createdAt: new Date().toISOString()
        });
      }
    }
  }, [orderId, location.state]);

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const handleShare = async () => {
    const shareData = {
      title: 'Order Placed Successfully!',
      text: `My order #${orderId} has been placed successfully at Dino. Total: ${orderData ? formatPrice(orderData.total) : 'N/A'}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      alert('Order details copied to clipboard!');
    }
  };

  const handleTrackOrder = () => {
    navigate(`/order-tracking/${orderId}`);
  };

  const handleOrderMore = () => {
    if (orderData) {
      navigate(`/menu/${orderData.venueId}/${orderData.tableId}`);
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Show loading state while order data is being loaded
  if (!orderData && orderId) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default, 
        display: 'flex', 
        flexDirection: 'column',
        pt: { xs: '56px', sm: '64px' },
      }}>
        <CustomerNavbar 
          restaurantName="Dino"
          tableId="Loading..."
          showBackButton={false}
          showCart={false}
        />
        <Container maxWidth="md" sx={{ 
          py: { xs: 2, md: 4 }, 
          px: { xs: 1.5, sm: 2 },
          flex: 1, 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <Paper sx={{ 
            p: { xs: 3, sm: 4 }, 
            textAlign: 'center', 
            width: '100%',
            borderRadius: 3,
            boxShadow: theme.shadows[8],
          }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Loading Order Details...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we retrieve your order information.
            </Typography>
          </Paper>
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
      <CustomerNavbar 
        restaurantName="Dino"
        tableId={orderData?.tableId || 'N/A'}
        showBackButton={false}
        showCart={false}
      />

      <Container maxWidth="md" sx={{ 
        py: { xs: 2, md: 4 }, 
        px: { xs: 1.5, sm: 2 },
        flex: 1, 
        display: 'flex', 
        alignItems: 'center' 
      }}>
        <Paper sx={{ 
          p: { xs: 3, sm: 4 }, 
          textAlign: 'center', 
          width: '100%',
          borderRadius: 3,
          boxShadow: theme.shadows[8],
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}>
          {/* Success Icon */}
          <Box sx={{ mb: 3 }}>
            <Avatar
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                backgroundColor: 'success.main',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
              }}
            >
              <CheckCircle sx={{ fontSize: { xs: 40, sm: 50 }, color: 'white' }} />
            </Avatar>
          </Box>

          {/* Success Message */}
          <Typography 
            variant="h3" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
              background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Order Placed Successfully! 🎉
          </Typography>

          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 500
            }}
          >
            Thank you for your order!
          </Typography>

          {/* Order ID */}
          <Card sx={{ 
            mb: 4, 
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 2
          }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order ID
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color="primary.main"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                #{orderData?.orderNumber || orderId}
              </Typography>
            </CardContent>
          </Card>

          {/* Order Details */}
          {orderData && (
            <Card sx={{ 
              mb: 4, 
              textAlign: 'left',
              backgroundColor: 'grey.50',
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="600" sx={{ textAlign: 'center', mb: 2 }}>
                  Order Summary
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Customer</Typography>
                      <Typography variant="body1" fontWeight="500">{orderData.customerInfo.name}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" fontWeight="500">{orderData.customerInfo.phone}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Table</Typography>
                      <Typography variant="body1" fontWeight="500">Table {orderData.tableId}</Typography>
                    </Box>
                  </Box>

                  {orderData.createdAt && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Schedule sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Order Time</Typography>
                        <Typography variant="body1" fontWeight="500">
                          {new Date(orderData.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {orderData.status && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="body1" fontWeight="500" sx={{ textTransform: 'capitalize' }}>
                            {orderData.status}
                          </Typography>
                          {/* Status Update Component - Inline variant for clean display */}
                          <OrderStatusUpdate
                            orderId={orderData.orderId}
                            currentStatus={orderData.status as OrderStatus}
                            orderNumber={orderData.orderNumber}
                            onStatusUpdated={(newStatus: OrderStatus) => {
                              setOrderData(prev => prev ? { ...prev, status: newStatus } : null);
                              // Update localStorage as well
                              if (orderId) {
                                const storedData = localStorage.getItem(`order_${orderId}`);
                                if (storedData) {
                                  const parsed = JSON.parse(storedData);
                                  parsed.status = newStatus;
                                  localStorage.setItem(`order_${orderId}`, JSON.stringify(parsed));
                                }
                              }
                            }}
                            onError={(error: string) => {
                              console.error('Status update error:', error);
                            }}
                            variant="inline"
                            showCurrentStatus={false}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}

                  <Divider />

                  {/* Order Items */}
                  {orderData.items && orderData.items.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        Order Items ({orderData.items.length})
                      </Typography>
                      <Stack spacing={1}>
                        {orderData.items.map((item, index) => (
                          <Box key={index} sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            py: 1,
                            px: 2,
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}>
                            <Box>
                              <Typography variant="body2" fontWeight="500">{item.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="600">
                              {formatPrice(item.total)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Divider />

                  {/* Bill Breakdown */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Bill Details
                    </Typography>
                    <Stack spacing={1}>
                      {orderData.subtotal && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Subtotal</Typography>
                          <Typography variant="body2">{formatPrice(orderData.subtotal)}</Typography>
                        </Box>
                      )}
                      {orderData.tax && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Tax</Typography>
                          <Typography variant="body2">{formatPrice(orderData.tax)}</Typography>
                        </Box>
                      )}
                      {orderData.deliveryFee !== undefined && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Delivery Fee</Typography>
                          <Typography variant="body2" color={orderData.deliveryFee === 0 ? 'success.main' : 'text.primary'}>
                            {orderData.deliveryFee === 0 ? 'FREE' : formatPrice(orderData.deliveryFee)}
                          </Typography>
                        </Box>
                      )}
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="600">Total Amount</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {formatPrice(orderData.total)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {orderData.paymentMethod && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body1" fontWeight="500" sx={{ textTransform: 'capitalize' }}>
                        {orderData.paymentMethod.replace('_', ' ')}
                      </Typography>
                    </Box>
                  )}

                  {orderData.specialInstructions && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Special Instructions</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {orderData.specialInstructions}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Status Info */}
          <Box sx={{ 
            mb: 4, 
            p: 3, 
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
              <Schedule sx={{ color: 'info.main', fontSize: 24 }} />
              <Typography variant="h6" color="info.main" fontWeight="600">
                Estimated Time: {orderData?.estimatedTime ? `${orderData.estimatedTime} minutes` : '25-30 minutes'}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Your order is being prepared. You'll receive updates on the status.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Button
              variant="contained"
              onClick={handleTrackOrder}
              startIcon={<Schedule />}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 2,
                width: { xs: '100%', sm: 'auto' },
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Track Order
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleOrderMore}
              startIcon={<Restaurant />}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 2,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Order More
            </Button>
          </Stack>

          {/* Secondary Actions */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="text"
              onClick={handleShare}
              startIcon={<Share />}
              size="small"
              sx={{ fontSize: '0.875rem' }}
            >
              Share Order
            </Button>
            
            <Button
              variant="text"
              onClick={handleGoHome}
              startIcon={<Home />}
              size="small"
              sx={{ fontSize: '0.875rem' }}
            >
              Go Home
            </Button>
          </Stack>

          {/* Thank You Message */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Thank you for choosing Dino! 🦕
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              We hope you enjoy your meal!
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box 
        sx={{ 
          flexShrink: 0,
          textAlign: 'center',
          py: { xs: 2, lg: 3 },
          px: { xs: 2, lg: 3 },
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
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

export default OrderSuccessPage;