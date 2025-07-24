import React, { useState, useEffect } from 'react';
import QRCodeViewer from '../../components/QRCodeViewer';
import QRCodeManager from '../../components/QRCodeManager';
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
  PrintDisabled,
} from '@mui/icons-material';

interface Table {
  id: string;
  number: string;
  capacity: number;
  location: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  qrCode: string;
  active: boolean;
  shape: 'round' | 'square' | 'rectangle';
  notes?: string;
  currentOrder?: {
    orderId: string;
    customerName: string;
    startTime: string;
    items: number;
    total: number;
  };
}

interface TableArea {
  id: string;
  name: string;
  description: string;
  color: string;
  active: boolean;
}

const EnhancedTableManagement: React.FC = () => {
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

  // Mock data
  useEffect(() => {
    setAreas([
      { id: '1', name: 'Main Dining', description: 'Main dining area', color: '#2196F3', active: true },
      { id: '2', name: 'Patio', description: 'Outdoor seating', color: '#4CAF50', active: true },
      { id: '3', name: 'Private Room', description: 'Private dining room', color: '#FF9800', active: true },
      { id: '4', name: 'Bar Area', description: 'Bar and lounge', color: '#9C27B0', active: true },
    ]);

    setTables([
      {
        id: '1',
        number: 'T001',
        capacity: 4,
        location: '1',
        status: 'occupied',
        qrCode: 'QR001',
        active: true,
        shape: 'round',
        notes: 'Window table',
        currentOrder: {
          orderId: 'ORD001',
          customerName: 'John Doe',
          startTime: '2024-01-15T18:30:00',
          items: 3,
          total: 45.99,
        },
      },
      {
        id: '2',
        number: 'T002',
        capacity: 2,
        location: '1',
        status: 'available',
        qrCode: 'QR002',
        active: true,
        shape: 'square',
        notes: 'Quiet corner',
      },
      {
        id: '3',
        number: 'T003',
        capacity: 6,
        location: '2',
        status: 'reserved',
        qrCode: 'QR003',
        active: true,
        shape: 'rectangle',
        notes: 'Patio table with umbrella',
      },
      {
        id: '4',
        number: 'T004',
        capacity: 8,
        location: '3',
        status: 'available',
        qrCode: 'QR004',
        active: true,
        shape: 'rectangle',
        notes: 'Large private table',
      },
      {
        id: '5',
        number: 'T005',
        capacity: 2,
        location: '4',
        status: 'maintenance',
        qrCode: 'QR005',
        active: false,
        shape: 'round',
        notes: 'Needs repair',
      },
    ]);
  }, []);

  const handleAddTable = () => {
    setEditingTable(null);
    setOpenTableDialog(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setOpenTableDialog(true);
  };

  const handleDeleteTable = (tableId: string) => {
    setTables(prev => prev.filter(table => table.id !== tableId));
    setSnackbar({ open: true, message: 'Table deleted successfully', severity: 'success' });
  };

  const handleSaveTable = (tableData: Partial<Table>) => {
    if (editingTable) {
      setTables(prev => prev.map(table => 
        table.id === editingTable.id ? { ...table, ...tableData } : table
      ));
      setSnackbar({ open: true, message: 'Table updated successfully', severity: 'success' });
    } else {
      const newTable: Table = {
        id: Date.now().toString(),
        number: '',
        capacity: 2,
        location: '',
        status: 'available',
        qrCode: `QR${Date.now()}`,
        active: true,
        shape: 'round',
        ...tableData,
      };
      setTables(prev => [...prev, newTable]);
      setSnackbar({ open: true, message: 'Table added successfully', severity: 'success' });
    }
    setOpenTableDialog(false);
  };

  const handleToggleTableStatus = (tableId: string) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { 
        ...table, 
        status: table.status === 'available' ? 'maintenance' : 'available',
        active: table.status !== 'available'
      } : table
    ));
  };

  const handleAddArea = () => {
    setEditingArea(null);
    setOpenAreaDialog(true);
  };

  const handleEditArea = (area: TableArea) => {
    setEditingArea(area);
    setOpenAreaDialog(true);
  };

  const handleSaveArea = (areaData: Partial<TableArea>) => {
    if (editingArea) {
      setAreas(prev => prev.map(area => 
        area.id === editingArea.id ? { ...area, ...areaData } : area
      ));
      setSnackbar({ open: true, message: 'Area updated successfully', severity: 'success' });
    } else {
      const newArea: TableArea = {
        id: Date.now().toString(),
        name: '',
        description: '',
        color: '#2196F3',
        active: true,
        ...areaData,
      };
      setAreas(prev => [...prev, newArea]);
      setSnackbar({ open: true, message: 'Area added successfully', severity: 'success' });
    }
    setOpenAreaDialog(false);
  };

  const filteredTables = tables.filter(table => {
    return selectedArea === 'all' || table.location === selectedArea;
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="600" color="text.primary">
          Table Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your restaurant's tables, seating areas, and QR codes
        </Typography>
      </Box>

      {/* Controls */}
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

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Tables', value: tables.length, color: '#2196F3', icon: <TableRestaurant /> },
          { label: 'Available', value: tables.filter(t => t.status === 'available').length, color: '#4CAF50', icon: <CheckCircle /> },
          { label: 'Occupied', value: tables.filter(t => t.status === 'occupied').length, color: '#F44336', icon: <People /> },
          { label: 'Reserved', value: tables.filter(t => t.status === 'reserved').length, color: '#FF9800', icon: <Schedule /> },
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

      {/* Areas Overview */}
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
                        {tables.filter(table => table.location === area.id).length} tables
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

      {/* Tables Grid */}
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
                borderLeft: `4px solid ${getAreaColor(table.location)}`,
                opacity: table.active ? 1 : 0.6,
                '&:hover': { boxShadow: 2 }
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 350 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      {table.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getAreaName(table.location)}
                    </Typography>
                  </Box>
                  <Chip 
                    icon={getStatusIcon(table.status)}
                    label={table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                    size="small"
                    sx={{ 
                      backgroundColor: getStatusColor(table.status),
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
                      {table.shape}
                    </Typography>
                  </Box>
                </Box>
                
                {table.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                    {table.notes}
                  </Typography>
                )}
                
                {table.currentOrder && (
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'grey.50', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                      Current Order
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {table.currentOrder.customerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {table.currentOrder.items} items • ₹{table.currentOrder.total.toFixed(0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Started: {new Date(table.currentOrder.startTime).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                )}


                
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
                        {table.active ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
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

      {/* Table Dialog */}
      <TableDialog
        open={openTableDialog}
        onClose={() => setOpenTableDialog(false)}
        onSave={handleSaveTable}
        table={editingTable}
        areas={areas}
      />

      {/* Area Dialog */}
      <AreaDialog
        open={openAreaDialog}
        onClose={() => setOpenAreaDialog(false)}
        onSave={handleSaveArea}
        area={editingArea}
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
      {/* QR Code Viewer */}
      <QRCodeViewer
        open={openQRViewer}
        onClose={() => {
          setOpenQRViewer(false);
          setSelectedTableForQR(null);
        }}
        tableId={selectedTableForQR?.id}
        cafeId="dino-cafe-1"
        cafeName="Dino Cafe"
        tableNumber={selectedTableForQR?.number}
      />

      {/* QR Code Manager */}
      <QRCodeManager
        open={openQRManager}
        onClose={() => setOpenQRManager(false)}
        tables={tables.map(table => ({
          id: table.id,
          number: table.number,
          cafeId: "dino-cafe-1",
          cafeName: "Dino Cafe"
        }))}
        cafeId="dino-cafe-1"
        cafeName="Dino Cafe"
      />
    </Container>
  );
};

// Table Dialog Component
interface TableDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (table: Partial<Table>) => void;
  table: Table | null;
  areas: TableArea[];
}

const TableDialog: React.FC<TableDialogProps> = ({ open, onClose, onSave, table, areas }) => {
  const [formData, setFormData] = useState<Partial<Table>>({
    number: '',
    capacity: 2,
    location: '',
    status: 'available',
    active: true,
    shape: 'round',
    notes: '',
  });

  useEffect(() => {
    if (table) {
      setFormData(table);
    } else {
      setFormData({
        number: '',
        capacity: 2,
        location: '',
        status: 'available',
        active: true,
        shape: 'round',
        notes: '',
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
              value={formData.number || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Area</InputLabel>
              <Select
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Shape</InputLabel>
              <Select
                value={formData.shape || 'round'}
                onChange={(e) => setFormData(prev => ({ ...prev, shape: e.target.value as 'round' | 'square' | 'rectangle' }))}
                label="Shape"
              >
                <MenuItem value="round">Round</MenuItem>
                <MenuItem value="square">Square</MenuItem>
                <MenuItem value="rectangle">Rectangle</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status || 'available'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Table['status'] }))}
                label="Status"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
          {table ? 'Update' : 'Add'} Table
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Area Dialog Component
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
            <Typography variant="subtitle2" gutterBottom>
              Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {colorOptions.map(color => (
                <Box
                  key={color}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : '1px solid #ccc',
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
          {area ? 'Update' : 'Add'} Area
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedTableManagement;