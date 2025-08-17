import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography 
} from '@mui/material';
import { 
  Business, 
  Store, 
  Person, 
  CheckCircle, 
  Place, 
  Phone, 
  Email, 
  Category, 
  AttachMoney, 
  AccountCircle, 
  Security, 
  Verified 
} from '@mui/icons-material';
import { RegistrationFormData, priceRangeOptions } from './types';
import DinoLogo from '../DinoLogo';

interface ReviewStepProps {
  formData: RegistrationFormData;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #fafbfc 0%, #f4f6f8 100%)',
      borderRadius: 2,
      p: 3,
      position: 'relative',
      border: '1px solid rgba(0, 0, 0, 0.06)'
    }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          mb: 2,
          boxShadow: '0 4px 16px rgba(44, 62, 80, 0.2)'
        }}>
          <Verified sx={{ fontSize: 28, color: 'white' }} />
        </Box>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: '#2c3e50',
            mb: 1
          }}
        >
          Review Your Information
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            fontSize: '1rem',
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          Please review all information before creating your workspace
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Workspace Information Card */}
        <Grid item xs={12} lg={4}>
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              transition: 'all 0.2s ease-in-out',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            {/* Card Header */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
              p: 2.5,
              color: 'white',
              position: 'relative'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Business sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600">
                    Workspace
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                    Business Identity
                  </Typography>
                </Box>
              </Box>
              <CheckCircle 
                sx={{ 
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  fontSize: 20,
                  color: '#27ae60'
                }} 
              />
            </Box>
            
            {/* Card Content */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                  Workspace Name
                </Typography>
                <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mt: 0.5 }}>
                  {formData.workspaceName}
                </Typography>
              </Box>
              
              {formData.workspaceDescription && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, mt: 0.5, color: 'text.primary' }}>
                    {formData.workspaceDescription}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Venue Information Card */}
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              transition: 'all 0.2s ease-in-out',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            {/* Card Header */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #5d6d7e 0%, #34495e 100%)',
              p: 2.5,
              color: 'white',
              position: 'relative'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Store sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600">
                    Venue Details
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                    Restaurant Information
                  </Typography>
                </Box>
              </Box>
              <CheckCircle 
                sx={{ 
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  fontSize: 20,
                  color: '#27ae60'
                }} 
              />
            </Box>
            
            {/* Card Content */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={12} lg={6}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                      Venue Name
                    </Typography>
                    <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mt: 0.5 }}>
                      {formData.venueName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                      Type
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Category sx={{ fontSize: 16, color: '#7f8c8d' }} />
                      <Typography variant="body1" fontWeight="500" color="text.primary">
                        {formData.venueType.charAt(0).toUpperCase() + formData.venueType.slice(1).replace('_', ' ')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                      Price Range
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <AttachMoney sx={{ fontSize: 16, color: '#7f8c8d' }} />
                      <Typography variant="body2" sx={{ lineHeight: 1.4, color: 'text.primary' }}>
                        {priceRangeOptions.find(p => p.value === formData.priceRange)?.label}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={12} lg={6}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                      Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
                      <Place sx={{ fontSize: 16, color: '#7f8c8d', mt: 0.2 }} />
                      <Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.4, color: 'text.primary' }}>
                          {formData.venueLocation.address}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {formData.venueLocation.city}, {formData.venueLocation.state} {formData.venueLocation.postal_code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {formData.venueLocation.country}
                        </Typography>
                        {formData.venueLocation.landmark && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                            Near {formData.venueLocation.landmark}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {(formData.venuePhone || formData.venueEmail) && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                        Contact
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {formData.venuePhone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Phone sx={{ fontSize: 16, color: '#7f8c8d' }} />
                            <Typography variant="body2" color="text.primary">
                              {formData.venuePhone}
                            </Typography>
                          </Box>
                        )}
                        {formData.venueEmail && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email sx={{ fontSize: 16, color: '#7f8c8d' }} />
                            <Typography variant="body2" color="text.primary">
                              {formData.venueEmail}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Grid>
                
                {formData.venueDescription && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.6, mt: 0.5, color: 'text.primary' }}>
                        {formData.venueDescription}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Owner Account Card */}
        <Grid item xs={12}>
          <Paper 
            elevation={2}
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.2s ease-in-out',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            {/* Card Header */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              p: 2.5,
              color: 'white',
              position: 'relative'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AccountCircle sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600">
                    Owner Account
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                    Super Admin Access
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ 
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Security sx={{ fontSize: 18, color: '#f39c12' }} />
                <CheckCircle sx={{ fontSize: 20, color: '#27ae60' }} />
              </Box>
            </Box>
            
            {/* Card Content */}
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                      Full Name
                    </Typography>
                    <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mt: 0.5 }}>
                      {formData.ownerFirstName} {formData.ownerLastName}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                      Email Address
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Email sx={{ fontSize: 16, color: '#7f8c8d' }} />
                      <Typography variant="body1" color="text.primary">
                        {formData.ownerEmail}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 500 }}>
                      Phone Number
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Phone sx={{ fontSize: 16, color: '#7f8c8d' }} />
                      <Typography variant="body1" color="text.primary">
                        {formData.ownerPhone}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2.5, 
                    borderRadius: 2, 
                    background: 'linear-gradient(135deg, rgba(52, 73, 94, 0.05) 0%, rgba(44, 62, 80, 0.05) 100%)',
                    border: '1px solid rgba(52, 73, 94, 0.15)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Security sx={{ fontSize: 20, color: '#f39c12' }} />
                      <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                        Super Admin Privileges
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      As the workspace owner, you'll have full administrative access to manage venues, users, menus, orders, and all system settings.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Summary Footer */}
      <Box sx={{ 
        mt: 4, 
        p: 3, 
        borderRadius: 2, 
        background: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        textAlign: 'center'
      }}>
        <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <DinoLogo size={24} animated={true} />
            Ready to Launch Your Digital Restaurant
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click "Create Workspace" to set up your complete restaurant management system
        </Typography>
      </Box>
    </Box>
  );
};

export default ReviewStep;