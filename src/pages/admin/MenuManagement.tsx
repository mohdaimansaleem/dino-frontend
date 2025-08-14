import React, { useState, useEffect } from 'react';
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
  Avatar,
  Modal,
  Backdrop,
  Fade,
  AppBar,
  Toolbar,
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
  Schedule,
  Refresh,
  Close
} from '@mui/icons-material';
import { menuService } from '../../services/menuService';
import { useUserData } from '../../contexts/UserDataContext';

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

  // Load data on mount and when venue becomes available
  useEffect(() => {
    const loadMenuData = async () => {
      // Don't proceed if UserDataContext is still loading
      if (userDataLoading) {
        return;
      }

      const venue = getVenue();
      
      if (!venue?.id) {
        setError('No venue assigned to your account. Please contact support.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        // Make API calls
        const categoriesPromise = menuService.getMenuCategories({ venue_id: venue.id });
        const menuItemsPromise = menuService.getMenuItems({ venue_id: venue.id });

        const [categoriesData, menuItemsData] = await Promise.all([
          categoriesPromise,
          menuItemsPromise
        ]);

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

        // Update state
        setCategories(processedCategories);
        setMenuItems(processedMenuItems);
        
      } catch (error) {
        setMenuItems([]);
        setCategories([]);
        setSnackbar({
          open: true,
          message: 'Failed to load menu data. Please try refreshing.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure everything is ready
    const timeoutId = setTimeout(loadMenuData, 100);
    
    return () => clearTimeout(timeoutId);
  }, [userDataLoading, userData, getVenue]);



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

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      
      // Check if category has menu items
      const itemsInCategory = menuItems.filter(item => item.category === categoryId);
      if (itemsInCategory.length > 0) {
        setSnackbar({ 
          open: true, 
          message: `Cannot delete category "${category?.name}": ${itemsInCategory.length} menu items are assigned to this category. Please reassign or delete items first.`, 
          severity: 'error' 
        });
        return;
      }
      
      await menuService.deleteMenuCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      setSnackbar({ open: true, message: `Category "${category?.name}" deleted successfully`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete category', severity: 'error' });
    }
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

  const handleRefreshMenu = async () => {
    const venue = getVenue();
    if (!venue?.id) {
      setSnackbar({
        open: true,
        message: 'No venue available to refresh menu data',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Make API calls to refresh data
      const categoriesPromise = menuService.getMenuCategories({ venue_id: venue.id });
      const menuItemsPromise = menuService.getMenuItems({ venue_id: venue.id });

      const [categoriesData, menuItemsData] = await Promise.all([
        categoriesPromise,
        menuItemsPromise
      ]);

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

      // Update state
      setCategories(processedCategories);
      setMenuItems(processedMenuItems);
      
      setSnackbar({
        open: true,
        message: 'Menu data refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh menu data. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
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
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1,
                  letterSpacing: '-0.01em'
                }}
              >
                Menu Management
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400
                }}
              >
                Manage your restaurant's menu items and categories for {getVenueDisplayName()}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Enhanced Controls */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}
        >
          {/* First Row - Search and Filters */}
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={6} md={3}>
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
            <Grid item xs={6} md={3}>
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
            
          </Grid>

          {/* Second Row - Category Filter and Action Buttons */}
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth className="input-responsive">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                  size={isMobile ? "medium" : "medium"}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
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
            <Grid item xs={12} md={6}>
              <Stack 
                direction={{ xs: 'row', sm: 'row' }}
                spacing={2}
                justifyContent={{ xs: 'stretch', md: 'flex-end' }}
              >
                <Button
                  variant="outlined"
                  startIcon={<Category />}
                  onClick={handleAddCategory}
                  className="btn-responsive"
                  size={isMobile ? "medium" : "medium"}
                  fullWidth={isMobile}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50'
                    }
                  }}
                >
                  {isMobile ? "Categories" : "Manage Categories"}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  className="btn-responsive"
                  size={isMobile ? "medium" : "medium"}
                  fullWidth={isMobile}
                  sx={{
                    fontWeight: 600,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  Menu Item
                </Button>
                <IconButton
                  onClick={handleRefreshMenu}
                  size="large"
                  sx={{
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                    width: '56px',
                    height: '56px',
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    },
                  }}
                  title="Refresh menu data"
                >
                  <Refresh />
                </IconButton>
              </Stack>
            </Grid>
            
          </Grid>
        </Paper>

        {/* Menu Statistics */}
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          {[
            { 
              label: 'Total Items', 
              value: menuItems.length, 
              color: '#2196F3', 
              icon: <Restaurant />,
              description: 'All menu items'
            },
            { 
              label: 'Available', 
              value: menuItems.filter(item => item.available ?? item.isAvailable).length, 
              color: '#4CAF50', 
              icon: <Visibility />,
              description: 'Currently available'
            },
            { 
              label: 'Vegetarian', 
              value: menuItems.filter(item => item.isVeg).length, 
              color: '#8BC34A', 
              icon: <Nature />,
              description: 'Vegetarian items'
            },
            { 
              label: 'Categories', 
              value: categories.filter(cat => cat.active).length, 
              color: '#FF9800', 
              icon: <Category />,
              description: 'Active categories'
            },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                sx={{ 
                  p: 3, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }}
                  alignItems={{ xs: 'center', sm: 'flex-start' }}
                  spacing={{ xs: 1, sm: 2 }}
                  textAlign={{ xs: 'center', sm: 'left' }}
                >
                  <Avatar sx={{ 
                    backgroundColor: stat.color, 
                    width: { xs: 40, sm: 48 }, 
                    height: { xs: 40, sm: 48 } 
                  }}>
                    {React.cloneElement(stat.icon, { 
                      fontSize: isMobile ? 'medium' : 'large' 
                    })}
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isMobile ? "h6" : "h4"} 
                      fontWeight="bold" 
                      color="text.primary"
                      sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                    >
                      {stat.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Categories Overview */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              fontWeight="600" 
              color="text.primary"
              sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
            >
              Menu Categories
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={handleAddCategory}
              sx={{ 
                minWidth: 'auto',
                px: 2,
                fontSize: '0.875rem'
              }}
            >
              Add Category
            </Button>
          </Box>
          
          {categories.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Category sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" fontWeight="600" gutterBottom>
                No Categories Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first category to organize your menu items
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={handleAddCategory}
                size="small"
              >
                Create Category
              </Button>
            </Box>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 2 }}>
              {categories.map(category => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                  <Card 
                    sx={{ 
                      border: '1px solid', 
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      borderLeft: `4px solid ${category.active ? theme.palette.primary.main : theme.palette.grey[400]}`,
                      opacity: category.active ? 1 : 0.6,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': { 
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-2px)'
                      },
                      height: '100%',
                      minHeight: 120,
                      maxWidth: '100%',
                      overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ 
                      p: { xs: 2, sm: 2.5 }, 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Stack 
                        direction="row"
                        justifyContent="space-between" 
                        alignItems="flex-start"
                        spacing={1}
                        sx={{ mb: 1 }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight="600" 
                            color="text.primary"
                            sx={{ 
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mb: 0.5
                            }}
                          >
                            {category.name}
                          </Typography>
                          {category.description && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                fontSize: '0.75rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.3,
                                mb: 1
                              }}
                            >
                              {category.description}
                            </Typography>
                          )}
                          <Chip
                            label={`${menuItems.filter(item => item.category === category.id).length} items`}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontSize: '0.7rem',
                              height: 20,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditCategory(category)}
                            sx={{ 
                              minWidth: 32, 
                              minHeight: 32,
                              p: 0.5,
                              '&:hover': { backgroundColor: 'primary.50' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteCategory(category.id)}
                            sx={{ 
                              minWidth: 32, 
                              minHeight: 32,
                              p: 0.5,
                              color: 'error.main',
                              '&:hover': { backgroundColor: 'error.50' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        {/* Menu Items Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            fontWeight="600" 
            color="text.primary"
            sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
          >
            Menu Items ({filteredItems.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={`${menuItems.filter(item => item.available ?? item.isAvailable).length} Available`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip 
              label={`${menuItems.filter(item => !(item.available ?? item.isAvailable)).length} Unavailable`}
              size="small"
              color="error"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Menu Items Grid */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredItems.map(item => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid', 
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  borderLeft: `4px solid ${(item.available ?? item.isAvailable) ? theme.palette.success.main : theme.palette.error.main}`,
                  opacity: (item.available ?? item.isAvailable) ? 1 : 0.6,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)'
                  },
                  minHeight: 320,
                  maxWidth: '100%',
                  overflow: 'hidden'
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
              <CardContent sx={{ 
                p: { xs: 2, sm: 2.5 }, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                overflow: 'hidden'
              }}>
                {/* Header with Veg/Non-Veg indicator and name */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flex: 1, minWidth: 0 }}>
                    {/* Veg/Non-Veg Indicator */}
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        border: `2px solid ${item.isVeg ? '#4CAF50' : '#F44336'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.2
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          backgroundColor: item.isVeg ? '#4CAF50' : '#F44336',
                          borderRadius: '50%',
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="600" 
                        color="text.primary" 
                        sx={{ 
                          fontSize: { xs: '0.95rem', sm: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mb: 0.5
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        color="primary.main" 
                        fontWeight="700"
                        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                      >
                        {formatCurrency(item.price)}
                      </Typography>
                    </Box>
                  </Box>
                  {item.featured && (
                    <Chip 
                      label="Featured" 
                      size="small" 
                      color="primary" 
                      sx={{ 
                        flexShrink: 0, 
                        ml: 1,
                        fontSize: '0.7rem',
                        height: 20
                      }} 
                    />
                  )}
                </Box>
                
                {/* Description */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2, 
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 60
                  }}
                >
                  {item.description}
                </Typography>
                
                {/* Category and Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={getCategoryName(item.category)} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.7rem',
                      maxWidth: '60%',
                      '& .MuiChip-label': { 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }
                    }}
                  />
                  <Chip 
                    label={(item.available ?? item.isAvailable) ? 'Available' : 'Unavailable'} 
                    size="small" 
                    color={(item.available ?? item.isAvailable) ? 'success' : 'error'}
                    variant="filled"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>
                
                {/* Details Row */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2,
                  gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Schedule fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {item.preparationTime} min
                    </Typography>
                  </Box>
                  {item.calories && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocalDining fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {item.calories} cal
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {item.isVeg ? (
                      <Nature fontSize="small" sx={{ color: '#4CAF50' }} />
                    ) : (
                      <LocalDining fontSize="small" sx={{ color: '#F44336' }} />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Actions - Push to bottom */}
                <Box sx={{ 
                  mt: 'auto', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  pt: 1,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={(item.available ?? item.isAvailable) ? 'Mark Unavailable' : 'Mark Available'}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleToggleAvailability(item.id)}
                        sx={{ 
                          minWidth: 32, 
                          minHeight: 32,
                          '&:hover': { 
                            backgroundColor: (item.available ?? item.isAvailable) ? 'error.50' : 'success.50'
                          }
                        }}
                      >
                        {(item.available ?? item.isAvailable) ? 
                          <VisibilityOff fontSize="small" /> : 
                          <Visibility fontSize="small" />
                        }
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Item">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditItem(item)}
                        sx={{ 
                          minWidth: 32, 
                          minHeight: 32,
                          '&:hover': { backgroundColor: 'primary.50' }
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete fontSize="small" />}
                    onClick={() => handleDeleteItem(item.id)}
                    sx={{ 
                      fontSize: '0.75rem',
                      px: 1.5,
                      py: 0.5,
                      minHeight: 28
                    }}
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
          <Box
            sx={{
              width: '100%',
              mt: 4
            }}
          >
            <Paper 
              elevation={1} 
              sx={{ 
                p: { xs: 4, sm: 6 }, 
                textAlign: 'center', 
                border: '1px solid', 
                borderColor: 'divider',
                backgroundColor: 'background.paper'
              }}
            >
              <Restaurant sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                color="text.secondary" 
                fontWeight="600"
                gutterBottom
              >
                {menuItems.length === 0 ? 'No Menu Items Yet' : 'No Items Match Your Filters'}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}
              >
                {menuItems.length === 0 
                  ? 'Get started by adding your first menu item to showcase your delicious offerings to customers.'
                  : 'Try adjusting your search terms or filters to find the items you\'re looking for.'
                }
              </Typography>
              {menuItems.length === 0 ? (
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  onClick={handleAddItem}
                  size={isMobile ? "medium" : "large"}
                >
                  Add Your First Menu Item
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchTerm('');
                      setVegFilter('all');
                      setAvailabilityFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={handleAddItem}
                  >
                    Add New Item
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
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

  if (isMobile) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '5%',
              left: '5%',
              right: '5%',
              bottom: '5%',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {item ? 'Edit Menu Item' : 'Add Menu Item'}
                </Typography>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={onClose}
                  aria-label="close"
                >
                  <Close />
                </IconButton>
              </Toolbar>
            </AppBar>

            {/* Modal Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Item Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
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
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Price (₹)"
                    type="number"
                    value={formData.price === 0 ? '' : formData.price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
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
                      style: { MozAppearance: 'textfield' }
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
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Prep Time (min)"
                    type="number"
                    value={formData.preparationTime === 0 ? '' : formData.preparationTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    placeholder="0"
                    inputProps={{
                      min: 0,
                      step: 1,
                      onWheel: (e: any) => e.preventDefault(),
                      style: { MozAppearance: 'textfield' }
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Calories (optional)"
                    type="number"
                    value={formData.calories === 0 ? '' : formData.calories || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value ? parseInt(e.target.value) : undefined }))}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    placeholder="Enter calories"
                    inputProps={{
                      min: 0,
                      step: 1,
                      onWheel: (e: any) => e.preventDefault(),
                      style: { MozAppearance: 'textfield' }
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
                <Grid item xs={6}>
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
                <Grid item xs={6}>
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
                <Grid item xs={12}>
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
            </Box>

            {/* Modal Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Stack direction="row" spacing={2}>
                <Button onClick={onClose} fullWidth variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" fullWidth>
                  {item ? 'Update' : 'Add'} Item
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>
      </Modal>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: 'calc(100vh - 64px)'
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

  if (isMobile) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              left: '5%',
              right: '5%',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '60vh',
            }}
          >
            {/* Modal Header */}
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {category ? 'Edit Category' : 'Add Category'}
                </Typography>
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={onClose}
                  aria-label="close"
                >
                  <Close />
                </IconButton>
              </Toolbar>
            </AppBar>

            {/* Modal Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              <Grid container spacing={3}>
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
            </Box>

            {/* Modal Footer */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Stack direction="row" spacing={2}>
                <Button onClick={onClose} fullWidth variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" fullWidth>
                  {category ? 'Update' : 'Add'} Category
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>
      </Modal>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: 'calc(100vh - 64px)'
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