import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Restaurant,
  Schedule,
  Visibility,
  VisibilityOff,
  Settings,
  Info,
  CheckCircle,
  Cancel,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { PERMISSIONS } from '../types/auth';

interface CafeStatusManagerProps {
  cafe?: any;
  onStatusChange?: (cafeId: string, isOpen: boolean, isActive: boolean) => void;
}

const CafeStatusManager: React.FC<CafeStatusManagerProps> = ({ 
  cafe, 
  onStatusChange 
}) => {
  const { hasPermission } = useAuth();
  const { currentCafe, toggleCafeStatus, activateCafe, deactivateCafe } = useWorkspace();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [statusType, setStatusType] = useState<'open' | 'active'>('open');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const targetCafe = cafe || currentCafe;
  
  const canManageStatus = hasPermission(PERMISSIONS.VENUE_ACTIVATE) || 
                         hasPermission(PERMISSIONS.VENUE_DEACTIVATE);

  if (!targetCafe) {
    return (
      <Alert severity="info">
        No cafe selected. Please select a cafe to manage its status.
      </Alert>
    );
  }

  const handleStatusToggle = async (type: 'open' | 'active', newValue: boolean) => {
    if (!canManageStatus) {
      return;
    }

    setStatusType(type);
    setOpenDialog(true);
  };

  const confirmStatusChange = async () => {
    setLoading(true);
    try {
      if (statusType === 'open') {
        await toggleCafeStatus(targetCafe.id, !targetCafe.isOpen);
      } else {
        if (targetCafe.isActive) {
          await deactivateCafe(targetCafe.id);
        } else {
          await activateCafe(targetCafe.id);
        }
      }
      
      onStatusChange?.(
        targetCafe.id, 
        statusType === 'open' ? !targetCafe.isOpen : targetCafe.isOpen,
        statusType === 'active' ? !targetCafe.isActive : targetCafe.isActive
      );
      
      setOpenDialog(false);
      setReason('');
    } catch (error) {
      console.error('Failed to update cafe status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isOpen: boolean, isActive: boolean) => {
    if (!isActive) return 'error';
    if (!isOpen) return 'warning';
    return 'success';
  };

  const getStatusText = (isOpen: boolean, isActive: boolean) => {
    if (!isActive) return 'Inactive';
    if (!isOpen) return 'Closed';
    return 'Open';
  };

  const getStatusIcon = (isOpen: boolean, isActive: boolean) => {
    if (!isActive) return <Cancel />;
    if (!isOpen) return <VisibilityOff />;
    return <CheckCircle />;
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: 48,
                  height: 48,
                }}
              >
                <Restaurant />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  {targetCafe.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cafe Status Management
                </Typography>
              </Box>
            </Box>
            
            <Chip
              icon={getStatusIcon(targetCafe.isOpen, targetCafe.isActive)}
              label={getStatusText(targetCafe.isOpen, targetCafe.isActive)}
              color={getStatusColor(targetCafe.isOpen, targetCafe.isActive)}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Grid container spacing={3}>
            {/* Operational Status */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Visibility sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="600">
                      Operational Status
                    </Typography>
                  </Box>
                  <Tooltip title="Controls whether customers can place orders">
                    <IconButton size="small">
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={targetCafe.isOpen}
                      onChange={(e) => handleStatusToggle('open', e.target.checked)}
                      disabled={!canManageStatus || !targetCafe.isActive}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        {targetCafe.isOpen ? 'Open for Orders' : 'Closed for Orders'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {targetCafe.isOpen ? 
                          'Customers can place orders' : 
                          'Orders are temporarily disabled'
                        }
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Grid>

            {/* Active Status */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Settings sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="subtitle1" fontWeight="600">
                      Cafe Status
                    </Typography>
                  </Box>
                  <Tooltip title="Controls overall cafe availability">
                    <IconButton size="small">
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={targetCafe.isActive}
                      onChange={(e) => handleStatusToggle('active', e.target.checked)}
                      disabled={!canManageStatus}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        {targetCafe.isActive ? 'Active Cafe' : 'Inactive Cafe'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {targetCafe.isActive ? 
                          'Cafe is operational' : 
                          'Cafe is temporarily disabled'
                        }
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Additional Information */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" fontWeight="500">
                    Last Status Change
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {targetCafe.lastStatusChange ? new Date(targetCafe.lastStatusChange).toLocaleString() : 'Not available'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" fontWeight="500">
                    Operating Hours
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {targetCafe.operatingHours || 'Not set'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {!canManageStatus && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You don't have permission to change cafe status. Contact your administrator.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Status Change
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            You are about to {statusType === 'open' ? 
              (targetCafe.isOpen ? 'close' : 'open') : 
              (targetCafe.isActive ? 'deactivate' : 'activate')
            } the cafe "{targetCafe.name}".
          </Alert>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {statusType === 'open' ? (
              targetCafe.isOpen ? 
                'Closing the cafe will prevent customers from placing new orders. Existing orders will continue to be processed.' :
                'Opening the cafe will allow customers to place orders again.'
            ) : (
              targetCafe.isActive ?
                'Deactivating the cafe will make it completely unavailable to customers and staff.' :
                'Activating the cafe will make it available for operations.'
            )}
          </Typography>

          <TextField
            fullWidth
            label="Reason for change (optional)"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Enter reason for this status change..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={confirmStatusChange} 
            variant="contained"
            disabled={loading}
            color={statusType === 'active' && targetCafe.isActive ? 'error' : 'primary'}
          >
            {loading ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CafeStatusManager;