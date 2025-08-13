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
  useMediaQuery,
  Stack,
  alpha,
  styled,
  CardMedia,
  InputAdornment,
  Avatar,
  Divider,
  Collapse,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Search,
  Star,
  Restaurant,
  LocalFireDepartment,
  LocationOn,
  Schedule,
  Favorite,
  FavoriteBorder,
  Whatshot,
  NewReleases,
  LocalOffer,
  Timer,
  TrendingUp,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  FilterList,
  Clear,
  Info,
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
import VenueNotAcceptingOrdersPage from '../components/VenueNotAcceptingOrdersPage';

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
  isTrending?: boolean;
  nutritionInfo?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  allergens?: string[];
  customizations?: string[];
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
  itemCount?: number;
}

// Constants
const VEG_FILTERS = {
  ALL: 'all',
  VEG: 'veg',
  NON_VEG: 'non-veg',
};

const SORT_OPTIONS = {
  POPULAR: 'popular',
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  RATING: 'rating',
  NAME: 'name',
};

// Clean styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 100%)`,
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  position: 'relative',
}));

const SearchCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: 0,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: theme.shadows[2],
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const CategoryChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 'fit-content',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  padding: theme.spacing(1.5),
  borderRadius: 0,
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  border: `1px solid ${active ? theme.palette.primary.main : 'transparent'}`,
  '&:hover': {
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.grey[100], 0.8),
    transform: 'translateY(-2px)',
  },
}));

const MenuItemCard = styled(Card)(({ theme }) => ({
  borderRadius: 0,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: theme.shadows[1],
  transition: 'all 0.2s ease-in-out',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
    '& .menu-item-image': {
      transform: 'scale(1.02)',
    },
  },
}));

const FloatingCartButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 1000,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    transform: 'scale(1.1)',
  },
}));

