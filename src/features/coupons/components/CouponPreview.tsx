/**
 * Coupon Preview Component
 * 
 * Shows a preview of the coupon with description and visual representation
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LocalOffer,
  CalendarToday,
  ShoppingCart,
  People,
  Percent,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { CouponFormData } from '../types/coupon';

interface CouponPreviewProps {
  formData: CouponFormData;
  venueName?: string;
}

const CouponPreview: React.FC<CouponPreviewProps> = ({ formData, venueName }) => {
  const theme = useTheme();

  // Generate coupon description
  const generateDescription = () => {
    const discountText = formData.discountType === 'percentage' 
      ? `${formData.discountValue}% off`
      : `₹${formData.discountValue} off`;
    
    const minOrderText = formData.minOrderAmount 
      ? ` on orders above ₹${formData.minOrderAmount}`
      : '';
    
    const maxClaimsText = formData.maxClaims 
      ? ` (Limited to ${formData.maxClaims} uses)`
      : ' (Unlimited uses)';
    
    return `Get ${discountText}${minOrderText}${maxClaimsText}`;
  };

  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get discount display
  const getDiscountDisplay = () => {
    if (!formData.discountValue) return '0';
    if (formData.discountType === 'percentage') {
      return `${formData.discountValue}% OFF`;
    } else {
      return `₹${formData.discountValue} OFF`;
    }
  };

  // Get card color based on discount type
  const getCardColor = () => {
    if (formData.discountType === 'percentage') {
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

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalOffer sx={{ color: 'primary.main', fontSize: 18 }} />
        Preview
      </Typography>
      
      <Card
        sx={{
          borderRadius: 3,
          border: '2px solid',
          borderColor: cardColors.border,
          background: cardColors.background,
          overflow: 'hidden',
          position: 'relative',
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
        }}
      >
        <CardContent sx={{ p: 2, position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography 
                variant="body1" 
                fontWeight="700"
                sx={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  color: 'primary.main'
                }}
              >
                {formData.code || 'COUPON_CODE'}
              </Typography>
              
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: cardColors.accent,
                  color: 'white',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  boxShadow: `0 1px 4px ${cardColors.accent}40`,
                }}
              >
                {getDiscountDisplay()}
              </Box>
            </Box>

            <Chip
              label={formData.isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                backgroundColor: formData.isActive ? '#4CAF50' : '#9E9E9E',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          </Box>

          {/* Description */}
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 1.5, 
              fontWeight: 500,
              color: 'text.primary',
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: alpha(cardColors.accent, 0.2),
              fontSize: '0.875rem'
            }}
          >
            {generateDescription()}
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          {/* Details */}
          <Stack spacing={1}>
            {/* Compact Details */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
              {venueName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocalOffer sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {venueName}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(formData.startDate)} - {formatDate(formData.expiryDate)}
                </Typography>
              </Box>

              {formData.minOrderAmount && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ShoppingCart sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Min ₹{formData.minOrderAmount}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <People sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formData.maxClaims ? `${formData.maxClaims} uses` : 'Unlimited'}
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Compact Terms */}
          <Box sx={{ mt: 2, p: 1.5, backgroundColor: alpha(theme.palette.grey[500], 0.08), borderRadius: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              Terms:
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, fontSize: '0.7rem' }}>
              Valid only at {venueName || 'venue'} • Cannot combine with other offers • Dine-in only
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CouponPreview;