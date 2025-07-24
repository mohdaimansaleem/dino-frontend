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
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Search,
  Nature as Eco,
  AccessTime,
  Close,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { menuService } from '../services/menuService';
import { MenuItem, MenuCategory, Cafe } from '../types';

const MenuPage: React.FC = () => {
  const { cafeId, tableId } = useParams<{ cafeId: string; tableId: string }>();
  const navigate = useNavigate();
  const { addItem, items: cartItems, getTotalItems } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [cafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vegFilter, setVegFilter] = useState<string>('all');

  // Dialog state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (cafeId) {
      loadMenuData();
    }
  }, [cafeId]); // loadMenuData is stable since it doesn't depend on props/state

  const loadMenuData = async () => {
    try {
      setLoading(true);
      
      // Load menu items, categories, and cafe info in parallel
      const [itemsData, categoriesData] = await Promise.all([
        menuService.getMenuItems(cafeId!, { availableOnly: true }),
        menuService.getMenuCategories(cafeId!),
      ]);

      setMenuItems(itemsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError('Failed to load menu. Please try again.');
      console.error('Error loading menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuService.filterMenuItems(menuItems, {
    searchQuery,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    isVeg: vegFilter === 'all' ? undefined : vegFilter === 'veg',
  });

  const groupedItems = menuService.groupItemsByCategory(filteredItems);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setSpecialInstructions('');
  };

  const handleAddToCart = () => {
    if (selectedItem) {
      addItem(selectedItem, itemQuantity);
      setSelectedItem(null);
    }
  };

  const getItemQuantityInCart = (itemId: string): number => {
    const cartItem = cartItems.find(item => item.menuItem.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const formatPrice = (price: number) => menuService.formatPrice(price);

  if (loading) {
    return (
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Menu
          </Typography>
          {cafe && (
            <Typography variant="body1" color="text.secondary">
              {cafe.name} • Table {tableId}
            </Typography>
          )}
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
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
                    <MuiMenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MuiMenuItem>
                  ))}
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
        </Box>

        {/* Menu Items */}
        {Object.entries(groupedItems).map(([categoryName, items]) => (
          <Box key={categoryName} sx={{ mb: 6 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
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
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleItemClick(item)}
                    >
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

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {item.preparationTime} min
                          </Typography>
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

        {filteredItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No items found matching your criteria
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
            bottom: 16,
            right: 16,
            zIndex: 1000,
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
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">{selectedItem.name}</Typography>
              <IconButton onClick={() => setSelectedItem(null)}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {selectedItem.image && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                  />
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" color="primary" fontWeight="bold" sx={{ flexGrow: 1 }}>
                  {formatPrice(selectedItem.price)}
                </Typography>
                {selectedItem.isVeg && (
                  <Chip icon={<Eco />} label="Vegetarian" color="success" variant="outlined" />
                )}
              </Box>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedItem.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Preparation time: {selectedItem.preparationTime} minutes
                </Typography>
              </Box>

              {selectedItem.ingredients && selectedItem.ingredients.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ingredients:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.ingredients.join(', ')}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1">Quantity:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    disabled={itemQuantity <= 1}
                  >
                    <Remove />
                  </IconButton>
                  <Typography variant="h6" sx={{ mx: 2, minWidth: 40, textAlign: 'center' }}>
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
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests for this item..."
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddToCart}
                startIcon={<Add />}
                sx={{ minWidth: 120 }}
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

export default MenuPage;