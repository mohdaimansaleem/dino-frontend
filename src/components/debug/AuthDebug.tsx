import React from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentWorkspace, currentCafe, loading } = useWorkspace();

  return (
    <Card sx={{ mb: 2, border: '2px solid orange' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="warning.main">
          🐛 Debug Info
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Authentication:</Typography>
          <Chip 
            label={isAuthenticated ? 'Authenticated' : 'Not Authenticated'} 
            color={isAuthenticated ? 'success' : 'error'} 
            size="small" 
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">User Data:</Typography>
          <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', overflow: 'auto' }}>
            {user ? JSON.stringify({
              id: user.id,
              email: user.email,
              role: user.role,
              workspaceId: user.workspaceId,
              cafeId: user.cafeId,
              venue_id: user.venue_id
            }, null, 2) : 'No user data'}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Workspace Context:</Typography>
          <Typography variant="body2">Loading: {loading ? 'Yes' : 'No'}</Typography>
          <Typography variant="body2">
            Current Workspace: {currentWorkspace ? currentWorkspace.name : 'None'}
          </Typography>
          <Typography variant="body2">
            Current Cafe: {currentCafe ? currentCafe.name : 'None'}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">API Base URL:</Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
            {process.env.REACT_APP_API_BASE_URL || 'Not set'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AuthDebug;