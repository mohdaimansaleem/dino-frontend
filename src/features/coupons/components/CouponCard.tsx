/**
 * Coupon Card Component
 * 
 * Displays individual coupon information in a card format
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Stack,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  ContentCopy,
  Visibility,
  CalendarToday,
  LocalOffer,
  People,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { Coupon, COUPON_STATUS_OPTIONS } from '../types/coupon';
import { isCouponValid } from '../utils/couponValidation';
import { useCouponFlags } from '../../../flags/FlagContext';
import { FlagGate } from '../../../flags/FlagComponent';

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon, isActive: boolean) => void;
  onViewDetails?: (coupon: Coupon) => void;
  loading?: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
  loading = false,
}) => {
  const couponFlags = useCouponFlags();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy coupon code:', error);
    }
    handleMenuClose();
  };

  // Calculate coupon validity
  const validity = isCouponValid(
    coupon.startDate,
    coupon.expiryDate,
    coupon.isActive,
    coupon.maxClaims,
    coupon.currentClaims
  );

  // Calculate usage percentage
  const usagePercentage = coupon.maxClaims 
    ? Math.round((coupon.currentClaims / coupon.maxClaims) * 100)
    : 0;

  // Get status info
  const statusInfo = COUPON_STATUS_OPTIONS.find(option => option.value === coupon.status) || 
    COUPON_STATUS_OPTIONS[0];

  // Get card color based on coupon type and status
  const getCardColor = () => {
    if (!validity.isValid) {
      return {
        background: 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)',
        border: '#f8bbd9',
        accent: '#e91e63'
      };
    }
    
    if (coupon.discountType === 'percentage') {
      return {
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
        border: '#a5d6a7',
        accent: '#4caf50'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%)',
        border: '#90caf9',
        accent: '#2196f3'
      };
    }
  };

  const cardColors = getCardColor();

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get discount display
  const getDiscountDisplay = () => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else {
      return `₹${coupon.discountValue} OFF`;
    }
  };

  // Check if coupon is expiring soon (within 7 days)
  const isExpiringSoon = () => {
    const expiryDate = new Date(coupon.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  return (
    <Card
      sx={{
        position: 'relative',
        borderRadius: 3,
        border: '2px solid',
        borderColor: cardColors.border,
        background: cardColors.background,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px rgba(0, 0, 0, 0.15)`,
          borderColor: cardColors.accent,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${cardColors.accent}, ${cardColors.accent}dd)`,
          zIndex: 1,
        },
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0,
            borderRadius: '8px 8px 0 0'
          }} 
        />
      )}

      <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography 
                variant="h6" 
                fontWeight="700"
                sx={{ 
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  color: 'primary.main'
                }}
              >
                {coupon.code}
              </Typography>
              <Tooltip title={copySuccess ? 'Copied!' : 'Copy code'}>
                <IconButton 
                  size="small" 
                  onClick={handleCopyCode}
                  sx={{ color: copySuccess ? 'success.main' : 'text.secondary' }}
                >
                  <ContentCopy sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: cardColors.accent,
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1.25rem',
                mb: 1,
                boxShadow: `0 2px 8px ${cardColors.accent}40`,
              }}
            >
              {getDiscountDisplay()}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={statusInfo.label}
              size="small"
              sx={{
                backgroundColor: statusInfo.color,
                color: 'white',
                fontWeight: 600,
              }}
            />
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Validity Status */}
        {!validity.isValid && (
          <Alert severity="warning" sx={{ mb: 2, py: 0.5 }}>
            <Typography variant="caption">
              {validity.reason}
            </Typography>
          </Alert>
        )}

        {/* Expiring Soon Warning */}
        {validity.isValid && isExpiringSoon() && (
          <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
            <Typography variant="caption">
              Expires in {Math.ceil((new Date(coupon.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
            </Typography>
          </Alert>
        )}

        {/* Details */}
        <Stack spacing={2}>
          {/* Dates */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(coupon.startDate)} - {formatDate(coupon.expiryDate)}
            </Typography>
          </Box>

          {/* Minimum Order */}
          {coupon.minOrderAmount && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalOffer sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Min order: ₹{coupon.minOrderAmount}
              </Typography>
            </Box>
          )}

          {/* Usage Stats */}
          {coupon.maxClaims && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Used {coupon.currentClaims} of {coupon.maxClaims} times
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={usagePercentage}
                sx={{ 
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    backgroundColor: usagePercentage >= 80 ? 'warning.main' : 'primary.main'
                  }
                }}
              />
            </Box>
          )}

          <Divider />

          {/* Active Status Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FlagGate flag="coupons.showCouponActivation">
              <FormControlLabel
                control={
                  <Switch
                    checked={coupon.isActive}
                    onChange={(e) => onToggleStatus(coupon, e.target.checked)}
                    size="small"
                    disabled={loading}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                }
              />
            </FlagGate>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {validity.isValid ? (
                <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography variant="caption" color="text.secondary">
                {validity.isValid ? 'Valid' : 'Invalid'}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {onViewDetails && (
          <FlagGate flag="coupons.showCouponPreview">
            <MenuItem onClick={() => { onViewDetails(coupon); handleMenuClose(); }}>
              <Visibility sx={{ mr: 1, fontSize: 18 }} />
              View Details
            </MenuItem>
          </FlagGate>
        )}
        <FlagGate flag="coupons.showEditCoupon">
          <MenuItem onClick={() => { onEdit(coupon); handleMenuClose(); }}>
            <Edit sx={{ mr: 1, fontSize: 18 }} />
            Edit
          </MenuItem>
        </FlagGate>
        <MenuItem onClick={handleCopyCode}>
          <ContentCopy sx={{ mr: 1, fontSize: 18 }} />
          Copy Code
        </MenuItem>
        <FlagGate flag="coupons.showDeleteCoupon">
          <MenuItem 
            onClick={() => { onDelete(coupon); handleMenuClose(); }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1, fontSize: 18 }} />
            Delete
          </MenuItem>
        </FlagGate>
      </Menu>
    </Card>
  );
};

export default CouponCard;