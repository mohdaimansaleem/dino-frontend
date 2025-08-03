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
  const { getVenue, getTables, getVenueDisplayName } = useUserData();
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

  useEffect(() => {
    const loadData = async () => {
      const venue = getVenue();
      
      if (!venue?.id) {
        setError('No venue assigned to your account. Please contact support.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to use tables from user data first
        const userDataTables = getTables();
        if (userDataTables && userDataTables.length > 0) {
          setTables(userDataTables);
        }

        // Load areas and tables from API
        const [areasData, tablesData] = await Promise.all([
          tableService.getAreas(venue.id),
          userDataTables && userDataTables.length > 0 ? 
            Promise.resolve({ data: userDataTables }) : 
            tableService.getTables({ venue_id: venue.id })
        ]);

        setAreas(areasData);
        if (!userDataTables || userDataTables.length === 0) {
          setTables(tablesData.data || []);
        }
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
  }, [getVenue]);

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
          table_number: parseInt(tableData.table_number || editingTable.table_number.toString()),
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
        
        const response = await tableService.createTable({
          table_number: parseInt(tableData.table_number || '1'),
          capacity: tableData.capacity || 2,
          location: tableData.location || '',
          venue_id: venue.id,
        });
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
          Table Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your restaurant's tables, seating areas, and QR codes
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Area</InputLabel>
              <Select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                label="Filter by Area"
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
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<LocationOn />}
                onClick={handleAddArea}
              >
                Manage Areas
              </Button>
              <Button
                variant="outlined"
                startIcon={<QrCodeScanner />}
                onClick={handleBulkQRGeneration}
              >
                Bulk QR Manager
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddTable}
              >
                Add Table
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Tables', value: tables.length, color: '#2196F3', icon: <TableRestaurant /> },
          { label: 'Available', value: tables.filter(t => t.table_status === 'available').length, color: '#4CAF50', icon: <CheckCircle /> },
          { label: 'Occupied', value: tables.filter(t => t.table_status === 'occupied').length, color: '#F44336', icon: <People /> },
          { label: 'Reserved', value: tables.filter(t => t.table_status === 'booked').length, color: '#FF9800', icon: <Schedule /> },
        ].map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Paper elevation={1} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ backgroundColor: stat.color, width: 48, height: 48 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={1} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom fontWeight="600" color="text.primary">
          Seating Areas
        </Typography>
        <Grid container spacing={2}>
          {areas.map(area => (
            <Grid item xs={12} sm={6} md={3} key={area.id}>
              <Card 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderLeft: `4px solid ${area.color}`,
                  '&:hover': { boxShadow: 2 }
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                        {area.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {area.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tables.filter(table => (table.location || '') === area.id).length} tables
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleEditArea(area)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {filteredTables.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
          <TableRestaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Tables Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {selectedArea === 'all' 
              ? "Get started by adding your first table to set up your dining area and enable customer ordering."
              : `No tables found in the selected area. Try selecting a different area or add tables to "${areas.find(a => a.id === selectedArea)?.name || 'this area'}".`
            }
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            size="large"
            onClick={handleAddTable}
          >
            Add Your First Table
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredTables.map(table => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
              <Card 
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
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 350 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight="600" color="text.primary">
                        Table {table.table_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {table.capacity} seats
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TableRestaurant fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Table
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Notes section - API doesn't have notes field yet */}
                  
                  {/* Current order section - API doesn't have currentOrder field yet */}

                  <Box sx={{ mt: 'auto' }}>
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap'
                    }}>
                      <Tooltip title="Generate QR Code">
                        <IconButton size="small" onClick={() => generateQRCode(table.id)}>
                          <QrCode fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print QR Code">
                        <IconButton size="small" onClick={() => printQRCode(table.id)}>
                          <Print fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Toggle Status">
                        <IconButton size="small" onClick={() => handleToggleTableStatus(table.id)}>
                          {table.is_active ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Table">
                        <IconButton size="small" onClick={() => handleEditTable(table)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Table">
                        <IconButton size="small" color="error" onClick={() => handleDeleteTable(table.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
      />

      <AreaDialog
        open={openAreaDialog}
        onClose={() => setOpenAreaDialog(false)}
        onSave={handleSaveArea}
        area={editingArea}
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
        cafeId={getVenue()?.id || ''}
        cafeName={getVenueDisplayName()}
        tableNumber={selectedTableForQR?.table_number.toString()}
      />

      <QRCodeManager
        open={openQRManager}
        onClose={() => setOpenQRManager(false)}
        tables={tables.map(table => ({
          id: table.id,
          number: table.table_number.toString(),
          cafeId: getVenue()?.id || '',
          cafeName: getVenueDisplayName()
        }))}
        cafeId={getVenue()?.id || ''}
        cafeName={getVenueDisplayName()}
      />
    </Container>
  );
};

interface TableDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (table: any) => void;
  table: Table | null;
  areas: TableArea[];
}

const TableDialog: React.FC<TableDialogProps> = ({ open, onClose, onSave, table, areas }) => {
  const [formData, setFormData] = useState<any>({
    table_number: '',
    capacity: 2,
    location: '',
    table_status: 'available',
    is_active: true,
  });

  useEffect(() => {
    if (table) {
      setFormData({
        table_number: table.table_number.toString(),
        capacity: table.capacity,
        location: table.location || '',
        table_status: table.table_status,
        is_active: table.is_active,
      });
    } else {
      setFormData({
        table_number: '',
        capacity: 2,
        location: '',
        table_status: 'available',
        is_active: true,
      });
    }
  }, [table, open]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {table ? 'Edit Table' : 'Add Table'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Table Number"
              value={formData.table_number || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, table_number: e.target.value }))}
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
              type="number"
              value={formData.capacity || 2}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, capacity: parseInt(e.target.value) }))}
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
                  checked={formData.active || false}
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
}

const AreaDialog: React.FC<AreaDialogProps> = ({ open, onClose, onSave, area }) => {
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {area ? 'Edit Area' : 'Add Area'}
      </DialogTitle>
      <DialogContent>
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
            <Typography variant="subtitle1" gutterBottom>
              Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
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
                  checked={formData.active || false}
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