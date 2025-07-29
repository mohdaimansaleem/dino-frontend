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
  Select,
  MenuItem as MuiMenuItem,
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
  Nature as Eco,
  AccessTime,
  Star,
  Restaurant,
  ExpandMore,
  ExpandLess,
  LocalOffer,
  Whatshot,
  InfoOutlined,
  LocalFireDepartment,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { MenuItem } from '../types';
import CustomerNavbar from '../components/CustomerNavbar';
// import { apiService } from '../services/api';
// import { menuService } from '../services/menuService';

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

const EnhancedMenuPage: React.FC = () => {
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
        
        const isDemoMode = localStorage.getItem('dino_demo_mode') === 'true' || 
                          cafeId === 'dino-cafe' || 
                          !cafeId;
        
        // Use enhanced demo data (API integration will be added later)
        console.log('Loading demo data for menu');
          
          const mockRestaurant: RestaurantInfo = {
            id: cafeId || 'dino-cafe-1',
            name: 'Dino Cafe',
            description: 'Authentic Indian flavors • Fresh ingredients • Quick service',
            address: 'Hyderabad, Telangana, India',
            phone: '+91 98765 43210',
            rating: 4.5,
            reviewCount: 1247,
            cuisine: ['North Indian', 'South Indian', 'Chinese', 'Continental'],
            openTime: '11:00 AM',
            closeTime: '11:00 PM',
            deliveryTime: '15-20 mins',
            minimumOrder: 100,
          };

          const mockCategories: CategoryType[] = [
            { id: '1', name: 'Recommended', description: 'Chef\'s special picks', order: 1, active: true, icon: '⭐', color: '#1976D2' },
            { id: '2', name: 'Appetizers', description: 'Perfect starters', order: 2, active: true, icon: '🥗', color: '#388E3C' },
            { id: '3', name: 'Main Course', description: 'Hearty main dishes', order: 3, active: true, icon: '🍽️', color: '#F57C00' },
            { id: '4', name: 'Desserts', description: 'Sweet endings', order: 4, active: true, icon: '🍰', color: '#7B1FA2' },
            { id: '5', name: 'Beverages', description: 'Refreshing drinks', order: 5, active: true, icon: '🥤', color: '#5D4037' },
          ];

          const mockMenuItems: MenuItemType[] = [
            {
              id: '1',
              name: 'Butter Chicken',
              description: 'Tender chicken in rich tomato-based curry with butter and cream. Served with basmati rice and fresh naan.',
              price: 320,
              originalPrice: 380,
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
              isPopular: true,
            },
            {
              id: '2',
              name: 'Paneer Tikka Masala',
              description: 'Grilled cottage cheese cubes in spiced tomato gravy. A vegetarian favorite with aromatic herbs.',
              price: 280,
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
              isNew: true,
            },
            {
              id: '3',
              name: 'Chicken Biryani',
              description: 'Aromatic basmati rice layered with spiced chicken, herbs, and saffron. Served with raita and pickle.',
              price: 350,
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
              isPopular: true,
            },
            {
              id: '4',
              name: 'Samosa (2 pcs)',
              description: 'Crispy golden pastry filled with spiced potatoes and peas. Served with mint and tamarind chutney.',
              price: 60,
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
              description: 'Soft milk dumplings soaked in rose-flavored sugar syrup. A classic Indian dessert.',
              price: 120,
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
              name: 'Masala Chai',
              description: 'Traditional Indian spiced tea brewed with milk and aromatic spices. Perfect with snacks.',
              price: 40,
              category: '5',
              image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400',
              available: true,
              featured: false,
              allergens: ['dairy'],
              preparationTime: 3,
              calories: 80,
              spicyLevel: 0,
              isVeg: true,
              rating: 4.3,
              reviewCount: 87,
            },
            {
              id: '7',
              name: 'Dal Makhani',
              description: 'Creamy black lentils slow-cooked with butter, cream, and aromatic spices. Rich and flavorful.',
              price: 220,
              category: '3',
              available: true,
              featured: false,
              allergens: ['dairy'],
              preparationTime: 15,
              calories: 380,
              spicyLevel: 1,
              isVeg: true,
              rating: 4.4,
              reviewCount: 145,
            },
            {
              id: '8',
              name: 'Chicken Tikka',
              description: 'Marinated chicken pieces grilled to perfection in tandoor oven. Served with mint chutney.',
              price: 300,
              category: '2',
              available: true,
              featured: false,
              allergens: ['dairy'],
              preparationTime: 20,
              calories: 420,
              spicyLevel: 2,
              isVeg: false,
              rating: 4.5,
              reviewCount: 203,
            },
          ];

          // Simulate loading delay for smooth transition
          await new Promise(resolve => setTimeout(resolve, 800));

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
                                <Box
                                  component="img"
                                  src={item.image}
                                  alt={item.name}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                  }}
                                />
                                {/* Badges */}
                                {item.isPopular && (
                                  <Chip
                                    label="Popular"
                                    size="small"
                                    icon={<Whatshot />}
                                    sx={{
                                      position: 'absolute',
                                      top: 6,
                                      left: 6,
                                      backgroundColor: '#D32F2F',
                                      color: 'white',
                                      fontSize: '0.65rem',
                                      height: 22,
                                      fontWeight: '500',
                                    }}
                                  />
                                )}
                                {item.isNew && (
                                  <Chip
                                    label="New"
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 6,
                                      right: 6,
                                      backgroundColor: '#388E3C',
                                      color: 'white',
                                      fontSize: '0.65rem',
                                      height: 22,
                                      fontWeight: '500',
                                    }}
                                  />
                                )}
                              </Box>
                            )}
                            
                            {/* Enhanced Item Details */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                {/* Veg/Non-Veg Indicator */}
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    border: `2px solid ${item.isVeg ? '#388E3C' : '#D32F2F'}`,
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
                                      width: 4,
                                      height: 4,
                                      backgroundColor: item.isVeg ? '#388E3C' : '#D32F2F',
                                      borderRadius: '50%',
                                    }}
                                  />
                                </Box>
                                
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography 
                                      variant="subtitle1" 
                                      fontWeight="bold" 
                                      sx={{ fontSize: '1rem', lineHeight: 1.2 }}
                                    >
                                      {item.name}
                                    </Typography>
                                    {item.featured && (
                                      <Chip
                                        label="Bestseller"
                                        size="small"
                                        color="error"
                                        sx={{ fontSize: '0.6rem', height: 18 }}
                                      />
                                    )}
                                  </Box>
                                  
                                  {/* Enhanced Rating and Details */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Star sx={{ fontSize: 14, color: '#FFD700', mr: 0.3 }} />
                                      <Typography variant="caption" fontWeight="600">
                                        {item.rating}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.3 }}>
                                        ({item.reviewCount})
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <AccessTime sx={{ fontSize: 12, mr: 0.3, color: 'text.secondary' }} />
                                      <Typography variant="caption" color="text.secondary">
                                        {item.preparationTime} mins
                                      </Typography>
                                    </Box>
                                    {getSpicyLevelIcon(item.spicyLevel || 0)}
                                  </Box>
                                  
                                  {/* Enhanced Price */}
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography 
                                      variant="h6" 
                                      fontWeight="bold" 
                                      color="text.primary"
                                      sx={{ fontSize: '1.1rem' }}
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
                                            fontSize: '0.8rem'
                                          }}
                                        >
                                          {formatPrice(item.originalPrice)}
                                        </Typography>
                                        <Chip
                                          label={`${item.discount}% OFF`}
                                          size="small"
                                          color="success"
                                          icon={<LocalOffer />}
                                          sx={{ fontSize: '0.6rem', height: 18 }}
                                        />
                                      </>
                                    )}
                                  </Box>
                                  
                                  {/* Enhanced Description */}
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ 
                                      lineHeight: 1.4,
                                      fontSize: '0.8rem',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
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
                          
                          {/* Enhanced Add/Remove Controls */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {item.allergens.length > 0 && (
                                <Tooltip title={`Contains: ${item.allergens.join(', ')}`}>
                                  <Chip
                                    label="Allergen Info"
                                    size="small"
                                    icon={<InfoOutlined />}
                                    variant="outlined"
                                    sx={{ fontSize: '0.6rem', height: 20 }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                            
                            {quantityInCart === 0 ? (
                              <Button
                                variant="contained"
                                onClick={() => handleAddToCart(item)}
                                sx={{
                                  backgroundColor: '#1976D2',
                                  color: 'white',
                                  fontWeight: '600',
                                  px: 3,
                                  py: 1,
                                  borderRadius: 1,
                                  fontSize: '0.875rem',
                                  textTransform: 'none',
                                  boxShadow: '0 2px 4px rgba(25, 118, 210, 0.3)',
                                  '&:hover': {
                                    backgroundColor: '#1565C0',
                                    boxShadow: '0 4px 8px rgba(25, 118, 210, 0.4)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                Add to Cart
                              </Button>
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '2px solid #1976D2',
                                  borderRadius: 1,
                                  backgroundColor: 'white',
                                  boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                                  overflow: 'hidden',
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  sx={{ 
                                    color: '#1976D2', 
                                    p: 0.5,
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    }
                                  }}
                                >
                                  <Remove sx={{ fontSize: 18 }} />
                                </IconButton>
                                <Typography
                                  variant="body1"
                                  fontWeight="600"
                                  sx={{ 
                                    mx: 2, 
                                    minWidth: 24, 
                                    textAlign: 'center', 
                                    color: '#1976D2',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {quantityInCart}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleIncreaseQuantity(item.id)}
                                  sx={{ 
                                    color: '#1976D2', 
                                    p: 0.5,
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    }
                                  }}
                                >
                                  <Add sx={{ fontSize: 18 }} />
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
          </Fade>
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

      {/* Enhanced Sticky Cart Summary */}
      {getTotalItems() > 0 && (
        <Zoom in={getTotalItems() > 0}>
          <Paper
            elevation={8}
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              p: 2,
              backgroundColor: 'white',
              color: 'text.primary',
              borderRadius: 0,
              borderTop: '1px solid #E0E0E0',
              transform: showCartAnimation ? 'scale(1.01)' : 'scale(1)',
              transition: 'transform 0.2s ease',
              boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Container maxWidth="lg">
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
              }}>
                <Box sx={{ textAlign: 'left', flex: 1 }}>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    sx={{ fontSize: '1rem', color: 'text.primary' }}
                  >
                    {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} | {formatPrice(getTotalAmount())}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ opacity: 0.7, fontSize: '0.8rem', color: 'text.secondary' }}
                  >
                    Extra charges may apply
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(`/checkout/${cafeId}/${tableId}`)}
                  sx={{
                    backgroundColor: '#1976D2',
                    color: 'white',
                    fontWeight: '600',
                    px: 4,
                    py: 1.5,
                    fontSize: '0.875rem',
                    borderRadius: 1,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#1565C0',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  startIcon={
                    <Badge badgeContent={getTotalItems()} color="error">
                      <ShoppingCart />
                    </Badge>
                  }
                >
                  VIEW CART
                </Button>
              </Box>
            </Container>
          </Paper>
        </Zoom>
      )}
    </Box>
  );
};

export default EnhancedMenuPage;