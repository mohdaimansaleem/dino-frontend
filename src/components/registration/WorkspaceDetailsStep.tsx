import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { Business } from '@mui/icons-material';
import { RegistrationFormData } from './types';

interface WorkspaceDetailsStepProps {
  formData: RegistrationFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const WorkspaceDetailsStep: React.FC<WorkspaceDetailsStepProps> = ({
  formData,
  onInputChange,
  errors
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontSize: '1.25rem'
          }}
        >
          <Business color="primary" />
          Workspace Information
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Set up your business workspace that will contain all your venues
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Workspace Name"
          value={formData.workspaceName}
          onChange={(e) => onInputChange('workspaceName', e.target.value)}
          error={!!errors.workspaceName}
          helperText={errors.workspaceName || `This will be your main business identifier (${formData.workspaceName.length}/100)`}
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Workspace Description"
          value={formData.workspaceDescription}
          onChange={(e) => onInputChange('workspaceDescription', e.target.value)}
          multiline
          rows={3}
          error={!!errors.workspaceDescription}
          helperText={errors.workspaceDescription || `Brief description of your business (optional) (${formData.workspaceDescription.length}/500)`}
        />
      </Grid>
    </Grid>
  );
};

export default WorkspaceDetailsStep;