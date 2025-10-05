import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  keyframes,
} from '@mui/material';
import {
  Add,
  Category,
  Restaurant,
  Refresh,
  Store,
  CachedOutlined,
} from '@mui/icons-material';
import { menuService } from '../../services/business';
import { useUserData } from '../../contexts/UserDataContext';
import { DeleteConfirmationModal } from '../../components/modals';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { useMenuFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

// Menu Components
import MenuStats from '../../components/menu/MenuStats';
import MenuFilters from '../../components/menu/MenuFilters';
import MenuCategories from '../../components/menu/MenuCategories';
import MenuItemsGrid from '../../components/menu/MenuItemsGrid';
import MenuItemDialog from '../../components/menu/MenuItemDialog';
import CategoryDialog from '../../components/menu/CategoryDialog';

// Animation for refresh icon
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  available?: boolean;
  isAvailable?: boolean;
  preparationTime: number;
  image?: string;
  featured?: boolean;
  image_urls?: string[];
  // API fields
  base_price?: number;
  category_id?: string;
  venue_id?: string;
  is_vegetarian?: boolean;
  is_available?: boolean;
  preparation_time_minutes?: number;
  created_at?: string;
  updated_at?: string;
}

interface CategoryType {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  order?: number;
  venueId?: string;
  // API fields
  venue_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

const MenuManagement: React.FC = () => {
  const { getVenue, getVenueDisplayName, userData, loading: userDataLoading } = useUserData();
  const menuFlags = useMenuFlags();
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
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: '' as 'item' | 'category',
    id: '',
    name: '',
    loading: false
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Load data on mount
  useEffect(() => {
    const loadMenuData = async () => {
      if (userDataLoading) return;

      const venue = getVenue();
      if (!venue?.id) {
        setError('No venue assigned to your account. Please contact support.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        const [categoriesData, menuItemsData] = await Promise.all([
          menuService.getMenuCategories({ venue_id: venue.id }),
          menuService.getMenuItems({ venue_id: venue.id })
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
          preparationTime: item.preparation_time_minutes || 15,
          image: item.image_urls?.[0],
          image_urls: item.image_urls || []
        }));

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

    const timeoutId = setTimeout(loadMenuData, 100);
    return () => clearTimeout(timeoutId);
  }, [userDataLoading, userData, getVenue]);

  // Event handlers
  const handleAddItem = () => {
    setEditingItem(null);
    setOpenItemDialog(true);
  };

  const handleEditItem = (item: MenuItemType) => {
    setEditingItem(item);
    setOpenItemDialog(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = menuItems.find(item => item.id === itemId);
    if (!item) return;
    
    setDeleteModal({
      open: true,
      type: 'item',
      id: itemId,
      name: item.name,
      loading: false
    });
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
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;
    
    const itemsInCategory = menuItems.filter(item => item.category === categoryId);
    if (itemsInCategory.length > 0) {
      setSnackbar({ 
        open: true, 
        message: `Cannot delete category "${category.name}": ${itemsInCategory.length} menu items are assigned to this category.`, 
        severity: 'error' 
      });
      return;
    }
    
    setDeleteModal({
      open: true,
      type: 'category',
      id: categoryId,
      name: category.name,
      loading: false
    });
  };

  const confirmDeleteItem = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const item = menuItems.find(item => item.id === deleteModal.id);
      await menuService.deleteMenuItem(deleteModal.id);
      setMenuItems(prev => prev.filter(item => item.id !== deleteModal.id));
      setSnackbar({ open: true, message: `${item?.name} deleted successfully`, severity: 'success' });
      setDeleteModal({ open: false, type: 'item', id: '', name: '', loading: false });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete menu item', severity: 'error' });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const confirmDeleteCategory = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      const category = categories.find(cat => cat.id === deleteModal.id);
      await menuService.deleteMenuCategory(deleteModal.id);
      setCategories(prev => prev.filter(cat => cat.id !== deleteModal.id));
      setSnackbar({ open: true, message: `Category "${category?.name}" deleted successfully`, severity: 'success' });
      setDeleteModal({ open: false, type: 'category', id: '', name: '', loading: false });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete category', severity: 'error' });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveItem = async (itemData: any, imageFile?: File) => {
    try {
      if (editingItem) {
        // Update existing item
        const updateData = {
          name: itemData.name,
          description: itemData.description,
          base_price: itemData.price,
          category_id: itemData.category,
          is_vegetarian: itemData.isVeg,
          is_available: itemData.available,
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
              preparationTime: response.data!.preparation_time_minutes || 15,
              image: response.data!.image_urls?.[0] || item.image,
              image_urls: response.data!.image_urls || item.image_urls
            } as MenuItemType : item
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
          let newItem = {
            ...response.data!,
            price: response.data!.base_price,
            category: response.data!.category_id,
            isVeg: response.data!.is_vegetarian || false,
            available: response.data!.is_available || false,
            isAvailable: response.data!.is_available || false,
            preparationTime: response.data!.preparation_time_minutes || 15,
            image: response.data!.image_urls?.[0],
            image_urls: response.data!.image_urls || []
          } as MenuItemType;

          // If there's an image file to upload, upload it now
          if (imageFile) {
            try {
              const uploadResponse = await menuService.uploadMenuItemImage(response.data!.id, imageFile);
              if (uploadResponse.success && uploadResponse.data) {
                newItem = {
                  ...newItem,
                  image: uploadResponse.data.image_url,
                  image_urls: [uploadResponse.data.image_url]
                };
                setSnackbar({ open: true, message: 'Menu item and image added successfully', severity: 'success' });
              } else {
                setSnackbar({ open: true, message: 'Menu item added, but image upload failed', severity: 'warning' });
              }
            } catch (uploadError) {
              console.error('Image upload failed:', uploadError);
              setSnackbar({ open: true, message: 'Menu item added, but image upload failed', severity: 'warning' });
            }
          } else {
            setSnackbar({ open: true, message: 'Menu item added successfully', severity: 'success' });
          }

          setMenuItems(prev => [...prev, newItem]);
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

  const handleSaveCategory = async (categoryData: any) => {
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
            } as CategoryType : cat
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
          } as CategoryType;
          setCategories(prev => [...prev, newCategory]);
        }
        setSnackbar({ open: true, message: 'Category added successfully', severity: 'success' });
      }
      setOpenCategoryDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save category', severity: 'error' });
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
            available: response.data!.is_available,
            isAvailable: response.data!.is_available,
          } as MenuItemType : item
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

