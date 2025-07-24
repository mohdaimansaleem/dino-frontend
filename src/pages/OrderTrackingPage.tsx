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
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Restaurant,
  LocalDining,
  Refresh,
  Receipt,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock order data
const mockOrder = {
  id: 'ORD20240121001',
  tableNumber: 5,
  customerName: 'John Doe',
  customerPhone: '+1 (555) 123-4567',
  status: 'preparing',
  createdAt: '2024-01-21T14:30:00Z',
  estimatedTime: 25,
  items: [
    {
      id: '1',
      name: 'Margherita Pizza',
      quantity: 1,
      price: 18.99,
      image: '/api/placeholder/100/100',
      specialInstructions: 'Extra cheese please',
    },
    {
      id: '2',
      name: 'Caesar Salad',
      quantity: 2,
      price: 12.99,
      image: '/api/placeholder/100/100',
    },
    {
      id: '3',
      name: 'Garlic Bread',
      quantity: 1,
      price: 6.99,
      image: '/api/placeholder/100/100',
    },
  ],
  totalAmount: 51.96,
  paymentStatus: 'pending',
};

const orderSteps = [
  {
    label: 'Order Received',
    description: 'Your order has been received and confirmed',
    icon: <Receipt />,
    status: 'completed',
  },
  {
    label: 'Preparing',
    description: 'Our chefs are preparing your delicious meal',
    icon: <Restaurant />,
    status: 'active',
  },
  {
    label: 'Ready',
    description: 'Your order is ready for pickup/serving',
    icon: <CheckCircle />,
    status: 'pending',
  },
  {
    label: 'Served',
    description: 'Enjoy your meal!',
    icon: <LocalDining />,
    status: 'pending',
  },
];

const OrderTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [order] = useState(mockOrder);
  const [loading, setLoading] = useState(false);
  const [activeStep] = useState(1);

  // Real-time updates would be implemented here
  useEffect(() => {
    // Placeholder for real-time order updates
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'preparing': return 'primary';
      case 'ready': return 'success';
      case 'served': return 'default';
      default: return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEstimatedDeliveryTime = () => {
    const orderTime = new Date(order.createdAt);
    const estimatedDelivery = new Date(orderTime.getTime() + order.estimatedTime * 60000);
    return estimatedDelivery.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getProgressPercentage = () => {
    return ((activeStep + 1) / orderSteps.length) * 100;
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

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
                  Order #{order.id}
                </Typography>
                <Chip
                  label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  color={getStatusColor(order.status) as any}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Table {order.tableNumber} • Ordered at {formatTime(order.createdAt)}
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
                {formatPrice(order.totalAmount)}
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
              <Stepper activeStep={activeStep} orientation="vertical">
                {orderSteps.map((step, index) => (
                  <Step key={step.label}>
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
                            bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                            color: index <= activeStep ? 'white' : 'grey.600',
                          }}
                        >
                          {step.icon}
                        </Box>
                      )}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                      {index === activeStep && (
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
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ px: 0 }}>
                      <Avatar
                        src={item.image}
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
                              {formatPrice(item.price * item.quantity)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Quantity: {item.quantity} × {formatPrice(item.price)}
                            </Typography>
                            {item.specialInstructions && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ fontStyle: 'italic', mt: 0.5 }}
                              >
                                Note: {item.specialInstructions}
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
                  {formatPrice(order.totalAmount)}
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
                    {order.customerName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {order.customerPhone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Table Number
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Table {order.tableNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Chip
                    label={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    size="small"
                    color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
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
            please contact our staff or show them your order ID: <strong>{order.id}</strong>
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