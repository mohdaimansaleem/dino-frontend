import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Phone,
  Email,
  LocationOn,
  Restaurant,
} from '@mui/icons-material';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <Box
        component="footer"
        sx={{
          backgroundColor: '#1976D2',
          color: 'white',
          py: 2,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Restaurant sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              © {currentYear} Dino Cafe. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1976D2',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Restaurant sx={{ fontSize: 28, color: 'white' }} />
              <Typography variant="h6" fontWeight="bold">
                Dino Cafe
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Authentic Indian flavors with fresh ingredients and quick service. 
              Experience the best dining with our digital ordering system.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                sx={{ 
                  color: 'white', 
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                size="small"
                sx={{ 
                  color: 'white', 
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                size="small"
                sx={{ 
                  color: 'white', 
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                size="small"
                sx={{ 
                  color: 'white', 
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                Menu
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                About Us
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                Contact
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                Reviews
              </Link>
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                Dine In
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                Takeaway
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                Catering
              </Link>
              <Link
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                Private Events
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Hyderabad, Telangana, India
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +91 98765 43210
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  info@dinocafe.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Dino Cafe. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              color="inherit"
              underline="hover"
              sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;