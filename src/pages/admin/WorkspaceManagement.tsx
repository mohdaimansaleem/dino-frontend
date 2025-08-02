import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Alert,
  Tooltip,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Business,
  Restaurant,
  People,
  Settings,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  SwapHoriz,
  Store,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import PermissionService from '../../services/permissionService';
import { PERMISSIONS } from '../../types/auth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workspace-tabpanel-${index}`}
      aria-labelledby={`workspace-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const WorkspaceManagement: React.FC = () => {
  const { user: currentUser, hasPermission, isSuperAdmin } = useAuth();
  const {
    currentWorkspace,
    currentCafe,
    workspaces,
    cafes,
    pricingPlans,
    switchWorkspace,
    switchCafe,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    createCafe,
    updateCafe,
    deleteCafe,
    activateCafe,
    deactivateCafe,
    toggleCafeStatus,
  } = useWorkspace();

  const [tabValue, setTabValue] = useState(0);
  const [openWorkspaceDialog, setOpenWorkspaceDialog] = useState(false);
  const [openCafeDialog, setOpenCafeDialog] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<any>(null);
  const [editingCafe, setEditingCafe] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [menuType, setMenuType] = useState<'workspace' | 'cafe'>('workspace');

  const [workspaceFormData, setWorkspaceFormData] = useState({
    name: '',
    description: '',
    pricingPlan: 'basic',
  });

  const [cafeFormData, setCafeFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
    isOpen: true,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Workspace Management
  const handleOpenWorkspaceDialog = (workspace?: any) => {
    if (workspace) {
      setEditingWorkspace(workspace);
      setWorkspaceFormData({
        name: workspace.name,
        description: workspace.description || '',
        pricingPlan: workspace.pricingPlan?.name || 'basic',
      });
    } else {
      setEditingWorkspace(null);
      setWorkspaceFormData({
        name: '',
        description: '',
        pricingPlan: 'basic',
      });
    }
    setOpenWorkspaceDialog(true);
  };

  const handleCloseWorkspaceDialog = () => {
    setOpenWorkspaceDialog(false);
    setEditingWorkspace(null);
  };

  const handleSubmitWorkspace = async () => {
    try {
      if (editingWorkspace) {
        await updateWorkspace(editingWorkspace.id, workspaceFormData);
      } else {
        await createWorkspace(workspaceFormData);
      }
      handleCloseWorkspaceDialog();
    } catch (error) {
      console.error('Failed to save workspace:', error);
    }
  };

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
      console.error('Failed to save cafe:', error);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, item: any, type: 'workspace' | 'cafe') => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
    setMenuType(type);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleSwitchWorkspace = async (workspaceId: string) => {
    try {
      await switchWorkspace(workspaceId);
    } catch (error) {
      console.error('Failed to switch workspace:', error);
    }
  };

  const handleSwitchCafe = async (cafeId: string) => {
    try {
      await switchCafe(cafeId);
    } catch (error) {
      console.error('Failed to switch cafe:', error);
    }
  };

  const handleToggleCafeStatus = async (cafeId: string, isOpen: boolean) => {
    try {
      await toggleCafeStatus(cafeId, isOpen);
    } catch (error) {
      console.error('Failed to toggle cafe status:', error);
    }
  };

  const canManageWorkspaces = hasPermission(PERMISSIONS.WORKSPACE_UPDATE);
  const canCreateCafes = hasPermission(PERMISSIONS.VENUE_ACTIVATE);
  const canSwitchWorkspaces = hasPermission(PERMISSIONS.WORKSPACE_SWITCH);
  const canDeleteItems = isSuperAdmin(); // Use proper role check
  const canCreateWorkspaces = false; // SuperAdmin cannot create workspaces

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Workspace Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your workspaces, cafes, and switch between different locations
        </Typography>
      </Box>

      {/* Current Context */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Business color="primary" />
                <Typography variant="h6" fontWeight="600">
                  Current Workspace
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {currentWorkspace?.name || 'No Workspace Selected'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentWorkspace?.description || 'No description available'}
              </Typography>
              <Chip
                label={currentWorkspace?.pricingPlan?.displayName || 'Basic Plan'}
                color="primary"
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '2px solid', borderColor: 'secondary.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Restaurant color="secondary" />
                <Typography variant="h6" fontWeight="600">
                  Current Cafe
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {currentCafe?.name || 'No Cafe Selected'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentCafe?.address || 'No address available'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={currentCafe?.isActive ? 'Active' : 'Inactive'}
                  color={currentCafe?.isActive ? 'success' : 'default'}
                  size="small"
                />
                <Chip
                  label={currentCafe?.isOpen ? 'Open' : 'Closed'}
                  color={currentCafe?.isOpen ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Workspaces" />
          <Tab label="Cafes" />
          <Tab label="Settings" />
        </Tabs>
      </Box>

      {/* Workspaces Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="600">
            Workspaces
          </Typography>
          {canCreateWorkspaces && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenWorkspaceDialog()}
            >
              Create Workspace
            </Button>
          )}
          {!canCreateWorkspaces && isSuperAdmin() && (
            <Alert severity="info" sx={{ maxWidth: 400 }}>
              SuperAdmins cannot create workspaces. Contact system administrator.
            </Alert>
          )}
        </Box>

        <Grid container spacing={3}>
          {workspaces.map((workspace) => (
            <Grid item xs={12} sm={6} md={4} key={workspace.id}>
              <Card
                sx={{
                  border: workspace.id === currentWorkspace?.id ? '2px solid' : '1px solid',
                  borderColor: workspace.id === currentWorkspace?.id ? 'primary.main' : 'divider',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">
                      {workspace.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, workspace, 'workspace')}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {workspace.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip
                      label={workspace.pricingPlan?.displayName || 'Basic'}
                      size="small"
                      color="primary"
                    />
                    
                    {workspace.id !== currentWorkspace?.id && canSwitchWorkspaces && (
                      <Button
                        size="small"
                        startIcon={<SwapHoriz />}
                        onClick={() => handleSwitchWorkspace(workspace.id)}
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
      </TabPanel>

      {/* Cafes Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="600">
            Cafes
          </Typography>
          {canCreateCafes && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenCafeDialog()}
            >
              Add Cafe
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {cafes.map((cafe) => (
            <Grid item xs={12} sm={6} md={4} key={cafe.id}>
              <Card
                sx={{
                  border: cafe.id === currentCafe?.id ? '2px solid' : '1px solid',
                  borderColor: cafe.id === currentCafe?.id ? 'secondary.main' : 'divider',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">
                      {cafe.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, cafe, 'cafe')}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {cafe.address}
                  </Typography>
                  
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
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Settings
        </Typography>
        <Alert severity="info">
          Settings panel coming soon. This will include workspace preferences, billing information, and advanced configurations.
        </Alert>
      </TabPanel>

      {/* Workspace Dialog */}
      <Dialog open={openWorkspaceDialog} onClose={handleCloseWorkspaceDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWorkspace ? 'Edit Workspace' : 'Create New Workspace'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Workspace Name"
                value={workspaceFormData.name}
                onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={workspaceFormData.description}
                onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Pricing Plan</InputLabel>
                <Select
                  value={workspaceFormData.pricingPlan}
                  label="Pricing Plan"
                  onChange={(e) => setWorkspaceFormData({ ...workspaceFormData, pricingPlan: e.target.value })}
                >
                  {pricingPlans.map((plan) => (
                    <MenuItem key={plan.name} value={plan.name}>
                      {plan.displayName} - ${plan.price}/month
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWorkspaceDialog}>Cancel</Button>
          <Button onClick={handleSubmitWorkspace} variant="contained">
            {editingWorkspace ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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
          if (menuType === 'workspace') {
            handleOpenWorkspaceDialog(selectedItem);
          } else {
            handleOpenCafeDialog(selectedItem);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        {menuType === 'cafe' && (
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
        )}

        {canDeleteItems && (
          <MenuItem onClick={() => {
            if (window.confirm(`Are you sure you want to delete this ${menuType}?`)) {
              if (menuType === 'workspace' && selectedItem) {
                deleteWorkspace(selectedItem.id);
              } else if (menuType === 'cafe' && selectedItem) {
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