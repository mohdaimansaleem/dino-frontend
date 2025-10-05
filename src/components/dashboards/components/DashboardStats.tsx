import React from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Stack,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  Today,
  ShoppingCart,
  TableRestaurant,
  MonetizationOn,
  TrendingUp,
  Restaurant,
  Pending,
  Kitchen,
  CheckCircle,
  People,
} from '@mui/icons-material';
import { usePermissions } from '../../auth';
import PermissionService from '../../../services/auth';
import { useDashboardFlags } from '../../../flags/FlagContext';

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

interface DashboardStatsProps {
  stats: VenueDashboardStats | null;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const { isSuperAdmin, isAdmin, isOperator, user } = usePermissions();
  const dashboardFlags = useDashboardFlags();

  // Don't render if flag is disabled
  if (!dashboardFlags.showDashboardStats) {
    return null;
  }

  // SuperAdmin Stats
  const superAdminStats = [
    { 
      label: 'Today\'s Revenue', 
      value: `₹${(stats?.todays_revenue || 0).toLocaleString()}`, 
      color: '#2196F3', 
      icon: <Today />,
      description: `${stats?.todays_orders || 0} orders today`
    },
    { 
      label: 'Active Orders', 
      value: stats?.active_orders || 0, 
      color: '#4CAF50', 
      icon: <ShoppingCart />,
      description: 'Currently processing'
    },
    { 
      label: 'Table Occupancy', 
      value: `${stats?.table_occupancy_rate || 0}%`, 
      color: '#FF9800', 
      icon: <TableRestaurant />,
      description: `${stats?.total_tables || 0} total tables`
    },
    { 
      label: 'Avg Order Value', 
      value: `₹${stats?.avg_order_value || 0}`, 
      color: '#9C27B0', 
      icon: <MonetizationOn />,
      description: `${stats?.total_orders || 0} total orders`
    },
  ];

  // Admin Stats
  const adminStats = [
    { 
      label: 'Today\'s Orders', 
      value: stats?.todays_orders || 0, 
      color: '#2196F3', 
      icon: <Today />,
      description: 'Total orders received today'
    },
    { 
      label: 'Today\'s Revenue', 
      value: `₹${(stats?.todays_revenue || 0).toLocaleString()}`, 
      color: '#4CAF50', 
      icon: <TrendingUp />,
      description: 'Revenue generated today'
    },
    { 
      label: 'Tables Occupied', 
      value: `${stats?.occupied_tables || 0}/${stats?.total_tables || 0}`, 
      color: '#FF9800', 
      icon: <TableRestaurant />,
      description: 'Current table occupancy',
      progress: stats?.table_occupancy_rate || 0
    },
    { 
      label: 'Menu Items Active', 
      value: `${stats?.active_menu_items || 0}/${stats?.total_menu_items || 0}`, 
      color: '#9C27B0', 
      icon: <Restaurant />,
      description: 'Available menu items',
      progress: Math.round((stats?.active_menu_items || 0) / Math.max(stats?.total_menu_items || 1, 1) * 100)
    },
  ];

  // Operator Stats
  const operatorStats = [
    { 
      label: 'Pending Orders', 
      value: stats?.pending_orders || 0, 
      color: '#FF9800', 
      icon: <Pending />,
      description: 'Awaiting confirmation'
    },
    { 
      label: 'Preparing', 
      value: stats?.preparing_orders || 0, 
      color: '#2196F3', 
      icon: <Kitchen />,
      description: 'Currently in kitchen'
    },
    { 
      label: 'Ready to Serve', 
      value: stats?.ready_orders || 0, 
      color: '#4CAF50', 
      icon: <CheckCircle />,
      description: 'Ready for pickup'
    },
    { 
      label: 'Tables Occupied', 
      value: `${stats?.occupied_tables || 0}/${stats?.total_tables || 0}`, 
      color: '#9C27B0', 
      icon: <TableRestaurant />,
      description: 'Current occupancy'
    },
  ];

  const getStatsToRender = () => {
    // Use the same role detection as control panel
    const backendRole = PermissionService.getBackendRole();
    const detectedRole = backendRole?.name || user?.role || 'unknown';
    
    if (detectedRole === 'superadmin' || detectedRole === 'super_admin') {
      return superAdminStats;
    } else if (detectedRole === 'admin') {
      return adminStats;
    } else if (detectedRole === 'operator') {
      return operatorStats;
    }
    
    // Fallback to permission hooks
    if (isSuperAdmin()) return superAdminStats;
    if (isAdmin()) return adminStats;
    if (isOperator()) return operatorStats;
    return superAdminStats; // fallback
  };

  const statsToRender = getStatsToRender();

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {statsToRender.map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 2,
                backgroundColor: `${stat.color}08`,
                border: `1px solid ${stat.color}33`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${stat.color}33`,
                  backgroundColor: `${stat.color}12`,
                },
              }}
              data-tour="stats-cards"
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                {/* Icon with Badge for Operator */}
                {(() => {
                  const backendRole = PermissionService.getBackendRole();
                  const detectedRole = backendRole?.name || user?.role || 'unknown';
                  return detectedRole === 'operator' && detectedRole !== 'admin' && detectedRole !== 'superadmin' && detectedRole !== 'super_admin';
                })() ? (
                  <Badge badgeContent={stat.value} color={index === 0 ? 'warning' : index === 1 ? 'primary' : 'success'}>
                    <Box
                      sx={{
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        borderRadius: 2,
                        backgroundColor: stat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                      }}
                    >
                      {React.cloneElement(stat.icon, { 
                        fontSize: 'large' 
                      })}
                    </Box>
                  </Badge>
                ) : (
                  <Box
                    sx={{
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      borderRadius: 2,
                      backgroundColor: stat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {React.cloneElement(stat.icon, { 
                      fontSize: 'large' 
                    })}
                  </Box>
                )}
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h4" 
                    fontWeight="700" 
                    color="text.primary"
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '2rem' },
                      lineHeight: 1.2,
                      mb: 0.5
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    fontWeight="600"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {stat.label}
                  </Typography>
                  
                  {/* Progress bar for Admin stats */}
                  {(stat as any).progress !== undefined && (
                    <LinearProgress 
                      variant="determinate" 
                      value={(stat as any).progress} 
                      sx={{ 
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        mt: 1,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 2,
                          backgroundColor: stat.color
                        }
                      }}
                    />
                  )}
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.description}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardStats;