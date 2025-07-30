import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Rating,
  Divider,
  Fab,
  Zoom,
  useScrollTrigger,
} from '@mui/material';
import {
  QrCode,
  Restaurant,
  Analytics,
  Speed,
  Security,
  Support,
  CheckCircle,
  Phone,
  Email,
  LocationOn,
  TrendingUp,
  CloudDone,
  PlayArrow,
  EmojiEvents,
  Smartphone,
  AutoAwesome,
  KeyboardArrowUp,
  AttachMoney,
  Business,
  CorporateFare,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DinoLogo from '../components/DinoLogo';

import { formatINR } from '../utils/formatters';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();


  // Refs for smooth scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  // Smooth scroll function
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: <QrCode sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Smart QR Ordering',
      description: 'Customers scan QR codes to access your menu and place orders instantly with zero wait time.',
      stats: '99.9% Uptime',
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Advanced Analytics',
      description: 'Real-time insights, predictive analytics, and revenue optimization tools for data-driven decisions.',
      stats: '40% Revenue Boost',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, PCI compliance, and 24/7 monitoring to keep your data safe.',
      stats: 'ISO 27001 Certified',
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Lightning Fast',
      description: 'Sub-second loading times with global CDN and edge computing for optimal performance.',
      stats: '<100ms Response',
    },
    {
      icon: <Smartphone sx={{ fontSize: 40, color: 'error.main' }} />,
      title: 'Mobile First',
      description: 'Progressive web app with offline support and native app experience across all devices.',
      stats: '5-Star Rating',
    },
    {
      icon: <Support sx={{ fontSize: 40, color: 'info.main' }} />,
      title: 'Premium Support',
      description: 'Dedicated success manager, priority support, and custom integrations for enterprise clients.',
      stats: '24/7 Available',
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 2999,
      period: 'month',
      description: 'Perfect for small cafes and restaurants',
      icon: <Restaurant sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: [
        'Up to 2 cafes',
        'Basic QR menu',
        'Order management',
        'Basic analytics',
        'Email support',
        'Mobile app access',
      ],
      popular: false,
      color: 'primary',
    },
    {
      name: 'Professional',
      price: 7999,
      period: 'month',
      description: 'Ideal for growing restaurant chains',
      icon: <Business sx={{ fontSize: 40, color: 'secondary.main' }} />,
      features: [
        'Up to 10 cafes',
        'Advanced QR features',
        'Real-time analytics',
        'Customer insights',
        'Priority support',
        'Custom branding',
        'Multi-language support',
        'Integration APIs',
      ],
      popular: true,
      color: 'secondary',
    },
    {
      name: 'Enterprise',
      price: 19999,
      period: 'month',
      description: 'For large restaurant enterprises',
      icon: <CorporateFare sx={{ fontSize: 40, color: 'success.main' }} />,
      features: [
        'Unlimited cafes',
        'White-label solution',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Custom features',
        'Training & onboarding',
      ],
      popular: false,
      color: 'success',
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Restaurant Owner",
      restaurant: "Spice Garden",
      rating: 5,
      comment: "Dino E-Menu transformed our restaurant completely! Revenue increased by 45% in just 3 months. The QR ordering system is perfect for Indian customers.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    {
      name: "Priya Sharma",
      role: "Head Chef",
      restaurant: "Mumbai Masala",
      rating: 5,
      comment: "The analytics helped us understand our customers better. We can track peak hours and optimize our menu for maximum profit.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    },
    {
      name: "Arjun Patel",
      role: "Manager",
      restaurant: "Gujarati Thali House",
      rating: 5,
      comment: "Setup was incredibly easy. Our customers love ordering from their phones. Wait times reduced by 60% during lunch rush!",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    },
    {
      name: "Deepika Reddy",
      role: "Owner",
      restaurant: "South Indian Express",
      rating: 5,
      comment: "Best investment for our chain! Order accuracy improved and customers appreciate the contactless experience, especially post-COVID.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
    {
      name: "Mohammed Ali",
      role: "Operations Manager",
      restaurant: "Biryani Palace",
      rating: 5,
      comment: "Managing our 8 locations across Mumbai became so much easier. Real-time tracking and centralized menu management is fantastic.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
    {
      name: "Anita Singh",
      role: "Franchise Owner",
      restaurant: "Punjabi Dhaba Chain",
      rating: 5,
      comment: "The enterprise features are outstanding. Custom branding helps maintain our traditional dhaba feel while being modern.",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150",
    },
  ];

  const stats = [
    { number: "5,000+", label: "Restaurants", icon: <Restaurant /> },
    { number: "1M+", label: "Orders Daily", icon: <TrendingUp /> },
    { number: "99.9%", label: "Uptime", icon: <CloudDone /> },
    { number: "45%", label: "Revenue Boost", icon: <EmojiEvents /> },
  ];

  const benefits = [
    'Reduce order processing time by 60%',
    'Increase table turnover rate',
    'Minimize order errors',
    'Contactless ordering experience',
    'Real-time order tracking',
    'Detailed sales analytics',
    'Easy menu updates',
    'Multi-language support',
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        id="hero"
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Chip 
                  icon={<AutoAwesome />}
                  label="Revolutionary Technology" 
                  color="primary"
                  sx={{ mb: 3, fontWeight: 500 }}
                />
                
                <Typography 
                  variant="h1" 
                  sx={{ 
                    mb: 3,
                    fontWeight: 700,
                    color: 'text.primary',
                  }}
                >
                  Transform Your Restaurant
                </Typography>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    mb: 4,
                    fontWeight: 400,
                    color: 'text.secondary',
                  }}
                >
                  with Digital Menu Ordering
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 6,
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                    color: 'text.secondary',
                    maxWidth: 500,
                  }}
                >
                  Join 5,000+ restaurants across India revolutionizing customer experience with QR code-based digital menus. 
                  Let customers order directly from their phones while you manage everything from our powerful dashboard.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {user ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate((user.role as string) === 'admin' ? '/admin' : '/profile')}
                      sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
                      >
                        Start Free Trial
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<PlayArrow />}
                        onClick={() => navigate('/register')}
                        sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
                      >
                        Create Account
                      </Button>
                    </>
                  )}
                </Box>
                
                {/* Navigation Links */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                  <Button
                    color="inherit"
                    onClick={() => scrollToSection(featuresRef)}
                    sx={{ textTransform: 'none' }}
                  >
                    Features
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => scrollToSection(pricingRef)}
                    sx={{ textTransform: 'none' }}
                  >
                    Pricing
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => scrollToSection(testimonialsRef)}
                    sx={{ textTransform: 'none' }}
                  >
                    Testimonials
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => scrollToSection(contactRef)}
                    sx={{ textTransform: 'none' }}
                  >
                    Contact
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    backgroundColor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      borderRadius: 2,
                      p: 3,
                      mb: 3,
                      display: 'inline-block',
                      color: 'primary.contrastText',
                    }}
                  >
                    <QrCode sx={{ fontSize: 60 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight="600" color="text.primary">
                    Scan & Order
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Customers scan QR codes to access your digital menu
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2,
                      backgroundColor: 'primary.main',
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }} ref={featuresRef} id="features">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" gutterBottom fontWeight="600" color="text.primary">
            Why Choose Dino E-Menu?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Everything you need to modernize your restaurant ordering experience with cutting-edge technology
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  
                  <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                  
                  <Chip
                    label={feature.stats}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ py: 10, backgroundColor: 'grey.50' }} ref={pricingRef} id="pricing">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" gutterBottom fontWeight="600" color="text.primary">
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Choose the perfect plan for your restaurant. All plans include our core features with no hidden fees.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? 'secondary.main' : 'divider',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-8px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="secondary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                      {plan.icon}
                    </Box>
                    
                    <Typography variant="h5" gutterBottom fontWeight="600" color="text.primary">
                      {plan.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h3" fontWeight="bold" color="primary.main" component="span">
                        {formatINR(plan.price)}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" component="span">
                        /{plan.period}
                      </Typography>
                    </Box>
                    
                    <List sx={{ mb: 4 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.primary',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      color={plan.color as any}
                      fullWidth
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{ py: 1.5 }}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </Typography>
            <Button
              variant="text"
              onClick={() => scrollToSection(contactRef)}
              sx={{ textDecoration: 'underline' }}
            >
              Need a custom plan? Contact us
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom fontWeight="600" color="text.primary">
                Boost Your Restaurant's Efficiency
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
                Join hundreds of restaurants that have transformed their operations with Dino E-Menu.
              </Typography>
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon>
                      <CheckCircle color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={benefit} 
                      primaryTypographyProps={{
                        fontWeight: 400,
                        color: 'text.primary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  border: '1px solid',
                  borderColor: 'primary.dark',
                }}
              >
                <Typography variant="h2" gutterBottom fontWeight="bold">
                  60%
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Faster Order Processing
                </Typography>
                <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Typography variant="h2" gutterBottom fontWeight="bold">
                  95%
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Customer Satisfaction
                </Typography>
                <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Typography variant="h2" gutterBottom fontWeight="bold">
                  24/7
                </Typography>
                <Typography variant="h6">
                  System Availability
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, backgroundColor: 'grey.50' }} ref={testimonialsRef} id="testimonials">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" gutterBottom fontWeight="600" color="text.primary">
              Loved by Restaurant Owners
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              See what our customers are saying about their experience with Dino E-Menu
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 4,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="text.primary">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role} at {testimonial.restaurant}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.6, color: 'text.primary' }}>
                    "{testimonial.comment}"
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 10 }} ref={contactRef} id="contact">
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" gutterBottom fontWeight="600" color="text.primary">
              Ready to Transform Your Restaurant?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Join thousands of successful restaurants using Dino E-Menu
            </Typography>
          </Box>
          
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {[
              { icon: <Phone />, title: 'Call Us', info: '+91 98765 43210', action: 'tel:+919876543210' },
              { icon: <Email />, title: 'Email Us', info: 'hello@dinoemenu.in', action: 'mailto:hello@dinoemenu.in' },
              { icon: <LocationOn />, title: 'Visit Us', info: 'BKC, Mumbai, Maharashtra 400051', action: '#' },
            ].map((contact, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: contact.action !== '#' ? 'pointer' : 'default',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  onClick={() => {
                    if (contact.action !== '#') {
                      window.open(contact.action, '_blank');
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 2,
                      backgroundColor: 'primary.main',
                    }}
                  >
                    {contact.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
                    {contact.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {contact.info}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center' }}>
            {!user && (
              <Paper
                elevation={2}
                sx={{
                  display: 'inline-block',
                  p: 6,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  border: '1px solid',
                  borderColor: 'primary.dark',
                }}
              >
                <DinoLogo size={60} />
                <Typography variant="h4" gutterBottom fontWeight="600" sx={{ mt: 2 }}>
                  Special Launch Offer
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                  Get 3 months free when you sign up today!
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    backgroundColor: 'background.paper',
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
                  Start Your Free Trial
                </Button>
              </Paper>
            )}
          </Box>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      <Zoom in={trigger}>
        <Fab
          onClick={scrollToTop}
          color="primary"
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: 2,
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </Zoom>


    </Box>
  );
};

export default HomePage;