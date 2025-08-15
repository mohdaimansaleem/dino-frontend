import React, { useState, useEffect } from 'react';
import QRCodeViewer from '../../components/QRCodeViewer';
import QRCodeManager from '../../components/QRCodeManager';
import { tableService, Table } from '../../services/tableService';
import { useUserData } from '../../contexts/UserDataContext';
import { DeleteConfirmationModal } from '../../components/modals';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
  Avatar,
  Divider,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
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
  QrCode,
  TableRestaurant,
  People,
  LocationOn,
  Visibility,
  VisibilityOff,
  Print,
  CheckCircle,
  Cancel,
  Schedule,
  QrCodeScanner,
  Close,
  Refresh,
} from '@mui/icons-material';

// Local interface for table areas (backward compatibility)
interface TableArea {
  id: string;
  name: string;
  description?: string;
  color: string;
  active: boolean;
}

const TableManagement = () => {
  const { getVenue, getVenueDisplayName, userData, loading: userDataLoading } = useUserData();
  const [tables, setTables] = useState<Table[]>([]);
  const [areas, setAreas] = useState<TableArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [openTableDialog, setOpenTableDialog] = useState(false);
  const [openAreaDialog, setOpenAreaDialog] = useState(false);
  const [openQRViewer, setOpenQRViewer] = useState(false);
  const [openQRManager, setOpenQRManager] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editingArea, setEditingArea] = useState<TableArea | null>(null);
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: '' as 'table' | 'area',
    id: '',
    name: '',
    loading: false
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Function to refresh both areas and tables data
  const refreshData = async () => {
    const venue = getVenue();
    if (!venue?.id) {
      console.log('No venue ID available for refresh');
      return;
    }

    try {
      console.log('Refreshing table data for venue:', venue.id);

      // Load areas and tables from API directly
      const [areasData, tablesData] = await Promise.all([
        tableService.getAreas(venue.id),
        tableService.getTables({ venue_id: venue.id })
      ]);

      console.log('Areas refreshed:', areasData?.length || 0);
      console.log('Raw areas data:', areasData);
      console.log('Raw tables response:', tablesData);
      
      // Extract tables array from the response
      let validTables: Table[] = [];
      
      // The tableService.getTables() should return PaginatedResponse<Table>
      if (tablesData && tablesData.data && Array.isArray(tablesData.data)) {
        validTables = tablesData.data;
        console.log('✅ Extracted tables from PaginatedResponse:', validTables.length);
      } else {
        console.log('❌ Could not extract tables from response');
        console.log('tablesData structure:', {
          type: typeof tablesData,
          hasData: tablesData && 'data' in tablesData,
          dataType: tablesData && typeof tablesData.data,
          isDataArray: tablesData && Array.isArray(tablesData.data),
          keys: tablesData && Object.keys(tablesData)
        });
        validTables = [];
      }
      
      const validAreas = Array.isArray(areasData) ? areasData : [];

      console.log('Final data to set:');
      console.log('- Areas:', validAreas.length, validAreas);
      console.log('- Tables:', validTables.length, validTables);

      setAreas(validAreas);
      setTables(validTables);

      console.log('State updated - Areas:', validAreas.length, 'Tables:', validTables.length);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to refresh data. Please check your connection.', 
        severity: 'error' 
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // Wait for UserDataContext to finish loading
      if (userDataLoading) {
        console.log('UserDataContext still loading, waiting...');
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

        console.log('Loading table data for venue:', venue.id);

        // Load areas and tables from API directly
        const [areasData, tablesData] = await Promise.all([
          tableService.getAreas(venue.id),
          tableService.getTables({ venue_id: venue.id })
        ]);

        console.log('Initial load - Areas:', areasData?.length || 0);
        console.log('Initial load - Tables response:', tablesData);
        console.log('Initial load - Tables data:', tablesData.data?.length || 0);

        // Handle tables data structure consistently
        let initialTables: Table[] = [];
        if (Array.isArray(tablesData?.data)) {
          initialTables = tablesData.data;
        } else if (Array.isArray(tablesData)) {
          initialTables = tablesData;
        } else {
          initialTables = [];
        }

        console.log('Initial load - Final tables:', initialTables.length, initialTables);

        setAreas(areasData);
        setTables(initialTables);
      } catch (error) {
        setError('Failed to load table data. Please try again.');
        setSnackbar({ 
          open: true, 
          message: 'Failed to load table data. Please check your connection.', 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userDataLoading, getVenue]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('=== STATE CHANGE DEBUG ===');
    console.log('Areas state updated:', areas.length, areas);
    console.log('Tables state updated:', tables.length, tables);
    console.log('========================');
  }, [areas, tables]);

  const handleAddTable = () => {
    setEditingTable(null);
    setOpenTableDialog(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setOpenTableDialog(true);
  };

  const handleDeleteTable = async (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    setDeleteModal({
      open: true,
      type: 'table',
      id: tableId,
      name: `Table ${table.table_number}`,
      loading: false
    });
  };

  const confirmDeleteTable = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      console.log('Deleting table:', deleteModal.id);
      const response = await tableService.deleteTable(deleteModal.id);
      if (response.success) {
        console.log('Table deleted, refreshing data...');
        // Refresh both areas and tables data to update area table counts
        await refreshData();
        console.log('Data refreshed after table deletion');
        setSnackbar({ open: true, message: 'Table deleted successfully', severity: 'success' });
        setDeleteModal({ open: false, type: 'table', id: '', name: '', loading: false });
      }
    } catch (error: any) {
      console.error('Error deleting table:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to delete table', 
        severity: 'error' 
      });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveTable = async (tableData: any) => {
    try {
      if (editingTable) {
        // Update existing table
        const response = await tableService.updateTable(editingTable.id, {
          table_number: tableData.table_number || editingTable.table_number,
          capacity: tableData.capacity || editingTable.capacity,
          location: tableData.location || editingTable.location,
          table_status: tableData.table_status || editingTable.table_status,
          is_active: tableData.is_active !== undefined ? tableData.is_active : editingTable.is_active,
        });
        if (response.success && response.data) {
          // Refresh both areas and tables data to update area table counts
          await refreshData();
          setSnackbar({ open: true, message: 'Table updated successfully', severity: 'success' });
        }
      } else {
        // Create new table
        const venue = getVenue();
        if (!venue?.id) {
          throw new Error('No venue available');
        }
        
        const createData = {
          table_number: tableData.table_number || '1',
          capacity: typeof tableData.capacity === 'number' ? tableData.capacity : parseInt(tableData.capacity) || 2,
          location: tableData.location || '',
          venue_id: venue.id,
        };
        
        // Validate required fields
        if (!createData.table_number || createData.table_number.trim() === '') {
          throw new Error('Table number is required');
        }
        if (!createData.capacity || createData.capacity < 1) {
          throw new Error('Table capacity is required and must be at least 1');
        }
        if (!createData.venue_id) {
          throw new Error('Venue ID is required');
        }
        
        console.log('Creating table with data:', createData);
        console.log('Original form data:', tableData);
        
        const response = await tableService.createTable(createData);
        if (response.success && response.data) {
          // Refresh both areas and tables data to update area table counts
          await refreshData();
          setSnackbar({ open: true, message: 'Table added successfully', severity: 'success' });
        }
      }
      setOpenTableDialog(false);
    } catch (error: any) {
      console.error('Error saving table:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to save table', 
        severity: 'error' 
      });
    }
  };

  const handleToggleTableStatus = async (tableId: string) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      const newStatus = table.table_status === 'available' ? 'occupied' : 'available';
      const response = await tableService.updateTableStatus(tableId, newStatus);
      
      if (response.success) {
        setTables(prev => prev.map(t => 
          t.id === tableId ? { ...t, table_status: newStatus } : t
        ));
        setSnackbar({ 
          open: true, 
          message: `Table status updated to ${newStatus}`, 
          severity: 'success' 
        });
      }
    } catch (error: any) {
      console.error('Error updating table status:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to update table status', 
        severity: 'error' 
      });
    }
  };

  const handleAddArea = () => {
    setEditingArea(null);
    setOpenAreaDialog(true);
  };

  const handleEditArea = (area: TableArea) => {
    setEditingArea(area);
    setOpenAreaDialog(true);
  };

  const handleDeleteArea = async (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    if (!area) return;
    
    // Check if area has tables assigned to it
    const tablesInArea = tables.filter(table => (table.location || '') === areaId);
    if (tablesInArea.length > 0) {
      setSnackbar({ 
        open: true, 
        message: `Cannot delete area "${area.name}": ${tablesInArea.length} tables are assigned to this area. Please reassign or delete tables first.`, 
        severity: 'error' 
      });
      return;
    }
    
    setDeleteModal({
      open: true,
      type: 'area',
      id: areaId,
      name: area.name,
      loading: false
    });
  };

  const confirmDeleteArea = async () => {
    try {
      setDeleteModal(prev => ({ ...prev, loading: true }));
      console.log('Deleting area:', deleteModal.id);
      await tableService.deleteArea(deleteModal.id);
      console.log('Area deleted, refreshing data...');
      
      // Refresh both areas and tables data
      await refreshData();
      console.log('Data refreshed after area deletion');
      
      setSnackbar({ open: true, message: `Area "${deleteModal.name}" deleted successfully`, severity: 'success' });
      setDeleteModal({ open: false, type: 'area', id: '', name: '', loading: false });
    } catch (error: any) {
      console.error('Error deleting area:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to delete area', 
        severity: 'error' 
      });
      setDeleteModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSaveArea = async (areaData: Partial<TableArea>) => {
    try {
      const venue = getVenue();
      if (!venue?.id) {
        throw new Error('No venue available');
      }

      if (editingArea) {
        // Update existing area
        console.log('Updating area:', editingArea.id, areaData);
        await tableService.updateArea({
          id: editingArea.id,
          ...areaData,
        });
        setSnackbar({ open: true, message: 'Area updated successfully', severity: 'success' });
      } else {
        // Create new area
        console.log('Creating new area:', areaData);
        await tableService.createArea({
          name: areaData.name || '',
          description: areaData.description || '',
          color: areaData.color || '#2196F3',
          active: areaData.active ?? true,
        }, venue.id);
        setSnackbar({ open: true, message: 'Area added successfully', severity: 'success' });
      }
      
      console.log('Area operation completed, refreshing data...');
      // Refresh both areas and tables data
      await refreshData();
      console.log('Data refreshed after area save');
      
      setOpenAreaDialog(false);
    } catch (error: any) {
      console.error('Error saving area:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to save area', 
        severity: 'error' 
      });
    }
  };

  const filteredTables = tables.filter(table => {
    return selectedArea === 'all' || (table.location || '') === selectedArea;
  });

  const getAreaName = (areaId: string) => {
    return areas.find(area => area.id === areaId)?.name || 'Unknown';
  };

  const getAreaColor = (areaId: string) => {
    return areas.find(area => area.id === areaId)?.color || '#2196F3';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'occupied': return '#F44336';
      case 'reserved': return '#FF9800';
      case 'maintenance': return '#9E9E9E';
      default: return '#2196F3';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle />;
      case 'occupied': return <People />;
      case 'reserved': return <Schedule />;
      case 'maintenance': return <Cancel />;
      default: return <TableRestaurant />;
    }
  };

  const generateQRCode = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setSelectedTableForQR(table);
      setOpenQRViewer(true);
    }
  };

  const printQRCode = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setSelectedTableForQR(table);
      setOpenQRViewer(true);
    }
  };

  const handleBulkQRGeneration = () => {
    setOpenQRManager(true);
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
            Loading Table Management...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className="container-responsive" sx={{ pt: { xs: '56px', sm: '64px' } }}>
        <Box sx={{ py: { xs: 2, sm: 4 } }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant={isMobile ? "body2" : "body1"}>
              {error}
            </Typography>
          </Alert>
          <Button 
            variant="contained" 
            className="btn-responsive"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ pt: { xs: '56px', sm: '64px' } }}>
      <Box sx={{ py: { xs: 2, sm: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1,
                  letterSpacing: '-0.01em'
                }}
              >
                Table Management
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400
                }}
              >
                Manage your restaurant's tables, seating areas, and QR codes
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<QrCodeScanner />}
              onClick={handleBulkQRGeneration}
              size="medium"
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50'
                }
              }}
            >
              Bulk QR Manager
            </Button>
          </Box>
        </Box>

        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}
        >
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth className="input-responsive">
                <InputLabel>Filter by Area</InputLabel>
                <Select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  label="Filter by Area"
                  size={isMobile ? "medium" : "medium"}
                >
                  <MenuItem value="all">All Areas</MenuItem>
                  {areas.map(area => (
                    <MenuItem key={area.id} value={area.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: area.color 
                          }} 
                        />
                        {area.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack 
                direction={{ xs: 'row', sm: 'row' }}
                spacing={2}
                justifyContent={{ xs: 'stretch', md: 'flex-end' }}
              >
                <Button
                  variant="outlined"
                  startIcon={<LocationOn />}
                  onClick={handleAddArea}
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
                  {isMobile ? "Areas" : "Manage Areas"}
                </Button>
                {isMobile && (
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeScanner />}
                    onClick={handleBulkQRGeneration}
                    className="btn-responsive"
                    size="medium"
                    fullWidth
                    sx={{
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50'
                      }
                    }}
                  >
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddTable}
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
                  Table
                </Button>
                <IconButton
                  onClick={refreshData}
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
                  title="Refresh table data"
                >
                  <Refresh />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          {[
            { label: 'Total Tables', value: tables.length, color: '#2196F3', icon: <TableRestaurant /> },
            { label: 'Available', value: tables.filter(t => t.table_status === 'available').length, color: '#4CAF50', icon: <CheckCircle /> },
            { label: 'Occupied', value: tables.filter(t => t.table_status === 'occupied').length, color: '#F44336', icon: <People /> },
            { label: 'Reserved', value: tables.filter(t => t.table_status === 'reserved').length, color: '#FF9800', icon: <Schedule /> },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                sx={{ 
                  p: 3, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  backgroundColor: 'background.paper'
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
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}
        >
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            gutterBottom 
            fontWeight="600" 
            color="text.primary"
            sx={{ mb: 2 }}
          >
            Seating Areas
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ pb: 2 }}>
            {areas.map(area => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={area.id}>
                <Card 
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    borderLeft: `4px solid ${area.color}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    },
                    height: '100%',
                    mb: 2
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
                          {area.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {area.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tables.filter(table => (table.location || '') === area.id).length} tables
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditArea(area)}
                          className="btn-responsive"
                          sx={{ minWidth: 44, minHeight: 44 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteArea(area.id)}
                          className="btn-responsive"
                          sx={{ minWidth: 44, minHeight: 44, color: 'error.main' }}
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
        </Paper>

        {filteredTables.length === 0 ? (
          <Paper 
            elevation={1} 
            className="card-responsive"
            sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}
          >
            <TableRestaurant sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              color="text.secondary" 
              fontWeight="600"
              gutterBottom
            >
              No Tables Found
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}
            >
              {selectedArea === 'all' 
                ? "Get started by adding your first table to set up your dining area and enable customer ordering."
                : `No tables found in the selected area. Try selecting a different area or add tables to "${areas.find(a => a.id === selectedArea)?.name || 'this area'}".`
              }
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              className="btn-responsive"
              size={isMobile ? "medium" : "large"}
              onClick={handleAddTable}
            >
              Add Your First Table
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {filteredTables.map(table => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid', 
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    borderLeft: `4px solid ${getAreaColor(table.location || '')}`,
                    opacity: table.is_active ? 1 : 0.6,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { 
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ 
                    p: { xs: 1.5, sm: 2 }, 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: { xs: 200, sm: 240 }
                  }}>
                    <Stack 
                      direction="row"
                      justifyContent="space-between" 
                      alignItems="flex-start" 
                      spacing={1}
                      sx={{ mb: 1.5 }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant={isMobile ? "body1" : "h6"} 
                          fontWeight="600" 
                          color="text.primary"
                          noWrap
                        >
                          Table {table.table_number}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          noWrap
                        >
                          {getAreaName(table.location || '')}
                        </Typography>
                      </Box>
                      <Chip 
                        icon={getStatusIcon(table.table_status)}
                        label={table.table_status.charAt(0).toUpperCase() + table.table_status.slice(1)}
                        size="small"
                        sx={{ 
                          backgroundColor: getStatusColor(table.table_status),
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' },
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }
                        }}
                      />
                    </Stack>
                    
                    <Stack 
                      direction="row"
                      alignItems="center" 
                      spacing={2} 
                      sx={{ mb: 1.5 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <People fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {table.capacity} seats
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TableRestaurant fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Table
                        </Typography>
                      </Stack>
                    </Stack>

                    <Box sx={{ mt: 'auto' }}>
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Stack 
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        spacing={0.5}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Tooltip title="Generate QR Code">
                          <IconButton 
                            size="small" 
                            onClick={() => generateQRCode(table.id)}
                            className="btn-responsive"
                            sx={{ minWidth: 44, minHeight: 44 }}
                          >
                            <QrCode fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print">
                          <IconButton 
                            size="small" 
                            onClick={() => printQRCode(table.id)}
                            className="btn-responsive"
                            sx={{ minWidth: 44, minHeight: 44 }}
                          >
                            <Print fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Toggle Status">
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleTableStatus(table.id)}
                            className="btn-responsive"
                            sx={{ minWidth: 44, minHeight: 44 }}
                          >
                            {table.is_active ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Table">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditTable(table)}
                            className="btn-responsive"
                            sx={{ minWidth: 44, minHeight: 44 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Table">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteTable(table.id)}
                            className="btn-responsive"
                            sx={{ minWidth: 44, minHeight: 44 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <TableDialog
          open={openTableDialog}
          onClose={() => setOpenTableDialog(false)}
          onSave={handleSaveTable}
          table={editingTable}
          areas={areas}
          tables={tables}
          isMobile={isMobile}
        />

        <AreaDialog
          open={openAreaDialog}
          onClose={() => setOpenAreaDialog(false)}
          onSave={handleSaveArea}
          area={editingArea}
          isMobile={isMobile}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <QRCodeViewer
          open={openQRViewer}
          onClose={() => {
            setOpenQRViewer(false);
            setSelectedTableForQR(null);
          }}
          tableId={selectedTableForQR?.id}
          venueId={getVenue()?.id || ''}
          venueName={getVenueDisplayName()}
          tableNumber={selectedTableForQR?.table_number}
        />

        <QRCodeManager
          open={openQRManager}
          onClose={() => setOpenQRManager(false)}
          tables={tables.map(table => ({
            id: table.id,
            number: table.table_number,
            venueId: getVenue()?.id || '',
            venueName: getVenue()?.name || '',
            cafeName: getVenueDisplayName()
          }))}
          venueId={getVenue()?.id || ''}
          venueName={getVenueDisplayName()}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, type: 'table', id: '', name: '', loading: false })}
          onConfirm={deleteModal.type === 'table' ? confirmDeleteTable : confirmDeleteArea}
          title={`Delete ${deleteModal.type === 'table' ? 'Table' : 'Area'}`}
          itemName={deleteModal.name}
          itemType={deleteModal.type === 'table' ? 'table' : 'seating area'}
          description={
            deleteModal.type === 'table' 
              ? 'This table will be permanently removed from your restaurant layout and will no longer be available for seating customers.'
              : 'This seating area will be permanently removed. Make sure no tables are assigned to this area before deleting.'
          }
          loading={deleteModal.loading}
          additionalWarnings={
            deleteModal.type === 'table' 
              ? ['Any ongoing reservations for this table may be affected', 'QR codes for this table will become invalid', 'Table-specific analytics will be lost']
              : ['All tables must be reassigned before deletion', 'Area-specific analytics will be lost', 'Layout configurations will be reset']
          }
        />
      </Box>
    </Container>
  );
};

interface TableDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (table: any) => void;
  table: Table | null;
  areas: TableArea[];
  tables: Table[];
  isMobile?: boolean;
}

const TableDialog = ({ open, onClose, onSave, table, areas, tables, isMobile = false }: TableDialogProps) => {
  const [formData, setFormData] = useState<any>({
    table_number: '1',
    capacity: 2,
    location: '',
    table_status: 'available',
    is_active: true,
  });

  useEffect(() => {
    if (table) {
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        location: table.location || '',
        table_status: table.table_status,
        is_active: table.is_active,
      });
    } else {
      // Suggest next available table number
      const usedNumbers = tables.map(t => parseInt(t.table_number) || 0).sort((a, b) => a - b);
      let nextNumber = 1;
      for (let i = 1; i <= usedNumbers.length + 1; i++) {
        if (!usedNumbers.includes(i)) {
          nextNumber = i;
          break;
        }
      }
      
      setFormData({
        table_number: nextNumber.toString(),
        capacity: 2,
        location: '',
        table_status: 'available',
        is_active: true,
      });
    }
  }, [table, open, tables]);

  const handleSave = () => {
    // Validate form data before saving
    if (!formData.table_number || formData.table_number.trim() === '') {
      alert('Please enter a valid table number');
      return;
    }
    if (!formData.capacity || formData.capacity <= 0) {
      alert('Please enter a valid capacity greater than 0');
      return;
    }
    
    // Check for duplicate table numbers (only for new tables)
    if (!table) {
      const isDuplicate = tables.some((t: Table) => t.table_number === formData.table_number.trim() && t.is_active);
      if (isDuplicate) {
        alert(`Table number ${formData.table_number} already exists. Please choose a different number.`);
        return;
      }
    }
    
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
            {/* Modal Header */}
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {table ? 'Edit Table' : 'Add Table'}
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
            <Box sx={{ overflow: 'auto', p: { xs: 2, sm: 1.5 } }}>
              <Stack spacing={{ xs: 2, sm: 1 }}>
                <TextField
                  fullWidth
                  label="Table Number"
                  type="text"
                  value={formData.table_number}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, table_number: e.target.value }))}
                  error={!table && tables.some(t => t.table_number === formData.table_number.trim() && t.is_active)}
                  size="medium"
                />
                <FormControl fullWidth size="medium">
                  <InputLabel>Area</InputLabel>
                  <Select
                    value={formData.location || ''}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
                    label="Area"
                  >
                    {areas.map(area => (
                      <MenuItem key={area.id} value={area.id}>
                        {area.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="text"
                    value={formData.capacity === 0 ? '' : formData.capacity || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = value === '' ? 0 : parseInt(value);
                        setFormData((prev: any) => ({ ...prev, capacity: numValue }));
                      }
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    placeholder="Enter capacity"
                    error={formData.capacity !== undefined && formData.capacity <= 0}
                    helperText={formData.capacity !== undefined && formData.capacity <= 0 ? "Capacity must be greater than 0" : ""}
                    size="medium"
                  />
                  <FormControl fullWidth size="medium">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.table_status || 'available'}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, table_status: e.target.value }))}
                      label="Status"
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="occupied">Occupied</MenuItem>
                      <MenuItem value="reserved">Reserved</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="out_of_service">Out of Service</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active !== undefined ? formData.is_active : true}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Stack>
            </Box>

            {/* Modal Footer */}
            <Box sx={{ p: { xs: 2, sm: 1.5 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Stack direction="row" spacing={2}>
                <Button onClick={onClose} fullWidth variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" fullWidth>
                  {table ? 'Update' : 'Add'} Table
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
          {table ? 'Edit Table' : 'Add Table'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ 
        px: { xs: 2, sm: 3 }, 
        py: { xs: 3, sm: 4 }
      }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Table Number"
              type="text"
              value={formData.table_number || '1'}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, table_number: e.target.value }))}
              helperText={!table ? `Next available: ${formData.table_number}` : ''}
              error={!table && tables.some(t => t.table_number === formData.table_number.trim() && t.is_active)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Area</InputLabel>
              <Select
                value={formData.location || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
                label="Area"
              >
                {areas.map(area => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Capacity"
              type="text"
              value={formData.capacity === 0 ? '' : formData.capacity || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  const numValue = value === '' ? 0 : parseInt(value);
                  setFormData((prev: any) => ({ ...prev, capacity: numValue }));
                }
              }}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  e.target.select();
                }
              }}
              placeholder="Enter capacity"
              error={formData.capacity !== undefined && formData.capacity <= 0}
              helperText={formData.capacity !== undefined && formData.capacity <= 0 ? "Capacity must be greater than 0" : ""}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.table_status || 'available'}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, table_status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="out_of_service">Out of Service</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active !== undefined ? formData.is_active : true}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, is_active: e.target.checked }))}
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
          {table ? 'Update' : 'Add'} Table
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface AreaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (area: Partial<TableArea>) => void;
  area: TableArea | null;
  isMobile?: boolean;
}

const AreaDialog = ({ open, onClose, onSave, area, isMobile = false }: AreaDialogProps) => {
  const [formData, setFormData] = useState<Partial<TableArea>>({
    name: '',
    description: '',
    color: '#2196F3',
    active: true,
  });

  useEffect(() => {
    if (area) {
      setFormData(area);
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#2196F3',
        active: true,
      });
    }
  }, [area, open]);

  const handleSave = () => {
    onSave(formData);
  };

  const colorOptions = [
    '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#607D8B', '#795548', '#FF5722'
  ];

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
            {/* Modal Header */}
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {area ? 'Edit Area' : 'Add Area'}
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
            <Box sx={{ overflow: 'auto', p: { xs: 2, sm: 1.5 } }}>
              <Stack spacing={{ xs: 2, sm: 1 }}>
                <TextField
                  fullWidth
                  label="Area Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  size="medium"
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  size="medium"
                />
                <Box>
                  <Typography variant="body2" gutterBottom fontWeight="600" sx={{ mb: 0.5 }}>
                    Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {colorOptions.map((color) => (
                      <Box
                        key={color}
                        sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: color,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active !== undefined ? formData.active : true}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, active: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Stack>
            </Box>

            {/* Modal Footer */}
            <Box sx={{ p: { xs: 2, sm: 1.5 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Stack direction="row" spacing={2}>
                <Button onClick={onClose} fullWidth variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" fullWidth>
                  {area ? 'Update' : 'Add'} Area
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
          {area ? 'Edit Area' : 'Add Area'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ 
        px: { xs: 2, sm: 3 }, 
        py: { xs: 3, sm: 4 }
      }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Area Name"
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
            <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ mb: 1.5 }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 44,
                    height: 44,
                    backgroundColor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active !== undefined ? formData.active : true}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, active: e.target.checked }))}
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
          {area ? 'Update' : 'Add'} Area
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableManagement;