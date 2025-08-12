import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  LinearProgress,
  Snackbar,
  Alert,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Store as StoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { PERMISSIONS } from '../types/auth';
import { venueService } from '../services/venueService';

const VenueStatusControl: React.FC = () => {
  const { hasPermission, hasBackendPermission } = useAuth();
  const { userData } = useUserData();
  const theme = useTheme();
  const currentVenue = userData?.venue;
  const [venueActive, setVenueActive] = useState(true);
  const [venueOpen, setVenueOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // REMOVED: Unnecessary API call to load venue status
  // The venue status is already available in UserDataContext from /auth/user-data
  useEffect(() => {
    if (currentVenue) {
      setVenueActive(currentVenue.is_active || false);
      setVenueOpen(currentVenue.is_open || false);
      console.log('Using venue status from UserDataContext:', {
        isActive: currentVenue.is_active,
        isOpen: currentVenue.is_open
      });
    }
  }, [currentVenue]);

  const handleToggleVenueOpen = async () => {
    if (!currentVenue?.id || statusLoading) return;

    try {
      setStatusLoading(true);
      const newStatus = !venueOpen;
      
      await venueService.updateVenue(currentVenue.id, { 
        status: newStatus ? 'active' : 'closed' 
      });

      setVenueOpen(newStatus);
      setSnackbar({ 
        open: true, 
        message: `Venue ${newStatus ? 'opened' : 'closed'} for orders`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error toggling venue open status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update venue status', 
        severity: 'error' 
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // Dynamic permission checks
  const canManageVenue = () => {
    return hasPermission(PERMISSIONS.VENUE_ACTIVATE) || 
           hasBackendPermission('venue.update') ||
           hasBackendPermission('venue.manage');
  };

  // Don't show if no venue or no permissions
  if (!currentVenue || !canManageVenue()) {
    return null;
  }

  return (
    <>
      <Card sx={{ 
        mb: 2,
        borderRadius: 2,
        boxShadow: theme.shadows[1],
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header Section */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: venueOpen ? 'success.main' : 'error.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <StoreIcon sx={{ fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="600" sx={{ color: 'white' }}>
                {currentVenue.name || 'Current Venue'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem' }}>
                {venueActive ? 'Venue Active' : 'Venue Inactive'}
              </Typography>
            </Box>
            <Chip
              icon={venueOpen ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
              label={venueOpen ? 'OPEN' : 'CLOSED'}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
          </Box>

          {/* Content Section */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight="500">
                  Order Status
                </Typography>
              </Box>
              <Switch
                checked={venueOpen}
                onChange={handleToggleVenueOpen}
                disabled={statusLoading || !venueActive}
                color="success"
                size="small"
              />
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.875rem',
                fontStyle: venueOpen ? 'normal' : 'italic'
              }}
            >
              {venueOpen 
                ? '✅ Currently accepting new orders from customers' 
                : '🚫 Orders are temporarily disabled - customers cannot place new orders'
              }
            </Typography>

            {!venueActive && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mt: 2, 
                  fontSize: '0.75rem',
                  '& .MuiAlert-message': {
                    fontSize: '0.75rem'
                  }
                }}
              >
                Venue is inactive. Contact administrator to activate.
              </Alert>
            )}

            {statusLoading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress sx={{ borderRadius: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Updating venue status...
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Status Update Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VenueStatusControl;