/**
 * User Utilities
 * 
 * Helper functions for working with user data and handling
 * property name differences between legacy and API formats
 */

import { UserProfile, LegacyUserProfile } from '../types';

/**
 * Get user's first name from either format
 */
export const getUserFirstName = (user: UserProfile | LegacyUserProfile | null | undefined): string => {
  if (!user) return '';
  
  // Check if it's legacy format
  if ('firstName' in user) {
    return user.firstName || '';
  }
  
  // API format
  return (user as UserProfile).first_name || '';
};

/**
 * Get user's last name from either format
 */
export const getUserLastName = (user: UserProfile | LegacyUserProfile | null | undefined): string => {
  if (!user) return '';
  
  // Check if it's legacy format
  if ('lastName' in user) {
    return user.lastName || '';
  }
  
  // API format
  return (user as UserProfile).last_name || '';
};

/**
 * Get user's full name from either format
 */
export const getUserFullName = (user: UserProfile | LegacyUserProfile | null | undefined): string => {
  const firstName = getUserFirstName(user);
  const lastName = getUserLastName(user);
  return `${firstName} ${lastName}`.trim() || user?.email || 'Unknown User';
};

/**
 * Get user's workspace ID from either format
 */
export const getUserWorkspaceId = (user: UserProfile | LegacyUserProfile | null | undefined): string | undefined => {
  if (!user) return undefined;
  
  // Check if it's legacy format
  if ('workspaceId' in user) {
    return user.workspaceId || user.workspace_id;
  }
  
  // API format
  return (user as UserProfile).workspace_id;
};

/**
 * Get user's venue ID from either format
 */
export const getUserVenueId = (user: UserProfile | LegacyUserProfile | null | undefined): string | undefined => {
  if (!user) return undefined;
  
  // Check if it's legacy format
  if ('cafeId' in user) {
    return (user as any).cafeId || user.venue_id;
  }
  
  // API format
  return (user as UserProfile).venue_id;
};

/**
 * Get user's active status from either format
 */
export const getUserIsActive = (user: UserProfile | LegacyUserProfile | null | undefined): boolean => {
  if (!user) return false;
  
  // Check if it's legacy format
  if ('isActive' in user) {
    return user.isActive ?? false;
  }
  
  // API format
  return (user as UserProfile).is_active;
};

/**
 * Get user's creation date from either format
 */
export const getUserCreatedAt = (user: UserProfile | LegacyUserProfile | null | undefined): Date | undefined => {
  if (!user) return undefined;
  
  // Check if it's legacy format
  if ('createdAt' in user) {
    return user.createdAt;
  }
  
  // API format
  return new Date((user as UserProfile).created_at);
};

/**
 * Get user's date of birth from either format
 */
export const getUserDateOfBirth = (user: UserProfile | LegacyUserProfile | null | undefined): Date | undefined => {
  if (!user) return undefined;
  
  // Check if it's legacy format
  if ('dateOfBirth' in user) {
    return user.dateOfBirth;
  }
  
  // API format
  const dateStr = (user as UserProfile).date_of_birth;
  return dateStr ? new Date(dateStr) : undefined;
};

/**
 * Get user's verification status from either format
 */
export const getUserIsVerified = (user: UserProfile | LegacyUserProfile | null | undefined): boolean => {
  if (!user) return false;
  
  // Check if it's legacy format
  if ('isVerified' in user) {
    return user.isVerified ?? false;
  }
  
  // API format doesn't have verification status, assume true if active
  return (user as UserProfile).is_active;
};

/**
 * Get user's profile image URL from either format
 */
export const getUserProfileImageUrl = (user: UserProfile | LegacyUserProfile | null | undefined): string | undefined => {
  if (!user) return undefined;
  
  // Check if it's legacy format
  if ('profileImageUrl' in user) {
    return user.profileImageUrl;
  }
  
  // API format doesn't have profile image URL
  return undefined;
};

/**
 * Get user initials for avatar display
 */
export const getUserInitials = (user: UserProfile | LegacyUserProfile | null | undefined): string => {
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

/**
 * Convert legacy user format to API format
 */
export const convertLegacyToApiUser = (legacyUser: LegacyUserProfile): Partial<UserProfile> => {
  return {
    id: legacyUser.id,
    email: legacyUser.email,
    phone: legacyUser.phone,
    first_name: legacyUser.firstName,
    last_name: legacyUser.lastName,
    role: legacyUser.role as any,
    workspace_id: legacyUser.workspaceId || legacyUser.workspace_id,
    venue_id: (legacyUser as any).cafeId || legacyUser.venue_id,
    is_active: legacyUser.isActive,
    created_at: legacyUser.createdAt.toISOString(),
    updated_at: legacyUser.updatedAt?.toISOString(),
    date_of_birth: legacyUser.dateOfBirth?.toISOString().split('T')[0],
    gender: legacyUser.gender
  };
};

/**
 * Convert API user format to legacy format
 */
export const convertApiToLegacyUser = (apiUser: UserProfile): LegacyUserProfile => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    phone: apiUser.phone,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    first_name: apiUser.first_name,
    last_name: apiUser.last_name,
    dateOfBirth: apiUser.date_of_birth ? new Date(apiUser.date_of_birth) : undefined,
    gender: apiUser.gender,
    role: apiUser.role as any,
    permissions: [], // Would need to be fetched separately
    profileImageUrl: undefined, // Not in API response
    isActive: apiUser.is_active,
    isVerified: true, // Assume verified if active
    addresses: [], // Would need to be fetched separately
    preferences: undefined, // Would need to be fetched separately
    createdAt: new Date(apiUser.created_at),
    updatedAt: apiUser.updated_at ? new Date(apiUser.updated_at) : undefined,
    lastLogin: undefined, // Not in API response
    loginCount: undefined, // Not in API response
    totalOrders: undefined, // Not in API response
    totalSpent: undefined, // Not in API response
    workspaceId: apiUser.workspace_id,
    workspace_id: apiUser.workspace_id,
    cafeId: apiUser.venue_id,
    venue_id: apiUser.venue_id,
    name: `${apiUser.first_name} ${apiUser.last_name}`.trim()
  } as LegacyUserProfile;
};