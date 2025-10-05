/**
 * Coupon List Component
 * 
 * Displays a list of coupons with filtering and search capabilities
 */

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Pagination,
  Alert,
  CircularProgress,
  Fab,
  Button,
} from '@mui/material';
import {
  Add,
} from '@mui/icons-material';
import { Coupon, CouponFilters as CouponFiltersType } from '../types/coupon';
import CouponCard from './CouponCard';
import CouponFiltersComponent from './CouponFilters';
import { useCouponFlags } from '../../../flags/FlagContext';
import { FlagGate } from '../../../flags/FlagComponent';

interface CouponListProps {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: CouponFiltersType) => void;
  onCreateCoupon: () => void;
  onEditCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon, isActive: boolean) => void;
  onRefresh: () => void;
}

const CouponList: React.FC<CouponListProps> = ({
  coupons,
  loading,
  error,
  total,
  page,
  limit,
  onPageChange,
  onFiltersChange,
  onCreateCoupon,
  onEditCoupon,
  onDeleteCoupon,
  onToggleStatus,
  onRefresh,
}) => {
  const couponFlags = useCouponFlags();
  const [filters, setFilters] = useState<CouponFiltersType>({
    searchQuery: '',
    status: undefined,
    discountType: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Handle filter changes
  const handleFilterChange = (newFilters: CouponFiltersType) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: CouponFiltersType = {
      searchQuery: '',
      status: undefined,
      discountType: undefined,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  // Calculate pagination
  const totalPages = Math.ceil(total / limit);

  return (
    <Box>
      {/* Enhanced Filters */}
      <FlagGate flag="coupons.showCouponFilters">
        <CouponFiltersComponent
          filters={filters}
          onFiltersChange={handleFilterChange}
          onCreateCoupon={onCreateCoupon}
          onRefresh={onRefresh}
          loading={loading}
          totalCoupons={total}
        />
      </FlagGate>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && coupons.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Empty State */}
      {!loading && coupons.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {hasActiveFilters ? 'No coupons match your filters' : 'No coupons found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {hasActiveFilters 
              ? 'Try adjusting your search criteria or clear the filters'
              : 'Create your first coupon to get started'
            }
          </Typography>
          {!hasActiveFilters && (
            <FlagGate flag="coupons.showAddCoupon">
              <Button variant="contained" onClick={onCreateCoupon} startIcon={<Add />}>
                Create Your First Coupon
              </Button>
            </FlagGate>
          )}
        </Box>
      )}

      {/* Coupon Grid */}
      {coupons.length > 0 && (
        <>
          <Grid container spacing={3}>
            {coupons.map((coupon) => (
              <Grid item xs={12} sm={6} lg={4} key={coupon.id}>
                <CouponCard
                  coupon={coupon}
                  onEdit={onEditCoupon}
                  onDelete={onDeleteCoupon}
                  onToggleStatus={onToggleStatus}
                  loading={loading}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => onPageChange(newPage)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Floating Action Button for Mobile */}
      <FlagGate flag="coupons.showAddCoupon">
        <Fab
          color="primary"
          aria-label="create coupon"
          onClick={onCreateCoupon}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', sm: 'none' },
          }}
        >
          <Add />
        </Fab>
      </FlagGate>
    </Box>
  );
};

export default CouponList;