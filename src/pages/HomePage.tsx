import React, { useRef } from 'react';
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

  CheckCircle,
  Phone,
  Email,
  LocationOn,

  PlayArrow,

  AutoAwesome,
  KeyboardArrowUp,

} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import DinoLogo from '../components/DinoLogo';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Footer from '../components/layout/Footer';

import AnimatedBackground from '../components/ui/AnimatedBackground';

import { formatINR } from '../utils/formatters';
import { 
  CORE_FEATURES, 
  PRICING_PLANS, 
  TESTIMONIALS, 
  COMPANY_STATS, 
  BENEFITS,
  CONTENT,
  COMPANY_INFO
} from '../data/info';

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

  // Transform features data for display
  const features = CORE_FEATURES.map(feature => ({
    icon: React.createElement(feature.icon, { sx: { fontSize: 40, color: feature.color } }),
    title: feature.title,
    description: feature.description,
    stats: feature.stats,
  }));

  // Transform pricing plans for display
  const pricingPlans = PRICING_PLANS.map(plan => ({
    name: plan.name,
    price: plan.monthlyPrice,
    period: 'month',
    description: plan.description,
    icon: React.createElement(plan.icon, { sx: { fontSize: 40, color: `${plan.color}.main` } }),
    features: plan.features.slice(0, 6), // Take first 6 features for home page
    popular: plan.popular,
    color: plan.color,
  }));

  // Transform testimonials for display
  const testimonials = TESTIMONIALS.slice(0, 6).map(testimonial => ({
    name: testimonial.name,
    role: testimonial.role,
    restaurant: testimonial.restaurant,
    rating: testimonial.rating,
    comment: testimonial.comment,
    avatar: testimonial.avatar,
  }));

  // Transform stats for display
  const stats = COMPANY_STATS.map(stat => ({
    number: stat.number,
    suffix: stat.suffix,
    label: stat.label,
    icon: React.createElement(stat.icon),
    color: stat.color,
    bgColor: stat.bgColor,
    decimals: stat.decimals,
  }));

  const benefits = BENEFITS;

  return (
    <Box className="page-content-with-navbar">

      {/* Hero Section */}
      <Box
        ref={heroRef}
        id="hero"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Chip 
                  icon={<AutoAwesome sx={{ color: '#fffffeff !important' }} />}
                  label={CONTENT.hero.badge} 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 500,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    '& .MuiChip-icon': {
                      color: '#ffffffff !important',
                    },
                  }}
                />
                
                <Typography 
                  variant="h1" 
                  sx={{ 
                    mb: { xs: 2, md: 3 },
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
                    lineHeight: { xs: 1.2, md: 1.1 },
                  }}
                >
                  {CONTENT.hero.title}
                </Typography>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    mb: { xs: 3, md: 4 },
                    fontWeight: 400,
                    color: 'text.secondary',
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                    lineHeight: { xs: 1.3, md: 1.2 },
                  }}
                >
                  {CONTENT.hero.subtitle}
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: { xs: 4, md: 6 },
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    lineHeight: { xs: 1.5, md: 1.7 },
                    color: 'text.secondary',
                    maxWidth: { xs: '100%', md: 500 },
                  }}
                >
                  {CONTENT.hero.description}
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, sm: 2 }, 
                  flexWrap: 'wrap',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' }
                }}>
                  {user?.role !== 'operator' ? (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate(('/admin' ))}
                      sx={{ 
                        px: { xs: 3, sm: 4 }, 
                        py: { xs: 1.2, sm: 1.5 }, 
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        minHeight: { xs: 44, sm: 48 },
                        backgroundColor: 'white',
                        color: 'primary.main',
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          transform: 'translateY(-2px)',
                        },
                        '&:active': {
                          transform: 'translateY(0px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{ 
                          px: { xs: 3, sm: 4 }, 
                          py: { xs: 1.2, sm: 1.5 }, 
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          minHeight: { xs: 44, sm: 48 },
                          backgroundColor: 'primary.main',
                          color: 'white',
                          width: { xs: '100%', sm: 'auto' },
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                            transform: 'translateY(-2px)',
                          },
                          '&:active': {
                            transform: 'translateY(0px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {CONTENT.hero.cta.primary}
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<PlayArrow />}
                        onClick={() => navigate('/register')}
                        sx={{ 
                          px: { xs: 3, sm: 4 }, 
                          py: { xs: 1.2, sm: 1.5 }, 
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          minHeight: { xs: 44, sm: 48 },
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          width: { xs: '100%', sm: 'auto' },
                          '&:hover': {
                            borderColor: 'primary.dark',
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                            transform: 'translateY(-2px)',
                          },
                          '&:active': {
                            transform: 'translateY(0px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {CONTENT.hero.cta.secondary}
                      </Button>
                    </>
                  )}
                </Box>
                
                {/* Quick Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, sm: 2 }, 
                  flexWrap: 'wrap', 
                  mt: { xs: 2, sm: 3 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'flex-start' }
                }}>
                  <Button
                    variant="text"
                    onClick={() => navigate('/features')}
                    sx={{ 
                      textTransform: 'none',
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1, sm: 1.5 },
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: { xs: 'flex-start', sm: 'center' },
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {CONTENT.hero.quickActions.learnMore}
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => navigate('/pricing')}
                    sx={{ 
                      textTransform: 'none',
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1, sm: 1.5 },
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: { xs: 'flex-start', sm: 'center' },
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {CONTENT.hero.quickActions.viewPricing}
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Grid container spacing={3}>
                {/* Animated Stats Section */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {stats.map((stat, index) => (
                      <Paper
                        key={index}
                        elevation={2}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderRadius: 2,
                          border: `1px solid ${stat.color}30`,
                          backdropFilter: 'blur(10px)',
                          background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${stat.bgColor} 100%)`,
                          '&:hover': {
                            transform: 'translateX(10px) scale(1.05)',
                            backgroundColor: stat.bgColor,
                            borderColor: `${stat.color}60`,
                            boxShadow: `0 8px 24px ${stat.color}20`,
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              backgroundColor: stat.color,
                              borderRadius: '50%',
                              p: 1,
                              color: 'white',
                              minWidth: 40,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 4px 12px ${stat.color}40`,
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Box sx={{ textAlign: 'left', flex: 1 }}>
                            <AnimatedCounter
                              end={stat.number}
                              suffix={stat.suffix}
                              decimals={stat.decimals || 0}
                              duration={2000}
                              delay={index * 200}
                              variant="h6"
                              color="primary.main"
                              fontWeight="bold"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {stat.label}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>



      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, sm: 3 } }} ref={featuresRef} id="features">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            fontWeight="600" 
            color="text.primary"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
              mb: { xs: 2, md: 3 }
            }}
          >
            {CONTENT.features.title}
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 600, 
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            {CONTENT.features.subtitle}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    transform: 'translateY(-12px) scale(1.02)',
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    {feature.icon}
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    fontWeight="600" 
                    color="text.primary"
                    sx={{
                      fontSize: { xs: '1.125rem', md: '1.25rem' }
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: { xs: 2, md: 3 }, 
                      lineHeight: 1.6,
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}
                  >
                    {feature.description}
                  </Typography>
                  
                  <Chip
                    label={feature.stats}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontSize: { xs: '0.75rem', md: '0.8125rem' }
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'grey.50' }} ref={pricingRef} id="pricing">
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              fontWeight="600" 
              color="text.primary"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                mb: { xs: 2, md: 3 }
              }}
            >
              {CONTENT.pricing.title}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: 600, 
                mx: 'auto',
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                px: { xs: 2, sm: 0 }
              }}
            >
              {CONTENT.pricing.subtitle}
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? '2px solid' : '1px solid',
                    borderColor: plan.popular ? 'secondary.main' : 'divider',
                    '&:hover': {
                      boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                      transform: 'translateY(-15px) scale(1.03)',
                      borderColor: plan.popular ? 'secondary.main' : 'primary.main',
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
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
                  
                  <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
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
                      sx={{ 
                        py: { xs: 1.2, sm: 1.5 },
                        minHeight: { xs: 44, sm: 48 },
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        '&:active': {
                          transform: 'scale(0.98)',
                        },
                        transition: 'all 0.2s ease',
                      }}
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
              {CONTENT.pricing.trialInfo}
            </Typography>
            <Button
              variant="text"
              onClick={() => scrollToSection(contactRef)}
              sx={{ textDecoration: 'underline' }}
            >
              {CONTENT.pricing.customPlan}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h3" 
                gutterBottom 
                fontWeight="600" 
                color="text.primary"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  mb: { xs: 2, md: 3 }
                }}
              >
                {CONTENT.benefits.title}
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 3, md: 4 }, 
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: { xs: 1.5, md: 1.6 }
                }}
              >
                {CONTENT.benefits.subtitle}
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
                  p: { xs: 4, md: 6 },
                  textAlign: 'center',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  border: '1px solid',
                  borderColor: 'primary.dark',
                }}
              >
                <Typography variant="h2" gutterBottom fontWeight="bold">
                  {CONTENT.benefits.stats.processing.value}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {CONTENT.benefits.stats.processing.label}
                </Typography>
                <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Typography variant="h2" gutterBottom fontWeight="bold">
                  {CONTENT.benefits.stats.satisfaction.value}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {CONTENT.benefits.stats.satisfaction.label}
                </Typography>
                <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Typography variant="h2" gutterBottom fontWeight="bold">
                  {CONTENT.benefits.stats.availability.value}
                </Typography>
                <Typography variant="h6">
                  {CONTENT.benefits.stats.availability.label}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'grey.50' }} ref={testimonialsRef} id="testimonials">
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              fontWeight="600" 
              color="text.primary"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                mb: { xs: 2, md: 3 }
              }}
            >
              {CONTENT.testimonials.title}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2, md: 3 },
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                px: { xs: 2, sm: 0 }
              }}
            >
              {CONTENT.testimonials.subtitle}
            </Typography>
          </Box>
          
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: { xs: 3, md: 4 },
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      boxShadow: '0 15px 30px rgba(0,0,0,0.12)',
                      transform: 'translateY(-8px) scale(1.02)',
                      borderColor: 'primary.main',
                    },
                    '&:active': {
                      transform: 'translateY(-4px) scale(1.01)',
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
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
      <Box sx={{ py: { xs: 6, md: 10 } }} ref={contactRef} id="contact">
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              fontWeight="600" 
              color="text.primary"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
                mb: { xs: 2, md: 3 }
              }}
            >
              {CONTENT.contact.title}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                px: { xs: 2, sm: 0 }
              }}
            >
              {CONTENT.contact.subtitle}
            </Typography>
          </Box>
          
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 6, md: 8 } }}>
            {[
              { icon: <Phone />, title: 'Call Us', info: COMPANY_INFO.contact.phone.primary, action: `tel:${COMPANY_INFO.contact.phone.primary.replace(/\s/g, '')}` },
              { icon: <Email />, title: 'Email Us', info: COMPANY_INFO.contact.email.primary, action: `mailto:${COMPANY_INFO.contact.email.primary}` },
              { icon: <LocationOn />, title: 'Visit Us', info: COMPANY_INFO.contact.address.full, action: '#' },
            ].map((contact, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: { xs: 3, md: 4 },
                    textAlign: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: contact.action !== '#' ? 'pointer' : 'default',
                    minHeight: { xs: 'auto', sm: 200 },
                    '&:hover': {
                      boxShadow: '0 15px 30px rgba(0,0,0,0.12)',
                      transform: 'translateY(-10px) scale(1.03)',
                      borderColor: 'primary.main',
                    },
                    '&:active': {
                      transform: contact.action !== '#' ? 'translateY(-5px) scale(1.01)' : 'none',
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
        </Container>
      </Box>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <Zoom in={trigger}>
        <Fab
          onClick={scrollToTop}
          color="primary"
          size="medium"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            boxShadow: 2,
            minWidth: 44,
            minHeight: 44,
            '&:active': {
              transform: 'scale(0.95)',
            },
            transition: 'transform 0.2s ease',
          }}
        >
          <KeyboardArrowUp sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </Fab>
      </Zoom>


    </Box>
  );
};

export default HomePage;