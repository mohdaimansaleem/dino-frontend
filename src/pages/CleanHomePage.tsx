import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CleanDinoLogo from '../components/CleanDinoLogo';
import QRCodeDemo from '../components/QRCodeDemo';

const CleanHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showQRDemo, setShowQRDemo] = useState(false);

  const features = [
    {
      icon: <QrCode sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Smart QR Ordering',
      description: 'Customers scan QR codes to access your menu and place orders instantly with zero wait time.',
      stats: '99.9% Uptime',
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'Advanced Analytics',
      description: 'Real-time insights, predictive analytics, and revenue optimization tools for data-driven decisions.',
      stats: '40% Revenue Boost',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#FF9800' }} />,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, PCI compliance, and 24/7 monitoring to keep your data safe.',
      stats: 'ISO 27001 Certified',
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#9C27B0' }} />,
      title: 'Lightning Fast',
      description: 'Sub-second loading times with global CDN and edge computing for optimal performance.',
      stats: '<100ms Response',
    },
    {
      icon: <Smartphone sx={{ fontSize: 40, color: '#F44336' }} />,
      title: 'Mobile First',
      description: 'Progressive web app with offline support and native app experience across all devices.',
      stats: '5-Star Rating',
    },
    {
      icon: <Support sx={{ fontSize: 40, color: '#607D8B' }} />,
      title: 'Premium Support',
      description: 'Dedicated success manager, priority support, and custom integrations for enterprise clients.',
      stats: '24/7 Available',
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Restaurant Owner",
      restaurant: "The Golden Spoon",
      rating: 5,
      comment: "Dino E-Menu transformed our business! Revenue increased by 45% in just 3 months.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    },
    {
      name: "Michael Chen",
      role: "Head Chef",
      restaurant: "Fusion Bistro",
      rating: 5,
      comment: "The analytics helped us optimize our menu. Customer satisfaction is at an all-time high!",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    },
    {
      name: "Emily Rodriguez",
      role: "Manager",
      restaurant: "Coastal Cafe",
      rating: 5,
      comment: "Setup was incredibly easy. Our staff loves the intuitive interface!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Restaurants", icon: <Restaurant /> },
    { number: "2M+", label: "Orders Daily", icon: <TrendingUp /> },
    { number: "99.9%", label: "Uptime", icon: <CloudDone /> },
    { number: "40%", label: "Revenue Boost", icon: <EmojiEvents /> },
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
                  Join 10,000+ restaurants revolutionizing customer experience with QR code-based digital menus. 
                  Let customers order directly from their phones while you manage everything from our powerful dashboard.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {user ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate(user.role === 'admin' ? '/admin' : '/profile')}
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
                        onClick={() => setShowQRDemo(true)}
                        sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
                      >
                        View Menu Demo
                      </Button>
                    </>
                  )}
                </Box>
                
                {/* Navigation Links */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/features')}
                    sx={{ textTransform: 'none' }}
                  >
                    Features
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/pricing')}
                    sx={{ textTransform: 'none' }}
                  >
                    Pricing
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/testimonials')}
                    sx={{ textTransform: 'none' }}
                  >
                    Testimonials
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/contact')}
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
                      color: 'white',
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
      <Container maxWidth="lg" sx={{ py: 10 }}>
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
                  },
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

      {/* Benefits Section */}
      <Box sx={{ py: 10, backgroundColor: 'grey.50' }}>
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
                  color: 'white',
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
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" gutterBottom fontWeight="600" color="text.primary">
            Loved by Restaurant Owners
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            See what our customers are saying
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/testimonials')}
            sx={{ mb: 2 }}
          >
            View All Testimonials
          </Button>
        </Box>
        
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={1}
                sx={{
                  p: 4,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
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

      {/* Contact Section */}
      <Box sx={{ py: 10, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" gutterBottom fontWeight="600" color="text.primary">
              Ready to Transform Your Restaurant?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Join thousands of successful restaurants using Dino E-Menu
            </Typography>
          </Box>
          
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {[
              { icon: <Phone />, title: 'Call Us', info: '+1 (555) 123-4567' },
              { icon: <Email />, title: 'Email Us', info: 'hello@dinoemenu.com' },
              { icon: <LocationOn />, title: 'Visit Us', info: '123 Tech Street, San Francisco, CA' },
            ].map((contact, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 4,
                    textAlign: 'center',
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
                  color: 'white',
                  border: '1px solid',
                  borderColor: 'primary.dark',
                }}
              >
                <CleanDinoLogo size={60} />
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
                  Start Your Free Trial
                </Button>
              </Paper>
            )}
          </Box>
        </Container>
      </Box>

      {/* QR Code Demo Dialog */}
      <QRCodeDemo
        open={showQRDemo}
        onClose={() => setShowQRDemo(false)}
      />
    </Box>
  );
};

export default CleanHomePage;