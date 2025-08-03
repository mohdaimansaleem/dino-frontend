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

const CafeStatusControl: React.FC = () => {
  const { hasPermission, hasBackendPermission } = useAuth();
  const { userData } = useUserData();
  const currentCafe = userData?.venue;
  const [cafeActive, setCafeActive] = useState(true);
  const [cafeOpen, setCafeOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const loadCafeStatus = useCallback(async () => {
    if (!currentCafe?.id) return;
    
    try {
      const venue = await venueService.getVenue(currentCafe.id);
      if (venue) {
        setCafeActive(venue.is_active || false);
        setCafeOpen(venue.status === 'active' || currentCafe?.is_open || false);
      }
    } catch (error) {
      console.error('Error loading cafe status:', error);
    }
  }, [currentCafe?.id, currentCafe?.is_open]);

  useEffect(() => {
    loadCafeStatus();
  }, [loadCafeStatus]);

  const handleToggleCafeOpen = async () => {
    if (!currentCafe?.id || statusLoading) return;

    try {
      setStatusLoading(true);
      const newStatus = !cafeOpen;
      
      await venueService.updateVenue(currentCafe.id, { 
        status: newStatus ? 'active' : 'closed' 
      });

      setCafeOpen(newStatus);
      setSnackbar({ 
        open: true, 
        message: `Cafe ${newStatus ? 'opened' : 'closed'} for orders`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error toggling cafe open status:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to update cafe status', 
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

  // Don't show if no cafe or no permissions
  if (!currentCafe || !canManageVenue()) {
    return null;
  }

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 1.5 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 0.5 }}>
              {currentCafe.name || 'Current Cafe'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Status: {cafeActive ? (cafeOpen ? 'Open for Orders' : 'Closed for Orders') : 'Inactive'}
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={cafeOpen}
                  onChange={handleToggleCafeOpen}
                  disabled={statusLoading || !cafeActive}
                  color="success"
                  size="small"
                />
              }
              label={
                <Box>
                  <Typography variant="caption" fontWeight="500">
                    {cafeOpen ? 'Open' : 'Closed'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {cafeOpen ? 'Accepting orders' : 'Orders disabled'}
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

export default CafeStatusControl;