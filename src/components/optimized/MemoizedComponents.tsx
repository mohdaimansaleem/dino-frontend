import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Box,
  IconButton,
  TableRow,
  TableCell,
  Stack,
  Button,
} from '@mui/material';
import { 
  MoreVert, 
  CheckCircle, 
  Cancel, 
  People,
  Add 
} from '@mui/icons-material';

// Memoized User Card Component for mobile view
interface UserCardProps {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: string;
    role_display_name?: string;
    status: string;
    is_active: boolean;
    last_logged_in?: string;
    updated_at?: string;
    created_at?: string;
    user_name?: string;
  };
  onMenuClick: (event: React.MouseEvent<HTMLElement>, user: any) => void;
  getRoleColor: (role: string) => any;
  getDisplayName: (role: string) => string;
  formatLastLogin: (date?: string) => string;
  isMobile: boolean;
}

export const UserCard = React.memo<UserCardProps>(({
  user,
  onMenuClick,
  getRoleColor,
  getDisplayName,
  formatLastLogin,
  isMobile,
}) => {
  const handleMenuClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    onMenuClick(event, user);
  }, [onMenuClick, user]);

  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="600" noWrap>
              {user.user_name || `${user.first_name} ${user.last_name}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.email}
            </Typography>
            {user.phone && (
              <Typography variant="caption" color="text.secondary">
                {user.phone}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip
              label={user.role_display_name || getDisplayName(user.role)}
              color={getRoleColor(user.role)}
              size="small"
              sx={{ fontSize: '0.75rem' }}
            />
            <Chip
              label={user.status === 'active' ? 'Active' : 'Inactive'}
              color={user.status === 'active' ? 'success' : 'default'}
              size="small"
              icon={user.status === 'active' ? <CheckCircle /> : <Cancel />}
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
          <IconButton onClick={handleMenuClick} size="small">
            <MoreVert />
          </IconButton>
        </Box>
        {!isMobile && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Last login: {formatLastLogin(user.last_logged_in || user.updated_at || user.created_at)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

UserCard.displayName = 'UserCard';

// Memoized Table Row Component for desktop view
interface UserTableRowProps {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: string;
    role_display_name?: string;
    status: string;
    is_active: boolean;
    last_logged_in?: string;
    updated_at?: string;
    created_at?: string;
    user_name?: string;
  };
  onMenuClick: (event: React.MouseEvent<HTMLElement>, user: any) => void;
  getRoleColor: (role: string) => any;
  getDisplayName: (role: string) => string;
  formatLastLogin: (date?: string) => string;
  isMobile: boolean;
}

export const UserTableRow = React.memo<UserTableRowProps>(({
  user,
  onMenuClick,
  getRoleColor,
  getDisplayName,
  formatLastLogin,
  isMobile,
}) => {
  const handleMenuClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    onMenuClick(event, user);
  }, [onMenuClick, user]);

  return (
    <TableRow 
      key={user.id}
      sx={{
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        '&:last-child td, &:last-child th': {
          border: 0,
        },
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Avatar sx={{ 
            width: { xs: 32, sm: 40 }, 
            height: { xs: 32, sm: 40 },
            bgcolor: 'primary.main'
          }}>
            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              fontWeight="600"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user.user_name || `${user.first_name} ${user.last_name}`}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user.email}
            </Typography>
            {user.phone && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {user.phone}
              </Typography>
            )}
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={user.role_display_name || getDisplayName(user.role)}
          color={getRoleColor(user.role) as any}
          size="small"
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        />
      </TableCell>
      <TableCell>
        <Chip
          label={user.status === 'active' ? 'Active' : 'Inactive'}
          color={user.status === 'active' ? 'success' : 'default'}
          size="small"
          icon={user.status === 'active' ? <CheckCircle /> : <Cancel />}
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        />
      </TableCell>
      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {formatLastLogin(user.last_logged_in || user.updated_at || user.created_at)}
        </Typography>
      </TableCell>
      <TableCell sx={{ textAlign: 'center' }}>
        <IconButton
          onClick={handleMenuClick}
          size="small"
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'scale(1.1)',
            }
          }}
        >
          <MoreVert />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

UserTableRow.displayName = 'UserTableRow';

// Memoized Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = React.memo<EmptyStateProps>(({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <Box sx={{ 
      textAlign: 'center', 
      py: { xs: 6, sm: 8 }, 
      px: { xs: 2, sm: 3 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 300,
    }}>
      <Box sx={{ mb: 3, opacity: 0.7 }}>
        {icon}
      </Box>
      <Typography 
        variant="h6" 
        fontWeight="600"
        color="text.primary"
        gutterBottom
        sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          mb: 3, 
          maxWidth: 400, 
          mx: 'auto',
          fontSize: { xs: '0.875rem', sm: '1rem' },
          lineHeight: 1.6
        }}
      >
        {description}
      </Typography>
      {action && (
        <Box sx={{ mt: 2 }}>
          {action}
        </Box>
      )}
    </Box>
  );
});

EmptyState.displayName = 'EmptyState';

// Memoized Loading Skeleton for User Row
interface UserRowSkeletonProps {
  isMobile?: boolean;
}

export const UserRowSkeleton = React.memo<UserRowSkeletonProps>(({ isMobile = false }) => {
  return (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              borderRadius: '50%',
              backgroundColor: 'action.hover',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                height: 16,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                mb: 0.5,
                width: '60%',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <Box
              sx={{
                height: 12,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                width: '40%',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Box
          sx={{
            height: 24,
            width: 80,
            backgroundColor: 'action.hover',
            borderRadius: 12,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </TableCell>
      <TableCell>
        <Box
          sx={{
            height: 24,
            width: 70,
            backgroundColor: 'action.hover',
            borderRadius: 12,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </TableCell>
      {!isMobile && (
        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
          <Box
            sx={{
              height: 16,
              width: 100,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </TableCell>
      )}
      <TableCell sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'action.hover',
            mx: 'auto',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </TableCell>
    </TableRow>
  );
});

UserRowSkeleton.displayName = 'UserRowSkeleton';

// Memoized User List Component
interface UserListProps {
  users: UserCardProps['user'][];
  onMenuClick: UserCardProps['onMenuClick'];
  getRoleColor: UserCardProps['getRoleColor'];
  getDisplayName: UserCardProps['getDisplayName'];
  formatLastLogin: UserCardProps['formatLastLogin'];
  isMobile: boolean;
  loading?: boolean;
  emptyStateProps?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

export const UserList = React.memo<UserListProps>(({
  users,
  onMenuClick,
  getRoleColor,
  getDisplayName,
  formatLastLogin,
  isMobile,
  loading = false,
  emptyStateProps,
}) => {
  if (loading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'action.hover',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      height: 16,
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                      mb: 0.5,
                      width: '60%',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <Box
                    sx={{
                      height: 12,
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                      width: '40%',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  if (users.length === 0 && emptyStateProps) {
    return (
      <EmptyState
        icon={<People sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary' }} />}
        title={emptyStateProps.title}
        description={emptyStateProps.description}
        action={emptyStateProps.action}
      />
    );
  }

  return (
    <Stack spacing={2}>
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onMenuClick={onMenuClick}
          getRoleColor={getRoleColor}
          getDisplayName={getDisplayName}
          formatLastLogin={formatLastLogin}
          isMobile={isMobile}
        />
      ))}
    </Stack>
  );
});

UserList.displayName = 'UserList';

export default {
  UserCard,
  UserTableRow,
  EmptyState,
  UserRowSkeleton,
  UserList,
};