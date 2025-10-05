import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Stack,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Payment,
  CreditCard,
  AccountBalance,
  MonetizationOn,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Error,
  Schedule,
  Assessment,
} from '@mui/icons-material';

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

interface PaymentsTabProps {
  stats: VenueDashboardStats | null;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ stats }) => {
  const theme = useTheme();

  // Mock payment method data (in real app, this would come from API)
  const paymentMethods = [
    { method: 'Credit Card', percentage: 45, amount: (stats?.todays_revenue || 0) * 0.45, color: '#2196F3', icon: <CreditCard /> },
    { method: 'Digital Wallet', percentage: 30, amount: (stats?.todays_revenue || 0) * 0.30, color: '#4CAF50', icon: <Payment /> },
    { method: 'Cash', percentage: 20, amount: (stats?.todays_revenue || 0) * 0.20, color: '#FF9800', icon: <MonetizationOn /> },
    { method: 'Bank Transfer', percentage: 5, amount: (stats?.todays_revenue || 0) * 0.05, color: '#9C27B0', icon: <AccountBalance /> },
  ];

  const paymentStats = [
    {
      title: 'Total Payments Today',
      value: `₹${(stats?.todays_revenue || 0).toLocaleString()}`,
      icon: <MonetizationOn />,
      color: 'success.main',
      bgColor: 'success.50',
      change: '+15.3%',
      changeType: 'positive'
    },
    {
      title: 'Successful Payments',
      value: '98.5%',
      icon: <CheckCircle />,
      color: 'success.main',
      bgColor: 'success.50',
      change: '+0.2%',
      changeType: 'positive'
    },
    {
      title: 'Failed Payments',
      value: '1.5%',
      icon: <Error />,
      color: 'error.main',
      bgColor: 'error.50',
      change: '-0.2%',
      changeType: 'positive'
    },
    {
      title: 'Average Transaction',
      value: `₹${stats?.avg_order_value || 0}`,
      icon: <TrendingUp />,
      color: 'primary.main',
      bgColor: 'primary.50',
      change: '+8.7%',
      changeType: 'positive'
    }
  ];

  const transactionTrends = [
    { time: '9:00 AM', amount: 12500, transactions: 15 },
    { time: '12:00 PM', amount: 28000, transactions: 32 },
    { time: '3:00 PM', amount: 18500, transactions: 22 },
    { time: '6:00 PM', amount: 35000, transactions: 45 },
    { time: '9:00 PM', amount: 42000, transactions: 38 },
  ];

  const maxAmount = Math.max(...transactionTrends.map(t => t.amount));

  return (
    <Grid container spacing={3}>
      {/* Payment Overview */}
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Assessment sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Payment Analytics Overview
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {paymentStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box sx={{ 
                    p: 2.5, 
                    backgroundColor: stat.bgColor,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: stat.color,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Avatar sx={{ 
                        backgroundColor: stat.color,
                        width: 40,
                        height: 40
                      }}>
                        {React.cloneElement(stat.icon, { fontSize: 'medium' })}
                      </Avatar>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {stat.changeType === 'positive' ? (
                          <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                          <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                        )}
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: stat.changeType === 'positive' ? 'success.main' : 'error.main',
                            fontWeight: 600
                          }}
                        >
                          {stat.change}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Methods Distribution */}
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
              Payment Methods Distribution
            </Typography>
            
            <Stack spacing={2.5}>
              {paymentMethods.map((method, index) => (
                <Box key={method.method} sx={{ 
                  p: 2.5, 
                  backgroundColor: `${method.color}15`,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: `${method.color}40`
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ 
                        backgroundColor: method.color,
                        width: 36,
                        height: 36
                      }}>
                        {React.cloneElement(method.icon, { fontSize: 'small' })}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {method.method}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: method.color }}>
                        {method.percentage}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ₹{method.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={method.percentage} 
                    sx={{ 
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: method.color
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Transaction Trends */}
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
              Hourly Transaction Trends
            </Typography>
            
            <Stack spacing={2}>
              {transactionTrends.map((trend, index) => (
                <Box key={trend.time} sx={{ 
                  p: 2, 
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {trend.time}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ₹{trend.amount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {trend.transactions} transactions
                      </Typography>
                    </Box>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(trend.amount / maxAmount) * 100} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: index === transactionTrends.length - 1 ? 'success.main' : 'primary.main'
                      }
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PaymentsTab;