  const handleQuickImageUpload = async (itemId: string, file: File) => {
    try {
      const response = await menuService.uploadMenuItemImage(itemId, file);
      
      if (response.success && response.data) {
        setMenuItems(prev => prev.map(item => 
          item.id === itemId ? { 
            ...item,
            image: response.data!.image_url,
            image_urls: [...(item.image_urls || []), response.data!.image_url]
          } : item
        ));
        
        setSnackbar({
          open: true,
          message: 'Image uploaded successfully!',
          severity: 'success'
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to upload image',
        severity: 'error'
      });
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

      const [categoriesData, menuItemsData] = await Promise.all([
        menuService.getMenuCategories({ venue_id: venue.id }),
        menuService.getMenuItems({ venue_id: venue.id })
      ]);

      const processedCategories = (categoriesData.data || []).map((cat: any) => ({
        ...cat,
        active: true,
        order: 0,
        venueId: cat.venue_id
      }));

      const processedMenuItems = (menuItemsData.data || []).map((item: any) => ({
        ...item,
        price: item.base_price,
        category: item.category_id,
        isVeg: item.is_vegetarian || false,
        available: item.is_available,
        isAvailable: item.is_available,
        preparationTime: item.preparation_time_minutes || 15,
        image: item.image_urls?.[0],
        image_urls: item.image_urls || []
      }));

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

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setVegFilter('all');
    setAvailabilityFilter('all');
  };

  // Filter menu items
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
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        gap: 2,
        py: { xs: 2, sm: 4 }
      }}>
        <CircularProgress size={isMobile ? 48 : 60} />
        <Typography variant={isMobile ? "body1" : "h6"}>
          Loading Menu Management...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 4 }
      }}>
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant={isMobile ? "body1" : "h6"} gutterBottom fontWeight="600">
            Unable to Load Menu Data
          </Typography>
          <Typography variant="body2">
            Don't worry! You can still manage your menu. Start by adding your first menu item or category.
          </Typography>
        </Alert>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Button variant="contained" onClick={handleAddItem} fullWidth={isMobile}>
            Add Menu Item
          </Button>
          <Button variant="outlined" onClick={handleAddCategory} fullWidth={isMobile}>
            Add Category
          </Button>
          <Button variant="outlined" onClick={() => window.location.reload()} fullWidth={isMobile}>
            Retry Loading
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'auto',
        height: 'auto',
        backgroundColor: '#f8f9fa',
        padding: 0,
        margin: 0,
        width: '100%',
        overflow: 'visible',
        '& .MuiContainer-root': {
          padding: '0 !important',
          margin: '0 !important',
          maxWidth: 'none !important',
        },
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
          padding: 0,
          margin: 0,
          width: '100%',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 2, md: 3 },
              py: { xs: 3, sm: 4 },
              px: { xs: 3, sm: 4 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Restaurant sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  Menu Management
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400,
                  mb: 1,
                  maxWidth: '500px',
                  color: 'text.secondary',
                }}
              >
                Create and manage your restaurant's delicious menu offerings for {getVenueDisplayName()}
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Store sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                <Typography variant="body2" fontWeight="500" color="text.primary">
                  {getVenueDisplayName()}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons - Only Refresh */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={handleRefreshMenu}
                disabled={loading}
                size="medium"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                title={loading ? 'Refreshing...' : 'Refresh menu'}
              >
                {loading ? (
                  <CachedOutlined sx={{ animation: `${spin} 1s linear infinite` }} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          width: '100%',
          padding: 0,
          margin: 0,
        }}
      >
        <FlagGate flag="menu.showMenuStats">
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 2 }}>
            <MenuStats menuItems={menuItems} categories={categories} />
          </Box>
        </FlagGate>
        
        <Box sx={{ px: { xs: 3, sm: 4 }, mb: 4 }}>
          <MenuCategories
            categories={categories}
            menuItems={menuItems}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddCategory={handleAddCategory}
          />
        </Box>

        {/* Spacing between sections */}
        <Box sx={{ height: { xs: 16, sm: 20 } }} />

        <Box sx={{ px: { xs: 3, sm: 4 }, pb: 4 }}>
          <MenuItemsGrid
            filteredItems={filteredItems}
            menuItems={menuItems}
            categories={categories}
            getCategoryName={getCategoryName}
            formatCurrency={formatCurrency}
            onToggleAvailability={handleToggleAvailability}
            onQuickImageUpload={handleQuickImageUpload}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onClearFilters={handleClearFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            vegFilter={vegFilter}
            setVegFilter={setVegFilter}
            availabilityFilter={availabilityFilter}
            setAvailabilityFilter={setAvailabilityFilter}
          />
        </Box>

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

        {/* Dialogs */}
        <MenuItemDialog
          open={openItemDialog}
          onClose={() => setOpenItemDialog(false)}
          onSave={handleSaveItem}
          item={editingItem}
          categories={categories}
          isMobile={isMobile}
        />

        <CategoryDialog
          open={openCategoryDialog}
          onClose={() => setOpenCategoryDialog(false)}
          onSave={handleSaveCategory}
          category={editingCategory}
          isMobile={isMobile}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, type: 'item', id: '', name: '', loading: false })}
          onConfirm={deleteModal.type === 'item' ? confirmDeleteItem : confirmDeleteCategory}
          title={`Delete ${deleteModal.type === 'item' ? 'Menu Item' : 'Category'}`}
          itemName={deleteModal.name}
          itemType={deleteModal.type === 'item' ? 'menu item' : 'category'}
          description={
            deleteModal.type === 'item' 
              ? 'This menu item will be permanently removed from your restaurant\'s menu and will no longer be available for customers to order.'
              : 'This category will be permanently removed. Make sure no menu items are assigned to this category before deleting.'
          }
          loading={deleteModal.loading}
          additionalWarnings={
            deleteModal.type === 'item' 
              ? ['Any ongoing orders with this item may be affected', 'Item-specific analytics will be lost', 'Customer favorites may be impacted']
              : ['All menu items must be reassigned before deletion', 'Category-specific analytics will be lost', 'Menu organization will be affected']
          }
        />
      </Box>
    </Box>
  );
};

export default MenuManagement;