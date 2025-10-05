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
import { useUserData } from '../contexts/UserDataContext';
import { PERMISSIONS } from '../types/auth';
import { venueService } from '../services/business';
import StorageManager from '../utils/storage';

interface VenueStatusManagerProps {
  venue?: any;
  onStatusChange?: (venueId: string, isOpen: boolean, isActive: boolean) => void;
}

const VenueStatusManager: React.FC<VenueStatusManagerProps> = ({ 
  venue, 
  onStatusChange 
}) => {
  const { hasPermission } = useAuth();
  const { getVenue, refreshUserData } = useUserData();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [statusType, setStatusType] = useState<'open' | 'active'>('open');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const venueData = getVenue();
  const targetVenue = venue || (venueData ? {
    id: venueData.id,
    name: venueData.name,
    isOpen: venueData.is_open || false,
    isActive: venueData.is_active,
    lastStatusChange: venueData.updated_at,
    operatingHours: 'Not set'
  } : null);
  
  const canManageStatus = hasPermission(PERMISSIONS.VENUE_ACTIVATE) || 
                         hasPermission(PERMISSIONS.VENUE_DEACTIVATE);

  if (!targetVenue) {
    return (
      <Alert severity="info">
        No venue data available. Please ensure you have a venue assigned to your account.
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
      // Update venue status using venueService
      const updateData = statusType === 'open' 
        ? { is_open: !targetVenue.isOpen }
        : { is_active: !targetVenue.isActive };
      
      await venueService.updateVenue(targetVenue.id, updateData);
      
      onStatusChange?.(
        targetVenue.id, 
        statusType === 'open' ? !targetVenue.isOpen : targetVenue.isOpen,
        statusType === 'active' ? !targetVenue.isActive : targetVenue.isActive
      );
      
      // Clear venue cache and refresh user data to get updated venue status
      StorageManager.clearVenueData();
      await refreshUserData();
      
      setOpenDialog(false);
      setReason('');
    } catch (error) {
      console.error('Error updating venue status:', error);
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
                  {targetVenue.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Venue Status Management
                </Typography>
              </Box>
            </Box>
            
            <Chip
              icon={getStatusIcon(targetVenue.isOpen, targetVenue.isActive)}
              label={getStatusText(targetVenue.isOpen, targetVenue.isActive)}
              color={getStatusColor(targetVenue.isOpen, targetVenue.isActive)}
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
                      checked={targetVenue.isOpen}
                      onChange={(e) => handleStatusToggle('open', e.target.checked)}
                      disabled={!canManageStatus || !targetVenue.isActive}
                      color="success"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        {targetVenue.isOpen ? 'Open for Orders' : 'Closed for Orders'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {targetVenue.isOpen ? 
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
                      Venue Status
                    </Typography>
                  </Box>
                  <Tooltip title="Controls overall venue availability">
                    <IconButton size="small">
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={targetVenue.isActive}
                      onChange={(e) => handleStatusToggle('active', e.target.checked)}
                      disabled={!canManageStatus}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        {targetVenue.isActive ? 'Active Venue' : 'Inactive Venue'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {targetVenue.isActive ? 
                          'Venue is operational' : 
                          'Venue is temporarily disabled'
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
                    {targetVenue.lastStatusChange ? new Date(targetVenue.lastStatusChange).toLocaleString() : 'Not available'}
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
                    {targetVenue.operatingHours || 'Not set'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {!canManageStatus && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You don't have permission to change venue status. Contact your administrator.
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
              (targetVenue.isOpen ? 'close' : 'open') : 
              (targetVenue.isActive ? 'deactivate' : 'activate')
            } the venue "{targetVenue.name}".
          </Alert>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {statusType === 'open' ? (
              targetVenue.isOpen ? 
                'Closing the venue will prevent customers from placing new orders. Existing orders will continue to be processed.' :
                'Opening the venue will allow customers to place orders again.'
            ) : (
              targetVenue.isActive ?
                'Deactivating the venue will make it completely unavailable to customers and staff.' :
                'Activating the venue will make it available for operations.'
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
            color={statusType === 'active' && targetVenue.isActive ? 'error' : 'primary'}
          >
            {loading ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VenueStatusManager;