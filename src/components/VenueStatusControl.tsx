import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
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

interface VenueStatusControlProps {}

const VenueStatusControl: React.FC<VenueStatusControlProps> = () => {
  const { hasPermission, hasBackendPermission } = useAuth();
  const { userData } = useUserData();
  const theme = useTheme();
  const currentVenue = userData?.venue;
  const [venueActive, setVenueActive] = useState<boolean>(true);
  const [venueOpen, setVenueOpen] = useState<boolean>(true);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error';
  }>({ 
    open: false, 
    message: '', 
    severity: 'success'
  });

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

  const handleToggleVenueOpen = async (): Promise<void> => {
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

  const canManageVenue = (): boolean => {
    return hasPermission(PERMISSIONS.VENUE_ACTIVATE) || 
           hasBackendPermission('venue.update') ||
           hasBackendPermission('venue.manage');
  };

  if (!currentVenue || !canManageVenue()) {
    return null;
  }

  return (
    <>
      <Card sx={{ 
        mb: 2,
        borderRadius: 0,
        boxShadow: theme.shadows[1],
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StoreIcon sx={{ fontSize: 20, color: 'text.primary' }} />
              <Box>
                <Typography variant="subtitle2" fontWeight="600">
                  {currentVenue.name || 'Current Venue'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {venueActive ? 'Venue Active' : 'Venue Inactive'}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Switch
                checked={venueOpen}
                onChange={handleToggleVenueOpen}
                disabled={statusLoading || !venueActive}
                color="success"
                size="medium"
              />
              <Chip
                icon={venueOpen ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
                label={venueOpen ? 'OPEN' : 'CLOSED'}
                size="small"
                color={venueOpen ? 'success' : 'error'}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  minWidth: 80
                }}
              />
            </Box>
          </Box>

          <Box sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 1
            }}>
              <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight="500">
                Order Status
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.875rem',
                fontStyle: venueOpen ? 'normal' : 'italic',
                mb: 2
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
                  mb: 2, 
                  fontSize: '0.75rem',
                  borderRadius: 0,
                  '& .MuiAlert-message': {
                    fontSize: '0.75rem'
                  }
                }}
              >
                Venue is inactive. Contact administrator to activate.
              </Alert>
            )}

            {statusLoading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress sx={{ borderRadius: 0 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Updating venue status...
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ 
            height: 4,
            backgroundColor: venueOpen ? 'success.main' : 'error.main',
            width: '100%'
          }} />
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%', borderRadius: 0 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VenueStatusControl;