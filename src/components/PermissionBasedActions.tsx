import React from 'react';
import { Button } from './ui/Button';
import PermissionGate from './PermissionGate';
import { usePermissions } from './RoleBasedComponent';

interface ActionButtonProps {
  permission?: string;
  roles?: string[];
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * ActionButton - A button that only renders if user has required permissions
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  permission,
  roles,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = ''
}) => {
  return (
    <PermissionGate permission={permission as any} roles={roles as any}>
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        className={className}
      >
        {children}
      </Button>
    </PermissionGate>
  );
};