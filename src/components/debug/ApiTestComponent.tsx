import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore, Refresh, CheckCircle, Error } from '@mui/icons-material';
import { useUserData } from '../../contexts/UserDataContext';
import { userService } from '../../services/userService';
import { apiService } from '../../services/api';

const ApiTestComponent: React.FC = () => {
  const { userData } = useUserData();
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const testUsersApi = async () => {
    if (!userData?.venue?.id) {
      setError('No venue ID available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setApiResponse(null);
      setRawResponse(null);

      console.log('🧪 Testing Users API for venue:', userData.venue.id);

      // Test the API directly
      const response = await userService.getUsersByVenueId(userData.venue.id);
      
      setApiResponse(response);
      setRawResponse(response);

      console.log('🧪 API Test Response:', response);

    } catch (err: any) {
      console.error('🧪 API Test Error:', err);
      setError(err.message || 'API test failed');
    } finally {
      setLoading(false);
    }
  };

  const testApiDirectly = async () => {
    if (!userData?.venue?.id) {
      setError('No venue ID available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🧪 Testing API directly for venue:', userData.venue.id);

      // Test the API service directly
      const response = await apiService.get(`/venues/${userData.venue.id}/users`);
      
      setRawResponse(response);
      console.log('🧪 Direct API Response:', response);

    } catch (err: any) {
      console.error('🧪 Direct API Error:', err);
      setError(err.message || 'Direct API test failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.venue?.id) {
      testUsersApi();
    }
  }, [userData?.venue?.id]);

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🧪 Users API Integration Test
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Testing: <code>/api/v1/venues/{userData?.venue?.id || 'VENUE_ID'}/users</code>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              onClick={testUsersApi}
              disabled={loading || !userData?.venue?.id}
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
            >
              Test via UserService
            </Button>
            
            <Button
              variant="outlined"
              onClick={testApiDirectly}
              disabled={loading || !userData?.venue?.id}
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
            >
              Test Direct API
            </Button>
          </Box>

          {/* Status */}
          {apiResponse && (
            <Alert 
              severity={apiResponse.success ? "success" : "error"} 
              sx={{ mb: 2 }}
              icon={apiResponse.success ? <CheckCircle /> : <Error />}
            >
              <Typography variant="body2">
                <strong>API Status:</strong> {apiResponse.success ? 'Success' : 'Failed'}
              </Typography>
              {apiResponse.data && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Returned {Array.isArray(apiResponse.data) ? apiResponse.data.length : 'non-array'} users
                </Typography>
              )}
              {apiResponse.error && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'error.main' }}>
                  Error: {apiResponse.error}
                </Typography>
              )}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Error:</strong> {error}
              </Typography>
            </Alert>
          )}

          {/* Venue Info */}
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Current Venue Info</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(userData?.venue, null, 2)}
              </pre>
            </AccordionDetails>
          </Accordion>

          {/* API Response */}
          {rawResponse && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Raw API Response</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Sample Expected Response */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Expected API Response Format</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
{`{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "email": "user@example.com",
      "phone": "+1234567890",
      "user_name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "role_display_name": "Administrator",
      "last_logged_in": "2024-01-15T10:30:00Z",
      "status": "active",
      "is_active": true,
      "venue_id": "venue-id",
      "workspace_id": "workspace-id",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}`}
              </pre>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApiTestComponent;