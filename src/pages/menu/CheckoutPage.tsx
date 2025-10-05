import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  LinearProgress,
  Collapse,
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
  ArrowBack,
  ArrowForward,
  Check,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import CustomerNavbar from '../../components/CustomerNavbar';

import { promoService, PromoValidation } from '../../services/api';
import { orderService } from '../../services/business';

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
  const { cafeId, tableId, venueId } = useParams<{ cafeId?: string; tableId: string; venueId?: string }>();
  const actualCafeId = cafeId || venueId; // Handle both URL patterns
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
      if (!actualCafeId) return;
      
      try {
        const promoCodes = await promoService.getActivePromoCodes(actualCafeId);
        setAvailablePromos(promoCodes.map(promo => promo.code));
      } catch (error) {
        // Silently handle error
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

  // Step configuration
  const steps = [
    { label: 'Review Order', icon: <ShoppingCart /> },
    { label: 'Customer Info', icon: <Person /> },
    { label: 'Payment', icon: <CreditCard /> },
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
    if (!promoCode.trim() || !actualCafeId) {
      alert('Please enter a valid promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const orderData = {
        venue_id: actualCafeId,
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
    console.log('🔍 Debug - actualCafeId:', actualCafeId, 'tableId:', tableId);
    if (!actualCafeId || !tableId) {
      alert(`Missing venue or table information. CafeId: ${actualCafeId}, TableId: ${tableId}`);
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        venue_id: actualCafeId,
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

      console.log('🔍 Sending order data:', orderData);
      const response = await orderService.createPublicOrder(orderData);
      console.log('🔍 Order response:', response);
      
      // Check for successful response
      if (response && (response.success || response.data)) {
        const orderResponseData = response.data;
        const orderIdValue = orderResponseData?.order_number || orderResponseData?.id || orderResponseData?.order_id || 'ORDER_' + Date.now();
        console.log('✅ Order placed successfully! Full response:', orderResponseData);
        console.log('✅ Order ID:', orderIdValue);
        
        // Store the complete order response data
        const completeOrderData = {
          orderId: orderIdValue,
          orderNumber: orderResponseData?.order_number || orderIdValue,
          total: orderResponseData?.total_amount || orderResponseData?.total || total,
          subtotal: orderResponseData?.subtotal || subtotal,
          tax: orderResponseData?.tax_amount || tax,
          deliveryFee: orderResponseData?.delivery_fee || deliveryFee,
          customerInfo: {
            name: orderResponseData?.customer?.name || customerInfo.name,
            phone: orderResponseData?.customer?.phone || customerInfo.phone,
            email: orderResponseData?.customer?.email || customerInfo.email,
          },
          tableId: orderResponseData?.table_id || tableId,
          venueId: orderResponseData?.venue_id || actualCafeId,
          status: orderResponseData?.status || 'pending',
          estimatedTime: orderResponseData?.estimated_ready_time || orderResponseData?.estimated_minutes || 30,
          items: orderResponseData?.items || items.map(item => ({
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.menuItem.price,
            total: item.menuItem.price * item.quantity
          })),
          createdAt: orderResponseData?.created_at || new Date().toISOString(),
          paymentMethod: selectedPaymentMethod,
          specialInstructions: orderResponseData?.special_instructions || customerInfo.specialInstructions
        };
        
        console.log('📦 Complete order data prepared:', completeOrderData);
        
        // Store in component state and localStorage
        setOrderId(orderIdValue);
        setOrderPlaced(true);
        clearCart();
        setActiveStep(3);
        
        // Store complete order data for success page
        localStorage.setItem(`order_${orderIdValue}`, JSON.stringify(completeOrderData));
        
        // Navigate directly to OrderSuccessPage with complete data
        setTimeout(() => {
          navigate(`/order-success/${orderIdValue}`, { 
            state: completeOrderData,
            replace: true 
          });
        }, 1500); // Small delay to show success state briefly
        
      } else {
        console.error('❌ Order response indicates failure:', response);
        throw new Error(response?.message || 'Order creation failed - invalid response');
      }
    } catch (error: any) {
      console.error('❌ Order placement error:', error);
      
      // Better error handling
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check if it's actually a success but with different response format
      if (error.response?.status === 200 || error.response?.status === 201) {
        console.log('🔍 Order might have succeeded despite error. Checking response data...');
        const responseData = error.response?.data;
        
        if (responseData && (responseData.id || responseData.order_number || responseData.order_id)) {
          const orderIdValue = responseData.order_number || responseData.id || responseData.order_id;
          console.log('✅ Order actually succeeded! Order ID:', orderIdValue);
          
          setOrderId(orderIdValue);
          setOrderPlaced(true);
          clearCart();
          setActiveStep(3);
          return;
        }
      }
      
      alert(errorMessage);
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

  // Custom Step Progress Component
  const StepProgress = () => (
    <Box sx={{ 
      mb: { xs: 2, sm: 3 },
      px: { xs: 1, sm: 0 }
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1
      }}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              flex: 1
            }}>
              <Box
                sx={{
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  borderRadius: '50%',
                  backgroundColor: index <= activeStep ? '#1976D2' : '#E0E0E0',
                  color: index <= activeStep ? 'white' : '#9E9E9E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  transition: 'all 0.3s ease',
                  mb: 1
                }}
              >
                {index < activeStep ? <Check sx={{ fontSize: { xs: 16, sm: 20 } }} /> : index + 1}
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: { xs: '0.6rem', sm: '0.75rem' },
                  textAlign: 'center',
                  color: index <= activeStep ? 'primary.main' : 'text.secondary',
                  fontWeight: index === activeStep ? 600 : 400,
                  lineHeight: 1.2,
                  maxWidth: { xs: 60, sm: 80 }
                }}
              >
                {step.label}
              </Typography>
            </Box>
            {index < steps.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  backgroundColor: index < activeStep ? '#1976D2' : '#E0E0E0',
                  mx: { xs: 0.5, sm: 1 },
                  transition: 'all 0.3s ease',
                  mb: 3
                }}
              />
            )}
          </React.Fragment>
        ))}
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={(activeStep / (steps.length - 1)) * 100}
        sx={{ 
          height: 4, 
          borderRadius: 2,
          backgroundColor: '#E0E0E0',
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            backgroundColor: '#1976D2'
          }
        }}
      />
    </Box>
  );

  if (items.length === 0 && !orderPlaced) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default, 
        display: 'flex', 
        flexDirection: 'column',
        pt: { xs: '56px', sm: '64px' },
      }}>
        <CustomerNavbar 
          restaurantName="Dino Cafe"
          tableId={tableId}
          showBackButton={true}
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
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            border: '1px solid',
            borderColor: 'divider'
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
              onClick={() => navigate(`/menu/${actualCafeId}/${tableId}`)}
              sx={{
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
              Back to Menu
            </Button>
          </Paper>
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
  }

  if (orderPlaced) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default, 
        display: 'flex', 
        flexDirection: 'column',
        pt: { xs: '56px', sm: '64px' },
      }}>
        <CustomerNavbar 
          restaurantName="Dino Cafe"
          tableId={tableId}
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
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            border: '1px solid',
            borderColor: 'divider'
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
              Redirecting to order details...
            </Typography>
            
            <CircularProgress size={40} />
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
      {/* Customer Navbar */}
      <CustomerNavbar 
        restaurantName="Dino Cafe"
        tableId={tableId}
        showBackButton={true}
        showCart={false}
      />

      <Container maxWidth="lg" sx={{ 
        py: { xs: 1.5, md: 3 }, 
        px: { xs: 1.5, sm: 2 },
        flex: 1 
      }}>
        {/* Custom Step Progress */}
        <StepProgress />

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[1],
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              backgroundColor: 'background.paper'
            }}>
              {/* Step 0: Review Order */}
              <Collapse in={activeStep === 0}>
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      fontWeight: 600,
                      mb: 3,
                      color: 'text.primary',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Review Your Order ({items.length} items)
                  </Typography>
                  
                  <List sx={{ px: 0 }}>
                    {items.map((item) => (
                      <ListItem 
                        key={item.menuItem.id} 
                        sx={{ 
                          px: 0, 
                          py: 0, 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRight: `4px solid ${item.menuItem.isVeg ? '#4CAF50' : '#F44336'}`,
                          borderRadius: 1,
                          mb: 2,
                          backgroundColor: 'background.paper',
                          '&:hover': {
                            boxShadow: theme.shadows[2],
                            borderColor: 'primary.main',
                            borderRightColor: item.menuItem.isVeg ? '#4CAF50' : '#F44336'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: { xs: 1.5, sm: 2 },
                          width: '100%',
                          p: { xs: 1.5, sm: 2 }
                        }}>
                          {/* Item Image */}
                          <Avatar
                            src={item.menuItem.image}
                            sx={{ 
                              width: { xs: 50, sm: 56 }, 
                              height: { xs: 50, sm: 56 },
                              borderRadius: 1.5,
                              flexShrink: 0,
                              border: '1px solid #e0e0e0'
                            }}
                          >
                            <Restaurant sx={{ fontSize: { xs: 20, sm: 24 } }} />
                          </Avatar>
                          
                          {/* Item Details */}
                          <Box sx={{ 
                            flex: 1, 
                            minWidth: 0,
                            mr: { xs: 1, sm: 2 }
                          }}>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight="600"
                              sx={{ 
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: '#333',
                                mb: 0.5
                              }}
                            >
                              {item.menuItem.name}
                            </Typography>
                            
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                mb: item.specialInstructions ? 0.5 : 0
                              }}
                            >
                              {formatPrice(item.menuItem.price)} each
                            </Typography>
                            
                            {item.specialInstructions && (
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ 
                                  fontStyle: 'italic',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  backgroundColor: '#f8f9fa',
                                  px: 0.75,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  border: '1px solid #e9ecef',
                                  mt: 0.25
                                }}
                              >
                                {item.specialInstructions}
                              </Typography>
                            )}
                          </Box>
                          
                          {/* Controls & Price Column */}
                          <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5,
                            flexShrink: 0,
                            minWidth: { xs: 80, sm: 90 }
                          }}>
                            {/* Price */}
                            <Typography 
                              variant="h6" 
                              fontWeight="bold" 
                              sx={{ 
                                color: '#1976D2',
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                lineHeight: 1,
                                textAlign: 'center'
                              }}
                            >
                              {formatPrice(item.menuItem.price * item.quantity)}
                            </Typography>
                            
                            {/* Quantity Controls */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #E0E0E0',
                                borderRadius: 1,
                                backgroundColor: 'white',
                                height: 32
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
                                sx={{ 
                                  p: 0.25,
                                  minWidth: 24,
                                  height: 24,
                                  borderRadius: 0.5,
                                  '&:hover': {
                                    backgroundColor: '#F5F5F5'
                                  }
                                }}
                              >
                                <Remove sx={{ fontSize: 14 }} />
                              </IconButton>
                              <Typography sx={{ 
                                mx: 1,
                                textAlign: 'center',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#1976D2',
                                minWidth: 16
                              }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                                sx={{ 
                                  p: 0.25,
                                  minWidth: 24,
                                  height: 24,
                                  borderRadius: 0.5,
                                  '&:hover': {
                                    backgroundColor: '#F5F5F5'
                                  }
                                }}
                              >
                                <Add sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>

                  <Box sx={{ 
                    mt: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(0)}
                      endIcon={<ArrowForward />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Continue to Customer Info
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/menu/${actualCafeId}/${tableId}`)}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Add More Items
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {/* Step 1: Customer Information */}
              <Collapse in={activeStep === 1}>
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      fontWeight: 600,
                      mb: 3,
                      color: 'text.primary',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Customer Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        InputProps={{
                          startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
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
                        variant="outlined"
                        InputProps={{
                          startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
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
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Special Instructions (Optional)"
                        name="specialInstructions"
                        value={customerInfo.specialInstructions}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        variant="outlined"
                        placeholder="Any special requests for your order..."
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ 
                    mt: 4,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    justifyContent: 'space-between'
                  }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      startIcon={<ArrowBack />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Back to Order
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={!isStepValid(1)}
                      endIcon={<ArrowForward />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Continue to Payment
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {/* Step 2: Payment Method */}
              <Collapse in={activeStep === 2}>
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      fontWeight: 600,
                      mb: 3,
                      color: 'text.primary',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Payment Method
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    >
                      {paymentMethods.map((method) => (
                        <Card 
                          key={method.id}
                          sx={{ 
                            mb: 2,
                            border: selectedPaymentMethod === method.id ? '2px solid #1976D2' : '1px solid #E0E0E0',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#1976D2',
                              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)'
                            }
                          }}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <FormControlLabel
                              value={method.id}
                              control={<Radio />}
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                  <Box sx={{ color: 'primary.main' }}>
                                    {method.icon}
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                      {method.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {method.description}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                              sx={{ 
                                margin: 0,
                                width: '100%',
                                '& .MuiFormControlLabel-label': {
                                  width: '100%'
                                }
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <Box sx={{ 
                    mt: 4,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    justifyContent: 'space-between'
                  }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      startIcon={<ArrowBack />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Back to Info
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handlePlaceOrder}
                      disabled={loading || !isStepValid(2)}
                      startIcon={loading ? <CircularProgress size={20} /> : <Receipt />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        borderRadius: 2,
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          </Grid>

          {/* Order Summary Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              position: 'sticky',
              top: 20
            }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Order Summary
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal ({getTotalItems()} items)</Typography>
                  <Typography variant="body2">{formatPrice(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Delivery Fee</Typography>
                  <Typography variant="body2" color={deliveryFee === 0 ? 'success.main' : 'text.primary'}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax (8%)</Typography>
                  <Typography variant="body2">{formatPrice(tax)}</Typography>
                </Box>
                {appliedPromo && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'success.main' }}>
                      {`Promo (${appliedPromo.promo_code})`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'success.main' }}>
                      {`-${formatPrice(promoDiscount)}`}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {formatPrice(total)}
                </Typography>
              </Box>

              {/* Promo Code Section */}
              <Box sx={{ mb: 3 }}>
                {appliedPromo ? (
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'success.light', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalOffer sx={{ color: 'success.main', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                        {`${appliedPromo.promo_code} Applied!`}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={handleRemovePromo}
                      sx={{ color: 'success.main' }}
                    >
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setShowPromoDialog(true)}
                    startIcon={<LocalOffer />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '0.95rem'
                    }}
                  >
                    Apply Promo Code
                  </Button>
                )}
              </Box>

              {/* Delivery Info */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'grey.50', 
                borderRadius: 2,
                mb: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight="600">
                    Table {tableId}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Estimated: 25-30 minutes
                  </Typography>
                </Box>
              </Box>


            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Promo Code Dialog */}
      <Dialog 
        open={showPromoDialog} 
        onClose={() => setShowPromoDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="600">
            Apply Promo Code
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            variant="outlined"
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleApplyPromo();
              }
            }}
          />
          
          {availablePromos.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Available Promo Codes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availablePromos.map((code) => (
                  <Chip
                    key={code}
                    label={code}
                    variant="outlined"
                    size="small"
                    onClick={() => setPromoCode(code)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowPromoDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApplyPromo}
            variant="contained"
            disabled={!promoCode.trim() || promoLoading}
            startIcon={promoLoading ? <CircularProgress size={16} /> : null}
            sx={{ borderRadius: 2 }}
          >
            {promoLoading ? 'Validating...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default CheckoutPage;