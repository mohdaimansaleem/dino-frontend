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
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import UserPermissions from './UserPermissions';
import { getUserFirstName, getUserLastName, getUserProfileImageUrl, getUserCreatedAt } from '../utils/userUtils';

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
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile data
  const [profileData, setProfileData] = useState<Partial<any>>({});
  
  // Random dinosaur avatar
  const [dinoAvatar, setDinoAvatar] = useState<string>('');
  const [avatarLoading, setAvatarLoading] = useState<boolean>(true);
  
  // Dialog states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  // Form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Generate random dinosaur avatar
  const generateDinosaurAvatar = () => {
    const dinosaurNames = [
      'trex', 'stegosaurus', 'triceratops', 'velociraptor', 'brontosaurus', 
      'allosaurus', 'ankylosaurus', 'parasaurolophus', 'spinosaurus', 'diplodocus',
      'carnotaurus', 'compsognathus', 'deinonychus', 'gallimimus', 'iguanodon',
      'kentrosaurus', 'lambeosaurus', 'maiasaura', 'nodosaurus', 'ouranosaurus',
      'pachycephalosaurus', 'quetzalcoatlus', 'raptorex', 'styracosaurus', 'therizinosaurus',
      'utahraptor', 'vulcanodon', 'wannanosaurus', 'xenotarsosaurus', 'yangchuanosaurus',
      'zuniceratops', 'albertosaurus', 'baryonyx', 'ceratosaurus', 'dracorex',
      'edmontosaurus', 'fukuiraptor', 'giganotosaurus', 'herrerasaurus', 'irritator'
    ];
    
    // Use a more reliable dinosaur-specific avatar style
    const randomDino = dinosaurNames[Math.floor(Math.random() * dinosaurNames.length)];
    const randomSeed = Math.random().toString(36).substring(2, 8);
    const timestamp = Date.now();
    
    // Try multiple avatar styles to ensure one works
    const avatarStyles = [
      `https://api.dicebear.com/7.x/bottts/svg?seed=${randomDino}${randomSeed}${timestamp}&backgroundColor=65c3c8&radius=50`,
      `https://api.dicebear.com/7.x/identicon/svg?seed=${randomDino}${randomSeed}${timestamp}&backgroundColor=4CAF50&radius=50`,
      `https://api.dicebear.com/7.x/shapes/svg?seed=${randomDino}${randomSeed}${timestamp}&backgroundColor=2196F3&radius=50`,
      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${randomDino}${randomSeed}${timestamp}&backgroundColor=FF9800&radius=50`
    ];
    
    const dinoAvatarUrl = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    
    console.log('🦕 Generated Dino Avatar:', randomDino, dinoAvatarUrl);
    setAvatarLoading(true);
    setDinoAvatar(dinoAvatarUrl);
    
    // Store in localStorage so navbar can access it
    localStorage.setItem('dinoAvatar', dinoAvatarUrl);
    localStorage.setItem('dinoName', randomDino);
    
    // Dispatch custom event to notify navbar
    window.dispatchEvent(new Event('dinoAvatarUpdated'));
    
    // Also set success message to confirm generation
    setSuccess(`🦕 New ${randomDino} avatar generated!`);
    
    // Set loading to false after a short delay to allow image to load
    setTimeout(() => setAvatarLoading(false), 1000);
  };

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  useEffect(() => {
    // Check if there's already an avatar in localStorage
    const savedAvatar = localStorage.getItem('dinoAvatar');
    if (savedAvatar) {
      console.log('🦕 Found saved avatar, using it:', savedAvatar);
      setDinoAvatar(savedAvatar);
    } else {
      console.log('🦕 No saved avatar, generating new one...');
      generateDinosaurAvatar();
    }
  }, []);

  // Generate new avatar on every page refresh (not just component mount)
  useEffect(() => {
    console.log('🦕 UserProfile mounted, generating fresh dinosaur avatar...');
    generateDinosaurAvatar();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      backgroundColor: 'background.default'
    }}>
      <Container maxWidth="md">
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
                  setAvatarLoading(false);
                }}
                onError={() => {
                  console.log('🦕 Avatar failed to load:', dinoAvatar);
                  setAvatarLoading(false);
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
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!editing}
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