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
import { DEFAULTS } from '../../constants/app';
import { MenuItem, MenuCategory } from '../../types';

interface MenuItemType extends MenuItem {
  available?: boolean; // For backward compatibility
  featured?: boolean;
  allergens?: string[];
  calories?: number;
  spicyLevel?: number;
  dietaryInfo?: string[];
}

interface CategoryType extends MenuCategory {
  active?: boolean; // For backward compatibility
}

const MenuManagement: React.FC = () => {
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load menu data from API
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load categories and menu items in parallel
        const [categoriesData, menuItemsData] = await Promise.all([
          menuService.getMenuCategories({ venue_id: DEFAULTS.CAFE_ID }),
          menuService.getMenuItems({ venue_id: DEFAULTS.CAFE_ID })
        ]);

        // Map API data to component types
        setCategories(categoriesData.data.map((cat: any) => ({ 
          ...cat, 
          active: true,
          order: 0,
          cafeId: cat.venue_id
        } as unknown as CategoryType)));
        setMenuItems(menuItemsData.data.map((item: any) => ({
          ...item,
          price: item.base_price,
          category: item.category_id,
          isVeg: item.is_vegetarian || false,
          available: item.is_available,
          isAvailable: item.is_available,
          preparationTime: item.preparation_time_minutes || 15
        } as unknown as MenuItemType)));
      } catch (error) {
        setError('Failed to load menu data. Please try again.');
        setSnackbar({ 
          open: true, 
          message: 'Failed to load menu data. Please check your connection.', 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    loadMenuData();
  }, []);

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
        const response = await menuService.updateMenuItem(editingItem.id, {
          name: itemData.name,
          description: itemData.description,
          base_price: itemData.price,
          category_id: itemData.category,
          is_vegetarian: itemData.isVeg,
          is_available: itemData.available ?? itemData.isAvailable,
          preparation_time_minutes: itemData.preparationTime,
        });
        if (response.data) {
          setMenuItems(prev => prev.map(item => 
            item.id === editingItem.id ? { 
              ...item,
              price: response.data!.base_price,
              category: response.data!.category_id,
              isVeg: response.data!.is_vegetarian || false,
              available: response.data!.is_available,
              isAvailable: response.data!.is_available,
              preparationTime: response.data!.preparation_time_minutes || 15
            } as unknown as MenuItemType : item
          ));
        }
        setSnackbar({ open: true, message: 'Menu item updated successfully', severity: 'success' });
      } else {
        // Create new item
        const response = await menuService.createMenuItem({
          name: itemData.name || '',
          description: itemData.description || '',
          base_price: itemData.price || 0,
          category_id: itemData.category || '',
          venue_id: DEFAULTS.CAFE_ID,
          is_vegetarian: itemData.isVeg ?? true,
          preparation_time_minutes: itemData.preparationTime || 15,
        });
        if (response.data) {
          const newItem = {
            ...response.data!,
            price: response.data!.base_price,
            category: response.data!.category_id,
            isVeg: response.data!.is_vegetarian || false,
            available: response.data!.is_available,
            isAvailable: response.data!.is_available,
            preparationTime: response.data!.preparation_time_minutes || 15
          } as unknown as MenuItemType;
          setMenuItems(prev => [...prev, newItem]);
        }
        setSnackbar({ open: true, message: 'Menu item added successfully', severity: 'success' });
      }
      setOpenItemDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save menu item', severity: 'error' });
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
              cafeId: response.data!.venue_id
            } as unknown as CategoryType : cat
          ));
        }
        setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      } else {
        // Create new category
        const response = await menuService.createMenuCategory({
          name: categoryData.name || '',
          description: categoryData.description || '',
          venue_id: DEFAULTS.CAFE_ID,
        });
        if (response.data) {
          const newCategory = {
            ...response.data!,
            active: true,
            order: 0,
            cafeId: response.data!.venue_id
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

  const filteredItems = menuItems.filter(item => {
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
          Menu Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your restaurant's menu items and categories for Dino Cafe
        </Typography>
      </Box>

      {/* Enhanced Controls */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Veg/Non-Veg</InputLabel>
              <Select
                value={vegFilter}
                onChange={(e) => setVegFilter(e.target.value)}
                label="Veg/Non-Veg"
                size="small"
              >
                <MuiMenuItem value="all">All Items</MuiMenuItem>
                <MuiMenuItem value="veg">
                  <Nature sx={{ mr: 1, fontSize: 16, color: 'green' }} />
                  Vegetarian
                </MuiMenuItem>
                <MuiMenuItem value="non-veg">
                  <LocalDining sx={{ mr: 1, fontSize: 16, color: 'red' }} />
                  Non-Vegetarian
                </MuiMenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                label="Availability"
                size="small"
              >
                <MuiMenuItem value="all">All Items</MuiMenuItem>
                <MuiMenuItem value="available">Available</MuiMenuItem>
                <MuiMenuItem value="unavailable">Unavailable</MuiMenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Category />}
                onClick={handleAddCategory}
              >
                Categories
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddItem}
              >
                Add Item
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Categories Overview */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
          Categories
        </Typography>
        <Grid container spacing={2}>
          {categories.map(category => (
            <Grid item xs={12} sm={6} md={3} key={category.id}>
              <Card 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider',
                  opacity: category.active ? 1 : 0.6,
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {menuItems.filter(item => item.category === category.id).length} items
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleEditCategory(category)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Menu Items */}
      <Grid container spacing={3}>
        {filteredItems.map(item => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card 
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
              <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No menu items found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or add new menu items
          </Typography>
        </Box>
      )}

      {/* Menu Item Dialog */}
      <MenuItemDialog
        open={openItemDialog}
        onClose={() => setOpenItemDialog(false)}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories.filter(cat => cat.active)}
      />

      {/* Category Dialog */}
      <CategoryDialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
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
}

const MenuItemDialog: React.FC<MenuItemDialogProps> = ({ open, onClose, onSave, item, categories }) => {
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {item ? 'Edit Menu Item' : 'Add Menu Item'}
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
              value={formData.price || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              InputProps={{
                startAdornment: '₹',
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Preparation Time (minutes)"
              type="number"
              value={formData.preparationTime || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Calories (optional)"
              type="number"
              value={formData.calories || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value ? parseInt(e.target.value) : undefined }))}
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
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ open, onClose, onSave, category }) => {
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {category ? 'Edit Category' : 'Add Category'}
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