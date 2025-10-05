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
} from '@mui/material';
import {
  Add,
  TableRestaurant,
  People,
  CheckCircle,
  Schedule,
  Warning,
  Error,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../RoleBasedComponent';

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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Table Status & Management
              </Typography>
              {canManageTables() && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/tables')}
                  sx={{
                    borderRadius: 1,
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

            {tableStatuses.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '3rem' }}>
                <TableRestaurant sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">No Table Data Available</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Table status information will appear here once tables are configured.
                </Typography>
              </div>
            ) : (
              <Grid container spacing={2}>
                {tableStatuses.map((table) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
                    <Card sx={{ 
                      border: '2px solid',
                      borderColor: getTableStatusColor(table.status),
                      borderRadius: 2,
                      '&:hover': {
                        boxShadow: theme.shadows[4]
                      }
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" fontWeight="600">
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
                        {table.current_order_id && (
                          <Typography variant="body2" color="text.secondary">
                            Order: {table.current_order_id}
                          </Typography>
                        )}
                        {table.occupancy_time && (
                          <Typography variant="body2" color="text.secondary">
                            Occupied: {table.occupancy_time} min
                          </Typography>
                        )}
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