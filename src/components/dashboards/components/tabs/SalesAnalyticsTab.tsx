import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  ShowChart,
  PieChart,
  BarChart,
  Restaurant,
} from '@mui/icons-material';
import { SimpleBarChart } from '../../../charts/ChartComponents';
import { usePermissions } from '../../../RoleBasedComponent';

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

interface SalesAnalyticsTabProps {
  dashboardData: any;
  stats: VenueDashboardStats | null;
}

const SalesAnalyticsTab: React.FC<SalesAnalyticsTabProps> = ({ dashboardData, stats }) => {
  const theme = useTheme();
  const { isSuperAdmin } = usePermissions();

  return (
    <Grid container spacing={3}>
      {/* Menu Categories */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Sales by {isSuperAdmin() ? 'Venue' : 'Category'}
            </Typography>
            {dashboardData?.analytics?.revenue_by_venue ? (
              <SimpleBarChart 
                data={Object.entries(dashboardData.analytics.revenue_by_venue)
                  .filter(([_, revenue]) => (revenue as number) > 0)
                  .map(([venue, revenue], index) => ({
                    name: venue,
                    value: revenue as number,
                    color: `rgba(${76 + index * 30}, ${175 - index * 20}, ${80 + index * 25}, 0.8)`
                  }))} 
                height={300} 
              />
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h6" color="text.secondary">No Revenue Data Available</Typography>
                <Typography variant="body2" color="text.secondary">Revenue breakdown will appear here once data is available.</Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Top Menu Items */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Top Selling Items
            </Typography>
            {dashboardData?.top_menu_items && dashboardData.top_menu_items.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {dashboardData.top_menu_items.slice(0, 5).map((item: any, index: number) => (
                  <ListItem key={item.id} divider>
                    <ListItemIcon>
                      <Restaurant color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {item.venue_name} • {item.category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.orders} orders • ₹{item.revenue}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={`${item.rating} ⭐`}
                      size="small"
                      color={item.rating >= 4.5 ? 'success' : item.rating >= 4.0 ? 'warning' : 'error'}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h6" color="text.secondary">No Menu Data Available</Typography>
                <Typography variant="body2" color="text.secondary">Top selling items will appear here once data is available.</Typography>
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Sales Metrics */}
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Sales Performance Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="600">
                    ₹{(stats?.avg_order_value || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg Order Value</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <ShowChart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="600">
                    {stats?.table_occupancy_rate || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Table Occupancy</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <PieChart sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="600">
                    {dashboardData?.system_stats?.total_active_venues || 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{isSuperAdmin() ? 'Active Venues' : 'Active Venue'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <BarChart sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight="600">
                    {stats?.active_orders || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Active Orders</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SalesAnalyticsTab;