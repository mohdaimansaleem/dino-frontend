import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Modal,
  Backdrop,
  Fade,
  AppBar,
  Toolbar,
  IconButton,
  Stack
} from '@mui/material';
import { Close, CloudUpload } from '@mui/icons-material';

interface MenuItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: any, imageFile?: File) => void;
  item: any | null;
  categories: any[];
  isMobile?: boolean;
}

const MenuItemDialog: React.FC<MenuItemDialogProps> = ({
  open,
  onClose,
  onSave,
  item,
  categories,
  isMobile = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    isVeg: true,
    available: true,
    preparationTime: 15,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price || 0,
        category: item.category || '',
        isVeg: item.isVeg || false,
        available: item.available ?? item.isAvailable ?? true,
        preparationTime: item.preparationTime || 15,
      });
      setImagePreview(item.image || '');
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        isVeg: true,
        available: true,
        preparationTime: 0,
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [item, open]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData, imageFile || undefined);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isMobile) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '95%',
              maxWidth: '500px',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {item ? 'Edit Menu Item' : 'Add Menu Item'}
                </Typography>
                <IconButton edge="end" color="inherit" onClick={onClose}>
                  <Close />
                </IconButton>
              </Toolbar>
            </AppBar>

            <Box sx={{ overflow: 'auto', p: { xs: 2, sm: 3 } }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Item Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="Price (₹)"
                    type="text"
                    value={formData.price === 0 ? '' : formData.price.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        const numValue = value === '' ? 0 : parseFloat(value) || 0;
                        handleChange('price', numValue);
                      }
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    placeholder="Enter price"
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*\\.?[0-9]*'
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Prep Time (min)"
                    type="text"
                    value={formData.preparationTime === 0 ? '' : formData.preparationTime.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = value === '' ? 0 : parseInt(value) || 0;
                        handleChange('preparationTime', numValue);
                      }
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    placeholder="e.g., 15"
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*'
                    }}
                  />
                </Stack>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    label="Category"
                  >
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isVeg}
                        onChange={(e) => handleChange('isVeg', e.target.checked)}
                      />
                    }
                    label="Vegetarian"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.available}
                        onChange={(e) => handleChange('available', e.target.checked)}
                      />
                    }
                    label="Available"
                  />
                </Stack>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Item Image
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                  {imagePreview && (
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  )}
                </Box>
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
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
        <Typography variant="h5" fontWeight="600">
          {item ? 'Edit Menu Item' : 'Add Menu Item'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 4 }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Item Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
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
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Price (₹)"
              type="text"
              value={formData.price === 0 ? '' : formData.price.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  const numValue = value === '' ? 0 : parseFloat(value) || 0;
                  handleChange('price', numValue);
                }
              }}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  e.target.select();
                }
              }}
              placeholder="Enter price"
              inputProps={{
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*'
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Preparation Time (minutes)"
              type="text"
              value={formData.preparationTime === 0 ? '' : formData.preparationTime.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  const numValue = value === '' ? 0 : parseInt(value) || 0;
                  handleChange('preparationTime', numValue);
                }
              }}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  e.target.select();
                }
              }}
              placeholder="e.g., 15"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2} sx={{ height: '100%', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isVeg}
                    onChange={(e) => handleChange('isVeg', e.target.checked)}
                  />
                }
                label="Vegetarian"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.available}
                    onChange={(e) => handleChange('available', e.target.checked)}
                  />
                }
                label="Available"
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight="600">
              Item Image
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ mb: 2 }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {imagePreview && (
              <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  ml: 2
                }}
              />
            )}
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

export default MenuItemDialog;