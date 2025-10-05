import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Restaurant,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../RoleBasedComponent';

interface MenuItemPerformance {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  category: string;
  rating: number;
}

interface MenuPerformanceTabProps {
  menuPerformance: MenuItemPerformance[];
}

const MenuPerformanceTab: React.FC<MenuPerformanceTabProps> = ({ menuPerformance }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { canManageMenu } = usePermissions();

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
                Menu Item Performance
              </Typography>
              {canManageMenu() && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/menu')}
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
                  Manage Menu
                </Button>
              )}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="center">Category</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="center">Rating</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menuPerformance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                          <Restaurant sx={{ fontSize: 48, color: 'text.secondary' }} />
                          <Typography variant="h6" color="text.secondary">No Menu Performance Data</Typography>
                          <Typography variant="body2" color="text.secondary" textAlign="center">
                            Menu item performance data will appear here once orders are placed.
                          </Typography>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    menuPerformance.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Restaurant sx={{ color: 'text.secondary' }} />
                            <Typography variant="subtitle2" fontWeight="600">
                              {item.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={item.category} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="600">
                            {item.orders}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="600">
                            ₹{item.revenue.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${item.rating} ⭐`}
                            size="small"
                            color={item.rating >= 4.5 ? 'success' : item.rating >= 4.0 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MenuPerformanceTab;