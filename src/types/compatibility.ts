// Type compatibility layer to bridge differences between auth.ts and index.ts types

import { UserProfile as BaseUserProfile, Permission as BasePermission, UserRole as BaseUserRole } from './index';

// Extended UserProfile that includes all needed properties
export interface ExtendedUserProfile {
  // Base properties
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Ensure all permission-related properties exist
  permissions: BasePermission[];
  role: ExtendedUserRole;
  
  // Compatibility properties
  first_name: string;
  last_name: string;
  venue_id?: string;
  workspace_id?: string;
  
  // Optional properties
  name?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profileImageUrl?: string;
  addresses?: any[];
  preferences?: any;
  lastLogin?: Date;
  loginCount?: number;
  totalOrders?: number;
  totalSpent?: number;
  workspaceId?: string;
  cafeId?: string;
}

export interface ExtendedUserRole {
  name: string;
  display_name?: string;
}

// Re-export for convenience
export type { BasePermission as Permission };

// Type guards
export function isExtendedUserProfile(user: any): user is ExtendedUserProfile {
  return user && typeof user === 'object' && 'id' in user && 'email' in user;
}

// Utility function to ensure user has all required properties
export function normalizeUser(user: BaseUserProfile): ExtendedUserProfile {
  return {
    ...user,
    first_name: user.firstName,
    last_name: user.lastName,
    venue_id: user.cafeId,
    workspace_id: user.workspaceId,
    permissions: user.permissions || [],
    role: {
      name: typeof user.role === 'string' ? user.role : 'customer',
      display_name: undefined
    }
  };
}