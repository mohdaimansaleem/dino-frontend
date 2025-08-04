import React from 'react';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { getUserVenueId, getUserWorkspaceId } from '../../utils/userUtils';

const VenueDebug: React.FC = () => {
  const { user } = useAuth();
  const { currentCafe, currentWorkspace, loading, initializeVenueFromUser, refreshCafes } = useWorkspace();

  const handleRetryVenue = async () => {
    try {
      await initializeVenueFromUser();
    } catch (error) {
      }
  };

  const handleRefreshCafes = async () => {
    try {
      await refreshCafes();
    } catch (error) {
      }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 2, 
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd'
      }}
    >
      <Typography variant="h6" gutterBottom color="primary">
        🏢 Venue Debug Info
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip 
          label={`Loading: ${loading}`} 
          color={loading ? 'warning' : 'success'} 
          size="small" 
        />
        <Chip 
          label={`Current Cafe: ${currentCafe ? '✅' : '❌'}`} 
          color={currentCafe ? 'success' : 'error'} 
          size="small" 
        />
        <Chip 
          label={`Current Workspace: ${currentWorkspace ? '✅' : '❌'}`} 
          color={currentWorkspace ? 'success' : 'error'} 
          size="small" 
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">User Data:</Typography>
          <Typography variant="body2">ID: {user?.id || 'N/A'}</Typography>
          <Typography variant="body2">Email: {user?.email || 'N/A'}</Typography>
          <Typography variant="body2">Venue ID: {getUserVenueId(user) || 'N/A'}</Typography>
          <Typography variant="body2">Venue ID (raw): {user?.venue_id || 'N/A'}</Typography>
          <Typography variant="body2">Workspace ID: {getUserWorkspaceId(user) || 'N/A'}</Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">Current Cafe:</Typography>
          <Typography variant="body2">ID: {currentCafe?.id || 'N/A'}</Typography>
          <Typography variant="body2">Name: {currentCafe?.name || 'N/A'}</Typography>
          <Typography variant="body2">Active: {currentCafe?.isActive ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">Workspace: {currentCafe?.workspaceId || 'N/A'}</Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold">Current Workspace:</Typography>
        <Typography variant="body2">ID: {currentWorkspace?.id || 'N/A'}</Typography>
        <Typography variant="body2">Name: {currentWorkspace?.name || 'N/A'}</Typography>
        <Typography variant="body2">Active: {currentWorkspace?.isActive ? 'Yes' : 'No'}</Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold">Venue Resolution:</Typography>
        <Typography variant="body2">
          Resolved Venue ID: {currentCafe?.id || getUserVenueId(user) || 'NONE'}
        </Typography>
        <Typography variant="body2" color={currentCafe?.id || getUserVenueId(user) ? 'success.main' : 'error.main'}>
          Status: {currentCafe?.id || getUserVenueId(user) ? '✅ Available' : '❌ Missing'}
        </Typography>
      </Box>

      {(!currentCafe && getUserVenueId(user)) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleRetryVenue}
            disabled={loading}
          >
            Retry Venue Load
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleRefreshCafes}
            disabled={loading}
          >
            Refresh Cafes
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default VenueDebug;