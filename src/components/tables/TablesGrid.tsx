import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { 
  Add, 
  TableRestaurant, 
  Edit, 
  Delete, 
  QrCode, 
  Print, 
  People,
  Visibility,
  VisibilityOff,
  Clear
} from '@mui/icons-material';
import { useTableFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

interface TablesGridProps {
  filteredTables: any[];
  tables: any[];
  areas: any[];
  selectedArea: string;
  setSelectedArea: (value: string) => void;
  getAreaName: (areaId: string) => string;
  getAreaColor: (areaId: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactElement;
  onToggleTableStatus: (tableId: string) => void;
  onGenerateQR: (tableId: string) => void;
  onPrintQR: (tableId: string) => void;
  onEditTable: (table: any) => void;
  onDeleteTable: (tableId: string) => void;
  onAddTable: () => void;
  isMobile?: boolean;
}

const TablesGrid: React.FC<TablesGridProps> = ({
  filteredTables,
  tables,
  areas,
  selectedArea,
  setSelectedArea,
  getAreaName,
  getAreaColor,
  getStatusColor,
  getStatusIcon,
  onToggleTableStatus,
  onGenerateQR,
  onPrintQR,
  onEditTable,
  onDeleteTable,
  onAddTable,
  isMobile = false
}) => {
  const tableFlags = useTableFlags();
  
  const getStatusColor2 = (status: string) => {
    switch (status) {
      case 'available': return '#48bb78';
      case 'occupied': return '#f56565';
      case 'reserved': return '#ed8936';
      case 'maintenance': return '#a0aec0';
      default: return '#667eea';
    }
  };

  return (
    <>
      {/* Tables Card with Header and List */}
      <Box sx={{ 
        backgroundColor: 'white',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Tables Header */}
        <Box sx={{ 
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}>
          {/* Title and Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <TableRestaurant sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5 }}>
                  Tables ({filteredTables.length})
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Manage your restaurant seating layout
                </Typography>
              </Box>
            </Box>
            
            {/* Add Table Button and Filter */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FlagGate flag="tables.showAddTable">
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={onAddTable}
                  size="medium"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Add Table
                </Button>
              </FlagGate>
              
              <Box sx={{ width: { xs: '200px', md: '250px' } }}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Area</InputLabel>
                  <Select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    label="Filter by Area"
                    size="medium"
                    sx={{ 
                      borderRadius: 2,
                      backgroundColor: 'grey.50',
                      '&:hover': {
                        backgroundColor: 'grey.100'
                      }
                    }}
                  >
                    <MenuItem value="all">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'primary.main' }} />
                        All Areas
                      </Box>
                    </MenuItem>
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
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Tables Content */}
        <Box sx={{ p: 3 }}>
          {filteredTables.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <TableRestaurant sx={{ fontSize: 40, color: 'text.secondary' }} />
              </Box>
              
              <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
                {selectedArea === 'all' ? 'No Tables Yet' : 'No Tables in This Area'}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: '500px', mx: 'auto' }}>
                {selectedArea === 'all' 
                  ? 'Start building your restaurant layout by adding your first table. You can organize tables into different seating areas for better management.'
                  : `No tables found in "${areas.find(a => a.id === selectedArea)?.name || 'this area'}". Add tables to this area or select a different area to view existing tables.`
                }
              </Typography>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAddTable}
                size="large"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {selectedArea === 'all' ? 'Create Your First Table' : 'Add Table to Area'}
              </Button>
            </Box>
          ) : (
            <List sx={{ p: 0, m: 0 }}>
              {filteredTables.map((table, index) => (
                <React.Fragment key={table.id}>
                  <ListItem
                    sx={{
                      py: 2.5,
                      px: 0,
                      transition: 'all 0.2s ease-in-out',
                      opacity: table.is_active ? 1 : 0.7,
                      '&:hover': {
                        backgroundColor: 'grey.50',
                        transform: 'translateX(4px)',
                        borderRadius: 2
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={3} sx={{ width: '100%' }}>
                      {/* Table Avatar with Status */}
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            backgroundColor: getAreaColor(table.location || ''),
                            border: '3px solid',
                            borderColor: 'grey.100',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: 'white'
                          }}
                        >
                          {table.table_number}
                        </Avatar>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: getAreaColor(table.location || ''),
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white' }} />
                        </Box>
                      </Box>

                      {/* Table Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            fontWeight="700" 
                            sx={{ color: 'text.primary' }}
                          >
                            Table {table.table_number}
                          </Typography>
                          <Chip
                            label={getAreaName(table.location || '')}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: getAreaColor(table.location || ''),
                              color: getAreaColor(table.location || ''),
                              fontWeight: 600
                            }}
                          />
                        </Stack>
                        
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              {table.capacity} people
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {React.cloneElement(getStatusIcon(table.table_status || table.status), { 
                              sx: { fontSize: 16, color: 'text.secondary' }
                            })}
                            <Chip 
                              label={(table.table_status || table.status).charAt(0).toUpperCase() + (table.table_status || table.status).slice(1)}
                              size="small"
                              color={getStatusColor(table.table_status || table.status) as any}
                              variant="outlined"
                              sx={{
                                fontWeight: 600,
                                textTransform: 'capitalize'
                              }}
                            />
                          </Box>
                        </Stack>

                        {table.description && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.85rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {table.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <Tooltip title={table.is_active ? 'Deactivate' : 'Activate'}>
                          <IconButton 
                            size="medium" 
                            onClick={() => onToggleTableStatus(table.id)}
                            sx={{ 
                              backgroundColor: 'grey.100',
                              color: table.is_active ? 'success.main' : 'text.disabled',
                              '&:hover': { 
                                backgroundColor: table.is_active ? 'success.50' : 'grey.200',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            {table.is_active ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Generate QR Code">
                          <IconButton 
                            size="medium" 
                            onClick={() => onGenerateQR(table.id)}
                            sx={{ 
                              backgroundColor: 'grey.100',
                              color: 'text.secondary',
                              '&:hover': { 
                                backgroundColor: 'primary.50',
                                color: 'primary.main',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <QrCode fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Print QR Code">
                          <IconButton 
                            size="medium" 
                            onClick={() => onPrintQR(table.id)}
                            sx={{ 
                              backgroundColor: 'grey.100',
                              color: 'text.secondary',
                              '&:hover': { 
                                backgroundColor: 'secondary.50',
                                color: 'secondary.main',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Print fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <FlagGate flag="tables.showEditTable">
                          <Tooltip title="Edit Table">
                            <IconButton 
                              size="medium" 
                              onClick={() => onEditTable(table)}
                              sx={{ 
                                backgroundColor: 'grey.100',
                                color: 'text.secondary',
                                '&:hover': { 
                                  backgroundColor: 'warning.50',
                                  color: 'warning.main',
                                  transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </FlagGate>
                        
                        <FlagGate flag="tables.showDeleteTable">
                          <Tooltip title="Delete Table">
                            <IconButton 
                              size="medium" 
                              onClick={() => onDeleteTable(table.id)}
                              sx={{ 
                                backgroundColor: 'grey.100',
                                color: 'text.secondary',
                                '&:hover': { 
                                  backgroundColor: 'error.50',
                                  color: 'error.main',
                                  transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease-in-out'
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </FlagGate>
                      </Stack>
                    </Stack>
                  </ListItem>
                  {index < filteredTables.length - 1 && (
                    <Divider sx={{ 
                      borderColor: 'grey.200',
                      mx: 0
                    }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </>
  );
};

export default TablesGrid;