import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Edit,
  CheckCircle,
  Schedule,
  Restaurant,
  LocalShipping,
  Pending,
  Kitchen,
  Done,
} from '@mui/icons-material';
import { orderService, OrderStatus } from '../../services/business';

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
  orderNumber?: string;
  onStatusUpdated?: (newStatus: OrderStatus) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  variant?: 'button' | 'inline' | 'card';
  showCurrentStatus?: boolean;
}

const OrderStatusUpdate: React.FC<OrderStatusUpdateProps> = ({
  orderId,
  currentStatus,
  orderNumber,
  onStatusUpdated,
  onError,
  disabled = false,
  variant = 'button',
  showCurrentStatus = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Order status configuration
  const statusConfig: Record<OrderStatus, {
    label: string;
    color: string;
    icon: React.ReactElement;
    description: string;
    allowedTransitions: OrderStatus[];
  }> = {
    pending: {
      label: 'Pending',
      color: '#f59e0b',
      icon: <Pending />,
      description: 'Order received, awaiting confirmation',
      allowedTransitions: ['confirmed'],
    },
    confirmed: {
      label: 'Confirmed',
      color: '#3b82f6',
      icon: <CheckCircle />,
      description: 'Order confirmed, will start preparing soon',
      allowedTransitions: ['preparing'],
    },
    preparing: {
      label: 'Preparing',
      color: '#f97316',
      icon: <Kitchen />,
      description: 'Order is being prepared in the kitchen',
      allowedTransitions: ['ready'],
    },
    ready: {
      label: 'Ready',
      color: '#10b981',
      icon: <Done />,
      description: 'Order is ready for pickup/delivery',
      allowedTransitions: ['out_for_delivery', 'served', 'delivered'],
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      color: '#8b5cf6',
      icon: <LocalShipping />,
      description: 'Order is on the way to customer',
      allowedTransitions: ['delivered'],
    },
    delivered: {
      label: 'Delivered',
      color: '#059669',
      icon: <CheckCircle />,
      description: 'Order has been delivered to customer',
      allowedTransitions: [],
    },
    served: {
      label: 'Served',
      color: '#059669',
      icon: <Restaurant />,
      description: 'Order has been served to customer',
      allowedTransitions: [],
    },
    cancelled: {
      label: 'Cancelled',
      color: '#ef4444',
      icon: <Done />, // Using Done icon since Cancel is not imported
      description: 'Order has been cancelled',
      allowedTransitions: [],
    },
  };

  const currentConfig = statusConfig[currentStatus];
  const allowedStatuses = currentConfig.allowedTransitions;

  const handleOpen = () => {
    setOpen(true);
    setSelectedStatus(currentStatus);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStatus(currentStatus);
    setError(null);
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      handleClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Updating order ${orderId} status from ${currentStatus} to ${selectedStatus}`);
      
      await orderService.updateOrderStatus(orderId, selectedStatus);
      
      console.log('✅ Order status updated successfully');
      
      // Call the callback if provided
      if (onStatusUpdated) {
        onStatusUpdated(selectedStatus);
      }
      
      handleClose();
    } catch (error: any) {
      console.error('❌ Failed to update order status:', error);
      const errorMessage = error.message || 'Failed to update order status';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStatusChip = (status: OrderStatus, size: 'small' | 'medium' = 'small') => {
    const config = statusConfig[status];
    return (
      <Chip
        icon={React.cloneElement(config.icon, { sx: { color: 'white !important' } })}
        label={config.label}
        size={size}
        sx={{
          backgroundColor: config.color,
          color: 'white',
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: 'white !important',
          },
        }}
      />
    );
  };

  const renderDialog = () => (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="600">
          Update Order Status
        </Typography>
        {orderNumber && (
          <Typography variant="body2" color="text.secondary">
            Order #{orderNumber}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Current Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Status
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {renderStatusChip(currentStatus, 'medium')}
            <Typography variant="body2" color="text.secondary">
              {currentConfig.description}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Status Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>New Status</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            label="New Status"
            disabled={loading}
          >
            {/* Current status option */}
            <MenuItem value={currentStatus}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Box sx={{ color: currentConfig.color }}>
                  {React.cloneElement(currentConfig.icon, { sx: { color: currentConfig.color } })}
                </Box>
                <Box>
                  <Typography variant="body1">{currentConfig.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Current status
                  </Typography>
                </Box>
              </Box>
            </MenuItem>

            {/* Available transition options */}
            {allowedStatuses.map((status) => {
              const config = statusConfig[status];
              return (
                <MenuItem key={status} value={status}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Box sx={{ color: config.color }}>
                      {React.cloneElement(config.icon, { sx: { color: config.color } })}
                    </Box>
                    <Box>
                      <Typography variant="body1">{config.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {config.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {/* Status Preview */}
        {selectedStatus !== currentStatus && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'grey.50', 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle2" gutterBottom>
              Preview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {renderStatusChip(selectedStatus, 'medium')}
              <Typography variant="body2" color="text.secondary">
                {statusConfig[selectedStatus].description}
              </Typography>
            </Box>
          </Box>
        )}

        {allowedStatuses.length === 0 && (
          <Alert severity="info">
            No status transitions are available for this order.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdateStatus}
          disabled={loading || selectedStatus === currentStatus || allowedStatuses.length === 0}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
          sx={{ borderRadius: 2 }}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Inline variant - shows current status with edit button
  if (variant === 'inline') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showCurrentStatus && renderStatusChip(currentStatus)}
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={handleOpen}
          disabled={disabled || allowedStatuses.length === 0}
          variant="outlined"
          sx={{ minWidth: 'auto' }}
        >
          Update
        </Button>
        {renderDialog()}
      </Box>
    );
  }

  // Card variant - shows full status card
  if (variant === 'card') {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Order Status
              </Typography>
              {showCurrentStatus && (
                <Box sx={{ mb: 1 }}>
                  {renderStatusChip(currentStatus, 'medium')}
                </Box>
              )}
              <Typography variant="body2" color="text.secondary">
                {currentConfig.description}
              </Typography>
            </Box>
            <Button
              startIcon={<Edit />}
              onClick={handleOpen}
              disabled={disabled || allowedStatuses.length === 0}
              variant="outlined"
              size="small"
            >
              Update Status
            </Button>
          </Box>
          
          {allowedStatuses.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Available transitions:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {allowedStatuses.map((status) => (
                  <Chip
                    key={status}
                    label={statusConfig[status].label}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
        {renderDialog()}
      </Card>
    );
  }

  // Button variant (default)
  return (
    <React.Fragment>
      <Button
        startIcon={<Edit />}
        onClick={handleOpen}
        disabled={disabled || allowedStatuses.length === 0}
        variant="contained"
        color="primary"
        size={isMobile ? 'small' : 'medium'}
      >
        Update Status
      </Button>
      {renderDialog()}
    </React.Fragment>
  );
};

export default OrderStatusUpdate;