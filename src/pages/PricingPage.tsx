import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  TrendingUp,
  Security,
  Support,
  Business,
  Restaurant,
  People,
  Analytics,
  CloudDone,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for small cafes and restaurants',
      monthlyPrice: 999,
      annualPrice: 9990,
      popular: false,
      maxCafes: 1,
      maxUsers: 5,
      features: [
        'QR Code Ordering',
        'Digital Menu Management',
        'Order Management',
        'Basic Analytics',
        'Table Management',
        'Customer Support',
        'Mobile App Access',
        'Payment Integration'
      ],
      limitations: [
        'Limited to 1 cafe location',
        'Basic reporting only',
        'Email support only'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Ideal for growing restaurant chains',
      monthlyPrice: 2999,
      annualPrice: 29990,
      popular: true,
      maxCafes: 5,
      maxUsers: 25,
      features: [
        'Everything in Basic',
        'Advanced Analytics & Reports',
        'Real-time Notifications',
        'Multi-location Management',
        'Custom Branding',
        'Inventory Management',
        'Staff Management',
        'Priority Support',
        'API Access',
        'Custom Integrations'
      ],
      limitations: [
        'Limited to 5 cafe locations',
        'Standard API rate limits'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large restaurant enterprises',
      monthlyPrice: 9999,
      annualPrice: 99990,
      popular: false,
      maxCafes: -1, // Unlimited
      maxUsers: -1, // Unlimited
      features: [
        'Everything in Premium',
        'Unlimited Locations',
        'Unlimited Users',
        'White-label Solution',
        'Advanced Security Features',
        'Dedicated Account Manager',
        'Custom Development',
        '24/7 Phone Support',
        'On-premise Deployment',
        'Advanced API Access',
        'Custom Reports & Analytics',
        'Training & Onboarding'
      ],
      limitations: []
    }
  ];

  const addOns = [
    {
      name: 'Additional Location',
      description: 'Add extra cafe locations to your plan',
      price: 500,
      unit: 'per location/month'
    },
    {
      name: 'Extra Users',
      description: 'Add more staff users to your account',
      price: 100,
      unit: 'per user/month'
    },
    {
      name: 'Custom Integration',
      description: 'Connect with your existing systems',
      price: 5000,
      unit: 'one-time setup'
    },
    {
      name: 'Training Session',
      description: 'Dedicated training for your team',
      price: 2000,
      unit: 'per session'
    }
  ];

  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 14-day free trial for all plans. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and bank transfers. For enterprise plans, we also offer invoice-based billing.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and are compliant with industry standards including PCI DSS and GDPR.'
    },
    {
      question: 'Do you offer custom solutions?',
      answer: 'Yes, our Enterprise plan includes custom development and white-label solutions tailored to your specific needs.'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountedPrice = (monthlyPrice: number, annualPrice: number) => {
    if (isAnnual) {
      const discount = ((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100;
      return {
        price: annualPrice,
        discount: Math.round(discount)
      };
    }
    return { price: monthlyPrice, discount: 0 };
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: 'background.paper',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom fontWeight="bold">
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Choose the perfect plan for your restaurant. Start with a free trial and scale as you grow.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={isAnnual}
                onChange={(e) => setIsAnnual(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Annual Billing</Typography>
                <Chip
                  label="Save up to 17%"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            }
            sx={{ mb: 6 }}
          />
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4} alignItems="stretch">
          {pricingPlans.map((plan) => {
            const { price, discount } = getDiscountedPrice(plan.monthlyPrice, plan.annualPrice);
            
            return (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? 'primary.main' : 'divider',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease'
                    },
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 600
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
                        {plan.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {plan.description}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h3" component="span" fontWeight="bold">
                          {formatPrice(price)}
                        </Typography>
                        <Typography variant="body1" component="span" color="text.secondary">
                          /{isAnnual ? 'year' : 'month'}
                        </Typography>
                        {discount > 0 && (
                          <Chip
                            label={`${discount}% OFF`}
                            size="small"
                            color="success"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        {plan.maxCafes === -1 ? 'Unlimited' : plan.maxCafes} cafe{plan.maxCafes !== 1 ? 's' : ''} • {' '}
                        {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers} user{plan.maxUsers !== 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      size="large"
                      fullWidth
                      onClick={() => navigate('/register')}
                      sx={{ mb: 3 }}
                    >
                      Start Free Trial
                    </Button>

                    <List sx={{ flexGrow: 1 }}>
                      {plan.features.map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {plan.limitations.length > 0 && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Limitations:
                        </Typography>
                        {plan.limitations.map((limitation, index) => (
                          <Typography key={index} variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            • {limitation}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Add-ons */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom fontWeight="600">
              Add-ons & Extras
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Customize your plan with additional features
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {addOns.map((addon, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    {addon.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {addon.description}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {formatPrice(addon.price)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {addon.unit}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Comparison */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" gutterBottom fontWeight="600">
            Why Choose Dino?
          </Typography>
          <Typography variant="h6" color="text.secondary">
            See what makes us different from the competition
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              icon: <TrendingUp sx={{ fontSize: 40, color: '#4CAF50' }} />,
              title: 'Proven ROI',
              description: 'Our customers see an average 40% increase in revenue within 3 months'
            },
            {
              icon: <Security sx={{ fontSize: 40, color: '#2196F3' }} />,
              title: 'Enterprise Security',
              description: 'Bank-level security with PCI compliance and end-to-end encryption'
            },
            {
              icon: <Support sx={{ fontSize: 40, color: '#FF9800' }} />,
              title: 'Expert Support',
              description: '24/7 support with dedicated account managers for premium plans'
            },
            {
              icon: <CloudDone sx={{ fontSize: 40, color: '#9C27B0' }} />,
              title: '99.9% Uptime',
              description: 'Reliable cloud infrastructure with automatic backups and failover'
            }
          ].map((benefit, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: 'transparent',
                  }}
                >
                  {benefit.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom fontWeight="600">
              Frequently Asked Questions
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} key={index}>
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    {faq.question}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, backgroundColor: 'primary.main', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom fontWeight="600">
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Start your free trial today. No credit card required.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'grey.100',
                }
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/contact')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Contact Sales
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PricingPage;