const MenuPage: React.FC = () => {
  const { venueId, tableId } = useParams<{ venueId: string; tableId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [venueNotAcceptingOrders, setVenueNotAcceptingOrders] = useState<{
    show: boolean;
    venueName?: string;
    venueStatus?: string;
    message?: string;
  }>({ show: false });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<string>(VEG_FILTERS.ALL);
  const [sortBy, setSortBy] = useState<string>(SORT_OPTIONS.POPULAR);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Refs
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // Desktop restriction check
  const isDesktopRestricted = useMediaQuery(theme.breakpoints.up('lg'));

  // Desktop restriction component
  const DesktopRestrictionOverlay = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: alpha('#000000', 0.8),
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        sx={{
          maxWidth: 480,
          p: 4,
          textAlign: 'center',
          borderRadius: 0,
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[24],
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              mx: 'auto',
              mb: 2,
            }}
          >
            <Restaurant sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
            Mobile Ordering Only
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            For the best dining experience, please use your mobile device to browse our menu and place orders.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 0,
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 48,
              borderRadius: 0,
              border: `2px solid ${theme.palette.primary.main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 24,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 0,
              }}
            />
          </Box>
          <Typography variant="body2" color="primary" fontWeight="500">
            Scan QR code or visit on mobile
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Need help? Ask your server for assistance
        </Typography>
      </Paper>
    </Box>
  );

  // Data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!venueId) {
          throw new Error('Venue ID is required');
        }

        // Validate venue access
        debugVenueAssignment(userData, user, 'MenuPage');
        
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

        // Load categories and menu items with validation
        try {
          const categoriesData = await menuService.getVenueCategories(venueId, tableId);
          const menuData = await menuService.getVenueMenuItems(venueId, undefined, tableId);

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
              isTrending: Math.random() > 0.8,
              originalPrice: Math.random() > 0.8 ? Math.floor(item.base_price * 1.2) : undefined,
              discount: Math.random() > 0.8 ? Math.floor(Math.random() * 20) + 10 : undefined,
              nutritionInfo: {
                protein: Math.floor(Math.random() * 30) + 5,
                carbs: Math.floor(Math.random() * 50) + 10,
                fat: Math.floor(Math.random() * 20) + 2,
              },
              allergens: Math.random() > 0.7 ? ['Nuts', 'Dairy'].slice(0, Math.floor(Math.random() * 2) + 1) : [],
              customizations: Math.random() > 0.6 ? ['Extra Spicy', 'Less Oil', 'No Onion'].slice(0, Math.floor(Math.random() * 3) + 1) : [],
            }));

            const mappedCategories: CategoryType[] = categoriesData.map((cat, index) => ({
              id: cat.id,
              name: cat.name,
              description: cat.description || '',
              order: index + 1,
              active: cat.is_active,
              icon: getCategoryIcon(cat.name),
              itemCount: mappedMenuItems.filter(item => item.category === cat.id).length,
            }));

            setCategories(mappedCategories);
            setMenuItems(mappedMenuItems);
          } else {
            setCategories([]);
            setMenuItems([]);
          }
        } catch (menuError: any) {
          console.warn('Failed to load menu data from API:', menuError);
          
          // Check if it's a venue not accepting orders error
          if (menuError.type === 'venue_not_accepting_orders') {
            setVenueNotAcceptingOrders({
              show: true,
              venueName: menuError.venueName,
              message: menuError.message
            });
            return; // Don't set error, show the special page instead
          }
          
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

  // Helper functions
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

  const sortMenuItems = (items: MenuItemType[]) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case SORT_OPTIONS.POPULAR:
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || (b.rating || 0) - (a.rating || 0);
        case SORT_OPTIONS.PRICE_LOW:
          return a.price - b.price;
        case SORT_OPTIONS.PRICE_HIGH:
          return b.price - a.price;
        case SORT_OPTIONS.RATING:
          return (b.rating || 0) - (a.rating || 0);
        case SORT_OPTIONS.NAME:
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  // Filter and sort logic
  const filteredItems = sortMenuItems(
    menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVeg = vegFilter === VEG_FILTERS.ALL || 
                        (vegFilter === VEG_FILTERS.VEG && item.isVeg) || 
                        (vegFilter === VEG_FILTERS.NON_VEG && !item.isVeg);
      return matchesSearch && matchesVeg && item.isAvailable;
    })
  );

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
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setTimeout(() => {
      const element = categoryRefs.current[categoryId];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setVegFilter(VEG_FILTERS.ALL);
    setSortBy(SORT_OPTIONS.POPULAR);
  };

  const formatPrice = (price: number) => `₹${price}`;

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
        
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 0, mb: 3 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 0, mb: 3 }} />
          
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: 320 }}>
                  <Skeleton variant="rectangular" height={180} />
                  <CardContent>
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" height={20} width="60%" />
                    <Skeleton variant="text" height={20} width="40%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  // Venue not accepting orders state
  if (venueNotAcceptingOrders.show) {
    return (
      <VenueNotAcceptingOrdersPage
        venueName={venueNotAcceptingOrders.venueName}
        venueStatus={venueNotAcceptingOrders.venueStatus}
        message={venueNotAcceptingOrders.message}
        onRetry={() => {
          setVenueNotAcceptingOrders({ show: false });
          window.location.reload();
        }}
        showRetry={true}
      />
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
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500 }}>
          <Restaurant sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="600">
            Oops! Something went wrong
          </Typography>
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            {error}
          </Alert>
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
    <Box 
      ref={menuContainerRef}
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: theme.palette.background.default,
        pb: getTotalItems() > 0 ? { xs: 10, sm: 8 } : 0,
        pt: { xs: '56px', sm: '64px' },
        position: 'relative',
      }}>
      <CustomerNavbar 
        restaurantName={restaurant?.name || 'Menu'}
        tableId={tableName || tableId}
        showBackButton={false}
        showCart={true}
      />

      {/* Clean Hero Section */}
      <HeroSection sx={{ py: { xs: 3, md: 4 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                mb: 1,
                color: theme.palette.text.primary,
              }}
            >
              {restaurant?.name}
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {restaurant?.cuisine_types?.join(' • ')} • Table {tableName || tableId}
            </Typography>

            <Stack direction="row" spacing={3} justifyContent="center" alignItems="center" flexWrap="wrap">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ color: '#FFB400', fontSize: 18 }} />
                <Typography variant="body2" fontWeight="500">
                  {restaurant?.rating?.toFixed(1) || '4.2'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({restaurant?.total_reviews || 0}+ reviews)
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {restaurant?.location.city}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  25-30 min
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Container>
      </HeroSection>

      {/* Search and Filters */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 2 }}>
        <SearchCard>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Button
                    variant={vegFilter === VEG_FILTERS.ALL ? 'contained' : 'outlined'}
                    onClick={() => setVegFilter(VEG_FILTERS.ALL)}
                    size="small"
                    sx={{ minWidth: 60 }}
                  >
                    All
                  </Button>
                  
                  <Button
                    variant={vegFilter === VEG_FILTERS.VEG ? 'contained' : 'outlined'}
                    onClick={() => setVegFilter(VEG_FILTERS.VEG)}
                    size="small"
                    startIcon={
                      <Box sx={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        backgroundColor: '#4CAF50',
                      }} />
                    }
                    sx={{ 
                      minWidth: 60,
                      color: vegFilter === VEG_FILTERS.VEG ? 'white' : '#4CAF50',
                      borderColor: '#4CAF50',
                      backgroundColor: vegFilter === VEG_FILTERS.VEG ? '#4CAF50' : 'transparent',
                      '&:hover': { 
                        backgroundColor: vegFilter === VEG_FILTERS.VEG ? '#43A047' : alpha('#4CAF50', 0.08),
                        borderColor: '#4CAF50',
                      }
                    }}
                  >
                    Veg
                  </Button>
                  
                  <Button
                    variant={vegFilter === VEG_FILTERS.NON_VEG ? 'contained' : 'outlined'}
                    onClick={() => setVegFilter(VEG_FILTERS.NON_VEG)}
                    size="small"
                    startIcon={
                      <Box sx={{ 
                        width: 6, 
                        height: 6, 
                        backgroundColor: '#F44336',
                      }} />
                    }
                    sx={{ 
                      minWidth: 80,
                      color: vegFilter === VEG_FILTERS.NON_VEG ? 'white' : '#F44336',
                      borderColor: '#F44336',
                      backgroundColor: vegFilter === VEG_FILTERS.NON_VEG ? '#F44336' : 'transparent',
                      '&:hover': { 
                        backgroundColor: vegFilter === VEG_FILTERS.NON_VEG ? '#E53935' : alpha('#F44336', 0.08),
                        borderColor: '#F44336',
                      }
                    }}
                  >
                    Non-Veg
                  </Button>

                  <IconButton 
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ 
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 0,
                    }}
                  >
                    <FilterList />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>

            {/* Advanced Filters */}
            <Collapse in={showFilters}>
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.grey[200]}` }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Sort by:
                  </Typography>
                  {Object.entries({
                    [SORT_OPTIONS.POPULAR]: 'Popular',
                    [SORT_OPTIONS.PRICE_LOW]: 'Price ↑',
                    [SORT_OPTIONS.PRICE_HIGH]: 'Price ↓',
                    [SORT_OPTIONS.RATING]: 'Rating',
                    [SORT_OPTIONS.NAME]: 'Name',
                  }).map(([value, label]) => (
                    <Chip
                      key={value}
                      label={label}
                      onClick={() => setSortBy(value)}
                      variant={sortBy === value ? 'filled' : 'outlined'}
                      size="small"
                      color={sortBy === value ? 'primary' : 'default'}
                    />
                  ))}
                  
                  {(searchQuery || vegFilter !== VEG_FILTERS.ALL || sortBy !== SORT_OPTIONS.POPULAR) && (
                    <Button
                      size="small"
                      onClick={clearFilters}
                      startIcon={<Clear />}
                      sx={{ ml: 2 }}
                    >
                      Clear
                    </Button>
                  )}
                </Stack>
              </Box>
            </Collapse>
          </CardContent>
        </SearchCard>
      </Container>

      {/* Category Navigation */}
      <Box sx={{ 
        py: 2, 
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
        backgroundColor: theme.palette.background.paper,
        position: 'sticky',
        top: 64,
        zIndex: 10,
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: 'flex',
            overflowX: 'auto',
            gap: 2,
            pb: 1,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-track': { backgroundColor: theme.palette.grey[100] },
            '&::-webkit-scrollbar-thumb': { 
              backgroundColor: theme.palette.grey[400],
              borderRadius: 0,
            },
          }}>
            {groupedMenuItems.map((category) => (
              <CategoryChip
                key={category.id}
                active={activeCategory === category.id}
                onClick={() => handleCategoryClick(category.id)}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: activeCategory === category.id ? 'primary.main' : 'grey.100',
                    color: activeCategory === category.id ? 'white' : 'text.secondary',
                    fontSize: '1.2rem',
                    mb: 1,
                  }}
                >
                  {category.icon}
                </Avatar>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: activeCategory === category.id ? 600 : 500,
                    color: activeCategory === category.id ? 'primary.main' : 'text.secondary',
                    textAlign: 'center',
                    maxWidth: 60,
                    lineHeight: 1.2,
                  }}
                >
                  {category.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    color: 'text.disabled',
                    mt: 0.5,
                  }}
                >
                  {category.itemCount} items
                </Typography>
              </CategoryChip>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Menu Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {groupedMenuItems.map((group) => (
          <Box
            key={group.id}
            id={group.id}
            ref={(el: HTMLDivElement | null) => (categoryRefs.current[group.id] = el)}
            sx={{ mb: 4 }}
          >
            {/* Category Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                {group.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {group.description || `Discover our delicious ${group.name.toLowerCase()}`}
              </Typography>
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Menu Items Grid */}
            <Grid container spacing={3}>
              {group.items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <EnhancedMenuItemCard 
                    item={item} 
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.has(item.id)}
                    quantityInCart={getItemQuantityInCart(item.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Restaurant sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="500">
              No items found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
              We couldn't find any dishes matching your criteria. Try adjusting your search or filters.
            </Typography>
            <Button 
              variant="contained" 
              onClick={clearFilters}
              sx={{ px: 4, py: 1.5 }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Container>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && !isMobile && (
        <Tooltip title="View Cart">
          <FloatingCartButton
            onClick={() => navigate(`/checkout/${venueId}/${tableId}`)}
          >
            <Badge badgeContent={getTotalItems()} color="error">
              <ShoppingCart />
            </Badge>
          </FloatingCartButton>
        </Tooltip>
      )}

      {/* Desktop Restriction Overlay */}
      {isDesktopRestricted && <DesktopRestrictionOverlay />}
    </Box>
  );
};

// Enhanced Menu Item Card Component
const EnhancedMenuItemCard: React.FC<{
  item: MenuItemType;
  onAddToCart: (item: MenuItemType) => void;
  onToggleFavorite: (itemId: string) => void;
  isFavorite: boolean;
  quantityInCart: number;
}> = React.memo(({ item, onAddToCart, onToggleFavorite, isFavorite, quantityInCart }) => {
  const { updateQuantity, removeItem } = useCart();
  const theme = useTheme();

  const handleIncreaseQuantity = () => updateQuantity(item.id, quantityInCart + 1);
  const handleDecreaseQuantity = () => {
    if (quantityInCart > 1) {
      updateQuantity(item.id, quantityInCart - 1);
    } else {
      removeItem(item.id);
    }
  };

  const VegNonVegIcon = ({ isVeg }: { isVeg: boolean }) => (
    <Box
      sx={{
        width: 14,
        height: 14,
        border: `2px solid ${isVeg ? '#4CAF50' : '#F44336'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: isVeg ? '50%' : 0,
          backgroundColor: isVeg ? '#4CAF50' : '#F44336',
        }}
      />
    </Box>
  );

  return (
    <MenuItemCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Image Section */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {item.image ? (
          <CardMedia
            component="img"
            image={item.image}
            alt={item.name}
            className="menu-item-image"
            sx={{ 
              height: 180, 
              objectFit: 'cover',
              transition: 'transform 0.2s ease',
            }}
          />
        ) : (
          <Box
            sx={{
              height: 180,
              backgroundColor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Restaurant sx={{ fontSize: 48, color: 'grey.400' }} />
          </Box>
        )}

        {/* Badges */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {item.isNew && (
            <Chip
              icon={<NewReleases sx={{ fontSize: 12 }} />}
              label="New"
              size="small"
              sx={{ 
                backgroundColor: theme.palette.success.main, 
                color: 'white', 
                fontWeight: 500,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          )}
          {item.isPopular && (
            <Chip
              icon={<Whatshot sx={{ fontSize: 12 }} />}
              label="Popular"
              size="small"
              sx={{ 
                backgroundColor: theme.palette.warning.main, 
                color: 'white', 
                fontWeight: 500,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          )}
          {item.discount && (
            <Chip
              icon={<LocalOffer sx={{ fontSize: 12 }} />}
              label={`${item.discount}% OFF`}
              size="small"
              sx={{ 
                backgroundColor: theme.palette.error.main, 
                color: 'white', 
                fontWeight: 500,
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          )}
        </Box>

        {/* Favorite Button */}
        <IconButton
          onClick={() => onToggleFavorite(item.id)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
            },
            width: 32,
            height: 32,
          }}
        >
          {isFavorite ? (
            <Favorite sx={{ color: theme.palette.error.main, fontSize: 18 }} />
          ) : (
            <FavoriteBorder sx={{ color: 'text.secondary', fontSize: 18 }} />
          )}
        </IconButton>

        {/* Preparation Time */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: alpha(theme.palette.common.black, 0.7),
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Timer sx={{ fontSize: 12 }} />
          <Typography variant="caption" fontWeight="500">
            {item.preparationTime} min
          </Typography>
        </Box>
      </Box>

      {/* Content Section */}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Header */}
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
          <VegNonVegIcon isVeg={item.isVeg || false} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              fontSize: '1rem',
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {item.name}
          </Typography>
        </Stack>

        {/* Rating */}
        {item.rating && (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Rating value={item.rating} size="small" readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary">
              {item.rating} ({item.reviewCount})
            </Typography>
          </Stack>
        )}

        {/* Price */}
        <Box sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight="600" color="primary.main">
              ₹{item.price}
            </Typography>
            {item.originalPrice && (
              <Typography 
                variant="body2" 
                sx={{ 
                  textDecoration: 'line-through',
                  color: 'text.disabled',
                }}
              >
                ₹{item.originalPrice}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {item.description}
        </Typography>

        {/* Spicy Level */}
        {item.spicyLevel && item.spicyLevel > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {[...Array(Math.min(item.spicyLevel, 3))].map((_, i) => (
                <LocalFireDepartment 
                  key={i} 
                  sx={{ 
                    fontSize: 12, 
                    color: item.spicyLevel === 1 ? '#FFA726' : item.spicyLevel === 2 ? '#FF7043' : '#F44336',
                  }} 
                />
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                {item.spicyLevel === 1 ? 'Mild' : item.spicyLevel === 2 ? 'Medium' : 'Hot'}
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Add to Cart Button */}
        <Box sx={{ mt: 'auto' }}>
          {quantityInCart === 0 ? (
            <Button
              fullWidth
              variant="contained"
              onClick={() => onAddToCart(item)}
              sx={{
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Add to Cart
            </Button>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderRadius: 0,
                p: 1,
                border: `1px solid ${theme.palette.primary.main}`,
              }}
            >
              <IconButton
                size="small"
                onClick={handleDecreaseQuantity}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                <Remove />
              </IconButton>
              
              <Typography variant="h6" fontWeight="600" color="primary.main">
                {quantityInCart}
              </Typography>
              
              <IconButton
                size="small"
                onClick={handleIncreaseQuantity}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                <Add />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </MenuItemCard>
  );
});

export default MenuPage;