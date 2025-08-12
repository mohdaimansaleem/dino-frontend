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
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';
import { PERMISSIONS } from '../types/auth';
import { venueService } from '../services/venueService';

const VenueStatusControl: React.FC = () => {
  const { hasPermission, hasBackendPermission } = useAuth();
  const { userData } = useUserData();
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
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 1.5 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.5 }}>
              {currentVenue.name || 'Current Venue'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Status: {venueActive ? (venueOpen ? 'Open for Orders' : 'Closed for Orders') : 'Inactive'}
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={venueOpen}
                  onChange={handleToggleVenueOpen}
                  disabled={statusLoading || !venueActive}
                  color="success"
                  size="small"
                />
              }
              label={
                <Box>
                  <Typography variant="caption" fontWeight="500">
                    {venueOpen ? 'Open' : 'Closed'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {venueOpen ? 'Accepting orders' : 'Orders disabled'}
                  </Typography>
                </Box>
              }
              sx={{ m: 0 }}
            />

            {statusLoading && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress />
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