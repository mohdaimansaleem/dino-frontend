import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { API_CONFIG } from '../../config/api';
import { apiService } from '../../services/api';

interface ApiCall {
  id: string;
  method: string;
  url: string;
  fullUrl: string;
  status?: number;
  timestamp: Date;
  duration?: number;
  error?: string;
}

const ApiDebugger: React.FC = () => {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Override fetch to monitor API calls
  useEffect(() => {
    if (!isMonitoring) return;

    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options] = args;
      const method = options?.method || 'GET';
      const startTime = Date.now();
      
      const callId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullUrl = typeof url === 'string' ? url : url.toString();
      
      // Add to monitoring
      const newCall: ApiCall = {
        id: callId,
        method,
        url: fullUrl,
        fullUrl,
        timestamp: new Date(),
      };
      
      setApiCalls(prev => [newCall, ...prev.slice(0, 49)]); // Keep last 50 calls
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        // Update call with response info
        setApiCalls(prev => prev.map(call => 
          call.id === callId 
            ? { ...call, status: response.status, duration }
            : call
        ));
        
        return response;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        // Update call with error info
        setApiCalls(prev => prev.map(call => 
          call.id === callId 
            ? { ...call, error: error.message, duration }
            : call
        ));
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isMonitoring]);

  const testApiCall = async () => {
    try {
      console.log('🔍 Testing API call with current configuration...');
      console.log('API Base URL:', API_CONFIG.BASE_URL);
      
      // Test a simple API call
      const response = await apiService.get('/health');
      console.log('✅ API call successful:', response);
    } catch (error: any) {
      console.error('❌ API call failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
    }
  };

  const clearCalls = () => {
    setApiCalls([]);
  };

  const getStatusColor = (status?: number, error?: string) => {
    if (error) return 'error';
    if (!status) return 'default';
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400) return 'error';
    return 'warning';
  };

  const isBackendCall = (url: string) => {
    return url.includes('dino-backend') || url.includes('/api/v1');
  };

  const isFrontendCall = (url: string) => {
    return url.includes(window.location.origin) && !url.includes('/api/v1');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔍 API Debugger
      </Typography>
      
      {/* Configuration Info */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Configuration
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>API Base URL:</strong></TableCell>
              <TableCell>{API_CONFIG.BASE_URL}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>WebSocket URL:</strong></TableCell>
              <TableCell>{API_CONFIG.WS_URL}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Frontend URL:</strong></TableCell>
              <TableCell>{window.location.origin}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Environment:</strong></TableCell>
              <TableCell>{process.env.NODE_ENV}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant={isMonitoring ? "contained" : "outlined"}
          color={isMonitoring ? "secondary" : "primary"}
          onClick={() => setIsMonitoring(!isMonitoring)}
        >
          {isMonitoring ? '⏹️ Stop Monitoring' : '▶️ Start Monitoring'}
        </Button>
        
        <Button variant="outlined" onClick={testApiCall}>
          🧪 Test API Call
        </Button>
        
        <Button variant="outlined" onClick={clearCalls}>
          🗑️ Clear Calls
        </Button>
      </Box>

      {/* Status Alert */}
      {apiCalls.length > 0 && (
        <Alert 
          severity={apiCalls.some(call => isFrontendCall(call.url)) ? "error" : "success"}
          sx={{ mb: 3 }}
        >
          {apiCalls.some(call => isFrontendCall(call.url)) 
            ? "⚠️ Found API calls going to frontend URL! This is the issue."
            : "✅ All API calls are going to the correct backend URL."
          }
        </Alert>
      )}

      {/* API Calls List */}
      <Typography variant="h6" gutterBottom>
        API Calls ({apiCalls.length})
      </Typography>
      
      {apiCalls.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {isMonitoring 
              ? "Monitoring API calls... Make some requests to see them here."
              : "Click 'Start Monitoring' to track API calls."
            }
          </Typography>
        </Paper>
      ) : (
        <Box>
          {apiCalls.map((call, index) => (
            <Accordion key={call.id} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Chip 
                    label={call.method} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={call.status || 'PENDING'} 
                    size="small" 
                    color={getStatusColor(call.status, call.error)}
                  />
                  {isFrontendCall(call.url) && (
                    <Chip 
                      label="⚠️ FRONTEND URL" 
                      size="small" 
                      color="error"
                    />
                  )}
                  {isBackendCall(call.url) && (
                    <Chip 
                      label="✅ BACKEND URL" 
                      size="small" 
                      color="success"
                    />
                  )}
                  <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {call.url}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {call.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Method:</strong></TableCell>
                      <TableCell>{call.method}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>URL:</strong></TableCell>
                      <TableCell sx={{ wordBreak: 'break-all' }}>{call.url}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Status:</strong></TableCell>
                      <TableCell>{call.status || 'Pending'}</TableCell>
                    </TableRow>
                    {call.duration && (
                      <TableRow>
                        <TableCell><strong>Duration:</strong></TableCell>
                        <TableCell>{call.duration}ms</TableCell>
                      </TableRow>
                    )}
                    {call.error && (
                      <TableRow>
                        <TableCell><strong>Error:</strong></TableCell>
                        <TableCell sx={{ color: 'error.main' }}>{call.error}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell><strong>Timestamp:</strong></TableCell>
                      <TableCell>{call.timestamp.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ApiDebugger;