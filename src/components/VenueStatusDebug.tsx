import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useUserData } from '../contexts/UserDataContext';
import { venueService } from '../services/business';
import StorageManager from '../utils/storage';

const VenueStatusDebug: React.FC = () => {
  const { userData, refreshUserData } = useUserData();
  const venue = userData?.venue;

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    StorageManager.clearVenueData();
    await refreshUserData();
  };

  const handleToggleStatus = async () => {
    if (!venue?.id) return;
    
    try {
      console.log('🔄 Debug: Toggling venue status manually');
      const newStatus = !venue.is_open;
      
      console.log('🔄 Debug: Before update - venue status:', {
        venueId: venue.id,
        currentIsOpen: venue.is_open,
        newStatus: newStatus,
        updatePayload: { is_open: newStatus }
      });
      
      const updateResponse = newStatus 
        ? await venueService.openVenue(venue.id)
        : await venueService.closeVenue(venue.id);
      
      console.log('✅ Debug: Update response received:', updateResponse);
      
      // Wait a moment then fetch the venue directly to verify
      console.log('🔍 Debug: Fetching venue directly to verify persistence...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const freshVenue = await venueService.getVenue(venue.id);
      console.log('🔍 Debug: Fresh venue data:', {
        venueId: freshVenue?.id,
        is_open: freshVenue?.is_open,
        is_active: freshVenue?.is_active,
        status: (freshVenue as any)?.status,
        expectedIsOpen: newStatus,
        statusMatches: freshVenue?.is_open === newStatus
      });
      
      console.log('🔄 Debug: Clearing cache and refreshing user data...');
      StorageManager.clearVenueData();
      await refreshUserData();
      
      console.log('✅ Debug: Refresh complete');
    } catch (error) {
      console.error('❌ Debug: Error updating venue status:', error);
    }
  };

  if (!venue) {
    return (
      <Alert severity="warning">
        No venue data available for debugging
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 2, border: '2px solid orange' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoIcon sx={{ mr: 1, color: 'orange' }} />
          <Typography variant="h6" color="orange">
            Venue Status Debug Panel
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Venue Information
            </Typography>
            <Typography variant="body2">ID: {venue.id}</Typography>
            <Typography variant="body2">Name: {venue.name}</Typography>
            <Typography variant="body2">
              Raw is_active: {JSON.stringify(venue.is_active)}
            </Typography>
            <Typography variant="body2">
              Raw is_open: {JSON.stringify(venue.is_open)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'orange', fontWeight: 'bold' }}>
              Backend status: {JSON.stringify((venue as any).status)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'blue', fontWeight: 'bold' }}>
              Fields synchronized: {JSON.stringify(
                venue.is_open === ((venue as any).status === 'active')
              )}
            </Typography>
            <Typography variant="body2">
              Legacy isActive: {JSON.stringify((venue as any).isActive)}
            </Typography>
            <Typography variant="body2">
              Legacy isOpen: {JSON.stringify((venue as any).isOpen)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Current Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={venue.is_active ? 'ACTIVE' : 'INACTIVE'}
                color={venue.is_active ? 'success' : 'error'}
                size="small"
              />
              <Chip
                label={venue.is_open ? 'OPEN' : 'CLOSED'}
                color={venue.is_open ? 'success' : 'error'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                >
                  Refresh Data
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleToggleStatus}
                  color={venue.is_open ? 'error' : 'success'}
                >
                  {venue.is_open ? 'Close' : 'Open'} Venue
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    try {
                      console.log('🧪 Testing with status field...');
                      await venueService.updateVenue(venue.id, { 
                        status: venue.is_open ? 'closed' : 'active' 
                      });
                      await handleRefresh();
                    } catch (error) {
                      console.error('❌ Status field test failed:', error);
                    }
                  }}
                >
                  Test Status Field
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    try {
                      console.log('🧪 Testing with isOpen field...');
                      await venueService.updateVenue(venue.id, { 
                        isOpen: !venue.is_open 
                      } as any);
                      await handleRefresh();
                    } catch (error) {
                      console.error('❌ isOpen field test failed:', error);
                    }
                  }}
                >
                  Test isOpen Field
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    try {
                      console.log('🔍 Running persistence test...');
                      const originalStatus = venue.is_open;
                      
                      // Step 1: Toggle status
                      console.log('Step 1: Toggling status from', originalStatus, 'to', !originalStatus);
                      const updateResponse = !originalStatus 
                        ? await venueService.openVenue(venue.id)
                        : await venueService.closeVenue(venue.id);
                      console.log('Update response:', updateResponse);
                      
                      // Step 2: Wait and check immediately
                      await new Promise(resolve => setTimeout(resolve, 500));
                      const immediateCheck = await venueService.getVenue(venue.id);
                      console.log('Step 2: Immediate check:', {
                        expected: !originalStatus,
                        actual: immediateCheck?.is_open,
                        status: (immediateCheck as any)?.status,
                        matches: immediateCheck?.is_open === !originalStatus
                      });
                      
                      // Step 3: Wait longer and check again
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      const delayedCheck = await venueService.getVenue(venue.id);
                      console.log('Step 3: Delayed check (2s):', {
                        expected: !originalStatus,
                        actual: delayedCheck?.is_open,
                        status: (delayedCheck as any)?.status,
                        matches: delayedCheck?.is_open === !originalStatus
                      });
                      
                      // Step 4: Refresh user data and check
                      await refreshUserData();
                      const contextCheck = userData?.venue?.is_open;
                      console.log('Step 4: Context check after refresh:', {
                        expected: !originalStatus,
                        actual: contextCheck,
                        matches: contextCheck === !originalStatus
                      });
                      
                      console.log('🔍 Persistence test complete');
                    } catch (error) {
                      console.error('❌ Persistence test failed:', error);
                    }
                  }}
                >
                  Test Persistence
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  onClick={async () => {
                    try {
                      console.log('🧪 Running comprehensive backend test...');
                      
                      // Test 1: Try different field combinations
                      console.log('Test 1: Trying different field combinations');
                      const testPayloads = [
                        { is_open: !venue.is_open },
                        { status: venue.is_open ? 'closed' : 'open' },
                        { is_open: !venue.is_open, status: venue.is_open ? 'closed' : 'open' }
                      ];
                      
                      for (let i = 0; i < testPayloads.length; i++) {
                        try {
                          console.log(`Payload ${i + 1}:`, testPayloads[i]);
                          const response = await venueService.updateVenue(venue.id, testPayloads[i]);
                          console.log(`Response ${i + 1}:`, response);
                          
                          // Check result
                          const check = await venueService.getVenue(venue.id);
                          console.log(`Result ${i + 1}:`, {
                            is_open: check?.is_open,
                            status: check?.status
                          });
                          
                          // Wait between tests
                          await new Promise(resolve => setTimeout(resolve, 1000));
                        } catch (error) {
                          console.error(`Payload ${i + 1} failed:`, error);
                        }
                      }
                      
                      console.log('🧪 Backend test complete');
                      await handleRefresh();
                    } catch (error) {
                      console.error('❌ Backend test failed:', error);
                    }
                  }}
                >
                  Backend Test
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          This debug panel shows raw venue data and allows manual testing of status updates.
          Check the browser console for detailed logs.
        </Alert>
      </CardContent>
    </Card>
  );
};

export default VenueStatusDebug;