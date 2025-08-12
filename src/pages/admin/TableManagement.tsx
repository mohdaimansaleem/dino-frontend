import React, { useState, useEffect } from 'react';
import QRCodeViewer from '../../components/QRCodeViewer';
import QRCodeManager from '../../components/QRCodeManager';
import { tableService, Table } from '../../services/tableService';
import { useUserData } from '../../contexts/UserDataContext';
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
} from '@mui/icons-material';

// Local interface for table areas (backward compatibility)
interface TableArea {
  id: string;
  name: string;
  description?: string;
  color: string;
  active: boolean;
}

const TableManagement: React.FC = () => {
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
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

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

        console.log('Areas loaded:', areasData?.length || 0);
        console.log('Tables loaded:', tablesData.data?.length || 0);

        setAreas(areasData);
        setTables(tablesData.data || []);
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

  const handleAddTable = () => {
    setEditingTable(null);
    setOpenTableDialog(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setOpenTableDialog(true);
  };

  const handleDeleteTable = async (tableId: string) => {
    try {
      const response = await tableService.deleteTable(tableId);
      if (response.success) {
        setTables(prev => prev.filter(table => table.id !== tableId));
        setSnackbar({ open: true, message: 'Table deleted successfully', severity: 'success' });
      }
    } catch (error: any) {
      console.error('Error deleting table:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to delete table', 
        severity: 'error' 
      });
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
          setTables(prev => prev.map(table => 
            table.id === editingTable.id ? response.data! : table
          ));
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
          setTables(prev => [...prev, response.data!]);
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

  const handleSaveArea = async (areaData: Partial<TableArea>) => {
    try {
      const venue = getVenue();
      if (!venue?.id) {
        throw new Error('No venue available');
      }

      if (editingArea) {
        // Update existing area
        const updatedArea = await tableService.updateArea({
          id: editingArea.id,
          ...areaData,
        });
        setAreas(prev => prev.map(area => 
          area.id === editingArea.id ? updatedArea : area
        ));
        setSnackbar({ open: true, message: 'Area updated successfully', severity: 'success' });
      } else {
        // Create new area
        const newArea = await tableService.createArea({
          name: areaData.name || '',
          description: areaData.description || '',
          color: areaData.color || '#2196F3',
          active: areaData.active ?? true,
        }, venue.id);
        setAreas(prev => [...prev, newArea]);
        setSnackbar({ open: true, message: 'Area added successfully', severity: 'success' });
      }
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
    <Container maxWidth="xl" className="container-responsive">
      <Box sx={{ py: { xs: 2, sm: 4 } }}>
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1"
            gutterBottom 
            fontWeight="600" 
            color="text.primary"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
          >
            Table Management
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            color="text.secondary"
          >
            Manage your restaurant's tables, seating areas, and QR codes
          </Typography>
        </Box>

        <Paper 
          elevation={1} 
          className="card-responsive"
          sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider' }}
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
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 2 }}
                justifyContent={{ xs: 'stretch', md: 'flex-end' }}
              >
                <Button
                  variant="outlined"
                  startIcon={<LocationOn />}
                  onClick={handleAddArea}
                  className="btn-responsive"
                  size={isMobile ? "medium" : "medium"}
                  fullWidth={isMobile}
                >
                  {isMobile ? "Areas" : "Manage Areas"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCodeScanner />}
                  onClick={handleBulkQRGeneration}
                  className="btn-responsive"
                  size={isMobile ? "medium" : "medium"}
                  fullWidth={isMobile}
                >
                  {isMobile ? "QR Manager" : "Bulk QR Manager"}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddTable}
                  className="btn-responsive"
                  size={isMobile ? "medium" : "medium"}
                  fullWidth={isMobile}
                >
                  Add Table
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          {[
            { label: 'Total Tables', value: tables.length, color: '#2196F3', icon: <TableRestaurant /> },
            { label: 'Available', value: tables.filter(t => t.table_status === 'available').length, color: '#4CAF50', icon: <CheckCircle /> },
            { label: 'Occupied', value: tables.filter(t => t.table_status === 'occupied').length, color: '#F44336', icon: <People /> },
            { label: 'Reserved', value: tables.filter(t => t.table_status === 'booked').length, color: '#FF9800', icon: <Schedule /> },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper 
                elevation={1} 
                className="card-responsive"
                sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}
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
            Seating Areas
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {areas.map(area => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={area.id}>
                <Card 
                  className="card-responsive"
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider',
                    borderLeft: `4px solid ${area.color}`,
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
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditArea(area)}
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
                  className="card-responsive"
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid', 
                    borderColor: 'divider',
                    borderLeft: `4px solid ${getAreaColor(table.location || '')}`,
                    opacity: table.is_active ? 1 : 0.6,
                    '&:hover': { boxShadow: 2 }
                  }}
                >
                  <CardContent sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: { xs: 280, sm: 350 }
                  }}>
                    <Stack 
                      direction="row"
                      justifyContent="space-between" 
                      alignItems="flex-start" 
                      spacing={1}
                      sx={{ mb: 2 }}
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
                      sx={{ mb: 2 }}
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
                      <Divider sx={{ my: 2 }} />
                      
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
                        <Tooltip title="Print QR Code">
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

