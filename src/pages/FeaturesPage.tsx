import React from 'react';
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
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import {

  CheckCircle,
  Star,
  AutoAwesome,

} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  CORE_FEATURES, 
  MANAGEMENT_FEATURES, 
  ADVANCED_FEATURES, 
  INTEGRATIONS 
} from '../data/info';

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  // Transform core features for display
  const coreFeatures = CORE_FEATURES.map(feature => ({
    icon: React.createElement(feature.icon, { sx: { fontSize: 40, color: feature.color } }),
    title: feature.title,
    description: feature.description,
    benefits: feature.benefits || []
  }));

  // Transform management features for display
  const managementFeatures = MANAGEMENT_FEATURES.map(feature => ({
    icon: React.createElement(feature.icon),
    title: feature.title,
    description: feature.description,
    features: feature.features
  }));

  // Transform advanced features for display
  const advancedFeatures = ADVANCED_FEATURES.map(feature => ({
    icon: React.createElement(feature.icon),
    title: feature.title,
    description: feature.description,
    color: feature.color
  }));

  const integrations = INTEGRATIONS;

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: 'primary.main',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Chip
            icon={<AutoAwesome />}
            label="Complete Restaurant Solution"
            sx={{
              mb: 3,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 500
            }}
          />
          
          <Typography variant="h2" gutterBottom fontWeight="bold">
            Everything You Need to Run
          </Typography>
          <Typography variant="h2" gutterBottom fontWeight="bold" color="secondary.main">
            Your Restaurant Digitally
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            From QR code ordering to advanced analytics, Dino provides all the tools 
            you need to modernize your restaurant and boost revenue.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/pricing')}
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
            View Pricing Plans
          </Button>
        </Container>
      </Box>

      {/* Core Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" gutterBottom fontWeight="600">
            Core Features
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Essential tools that every modern restaurant needs
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {coreFeatures.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    {feature.icon}
                  </Box>
                  
                  <Typography variant="h5" gutterBottom fontWeight="600">
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {feature.description}
                  </Typography>

                  <List dense>
                    {feature.benefits.map((benefit: string, idx: number) => (
                      <ListItem key={idx} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={benefit} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Management Features */}
      <Box sx={{ py: 10, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" gutterBottom fontWeight="600">
              Management Tools
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Powerful tools to manage every aspect of your restaurant
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {managementFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: '100%',
                    textAlign: 'center',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2,
                      backgroundColor: 'primary.main',
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {feature.description}
                  </Typography>

                  <List dense>
                    {feature.features.map((item, idx) => (
                      <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <Star color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Advanced Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" gutterBottom fontWeight="600">
            Advanced Capabilities
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Enterprise-grade features for growing restaurants
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {advancedFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: feature.color,
                    boxShadow: 2,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: feature.color,
                  }}
                >
                  {feature.icon}
                </Avatar>
                
                <Typography variant="h6" gutterBottom fontWeight="600">
                  {feature.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Integrations Section */}
      <Box sx={{ py: 10, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" gutterBottom fontWeight="600">
              Seamless Integrations
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Connect with your favorite tools and services
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {integrations.map((integration, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    '&:hover': {
                      boxShadow: 2,
                    },
                  }}
                >
                  <Typography variant="body1" fontWeight="500">
                    {integration}
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
            Ready to Transform Your Restaurant?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of restaurants already using Dino to boost their revenue and improve customer experience.
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
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
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

export default FeaturesPage;