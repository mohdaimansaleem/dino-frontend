import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Chip,
  Stack,
  Avatar,
} from '@mui/material';
import {
  ShoppingCart,
  TrendingUp,
  AccessTime,
  Restaurant,
  TableRestaurant,
  MonetizationOn,
} from '@mui/icons-material';
import { 
  EnhancedRevenueChart, 
  EnhancedOrderStatusChart, 
  EnhancedSalesMetrics 
} from '../../../charts/ChartComponents';

interface VenueDashboardStats {
  total_orders: number;
  total_revenue: number;
  active_orders: number;
  total_tables: number;
  total_menu_items: number;
  todays_revenue: number;
  todays_orders: number;
  avg_order_value: number;
  table_occupancy_rate: number;
  popular_items_count: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  occupied_tables: number;
  active_menu_items: number;
}

interface OverviewTabProps {
  dashboardData: any;
  stats: VenueDashboardStats | null;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ dashboardData, stats }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {/* Enhanced Revenue Chart - Full Width */}
      <Grid item xs={12}>
        <EnhancedRevenueChart data={dashboardData} stats={stats} />
      </Grid>

      {/* Order Status Chart and Sales Metrics */}
      <Grid item xs={12} lg={6}>
        <EnhancedOrderStatusChart data={dashboardData} stats={stats} />
      </Grid>

      <Grid item xs={12} lg={6}>
        <EnhancedSalesMetrics data={dashboardData} stats={stats} />
      </Grid>

      {/* Quick Insights */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Business Insights
            </Typography>
            
            <Stack spacing={2.5}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: 'primary.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.200'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ backgroundColor: 'primary.main', width: 40, height: 40 }}>
                    <Restaurant />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Menu Items</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {stats?.total_menu_items || 0}
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label={`${stats?.active_menu_items || 0} active`} 
                  color="primary" 
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider />

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: 'success.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'success.200'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ backgroundColor: 'success.main', width: 40, height: 40 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Popular Items</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {stats?.popular_items_count || 0}
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label="Top sellers" 
                  color="success" 
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider />

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: 'info.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.200'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ backgroundColor: 'info.main', width: 40, height: 40 }}>
                    <MonetizationOn />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                      ₹{(stats?.total_revenue || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label="All time" 
                  color="info" 
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider />

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: 'warning.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'warning.200'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ backgroundColor: 'warning.main', width: 40, height: 40 }}>
                    <TableRestaurant />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Table Occupancy</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {stats?.table_occupancy_rate || 0}%
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label={`${stats?.occupied_tables || 0}/${stats?.total_tables || 0}`} 
                  color="warning" 
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Recent Activity
              </Typography>
              <Chip 
                label="Live" 
                color="success" 
                size="small"
                sx={{ animation: 'pulse 2s infinite' }}
              />
            </Box>
            
            {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {dashboardData.recent_activity.slice(0, 6).map((activity: any, index: number) => (
                  <ListItem 
                    key={activity.id || index} 
                    divider={index < dashboardData.recent_activity.length - 1}
                    sx={{ 
                      px: 0,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderRadius: 1
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ 
                        backgroundColor: 'primary.main', 
                        width: 36, 
                        height: 36 
                      }}>
                        <ShoppingCart sx={{ fontSize: 20 }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Order #{activity.order_number}
                          </Typography>
                          <Chip 
                            label={activity.status} 
                            size="small"
                            color={
                              activity.status === 'completed' ? 'success' :
                              activity.status === 'pending' ? 'warning' :
                              activity.status === 'preparing' ? 'info' : 'default'
                            }
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {activity.venue_name} {activity.table_number ? `• Table ${activity.table_number}` : ''}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              ₹{activity.total_amount}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(activity.created_at).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: 'column', 
                py: 6,
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}>
                <ShoppingCart sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Recent system activity will appear here once orders start coming in
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OverviewTab;