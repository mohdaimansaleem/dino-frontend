/**
 * Coupon Filters Component
 * 
 * Enhanced filter component matching the table management design system
 */

import React from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Stack,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { 
  FilterList, 
  LocalOffer, 
  Add, 
  Refresh, 
  Clear, 
  Search,
  TrendingUp,
  Percent
} from '@mui/icons-material';
import { CouponFilters, COUPON_STATUS_OPTIONS, DISCOUNT_TYPES } from '../types/coupon';
import { useCouponFlags } from '../../../flags/FlagContext';
import { FlagGate } from '../../../flags/FlagComponent';

// Fallback constants in case imports fail
const FALLBACK_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: '#4CAF50' },
  { value: 'expired', label: 'Expired', color: '#F44336' },
  { value: 'inactive', label: 'Inactive', color: '#9E9E9E' },
  { value: 'draft', label: 'Draft', color: '#FF9800' },
];

const FALLBACK_DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount (₹)' },
];

interface CouponFiltersProps {
  filters: CouponFilters;
  onFiltersChange: (filters: CouponFilters) => void;
  onCreateCoupon: () => void;
  onRefresh: () => void;
  loading?: boolean;
  isMobile?: boolean;
  totalCoupons: number;
}

const CouponFiltersComponent: React.FC<CouponFiltersProps> = ({
  filters,
  onFiltersChange,
  onCreateCoupon,
  onRefresh,
  loading = false,
  isMobile = false,
  totalCoupons
}) => {
  const couponFlags = useCouponFlags();
  // Use fallback constants if imports fail
  const statusOptions = COUPON_STATUS_OPTIONS || FALLBACK_STATUS_OPTIONS;
  const discountTypes = DISCOUNT_TYPES || FALLBACK_DISCOUNT_TYPES;
  // Handle filter changes
  const handleFilterChange = (field: keyof CouponFilters, value: any) => {
    const newFilters = { ...filters, [field]: value };
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: CouponFilters = {
      searchQuery: '',
      status: undefined,
      discountType: undefined,
    };
    onFiltersChange(clearedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length;

  try {
    return (
      <Box 
        sx={{ 
          backgroundColor: 'white',
          borderRadius: 3,
          p: 3,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          mb: 3
        }}
      >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FilterList sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary', mb: 0.25 }}>
              Filters & Search
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              Find and organize your coupons ({totalCoupons} total)
            </Typography>
          </Box>
        </Box>

        {hasActiveFilters && (
          <Chip
            label={`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={handleClearFilters}
            deleteIcon={<Clear sx={{ color: 'primary.main !important' }} />}
          />
        )}
      </Box>

      {/* Search and Filters */}
      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search coupons by code or description..."
            value={filters.searchQuery || ''}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            size="medium"
            sx={{ 
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'grey.50',
                '&:hover': {
                  backgroundColor: 'grey.100'
                }
              }
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid item xs={12} sm={6} md={2.5}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              label="Status"
              size="medium"
              sx={{ 
                borderRadius: 2,
                backgroundColor: 'grey.50',
                '&:hover': {
                  backgroundColor: 'grey.100'
                }
              }}
            >
              <MenuItem value="">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'primary.main' }} />
                  All Statuses
                </Box>
              </MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: option.color 
                      }} 
                    />
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Discount Type Filter */}
        <Grid item xs={12} sm={6} md={2.5}>
          <FormControl fullWidth>
            <InputLabel>Discount Type</InputLabel>
            <Select
              value={filters.discountType || ''}
              onChange={(e) => handleFilterChange('discountType', e.target.value || undefined)}
              label="Discount Type"
              size="medium"
              sx={{ 
                borderRadius: 2,
                backgroundColor: 'grey.50',
                '&:hover': {
                  backgroundColor: 'grey.100'
                }
              }}
            >
              <MenuItem value="">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'primary.main' }} />
                  All Types
                </Box>
              </MenuItem>
              {discountTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {type.value === 'percentage' ? (
                      <Percent sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <TrendingUp sx={{ fontSize: 16, color: 'info.main' }} />
                    )}
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Actions */}
        <Grid item xs={12} md={3}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
          >

            
            <FlagGate flag="coupons.showAddCoupon">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreateCoupon}
                size="medium"
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  minWidth: 140,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Create Coupon
              </Button>
            </FlagGate>
            
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              sx={{ 
                backgroundColor: 'grey.100',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                width: 48,
                height: 48,
                '&:hover': { 
                  backgroundColor: 'grey.200',
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  opacity: 0.5,
                  backgroundColor: 'grey.100'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Refresh sx={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'grey.100' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            Active Filters:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filters.searchQuery && (
              <Chip
                label={`Search: "${filters.searchQuery}"`}
                onDelete={() => handleFilterChange('searchQuery', '')}
                size="small"
                color="primary"
                variant="outlined"
                icon={<Search sx={{ fontSize: 16 }} />}
              />
            )}
            {filters.status && (
              <Chip
                label={`Status: ${statusOptions.find(o => o.value === filters.status)?.label || 'Unknown'}`}
                onDelete={() => handleFilterChange('status', undefined)}
                size="small"
                color="primary"
                variant="outlined"
                icon={<LocalOffer sx={{ fontSize: 16 }} />}
              />
            )}
            {filters.discountType && (
              <Chip
                label={`Type: ${discountTypes.find(t => t.value === filters.discountType)?.label || 'Unknown'}`}
                onDelete={() => handleFilterChange('discountType', undefined)}
                size="small"
                color="primary"
                variant="outlined"
                icon={filters.discountType === 'percentage' ? 
                  <Percent sx={{ fontSize: 16 }} /> : 
                  <TrendingUp sx={{ fontSize: 16 }} />
                }
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
    );
  } catch (error) {
    console.error('Error in CouponFiltersComponent:', error);
    return (
      <Box sx={{ p: 3, backgroundColor: 'error.light', borderRadius: 2 }}>
        <Typography color="error">
          Error loading filters. Please refresh the page.
        </Typography>
      </Box>
    );
  }
};

export default CouponFiltersComponent;