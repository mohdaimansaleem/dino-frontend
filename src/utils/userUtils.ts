/**
 * User Utilities
 * 
 * Helper functions for working with user data and handling
 * property name differences between legacy and API formats
 */

import { UserProfile } from '../types/api';

/**
 * Get user's first name from either format
 */
export const getUserFirstName = (user: UserProfile | null | undefined): string => {
  if (!user) return '';
  
  // Check both formats for compatibility
  return user.first_name || user.firstName || '';
};

/**
 * Get user's last name from either format
 */
export const getUserLastName = (user: UserProfile | null | undefined): string => {
  if (!user) return '';
  
  // Check both formats for compatibility
  return user.last_name || user.lastName || '';
};

/**
 * Get user's full name from either format
 */
export const getUserFullName = (user: UserProfile | null | undefined): string => {
  const firstName = getUserFirstName(user);
  const lastName = getUserLastName(user);
  return `${firstName} ${lastName}`.trim() || user?.email || 'Unknown User';
};

/**
 * Get user's workspace ID from either format
 */
export const getUserWorkspaceId = (user: UserProfile | null | undefined): string | undefined => {
  if (!user) return undefined;
  return user.workspace_id || user.workspaceId;
};

/**
 * Get user's venue ID from either format
 */
export const getUserVenueId = (user: UserProfile | null | undefined): string | undefined => {
  if (!user) return undefined;
  return user.venue_id || user.venueId;
};

/**
 * Get user's active status from either format
 */
export const getUserIsActive = (user: UserProfile | null | undefined): boolean => {
  if (!user) return false;
  return user.is_active ?? user.isActive ?? false;
};

/**
 * Get user's creation date from either format
 */
export const getUserCreatedAt = (user: UserProfile | null | undefined): Date | undefined => {
  if (!user) return undefined;
  
  if (user.created_at) {
    return new Date(user.created_at);
  }
  
  if (user.createdAt) {
    return user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
  }
  
  return undefined;
};

/**
 * Get user's date of birth from either format
 */
export const getUserDateOfBirth = (user: UserProfile | null | undefined): Date | undefined => {
  if (!user) return undefined;
  
  if (user.date_of_birth) {
    return new Date(user.date_of_birth);
  }
  
  if (user.dateOfBirth) {
    return user.dateOfBirth instanceof Date ? user.dateOfBirth : new Date(user.dateOfBirth);
  }
  
  return undefined;
};

/**
 * Get user's verification status from either format
 */
export const getUserIsVerified = (user: UserProfile | null | undefined): boolean => {
  if (!user) return false;
  return user.isVerified ?? user.is_active ?? false;
};

/**
 * Get user's profile image URL from either format
 */
export const getUserProfileImageUrl = (user: UserProfile | null | undefined): string | undefined => {
  if (!user) return undefined;
  return user.profileImageUrl;
};

/**
 * Get user initials for avatar display
 */
export const getUserInitials = (user: UserProfile | null | undefined): string => {
  const firstName = getUserFirstName(user);
  const lastName = getUserLastName(user);
  
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  
  if (firstInitial && lastInitial) {
    return firstInitial + lastInitial;
  }
  
  if (firstInitial) {
    return firstInitial;
  }
  
  return user?.email?.charAt(0).toUpperCase() || '?';
};