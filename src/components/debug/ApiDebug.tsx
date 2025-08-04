import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Alert } from '@mui/material';
import { dashboardService } from '../../services/dashboardService';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import { getUserVenueId } from '../../utils/userUtils';

const ApiDebug: React.FC = () => {
  const { user } = useAuth();
  const [dashboardResult, setDashboardResult] = useState<any>(null);
  const [ordersResult, setOrdersResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDashboardApi = async () => {
    setLoading(true);
    try {
      const result = await dashboardService.getAdminDashboard();
      setDashboardResult({ success: true, data: result });
    } catch (error: any) {
      setDashboardResult({ success: false, error: error?.message || String(error) });
    }
    setLoading(false);
  };

  const testOrdersApi = async () => {
    const venueId = getUserVenueId(user);
    if (!venueId) {
      setOrdersResult({ success: false, error: 'No venue ID available' });
      return;
    }

    setLoading(true);
    try {
      const result = await orderService.getVenueOrders(venueId);
      setOrdersResult({ success: true, data: result, venueId });
    } catch (error: any) {
      setOrdersResult({ success: false, error: error?.message || String(error), venueId });
    }
    setLoading(false);
  };

  return (
    <Card sx={{ mb: 2, border: '2px solid blue' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          🔧 API Debug
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Button 
            variant="outlined" 
            onClick={testDashboardApi} 
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Test Dashboard API
          </Button>
          <Button 
            variant="outlined" 
            onClick={testOrdersApi} 
            disabled={loading}
          >
            Test Orders API
          </Button>
        </Box>

        {dashboardResult && (
          <Alert severity={dashboardResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Dashboard API Result:</Typography>
            <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
              {JSON.stringify(dashboardResult, null, 2)}
            </Typography>
          </Alert>
        )}

        {ordersResult && (
          <Alert severity={ordersResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Orders API Result:</Typography>
            <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
              {JSON.stringify(ordersResult, null, 2)}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiDebug;