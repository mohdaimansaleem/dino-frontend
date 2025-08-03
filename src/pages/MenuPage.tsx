import React, { useState, useEffect } from 'react';
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
  Collapse,
  Alert,
  Skeleton,
  Fade,
  Badge,
  Avatar,
  Tooltip,
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
  ExpandMore,
  ExpandLess,

  InfoOutlined,
  LocalFireDepartment,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { MenuItem } from '../types';
import CustomerNavbar from '../components/CustomerNavbar';
import { apiService } from '../services/api';
import { menuService } from '../services/menuService';

// Menu item interfaces
interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  featured: boolean;
  allergens: string[];
  preparationTime: number;
  calories?: number;
  spicyLevel?: number;
  isVeg?: boolean;
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
  discount?: number;
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
}

interface RestaurantInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  cuisine: string[];
  openTime: string;
  closeTime: string;
  deliveryTime: string;
  minimumOrder: number;
}

const MenuPage: React.FC = () => {
  const { cafeId, tableId } = useParams<{ cafeId: string; tableId: string }>();
  const navigate = useNavigate();
  const { addItem, removeItem, updateQuantity, items: cartItems, getTotalItems, getTotalAmount } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        if (!cafeId) {
          throw new Error('Cafe ID is required');
        }

        // Load restaurant data from API
        const restaurantResponse = await apiService.get<any>(`/venues/${cafeId}`);
        if (!restaurantResponse.success) {
          throw new Error(restaurantResponse.message || 'Failed to load restaurant data');
        }
        
        // Map venue data to restaurant info
        const venueData = restaurantResponse.data;
        const mappedRestaurant: RestaurantInfo = {
          id: venueData.id,
          name: venueData.name,
          description: venueData.description || 'Delicious food and great service',
          address: venueData.location?.address || '',
          phone: venueData.phone,
          rating: venueData.rating || 4.5,
          reviewCount: venueData.total_reviews || 0,
          cuisine: venueData.cuisine_types || ['Restaurant'],
          openTime: '11:00 AM',
          closeTime: '11:00 PM',
          deliveryTime: '15-20 mins',
          minimumOrder: 100,
        };
        
        // Load categories from API
        const categoriesData = await menuService.getMenuCategories({ venue_id: cafeId });
        
        // Load menu items from API
        const menuData = await menuService.getMenuItems({ venue_id: cafeId, is_available: true });

        // Map API data to component interfaces
        const mappedMenuItems: MenuItemType[] = menuData.data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.base_price,
          category: item.category_id,
          image: item.image_urls?.[0] || undefined,
          available: item.is_available,
          featured: false, // This would come from API if available
          allergens: [], // This would come from API if available
          preparationTime: item.preparation_time_minutes || 15,
          calories: 0, // This would come from API if available
          spicyLevel: 0, // This would come from API if available
          isVeg: item.is_vegetarian || false,
          rating: 4.5, // This would come from API if available
          reviewCount: 0, // This would come from API if available
          isPopular: false, // This would come from API if available
          isNew: false, // This would come from API if available
        }));

        const mappedCategories: CategoryType[] = categoriesData.data.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          order: index + 1,
          active: cat.is_active,
          icon: '🍽️', // Default icon, could be customized
          color: '#1976D2', // Default color, could be customized
        }));

        setRestaurant(mappedRestaurant);
        setCategories(mappedCategories);
        setMenuItems(mappedMenuItems);
        
        // Auto-expand first category if available
        if (categoriesData.data.length > 0) {
          setExpandedCategories(new Set([categoriesData.data[0].id]));
        }
      } catch (err: any) {
        setError('Failed to load menu. Please try again.');
        } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cafeId]);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = vegFilter === 'all' || 
                      (vegFilter === 'veg' && item.isVeg) || 
                      (vegFilter === 'non-veg' && !item.isVeg);
    
    return matchesSearch && matchesVeg && item.available;
  });

  const groupedItems = categories.reduce((acc, category) => {
    const categoryItems = filteredItems.filter(item => item.category === category.id);
    if (categoryItems.length > 0) {
      acc[category.id] = {
        category,
        items: categoryItems,
      };
    }
    return acc;
  }, {} as Record<string, { category: CategoryType; items: MenuItemType[] }>);

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
      image: item.image,
      isAvailable: item.available,
      preparationTime: item.preparationTime,
      ingredients: [],
      allergens: item.allergens,
      cafeId: cafeId || 'dino-cafe',
      order: 0,
    };
    addItem(cartItem, 1);
    
    // Trigger cart animation
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

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const formatPrice = (price: number) => `₹${price}`;

  const getSpicyLevelIcon = (level: number) => {
    if (level === 0) return null;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
        {[...Array(level)].map((_, i) => (
          <LocalFireDepartment 
            key={i} 
            sx={{ 
              fontSize: 12, 
              color: level === 1 ? '#FFA726' : level === 2 ? '#FF7043' : '#F44336' 
            }} 
          />
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#F8F9FA'
      }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          {/* Search skeleton */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 1,
              backgroundColor: 'white',
              border: '1px solid #E0E0E0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1, mb: 2 }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
          </Paper>

          {/* Categories skeleton */}
          {[...Array(3)].map((_, index) => (
            <Paper 
              key={index} 
              elevation={1} 
              sx={{ 
                mb: 3, 
                borderRadius: 1, 
                overflow: 'hidden',
                backgroundColor: 'white',
                border: '1px solid #E0E0E0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box sx={{ p: 2.5, backgroundColor: '#FAFAFA' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box>
                    <Skeleton variant="text" width={150} height={24} />
                    <Skeleton variant="text" width={200} height={18} />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                {[...Array(2)].map((_, itemIndex) => (
                  <Card 
                    key={itemIndex} 
                    sx={{ 
                      mb: 2, 
                      borderRadius: 1, 
                      border: '1px solid #E0E0E0', 
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      '&:last-child': { mb: 0 }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Skeleton variant="rectangular" width={100} height={100} sx={{ borderRadius: 1 }} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="70%" height={20} />
                          <Skeleton variant="text" width="40%" height={16} sx={{ mt: 1 }} />
                          <Skeleton variant="text" width="90%" height={14} sx={{ mt: 1 }} />
                          <Skeleton variant="text" width="60%" height={14} sx={{ mt: 1 }} />
                          <Skeleton variant="rectangular" width={100} height={36} sx={{ mt: 2, borderRadius: 1 }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          ))}
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'white',
      pb: getTotalItems() > 0 ? 10 : 0 
    }}>
      {/* Customer Navbar */}
      <CustomerNavbar 
        restaurantName={restaurant?.name}
        tableId={tableId}
        showBackButton={false}
        showCart={true}
        onCartClick={() => navigate(`/checkout/${cafeId}/${tableId}`)}
      />

      {/* Hero Food Banner */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 200, md: 280 },
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(21, 101, 192, 0.9) 100%), url("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=400&fit=crop") center/cover',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Table Number Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                px: 2,
                py: 1,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography
                variant="body1"
                fontWeight="bold"
                sx={{
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  fontSize: '0.875rem',
                }}
              >
                Table {tableId}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ maxWidth: { xs: '100%', md: '60%' } }}>
            <Typography 
              variant="h3" 
              fontWeight="700" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                mb: 2
              }}
            >
              Welcome to {restaurant?.name}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: { xs: '1rem', md: '1.25rem' },
                opacity: 0.95,
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                mb: 3,
                lineHeight: 1.4
              }}
            >
              {restaurant?.description}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3,
              flexWrap: 'wrap'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                <Typography variant="body1" fontWeight="600">
                  {restaurant?.rating} ({restaurant?.reviewCount}+ reviews)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 18 }} />
                <Typography variant="body1">
                  {restaurant?.deliveryTime}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
        
        {/* Decorative overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: 'url("https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop") center/cover',
            opacity: 0.3,
            display: { xs: 'none', md: 'block' }
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Search and Filters */}
        <Fade in timeout={600}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2.5, 
              mb: 3, 
              borderRadius: 2,
              backgroundColor: 'white',
              border: '1px solid #E0E0E0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="Search for delicious dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                      '& input': {
                        color: '#1a1a1a !important',
                        fontSize: '1rem',
                        fontWeight: 400,
                        '&::placeholder': {
                          color: '#666666 !important',
                          opacity: 1,
                        },
                      },
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1976D2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                        borderWidth: '2px',
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                      },
                    }
                  }}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Button
                    variant={vegFilter === 'all' ? 'contained' : 'outlined'}
                    size="medium"
                    onClick={() => setVegFilter('all')}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 1,
                      fontSize: '0.875rem',
                      borderRadius: 1,
                      textTransform: 'none',
                    }}
                  >
                    All
                  </Button>
                  <Button
                    variant={vegFilter === 'veg' ? 'contained' : 'outlined'}
                    size="medium"
                    onClick={() => setVegFilter('veg')}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 1,
                      fontSize: '0.875rem',
                      borderRadius: 1,
                      textTransform: 'none',
                      color: vegFilter === 'veg' ? 'white' : '#388E3C',
                      backgroundColor: vegFilter === 'veg' ? '#388E3C' : 'transparent',
                      borderColor: '#388E3C',
                      '&:hover': {
                        backgroundColor: vegFilter === 'veg' ? '#2E7D32' : 'rgba(56, 142, 60, 0.1)',
                        borderColor: '#388E3C',
                      },
                    }}
                    startIcon={
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          border: '1.5px solid',
                          borderColor: vegFilter === 'veg' ? 'white' : '#388E3C',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            backgroundColor: vegFilter === 'veg' ? 'white' : '#388E3C',
                            borderRadius: '50%',
                          }}
                        />
                      </Box>
                    }
                  >
                    Veg
                  </Button>
                  <Button
                    variant={vegFilter === 'non-veg' ? 'contained' : 'outlined'}
                    size="medium"
                    onClick={() => setVegFilter('non-veg')}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 1,
                      fontSize: '0.875rem',
                      borderRadius: 1,
                      textTransform: 'none',
                      color: vegFilter === 'non-veg' ? 'white' : '#D32F2F',
                      backgroundColor: vegFilter === 'non-veg' ? '#D32F2F' : 'transparent',
                      borderColor: '#D32F2F',
                      '&:hover': {
                        backgroundColor: vegFilter === 'non-veg' ? '#C62828' : 'rgba(211, 47, 47, 0.1)',
                        borderColor: '#D32F2F',
                      },
                    }}
                    startIcon={
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          border: '1.5px solid',
                          borderColor: vegFilter === 'non-veg' ? 'white' : '#D32F2F',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            backgroundColor: vegFilter === 'non-veg' ? 'white' : '#D32F2F',
                            borderRadius: '50%',
                          }}
                        />
                      </Box>
                    }
                  >
                    Non-Veg
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Enhanced Menu Categories */}
        {Object.entries(groupedItems).map(([categoryId, { category, items }], index) => (
          <Fade in timeout={800 + (index * 200)} key={categoryId}>
            <Paper 
              elevation={1} 
              sx={{ 
                mb: 3, 
                borderRadius: 1, 
                overflow: 'hidden',
                backgroundColor: 'white',
                border: '1px solid #E0E0E0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  backgroundColor: '#FAFAFA',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #E0E0E0',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#F5F5F5',
                  }
                }}
                onClick={() => toggleCategoryExpansion(categoryId)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      backgroundColor: category.color,
                      width: 40, 
                      height: 40,
                      fontSize: '1.2rem',
                    }}
                  >
                    {category.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {category.description} • {items.length} items
                    </Typography>
                  </Box>
                </Box>
                {expandedCategories.has(categoryId) ? <ExpandLess /> : <ExpandMore />}
              </Box>
              
              <Collapse in={expandedCategories.has(categoryId)}>
                <Box sx={{ p: 2 }}>
                  {items.map((item) => {
                    const quantityInCart = getItemQuantityInCart(item.id);
                    return (
                      <Card
                        key={item.id}
                        sx={{
                          mb: 2,
                          borderRadius: 1,
                          border: '1px solid #E0E0E0',
                          backgroundColor: 'white',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          '&:last-child': { mb: 0 },
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            borderColor: '#BDBDBD',
                          },
                          transition: 'all 0.2s ease',
                          overflow: 'hidden',
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Enhanced Item Image */}
                            {item.image && (
                              <Box
                                sx={{
                                  position: 'relative',
                                  flexShrink: 0,
                                  width: 100,
                                  height: 100,
                                }}
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                  }}
                                />
                                {/* Badges */}
                                {item.isNew && (
                                  <Chip
                                    label="NEW"
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      left: 4,
                                      backgroundColor: '#FF5722',
                                      color: 'white',
                                      fontSize: '0.6rem',
                                      height: 18,
                                      '& .MuiChip-label': { px: 0.5 }
                                    }}
                                  />
                                )}
                                {item.isPopular && (
                                  <Chip
                                    label="POPULAR"
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: item.isNew ? 26 : 4,
                                      left: 4,
                                      backgroundColor: '#FF9800',
                                      color: 'white',
                                      fontSize: '0.6rem',
                                      height: 18,
                                      '& .MuiChip-label': { px: 0.5 }
                                    }}
                                  />
                                )}
                              </Box>
                            )}

                            {/* Item Details */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography 
                                      variant="h6" 
                                      fontWeight="600" 
                                      sx={{ 
                                        fontSize: '1.1rem',
                                        lineHeight: 1.2,
                                        color: '#1a1a1a'
                                      }}
                                    >
                                      {item.name}
                                    </Typography>
                                    
                                    {/* Veg/Non-veg indicator */}
                                    <Box
                                      sx={{
                                        width: 14,
                                        height: 14,
                                        border: '1.5px solid',
                                        borderColor: item.isVeg ? '#388E3C' : '#D32F2F',
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
                                          backgroundColor: item.isVeg ? '#388E3C' : '#D32F2F',
                                          borderRadius: '50%',
                                        }}
                                      />
                                    </Box>

                                    {/* Spicy level */}
                                    {getSpicyLevelIcon(item.spicyLevel || 0)}
                                  </Box>

                                  {/* Rating */}
                                  {item.rating && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                      <Star sx={{ fontSize: 14, color: '#FFD700' }} />
                                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                                        {item.rating} ({item.reviewCount || 0})
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>

                                {/* Price */}
                                <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 2 }}>
                                  {item.originalPrice && item.originalPrice > item.price && (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        textDecoration: 'line-through', 
                                        color: '#999',
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      {formatPrice(item.originalPrice)}
                                    </Typography>
                                  )}
                                  <Typography 
                                    variant="h6" 
                                    fontWeight="700" 
                                    sx={{ 
                                      color: '#1976D2',
                                      fontSize: '1.1rem'
                                    }}
                                  >
                                    {formatPrice(item.price)}
                                  </Typography>
                                  {item.discount && (
                                    <Chip
                                      label={`${item.discount}% OFF`}
                                      size="small"
                                      sx={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        fontSize: '0.6rem',
                                        height: 16,
                                        mt: 0.5,
                                        '& .MuiChip-label': { px: 0.5 }
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>

                              {/* Description */}
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 1.5,
                                  fontSize: '0.875rem',
                                  lineHeight: 1.4,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {item.description}
                              </Typography>

                              {/* Additional Info */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <AccessTime sx={{ fontSize: 14, color: '#666' }} />
                                  <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                                    {item.preparationTime} mins
                                  </Typography>
                                </Box>
                                
                                {item.calories && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#666' }}>
                                      {item.calories} cal
                                    </Typography>
                                  </Box>
                                )}

                                {item.allergens && item.allergens.length > 0 && (
                                  <Tooltip title={`Contains: ${item.allergens.join(', ')}`}>
                                    <InfoOutlined sx={{ fontSize: 14, color: '#FF9800' }} />
                                  </Tooltip>
                                )}
                              </Box>

                              {/* Add to Cart Controls */}
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {item.allergens?.slice(0, 2).map((allergen) => (
                                    <Chip
                                      key={allergen}
                                      label={allergen}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        fontSize: '0.6rem',
                                        height: 20,
                                        borderColor: '#E0E0E0',
                                        color: '#666',
                                        '& .MuiChip-label': { px: 0.5 }
                                      }}
                                    />
                                  ))}
                                  {item.allergens && item.allergens.length > 2 && (
                                    <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#999', alignSelf: 'center' }}>
                                      +{item.allergens.length - 2} more
                                    </Typography>
                                  )}
                                </Box>

                                {quantityInCart === 0 ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleAddToCart(item)}
                                    sx={{
                                      minWidth: 'auto',
                                      px: 2,
                                      py: 0.5,
                                      fontSize: '0.875rem',
                                      borderRadius: 1,
                                      textTransform: 'none',
                                      backgroundColor: '#1976D2',
                                      '&:hover': {
                                        backgroundColor: '#1565C0',
                                      },
                                    }}
                                    startIcon={<Add sx={{ fontSize: 16 }} />}
                                  >
                                    Add
                                  </Button>
                                ) : (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveFromCart(item.id)}
                                      sx={{
                                        backgroundColor: '#f5f5f5',
                                        '&:hover': { backgroundColor: '#e0e0e0' },
                                        width: 28,
                                        height: 28,
                                      }}
                                    >
                                      <Remove sx={{ fontSize: 16 }} />
                                    </IconButton>
                                    <Typography 
                                      variant="body1" 
                                      fontWeight="600" 
                                      sx={{ 
                                        minWidth: 20, 
                                        textAlign: 'center',
                                        fontSize: '0.9rem'
                                      }}
                                    >
                                      {quantityInCart}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleIncreaseQuantity(item.id)}
                                      sx={{
                                        backgroundColor: '#1976D2',
                                        color: 'white',
                                        '&:hover': { backgroundColor: '#1565C0' },
                                        width: 28,
                                        height: 28,
                                      }}
                                    >
                                      <Add sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Collapse>
            </Paper>
          </Fade>
        ))}

        {/* Empty State */}
        {Object.keys(groupedItems).length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Restaurant sx={{ fontSize: 64, color: '#E0E0E0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No items found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        )}
      </Container>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <Zoom in={getTotalItems() > 0}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(`/checkout/${cafeId}/${tableId}`)}
              sx={{
                backgroundColor: '#1976D2',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  backgroundColor: '#1565C0',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.5)',
                },
                animation: showCartAnimation ? 'pulse 0.3s ease-in-out' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'translateX(-50%) scale(1)' },
                  '50%': { transform: 'translateX(-50%) scale(1.05)' },
                  '100%': { transform: 'translateX(-50%) scale(1)' },
                },
              }}
              startIcon={
                <Badge badgeContent={getTotalItems()} color="error">
                  <ShoppingCart />
                </Badge>
              }
            >
              View Cart • {formatPrice(getTotalAmount())}
            </Button>
          </Box>
        </Zoom>
      )}
    </Box>
  );
};

export default MenuPage;