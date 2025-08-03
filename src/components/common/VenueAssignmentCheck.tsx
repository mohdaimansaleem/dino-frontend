import React from 'react';
import {
  Box,
  Alert,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Store as StoreIcon,
  ContactSupport as ContactIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useVenueCheck } from '../../hooks/useVenueCheck';

interface VenueAssignmentCheckProps {
  children: React.ReactNode;
  showFullPage?: boolean;
  customMessage?: string;
}

const VenueAssignmentCheck: React.FC<VenueAssignmentCheckProps> = ({
  children,
  showFullPage = false,
  customMessage
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const { requiresVenueAssignment, canBypassVenueCheck } = useVenueCheck();
  
  // If user can bypass venue check or has venue assigned, show children
  if (!requiresVenueAssignment) {
    return <>{children}</>;
  }

  const defaultMessage = customMessage || 
    "You don't have a venue assigned to your account. Please contact your administrator to assign you to a venue.";

  if (showFullPage) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          p: 3,
        }}
      >
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <StoreIcon 
              sx={{ 
                fontSize: 80, 
                color: 'warning.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h4" gutterBottom color="warning.main">
              No Venue Assigned
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {defaultMessage}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<ContactIcon />}
                onClick={() => window.location.href = '/admin/profile'}
              >
                View Profile
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.href = '/admin/settings'}
              >
                Account Settings
              </Button>
              {canBypassVenueCheck && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.location.href = '/superadmin'}
                >
                  Super Admin Dashboard
                </Button>
              )}
            </Box>
            
            <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                What you can do:
              </Typography>
              <Typography variant="body2" component="div">
                • Contact your system administrator<br/>
                • Check your account settings<br/>
                • Verify your role permissions<br/>
                • Request venue assignment
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Alert 
      severity="warning" 
      icon={<WarningIcon />}
      sx={{ mb: 3 }}
    >
      <Typography variant="h6" gutterBottom>
        No Venue Assigned
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {defaultMessage}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        <Button 
          size="small"
          variant="contained" 
          onClick={() => window.location.href = '/admin/profile'}
        >
          View Profile
        </Button>
        <Button 
          size="small"
          variant="outlined" 
          onClick={() => window.location.href = '/admin/settings'}
        >
          Settings
        </Button>
        {canBypassVenueCheck && (
          <Button 
            size="small"
            variant="outlined" 
            color="primary"
            onClick={() => window.location.href = '/superadmin'}
          >
            Super Admin
          </Button>
        )}
      </Box>
    </Alert>
  );
};

export default VenueAssignmentCheck;