/**
 * Password Hashing Test Component
 * Use this to verify that passwords are being hashed before transmission
 */
import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Divider,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Security,
  VpnKey,
  NetworkCheck,
  CheckCircle,
  Error,
  Info,
  ExpandMore,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { 
  hashPassword, 
  getFixedSalt,
  isPasswordHashingSupported,
  getClientHashInfo,
  loginWithHashedPassword
} from '../utils/passwordHashing';
import { authService } from '../services/authService';

interface TestResult {
  step: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

const PasswordHashingTest: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('TestPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [salt, setSalt] = useState('');
  const [hashedPassword, setHashedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hashInfo, setHashInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [networkRequests, setNetworkRequests] = useState<any[]>([]);

  const isSupported = isPasswordHashingSupported();

  const addTestResult = (step: string, status: 'success' | 'error' | 'pending', message: string, data?: any) => {
    setTestResults(prev => [...prev, { step, status, message, data }]);
  };

  const clearResults = () => {
    setTestResults([]);
    setNetworkRequests([]);
    setError('');
    setSalt('');
    setHashedPassword('');
  };

  const handleGetSalt = async () => {
    setLoading(true);
    setError('');
    addTestResult('Get Fixed Salt', 'pending', 'Getting fixed salt from environment...');
    
    try {
      const fixedSalt = getFixedSalt();
      setSalt(fixedSalt);
      addTestResult('Get Fixed Salt', 'success', `Fixed salt retrieved successfully (${fixedSalt.length} characters)`, {
        salt: fixedSalt.substring(0, 16) + '...',
        fullLength: fixedSalt.length,
        source: 'environment_variable'
      });
      console.log('🧂 Fixed salt retrieved:', fixedSalt);
    } catch (err: any) {
      setError(err.message);
      addTestResult('Get Fixed Salt', 'error', err.message);
      console.error('❌ Fixed salt retrieval failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHashPassword = async () => {
    if (!salt) {
      setError('Please get salt first');
      return;
    }

    setLoading(true);
    setError('');
    addTestResult('Hash Password', 'pending', 'Hashing password with SHA256...');
    
    try {
      const hashed = await hashPassword(password, salt);
      setHashedPassword(hashed);
      addTestResult('Hash Password', 'success', `Password hashed successfully (${hashed.length} characters)`, {
        originalLength: password.length,
        hashedLength: hashed.length,
        hash: hashed
      });
      console.log('🔒 Password hashed:', hashed);
    } catch (err: any) {
      setError(err.message);
      addTestResult('Hash Password', 'error', err.message);
      console.error('❌ Password hashing failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHashInfo = async () => {
    setLoading(true);
    setError('');
    addTestResult('Get Hash Info', 'pending', 'Retrieving hashing implementation details...');
    
    try {
      const info = await getClientHashInfo();
      setHashInfo(info);
      addTestResult('Get Hash Info', 'success', 'Hash implementation info retrieved', info);
      console.log('ℹ️ Hash info retrieved:', info);
    } catch (err: any) {
      setError(err.message);
      addTestResult('Get Hash Info', 'error', err.message);
      console.error('❌ Hash info retrieval failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);
    setError('');
    clearResults();
    addTestResult('Test Login', 'pending', 'Testing complete login flow with hashing...');
    
    try {
      console.log('🚀 Starting login test with authService...');
      
      // This will use the authService which should automatically hash the password
      const response = await authService.login(email, password);
      
      addTestResult('Test Login', 'success', 'Login completed successfully', {
        hasToken: !!response.access_token,
        tokenLength: response.access_token?.length,
        userEmail: response.user?.email
      });
      
      console.log('✅ Login test completed:', response);
      
    } catch (err: any) {
      setError(err.message);
      addTestResult('Test Login', 'error', err.message);
      console.error('❌ Login test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestFullFlow = async () => {
    setLoading(true);
    setError('');
    clearResults();
    
    try {
      console.log('🚀 Starting full password hashing test flow...');
      
      // Step 1: Check browser support
      addTestResult('Browser Support', isSupported ? 'success' : 'error', 
        isSupported ? 'Browser supports Web Crypto API' : 'Browser does not support Web Crypto API');
      
      if (!isSupported) {
        addTestResult('Full Flow', 'error', 'Cannot proceed - browser does not support password hashing');
        return;
      }
      
      // Step 2: Get fixed salt
      addTestResult('Get Fixed Salt', 'pending', 'Getting fixed salt from environment...');
      const fixedSalt = getFixedSalt();
      setSalt(fixedSalt);
      addTestResult('Get Fixed Salt', 'success', `Fixed salt retrieved (${fixedSalt.length} chars)`, {
        saltPreview: fixedSalt.substring(0, 16) + '...',
        source: 'environment_variable'
      });
      
      // Step 3: Hash password
      addTestResult('Hash Password', 'pending', 'Hashing password with SHA256 + fixed salt...');
      const hashed = await hashPassword(password, fixedSalt);
      setHashedPassword(hashed);
      addTestResult('Hash Password', 'success', `Password hashed (${hashed.length} chars)`, {
        hash: hashed
      });
      
      // Step 4: Verify hash format
      addTestResult('Verify Format', 'pending', 'Verifying hash format...');
      const isValidFormat = /^[a-f0-9]{64}$/i.test(hashed);
      addTestResult('Verify Format', isValidFormat ? 'success' : 'error', 
        isValidFormat ? 'Hash format is valid (64 hex characters)' : 'Hash format is invalid');
      
      // Step 5: Test hashed login
      addTestResult('Hashed Login', 'pending', 'Testing login with hashed password...');
      try {
        const loginResponse = await loginWithHashedPassword(email, password);
        addTestResult('Hashed Login', 'success', 'Hashed login successful', {
          hasToken: !!loginResponse.access_token
        });
      } catch (loginError: any) {
        addTestResult('Hashed Login', 'error', `Hashed login failed: ${loginError.message}`);
      }
      
      addTestResult('Full Flow', 'success', 'Full test flow completed successfully');
      console.log('🎉 Full test flow completed successfully!');
      
    } catch (err: any) {
      setError(err.message);
      addTestResult('Full Flow', 'error', `Full flow failed: ${err.message}`);
      console.error('❌ Full test flow failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'pending': return <Info color="info" />;
      default: return <Info />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '20px auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        🔒 Password Hashing Test Suite
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left Column - Controls */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧪 Test Controls
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  icon={isSupported ? <CheckCircle /> : <Error />}
                  label={isSupported ? "✅ Hashing Supported" : "❌ Hashing Not Supported"} 
                  color={isSupported ? "success" : "error"}
                  sx={{ mr: 1, mb: 1 }}
                />
                <Chip 
                  icon={<NetworkCheck />}
                  label={`Browser: ${navigator.userAgent.split(' ')[0]}`} 
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <VpnKey sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Security sx={{ mr: 1, color: 'action.active' }} />,
                  endAdornment: (
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  )
                }}
              />

              <Box sx={{ mb: 3 }}>
                <Button 
                  variant="contained" 
                  onClick={handleTestFullFlow}
                  disabled={loading || !isSupported}
                  fullWidth
                  sx={{ mb: 1 }}
                  size="large"
                >
                  🚀 Run Complete Test Suite
                </Button>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button 
                      variant="outlined" 
                      onClick={handleTestLogin}
                      disabled={loading}
                      fullWidth
                      size="small"
                    >
                      🔐 Test Login
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      variant="outlined" 
                      onClick={clearResults}
                      disabled={loading}
                      fullWidth
                      size="small"
                    >
                      🧹 Clear Results
                    </Button>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Button 
                      variant="outlined" 
                      onClick={handleGetSalt}
                      disabled={loading}
                      fullWidth
                      size="small"
                    >
                      🧂 Get Salt
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button 
                      variant="outlined" 
                      onClick={handleHashPassword}
                      disabled={loading || !salt}
                      fullWidth
                      size="small"
                    >
                      🔒 Hash
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button 
                      variant="outlined" 
                      onClick={handleGetHashInfo}
                      disabled={loading}
                      fullWidth
                      size="small"
                    >
                      ℹ️ Info
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Hash Results */}
          {(salt || hashedPassword) && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🔍 Hash Results
                </Typography>
                
                {salt && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>🧂 User Salt ({salt.length} chars)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            fontSize: '0.75rem'
                          }}
                        >
                          {salt}
                        </Typography>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                )}

                {hashedPassword && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>🔒 Hashed Password ({hashedPassword.length} chars)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper sx={{ p: 2, backgroundColor: '#e8f5e8' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            fontSize: '0.75rem'
                          }}
                        >
                          {hashedPassword}
                        </Typography>
                      </Paper>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        ✅ Valid SHA256 hash: {/^[a-f0-9]{64}$/i.test(hashedPassword) ? 'Yes' : 'No'}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Results */}
        <Grid item xs={12} md={6}>
          {/* Test Results */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Test Results
              </Typography>
              
              {testResults.length === 0 ? (
                <Alert severity="info">
                  No tests run yet. Click "Run Complete Test Suite" to start testing.
                </Alert>
              ) : (
                <List dense>
                  {testResults.map((result, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getStatusIcon(result.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {result.step}
                            </Typography>
                            <Chip 
                              label={result.status} 
                              size="small" 
                              color={getStatusColor(result.status) as any}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {result.message}
                            </Typography>
                            {result.data && (
                              <Paper sx={{ mt: 1, p: 1, backgroundColor: '#f9f9f9' }}>
                                <Typography variant="caption" component="pre" sx={{ fontSize: '0.7rem' }}>
                                  {JSON.stringify(result.data, null, 2)}
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Testing Instructions
              </Typography>
              
              <Typography variant="body2" component="div">
                <Box component="ol" sx={{ pl: 2 }}>
                  <li><strong>Open Browser DevTools</strong> (F12) and go to Network tab</li>
                  <li><strong>Click "Run Complete Test Suite"</strong> to test the full flow</li>
                  <li><strong>Check Console</strong> for detailed logging of each step</li>
                  <li><strong>Monitor Network tab</strong> to verify API calls contain hashed passwords</li>
                  <li><strong>Look for these requests:</strong>
                    <Box component="ul" sx={{ mt: 1 }}>
                      <li><code>/auth/login</code> - Should show 64-char hash as password</li>
                      <li><code>/auth/register</code> - Should show hashed passwords</li>
                      <li><strong>NO plain text passwords</strong> should appear anywhere</li>
                      <li><strong>NO /get-salt requests</strong> (using fixed salt from env)</li>
                    </Box>
                  </li>
                </Box>
              </Typography>

              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>✅ Success Indicators:</strong><br/>
                  • All test steps show green checkmarks<br/>
                  • Hash is exactly 64 hexadecimal characters<br/>
                  • Network requests show hashed passwords only<br/>
                  • Console shows detailed hashing process
                </Typography>
              </Alert>

              <Alert severity="warning" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  <strong>⚠️ Security Note:</strong> This test component is for development only. 
                  Remove it before production deployment.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hash Implementation Info */}
      {hashInfo && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔧 Implementation Details
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f0f8ff', overflow: 'auto' }}>
              <Typography component="pre" variant="body2" sx={{ fontSize: '0.8rem' }}>
                {JSON.stringify(hashInfo, null, 2)}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PasswordHashingTest;