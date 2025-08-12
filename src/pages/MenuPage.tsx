import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  IconButton,
  Paper,
  Alert,
  Skeleton,
  Rating,
  Badge,
  Tooltip,
  useMediaQuery,
  Divider,
  Stack,
  alpha,
  styled,
  CardMedia,
  keyframes,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Zoom,
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Search,
  AccessTime,
  Star,
  Restaurant,
  LocalFireDepartment,
  Phone,
  Nature,
  CheckCircle,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { canUserAccessVenue, debugVenueAssignment } from '../utils/venueUtils';
import { useUserData } from '../contexts/UserDataContext';
import { MenuItem } from '../types';
import CustomerNavbar from '../components/CustomerNavbar';
import { menuService } from '../services/menuService';
import { Venue } from '../types/api';
import { venueService } from '../services/venueService';
import { tableService } from '../services/tableService';
import MenuAnimatedBackground from '../components/ui/MenuAnimatedBackground';

// Add fade-in animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const cartFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
`;

// Enhanced interfaces
interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  calories?: number;
  spicyLevel?: number;
  isVeg?: boolean;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  discount?: number;
  preparationTime: number;
  isAvailable: boolean;
  isPopular?: boolean;
  isNew?: boolean;
}

interface CategoryType {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  icon?: string;
  color?: string;
  image?: string;
}

// Constants for better maintainability
const VEG_FILTERS = {
  ALL: 'all',
  VEG: 'veg',
  NON_VEG: 'non-veg',
};

const SCROLL_SPY_OPTIONS = {
  DESKTOP: { rootMargin: '-100px 0px -65% 0px' },
  MOBILE: { rootMargin: '-40% 0px -60% 0px' },
};

// Remove fallback image URL to show icon instead
// const FALLBACK_IMAGE_URL = (id: string) => `https://source.unsplash.com/random/400x400?food&sig=${id}`;

const StyledCartStrip = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
  borderRadius: 0,
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  boxShadow: `0 -4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
  cursor: 'pointer',
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-in-out',
  willChange: 'transform',
  '&:hover': {
    boxShadow: `0 -6px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const CategoryListItem = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  transition: 'all 0.2s ease-in-out',
  borderLeft: '3px solid transparent',
  ...(active && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    '& .MuiListItemText-primary': {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
  }),
  '&:hover': {
    backgroundColor: !active ? alpha(theme.palette.action.hover, 0.04) : undefined,
  },
}));

