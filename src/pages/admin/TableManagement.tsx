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
  QrCodeScanner,
  TableRestaurant,
  Refresh,
  Store,
  CachedOutlined,
  CheckCircle,
  Cancel,
  Schedule,
  People
} from '@mui/icons-material';
import QRCodeViewer from '../../components/QRCodeViewer';
import QRCodeManager from '../../components/QRCodeManager';
import { tableService, Table } from '../../services/business';
import { useUserData } from '../../contexts/UserDataContext';
import { DeleteConfirmationModal } from '../../components/modals';
import AnimatedBackground from '../../components/ui/AnimatedBackground';
import { useTableFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

// Table Components
import TableStats from '../../components/tables/TableStats';

import TableAreas from '../../components/tables/TableAreas';
import TablesGrid from '../../components/tables/TablesGrid';
import TableDialog from '../../components/tables/TableDialog';
import AreaDialog from '../../components/tables/AreaDialog';

// Animation for refresh icon
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Local interface for table areas
interface TableArea {
  id: string;
  name: string;
  description?: string;
  color: string;
  active: boolean;
}

const TableManagement = () => {
  const { getVenue, getVenueDisplayName, userData, loading: userDataLoading } = useUserData();
  const tableFlags = useTableFlags();
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
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
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

  // Function to refresh both areas and tables data
  const refreshData = async () => {
    const venue = getVenue();
    if (!venue?.id) {
      console.log('No venue ID available for refresh');
      return;
    }

    try {
      console.log('Refreshing table data for venue:', venue.id);

      const [areasData, tablesData] = await Promise.all([
        tableService.getAreas(venue.id),
        tableService.getTables({ venue_id: venue.id })
      ]);

      console.log('Areas refreshed:', areasData?.length || 0);
      console.log('Tables refreshed:', tablesData?.data?.length || 0);
      
      let validTables: Table[] = [];
      if (tablesData && tablesData.data && Array.isArray(tablesData.data)) {
        validTables = tablesData.data;
      } else {
        validTables = [];
      }
      
      const validAreas = Array.isArray(areasData) ? areasData : [];

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

        const [areasData, tablesData] = await Promise.all([
          tableService.getAreas(venue.id),
          tableService.getTables({ venue_id: venue.id })
        ]);

        console.log('Initial load - Areas:', areasData?.length || 0);
        console.log('Initial load - Tables response:', tablesData);

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

  // Event handlers
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
        
        const response = await tableService.createTable(createData);
        if (response.success && response.data) {
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
        console.log('Updating area:', editingArea.id, areaData);
        await tableService.updateArea({
          id: editingArea.id,
          ...areaData,
        });
        setSnackbar({ open: true, message: 'Area updated successfully', severity: 'success' });
      } else {
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
      case 'available': return 'success';
      case 'occupied': return 'error';
      case 'reserved': return 'warning';
      case 'maintenance': return 'default';
      default: return 'primary';
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
          Loading Table Management...
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
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant={isMobile ? "body2" : "body1"}>
            {error}
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
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
                <TableRestaurant sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
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
                  Table Management
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
                Manager - Manage your restaurant's tables, seating areas, and QR codes for seamless dining experience
              </Typography>

              {getVenue() && (
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
              )}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'row', sm: 'row' },
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <FlagGate flag="tables.showTableQRCode">
                <Button
                  variant="outlined"
                  startIcon={<QrCodeScanner />}
                  onClick={handleBulkQRGeneration}
                  size="medium"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    color: 'text.primary',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  QR Manager
                </Button>
              </FlagGate>



              <IconButton
                onClick={refreshData}
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
                title={loading ? 'Refreshing...' : 'Refresh tables'}
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
        <FlagGate flag="tables.showTableStats">
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 2 }}>
            <TableStats tables={tables} areas={areas} />
          </Box>
        </FlagGate>
        


        {/* Spacing between sections */}
        <Box sx={{ height: { xs: 16, sm: 24 } }} />

        <FlagGate flag="tables.showTableAreas">
          <Box sx={{ px: { xs: 3, sm: 4 }, mb: 4 }}>
            <TableAreas
              areas={areas}
              tables={tables}
              onEditArea={handleEditArea}
              onDeleteArea={handleDeleteArea}
              onAddArea={handleAddArea}
            />
          </Box>
        </FlagGate>

        <Box sx={{ px: { xs: 3, sm: 4 }, pb: 4 }}>
          <TablesGrid
            filteredTables={filteredTables}
            tables={tables}
            areas={areas}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            getAreaName={getAreaName}
            getAreaColor={getAreaColor}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            onToggleTableStatus={handleToggleTableStatus}
            onGenerateQR={generateQRCode}
            onPrintQR={printQRCode}
            onEditTable={handleEditTable}
            onDeleteTable={handleDeleteTable}
            onAddTable={handleAddTable}
            isMobile={isMobile}
          />
        </Box>

        {/* Dialogs */}
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
    </Box>
  );
};

export default TableManagement;