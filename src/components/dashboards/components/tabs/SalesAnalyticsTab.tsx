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
  Avatar,
  Stack,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  ShowChart,
  PieChart,
  BarChart,
  Restaurant,
  Star,
  LocalOffer,
  Timeline,
  AttachMoney,
  Speed,
} from '@mui/icons-material';
import { EnhancedPerformanceChart, SimpleBarChart } from '../../../charts/ChartComponents';
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

  const performanceMetrics = [
    {
      title: 'Average Order Value',
      value: `₹${(stats?.avg_order_value || 0).toLocaleString()}`,
      icon: <AttachMoney />,
      color: 'success.main',
      bgColor: 'success.50',
      progress: 75,
      description: 'Higher than last month'
    },
    {
      title: 'Table Occupancy Rate',
      value: `${stats?.table_occupancy_rate || 0}%`,
      icon: <Speed />,
      color: 'primary.main',
      bgColor: 'primary.50',
      progress: stats?.table_occupancy_rate || 0,
      description: 'Current utilization'
    },
    {
      title: 'Active Venues',
      value: dashboardData?.system_stats?.total_active_venues || 1,
      icon: <ShowChart />,
      color: 'warning.main',
      bgColor: 'warning.50',
      progress: 90,
      description: isSuperAdmin() ? 'System-wide venues' : 'Your venue'
    },
    {
      title: 'Active Orders',
      value: stats?.active_orders || 0,
      icon: <Timeline />,
      color: 'info.main',
      bgColor: 'info.50',
      progress: 60,
      description: 'Currently processing'
    }
  ];

  return (
    <Grid container spacing={3}>
      {/* Enhanced Performance Chart */}
      <Grid item xs={12} lg={8}>
        <EnhancedPerformanceChart data={dashboardData} stats={stats} />
      </Grid>

      {/* Top Menu Items */}
      <Grid item xs={12} lg={4}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Restaurant sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Top Selling Items
                </Typography>
              </Box>
              <Chip 
                label="Best sellers" 
                color="primary" 
                variant="outlined"
                size="small"
              />
            </Box>
            
            {dashboardData?.top_menu_items && dashboardData.top_menu_items.length > 0 ? (
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {dashboardData.top_menu_items.slice(0, 5).map((item: any, index: number) => (
                  <ListItem 
                    key={item.id} 
                    divider={index < 4}
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
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`, 
                        width: 40, 
                        height: 40,
                        fontWeight: 700
                      }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.name}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <Chip 
                              label={item.category} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Chip
                              icon={<Star sx={{ fontSize: 14 }} />}
                              label={item.rating}
                              size="small"
                              color={item.rating >= 4.5 ? 'success' : item.rating >= 4.0 ? 'warning' : 'error'}
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {item.venue_name}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.orders} orders
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                              ₹{item.revenue.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Restaurant sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary">No Menu Data</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top selling items will appear here
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Sales Performance Metrics */}
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Sales Performance Metrics
            </Typography>
            
            <Grid container spacing={3}>
              {performanceMetrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ 
                    p: 3, 
                    backgroundColor: metric.bgColor,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: metric.color,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: metric.color,
                        width: 48,
                        height: 48
                      }}>
                        {React.cloneElement(metric.icon, { fontSize: 'medium' })}
                      </Avatar>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                          {metric.value}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      {metric.title}
                    </Typography>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={metric.progress} 
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        mb: 1,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          backgroundColor: metric.color
                        }
                      }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      {metric.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Revenue Trends */}
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
              Revenue Trends
            </Typography>
            
            <Stack spacing={3}>
              <Box sx={{ 
                p: 2.5, 
                backgroundColor: 'success.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'success.200'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Today's Revenue</Typography>
                  <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                  ₹{(stats?.todays_revenue || 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  +15.3% from yesterday
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ 
                p: 2.5, 
                backgroundColor: 'primary.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.200'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Total Orders Today</Typography>
                  <LocalOffer sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {stats?.todays_orders || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  +8.7% from yesterday
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ 
                p: 2.5, 
                backgroundColor: 'warning.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'warning.200'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Peak Hour Revenue</Typography>
                  <BarChart sx={{ color: 'warning.main', fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  ₹{Math.round((stats?.todays_revenue || 0) * 0.3).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  7:00 PM - 9:00 PM
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Growth Indicators */}
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
              Growth Indicators
            </Typography>
            
            <Stack spacing={2.5}>
              {[
                { label: 'Weekly Growth', value: '+12.5%', color: 'success', trend: 'up' },
                { label: 'Monthly Growth', value: '+8.3%', color: 'success', trend: 'up' },
                { label: 'Customer Retention', value: '85.2%', color: 'info', trend: 'up' },
                { label: 'Order Frequency', value: '+5.7%', color: 'warning', trend: 'up' },
                { label: 'Average Wait Time', value: '-12%', color: 'success', trend: 'down' },
              ].map((indicator, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: `${indicator.color}.50`,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: `${indicator.color}.200`
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {indicator.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: `${indicator.color}.main` }}>
                      {indicator.value}
                    </Typography>
                    <TrendingUp sx={{ 
                      color: `${indicator.color}.main`, 
                      fontSize: 18,
                      transform: indicator.trend === 'down' ? 'rotate(180deg)' : 'none'
                    }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SalesAnalyticsTab;