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
} from '@mui/material';
import {
  ShoppingCart,
} from '@mui/icons-material';
import { WeeklyRevenueChart, DonutChart } from '../../../charts/ChartComponents';

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FFF176';
      case 'confirmed': return '#FFCC02';
      case 'preparing': return '#81D4FA';
      case 'ready': return '#C8E6C9';
      case 'served': return '#E1BEE7';
      case 'delivered': return '#A5D6A7';
      case 'cancelled': return '#FFAB91';
      default: return '#F5F5F5';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Revenue Chart */}
      <Grid item xs={12} lg={8}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: '1px solid',
          borderColor: 'divider'
        }} data-tour="order-status-chart">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Weekly Revenue & Orders
            </Typography>
            {dashboardData?.venue_performance && dashboardData.venue_performance.length > 0 ? (
              <WeeklyRevenueChart 
                data={dashboardData.venue_performance.map((venue: any) => ({
                  day: venue.name,
                  revenue: venue.total_revenue,
                  orders: venue.total_orders
                }))} 
                height={350} 
              />
            ) : (
              <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h6" color="text.secondary">No Revenue Data Available</Typography>
                <Typography variant="body2" color="text.secondary">Revenue trends will appear here once data is available.</Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Order Status */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: '1px solid',
          borderColor: 'divider'
        }} data-tour="order-status-chart">
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Order Status Today
            </Typography>
            {dashboardData?.analytics?.order_status_breakdown ? (
              <DonutChart 
                data={Object.entries(dashboardData.analytics.order_status_breakdown)
                  .filter(([_, count]) => (count as number) > 0)
                  .map(([status, count]) => ({
                    name: status.charAt(0).toUpperCase() + status.slice(1),
                    value: count as number,
                    color: getStatusColor(status)
                  }))} 
                height={300} 
              />
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h6" color="text.secondary">No Order Data Available</Typography>
                <Typography variant="body2" color="text.secondary">Order status will appear here once data is available.</Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Stats */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Venue Insights
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Total Menu Items</Typography>
                <Typography variant="h6" color="primary.main">{stats?.total_menu_items || 0}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Popular Items</Typography>
                <Typography variant="h6" color="success.main">{stats?.popular_items_count || 0}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Total Revenue</Typography>
                <Typography variant="h6" color="info.main">₹{(stats?.total_revenue || 0).toLocaleString()}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recent Activity
            </Typography>
            {dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {dashboardData.recent_activity.slice(0, 5).map((activity: any, index: number) => (
                  <ListItem key={activity.id || index} divider>
                    <ListItemIcon>
                      <ShoppingCart color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Order ${activity.order_number}`}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {activity.venue_name} {activity.table_number ? `• Table ${activity.table_number}` : ''}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ₹{activity.total_amount} • {activity.status}
                          </Typography>
                        </Box>
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>No Recent Activity</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Recent system activity will appear here once data is available.
                </Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default OverviewTab;