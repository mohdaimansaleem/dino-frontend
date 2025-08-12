import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  Chip,
  IconButton,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Category,
  Search,
  Restaurant,
  Nature,
  LocalDining,
} from '@mui/icons-material';
import { menuService } from '../../services/menuService';
import { useUserData } from '../../contexts/UserDataContext';
import { MenuItem, MenuCategory } from '../../types/api';

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number; // Mapped from base_price
  category: string; // Mapped from category_id
  isVeg: boolean; // Mapped from is_vegetarian
  available?: boolean; // Mapped from is_available
  isAvailable?: boolean; // Mapped from is_available
  preparationTime: number; // Mapped from preparation_time_minutes
  image?: string;
  featured?: boolean;
  allergens?: string[];
  calories?: number;
  spicyLevel?: number;
  dietaryInfo?: string[];
  // Original API fields
  base_price?: number;
  category_id?: string;
  venue_id?: string;
  is_vegetarian?: boolean;
  is_available?: boolean;
  preparation_time_minutes?: number;
  image_urls?: string[];
  created_at?: string;
  updated_at?: string;
}

interface CategoryType {
  id: string;
  name: string;
  description?: string;
  active?: boolean; // For backward compatibility
  order?: number;
  venueId?: string; // For backward compatibility
  // Original API fields
  venue_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const MenuManagement: React.FC = () => {
  const { getVenue, getVenueDisplayName, userData, loading: userDataLoading } = useUserData();
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vegFilter, setVegFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Simple approach: Load data on mount and when venue becomes available
  useEffect(() => {
    const loadMenuData = async () => {
      console.log('=== MenuManagement useEffect triggered ===');
      console.log('userDataLoading:', userDataLoading);
      console.log('userData:', userData);
      
      // Don't proceed if UserDataContext is still loading
      if (userDataLoading) {
        console.log('UserDataContext still loading, skipping...');
        return;
      }

      const venue = getVenue();
      console.log('getVenue() result:', venue);
      
      if (!venue?.id) {
        console.log('No venue ID, setting error state');
        setError('No venue assigned to your account. Please contact support.');
        setLoading(false);
        return;
      }

      console.log('Venue ID found:', venue.id, 'Starting API calls...');
      
      try {
        setLoading(true);
        setError(null);

        // Make API calls
        console.log('Calling menuService.getMenuCategories...');
        const categoriesPromise = menuService.getMenuCategories({ venue_id: venue.id });
        
        console.log('Calling menuService.getMenuItems...');
        const menuItemsPromise = menuService.getMenuItems({ venue_id: venue.id });

        const [categoriesData, menuItemsData] = await Promise.all([
          categoriesPromise,
          menuItemsPromise
        ]);

        console.log('Raw API responses:');
        console.log('categoriesData:', categoriesData);
        console.log('menuItemsData:', menuItemsData);

        // Process categories
        const processedCategories = (categoriesData.data || []).map((cat: any) => ({
          ...cat,
          active: true,
          order: 0,
          venueId: cat.venue_id
        }));

        // Process menu items
        const processedMenuItems = (menuItemsData.data || []).map((item: any) => ({
          ...item,
          price: item.base_price,
          category: item.category_id,
          isVeg: item.is_vegetarian || false,
          available: item.is_available,
          isAvailable: item.is_available,
          preparationTime: item.preparation_time_minutes || 15
        }));

        console.log('Processed data:');
        console.log('processedCategories:', processedCategories);
        console.log('processedMenuItems:', processedMenuItems);

        // Update state
        console.log('Updating state...');
        setCategories(processedCategories);
        setMenuItems(processedMenuItems);
        
        console.log('State updated! Categories:', processedCategories.length, 'Items:', processedMenuItems.length);
        
      } catch (error) {
        console.error('API Error:', error);
        setMenuItems([]);
        setCategories([]);
        setSnackbar({
          open: true,
          message: 'Failed to load menu data. Please try refreshing.',
          severity: 'error'
        });
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    // Add a small delay to ensure everything is ready
    const timeoutId = setTimeout(loadMenuData, 100);
    
    return () => clearTimeout(timeoutId);
  }, [userDataLoading, userData]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('State changed - Categories:', categories.length, 'MenuItems:', menuItems.length);
  }, [categories, menuItems]);

  const handleAddItem = () => {
    setEditingItem(null);
    setOpenItemDialog(true);
  };

  const handleEditItem = (item: MenuItemType) => {
    setEditingItem(item);
    setOpenItemDialog(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const item = menuItems.find(item => item.id === itemId);
      await menuService.deleteMenuItem(itemId);
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      setSnackbar({ open: true, message: `${item?.name} deleted successfully`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete menu item', severity: 'error' });
    }
  };

  const handleSaveItem = async (itemData: Partial<MenuItemType>) => {
    try {
      if (editingItem) {
        // Update existing item
        const updateData = {
          name: itemData.name,
          description: itemData.description,
          base_price: itemData.price,
          category_id: itemData.category,
          is_vegetarian: itemData.isVeg,
          is_available: itemData.available ?? itemData.isAvailable,
          preparation_time_minutes: itemData.preparationTime,
        };
        
        const response = await menuService.updateMenuItem(editingItem.id, updateData);
        
        if (response.success && response.data) {
          setMenuItems(prev => prev.map(item => 
            item.id === editingItem.id ? { 
              ...item,
              name: response.data!.name,
              description: response.data!.description,
              price: response.data!.base_price,
              category: response.data!.category_id,
              isVeg: response.data!.is_vegetarian || false,
              available: response.data!.is_available || false,
              isAvailable: response.data!.is_available || false,
              preparationTime: response.data!.preparation_time_minutes || 15
            } as unknown as MenuItemType : item
          ));
          setSnackbar({ open: true, message: 'Menu item updated successfully', severity: 'success' });
        } else {
          throw new Error(response.message || 'Update failed');
        }
      } else {
        // Create new item
        const venue = getVenue();
        if (!venue?.id) {
          throw new Error('No venue available');
        }
        
        const createData = {
          name: itemData.name || '',
          description: itemData.description || '',
          base_price: itemData.price || 0,
          category_id: itemData.category || '',
          venue_id: venue.id,
          is_vegetarian: itemData.isVeg ?? true,
          preparation_time_minutes: itemData.preparationTime || 15,
        };
        
        const response = await menuService.createMenuItem(createData);
        
        if (response.success && response.data) {
          const newItem = {
            ...response.data!,
            price: response.data!.base_price,
            category: response.data!.category_id,
            isVeg: response.data!.is_vegetarian || false,
            available: response.data!.is_available || false,
            isAvailable: response.data!.is_available || false,
            preparationTime: response.data!.preparation_time_minutes || 15
          } as unknown as MenuItemType;
          setMenuItems(prev => [...prev, newItem]);
          setSnackbar({ open: true, message: 'Menu item added successfully', severity: 'success' });
        } else {
          throw new Error(response.message || 'Creation failed');
        }
      }
      setOpenItemDialog(false);
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to save menu item', 
        severity: 'error' 
      });
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return;

      const response = await menuService.updateMenuItem(itemId, {
        is_available: !(item.available ?? item.isAvailable),
      });

      if (response.data) {
        setMenuItems(prev => prev.map(item => 
          item.id === itemId ? { 
            ...item,
            price: response.data!.base_price,
            category: response.data!.category_id,
            isVeg: response.data!.is_vegetarian || false,
            available: response.data!.is_available,
            isAvailable: response.data!.is_available,
            preparationTime: response.data!.preparation_time_minutes || 15
          } as unknown as MenuItemType : item
        ));
        setSnackbar({ 
          open: true, 
          message: `${item.name} marked as ${response.data.is_available ? 'available' : 'unavailable'}`, 
          severity: 'success' 
        });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update availability', severity: 'error' });
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setOpenCategoryDialog(true);
  };

  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category);
    setOpenCategoryDialog(true);
  };

  const handleSaveCategory = async (categoryData: Partial<CategoryType>) => {
    try {
      if (editingCategory) {
        // Update existing category
        const response = await menuService.updateMenuCategory(editingCategory.id, {
          name: categoryData.name,
          description: categoryData.description,
        });
        if (response.data) {
          setCategories(prev => prev.map(cat => 
            cat.id === editingCategory.id ? { 
              ...cat,
              ...response.data!,
              active: true,
              order: cat.order || 0,
              venueId: response.data!.venue_id
            } as unknown as CategoryType : cat
          ));
        }
        setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else {
        // Create new category
        const venue = getVenue();
        if (!venue?.id) {
          throw new Error('No venue available');
        }
        
        const response = await menuService.createMenuCategory({
          name: categoryData.name || '',
          description: categoryData.description || '',
          venue_id: venue.id,
        });
        if (response.data) {
          const newCategory = {
            ...response.data!,
            active: true,
            order: 0,
            venueId: response.data!.venue_id
          } as unknown as CategoryType;
          setCategories(prev => [...prev, newCategory]);
        }
        setSnackbar({ open: true, message: 'Category added successfully', severity: 'success' });
      }
      setOpenCategoryDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save category', severity: 'error' });
    }
  };



  // Filter menu items based on current filters
  const filteredItems = menuItems.filter((item: MenuItemType) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVeg = vegFilter === 'all' || 
                      (vegFilter === 'veg' && item.isVeg) || 
                      (vegFilter === 'non-veg' && !item.isVeg);
    const matchesAvailability = availabilityFilter === 'all' ||
                               (availabilityFilter === 'available' && (item.available ?? item.isAvailable)) ||
                               (availabilityFilter === 'unavailable' && !(item.available ?? item.isAvailable));
    
    return matchesCategory && matchesSearch && matchesVeg && matchesAvailability;
  });

  // Debug filtering
  console.log('Filtering debug:');
  console.log('- Total menuItems:', menuItems.length);
  console.log('- selectedCategory:', selectedCategory);
  console.log('- searchTerm:', searchTerm);
  console.log('- vegFilter:', vegFilter);
  console.log('- availabilityFilter:', availabilityFilter);
  console.log('- filteredItems:', filteredItems.length);
  if (menuItems.length > 0 && filteredItems.length === 0) {
    console.log('Items being filtered out:');
    menuItems.forEach((item: MenuItemType, index: number) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVeg = vegFilter === 'all' || 
                        (vegFilter === 'veg' && item.isVeg) || 
                        (vegFilter === 'non-veg' && !item.isVeg);
      const matchesAvailability = availabilityFilter === 'all' ||
                                 (availabilityFilter === 'available' && (item.available ?? item.isAvailable)) ||
                                 (availabilityFilter === 'unavailable' && !(item.available ?? item.isAvailable));
      
      console.log(`Item ${index}:`, {
        name: item.name,
        category: item.category,
        isVeg: item.isVeg,
        available: item.available,
        isAvailable: item.isAvailable,
        matchesCategory,
        matchesSearch,
        matchesVeg,
        matchesAvailability,
        passes: matchesCategory && matchesSearch && matchesVeg && matchesAvailability
      });
    });
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" className="container-responsive" sx={{ pt: { xs: '56px', sm: '64px' } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          textAlign: 'center',
          gap: 2,
          py: { xs: 2, sm: 4 }
        }}>
          <CircularProgress size={isMobile ? 48 : 60} />
          <Typography variant={isMobile ? "body1" : "h6"}>
            Loading Menu Management...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className="container-responsive" sx={{ pt: { xs: '56px', sm: '64px' } }}>
        <Box sx={{ py: { xs: 2, sm: 4 } }}>
          <Alert severity="warning" sx={{ mb: 4 }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              gutterBottom
              fontWeight="600"
            >
              Unable to Load Menu Data
            </Typography>
            <Typography variant="body2">
              Don't worry! You can still manage your menu. Start by adding your first menu item or category.
            </Typography>
          </Alert>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Button 
              variant="contained" 
              onClick={handleAddItem}
              className="btn-responsive"
              fullWidth={isMobile}
            >
              Add Menu Item
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleAddCategory}
              className="btn-responsive"
              fullWidth={isMobile}
            >
              Add Category
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
              className="btn-responsive"
              fullWidth={isMobile}
            >
              Retry Loading
            </Button>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="container-responsive" sx={{ pt: { xs: '56px', sm: '64px' } }}>
      <Box sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1"
            gutterBottom 
            fontWeight="600" 
            color="text.primary"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
          >
            Menu Management
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            color="text.secondary"
          >
            Manage your restaurant's menu items and categories for {getVenueDisplayName()}
          </Typography>
        </Box>

