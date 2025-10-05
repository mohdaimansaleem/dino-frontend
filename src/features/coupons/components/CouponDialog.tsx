/**
 * Coupon Dialog Component
 * 
 * Modal dialog for creating and editing coupons
 * Aligned with the design system used in other modules
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Alert,
  Chip,
  Stack,
  InputAdornment,
  Tooltip,
  IconButton,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  Info,
  Refresh,
  LocalOffer,
  Percent,
  AttachMoney,
  CalendarToday,
  ShoppingCart,
  People,
  ToggleOn,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Coupon, 
  CouponFormData, 
  DISCOUNT_TYPES,
  CouponCreate,
  CouponUpdate
} from '../types/coupon';
import { validateCouponForm } from '../utils/couponValidation';
import { useUserData } from '../../../contexts/UserDataContext';
import CouponPreview from './CouponPreview';

interface CouponDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (couponData: CouponCreate | CouponUpdate) => Promise<void>;
  coupon?: Coupon | null;
  onValidateCode?: (code: string, excludeId?: string) => Promise<{ isValid: boolean; message?: string }>;
}

const CouponDialog: React.FC<CouponDialogProps> = ({
  open,
  onClose,
  onSave,
  coupon,
  onValidateCode,
}) => {
  const { userData } = useUserData();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isEditing = !!coupon;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: nextMonth.toISOString().split('T')[0],
    minOrderAmount: '',
    maxClaims: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [codeValidation, setCodeValidation] = useState<{ isValid: boolean; message?: string } | null>(null);

  // Initialize form data
  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        startDate: coupon.startDate.split('T')[0],
        expiryDate: coupon.expiryDate.split('T')[0],
        minOrderAmount: coupon.minOrderAmount?.toString() || '',
        maxClaims: coupon.maxClaims?.toString() || '',
        isActive: coupon.isActive,
      });
      setCodeValidation(null);
    } else {
      // Reset form for new coupon
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        startDate: '',
        expiryDate: '',
        minOrderAmount: '',
        maxClaims: '',
        isActive: true,
      });
      setCodeValidation(null);
    }
  }, [coupon, open]);

  // Validate form
  const validation = validateCouponForm(formData);

  // Handle form field changes
  const handleChange = (field: keyof CouponFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear code validation when code changes
    if (field === 'code') {
      setCodeValidation(null);
    }
  };

  // Validate coupon code
  const handleValidateCode = async () => {
    if (!formData.code.trim() || !onValidateCode) return;
    
    try {
      setValidating(true);
      const result = await onValidateCode(formData.code.trim(), coupon?.id);
      setCodeValidation(result);
    } catch (error) {
      setCodeValidation({ isValid: false, message: 'Validation failed' });
    } finally {
      setValidating(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validation.isValid) return;

    try {
      setLoading(true);

      const couponData = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue.toString()),
        startDate: new Date(formData.startDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount.toString()) : undefined,
        maxClaims: formData.maxClaims ? parseInt(formData.maxClaims.toString()) : undefined,
        isActive: formData.isActive,
        ...((!isEditing && userData?.venue?.id) && { venueId: userData.venue.id }),
      };

      await onSave(couponData);
      onClose();
    } catch (error) {
      console.error('Failed to save coupon:', error);
    } finally {
      setLoading(false);
    }
  };



  // Mobile Modal Layout
  if (isMobile) {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Modal
          open={open}
          onClose={onClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={open}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '95%',
                maxWidth: '500px',
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                  <LocalOffer sx={{ fontSize: 24, mr: 1.5, color: 'text.primary' }} />
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
                  </Typography>
                  <IconButton edge="end" color="inherit" onClick={onClose}>
                    <Close />
                  </IconButton>
                </Toolbar>
              </AppBar>

              <Box sx={{ overflow: 'auto', p: { xs: 2, sm: 3 } }}>
                <Stack spacing={3}>
                  {/* Coupon Code */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Coupon Code"
                      value={formData.code}
                      onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                      placeholder="e.g., SAVE20, WELCOME10"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalOffer sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Validate code uniqueness">
                              <IconButton 
                                onClick={handleValidateCode}
                                disabled={!formData.code.trim() || validating}
                                size="small"
                              >
                                {validating ? <CircularProgress size={16} /> : <Refresh />}
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }}
                      error={!!validation.errors.find(e => e.includes('code')) || (codeValidation ? !codeValidation.isValid : false)}
                      helperText={
                        validation.errors.find(e => e.includes('code')) || 
                        (codeValidation && !codeValidation.isValid ? codeValidation.message : 
                        'Use uppercase letters, numbers, hyphens, and underscores only')
                      }
                    />
                    
                    {/* Code validation status */}
                    {codeValidation && (
                      <Alert 
                        severity={codeValidation.isValid ? 'success' : 'error'} 
                        sx={{ mt: 1 }}
                      >
                        {codeValidation.isValid ? 'Code is available' : codeValidation.message}
                      </Alert>
                    )}


                  </Box>

                  {/* Discount Type and Value */}
                  <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        value={formData.discountType}
                        onChange={(e) => handleChange('discountType', e.target.value)}
                        label="Discount Type"
                      >
                        {DISCOUNT_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Discount Value"
                      type="text"
                      value={formData.discountValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          handleChange('discountValue', value);
                        }
                      }}
                      placeholder="e.g., 20 for 20% or 10 for $10"
                      inputProps={{
                        inputMode: 'decimal',
                        pattern: '[0-9]*\\.?[0-9]*'
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {formData.discountType === 'percentage' ? (
                              <Percent sx={{ color: 'success.main', fontSize: 18 }} />
                            ) : (
                              <AttachMoney sx={{ color: 'info.main', fontSize: 18 }} />
                            )}
                          </InputAdornment>
                        )
                      }}
                      error={!!validation.errors.find(e => e.includes('Discount value'))}
                      helperText={validation.errors.find(e => e.includes('Discount value'))}
                    />
                  </Stack>

                  {/* Dates */}
                  <Stack direction="row" spacing={2}>
                    <DatePicker
                      label="Start Date"
                      value={formData.startDate ? new Date(formData.startDate) : null}
                      onChange={(date) => handleChange('startDate', date?.toISOString().split('T')[0] || '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          placeholder: "Select start date",
                          error: !!validation.errors.find(e => e.includes('Start date')),
                          helperText: validation.errors.find(e => e.includes('Start date'))
                        }
                      }}
                    />

                    <DatePicker
                      label="Expiry Date"
                      value={formData.expiryDate ? new Date(formData.expiryDate) : null}
                      onChange={(date) => handleChange('expiryDate', date?.toISOString().split('T')[0] || '')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          placeholder: "Select expiry date",
                          error: !!validation.errors.find(e => e.includes('Expiry date')),
                          helperText: validation.errors.find(e => e.includes('Expiry date'))
                        }
                      }}
                    />
                  </Stack>

                  {/* Optional Fields */}
                  <TextField
                    fullWidth
                    label="Minimum Order Amount (Optional)"
                    type="text"
                    value={formData.minOrderAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleChange('minOrderAmount', value);
                      }
                    }}
                    placeholder="e.g., 50.00"
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*\\.?[0-9]*'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ShoppingCart sx={{ color: 'warning.main', fontSize: 18 }} />
                        </InputAdornment>
                      )
                    }}
                    helperText="Leave empty for no minimum order requirement"
                  />

                  <TextField
                    fullWidth
                    label="Maximum Claims (Optional)"
                    type="text"
                    value={formData.maxClaims}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        handleChange('maxClaims', value);
                      }
                    }}
                    placeholder="e.g., 100"
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*'
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <People sx={{ color: 'secondary.main', fontSize: 18 }} />
                        </InputAdornment>
                      )
                    }}
                    helperText="Leave empty for unlimited claims"
                  />

                  {/* Active Status */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleChange('isActive', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>Active</Typography>
                        <Tooltip title="Inactive coupons cannot be used by customers">
                          <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
                        </Tooltip>
                      </Box>
                    }
                  />

                  {/* Warnings */}
                  {validation.warnings.length > 0 && (
                    <Alert severity="warning">
                      <Typography variant="subtitle2" gutterBottom>
                        Please review:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {validation.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  {/* Coupon Preview */}
                  {formData.code && formData.discountValue && (
                    <CouponPreview 
                      formData={formData} 
                      venueName={userData?.venue?.name}
                    />
                  )}
                </Stack>
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                <Stack direction="row" spacing={2}>
                  <Button onClick={onClose} fullWidth variant="outlined" disabled={loading}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    fullWidth
                    disabled={!validation.isValid || loading}
                    startIcon={loading ? <CircularProgress size={16} /> : undefined}
                  >
                    {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')} Coupon
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </LocalizationProvider>
    );
  }

  // Desktop Dialog Layout
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            m: 2,
            maxHeight: 'calc(100vh - 64px)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="600">
            {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 4 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Coupon Code */}
            <Grid item xs={12}>
              <Box>
                <TextField
                  fullWidth
                  label="Coupon Code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g., SAVE20, WELCOME10"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOffer sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Validate code uniqueness">
                          <IconButton 
                            onClick={handleValidateCode}
                            disabled={!formData.code.trim() || validating}
                            size="small"
                          >
                            {validating ? <CircularProgress size={16} /> : <Refresh />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                  error={!!validation.errors.find(e => e.includes('code')) || (codeValidation ? !codeValidation.isValid : false)}
                  helperText={
                    validation.errors.find(e => e.includes('code')) || 
                    (codeValidation && !codeValidation.isValid ? codeValidation.message : 
                    'Use uppercase letters, numbers, hyphens, and underscores only')
                  }
                />
                
                {/* Code validation status */}
                {codeValidation && (
                  <Alert 
                    severity={codeValidation.isValid ? 'success' : 'error'} 
                    sx={{ mt: 1 }}
                  >
                    {codeValidation.isValid ? 'Code is available' : codeValidation.message}
                  </Alert>
                )}


              </Box>
            </Grid>

            {/* Discount Type and Value */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={formData.discountType}
                  onChange={(e) => handleChange('discountType', e.target.value)}
                  label="Discount Type"
                >
                  {DISCOUNT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Discount Value"
                type="text"
                value={formData.discountValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    handleChange('discountValue', value);
                  }
                }}
                placeholder="e.g., 20 for 20% or 10 for $10"
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*\\.?[0-9]*'
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.discountType === 'percentage' ? (
                        <Percent sx={{ color: 'success.main', fontSize: 18 }} />
                      ) : (
                        <AttachMoney sx={{ color: 'info.main', fontSize: 18 }} />
                      )}
                    </InputAdornment>
                  )
                }}
                error={!!validation.errors.find(e => e.includes('Discount value'))}
                helperText={validation.errors.find(e => e.includes('Discount value'))}
              />
            </Grid>

            {/* Dates */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={new Date(formData.startDate)}
                onChange={(date) => handleChange('startDate', date?.toISOString().split('T')[0] || '')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!validation.errors.find(e => e.includes('Start date')),
                    helperText: validation.errors.find(e => e.includes('Start date'))
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Expiry Date"
                value={new Date(formData.expiryDate)}
                onChange={(date) => handleChange('expiryDate', date?.toISOString().split('T')[0] || '')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!validation.errors.find(e => e.includes('Expiry date')),
                    helperText: validation.errors.find(e => e.includes('Expiry date'))
                  }
                }}
              />
            </Grid>

            {/* Optional Fields */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Order Amount (Optional)"
                type="text"
                value={formData.minOrderAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    handleChange('minOrderAmount', value);
                  }
                }}
                placeholder="e.g., 50.00"
                inputProps={{
                  inputMode: 'decimal',
                  pattern: '[0-9]*\\.?[0-9]*'
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ShoppingCart sx={{ color: 'warning.main', fontSize: 18 }} />
                    </InputAdornment>
                  )
                }}
                helperText="Leave empty for no minimum order requirement"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Claims (Optional)"
                type="text"
                value={formData.maxClaims}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    handleChange('maxClaims', value);
                  }
                }}
                placeholder="e.g., 100"
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*'
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <People sx={{ color: 'secondary.main', fontSize: 18 }} />
                    </InputAdornment>
                  )
                }}
                helperText="Leave empty for unlimited claims"
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>Active</Typography>
                    <Tooltip title="Inactive coupons cannot be used by customers">
                      <Info sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                }
              />
            </Grid>

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="subtitle2" gutterBottom>
                    Please review:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              </Grid>
            )}

            {/* Coupon Preview */}
            {formData.code && formData.discountValue && (
              <Grid item xs={12}>
                <CouponPreview 
                  formData={formData} 
                  venueName={userData?.venue?.name}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!validation.isValid || loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')} Coupon
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CouponDialog;