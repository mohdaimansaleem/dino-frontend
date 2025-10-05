import React, { useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, CircularProgress } from '@mui/material';
import { useVenueTheme } from '../../contexts/VenueThemeContext';
import { useUserData } from '../../contexts/UserDataContext';

// --- Mock Data and Assets ---
// In a real app, this would come from your menu service API.

const mockMenuItems = [
  { id: 1, name: 'Espresso', price: 2.50, category: 'Coffee' },
  { id: 2, name: 'Cappuccino', price: 3.50, category: 'Coffee' },
  { id: 3, name: 'Croissant', price: 2.75, category: 'Pastries' },
  { id: 4, name: 'Avocado Toast', price: 8.00, category: 'Breakfast' },
];

// Theme-specific image assets
const petThemeImages = {
  'Espresso': 'https://images.unsplash.com/photo-1559190394-df57786147c2?q=80&w=1974', // Cat with coffee
  'Cappuccino': 'https://images.unsplash.com/photo-1580477851693-4623a2d3435a?q=80&w=2070', // Dog with coffee
  'Croissant': 'https://images.unsplash.com/photo-1622022999054-99349a882476?q=80&w=2070', // Cat looking at food
  'Avocado Toast': 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?q=80&w=1974', // Cat with glasses
};

const defaultThemeImages = {
  'Espresso': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974',
  'Cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a65343d?q=80&w=1974',
  'Croissant': 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?q=80&w=2070',
  'Avocado Toast': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=2070',
};

/**
 * A customer-facing menu page that adapts its content based on the selected venue theme.
 */
const MenuPage: React.FC = () => {
  const { theme, setTheme } = useVenueTheme();
  const { userData, loading: userDataLoading } = useUserData();

  // When user data is available, set the theme based on the venue's setting.
  useEffect(() => {
    if (userData?.venue?.theme) {
      setTheme(userData.venue.theme);
    }
    // If no theme is in the backend, it will keep the default 'pet' theme from the context.
  }, [userData, setTheme]);

  const getMenuItemImage = (itemName: string) => {
    if (theme === 'pet') {
      return petThemeImages[itemName as keyof typeof petThemeImages] || defaultThemeImages['Espresso'];
    }
    return defaultThemeImages[itemName as keyof typeof defaultThemeImages] || defaultThemeImages['Espresso'];
  };

  if (userDataLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Menu...</Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Our Menu
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Current Theme: <span style={{ textTransform: 'capitalize', color: '#1976d2' }}>{theme}</span>
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {mockMenuItems.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={getMenuItemImage(item.name)}
                alt={item.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.category}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  ₹{item.price.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MenuPage;