        {/* Enhanced Controls */}
        <Paper 
          elevation={1} 
          className="card-responsive"
          sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}
        >
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                className="input-responsive"
                placeholder={isMobile ? "Search items..." : "Search menu items..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size={isMobile ? "medium" : "medium"}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth className="input-responsive">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                  size={isMobile ? "medium" : "medium"}
                >
                  <MuiMenuItem value="all">All Categories</MuiMenuItem>
                  {categories.filter(cat => cat.active).map(category => (
                    <MuiMenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MuiMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth className="input-responsive">
                <InputLabel>Type</InputLabel>
                <Select
                  value={vegFilter}
                  onChange={(e) => setVegFilter(e.target.value)}
                  label="Type"
                  size={isMobile ? "medium" : "medium"}
                >
                  <MuiMenuItem value="all">All</MuiMenuItem>
                  <MuiMenuItem value="veg">
                    <Nature sx={{ mr: 1, fontSize: 16, color: 'green' }} />
                    {isMobile ? "Veg" : "Vegetarian"}
                  </MuiMenuItem>
                  <MuiMenuItem value="non-veg">
                    <LocalDining sx={{ mr: 1, fontSize: 16, color: 'red' }} />
                    {isMobile ? "Non-Veg" : "Non-Vegetarian"}
                  </MuiMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth className="input-responsive">
                <InputLabel>Status</InputLabel>
                <Select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  label="Status"
                  size={isMobile ? "medium" : "medium"}
                >
                  <MuiMenuItem value="all">All</MuiMenuItem>
                  <MuiMenuItem value="available">Available</MuiMenuItem>
                  <MuiMenuItem value="unavailable">Unavailable</MuiMenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent={{ xs: 'stretch', md: 'flex-end' }}
              >
                <Button
                  variant="outlined"
                  startIcon={<Category />}
                  onClick={handleAddCategory}
                  className="btn-responsive"
                  size={isMobile ? "medium" : "medium"}
                  fullWidth={isMobile}
                >
                  {isMobile ? "Categories" : "Categories"}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  className="btn-responsive"
                  size={isMobile ? "medium" : "medium"}
                  fullWidth={isMobile}
                >
                  Add Item
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Categories Overview */}
        <Paper 
          elevation={1} 
          className="card-responsive"
          sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}
        >
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            gutterBottom 
            fontWeight="600" 
            color="text.primary"
          >
            Categories
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {categories.map(category => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={category.id}>
                <Card 
                  className="card-responsive"
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider',
                    opacity: category.active ? 1 : 0.6,
                    '&:hover': { boxShadow: 2 },
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Stack 
                      direction="row"
                      justifyContent="space-between" 
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant={isMobile ? "body2" : "subtitle1"} 
                          fontWeight="600" 
                          color="text.primary"
                          noWrap
                        >
                          {category.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {menuItems.filter(item => item.category === category.id).length} items
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditCategory(category)}
                        className="btn-responsive"
                        sx={{ minWidth: 44, minHeight: 44 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Menu Items */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredItems.map(item => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card 
              className="card-responsive"
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid', 
                borderColor: 'divider',
                opacity: (item.available ?? item.isAvailable) ? 1 : 0.6,
                '&:hover': { boxShadow: 2 }
              }}
            >
              {item.image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image}
                  alt={item.name}
                />
              )}
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                    {/* Veg/Non-Veg Indicator */}
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        border: `2px solid ${item.isVeg ? 'green' : 'red'}`,
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
                          backgroundColor: item.isVeg ? 'green' : 'red',
                          borderRadius: '50%',
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="600" 
                      color="text.primary" 
                      sx={{ 
                        fontSize: '1rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                  {item.featured && (
                    <Chip label="Featured" size="small" color="primary" sx={{ flexShrink: 0, ml: 1 }} />
                  )}
                </Box>
                
                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, lineHeight: 1.4 }}>
                  {item.description}
                </Typography>
                
                {/* Price and Category */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary.main" fontWeight="600">
                    {formatCurrency(item.price)}
                  </Typography>
                  <Chip 
                    label={getCategoryName(item.category)} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
                
                {/* Details */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.preparationTime} min
                  </Typography>
                  {item.calories && (
                    <Typography variant="caption" color="text.secondary">
                      {item.calories} cal
                    </Typography>
                  )}
                  <Chip 
                    label={(item.available ?? item.isAvailable) ? 'Available' : 'Unavailable'} 
                    size="small" 
                    color={(item.available ?? item.isAvailable) ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
                
                {/* Actions - Push to bottom */}
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={(item.available ?? item.isAvailable) ? 'Mark Unavailable' : 'Mark Available'}>
                      <IconButton size="small" onClick={() => handleToggleAvailability(item.id)}>
                        {(item.available ?? item.isAvailable) ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => handleEditItem(item)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

        {filteredItems.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
              <Restaurant sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                color="text.secondary" 
                fontWeight="600"
                gutterBottom
              >
                No menu items found
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ maxWidth: 400, mx: 'auto' }}
              >
                Try adjusting your filters or add new menu items
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Menu Item Dialog */}
        <MenuItemDialog
          open={openItemDialog}
          onClose={() => setOpenItemDialog(false)}
          onSave={handleSaveItem}
          item={editingItem}
          categories={categories.filter(cat => cat.active)}
          isMobile={isMobile}
        />

        {/* Category Dialog */}
        <CategoryDialog
          open={openCategoryDialog}
          onClose={() => setOpenCategoryDialog(false)}
          onSave={handleSaveCategory}
          category={editingCategory}
          isMobile={isMobile}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

// Enhanced Menu Item Dialog Component
interface MenuItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<MenuItemType>) => void;
  item: MenuItemType | null;
  categories: CategoryType[];
  isMobile?: boolean;
}

