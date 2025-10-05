import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import { Restaurant, Info } from '@mui/icons-material';
import { OrderStatusUpdate } from '../../components/orders';
import { OrderStatus } from '../../services/business';
import Layout from '../../components/common';

const OrderStatusDemo: React.FC = () => {
  const theme = useTheme();
  
  // Demo state
  const [demoOrderId, setDemoOrderId] = useState('12345678-1234-5678-9012-123456789abc');
  const [demoOrderNumber, setDemoOrderNumber] = useState('ORD-2024-001');
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('pending');
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStatusUpdated = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
    setLastUpdate(`Status updated to "${newStatus}" at ${new Date().toLocaleTimeString()}`);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setLastUpdate(null);
  };

  const resetDemo = () => {
    setCurrentStatus('pending');
    setLastUpdate(null);
    setError(null);
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="600">
            Order Status Update Demo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Test the order status update API integration with different UI variants
          </Typography>
        </Box>

        {/* API Information */}
        <Card sx={{ mb: 4, backgroundColor: 'info.light', color: 'info.contrastText' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Info sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  API Endpoint
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                  PUT /api/v1/orders/{'{orderId}'}/status?new_status={'{status}'}
                </Typography>
                <Typography variant="body2">
                  This demo calls the order status update API with the specified order ID and new status.
                  Make sure your backend API is running and accessible.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Demo Controls */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Demo Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Order ID"
                value={demoOrderId}
                onChange={(e) => setDemoOrderId(e.target.value)}
                variant="outlined"
                helperText="UUID format expected by API"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Order Number"
                value={demoOrderNumber}
                onChange={(e) => setDemoOrderNumber(e.target.value)}
                variant="outlined"
                helperText="Display name for the order"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                <Button
                  variant="outlined"
                  onClick={resetDemo}
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  Reset Demo
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Status Feedback */}
        {lastUpdate && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {lastUpdate}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Demo Variants */}
        <Grid container spacing={4}>
          {/* Button Variant */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Button Variant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Simple button that opens a dialog for status update
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body2">Current Status:</Typography>
                <Typography variant="body1" fontWeight="600" sx={{ textTransform: 'capitalize' }}>
                  {currentStatus.replace('_', ' ')}
                </Typography>
              </Box>
              
              <OrderStatusUpdate
                orderId={demoOrderId}
                currentStatus={currentStatus}
                orderNumber={demoOrderNumber}
                onStatusUpdated={handleStatusUpdated}
                onError={handleError}
                variant="button"
              />
            </Paper>
          </Grid>

          {/* Inline Variant */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Inline Variant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Shows current status chip with inline edit button
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Order Status:</Typography>
                <OrderStatusUpdate
                  orderId={demoOrderId}
                  currentStatus={currentStatus}
                  orderNumber={demoOrderNumber}
                  onStatusUpdated={handleStatusUpdated}
                  onError={handleError}
                  variant="inline"
                  showCurrentStatus={true}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Card Variant */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Card Variant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Full card display with status information and available transitions
              </Typography>
              
              <OrderStatusUpdate
                orderId={demoOrderId}
                currentStatus={currentStatus}
                orderNumber={demoOrderNumber}
                onStatusUpdated={handleStatusUpdated}
                onError={handleError}
                variant="card"
                showCurrentStatus={true}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Usage Examples */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Usage Examples
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Basic Button Usage
              </Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'grey.100', 
                borderRadius: 1, 
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {`<OrderStatusUpdate
  orderId="12345678-1234-5678-9012-123456789abc"
  currentStatus="pending"
  onStatusUpdated={(newStatus) => console.log('Updated to:', newStatus)}
  onError={(error) => console.error('Error:', error)}
/>`}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Inline with Status Display
              </Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'grey.100', 
                borderRadius: 1, 
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {`<OrderStatusUpdate
  orderId="12345678-1234-5678-9012-123456789abc"
  currentStatus="confirmed"
  orderNumber="ORD-2024-001"
  variant="inline"
  showCurrentStatus={true}
  onStatusUpdated={handleStatusUpdate}
/>`}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Full Card Display
              </Typography>
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'grey.100', 
                borderRadius: 1, 
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                {`<OrderStatusUpdate
  orderId="12345678-1234-5678-9012-123456789abc"
  currentStatus="preparing"
  orderNumber="ORD-2024-001"
  variant="card"
  onStatusUpdated={handleStatusUpdate}
  onError={handleError}
/>`}
              </Box>
            </Box>
          </Stack>
        </Paper>

        {/* API Response Information */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Expected API Response
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The API should return a successful response when the status is updated:
          </Typography>
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'grey.100', 
            borderRadius: 1, 
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            {`{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order_id": "12345678-1234-5678-9012-123456789abc",
    "old_status": "pending",
    "new_status": "confirmed",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}`}
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default OrderStatusDemo;