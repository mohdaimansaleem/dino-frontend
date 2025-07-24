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
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  IconButton,
  Paper,
  Collapse,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Search,
  Nature as Eco,
  AccessTime,
  Star,
  Restaurant,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { MenuItem } from '../types';
import CleanDinoLogo from '../components/CleanDinoLogo';

// Mock data interfaces
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
}

interface CategoryType {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  icon?: string;
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

const ZomatoStyleMenuPage: React.FC = () => {
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Mock data - Zomato/Swiggy style
        const mockRestaurant: RestaurantInfo = {
          id: cafeId || '1',
          name: 'Dino Restaurant',
          description: 'Authentic flavors • Fresh ingredients • Quick delivery',
          address: '123 Main Street, Downtown',
          phone: '+1 (555) 123-4567',
          rating: 4.3,
          reviewCount: 2847,
          cuisine: ['North Indian', 'Chinese', 'Continental'],
          openTime: '11:00 AM',
          closeTime: '11:00 PM',
          deliveryTime: '25-30 mins',
          minimumOrder: 15,
        };

        const mockCategories: CategoryType[] = [
          { id: '1', name: 'Recommended', description: 'Most popular items', order: 1, active: true, icon: '⭐' },
          { id: '2', name: 'Appetizers', description: 'Start your meal right', order: 2, active: true, icon: '🥗' },
          { id: '3', name: 'Main Course', description: 'Hearty main dishes', order: 3, active: true, icon: '🍽️' },
          { id: '4', name: 'Desserts', description: 'Sweet endings', order: 4, active: true, icon: '🍰' },
          { id: '5', name: 'Beverages', description: 'Refreshing drinks', order: 5, active: true, icon: '🥤' },
        ];

        const mockMenuItems: MenuItemType[] = [
          {
            id: '1',
            name: 'Butter Chicken',
            description: 'Tender chicken in rich tomato-based curry with butter and cream. Served with basmati rice.',
            price: 16.99,
            originalPrice: 19.99,
            discount: 15,
            category: '1',
            image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
            available: true,
            featured: true,
            allergens: ['dairy'],
            preparationTime: 20,
            calories: 520,
            spicyLevel: 2,
            isVeg: false,
            rating: 4.6,
            reviewCount: 234,
          },
          {
            id: '2',
            name: 'Paneer Tikka Masala',
            description: 'Grilled cottage cheese cubes in spiced tomato gravy. A vegetarian favorite.',
            price: 14.99,
            category: '1',
            image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
            available: true,
            featured: true,
            allergens: ['dairy'],
            preparationTime: 18,
            calories: 450,
            spicyLevel: 2,
            isVeg: true,
            rating: 4.4,
            reviewCount: 189,
          },
          {
            id: '3',
            name: 'Chicken Biryani',
            description: 'Aromatic basmati rice layered with spiced chicken, herbs, and saffron.',
            price: 18.99,
            category: '3',
            image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400',
            available: true,
            featured: true,
            allergens: [],
            preparationTime: 25,
            calories: 680,
            spicyLevel: 3,
            isVeg: false,
            rating: 4.7,
            reviewCount: 312,
          },
          {
            id: '4',
            name: 'Samosa (2 pcs)',
            description: 'Crispy pastry filled with spiced potatoes and peas. Served with mint chutney.',
            price: 5.99,
            category: '2',
            image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
            available: true,
            featured: false,
            allergens: ['gluten'],
            preparationTime: 8,
            calories: 280,
            spicyLevel: 1,
            isVeg: true,
            rating: 4.2,
            reviewCount: 156,
          },
          {
            id: '5',
            name: 'Gulab Jamun (4 pcs)',
            description: 'Soft milk dumplings soaked in rose-flavored sugar syrup.',
            price: 6.99,
            category: '4',
            image: 'https://images.unsplash.com/photo-1571167530149-c72f2b3d9f95?w=400',
            available: true,
            featured: false,
            allergens: ['dairy', 'gluten'],
            preparationTime: 5,
            calories: 320,
            spicyLevel: 0,
            isVeg: true,
            rating: 4.5,
            reviewCount: 98,
          },
          {
            id: '6',
            name: 'Mango Lassi',
            description: 'Refreshing yogurt-based drink blended with sweet mango pulp.',
            price: 4.99,
            category: '5',
            image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400',
            available: true,
            featured: false,
            allergens: ['dairy'],
            preparationTime: 3,
            calories: 180,
            spicyLevel: 0,
            isVeg: true,
            rating: 4.3,
            reviewCount: 87,
          },
        ];

        setRestaurant(mockRestaurant);
        setCategories(mockCategories);
        setMenuItems(mockMenuItems);
        
        // Auto-expand recommended category
        setExpandedCategories(new Set(['1']));
      } catch (err: any) {
        setError('Failed to load menu. Please try again.');
        console.error('Error loading menu:', err);
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
      cafeId: cafeId || 'demo-cafe',
      order: 0,
    };
    addItem(cartItem, 1);
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