const TableDialog: React.FC<TableDialogProps> = ({ open, onClose, onSave, table, areas, tables, isMobile = false }) => {
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
    if (!formData.capacity || formData.capacity < 1) {
      alert('Please enter a valid capacity');
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
          {table ? 'Edit Table' : 'Add Table'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              className="input-responsive"
              label="Table Number"
              type="text"
              value={formData.table_number || '1'}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, table_number: e.target.value }))}
              helperText={!table ? `Next available: ${formData.table_number}` : ''}
              error={!table && tables.some(t => t.table_number === formData.table_number.trim() && t.is_active)}
              size={isMobile ? "medium" : "medium"}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth className="input-responsive">
              <InputLabel>Area</InputLabel>
              <Select
                value={formData.location || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
                label="Area"
                size={isMobile ? "medium" : "medium"}
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
              className="input-responsive"
              label="Capacity"
              type="number"
              value={formData.capacity || 2}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, capacity: parseInt(e.target.value) || 2 }))}
              inputProps={{
                min: 1,
                step: 1,
                onWheel: (e: any) => e.preventDefault(),
                style: { MozAppearance: 'textfield' }
              }}
              size={isMobile ? "medium" : "medium"}
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
            <FormControl fullWidth className="input-responsive">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.table_status || 'available'}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, table_status: e.target.value }))}
                label="Status"
                size={isMobile ? "medium" : "medium"}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="booked">Booked</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="out_of_service">Out of Service</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
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
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          width={{ xs: '100%', sm: 'auto' }}
        >
          <Button 
            onClick={onClose}
            className="btn-responsive"
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            className="btn-responsive"
            fullWidth={isMobile}
          >
            {table ? 'Update' : 'Add'} Table
          </Button>
        </Stack>
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

const AreaDialog: React.FC<AreaDialogProps> = ({ open, onClose, onSave, area, isMobile = false }) => {
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
          {area ? 'Edit Area' : 'Add Area'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              className="input-responsive"
              label="Area Name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              size={isMobile ? "medium" : "medium"}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              className="input-responsive"
              label="Description"
              multiline
              rows={isMobile ? 3 : 2}
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              size={isMobile ? "medium" : "medium"}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant={isMobile ? "body1" : "subtitle1"} gutterBottom fontWeight="600">
              Color
            </Typography>
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, flexWrap: 'wrap' }}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    backgroundColor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
                    minWidth: 44,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          width={{ xs: '100%', sm: 'auto' }}
        >
          <Button 
            onClick={onClose}
            className="btn-responsive"
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            className="btn-responsive"
            fullWidth={isMobile}
          >
            {area ? 'Update' : 'Add'} Area
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default TableManagement;