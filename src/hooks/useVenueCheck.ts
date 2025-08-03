import { useAuth } from '../contexts/AuthContext';

interface VenueCheckResult {
  hasVenueAssigned: boolean;
  venueId: string | null;
  requiresVenueAssignment: boolean;
  canBypassVenueCheck: boolean;
}

export const useVenueCheck = (): VenueCheckResult => {
  const { user, isSuperAdmin } = useAuth();
  
  // Get venue ID from user data
  const venueId = user?.venue_id || user?.cafeId || null;
  
  // Check if user has venue assigned
  const hasVenueAssigned = !!venueId;
  
  // Super admins can bypass venue checks for most operations
  const canBypassVenueCheck = isSuperAdmin();
  
  // Determine if venue assignment is required for this user
  const requiresVenueAssignment = !hasVenueAssigned && !canBypassVenueCheck;
  
  return {
    hasVenueAssigned,
    venueId,
    requiresVenueAssignment,
    canBypassVenueCheck,
  };
};

export default useVenueCheck;