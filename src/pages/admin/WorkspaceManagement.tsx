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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  VisibilityOff,
  SwapHoriz,
  Restaurant,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import PermissionService from '../../services/permissionService';
import { PERMISSIONS } from '../../types/auth';

const WorkspaceManagement: React.FC = () => {
  const { user: currentUser, hasPermission, isSuperAdmin } = useAuth();
  const {
    currentCafe,
    cafes,
    switchCafe,
    createCafe,
    updateCafe,
    deleteCafe,
    toggleCafeStatus,
  } = useWorkspace();

  const [openCafeDialog, setOpenCafeDialog] = useState(false);
  const [editingCafe, setEditingCafe] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [cafeFormData, setCafeFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
    isOpen: true,
  });

  // Cafe Management
  const handleOpenCafeDialog = (cafe?: any) => {
    if (cafe) {
      setEditingCafe(cafe);
      setCafeFormData({
        name: cafe.name,
        description: cafe.description || '',
        address: cafe.address,
        phone: cafe.phone,
        email: cafe.email,
        isActive: cafe.isActive,
        isOpen: cafe.isOpen,
      });
    } else {
      setEditingCafe(null);
      setCafeFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        isActive: true,
        isOpen: true,
      });
    }
    setOpenCafeDialog(true);
  };

  const handleCloseCafeDialog = () => {
    setOpenCafeDialog(false);
    setEditingCafe(null);
  };

  const handleSubmitCafe = async () => {
    try {
      if (editingCafe) {
        await updateCafe(editingCafe.id, cafeFormData);
      } else {
        await createCafe(cafeFormData);
      }
      handleCloseCafeDialog();
    } catch (error) {
      // Handle error
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleSwitchCafe = async (cafeId: string) => {
    try {
      await switchCafe(cafeId);
    } catch (error) {
      // Handle error
    }
  };

  const handleToggleCafeStatus = async (cafeId: string, isOpen: boolean) => {
    try {
      await toggleCafeStatus(cafeId, isOpen);
    } catch (error) {
      // Handle error
    }
  };

  const canCreateCafes = hasPermission(PERMISSIONS.VENUE_ACTIVATE);
  const canDeleteItems = isSuperAdmin(); // Use proper role check

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Cafes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your cafe locations
          </Typography>
        </Box>
        {canCreateCafes && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenCafeDialog()}
            size="large"
          >
            Add Cafe
          </Button>
        )}
      </Box>

      {/* Cafes Grid */}
      {cafes.length > 0 ? (
        <Grid container spacing={3}>
          {cafes.map((cafe) => (
            <Grid item xs={12} sm={6} md={4} key={cafe.id}>
              <Card
                sx={{
                  border: cafe.id === currentCafe?.id ? '2px solid' : '1px solid',
                  borderColor: cafe.id === currentCafe?.id ? 'secondary.main' : 'divider',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">
                      {cafe.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, cafe)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {cafe.address}
                  </Typography>
                  
                  {cafe.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
                      {cafe.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={cafe.isActive ? 'Active' : 'Inactive'}
                      color={cafe.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={cafe.isOpen ? 'Open' : 'Closed'}
                      color={cafe.isOpen ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Button
                      size="small"
                      startIcon={cafe.isOpen ? <VisibilityOff /> : <Visibility />}
                      onClick={() => handleToggleCafeStatus(cafe.id, !cafe.isOpen)}
                    >
                      {cafe.isOpen ? 'Close' : 'Open'}
                    </Button>
                    
                    {cafe.id !== currentCafe?.id && (
                      <Button
                        size="small"
                        startIcon={<SwapHoriz />}
                        onClick={() => handleSwitchCafe(cafe.id)}
                      >
                        Switch
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            backgroundColor: 'white',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            p: 4,
          }}
        >
          <Restaurant
            sx={{
              fontSize: 80,
              color: 'text.secondary',
              mb: 2,
            }}
          />
          <Typography variant="h5" fontWeight="600" gutterBottom color="text.secondary">
            No Cafes Found
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
            You haven't added any cafes yet. Get started by creating your first cafe location.
          </Typography>
          {canCreateCafes && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenCafeDialog()}
              size="large"
            >
              Add Your First Cafe
            </Button>
          )}
        </Box>
      )}

      {/* Cafe Dialog */}
      <Dialog open={openCafeDialog} onClose={handleCloseCafeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCafe ? 'Edit Cafe' : 'Add New Cafe'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cafe Name"
                value={cafeFormData.name}
                onChange={(e) => setCafeFormData({ ...cafeFormData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={cafeFormData.description}
                onChange={(e) => setCafeFormData({ ...cafeFormData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={cafeFormData.address}
                onChange={(e) => setCafeFormData({ ...cafeFormData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={cafeFormData.phone}
                onChange={(e) => setCafeFormData({ ...cafeFormData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={cafeFormData.email}
                onChange={(e) => setCafeFormData({ ...cafeFormData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cafeFormData.isActive}
                    onChange={(e) => setCafeFormData({ ...cafeFormData, isActive: e.target.checked })}
                  />
                }
                label="Active Cafe"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cafeFormData.isOpen}
                    onChange={(e) => setCafeFormData({ ...cafeFormData, isOpen: e.target.checked })}
                  />
                }
                label="Currently Open"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCafeDialog}>Cancel</Button>
          <Button onClick={handleSubmitCafe} variant="contained">
            {editingCafe ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleOpenCafeDialog(selectedItem);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedItem) {
            handleToggleCafeStatus(selectedItem.id, !selectedItem.isOpen);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            {selectedItem?.isOpen ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {selectedItem?.isOpen ? 'Close Cafe' : 'Open Cafe'}
          </ListItemText>
        </MenuItem>

        {canDeleteItems && (
          <MenuItem onClick={() => {
            if (window.confirm('Are you sure you want to delete this cafe?')) {
              if (selectedItem) {
                deleteCafe(selectedItem.id);
              }
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
};

export default WorkspaceManagement;