  const formatPrice = (price: number) => `₹${price.toFixed(0)}`;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} />
        <Container maxWidth="lg" sx={{ py: 2 }}>
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={120} sx={{ mb: 2 }} />
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
    <Box sx={{ pb: getTotalItems() > 0 ? 10 : 0 }}>
      {/* Mobile-Optimized Restaurant Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
          color: 'white',
          py: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CleanDinoLogo size={32} />
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              sx={{ ml: 2, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
            >
              {restaurant?.name}
            </Typography>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ mb: 2, opacity: 0.9, fontSize: { xs: '0.875rem', md: '1rem' } }}
          >
            {restaurant?.description}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 2, md: 3 }, 
            flexWrap: 'wrap',
            fontSize: { xs: '0.75rem', md: '0.875rem' }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Star sx={{ color: '#FFD700', fontSize: { xs: 16, md: 20 } }} />
              <Typography variant="body2" fontWeight="600">
                {restaurant?.rating}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                ({restaurant?.reviewCount}+)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: { xs: 16, md: 20 } }} />
              <Typography variant="body2">
                {restaurant?.deliveryTime}
              </Typography>
            </Box>
            <Typography variant="body2">
              Table {tableId}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Mobile-Optimized Search and Filters */}
        <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 4 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter</InputLabel>
                <Select
                  value={vegFilter}
                  label="Filter"
                  onChange={(e) => setVegFilter(e.target.value)}
                >
                  <MuiMenuItem value="all">All Items</MuiMenuItem>
                  <MuiMenuItem value="veg">
                    <Eco sx={{ mr: 1, color: 'green' }} />
                    Vegetarian
                  </MuiMenuItem>
                  <MuiMenuItem value="non-veg">Non-Vegetarian</MuiMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                textAlign={{ xs: 'left', md: 'center' }}
              >
                {filteredItems.length} items available
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Mobile-Optimized Menu Categories */}
        {Object.entries(groupedItems).map(([categoryId, { category, items }]) => (
          <Paper key={categoryId} elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'grey.50',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onClick={() => toggleCategoryExpansion(categoryId)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  {category.icon} {category.name}
                </Typography>
                <Chip label={`${items.length} items`} size="small" />
              </Box>
              {expandedCategories.has(categoryId) ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expandedCategories.has(categoryId)}>
              <Box sx={{ p: { xs: 1, md: 2 } }}>
                {items.map((item) => {
                  const quantityInCart = getItemQuantityInCart(item.id);
                  return (
                    <Card
                      key={item.id}
                      sx={{
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        {/* Mobile-First Layout */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {/* Item Image - Mobile Optimized */}
                          {item.image && (
                            <Box
                              sx={{
                                flexShrink: 0,
                                width: { xs: 80, md: 120 },
                                height: { xs: 80, md: 120 },
                              }}
                            >
                              <Box
                                component="img"
                                src={item.image}
                                alt={item.name}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                }}
                              />
                            </Box>
                          )}
                          
                          {/* Item Details */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                              {/* Veg/Non-Veg Indicator */}
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  border: `2px solid ${item.isVeg ? 'green' : 'red'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1,
                                  mt: 0.5,
                                  flexShrink: 0,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    backgroundColor: item.isVeg ? 'green' : 'red',
                                    borderRadius: '50%',
                                  }}
                                />
                              </Box>
                              
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                  variant="subtitle1" 
                                  fontWeight="bold" 
                                  gutterBottom
                                  sx={{ 
                                    fontSize: { xs: '0.875rem', md: '1rem' },
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {item.name}
                                  {item.featured && (
                                    <Chip
                                      label="Bestseller"
                                      size="small"
                                      color="error"
                                      sx={{ ml: 1, fontSize: '0.6rem', height: 20 }}
                                    />
                                  )}
                                </Typography>
                                
                                {/* Rating and Time - Mobile Optimized */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Star sx={{ fontSize: 14, color: '#FFD700', mr: 0.5 }} />
                                    <Typography variant="caption" fontWeight="600">
                                      {item.rating}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                      ({item.reviewCount})
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AccessTime sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {item.preparationTime} mins
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {/* Price - Mobile Optimized */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography 
                                    variant="h6" 
                                    fontWeight="bold" 
                                    color="text.primary"
                                    sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                                  >
                                    {formatPrice(item.price)}
                                  </Typography>
                                  {item.originalPrice && (
                                    <>
                                      <Typography
                                        variant="body2"
                                        sx={{ 
                                          textDecoration: 'line-through', 
                                          color: 'text.secondary',
                                          fontSize: { xs: '0.75rem', md: '0.875rem' }
                                        }}
                                      >
                                        {formatPrice(item.originalPrice)}
                                      </Typography>
                                      <Chip
                                        label={`${item.discount}% OFF`}
                                        size="small"
                                        color="success"
                                        sx={{ fontSize: '0.6rem', height: 20 }}
                                      />
                                    </>
                                  )}
                                </Box>
                                
                                {/* Description - Mobile Optimized */}
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    lineHeight: 1.4,
                                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                                    display: '-webkit-box',
                                    WebkitLineClamp: { xs: 2, md: 3 },
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {item.description}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        
                        {/* Add/Remove Controls - Mobile Optimized */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          {quantityInCart === 0 ? (
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => handleAddToCart(item)}
                              sx={{
                                borderWidth: 2,
                                fontWeight: 'bold',
                                px: { xs: 2, md: 3 },
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: { xs: '0.75rem', md: '0.875rem' },
                                '&:hover': {
                                  borderWidth: 2,
                                },
                              }}
                            >
                              ADD
                            </Button>
                          ) : (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid',
                                borderColor: 'primary.main',
                                borderRadius: 1,
                                backgroundColor: 'white',
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFromCart(item.id)}
                                sx={{ color: 'primary.main', p: 0.5 }}
                              >
                                <Remove sx={{ fontSize: { xs: 16, md: 20 } }} />
                              </IconButton>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ 
                                  mx: { xs: 1, md: 2 }, 
                                  minWidth: 20, 
                                  textAlign: 'center', 
                                  color: 'primary.main',
                                  fontSize: { xs: '0.875rem', md: '1rem' }
                                }}
                              >
                                {quantityInCart}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleIncreaseQuantity(item.id)}
                                sx={{ color: 'primary.main', p: 0.5 }}
                              >
                                <Add sx={{ fontSize: { xs: 16, md: 20 } }} />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Collapse>
          </Paper>
        ))}

        {filteredItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No items found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
      </Container>

      {/* Improved Sticky Cart Summary - No Rounded Corners */}
      {getTotalItems() > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            p: { xs: 1.5, md: 2 },
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 0, // No rounded corners as requested
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography 
                  variant="body1" 
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                >
                  {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} | {formatPrice(getTotalAmount())}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.8,
                    fontSize: { xs: '0.75rem', md: '0.875rem' }
                  }}
                >
                  Extra charges may apply
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/checkout/${cafeId}/${tableId}`)}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
                startIcon={<ShoppingCart />}
              >
                VIEW CART
              </Button>
            </Box>
          </Container>
        </Paper>
      )}
    </Box>
  );
};

export default ZomatoStyleMenuPage;