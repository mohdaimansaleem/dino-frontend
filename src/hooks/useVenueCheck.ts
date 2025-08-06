import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

interface VenueCheckResult {
  hasVenueAssigned: boolean;
  venueId: string | null;
  requiresVenueAssignment: boolean;
  canBypassVenueCheck: boolean;
}

export const useVenueCheck = (): VenueCheckResult => {
  const { isSuperAdmin } = useAuth();
  const { userData, hasVenue } = useUserData();
  
  // Get venue ID from user data context
  const venueId = userData?.venue?.id || null;
  
  // Check if user has venue assigned using the new structure
  const hasVenueAssigned = hasVenue();
  
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