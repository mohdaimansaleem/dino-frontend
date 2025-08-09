import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Container,
  Badge,

} from '@mui/material';
import {
  ArrowBack,
  ShoppingCart,
  Restaurant,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

interface CustomerNavbarProps {
  restaurantName?: string;
  tableId?: string;
  showBackButton?: boolean;
  showCart?: boolean;
  onCartClick?: () => void;
}

const CustomerNavbar: React.FC<CustomerNavbarProps> = ({
  restaurantName = 'Dino Cafe',
  tableId,
  showBackButton = false,
  showCart = true,
  onCartClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();

  const handleBackClick = () => {
    if (location.pathname.includes('/checkout/')) {
      // Go back to menu from checkout
      const pathParts = location.pathname.split('/');
      const cafeId = pathParts[2];
      const table = pathParts[3];
      navigate(`/menu/${cafeId}/${table}`);
    } else {
      // Default back behavior
      navigate(-1);
    }
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      // Default cart behavior - navigate to checkout
      const pathParts = location.pathname.split('/');
      if (pathParts.length >= 4) {
        const cafeId = pathParts[2];
        const table = pathParts[3];
        navigate(`/checkout/${cafeId}/${table}`);
      }
    }
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/checkout/')) {
      return 'Checkout';
    } else if (location.pathname.includes('/order-tracking/')) {
      return 'Order Status';
    } else if (location.pathname.includes('/menu/')) {
      return 'Menu';
    }
    return 'Dino Cafe';
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={1}
      sx={{ 
        backgroundColor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid #E0E0E0',
        borderRadius: 0,
        zIndex: 1100,
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: 0 }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {showBackButton && (
              <IconButton
                edge="start"
                onClick={handleBackClick}
                sx={{ 
                  mr: 1,
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Restaurant sx={{ color: '#1976D2', fontSize: 24 }} />
              <Box>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {restaurantName}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: '0.75rem',
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  {getPageTitle()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Center Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
            {showCart && getTotalItems() > 0 && (
              <IconButton
                onClick={handleCartClick}
                sx={{ 
                  color: '#1976D2',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  }
                }}
              >
                <Badge 
                  badgeContent={getTotalItems()} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#D32F2F',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                    },
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default CustomerNavbar;