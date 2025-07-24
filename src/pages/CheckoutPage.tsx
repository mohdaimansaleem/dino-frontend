import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Button,
  TextField,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  Person,
  Phone,
  CheckCircle,
  CreditCard,
  AccountBalanceWallet,
  Money,
  LocalOffer,
  LocationOn,
  Schedule,
  Restaurant,
  Receipt,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  specialInstructions: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cafeId, tableId } = useParams<{ cafeId: string; tableId: string }>();
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount, getTotalItems } = useCart();
  
  const [activeStep, setActiveStep] = useState(0);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    specialInstructions: '',
  });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showPromoDialog, setShowPromoDialog] = useState(false);

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard />,
      description: 'Visa, Mastercard, Amex',
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: <AccountBalanceWallet />,
      description: 'PayPal, Apple Pay, Google Pay',
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: <Money />,
      description: 'Pay when your order arrives',
    },
  ];

  // Bill calculations
  const subtotal = getTotalAmount();
  const deliveryFee = subtotal >= 25 ? 0 : 2.99;
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount / 100) : 0;
  const total = subtotal + deliveryFee + tax - promoDiscount;



  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyPromo = () => {
    // Mock promo codes
    const promoCodes: Record<string, number> = {
      'SAVE10': 10,
      'FIRST20': 20,
      'WELCOME15': 15,
    };

    if (promoCodes[promoCode.toUpperCase()]) {
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        discount: promoCodes[promoCode.toUpperCase()],
      });
      setShowPromoDialog(false);
      setPromoCode('');
    } else {
      alert('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock order ID
      const mockOrderId = `ORD${Date.now()}`;
      setOrderId(mockOrderId);
      setOrderPlaced(true);
      clearCart();
      setActiveStep(3);
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

  const isStepValid = (step: number) => {
    switch (step) {
      case 0: return items.length > 0;
      case 1: return customerInfo.name && customerInfo.phone;
      case 2: return selectedPaymentMethod;
      default: return true;
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add some delicious items to your cart to get started!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/menu/${cafeId}/${tableId}`)}
          >
            Back to Menu
          </Button>
        </Paper>
      </Container>
    );
  }

  if (orderPlaced) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Order Placed Successfully! 🎉
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Order ID: <strong>{orderId}</strong>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your order has been received and is being prepared. You'll receive updates on the status.
          </Typography>
          
          <Box sx={{ mb: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Amount: <strong>{formatPrice(total)}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estimated Time: <strong>25-30 minutes</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Table: <strong>{tableId}</strong>
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={() => navigate(`/order-tracking/${orderId}`)}
            sx={{ mr: 2, mb: 2 }}
            startIcon={<Schedule />}
          >
            Track Order
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(`/menu/${cafeId}/${tableId}`)}
            sx={{ mb: 2 }}
            startIcon={<Restaurant />}
          >
            Order More
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column - Order Steps */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {/* Step 1: Review Order */}
              <Step>
                <StepLabel>Review Your Order</StepLabel>
                <StepContent>
                  <Typography variant="h6" gutterBottom>
                    Order Items ({getTotalItems()} items)
                  </Typography>
                  
                  <List>
                    {items.map((item) => (
                      <ListItem key={item.menuItem.id} sx={{ px: 0, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, py: 2 }}>
                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                          <ListItemAvatar>
                            <Avatar
                              src={item.menuItem.image}
                              sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 } }}
                            >
                              <Restaurant />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            sx={{ flex: 1, minWidth: 0 }}
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography 
                                  variant="subtitle1" 
                                  fontWeight="600"
                                  sx={{ 
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    lineHeight: 1.2,
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {item.menuItem.name}
                                </Typography>
                                {item.menuItem.isVeg ? (
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      border: '1px solid green',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 6,
                                        height: 6,
                                        backgroundColor: 'green',
                                        borderRadius: '50%',
                                      }}
                                    />
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      border: '1px solid red',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 6,
                                        height: 6,
                                        backgroundColor: 'red',
                                        borderRadius: '50%',
                                      }}
                                    />
                                  </Box>
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                  {formatPrice(item.menuItem.price)} each
                                </Typography>
                                {item.specialInstructions && (
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ 
                                      fontStyle: 'italic',
                                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                      wordBreak: 'break-word'
                                    }}
                                  >
                                    Note: {item.specialInstructions}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: { xs: 1, sm: 1 },
                          mt: { xs: 2, sm: 0 },
                          justifyContent: { xs: 'space-between', sm: 'flex-end' },
                          width: { xs: '100%', sm: 'auto' },
                          flexShrink: 0
                        }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
                              sx={{ p: { xs: 0.5, sm: 1 } }}
                            >
                              <Remove sx={{ fontSize: { xs: 16, sm: 20 } }} />
                            </IconButton>
                            <Typography sx={{ 
                              mx: { xs: 1, sm: 2 }, 
                              minWidth: { xs: 16, sm: 20 }, 
                              textAlign: 'center',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}>
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                              sx={{ p: { xs: 0.5, sm: 1 } }}
                            >
                              <Add sx={{ fontSize: { xs: 16, sm: 20 } }} />
                            </IconButton>
                          </Box>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight="600" 
                            sx={{ 
                              minWidth: { xs: 60, sm: 80 }, 
                              textAlign: 'right',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {formatPrice(item.menuItem.price * item.quantity)}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeItem(item.menuItem.id)}
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            <Delete sx={{ fontSize: { xs: 16, sm: 20 } }} />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(0)}
                    >
                      Continue
                    </Button>
                    <Button
                      sx={{ ml: 1 }}
                      onClick={() => navigate(`/menu/${cafeId}/${tableId}`)}
                    >
                      Add More Items
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 2: Customer Information */}
              <Step>
                <StepLabel>Customer Information</StepLabel>
                <StepContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        required
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email (Optional)"
                        name="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Special Instructions (Optional)"
                        name="specialInstructions"
                        multiline
                        rows={3}
                        value={customerInfo.specialInstructions}
                        onChange={handleInputChange}
                        placeholder="Any special requests for your order..."
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(1)}
                    >
                      Continue
                    </Button>
                    <Button sx={{ ml: 1 }} onClick={handleBack}>
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 3: Payment */}
              <Step>
                <StepLabel>Payment Method</StepLabel>
                <StepContent>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Choose Payment Method</FormLabel>
                    <RadioGroup
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    >
                      {paymentMethods.map((method) => (
                        <FormControlLabel
                          key={method.id}
                          value={method.id}
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {method.icon}
                              <Box>
                                <Typography variant="body1">{method.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {method.description}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handlePlaceOrder}
                      disabled={!isStepValid(2) || loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Receipt />}
                    >
                      {loading ? 'Placing Order...' : `Place Order - ${formatPrice(total)}`}
                    </Button>
                    <Button sx={{ ml: 1 }} onClick={handleBack} disabled={loading}>
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </Paper>
        </Grid>

        {/* Right Column - Bill Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Bill Summary
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate(`/menu/${cafeId}/${tableId}`)}
                sx={{ fontSize: '0.75rem' }}
              >
                Add More Items
              </Button>
            </Box>

            {/* Item Breakdown */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
                Order Details
              </Typography>
              {items.map((item) => (
                <Box key={item.menuItem.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        wordBreak: 'break-word',
                        lineHeight: 1.3
                      }}
                    >
                      {item.menuItem.name} × {item.quantity}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      flexShrink: 0,
                      fontWeight: 500
                    }}
                  >
                    {formatPrice(item.menuItem.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="600">Subtotal ({getTotalItems()} items)</Typography>
                <Typography variant="body2" fontWeight="600">{formatPrice(subtotal)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Delivery Fee</Typography>
                <Typography variant="body2" color={deliveryFee === 0 ? 'success.main' : 'text.primary'}>
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Taxes & Fees</Typography>
                <Typography variant="body2">{formatPrice(tax)}</Typography>
              </Box>

              {appliedPromo && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="success.main">
                    Promo ({appliedPromo.code})
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    -{formatPrice(promoDiscount)}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Total Amount
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatPrice(total)}
              </Typography>
            </Box>

            {/* Promo Code Section */}
            <Box sx={{ mb: 3 }}>
              {appliedPromo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`${appliedPromo.code} - ${appliedPromo.discount}% OFF`}
                    color="success"
                    onDelete={handleRemovePromo}
                  />
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LocalOffer />}
                  onClick={() => setShowPromoDialog(true)}
                >
                  Apply Promo Code
                </Button>
              )}
            </Box>

            {/* Order Info */}
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
                Table {tableId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                Estimated time: 25-30 mins
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Promo Code Dialog */}
      <Dialog open={showPromoDialog} onClose={() => setShowPromoDialog(false)}>
        <DialogTitle>Apply Promo Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter promo code"
            fullWidth
            variant="outlined"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="e.g., SAVE10"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Available codes: SAVE10, FIRST20, WELCOME15
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPromoDialog(false)}>Cancel</Button>
          <Button onClick={handleApplyPromo} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;