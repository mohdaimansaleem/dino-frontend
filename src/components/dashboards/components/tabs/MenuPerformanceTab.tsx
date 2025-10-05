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
  Avatar,
  Stack,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Restaurant,
  Star,
  TrendingUp,
  TrendingDown,
  LocalOffer,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../auth';

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

  // Calculate analytics
  const totalRevenue = menuPerformance.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = menuPerformance.reduce((sum, item) => sum + item.orders, 0);
  const avgRating = menuPerformance.length > 0 
    ? menuPerformance.reduce((sum, item) => sum + item.rating, 0) / menuPerformance.length 
    : 0;
  const topPerformer = menuPerformance.length > 0 
    ? menuPerformance.reduce((prev, current) => prev.revenue > current.revenue ? prev : current)
    : null;

  // Category performance
  const categoryStats = menuPerformance.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { orders: 0, revenue: 0, items: 0 };
    }
    acc[item.category].orders += item.orders;
    acc[item.category].revenue += item.revenue;
    acc[item.category].items += 1;
    return acc;
  }, {} as Record<string, { orders: number; revenue: number; items: number }>);

  const categoryPerformance = Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      ...stats,
      avgRevenue: stats.revenue / stats.items
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <Grid container spacing={3}>
      {/* Performance Overview */}
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
                  Menu Performance Overview
                </Typography>
              </Box>
              {canManageMenu() && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate('/admin/menu')}
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
                  Manage Menu
                </Button>
              )}
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
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
                    ₹{totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                </Box>
              </Grid>
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
                    {totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Orders</Typography>
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
                    {avgRating.toFixed(1)} ⭐
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg Rating</Typography>
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
                    {menuPerformance.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Menu Items</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Category Performance */}
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
              Category Performance
            </Typography>
            
            <Stack spacing={2.5}>
              {categoryPerformance.length > 0 ? categoryPerformance.map((category, index) => (
                <Box key={category.category} sx={{ 
                  p: 2, 
                  backgroundColor: `hsl(${index * 60}, 70%, 95%)`,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: `hsl(${index * 60}, 70%, 80%)`
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {category.category}
                    </Typography>
                    <Chip 
                      label={`${category.items} items`} 
                      size="small"
                      sx={{ backgroundColor: `hsl(${index * 60}, 70%, 85%)` }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Revenue</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{category.revenue.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Orders</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {category.orders}
                    </Typography>
                  </Box>
                </Box>
              )) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Restaurant sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Menu Items Table */}
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
              Menu Item Performance
            </Typography>

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Orders</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Revenue</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Rating</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Performance</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menuPerformance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 2,
                          p: 4,
                          border: '2px dashed',
                          borderColor: 'grey.300'
                        }}>
                          <Restaurant sx={{ fontSize: 64, color: 'grey.400' }} />
                          <Typography variant="h6" color="text.secondary">No Menu Performance Data</Typography>
                          <Typography variant="body2" color="text.secondary" textAlign="center">
                            Menu item performance data will appear here once orders are placed.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    menuPerformance.map((item, index) => {
                      const performanceScore = (item.revenue / totalRevenue) * 100;
                      const isTopPerformer = item.id === topPerformer?.id;
                      
                      return (
                        <TableRow 
                          key={item.id}
                          sx={{ 
                            '&:hover': { backgroundColor: 'action.hover' },
                            backgroundColor: isTopPerformer ? 'success.50' : 'inherit'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ 
                                backgroundColor: isTopPerformer ? 'success.main' : 'primary.main',
                                width: 32,
                                height: 32,
                                fontSize: '0.875rem'
                              }}>
                                {index + 1}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {item.name}
                                </Typography>
                                {isTopPerformer && (
                                  <Chip 
                                    label="Top Performer" 
                                    size="small" 
                                    color="success"
                                    variant="outlined"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
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
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.orders}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              ₹{item.revenue.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.rating}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ width: '100%', maxWidth: 80 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(performanceScore, 100)} 
                                sx={{ 
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    backgroundColor: performanceScore > 20 ? 'success.main' : 
                                                   performanceScore > 10 ? 'warning.main' : 'error.main'
                                  }
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {performanceScore.toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <IconButton size="small" color="primary">
                                <Visibility sx={{ fontSize: 18 }} />
                              </IconButton>
                              <IconButton size="small" color="secondary">
                                <Edit sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
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