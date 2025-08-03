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

  Avatar,
} from '@mui/material';
import {
  CheckCircle,


} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/formatters';
import { 
  PRICING_PLANS, 
  PRICING_ADDONS, 
  FAQS, 
  PRICING_BENEFITS 
} from '../data/info';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingPlans = PRICING_PLANS;
  const addOns = PRICING_ADDONS;
  const faqs = FAQS.slice(0, 5); // Take first 5 FAQs for pricing page



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
                          {formatINR(price)}
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
                        {plan.maxCafes === -1 ? 'Unlimited' : plan.maxCafes} cafe{(plan.maxCafes === -1 || plan.maxCafes > 1) ? 's' : ''} • {' '}
                        {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers} user{(plan.maxUsers === -1 || plan.maxUsers > 1) ? 's' : ''}
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
                    {formatINR(addon.price)}
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
          {PRICING_BENEFITS.map((benefit, index) => (
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
                  {React.createElement(benefit.icon, { sx: { fontSize: 40, color: benefit.color } })}
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