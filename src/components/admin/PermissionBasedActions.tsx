import React from 'react';
import { Button } from '../ui/Button';
import PermissionGate from '../auth/PermissionGate';


interface ActionButtonProps {
  permission?: string;
  roles?: string[];
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'contained' | 'outlined' | 'text' | 'soft' | 'gradient';
  size?: 'small' | 'medium' | 'large';
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
  variant = 'contained',
  size = 'medium',
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

// Default export for the component
const PermissionBasedActions = {
  ActionButton
};

export default PermissionBasedActions;