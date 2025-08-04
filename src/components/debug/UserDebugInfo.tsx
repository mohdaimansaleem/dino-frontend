import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Collapse,
  Alert,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Person,
  Business,
  Security,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useVenueCheck } from '../../hooks/useVenueCheck';
import { getUserFirstName, getUserLastName, getUserWorkspaceId } from '../../utils/userUtils';

const UserDebugInfo: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const { user, isSuperAdmin, isAdmin, isOperator } = useAuth();
  const { hasVenueAssigned, venueId, requiresVenueAssignment, canBypassVenueCheck } = useVenueCheck();

  // Only show in development or for super admins
  const shouldShow = process.env.NODE_ENV === 'development' || isSuperAdmin();
  
  if (!shouldShow) {
    return null;
  }

  return (
    <Card sx={{ mb: 2, border: '1px dashed #ccc' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" color="text.secondary">
            🐛 Debug Info
          </Typography>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          >
            {expanded ? 'Hide' : 'Show'}
          </Button>
        </Box>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* User Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" />
                User Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={`ID: ${user?.id || 'N/A'}`} size="small" />
                <Chip label={`Email: ${user?.email || 'N/A'}`} size="small" />
                <Chip label={`Name: ${getUserFirstName(user)} ${getUserLastName(user)}`} size="small" />
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Role Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security fontSize="small" />
                Role Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip 
                  label={`Role: ${user?.role || 'N/A'}`} 
                  size="small" 
                  color={isSuperAdmin() ? 'error' : isAdmin() ? 'warning' : 'default'}
                />
                <Chip label={`Super Admin: ${isSuperAdmin() ? 'Yes' : 'No'}`} size="small" />
                <Chip label={`Admin: ${isAdmin() ? 'Yes' : 'No'}`} size="small" />
                <Chip label={`Operator: ${isOperator() ? 'Yes' : 'No'}`} size="small" />
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Venue Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business fontSize="small" />
                Venue Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip 
                  label={`Venue ID: ${venueId || 'None'}`} 
                  size="small" 
                  color={hasVenueAssigned ? 'success' : 'error'}
                />
                <Chip 
                  label={`Workspace ID: ${getUserWorkspaceId(user) || 'None'}`} 
                  size="small" 
                />
                <Chip 
                  label={`Has Venue: ${hasVenueAssigned ? 'Yes' : 'No'}`} 
                  size="small" 
                  color={hasVenueAssigned ? 'success' : 'error'}
                />
                <Chip 
                  label={`Can Bypass: ${canBypassVenueCheck ? 'Yes' : 'No'}`} 
                  size="small" 
                  color={canBypassVenueCheck ? 'success' : 'default'}
                />
              </Box>
            </Box>

            {/* Status Alerts */}
            {requiresVenueAssignment && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ⚠️ This user requires venue assignment to access venue-specific features.
                </Typography>
              </Alert>
            )}

            {canBypassVenueCheck && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ℹ️ This user can bypass venue checks (Super Admin privileges).
                </Typography>
              </Alert>
            )}

            {/* Raw Data */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Raw User Data:
              </Typography>
              <Box 
                component="pre" 
                sx={{ 
                  fontSize: '0.7rem', 
                  backgroundColor: '#f5f5f5', 
                  p: 1, 
                  borderRadius: 1, 
                  overflow: 'auto',
                  maxHeight: 200
                }}
              >
                {JSON.stringify(user, null, 2)}
              </Box>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default UserDebugInfo;