const MenuPage: React.FC = () => {
  const { venueId, tableId } = useParams<{ venueId: string; tableId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { addItem, removeItem, updateQuantity, items: cartItems, getTotalItems, getTotalAmount } = useCart();
  const { user } = useAuth();
  const { userData } = useUserData();

  // State management
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [restaurant, setRestaurant] = useState<Venue | null>(null);
  const [tableName, setTableName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<string>(VEG_FILTERS.ALL);
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  // Scroll-spy refs and state
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const isCategoryClickRef = useRef(false);
  const categoryClickTimeoutRef = useRef<NodeJS.Timeout>();

  // Debug function to test API connectivity
  const testApiConnectivity = async () => {
    try {
      console.log('🔧 Testing API connectivity...');
      console.log('Current URL:', window.location.href);
      console.log('Venue ID:', venueId);
      console.log('Table ID:', tableId);
      console.log('User Agent:', navigator.userAgent);
      console.log('Is Mobile:', /Mobile|Android|iPhone|iPad/.test(navigator.userAgent));
      
      // Test basic API health
      const healthResponse = await fetch('/api/v1/health');
      console.log('Health check status:', healthResponse.status);
      
      // Test venue endpoint directly
      const venueResponse = await fetch(`/api/v1/venues/public/${venueId}`);
      console.log('Venue endpoint status:', venueResponse.status);
      
      if (venueResponse.ok) {
        const venueData = await venueResponse.json();
        console.log('Venue data:', venueData);
      } else {
        console.error('Venue endpoint failed:', await venueResponse.text());
      }
      
    } catch (error) {
      console.error('API connectivity test failed:', error);
    }
  };

  // Data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!venueId) {
          throw new Error('Venue ID is required');
        }

        // Run connectivity test in development or when debugging
        if (process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true')) {
          await testApiConnectivity();
        }

        // Validate venue access
        debugVenueAssignment(userData, user, 'MenuPage');
        
        // Check if user can access this venue (for authenticated users)
        if (user && !canUserAccessVenue(userData, user, venueId)) {
          console.warn('⚠️ User may not have access to this venue, but continuing with public access');
        }

        // Load table information
        if (tableId) {
          try {
            const tableData = await tableService.getTable(tableId);
            if (tableData) {
              setTableName(tableData.table_number || tableData.id);
            } else {
              setTableName(tableId);
            }
          } catch (tableError) {
            console.warn('Failed to load table data:', tableError);
            setTableName(tableId);
          }
        }

        // Load venue data
        console.log('🔄 Loading venue data for ID:', venueId);
        const venueData = await venueService.getPublicVenue(venueId);
        if (venueData) {
          setRestaurant(venueData);
          console.log('✅ Venue loaded successfully:', venueData.name);
        } else {
          console.error('❌ Venue not found for ID:', venueId);
          throw new Error('Restaurant not found. Please check the QR code or link.');
        }

        // Load categories and menu items
        try {
          const categoriesData = await menuService.getVenueCategories(venueId);
          const menuData = await menuService.getVenueMenuItems(venueId);

          if (categoriesData.length > 0 && menuData.length > 0) {
            const mappedMenuItems: MenuItemType[] = menuData.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.base_price,
              category: item.category_id,
              image: item.image_urls?.[0] || '',
              isAvailable: item.is_available,
              preparationTime: item.preparation_time_minutes || Math.floor(Math.random() * 20) + 10,
              calories: Math.floor(Math.random() * 400) + 200,
              spicyLevel: !item.is_vegetarian ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 3),
              isVeg: item.is_vegetarian || false,
              rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
              reviewCount: Math.floor(Math.random() * 200) + 10,
              isPopular: Math.random() > 0.7,
              isNew: Math.random() > 0.85,
              originalPrice: Math.random() > 0.8 ? Math.floor(item.base_price * 1.2) : undefined,
              discount: Math.random() > 0.8 ? Math.floor(Math.random() * 20) + 10 : undefined,
            }));

            const mappedCategories: CategoryType[] = categoriesData.map((cat, index) => ({
              id: cat.id,
              name: cat.name,
              description: cat.description || '',
              order: index + 1,
              active: cat.is_active,
              icon: getCategoryIcon(cat.name),
              color: theme.palette.primary.main,
              // Note: API doesn't currently provide image field for categories
              // When API is updated to include image_url, uncomment the line below:
              // image: cat.image_url || '',
            }));

            setCategories(mappedCategories);
            setMenuItems(mappedMenuItems);
          } else {
            // Set empty arrays if no data found
            setCategories([]);
            setMenuItems([]);
          }
        } catch (menuError) {
          console.warn('Failed to load menu data from API:', menuError);
          // Set empty arrays for graceful fallback
          setCategories([]);
          setMenuItems([]);
        }

      } catch (err: any) {
        console.error('Error loading menu data:', err);
        setError(`Failed to load menu: ${err.message || 'Please try again.'}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [venueId, tableId]);

  // Helper function to get category icons
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('starter') || name.includes('appetizer')) return '🥗';
    if (name.includes('main') || name.includes('curry')) return '🍛';
    if (name.includes('dessert') || name.includes('sweet')) return '🍰';
    if (name.includes('drink') || name.includes('beverage')) return '🥤';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('burger')) return '🍔';
    if (name.includes('noodle') || name.includes('pasta')) return '🍜';
    if (name.includes('rice')) return '🍚';
    if (name.includes('bread') || name.includes('roti')) return '🍞';
    return '🍽️';
  };

  // Filter logic
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = vegFilter === VEG_FILTERS.ALL || 
                      (vegFilter === VEG_FILTERS.VEG && item.isVeg) || 
                      (vegFilter === VEG_FILTERS.NON_VEG && !item.isVeg);
    return matchesSearch && matchesVeg && item.isAvailable;
  });

  const groupedMenuItems = categories
    .map(category => ({
      ...category,
      items: filteredItems.filter(item => item.category === category.id)
    }))
    .filter(group => group.items.length > 0);

  // Set initial active category
  useEffect(() => {
    if (groupedMenuItems.length > 0 && !activeCategory) {
      setActiveCategory(groupedMenuItems[0].id);
    }
  }, [groupedMenuItems, activeCategory]);

  // Scroll-spy effect
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      if (isCategoryClickRef.current) return;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: isDesktop ? menuContainerRef.current : null,
      rootMargin: isDesktop ? SCROLL_SPY_OPTIONS.DESKTOP.rootMargin : SCROLL_SPY_OPTIONS.MOBILE.rootMargin,
    });

    const refs = categoryRefs.current;
    Object.values(refs).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => Object.values(refs).forEach(ref => {
      if (ref) observer.unobserve(ref);
    });
  }, [groupedMenuItems, isDesktop]);

  // Cart operations
  const getItemQuantityInCart = (itemId: string): number => {
    const cartItem = cartItems.find(item => item.menuItem.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: MenuItemType) => {
    const cartItem: MenuItem = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isVeg: item.isVeg || false,
      image: item.image || '',
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime,
      venueId: venueId || 'venue',
      ingredients: [],
      order: 0,
    };
    addItem(cartItem, 1);
    
    setShowCartAnimation(true);
    setTimeout(() => setShowCartAnimation(false), 300);
  };

  const handleRemoveFromCart = (itemId: string) => {
    const currentQuantity = getItemQuantityInCart(itemId);
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else {
      removeItem(itemId);
    }
  };

  const handleIncreaseQuantity = (itemId: string) => {
    const currentQuantity = getItemQuantityInCart(itemId);
    updateQuantity(itemId, currentQuantity + 1);
  };

  const handleCategoryClick = (categoryId: string) => {
    isCategoryClickRef.current = true;
    setActiveCategory(categoryId);
    categoryRefs.current[categoryId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    clearTimeout(categoryClickTimeoutRef.current);
    categoryClickTimeoutRef.current = setTimeout(() => {
      isCategoryClickRef.current = false;
    }, 1000);
  };

  const formatPrice = (price: number) => `₹${price}`;

  const getSpicyLevelIcon = (level: number) => {
    if (level === 0) return null;
    return (
      <Tooltip title={`Spice Level: ${level === 1 ? 'Mild' : level === 2 ? 'Medium' : 'Hot'}`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
          {[...Array(Math.min(level, 3))].map((_, i) => (
            <LocalFireDepartment 
              key={i} 
              sx={{ 
                fontSize: { xs: 12, sm: 14 }, 
                color: level === 1 ? '#FFA726' : level === 2 ? '#FF7043' : '#F44336',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
              }} 
            />
          ))}
        </Box>
      </Tooltip>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default,
        pt: { xs: '56px', sm: '64px' },
      }}>
        <CustomerNavbar 
          restaurantName="Loading..."
          tableId={tableId}
          showBackButton={false}
          showCart={false}
        />
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {[...Array(isDesktop ? 6 : 3)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: { xs: 140, sm: 320 } }}>
                  <Box sx={{ display: { xs: 'flex', sm: 'block' } }}>
                    <Skeleton 
                      variant="rectangular" 
                      sx={{
                        width: { xs: 140, sm: '100%' },
                        height: { xs: 140, sm: 180 }
                      }}
                    />
                    <CardContent sx={{ flex: { xs: 1, sm: 'none' } }}>
                      <Skeleton variant="text" height={24} />
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="text" height={20} width="60%" />
                    </CardContent>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pt: { xs: '56px', sm: '64px' },
        px: { xs: 2, sm: 3 }
      }}>
        <CustomerNavbar 
          restaurantName="Error"
          tableId={tableId}
          showBackButton={false}
          showCart={false}
        />
        <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center', width: '100%', maxWidth: 400 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Typography variant="h6" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Venue ID: {venueId}<br/>
            Table ID: {tableId}<br/>
            User Agent: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}<br/>
            Current URL: {window.location.href}
          </Typography>
          
          {/* Debug button */}
          <Button 
            variant="text" 
            size="small"
            onClick={testApiConnectivity}
            sx={{ mb: 2 }}
          >
            Test API Connection
          </Button>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ minWidth: 120 }}
            >
              Try Again
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
              sx={{ minWidth: 120 }}
            >
              Go Home
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: theme.palette.background.default,
      pb: getTotalItems() > 0 ? { xs: 10, sm: 8 } : 0,
      pt: { xs: '56px', sm: '64px' },
    }}>
      <CustomerNavbar 
        restaurantName={restaurant?.name || 'Menu'}
        tableId={tableName || tableId}
        showBackButton={false}
        showCart={false}
      />

      {/* Hero Section */}
      <Box sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        <Container maxWidth="lg" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 600,
              mb: 1,
              letterSpacing: '-0.01em'
            }}
          >
            {restaurant?.name}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              mb: 0.5
            }}
          >
            {restaurant?.cuisine_types?.join(' • ')}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              mb: 2
            }}
          >
            {restaurant?.location.address}, {restaurant?.location.city}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<Star sx={{ color: 'white !important', fontSize: 16 }} />}
              label={`${restaurant?.rating?.toFixed(1) || '4.2'}`}
              sx={{ 
                bgcolor: 'success.main', 
                color: 'white', 
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {restaurant?.total_reviews || 0}+ ratings
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {formatPrice((restaurant as any)?.average_cost_for_two || 500)} for two
            </Typography>
          </Stack>
        </Container>
      </Box>
      <Divider />

      <Box sx={{ 
        position: 'sticky', 
        top: 64, 
        zIndex: 10, 
        bgcolor: 'background.paper', 
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 2,
        boxShadow: 1,
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            {/* Search Section */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    '& fieldset': { 
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': { 
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
            </Grid>

            {/* Filter Buttons */}
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                gap: 0.5,
              }}>
                {/* All Button */}
                <Button
                  variant={vegFilter === VEG_FILTERS.ALL ? 'contained' : 'outlined'}
                  onClick={() => setVegFilter(VEG_FILTERS.ALL)}
                  size="small"
                  startIcon={<Restaurant sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                  sx={{
                    backgroundColor: vegFilter === VEG_FILTERS.ALL ? '#d0c6c6ff' : 'transparent',
                    borderColor: vegFilter === VEG_FILTERS.ALL ? "#d0c6c6ff" : theme.palette.divider,
                    color: vegFilter === VEG_FILTERS.ALL ? "#ffffffff" : theme.palette.text.secondary,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    minWidth: 'auto',
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.5, sm: 0.1 },
                    minHeight: { xs: 32, sm: 28 },
                    '&:hover': {
                      backgroundColor: vegFilter === VEG_FILTERS.ALL ? "#d0c6c6ff" : alpha(theme.palette.primary.main, 0.04),
                      borderColor: theme.palette.primary.main,
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  All
                </Button>

                {/* Veg Button */}
                <Button
                  variant={vegFilter === VEG_FILTERS.VEG ? 'contained' : 'outlined'}
                  onClick={() => setVegFilter(VEG_FILTERS.VEG)}
                  size="small"
                  startIcon={
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        border: '1px solid',
                        borderColor: vegFilter === VEG_FILTERS.VEG ? 'white' : '#4CAF50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: vegFilter === VEG_FILTERS.VEG ? 'white' : '#65a368ff',
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    backgroundColor: vegFilter === VEG_FILTERS.VEG ? '#65a368ff' : 'transparent',
                    borderColor: '#4CAF50',
                    color: vegFilter === VEG_FILTERS.VEG ? 'white' : '#65a368ff',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    minWidth: 'auto',
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.5, sm: 0.1 },
                    minHeight: { xs: 32, sm: 28 },
                    '&:hover': {
                      backgroundColor: vegFilter === VEG_FILTERS.VEG ? '#65a368ff' : 'rgba(76, 175, 80, 0.04)',
                      borderColor: '#4CAF50',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Veg
                </Button>

                {/* Non-Veg Button */}
                <Button
                  variant={vegFilter === VEG_FILTERS.NON_VEG ? 'contained' : 'outlined'}
                  onClick={() => setVegFilter(VEG_FILTERS.NON_VEG)}
                  size="small"
                  startIcon={
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        border: '1px solid',
                        borderColor: vegFilter === VEG_FILTERS.NON_VEG ? 'white' : '#b47c78ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: vegFilter === VEG_FILTERS.NON_VEG ? 'white' : '#b47c78ff',
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    backgroundColor: vegFilter === VEG_FILTERS.NON_VEG ? '#b47c78ff' : 'transparent',
                    borderColor: '#b47c78ff',
                    color: vegFilter === VEG_FILTERS.NON_VEG ? 'white' : '#b47c78ff',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    minWidth: 'auto',
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.5, sm: 0.1 },
                    minHeight: { xs: 32, sm: 28 },
                    '&:hover': {
                      backgroundColor: vegFilter === VEG_FILTERS.NON_VEG ? '#b47c78ff' : 'rgba(244, 67, 54, 0.04)',
                      borderColor: '#F44336',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Non-Veg
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Horizontal Category Scroll Section */}
      <Box sx={{ py: { xs: 1, sm: 1.5 }, borderBottom: '1px solid', borderColor: theme.palette.divider, overflow: 'visible', backgroundColor: theme.palette.background.paper }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 0 } }}>
          <Box
            sx={{
              display: 'flex',
              overflowX: 'auto',
              overflowY: 'visible',
              pb: 1,
              px: 1, // Add horizontal padding to the scroll container instead
              '&::-webkit-scrollbar': {
                height: 4,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 2,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.4)',
                },
              },
            }}
          >
            {groupedMenuItems.map((category) => {
              const isActive = activeCategory === category.id;
              
              // Get appropriate icon for category
              const getCategoryMuiIcon = (categoryName: string) => {
                const name = categoryName.toLowerCase();
                if (name.includes('starter') || name.includes('appetizer') || name.includes('salad')) return '🥗';
                if (name.includes('main') || name.includes('curry') || name.includes('rice')) return '🍛';
                if (name.includes('dessert') || name.includes('sweet') || name.includes('ice')) return '🍰';
                if (name.includes('drink') || name.includes('beverage') || name.includes('juice')) return '🥤';
                if (name.includes('pizza')) return '🍕';
                if (name.includes('burger')) return '🍔';
                if (name.includes('noodle') || name.includes('pasta') || name.includes('spaghetti')) return '🍜';
                if (name.includes('bread') || name.includes('roti') || name.includes('naan')) return '🍞';
                if (name.includes('soup')) return '🍲';
                if (name.includes('sandwich') || name.includes('wrap')) return '🥙';
                if (name.includes('chicken') || name.includes('meat')) return '🍗';
                if (name.includes('fish') || name.includes('seafood')) return '🐟';
                if (name.includes('snack') || name.includes('finger')) return '🍿';
                if (name.includes('coffee') || name.includes('tea')) return '☕';
                return '🍽️'; // Default food icon
              };

              return (
                <Box
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 'fit-content',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    px: { xs: 0.75, sm: 0.5 },
                    py: { xs: 0.75, sm: 0.5 },
                    minHeight: { xs: 44, sm: 'auto' }, // Touch target
                    '&:hover': {
                      transform: 'translateY(-3px)',
                    },
                    '&:active': {
                      transform: 'translateY(-1px) scale(0.98)',
                    },
                  }}
                >
                  {/* Category Image/Icon */}
                  <Box
                    sx={{
                      width: { xs: 44, sm: 48 },
                      height: { xs: 44, sm: 48 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? 'primary.main' : 'grey.100',
                      border: '2px solid',
                      borderColor: isActive ? 'primary.main' : 'transparent',
                      fontSize: { xs: '18px', sm: '20px' },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive ? '0 2px 8px rgba(25, 118, 210, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                      transformOrigin: 'center',
                      '&:hover': {
                        transform: { xs: 'scale(1.1)', sm: 'scale(1.2)' },
                        backgroundColor: isActive ? 'primary.dark' : 'grey.200',
                        boxShadow: isActive ? '0 6px 20px rgba(25, 118, 210, 0.4)' : '0 4px 16px rgba(0,0,0,0.2)',
                        zIndex: 10,
                      },
                    }}
                  >
                    {/* Use category image if available, otherwise use emoji icon */}
                    {category.image && category.image.trim() !== '' ? (
                      <Box
                        component="img"
                        src={category.image}
                        alt={category.name}
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.target as HTMLElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div style="filter: ${isActive ? 'grayscale(1) brightness(0) invert(1)' : 'none'}">${getCategoryMuiIcon(category.name)}</div>`;
                          }
                        }}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Box sx={{ filter: isActive ? 'grayscale(1) brightness(0) invert(1)' : 'none' }}>
                        {getCategoryMuiIcon(category.name)}
                      </Box>
                    )}
                  </Box>

                  {/* Category Name */}
                  <Typography
                    variant="caption"
                    sx={{
                      mt: { xs: 0.25, sm: 0.5 },
                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'primary.main' : theme.palette.text.secondary,
                      textAlign: 'center',
                      maxWidth: { xs: 50, sm: 60 },
                      lineHeight: 1.2,
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 0, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Left: Category List (Desktop) */}
          {isDesktop && (
            <Grid item md={4} lg={3}>
              <Box sx={{ position: 'sticky', top: 150 }}>
                <Typography variant="h6" sx={{ mb: 1, px: 2 }}>Categories</Typography>
                <List>
                  {groupedMenuItems.map(cat => (
                    <CategoryListItem
                      key={cat.id}
                      active={activeCategory === cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                    >
                      <ListItemText primary={cat.name} />
                      <Typography variant="body2" color="text.secondary">{cat.items.length}</Typography>
                    </CategoryListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          )}

          {/* Right: Menu */}
          <Grid item xs={12} md={8} lg={9}>
            {/* Menu Items List */}
            <Box ref={menuContainerRef} sx={{ height: isDesktop ? 'calc(100vh - 220px)' : 'auto', overflowY: isDesktop ? 'auto' : 'visible' }}>
              {groupedMenuItems.map((group, index) => (
                <Box
                  key={group.id}
                  id={group.id}
                  ref={(el: HTMLDivElement | null) => (categoryRefs.current[group.id] = el)}
                  sx={{ 
                    pt: 2, 
                    mt: -2,
                    animation: `${fadeInUp} 0.8s ease-out`,
                    '&:hover': {
                      '& h4': {
                        color: 'primary.main',
                        transition: 'color 0.3s ease',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      px: 3,
                      py: 1.5,
                      mb: 3,
                      mt: index === 0 ? 0 : (isDesktop ? 2 : 0),
                      mx: -3, // Extend beyond container padding
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    <Typography variant="h5" fontWeight="600" sx={{ color: theme.palette.primary.contrastText }}>
                      {group.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.primary.contrastText, fontWeight: 500 }}>
                      {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  {group.items.map((item, index) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      isLast={index === group.items.length - 1}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Old Search and Filters - to be removed */}
      {/* <Container maxWidth="lg" sx={{ mt: { xs: -4, sm: -6 }, position: 'relative', zIndex: 3 }}>
        <StyledSearchCard sx={{ mb: { xs: 3, sm: 4 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="Search for delicious dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.default, 0.5),
                      borderRadius: 2,
                      '& fieldset': { borderColor: alpha(theme.palette.divider, 0.3) },
                      '&:hover fieldset': { borderColor: theme.palette.primary.main },
                      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: 2 },
                      transition: 'all 0.3s ease',
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack 
                  direction="row" 
                  spacing={1} 
                  justifyContent={{ xs: 'center', md: 'flex-end' }}
                  sx={{ width: '100%' }}
                >
                  <Button
                    variant={vegFilter === 'all' ? 'contained' : 'outlined'}
                    onClick={() => setVegFilter('all')}
                    sx={{ 
                      textTransform: 'none', 
                      minWidth: { xs: 60, sm: 70 },
                      borderRadius: 2,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant={vegFilter === 'veg' ? 'contained' : 'outlined'}
                    onClick={() => setVegFilter('veg')}
                    sx={{ 
                      textTransform: 'none',
                      minWidth: { xs: 60, sm: 70 },
                      borderRadius: 2,
                      backgroundColor: vegFilter === 'veg' ? '#4CAF50' : 'transparent',
                      borderColor: '#4CAF50',
                      color: vegFilter === 'veg' ? 'white' : '#4CAF50',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 },
                      '&:hover': { 
                        backgroundColor: vegFilter === 'veg' ? '#43A047' : alpha('#4CAF50', 0.1),
                        borderColor: '#4CAF50',
                      }
                    }}
                    startIcon={
                      <Nature sx={{ fontSize: { xs: 14, sm: 16 } }} />
                    }
                  >
                    Veg
                  </Button>
                  <Button
                    variant={vegFilter === 'non-veg' ? 'contained' : 'outlined'}
                    onClick={() => setVegFilter('non-veg')}
                    sx={{ 
                      textTransform: 'none',
                      minWidth: { xs: 80, sm: 90 },
                      borderRadius: 2,
                      backgroundColor: vegFilter === 'non-veg' ? '#F44336' : 'transparent',
                      borderColor: '#F44336',
                      color: vegFilter === 'non-veg' ? 'white' : '#F44336',
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      px: { xs: 1, sm: 2 },
                      '&:hover': { 
                        backgroundColor: vegFilter === 'non-veg' ? '#E53935' : alpha('#F44336', 0.1),
                        borderColor: '#F44336',
                      }
                    }}
                  >
                    Non-Veg
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </StyledSearchCard>
      </Container> */}

        {/* Empty State */}
        {filteredItems.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Restaurant sx={{ fontSize: { xs: 60, sm: 80 }, color: theme.palette.text.disabled, mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
                No items found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, px: 2 }}>
                Try adjusting your search or filter criteria
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchQuery('');
                  setVegFilter(VEG_FILTERS.ALL);
                }}
              >
                Clear Filters
              </Button>
            </Box>
        )}

      {/* Cart Strip Spacer */}
      {getTotalItems() > 0 && (
        <Box sx={{ height: 80 }} /> /* Spacer for the cart strip */
      )}

      {getTotalItems() > 0 && (
          <StyledCartStrip
            elevation={0}
            sx={{
              transform: getTotalItems() > 0 ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: showCartAnimation ? 'cartBounce 0.6s ease-in-out' : `${cartFloat} 3s ease-in-out infinite`,
              '@keyframes cartBounce': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.02)' },
              },
            }}
          >
            <Box
              onClick={() => navigate(`/checkout/${venueId}/${tableId}`)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 2.5 },
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <ShoppingCart sx={{ fontSize: { xs: 20, sm: 24 } }} />
                <Typography 
                  variant="h6" 
                  fontWeight="700"
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    lineHeight: 1.2
                  }}
                >
                  {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} • {formatPrice(getTotalAmount())}
                </Typography>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9, 
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                View items in cart →
              </Typography>
            </Box>
          </StyledCartStrip>
      )}

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
          © 2024 Dino E-Menu. All rights reserved.
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

const MenuItemCard: React.FC<{ item: MenuItemType; isLast?: boolean }> = React.memo(({ item, isLast }) => {
  const { addItem, removeItem, updateQuantity, items: cartItems } = useCart();
  const quantityInCart = cartItems.find(cartItem => cartItem.menuItem.id === item.id)?.quantity || 0;
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleAddToCart = () => {
    const cartItem: MenuItem = {
      id: item.id, name: item.name, price: item.price, category: item.category,
      description: item.description, isVeg: item.isVeg || false, image: item.image,
      isAvailable: item.isAvailable, preparationTime: item.preparationTime,
      venueId: item.id, order: 0, ingredients: [], allergens: []
    };
    addItem(cartItem, 1);
  };

  const handleIncreaseQuantity = () => updateQuantity(item.id, quantityInCart + 1);
  const handleDecreaseQuantity = () => {
    if (quantityInCart > 1) {
      updateQuantity(item.id, quantityInCart - 1);
    } else {
      removeItem(item.id);
    }
  };

  // Veg/Non-veg icon component
  const VegNonVegIcon = ({ isVeg }: { isVeg: boolean }) => (
    <Box
      sx={{
        width: 20,
        height: 20,
        border: `2px solid ${isVeg ? '#4CAF50' : '#F44336'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: isVeg ? '50%' : 0,
          backgroundColor: isVeg ? '#4CAF50' : '#F44336',
          transform: isVeg ? 'none' : 'rotate(45deg)',
        }}
      />
    </Box>
  );

  // Description with see more functionality
  const shouldShowSeeMore = item.description.length > 50;
  const displayDescription = showFullDescription 
    ? item.description 
    : shouldShowSeeMore 
      ? `${item.description.substring(0, 50)}...` 
      : item.description;

  return (
    <Box sx={{
      animation: `${fadeInUp} 0.6s ease-out`,
      '&:hover': {
        transform: 'translateY(-2px)',
        transition: 'transform 0.3s ease',
      },
    }}>
      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ py: { xs: 2, sm: 2.5 } }}>
        {/* Left side: Item details */}
        <Grid item xs={8} sm={9}>
          <Stack spacing={1}>
            {/* Veg/Non-veg icon and dish name */}
            <Stack direction="row" spacing={1} alignItems="center">
              <VegNonVegIcon isVeg={item.isVeg || false} />
              <Typography 
                variant="h6" 
                component="h3" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: { xs: '1rem', sm: '1.1rem' }, 
                  lineHeight: 1.3,
                  color: 'text.primary'
                }}
              >
                {item.name}
              </Typography>
              {item.isPopular && (
                <Chip
                  icon={<Star sx={{ fontSize: 14 }} />}
                  label="Bestseller"
                  size="small"
                  sx={{
                    backgroundColor: 'warning.main',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    height: 20,
                    '& .MuiChip-icon': {
                      color: 'white',
                      fontSize: 12,
                    },
                  }}
                />
              )}
            </Stack>

            {/* Price */}
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                color: 'text.primary'
              }}
            >
              ₹{item.price}
            </Typography>

            {/* Rating (without review count) */}
            {item.rating && item.rating > 0 && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Rating value={item.rating} size="small" readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {item.rating}
                </Typography>
              </Stack>
            )}

            {/* Description with see more */}
            <Box>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  lineHeight: 1.4,
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  pr: 1
                }}
              >
                {displayDescription}
                {shouldShowSeeMore && (
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      cursor: 'pointer',
                      fontWeight: 500,
                      ml: 0.5,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? ' See less' : ' See more'}
                  </Typography>
                )}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Right side: Image and Add button */}
        <Grid item xs={4} sm={3}>
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 120, mx: 'auto' }}>
            {item.image ? (
              <CardMedia
                component="img"
                image={item.image}
                alt={item.name}
                sx={{ 
                  width: '100%', 
                  aspectRatio: '1 / 1', 
                  borderRadius: 2, 
                  objectFit: 'cover',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  borderRadius: 2,
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
              >
                <Restaurant 
                  sx={{ 
                    fontSize: { xs: 32, sm: 40 }, 
                    color: 'grey.400' 
                  }} 
                />
              </Box>
            )}
            <Box sx={{ 
                position: 'absolute', 
                bottom: -12, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: 'auto',
                minWidth: 80
            }}>
              {quantityInCart === 0 ? (
                <Zoom in={quantityInCart === 0}>
                  <Box
                    onClick={handleAddToCart}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'primary.main',
                      backdropFilter: 'blur(10px)',
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                      borderRadius: 1.5,
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      minWidth: 100,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold" sx={{ color: 'primary.main' }}>
                      ADD
                    </Typography>
                  </Box>
                </Zoom>
              ) : (
                <Zoom in={quantityInCart > 0}>
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'primary.main',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      minWidth: 100,
                      height: 36,
                      px: 0.5,
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={handleDecreaseQuantity}
                      sx={{ 
                        color: 'primary.main', 
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' },
                        width: 28,
                        height: 24,
                        p: 0
                      }}
                      aria-label="reduce quantity"
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      sx={{ 
                        color: 'primary.main',
                        minWidth: 24,
                        textAlign: 'center',
                        flex: 1
                      }}
                    >
                      {quantityInCart}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleIncreaseQuantity}
                      sx={{ 
                        color: 'primary.main', 
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' },
                        width: 28,
                        height: 24,
                        p: 0
                      }}
                      aria-label="increase quantity"
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </Zoom>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
      {!isLast && <Divider />}
    </Box>
  );
});

export default MenuPage;