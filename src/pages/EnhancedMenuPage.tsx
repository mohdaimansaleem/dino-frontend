import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Alert,
  Skeleton,
  Paper,
  AppBar,
  Toolbar,
  Slide,
  useScrollTrigger,
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Search,
  Nature as Eco,
  AccessTime,
  Close,
  Star,
  Whatshot,
  Restaurant,
  Phone,
  LocationOn,
  Favorite,
  FavoriteBorder,
  FilterList,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { MenuItem } from '../types';
import CleanDinoLogo from '../components/CleanDinoLogo';

// Mock data that would come from the admin-created menu
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
}

const EnhancedMenuPage: React.FC = () => {
  const { cafeId, tableId } = useParams<{ cafeId: string; tableId: string }>();
  const navigate = useNavigate();
  const { addItem, items: cartItems, getTotalItems } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters and UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vegFilter, setVegFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Dialog state
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Scroll trigger for header
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Mock data - in real app, this would come from API using admin-created menu
        const mockRestaurant: RestaurantInfo = {
          id: cafeId || '1',
          name: 'Dino Restaurant',
          description: 'A modern dining experience with fresh, locally sourced ingredients',
          address: '123 Main Street, Downtown',
          phone: '+1 (555) 123-4567',
          rating: 4.8,
          reviewCount: 1247,
          cuisine: ['Italian', 'Mediterranean', 'Modern'],
          openTime: '11:00 AM',
          closeTime: '10:00 PM',
        };

        const mockCategories: CategoryType[] = [
          { id: '1', name: 'Appetizers', description: 'Start your meal right', order: 1, active: true, icon: '🥗' },
          { id: '2', name: 'Main Courses', description: 'Hearty main dishes', order: 2, active: true, icon: '🍽️' },
          { id: '3', name: 'Desserts', description: 'Sweet endings', order: 3, active: true, icon: '🍰' },
          { id: '4', name: 'Beverages', description: 'Refreshing drinks', order: 4, active: true, icon: '🥤' },
        ];

        const mockMenuItems: MenuItemType[] = [
          {
            id: '1',
            name: 'Caesar Salad',
            description: 'Fresh romaine lettuce with parmesan cheese, croutons, and our signature Caesar dressing',
            price: 12.99,
            category: '1',
            image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
            available: true,
            featured: false,
            allergens: ['dairy', 'gluten'],
            preparationTime: 10,
            calories: 350,
            spicyLevel: 0,
            isVeg: true,
            rating: 4.5,
            reviewCount: 89,
          },
          {
            id: '2',
            name: 'Grilled Salmon',
            description: 'Atlantic salmon grilled to perfection with herbs, served with seasonal vegetables and lemon butter sauce',
            price: 24.99,
            category: '2',
            image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
            available: true,
            featured: true,
            allergens: ['fish'],
            preparationTime: 20,
            calories: 450,
            spicyLevel: 0,
            isVeg: false,
            rating: 4.8,
            reviewCount: 156,
          },
          {
            id: '3',
            name: 'Margherita Pizza',
            description: 'Classic Italian pizza with fresh mozzarella, tomato sauce, and basil leaves on our wood-fired crust',
            price: 18.99,
            category: '2',
            image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
            available: true,
            featured: true,
            allergens: ['dairy', 'gluten'],
            preparationTime: 15,
            calories: 520,
            spicyLevel: 0,
            isVeg: true,
            rating: 4.7,
            reviewCount: 203,
          },
          {
            id: '4',
            name: 'Chocolate Lava Cake',
            description: 'Warm chocolate cake with a molten center, served with vanilla ice cream and berry compote',
            price: 8.99,
            category: '3',
            image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
            available: true,
            featured: false,
            allergens: ['dairy', 'eggs', 'gluten'],
            preparationTime: 12,
            calories: 580,
            spicyLevel: 0,
            isVeg: true,
            rating: 4.9,
            reviewCount: 312,
          },
          {
            id: '5',
            name: 'Craft Beer Selection',
            description: 'Local craft beer on tap - ask your server for today\'s selection',
            price: 6.99,
            category: '4',
            image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
            available: true,
            featured: false,
            allergens: ['gluten'],
            preparationTime: 2,
            calories: 150,
            spicyLevel: 0,
            isVeg: true,
            rating: 4.3,
            reviewCount: 78,
          },
          {
            id: '6',
            name: 'Truffle Pasta',
            description: 'Handmade fettuccine with black truffle, wild mushrooms, and parmesan in a creamy sauce',
            price: 28.99,
            category: '2',
            image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
            available: true,
            featured: true,
            allergens: ['dairy', 'gluten', 'eggs'],
            preparationTime: 18,
            calories: 680,
            spicyLevel: 0,
            isVeg: true,
            rating: 4.9,
            reviewCount: 145,
          },
        ];

        setRestaurant(mockRestaurant);
        setCategories(mockCategories);
        setMenuItems(mockMenuItems);
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
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesVeg = vegFilter === 'all' || 
                      (vegFilter === 'veg' && item.isVeg) || 
                      (vegFilter === 'non-veg' && !item.isVeg);
    
    return matchesSearch && matchesCategory && matchesVeg && item.available;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'time':
        return a.preparationTime - b.preparationTime;
      default: // popular
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.rating || 0) - (a.rating || 0);
    }
  });

  const groupedItems = categories.reduce((acc, category) => {
    const categoryItems = sortedItems.filter(item => item.category === category.id);
    if (categoryItems.length > 0) {
      acc[category.name] = categoryItems;
    }
    return acc;
  }, {} as Record<string, MenuItemType[]>);

  const handleItemClick = (item: MenuItemType) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setSpecialInstructions('');
  };

  const handleAddToCart = () => {
    if (selectedItem) {
      // Convert to the format expected by cart context (MenuItem type)
      const cartItem: MenuItem = {
        id: selectedItem.id,
        name: selectedItem.name,
        description: selectedItem.description,
        price: selectedItem.price,
        category: selectedItem.category,
        isVeg: selectedItem.isVeg || false,
        image: selectedItem.image,
        isAvailable: selectedItem.available,
        preparationTime: selectedItem.preparationTime,
        ingredients: [],
        allergens: selectedItem.allergens,
        cafeId: cafeId || 'demo-cafe',
        order: 0,
      };
      addItem(cartItem, itemQuantity);
      setSelectedItem(null);
    }
  };

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
  };

  const getItemQuantityInCart = (itemId: string): number => {
    const cartItem = cartItems.find(item => item.menuItem.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
    <Box>
      {/* Fixed Header */}
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar 
          position="fixed" 
          elevation={trigger ? 2 : 0}
          sx={{ 
            backgroundColor: trigger ? 'background.paper' : 'transparent',
            color: trigger ? 'text.primary' : 'white',
            backdropFilter: trigger ? 'blur(20px)' : 'none',
            borderBottom: trigger ? '1px solid' : 'none',
            borderColor: 'divider',
            transition: 'all 0.3s ease',
          }}
        >
          <Toolbar>
            <CleanDinoLogo size={32} />
            <Typography variant="h6" sx={{ flexGrow: 1, ml: 1, fontWeight: 600 }}>
              {restaurant?.name}
            </Typography>
            <IconButton 
              color="inherit"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterList />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Slide>

      {/* Hero Section */}
      <Box
        sx={{
          height: 300,
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" gutterBottom fontWeight="bold">
                {restaurant?.name}
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                {restaurant?.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star sx={{ color: '#FFD700' }} />
                  <Typography variant="body1" fontWeight="600">
                    {restaurant?.rating} ({restaurant?.reviewCount} reviews)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime />
                  <Typography variant="body1">
                    {restaurant?.openTime} - {restaurant?.closeTime}
                  </Typography>
                </Box>
                <Typography variant="body1">
                  Table {tableId}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h6" gutterBottom color="text.primary">
                  Quick Info
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {restaurant?.address}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {restaurant?.phone}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Filters */}
        <Slide direction="down" in={showFilters} mountOnEnter unmountOnExit>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MuiMenuItem value="all">All Categories</MuiMenuItem>
                    {categories.map((category) => (
                      <MuiMenuItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MuiMenuItem value="popular">Popular</MuiMenuItem>
                    <MuiMenuItem value="price-low">Price: Low to High</MuiMenuItem>
                    <MuiMenuItem value="price-high">Price: High to Low</MuiMenuItem>
                    <MuiMenuItem value="rating">Highest Rated</MuiMenuItem>
                    <MuiMenuItem value="time">Fastest</MuiMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <ToggleButtonGroup
                  value={vegFilter}
                  exclusive
                  onChange={(_, value) => value && setVegFilter(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="veg">
                    <Eco sx={{ mr: 0.5 }} />
                    Veg
                  </ToggleButton>
                  <ToggleButton value="non-veg">Non-Veg</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </Paper>
        </Slide>

        {/* Featured Items */}
        {menuItems.some(item => item.featured) && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Whatshot color="error" />
              Featured Items
            </Typography>
            <Grid container spacing={3}>
              {menuItems.filter(item => item.featured).slice(0, 3).map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <Chip
                      label="Featured"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1,
                        fontWeight: 600,
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                    >
                      {favorites.has(item.id) ? (
                        <Favorite color="error" />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                    {item.image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.image}
                        alt={item.name}
                      />
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                          {item.name}
                        </Typography>
                        {item.isVeg && (
                          <Chip
                            icon={<Eco />}
                            label="Veg"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                      >
                        {item.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Star sx={{ fontSize: 16, color: '#FFD700', mr: 0.5 }} />
                          <Typography variant="body2" fontWeight="600">
                            {item.rating}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({item.reviewCount})
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {item.preparationTime} min
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {formatPrice(item.price)}
                        </Typography>
                        {getItemQuantityInCart(item.id) > 0 && (
                          <Chip
                            label={`${getItemQuantityInCart(item.id)} in cart`}
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Menu Items by Category */}
        {Object.entries(groupedItems).map(([categoryName, items]) => (
          <Box key={categoryName} sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              {categoryName}
            </Typography>
            <Grid container spacing={3}>
              {items.map((item) => {
                const quantityInCart = getItemQuantityInCart(item.id);
                return (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleItemClick(item)}
                    >
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                      >
                        {favorites.has(item.id) ? (
                          <Favorite color="error" />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>
                      {item.image && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={item.image}
                          alt={item.name}
                        />
                      )}
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                            {item.name}
                          </Typography>
                          {item.isVeg && (
                            <Chip
                              icon={<Eco />}
                              label="Veg"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {item.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Star sx={{ fontSize: 16, color: '#FFD700', mr: 0.5 }} />
                            <Typography variant="body2" fontWeight="600">
                              {item.rating}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                              ({item.reviewCount})
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {item.preparationTime} min
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {formatPrice(item.price)}
                          </Typography>
                          {quantityInCart > 0 && (
                            <Chip
                              label={`${quantityInCart} in cart`}
                              size="small"
                              color="primary"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}

        {sortedItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No items found matching your criteria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms
            </Typography>
          </Box>
        )}
      </Container>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: 4,
          }}
          onClick={() => navigate('/checkout')}
        >
          <Badge badgeContent={getTotalItems()} color="secondary">
            <ShoppingCart />
          </Badge>
        </Fab>
      )}

      {/* Item Detail Dialog */}
      <Dialog
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h5" fontWeight="bold">{selectedItem.name}</Typography>
              <IconButton onClick={() => setSelectedItem(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              {selectedItem.image && (
                <Box sx={{ mb: 3 }}>
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    style={{ width: '100%', height: 250, objectFit: 'cover', borderRadius: 12 }}
                  />
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {formatPrice(selectedItem.price)}
                </Typography>
                {selectedItem.isVeg && (
                  <Chip icon={<Eco />} label="Vegetarian" color="success" variant="outlined" />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ fontSize: 18, color: '#FFD700', mr: 0.5 }} />
                  <Typography variant="body1" fontWeight="600">
                    {selectedItem.rating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    ({selectedItem.reviewCount} reviews)
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {selectedItem.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedItem.preparationTime} minutes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.calories} calories
                  </Typography>
                </Grid>
              </Grid>

              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Allergens:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedItem.allergens.map((allergen) => (
                      <Chip
                        key={allergen}
                        label={allergen}
                        size="small"
                        variant="outlined"
                        color="warning"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Quantity:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    disabled={itemQuantity <= 1}
                  >
                    <Remove />
                  </IconButton>
                  <Typography variant="h6" sx={{ mx: 3, minWidth: 40, textAlign: 'center' }}>
                    {itemQuantity}
                  </Typography>
                  <IconButton onClick={() => setItemQuantity(itemQuantity + 1)}>
                    <Add />
                  </IconButton>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Special Instructions (Optional)"
                multiline
                rows={3}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests for this item..."
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={() => setSelectedItem(null)} size="large">
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddToCart}
                startIcon={<Add />}
                size="large"
                sx={{ minWidth: 160, py: 1.5 }}
              >
                Add {formatPrice(selectedItem.price * itemQuantity)}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EnhancedMenuPage;