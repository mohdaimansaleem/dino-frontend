import React from 'react';
import { 
  Grid, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  InputAdornment,
  FormHelperText 
} from '@mui/material';
import { Store, LocationOn, Email, Phone } from '@mui/icons-material';
import { RegistrationFormData, priceRangeOptions, venueTypeOptions } from './types';

interface VenueInformationStepProps {
  formData: RegistrationFormData;
  onInputChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const VenueInformationStep: React.FC<VenueInformationStepProps> = ({
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
          <Store color="primary" />
          Venue Details
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          Configure your first venue under this workspace
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Venue Name"
          value={formData.venueName}
          onChange={(e) => onInputChange('venueName', e.target.value)}
          error={!!errors.venueName}
          helperText={errors.venueName}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Venue Type</InputLabel>
          <Select
            value={formData.venueType}
            label="Venue Type"
            onChange={(e) => onInputChange('venueType', e.target.value)}
          >
            {venueTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Venue Description"
          value={formData.venueDescription}
          onChange={(e) => onInputChange('venueDescription', e.target.value)}
          multiline
          rows={2}
          error={!!errors.venueDescription}
          helperText={errors.venueDescription || `Describe your venue's atmosphere and specialties (${formData.venueDescription.length}/1000)`}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography 
          variant="subtitle1" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mt: 2,
            fontSize: '1.125rem',
            fontWeight: 500
          }}
        >
          <LocationOn color="primary" />
          Location Details
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          value={formData.venueLocation.address}
          onChange={(e) => onInputChange('venueLocation.address', e.target.value)}
          error={!!errors.address}
          helperText={errors.address}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={formData.venueLocation.city}
          onChange={(e) => onInputChange('venueLocation.city', e.target.value)}
          error={!!errors.city}
          helperText={errors.city}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State"
          value={formData.venueLocation.state}
          onChange={(e) => onInputChange('venueLocation.state', e.target.value)}
          error={!!errors.state}
          helperText={errors.state}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Postal Code"
          value={formData.venueLocation.postal_code}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^[0-9]+$/.test(value)) {
              onInputChange('venueLocation.postal_code', value);
            }
          }}
          error={!!errors.postal_code}
          required
          helperText={errors.postal_code || 'Enter 6-digit postal code'}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 6
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Country"
          value={formData.venueLocation.country}
          onChange={(e) => onInputChange('venueLocation.country', e.target.value)}
          disabled
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Landmark (Optional)"
          value={formData.venueLocation.landmark}
          onChange={(e) => onInputChange('venueLocation.landmark', e.target.value)}
          helperText="Nearby landmark to help customers find you"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography 
          variant="subtitle1" 
          gutterBottom 
          sx={{ 
            mt: 2,
            fontSize: '1.125rem',
            fontWeight: 500
          }}
        >
          Contact & Business Details
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Venue Phone"
          value={formData.venuePhone}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || /^[0-9]+$/.test(value)) {
              onInputChange('venuePhone', value);
            }
          }}
          error={!!errors.venuePhone}
          helperText={errors.venuePhone || 'Required: Exactly 10 digits'}
          required
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 10
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Venue Email"
          value={formData.venueEmail}
          onChange={(e) => onInputChange('venueEmail', e.target.value)}
          error={!!errors.venueEmail}
          helperText={errors.venueEmail || 'Required: Business email address'}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Price Range</InputLabel>
          <Select
            value={formData.priceRange}
            label="Price Range"
            onChange={(e) => onInputChange('priceRange', e.target.value)}
          >
            {priceRangeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Typography variant="body2">
                  {option.label}
                </Typography>
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Average cost per person</FormHelperText>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default VenueInformationStep;