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
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Category,
  Search,
} from '@mui/icons-material';

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
}

interface CategoryType {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
}

const EnhancedMenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Mock data
  useEffect(() => {
    setCategories([
      { id: '1', name: 'Appetizers', description: 'Start your meal right', order: 1, active: true },
      { id: '2', name: 'Main Courses', description: 'Hearty main dishes', order: 2, active: true },
      { id: '3', name: 'Desserts', description: 'Sweet endings', order: 3, active: true },
      { id: '4', name: 'Beverages', description: 'Refreshing drinks', order: 4, active: true },
    ]);

    setMenuItems([
      {
        id: '1',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan cheese and croutons',
        price: 12.99,
        category: '1',
        available: true,
        featured: false,
        allergens: ['dairy', 'gluten'],
        preparationTime: 10,
        calories: 350,
        spicyLevel: 0,
      },
      {
        id: '2',
        name: 'Grilled Salmon',
        description: 'Atlantic salmon with herbs and lemon',
        price: 24.99,
        category: '2',
        available: true,
        featured: true,
        allergens: ['fish'],
        preparationTime: 20,
        calories: 450,
        spicyLevel: 0,
      },
      {
        id: '3',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream',
        price: 8.99,
        category: '3',
        available: true,
        featured: false,
        allergens: ['dairy', 'eggs', 'gluten'],
        preparationTime: 5,
        calories: 520,
        spicyLevel: 0,
      },
    ]);
  }, []);

  const handleAddItem = () => {
    setEditingItem(null);
    setOpenItemDialog(true);
  };

  const handleEditItem = (item: MenuItemType) => {
    setEditingItem(item);
    setOpenItemDialog(true);
  };

  const handleDeleteItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    setSnackbar({ open: true, message: 'Menu item deleted successfully', severity: 'success' });
  };

  const handleSaveItem = (itemData: Partial<MenuItemType>) => {
    if (editingItem) {
      // Update existing item
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, ...itemData } : item
      ));
      setSnackbar({ open: true, message: 'Menu item updated successfully', severity: 'success' });
    } else {
      // Add new item
      const newItem: MenuItemType = {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: 0,
        category: '',
        available: true,
        featured: false,
        allergens: [],
        preparationTime: 0,
        ...itemData,
      };
      setMenuItems(prev => [...prev, newItem]);
      setSnackbar({ open: true, message: 'Menu item added successfully', severity: 'success' });
    }
    setOpenItemDialog(false);
  };

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setOpenCategoryDialog(true);
  };

  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category);
    setOpenCategoryDialog(true);
  };

  const handleSaveCategory = (categoryData: Partial<CategoryType>) => {
    if (editingCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat
      ));
      setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
    } else {
      const newCategory: CategoryType = {
        id: Date.now().toString(),
        name: '',
        description: '',
        order: categories.length + 1,
        active: true,
        ...categoryData,
      };
      setCategories(prev => [...prev, newCategory]);
      setSnackbar({ open: true, message: 'Category added successfully', severity: 'success' });
    }
    setOpenCategoryDialog(false);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
          Menu Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your restaurant's menu items and categories
        </Typography>
      </Box>

      {/* Controls */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Category />}
                onClick={handleAddCategory}
              >
                Manage Categories
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddItem}
              >
                Add Menu Item
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
                    <IconButton size="small" onClick={() => handleEditCategory(category)}>
                      <Edit fontSize="small" />
                    </IconButton>
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
                border: '1px solid', 
                borderColor: 'divider',
                opacity: item.available ? 1 : 0.6,
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
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ fontSize: '1rem' }}>
                    {item.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {item.featured && (
                      <Chip label="Featured" size="small" color="primary" />
                    )}
                    <IconButton size="small" onClick={() => handleToggleAvailability(item.id)}>
                      {item.available ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40 }}>
                  {item.description}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" color="primary.main" fontWeight="600">
                    ${item.price.toFixed(2)}
                  </Typography>
                  <Chip 
                    label={getCategoryName(item.category)} 
                    size="small" 
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.preparationTime} min
                  </Typography>
                  {item.calories && (
                    <Typography variant="caption" color="text.secondary">
                      {item.calories} cal
                    </Typography>
                  )}
                </Box>
                
                {item.allergens.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {item.allergens.map(allergen => (
                      <Chip 
                        key={allergen} 
                        label={allergen} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </Button>
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

      {/* Menu Item Dialog */}
      <MenuItemDialog
        open={openItemDialog}
        onClose={() => setOpenItemDialog(false)}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
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

// Menu Item Dialog Component
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
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
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
              label="Price"
              type="number"
              value={formData.price || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              InputProps={{
                startAdornment: '$',
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

export default EnhancedMenuManagement;