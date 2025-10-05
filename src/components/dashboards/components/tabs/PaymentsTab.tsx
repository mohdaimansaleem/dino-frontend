import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
} from '@mui/material';

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
  return (
    <Grid container spacing={3}>
      {/* Payment Methods */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Methods Distribution
            </Typography>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Typography variant="h6" color="text.secondary">No Payment Data Available</Typography>
              <Typography variant="body2" color="text.secondary">Payment method distribution will appear here once data is available.</Typography>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Summary */}
      <Grid item xs={12} md={6}>
        <Card sx={{ 
          borderRadius: 2,
          boxShadow: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Payment Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.50', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="600" color="success.main">
                  ₹{(stats?.todays_revenue || 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Total Payments
                </Typography>
              </Box>
              
              <Divider />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Successful Payments</Typography>
                <Typography variant="h6" color="success.main">98.5%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Failed Payments</Typography>
                <Typography variant="h6" color="error.main">1.5%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Average Transaction</Typography>
                <Typography variant="h6" color="primary.main">₹{stats?.avg_order_value || 0}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PaymentsTab;