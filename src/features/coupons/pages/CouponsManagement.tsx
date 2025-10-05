/**
 * Coupons Management Page
 * 
 * Main page for managing coupons with full CRUD operations
 * Aligned with the design system used in TableManagement and MenuManagement
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  keyframes,
} from '@mui/material';
import {
  LocalOffer,
  Refresh,
  Store,
  CachedOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useUserData } from '../../../contexts/UserDataContext';
import { PERMISSIONS } from '../../../types/auth';
import { useCoupons } from '../hooks/useCoupons';
import { Coupon, CouponFilters, CouponCreate, CouponUpdate } from '../types/coupon';
import CouponList from '../components/CouponList';
import CouponDialog from '../components/CouponDialog';
import { CouponStatsComponent } from '../components';
import { DeleteConfirmationModal } from '../../../components/modals';
import AnimatedBackground from '../../../components/ui/AnimatedBackground';
import { useCouponFlags } from '../../../flags/FlagContext';
import { FlagGate } from '../../../flags/FlagComponent';

// Animation for refresh icon
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const CouponsManagement: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { getVenue, getVenueDisplayName, loading: userDataLoading } = useUserData();
  const couponFlags = useCouponFlags();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    coupons,
    loading,
    error,
    total,
    page,
    limit,
    stats,
    statsLoading,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCouponCode,
    refreshCoupons,
    clearError,
  } = useCoupons();

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    fetchCoupons({ page: newPage, limit });
  }, [fetchCoupons, limit]);

  // Handle filters change
  const handleFiltersChange = useCallback((filters: CouponFilters) => {
    fetchCoupons({ ...filters, page: 1, limit });
  }, [fetchCoupons, limit]);

  // Check permissions
  const canManageCoupons = hasPermission(PERMISSIONS.TABLES_VIEW) || 
                          user?.role === 'admin' || 
                          user?.role === 'superadmin';

  // Handle create coupon
  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setDialogOpen(true);
  };

  // Handle edit coupon
  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  };

  // Handle delete coupon
  const handleDeleteCoupon = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  // Handle save coupon (create or update)
  const handleSaveCoupon = async (couponData: CouponCreate | CouponUpdate) => {
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData as CouponUpdate);
        setSnackbar({
          open: true,
          message: 'Coupon updated successfully',
          severity: 'success',
        });
      } else {
        await createCoupon(couponData as CouponCreate);
        setSnackbar({
          open: true,
          message: 'Coupon created successfully',
          severity: 'success',
        });
      }
      setDialogOpen(false);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save coupon',
        severity: 'error',
      });
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;

    try {
      await deleteCoupon(couponToDelete.id);
      setSnackbar({
        open: true,
        message: 'Coupon deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete coupon',
        severity: 'error',
      });
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (coupon: Coupon, isActive: boolean) => {
    try {
      await toggleCouponStatus(coupon.id, isActive);
      setSnackbar({
        open: true,
        message: `Coupon ${isActive ? 'activated' : 'deactivated'} successfully`,
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update coupon status',
        severity: 'error',
      });
    }
  };



  // Loading state
  if (loading && coupons.length === 0) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center',
        gap: 2,
        py: { xs: 2, sm: 4 }
      }}>
        <CircularProgress size={isMobile ? 48 : 60} />
        <Typography variant={isMobile ? "body1" : "h6"}>
          Loading Coupon Management...
        </Typography>
      </Box>
    );
  }

  // Permission check
  if (!canManageCoupons) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 4 }
      }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant={isMobile ? "body2" : "body1"}>
            You don't have permission to manage coupons. Please contact your administrator.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: 'auto',
        height: 'auto',
        backgroundColor: '#f8f9fa',
        padding: 0,
        margin: 0,
        width: '100%',
        overflow: 'visible',
        '& .MuiContainer-root': {
          padding: '0 !important',
          margin: '0 !important',
          maxWidth: 'none !important',
        },
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
          padding: 0,
          margin: 0,
          width: '100%',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 2, md: 3 },
              py: { xs: 3, sm: 4 },
              px: { xs: 3, sm: 4 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalOffer sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  Coupon Management
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400,
                  mb: 1,
                  maxWidth: '500px',
                  color: 'text.secondary',
                }}
              >
                Create and manage discount coupons for your venue to boost customer engagement and sales
              </Typography>

              {getVenue() && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Store sx={{ fontSize: 18, mr: 1, color: 'primary.main', opacity: 0.9 }} />
                  <Typography variant="body2" fontWeight="500" color="text.primary">
                    {getVenueDisplayName()}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={refreshCoupons}
                disabled={loading}
                size="medium"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                title={loading ? 'Refreshing...' : 'Refresh coupons'}
              >
                {loading ? (
                  <CachedOutlined sx={{ animation: `${spin} 1s linear infinite` }} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          width: '100%',
          padding: 0,
          margin: 0,
        }}
      >
        {/* Stats Section */}
        <FlagGate flag="coupons.showCouponStats">
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 2 }}>
            <CouponStatsComponent 
              stats={stats || {
                totalCoupons: coupons.length,
                activeCoupons: coupons.filter(c => c.isActive).length,
                totalClaims: coupons.reduce((sum, c) => sum + c.currentClaims, 0),
                totalDiscountGiven: 0
              }} 
            />
          </Box>
        </FlagGate>

        {/* Error Alert */}
        {error && (
          <Box sx={{ px: { xs: 3, sm: 4 }, mb: 3 }}>
            <Alert 
              severity="error" 
              onClose={clearError}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Coupon List */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pb: 4 }}>
          <CouponList
            coupons={coupons}
            loading={loading}
            error={null} // We handle error above
            total={total}
            page={page}
            limit={limit}
            onPageChange={handlePageChange}
            onFiltersChange={handleFiltersChange}
            onCreateCoupon={handleCreateCoupon}
            onEditCoupon={handleEditCoupon}
            onDeleteCoupon={handleDeleteCoupon}
            onToggleStatus={handleToggleStatus}
            onRefresh={refreshCoupons}
          />
        </Box>

        {/* Coupon Dialog */}
        <CouponDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveCoupon}
          coupon={editingCoupon}
          onValidateCode={validateCouponCode}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Coupon"
          itemName={couponToDelete?.code || ''}
          itemType="coupon"
          description="This will permanently remove the coupon and all its usage history."
          requireTyping={false}
          additionalWarnings={[
            'Any ongoing promotions using this coupon will be affected',
            'Coupon-specific analytics will be lost',
            'Customer saved coupons will become invalid'
          ]}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CouponsManagement;