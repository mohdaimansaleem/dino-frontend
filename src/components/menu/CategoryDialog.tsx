import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
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
import { Close } from '@mui/icons-material';

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: any) => void;
  category: any | null;
  isMobile?: boolean;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  onClose,
  onSave,
  category,
  isMobile = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [category, open]);

  const handleSave = () => {
    onSave(formData);
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
              maxWidth: '450px',
              maxHeight: '85vh',
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
                  {category ? 'Edit Category' : 'Add Category'}
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
                  label="Category Name"
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
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
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
        <Typography variant="h5" fontWeight="600">
          {category ? 'Edit Category' : 'Add Category'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, py: 4 }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Category Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
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

export default CategoryDialog;