const MenuItemDialog: React.FC<MenuItemDialogProps> = ({ open, onClose, onSave, item, categories, isMobile = false }) => {
  const [formData, setFormData] = useState<Partial<MenuItemType>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    available: true,
    featured: false,
    allergens: [],
    preparationTime: 0,
    calories: 0,
    spicyLevel: 0,
    isVeg: true,
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        available: true,
        featured: false,
        allergens: [],
        preparationTime: 0,
        calories: 0,
        spicyLevel: 0,
        isVeg: true,
      });
    }
  }, [item, open]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600">
          {item ? 'Edit Menu Item' : 'Add Menu Item'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Item Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                {categories.map(category => (
                  <MuiMenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Price (₹)"
              type="number"
              value={formData.price === 0 ? '' : formData.price || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  e.target.select(); // Select all text so typing replaces it
                }
              }}
              placeholder="0"
              InputProps={{
                startAdornment: '₹',
              }}
              inputProps={{
                min: 0,
                step: 0.01,
                onWheel: (e: any) => e.preventDefault(),
                style: { MozAppearance: 'textfield' } // Remove spinner arrows in Firefox
              }}
              sx={{
                '& input[type=number]': {
                  '&::-webkit-outer-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                  '&::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Preparation Time (minutes)"
              type="number"
              value={formData.preparationTime === 0 ? '' : formData.preparationTime || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  e.target.select(); // Select all text so typing replaces it
                }
              }}
              placeholder="0"
              inputProps={{
                min: 0,
                step: 1,
                onWheel: (e: any) => e.preventDefault(),
                style: { MozAppearance: 'textfield' } // Remove spinner arrows in Firefox
              }}
              sx={{
                '& input[type=number]': {
                  '&::-webkit-outer-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                  '&::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Calories (optional)"
              type="number"
              value={formData.calories === 0 ? '' : formData.calories || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value ? parseInt(e.target.value) : undefined }))}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  e.target.select(); // Select all text so typing replaces it
                }
              }}
              placeholder="Enter calories"
              inputProps={{
                min: 0,
                step: 1,
                onWheel: (e: any) => e.preventDefault(),
                style: { MozAppearance: 'textfield' } // Remove spinner arrows in Firefox
              }}
              sx={{
                '& input[type=number]': {
                  '&::-webkit-outer-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                  '&::-webkit-inner-spin-button': {
                    '-webkit-appearance': 'none',
                    margin: 0,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isVeg || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVeg: e.target.checked }))}
                />
              }
              label="Vegetarian"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.available || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                />
              }
              label="Available"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.featured || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                />
              }
              label="Featured Item"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {item ? 'Update' : 'Add'} Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Category Dialog Component
interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: Partial<CategoryType>) => void;
  category: CategoryType | null;
  isMobile?: boolean;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ open, onClose, onSave, category, isMobile = false }) => {
  const [formData, setFormData] = useState<Partial<CategoryType>>({
    name: '',
    description: '',
    active: true,
  });

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        name: '',
        description: '',
        active: true,
      });
    }
  }, [category, open]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : 'calc(100vh - 64px)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600">
          {category ? 'Edit Category' : 'Add Category'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {category ? 'Update' : 'Add'} Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuManagement;