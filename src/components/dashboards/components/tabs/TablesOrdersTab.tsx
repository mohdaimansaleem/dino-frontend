import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  useTheme,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  TableRestaurant,
  People,
  CheckCircle,
  Schedule,
  Warning,
  Error,
  AccessTime,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../auth';

interface TableStatus {
  id: string;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  occupancy_time?: number;
}

interface TablesOrdersTabProps {
  tableStatuses: TableStatus[];
}

const TablesOrdersTab: React.FC<TablesOrdersTabProps> = ({ tableStatuses }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { canManageTables } = usePermissions();

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return '#F44336';
      case 'available': return '#4CAF50';
      case 'reserved': return '#FF9800';
      case 'cleaning': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <People sx={{ fontSize: 16 }} />;
      case 'available': return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'reserved': return <Schedule sx={{ fontSize: 16 }} />;
      case 'cleaning': return <Warning sx={{ fontSize: 16 }} />;
      default: return <Error sx={{ fontSize: 16 }} />;
    }
  };

  // Calculate table analytics
  const totalTables = tableStatuses.length;
  const occupiedTables = tableStatuses.filter(table => table.status === 'occupied').length;
  const availableTables = tableStatuses.filter(table => table.status === 'available').length;
  const reservedTables = tableStatuses.filter(table => table.status === 'reserved').length;
  const cleaningTables = tableStatuses.filter(table => table.status === 'cleaning').length;
  const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;
  const avgOccupancyTime = tableStatuses
    .filter(table => table.occupancy_time)
    .reduce((sum, table) => sum + (table.occupancy_time || 0), 0) / 
    Math.max(tableStatuses.filter(table => table.occupancy_time).length, 1);

  const statusStats = [
    { label: 'Available', count: availableTables, color: '#4CAF50', icon: <CheckCircle /> },
    { label: 'Occupied', count: occupiedTables, color: '#F44336', icon: <People /> },
    { label: 'Reserved', count: reservedTables, color: '#FF9800', icon: <Schedule /> },
    { label: 'Cleaning', count: cleaningTables, color: '#9E9E9E', icon: <Warning /> },
  ];

  return (
    <Grid container spacing={3}>
      {/* Table Analytics Overview */}
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Table Management Overview
                </Typography>
              </Box>
              {canManageTables() && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/tables')}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: theme.shadows[2]
                    }
                  }}
                >
                  Manage Tables
                </Button>
              )}
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  p: 2.5, 
                  backgroundColor: 'primary.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.200',
                  textAlign: 'center'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {totalTables}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Tables</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  p: 2.5, 
                  backgroundColor: 'warning.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'warning.200',
                  textAlign: 'center'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {occupancyRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Occupancy Rate</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  p: 2.5, 
                  backgroundColor: 'info.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'info.200',
                  textAlign: 'center'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {Math.round(avgOccupancyTime || 0)}m
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg Occupancy</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ 
                  p: 2.5, 
                  backgroundColor: 'success.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'success.200',
                  textAlign: 'center'
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {availableTables}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Available Now</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Status Distribution */}
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Status Distribution
            </Typography>
            
            <Stack spacing={2.5}>
              {statusStats.map((stat, index) => (
                <Box key={stat.label} sx={{ 
                  p: 2.5, 
                  backgroundColor: `${stat.color}15`,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: `${stat.color}40`
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        backgroundColor: stat.color,
                        width: 32,
                        height: 32
                      }}>
                        {React.cloneElement(stat.icon, { fontSize: 'small' })}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.count}
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={totalTables > 0 ? (stat.count / totalTables) * 100 : 0} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: stat.color
                      }
                    }}
                  />
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {totalTables > 0 ? Math.round((stat.count / totalTables) * 100) : 0}% of total tables
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Table Grid */}
      <Grid item xs={12} md={8}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Table Status Grid
            </Typography>

            {tableStatuses.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2, 
                py: 8,
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}>
                <TableRestaurant sx={{ fontSize: 64, color: 'grey.400' }} />
                <Typography variant="h6" color="text.secondary">No Table Data Available</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Table status information will appear here once tables are configured.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ maxHeight: 500, overflow: 'auto' }}>
                {tableStatuses.map((table) => (
                  <Grid item xs={12} sm={6} lg={4} key={table.id}>
                    <Card sx={{ 
                      border: '2px solid',
                      borderColor: getTableStatusColor(table.status),
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {table.table_number}
                          </Typography>
                          <Chip
                            icon={getTableStatusIcon(table.status)}
                            label={table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                            size="small"
                            sx={{
                              backgroundColor: getTableStatusColor(table.status),
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            }}
                          />
                        </Box>
                        
                        <Stack spacing={1}>
                          {table.current_order_id && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">Order:</Typography>
                              <Chip 
                                label={table.current_order_id} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                              />
                            </Box>
                          )}
                          
                          {table.occupancy_time && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Occupied: {table.occupancy_time} minutes
                              </Typography>
                            </Box>
                          )}
                          
                          {table.status === 'available' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                Ready for guests
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default TablesOrdersTab;