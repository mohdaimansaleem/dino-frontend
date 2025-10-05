import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  Chip,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  PieChart,
  BarChart,
} from '@mui/icons-material';
import { getConfigValue } from '../../config/runtime';
import { useDashboardFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface BarChartProps {
  data: Array<{ day: string; revenue: number; orders: number }>;
  height?: number;
}

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number;
}

export const WeeklyRevenueChart: React.FC<BarChartProps> = ({ data, height = 300 }) => {
  const [animationKey, setAnimationKey] = useState(0);

  // Auto-refresh animation every configured interval
  useEffect(() => {
    if (!getConfigValue('CHART_ANIMATIONS_ENABLED')) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, getConfigValue('CHART_ANIMATION_INTERVAL'));

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: data.map(item => item.day),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: data.map(item => item.revenue),
        backgroundColor: 'rgba(76, 175, 80, 0.8)', // Green
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: data.map(item => item.orders),
        backgroundColor: 'rgba(33, 150, 243, 0.8)', // Blue
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: getConfigValue('CHART_ANIMATION_DURATION'),
      easing: getConfigValue('CHART_ANIMATION_EASING') as any,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#333333',
          font: {
            weight: 'bold' as const,
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `Revenue: ₹${context.parsed.y.toLocaleString()}`;
            } else {
              return `Orders: ${context.parsed.y}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue (₹)',
          color: '#666666',
          font: {
            weight: 'bold' as const,
          }
        },
        ticks: {
          color: '#666666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Orders',
          color: '#666666',
          font: {
            weight: 'bold' as const,
          }
        },
        ticks: {
          color: '#666666',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: '#666666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar key={animationKey} data={chartData} options={options} />
    </div>
  );
};

export const StatusPieChart: React.FC<PieChartProps> = ({ data, height = 250 }) => {
  const [animationKey, setAnimationKey] = useState(0);
  
  // Auto-refresh animation every configured interval
  useEffect(() => {
    if (!getConfigValue('CHART_ANIMATIONS_ENABLED')) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, getConfigValue('CHART_ANIMATION_INTERVAL'));

    return () => clearInterval(interval);
  }, []);

  // Light color palette for pie charts
  const lightColors = [
    '#FFAB91', // Light Orange
    '#A5D6A7', // Light Green
    '#FFE082', // Light Yellow
    '#CE93D8', // Light Purple
    '#F8BBD9', // Light Pink
    '#80DEEA', // Light Cyan
  ];

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color || lightColors[data.indexOf(item) % lightColors.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: getConfigValue('CHART_ANIMATION_DURATION'),
      easing: getConfigValue('CHART_ANIMATION_EASING') as any,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#333333',
          font: {
            weight: 'bold' as const,
          },
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Pie key={animationKey} data={chartData} options={options} />
    </div>
  );
};

export const DonutChart: React.FC<PieChartProps> = ({ data, height = 250 }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Auto-refresh animation every configured interval
  useEffect(() => {
    if (!getConfigValue('CHART_ANIMATIONS_ENABLED')) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, getConfigValue('CHART_ANIMATION_INTERVAL'));

    return () => clearInterval(interval);
  }, []);
  
  // Light colorful palette for donut chart
  const colors = [
    '#81C784', // Light Green
    '#64B5F6', // Light Blue
    '#FFB74D', // Light Orange
    '#BA68C8', // Light Purple
    '#F06292', // Light Pink
    '#4DD0E1', // Light Cyan
  ];

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map((item, index) => colors[index % colors.length]),
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // This makes it a donut chart
    animation: {
      duration: getConfigValue('CHART_ANIMATION_DURATION'),
      easing: getConfigValue('CHART_ANIMATION_EASING') as any,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#333333',
          font: {
            weight: 'bold' as const,
          },
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <Pie key={animationKey} data={chartData} options={options} />
      {/* Center text showing total */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333333',
          lineHeight: '1.2'
        }}>
          {total}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#666666',
          marginTop: '4px'
        }}>
          Total Orders
        </div>
      </div>
    </div>
  );
};

export const SimpleBarChart: React.FC<{ data: Array<{ name: string; value: number; color: string }>, height?: number }> = ({ data, height = 200 }) => {
  const [animationKey, setAnimationKey] = useState(0);

  // Auto-refresh animation every configured interval
  useEffect(() => {
    if (!getConfigValue('CHART_ANIMATIONS_ENABLED')) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, getConfigValue('CHART_ANIMATION_INTERVAL'));

    return () => clearInterval(interval);
  }, []);

  // Colorful palette for better visual appeal
  const colors = [
    'rgba(76, 175, 80, 0.8)',   // Green
    'rgba(33, 150, 243, 0.8)',  // Blue
    'rgba(255, 152, 0, 0.8)',   // Orange
    'rgba(156, 39, 176, 0.8)',  // Purple
    'rgba(244, 67, 54, 0.8)',   // Red
  ];

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Count',
        data: data.map(item => item.value),
        backgroundColor: data.map((item, index) => colors[index % colors.length]),
        borderColor: data.map((item, index) => colors[index % colors.length].replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: getConfigValue('CHART_ANIMATION_DURATION'),
      easing: getConfigValue('CHART_ANIMATION_EASING') as any,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#666666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Count',
          color: '#666666',
          font: {
            weight: 'bold' as const,
          }
        }
      },
      x: {
        ticks: {
          color: '#666666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar key={animationKey} data={chartData} options={options} />
    </div>
  );
};

// Enhanced Chart Wrapper Components
interface EnhancedRevenueChartProps {
  data: any;
  stats: any;
}

interface EnhancedOrderStatusChartProps {
  data: any;
  stats: any;
}

interface EnhancedSalesMetricsProps {
  data: any;
  stats: any;
}

interface EnhancedPerformanceChartProps {
  data: any;
  stats: any;
}

export const EnhancedRevenueChart: React.FC<EnhancedRevenueChartProps> = ({ data, stats }) => {
  const theme = useTheme();
  const dashboardFlags = useDashboardFlags();

  const revenueData = data?.venue_performance?.map((venue: any) => ({
    day: venue.name,
    revenue: venue.total_revenue,
    orders: venue.total_orders
  })) || [];

  const totalRevenue = revenueData.reduce((sum: number, item: any) => sum + item.revenue, 0);
  const totalOrders = revenueData.reduce((sum: number, item: any) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
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
            <ShowChart sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Revenue & Orders Analytics
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip 
              label={`₹${totalRevenue.toLocaleString()}`} 
              color="success" 
              variant="outlined"
              size="small"
            />
            <Chip 
              label={`${totalOrders} orders`} 
              color="primary" 
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'success.50', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                ₹{totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'primary.50', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totalOrders}
              </Typography>
              <Typography variant="caption" color="text.secondary">Total Orders</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center', p: 1.5, backgroundColor: 'warning.50', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                ₹{Math.round(avgOrderValue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Avg Order</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ height: 400 }}>
          {revenueData.length > 0 ? (
            <WeeklyRevenueChart data={revenueData} height={400} />
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'grey.50',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'grey.300'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <ShowChart sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">No Revenue Data</Typography>
                <Typography variant="body2" color="text.secondary">
                  Revenue trends will appear here once data is available
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export const EnhancedOrderStatusChart: React.FC<EnhancedOrderStatusChartProps> = ({ data, stats }) => {
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

  const orderStatusData = data?.analytics?.order_status_breakdown ? 
    Object.entries(data.analytics.order_status_breakdown)
      .filter(([_, count]) => (count as number) > 0)
      .map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count as number,
        color: getStatusColor(status)
      })) : [];

  const totalOrders = orderStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
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
            <PieChart sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Order Status Distribution
            </Typography>
          </Box>
          <Chip 
            label={`${totalOrders} total`} 
            color="primary" 
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ height: 350 }}>
          {orderStatusData.length > 0 ? (
            <DonutChart data={orderStatusData} height={350} />
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'grey.50',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'grey.300'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <PieChart sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">No Order Data</Typography>
                <Typography variant="body2" color="text.secondary">
                  Order status distribution will appear here
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export const EnhancedSalesMetrics: React.FC<EnhancedSalesMetricsProps> = ({ data, stats }) => {
  const theme = useTheme();

  const metrics = [
    {
      title: 'Average Order Value',
      value: `₹${(stats?.avg_order_value || 0).toLocaleString()}`,
      icon: <TrendingUp />,
      color: 'success.main',
      bgColor: 'success.50',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Table Occupancy Rate',
      value: `${stats?.table_occupancy_rate || 0}%`,
      icon: <BarChart />,
      color: 'primary.main',
      bgColor: 'primary.50',
      change: '+8.3%',
      changeType: 'positive'
    },
    {
      title: 'Active Venues',
      value: data?.system_stats?.total_active_venues || 1,
      icon: <ShowChart />,
      color: 'warning.main',
      bgColor: 'warning.50',
      change: '+2',
      changeType: 'positive'
    },
    {
      title: 'Active Orders',
      value: stats?.active_orders || 0,
      icon: <BarChart />,
      color: 'info.main',
      bgColor: 'info.50',
      change: '-5.2%',
      changeType: 'negative'
    }
  ];

  return (
    <Card sx={{ 
      borderRadius: 3,
      boxShadow: theme.shadows[2],
      border: '1px solid',
      borderColor: 'divider',
      height: '100%'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
          Performance Metrics
        </Typography>
        
        <Grid container spacing={3}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ 
                p: 2.5, 
                backgroundColor: metric.bgColor,
                borderRadius: 2,
                border: '1px solid',
                borderColor: metric.color,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 1.5, 
                    backgroundColor: metric.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {React.cloneElement(metric.icon, { fontSize: 'small' })}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {metric.changeType === 'positive' ? (
                      <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: metric.changeType === 'positive' ? 'success.main' : 'error.main',
                        fontWeight: 600
                      }}
                    >
                      {metric.change}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  {metric.value}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {metric.title}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export const EnhancedPerformanceChart: React.FC<EnhancedPerformanceChartProps> = ({ data, stats }) => {
  const theme = useTheme();

  const performanceData = data?.analytics?.revenue_by_venue ? 
    Object.entries(data.analytics.revenue_by_venue)
      .filter(([_, revenue]) => (revenue as number) > 0)
      .map(([venue, revenue], index) => ({
        name: venue,
        value: revenue as number,
        color: `rgba(${76 + index * 30}, ${175 - index * 20}, ${80 + index * 25}, 0.8)`
      })) : [];

  const totalRevenue = performanceData.reduce((sum, item) => sum + item.value, 0);

  return (
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
            <BarChart sx={{ color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Revenue by Category
            </Typography>
          </Box>
          <Chip 
            label={`₹${totalRevenue.toLocaleString()}`} 
            color="success" 
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ height: 350 }}>
          {performanceData.length > 0 ? (
            <SimpleBarChart data={performanceData} height={350} />
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'grey.50',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'grey.300'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <BarChart sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">No Performance Data</Typography>
                <Typography variant="body2" color="text.secondary">
                  Revenue breakdown will appear here
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Export individual chart components
// These should be imported directly where needed:
// import { WeeklyRevenueChart, StatusPieChart } from '../components/charts/ChartComponents'