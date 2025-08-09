import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
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
  useTheme,
  useMediaQuery,
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
import CustomerNavbar from '../components/CustomerNavbar';
import Footer from '../components/layout/Footer';
import { promoService, PromoValidation } from '../services/promoService';
import { orderService } from '../services/orderService';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [appliedPromo, setAppliedPromo] = useState<PromoValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [availablePromos, setAvailablePromos] = useState<string[]>([]);

  // Load available promo codes
  useEffect(() => {
    const loadAvailablePromos = async () => {
      if (!cafeId) return;
      
      try {
        const promoCodes = await promoService.getActivePromoCodes(cafeId);
        setAvailablePromos(promoCodes.map(promo => promo.code));
      } catch (error) {
        }
    };

    loadAvailablePromos();
  }, [cafeId]);

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
  const promoDiscount = appliedPromo ? appliedPromo.discount_amount : 0;
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

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !cafeId) {
      alert('Please enter a valid promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const orderData = {
        venue_id: cafeId,
        items: items.map(item => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          unit_price: item.menuItem.price,
        })),
        subtotal: subtotal,
      };

      const validation = await promoService.validatePromoCode(promoCode.toUpperCase(), orderData);
      
      if (validation.is_valid) {
        setAppliedPromo(validation);
        setShowPromoDialog(false);
        setPromoCode('');
      } else {
        alert(validation.error_message || 'Invalid promo code');
      }
    } catch (error) {
      alert('Failed to validate promo code. Please try again.');
    } finally {
      setPromoLoading(false);
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
    if (!cafeId || !tableId) {
      alert('Missing venue or table information');
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        venue_id: cafeId,
        table_id: tableId,
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
        },
        items: items.map(item => ({
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          special_instructions: item.specialInstructions,
        })),
        order_type: 'qr_scan' as const,
        special_instructions: customerInfo.specialInstructions,
      };

      const response = await orderService.createPublicOrder(orderData);
      
      if (response.success && response.data) {
        setOrderId(response.data.order_number || response.data.id);
        setOrderPlaced(true);
        clearCart();
        setActiveStep(3);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      alert('Failed to place order. Please try again.');
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
      <Box sx={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar 
          restaurantName="Dino Cafe"
          tableId={tableId}
          showBackButton={true}
          showCart={false}
        />
        <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 }, flex: 1, display: 'flex', alignItems: 'center' }}>
          <Paper sx={{ 
            p: { xs: 3, sm: 4 }, 
            textAlign: 'center', 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <ShoppingCart sx={{ 
              fontSize: { xs: 48, sm: 64 }, 
              color: 'text.secondary', 
              mb: 2 
            }} />
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              Your cart is empty
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Add some delicious items to your cart to get started!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate(`/menu/${cafeId}/${tableId}`)}
              sx={{
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                borderRadius: 2
              }}
            >
              Back to Menu
            </Button>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (orderPlaced) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
        <CustomerNavbar 
          restaurantName="Dino Cafe"
          tableId={tableId}
          showBackButton={false}
          showCart={false}
        />
        <Container maxWidth="md" sx={{ 
          py: { xs: 2, md: 4 }, 
          px: { xs: 2, sm: 3 },
          flex: 1, 
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <Paper sx={{ 
            p: { xs: 3, sm: 4 }, 
            textAlign: 'center', 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <CheckCircle sx={{ 
              fontSize: { xs: 60, sm: 80 }, 
              color: 'success.main', 
              mb: 3 
            }} />
            <Typography 
              variant="h4" 
              gutterBottom 
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              Order Placed Successfully! 🎉
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Order ID: <strong>{orderId}</strong>
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Your order has been received and is being prepared. You'll receive updates on the status.
            </Typography>
            
            <Box sx={{ 
              mb: 4, 
              p: { xs: 2, sm: 3 }, 
              backgroundColor: 'grey.50', 
              borderRadius: 2 
            }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Order Summary
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Total Amount: <strong>{formatPrice(total)}</strong>
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Estimated Time: <strong>25-30 minutes</strong>
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Table: <strong>{tableId}</strong>
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 2 },
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Button
                variant="contained"
                onClick={() => navigate(`/order-tracking/${orderId}`)}
                startIcon={<Schedule />}
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  borderRadius: 2,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Track Order
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/menu/${cafeId}/${tableId}`)}
                startIcon={<Restaurant />}
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  borderRadius: 2,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Order More
              </Button>
            </Box>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Customer Navbar */}
      <CustomerNavbar 
        restaurantName="Dino Cafe"
        tableId={tableId}
        showBackButton={true}
        showCart={false}
      />

      <Container maxWidth="lg" sx={{ 
        py: { xs: 2, md: 4 }, 
        px: { xs: 2, sm: 3 },
        flex: 1 
      }}>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Left Column - Order Steps */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <Stepper 
              activeStep={activeStep} 
              orientation={isMobile ? "horizontal" : "vertical"}
              sx={{
                '& .MuiStepLabel-label': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            >
              {/* Step 1: Review Order */}
              <Step>
                <StepLabel>Review Your Order</StepLabel>
                <StepContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Order Items ({getTotalItems()} items)
                  </Typography>
                  
                  <List sx={{ px: 0 }}>
                    {items.map((item) => (
                      <ListItem 
                        key={item.menuItem.id} 
                        sx={{ 
                          px: 0, 
                          py: { xs: 1.5, sm: 2 }, 
                          flexDirection: 'column', 
                          alignItems: 'stretch',
                          borderBottom: '1px solid #f0f0f0',
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          width: '100%', 
                          alignItems: 'flex-start', 
                          gap: { xs: 1.5, sm: 2 },
                          flexDirection: { xs: 'column', sm: 'row' }
                        }}>
                          <ListItemAvatar sx={{ 
                            minWidth: 'auto',
                            alignSelf: { xs: 'center', sm: 'flex-start' }
                          }}>
                            <Avatar
                              src={item.menuItem.image}
                              sx={{ 
                                width: { xs: 80, sm: 70 }, 
                                height: { xs: 80, sm: 70 },
                                borderRadius: 2
                              }}
                            >
                              <Restaurant />
                            </Avatar>
                          </ListItemAvatar>
                          <Box sx={{ 
                            flex: 1, 
                            minWidth: 0,
                            textAlign: { xs: 'center', sm: 'left' }
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1, 
                              mb: 1,
                              justifyContent: { xs: 'center', sm: 'flex-start' },
                              flexWrap: 'wrap'
                            }}>
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="600"
                                sx={{ 
                                  fontSize: { xs: '0.875rem', sm: '1.1rem' },
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
                                    border: '2px solid #388E3C',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 4,
                                      height: 4,
                                      backgroundColor: '#388E3C',
                                      borderRadius: '50%',
                                    }}
                                  />
                                </Box>
                              ) : (
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    border: '2px solid #D32F2F',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 4,
                                      height: 4,
                                      backgroundColor: '#D32F2F',
                                      borderRadius: '50%',
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                            
                            <Box sx={{ mb: 1 }}>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                              >
                                {formatPrice(item.menuItem.price)} per item
                              </Typography>
                              {item.specialInstructions && (
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    fontStyle: 'italic',
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                    wordBreak: 'break-word',
                                    mt: 0.5
                                  }}
                                >
                                  Note: {item.specialInstructions}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          mt: { xs: 1.5, sm: 2 },
                          pt: { xs: 1.5, sm: 2 },
                          borderTop: '1px solid #E0E0E0',
                          width: '100%',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: { xs: 2, sm: 0 }
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 1.5, sm: 2 },
                            order: { xs: 2, sm: 1 }
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
                                sx={{ p: { xs: 0.75, sm: 1 } }}
                              >
                                <Remove sx={{ fontSize: { xs: 16, sm: 18 } }} />
                              </IconButton>
                              <Typography sx={{ 
                                mx: { xs: 1.5, sm: 2 }, 
                                minWidth: 20, 
                                textAlign: 'center',
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: '600'
                              }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                                sx={{ p: { xs: 0.75, sm: 1 } }}
                              >
                                <Add sx={{ fontSize: { xs: 16, sm: 18 } }} />
                              </IconButton>
                            </Box>
                            
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeItem(item.menuItem.id)}
                              sx={{ p: { xs: 0.75, sm: 1 } }}
                            >
                              <Delete sx={{ fontSize: { xs: 16, sm: 18 } }} />
                            </IconButton>
                          </Box>
                          
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            sx={{ 
                              color: '#1976D2',
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              order: { xs: 1, sm: 2 }
                            }}
                          >
                            {formatPrice(item.menuItem.price * item.quantity)}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>

                  <Box sx={{ 
                    mt: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 1 }
                  }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(0)}
                      sx={{
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Continue
                    </Button>
                    <Button
                      onClick={() => navigate(`/menu/${cafeId}/${tableId}`)}
                      sx={{
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
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
                  <Grid container spacing={{ xs: 2, sm: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size={isSmallScreen ? "small" : "medium"}
                        label="Full Name"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        required
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size={isSmallScreen ? "small" : "medium"}
                        label="Phone Number"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size={isSmallScreen ? "small" : "medium"}
                        label="Email (Optional)"
                        name="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size={isSmallScreen ? "small" : "medium"}
                        label="Special Instructions (Optional)"
                        name="specialInstructions"
                        multiline
                        rows={isSmallScreen ? 2 : 3}
                        value={customerInfo.specialInstructions}
                        onChange={handleInputChange}
                        placeholder="Any special requests for your order..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ 
                    mt: 2,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 1 }
                  }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(1)}
                      sx={{
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Continue
                    </Button>
                    <Button 
                      onClick={handleBack}
                      sx={{
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 3: Payment */}
              <Step>
                <StepLabel>Payment Method</StepLabel>
                <StepContent>
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormLabel 
                      component="legend"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      Choose Payment Method
                    </FormLabel>
                    <RadioGroup
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      sx={{ mt: 1 }}
                    >
                      {paymentMethods.map((method) => (
                        <FormControlLabel
                          key={method.id}
                          value={method.id}
                          control={<Radio />}
                          label={
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: { xs: 1, sm: 1.5 },
                              py: 1
                            }}>
                              <Box sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                                {method.icon}
                              </Box>
                              <Box>
                                <Typography 
                                  variant="body1"
                                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                >
                                  {method.name}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                  {method.description}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              width: '100%'
                            }
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <Box sx={{ 
                    mt: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 1 }
                  }}>
                    <Button
                      variant="contained"
                      onClick={handlePlaceOrder}
                      disabled={!isStepValid(2) || loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Receipt />}
                      sx={{
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1.5, sm: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      {loading ? 'Placing Order...' : `Place Order - ${formatPrice(total)}`}
                    </Button>
                    <Button 
                      onClick={handleBack} 
                      disabled={loading}
                      sx={{
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1.5, sm: 1.5 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
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
          <Paper sx={{ 
            p: { xs: 2, sm: 3 }, 
            position: { xs: 'static', md: 'sticky' }, 
            top: 20,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            mt: { xs: 2, md: 0 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Bill Summary
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate(`/menu/${cafeId}/${tableId}`)}
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  px: { xs: 2, sm: 1 },
                  py: { xs: 0.5, sm: 0.25 }
                }}
              >
                Add More Items
              </Button>
            </Box>

            {/* Item Breakdown */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                fontWeight="600" 
                sx={{ 
                  mb: 1,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Order Details
              </Typography>
              {items.map((item) => (
                <Box 
                  key={item.menuItem.id} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 0.5, 
                    gap: 1,
                    py: 0.25
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
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
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
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
                <Typography 
                  variant="body2" 
                  fontWeight="600"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Subtotal ({getTotalItems()} items)
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="600"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {formatPrice(subtotal)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Delivery Fee
                </Typography>
                <Typography 
                  variant="body2" 
                  color={deliveryFee === 0 ? 'success.main' : 'text.primary'}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Taxes & Fees
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {formatPrice(tax)}
                </Typography>
              </Box>

              {appliedPromo && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    color="success.main"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Promo ({appliedPromo.promo_code?.code})
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="success.main"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    -{formatPrice(promoDiscount)}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Total Amount
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {formatPrice(total)}
              </Typography>
            </Box>

            {/* Promo Code Section */}
            <Box sx={{ mb: 3 }}>
              {appliedPromo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`${appliedPromo.promo_code?.code} - ${promoService.formatDiscount(appliedPromo.promo_code!)}`}
                    color="success"
                    onDelete={handleRemovePromo}
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      height: { xs: 28, sm: 32 }
                    }}
                  />
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LocalOffer />}
                  onClick={() => setShowPromoDialog(true)}
                  sx={{
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    borderRadius: 2
                  }}
                >
                  Apply Promo Code
                </Button>
              )}
            </Box>

            {/* Order Info */}
            <Box sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              backgroundColor: 'grey.50', 
              borderRadius: 2 
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LocationOn sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />
                Table {tableId}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Schedule sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />
                Estimated time: 25-30 mins
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Promo Code Dialog */}
      <Dialog 
        open={showPromoDialog} 
        onClose={() => setShowPromoDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            mx: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Apply Promo Code
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter promo code"
            fullWidth
            size={isSmallScreen ? "small" : "medium"}
            variant="outlined"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="e.g., SAVE10"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          {availablePromos.length > 0 && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 2,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Available codes: {availablePromos.join(', ')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 1 }
        }}>
          <Button 
            onClick={() => setShowPromoDialog(false)}
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApplyPromo} 
            variant="contained"
            disabled={promoLoading || !promoCode.trim()}
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {promoLoading ? 'Validating...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default CheckoutPage;