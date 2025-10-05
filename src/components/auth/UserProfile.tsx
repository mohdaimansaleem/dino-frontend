import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Security,
  Edit,
  Cancel,
  Save
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useDinoAvatar } from '../../contexts/DinoAvatarContext';
import { authService } from '../../services/auth';
import UserPermissions from './UserPermissions';
import { getUserFirstName, getUserLastName, getUserProfileImageUrl, getUserCreatedAt } from '../../utils/userUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { dinoAvatar, dinoName, generateNewAvatar, isLoading: avatarLoading } = useDinoAvatar();
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile data
  const [profileData, setProfileData] = useState<Partial<any>>({});
  
  // Dialog states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  // Form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle avatar generation with success message
  const handleGenerateNewAvatar = () => {
    generateNewAvatar();
    setSuccess(`🦕 New ${dinoName} avatar generated!`);
  };

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);



  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate phone number
      if (profileData.phone && profileData.phone.length !== 10) {
        setError('Phone number must be exactly 10 digits');
        setLoading(false);
        return;
      }
      
      // Validate phone number contains only digits
      if (profileData.phone && !/^\d{10}$/.test(profileData.phone)) {
        setError('Phone number must contain only digits');
        setLoading(false);
        return;
      }
      
      await updateUser(profileData);
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);
      setError(null);
      
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccess('Password changed successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Box sx={{ 
      minHeight: '100vh',
      pt: { xs: '80px', sm: '88px', md: '96px' }, // Add top padding to avoid navbar
      pb: { xs: 4, sm: 6, md: 8 },
      backgroundColor: 'background.default',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dino Hello Background Image */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 0, sm: 0, md: 0 },
          right: { xs: 0, sm: 0, md: 0 },
          width: { xs: 300, sm: 400, md: 500 },
          height: { xs: 300, sm: 400, md: 500 },
          backgroundImage: 'url(/img/dino_hello.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right',
          opacity: 1,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            opacity: 0.6,
            transform: 'scale(1.02)',
          }
        }}
      />
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          ml: { xs: 0, sm: 0, md: 0 },
          mr: { xs: 0, sm: 6, md: 12 },
          maxWidth: { xs: 'md', sm: 'md', md: 'lg' },
          pl: { xs: 2, sm: 3, md: 4 },
          pr: { xs: 2, sm: 2, md: 2 }
        }}
      >
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={dinoAvatar}
                sx={{ 
                  width: 100, 
                  height: 100,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  boxShadow: 3,
                  backgroundColor: '#4CAF50',
                  fontSize: '2rem'
                }}
                onLoad={() => {
                  console.log('🦕 Avatar loaded successfully');
                }}
                onError={() => {
                  console.log('🦕 Avatar failed to load:', dinoAvatar);
                  // Don't clear avatar, just show fallback
                }}
              >
                {avatarLoading ? '⏳' : '🦕'}
              </Avatar>
              <Chip
                label="🦕 Dino"
                size="small"
                color="primary"
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  fontSize: '0.7rem'
                }}
              />
              <IconButton
                onClick={handleGenerateNewAvatar}
                disabled={avatarLoading}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white'
                  }
                }}
                size="small"
                title="Generate new avatar"
              >
                🎲
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {getUserFirstName(user)} {getUserLastName(user)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {getUserCreatedAt(user)?.toLocaleDateString() || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Security />} label="Permissions" />
        </Tabs>

        {/* Personal Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Personal Information</Typography>
            <Button
              variant={editing ? "outlined" : "contained"}
              startIcon={editing ? <Cancel /> : <Edit />}
              onClick={() => {
                if (editing) {
                  setProfileData(user || {});
                }
                setEditing(!editing);
              }}
            >
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.first_name || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.last_name || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                disabled={!editing}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email || ''}
                disabled={true}
                type="email"
                helperText="Email cannot be changed"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow digits and limit to 10 characters
                  const digitsOnly = value.replace(/\D/g, '');
                  if (digitsOnly.length <= 10) {
                    setProfileData(prev => ({ ...prev, phone: digitsOnly }));
                  }
                }}
                disabled={!editing}
                inputProps={{
                  maxLength: 10,
                  pattern: '[0-9]*',
                  inputMode: 'numeric'
                }}
                helperText={editing ? "Enter 10-digit phone number (digits only)" : ""}
                error={editing && profileData.phone && profileData.phone.length !== 10}
              />
            </Grid>
          </Grid>

          {editing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleProfileUpdate}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Security Settings
          </Typography>

          <List>
            <ListItem 
              sx={{ 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 0 },
                py: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Security />
                </ListItemIcon>
                <ListItemText
                  primary="Password"
                  secondary="Change your account password"
                  sx={{ 
                    pr: { xs: 0, sm: 2 },
                    '& .MuiListItemText-primary': {
                      fontSize: { xs: '1rem', sm: '1rem' }
                    },
                    '& .MuiListItemText-secondary': {
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="outlined"
                  onClick={() => setPasswordDialogOpen(true)}
                  size="small"
                  sx={{ 
                    minWidth: { xs: '100%', sm: 'auto' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </ListItem>
            
            <Divider />
            
            <ListItem 
              sx={{ 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 0 },
                py: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Person />
                </ListItemIcon>
                <ListItemText
                  primary="Account Status"
                  secondary={user?.isVerified ? "Verified account" : "Unverified account"}
                  sx={{ 
                    pr: { xs: 0, sm: 2 },
                    '& .MuiListItemText-primary': {
                      fontSize: { xs: '1rem', sm: '1rem' }
                    },
                    '& .MuiListItemText-secondary': {
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }
                  }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <Chip
                  label={user?.isVerified ? "Verified" : "Unverified"}
                  color={user?.isVerified ? "success" : "warning"}
                  size="small"
                  sx={{ 
                    minWidth: { xs: '100px', sm: 'auto' }
                  }}
                />
              </Box>
            </ListItem>
          </List>
        </TabPanel>

        {/* Permissions Tab */}
        <TabPanel value={tabValue} index={2}>
          <UserPermissions />
        </TabPanel>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                helperText="Password must be at least 8 characters with uppercase, lowercase, and number"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                error={passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword}
                helperText={passwordData.confirmPassword !== '' && passwordData.newPassword !== passwordData.confirmPassword ? 'Passwords do not match' : ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handlePasswordChange} 
            variant="contained"
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default UserProfile;