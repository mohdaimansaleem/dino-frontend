# 🦕 Dino Frontend - Project Standards & Guidelines

## 📋 Table of Contents
- [Overview](#overview)
- [File Naming Conventions](#file-naming-conventions)
- [Code Patterns & Architecture](#code-patterns--architecture)
- [Variable & Function Naming](#variable--function-naming)
- [API Integration Standards](#api-integration-standards)
- [Validation Standards](#validation-standards)
- [UI Component Standards](#ui-component-standards)
- [Feature Flag System](#feature-flag-system)
- [Error Handling](#error-handling)
- [Performance Guidelines](#performance-guidelines)
- [Testing Standards](#testing-standards)
- [Git Workflow](#git-workflow)

## 🎯 Overview

This document establishes coding standards and best practices for the Dino Frontend application to ensure:
- **Consistency** across all code
- **Maintainability** for long-term development
- **Scalability** for future features
- **Performance** optimization
- **Developer Experience** improvement

## 📁 File Naming Conventions

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI atoms (Button, Card, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── forms/          # Form-specific components
│   └── common/         # Shared business logic components
├── features/           # Feature-based modules
│   └── [feature-name]/ # kebab-case feature names
│       ├── components/ # Feature-specific components
│       ├── hooks/      # Feature-specific hooks
│       ├── services/   # Feature-specific services
│       ├── types/      # Feature-specific types
│       └── utils/      # Feature-specific utilities
├── pages/              # Page components
├── services/           # API and business logic services
├── hooks/              # Shared custom hooks
├── contexts/           # React Context providers
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
└── config/             # Configuration files
```

### File Naming Rules

#### ✅ DO
- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`, `MenuItemCard.tsx`)
- **Hooks**: `camelCase.ts` starting with `use` (e.g., `useAuth.ts`, `useMenuData.ts`)
- **Services**: `camelCase.ts` ending with `Service` (e.g., `authService.ts`, `menuService.ts`)
- **Types**: `camelCase.ts` (e.g., `auth.ts`, `menuTypes.ts`)
- **Utils**: `camelCase.ts` (e.g., `formatters.ts`, `validators.ts`)
- **Constants**: `camelCase.ts` (e.g., `apiEndpoints.ts`, `appConstants.ts`)
- **Pages**: `PascalCase.tsx` ending with `Page` (e.g., `HomePage.tsx`, `LoginPage.tsx`)

#### ❌ DON'T
- Versioned names: `ComponentV2.tsx`, `serviceV1.ts`
- Ambiguous prefixes: `EnhancedButton.tsx`, `ImprovedCard.tsx`
- Abbreviations: `UsrMgmt.tsx`, `MenuItm.tsx`
- Special characters: `user-profile.tsx`, `menu_item.tsx` (except kebab-case for directories)

### Index Files
- Use `index.ts` for barrel exports
- Keep exports organized and documented
```typescript
// ✅ Good index.ts
export { Button } from './Button';
export { Card } from './Card';
export { LoadingSpinner } from './LoadingSpinner';
export type { ButtonProps, CardProps } from './types';
```

## 🏗️ Code Patterns & Architecture

### Component Architecture
Follow **Atomic Design** principles:

#### Atoms (Basic UI Elements)
```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Implementation
};
```

#### Molecules (Component Combinations)
```typescript
// src/components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
```

#### Organisms (Complex Components)
```typescript
// src/components/layout/AppHeader.tsx
// Complex components with multiple molecules
```

### SOLID Principles Implementation

#### Single Responsibility Principle
```typescript
// ✅ Good - Single responsibility
export const useAuth = () => {
  // Only handles authentication logic
};

export const useUserProfile = () => {
  // Only handles user profile logic
};

// ❌ Bad - Multiple responsibilities
export const useAuthAndProfile = () => {
  // Handles both auth and profile - violates SRP
};
```

#### Open/Closed Principle
```typescript
// ✅ Good - Extensible through props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  // Extensible without modifying component
}
```

#### Dependency Inversion
```typescript
// ✅ Good - Depends on abstractions
interface ApiService {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
}

export const useApiData = (apiService: ApiService) => {
  // Depends on interface, not concrete implementation
};
```

### Feature Flag Pattern
```typescript
// src/hooks/useFeatureFlag.ts
export const useFeatureFlag = (flagName: string): boolean => {
  return config.featureFlags[flagName] || false;
};

// Usage in components
const MyComponent = () => {
  const isNewFeatureEnabled = useFeatureFlag('newFeature');
  
  return (
    <div>
      {isNewFeatureEnabled && <NewFeature />}
      <ExistingFeature />
    </div>
  );
};
```

## 🏷️ Variable & Function Naming

### Variables
```typescript
// ✅ Good
const userProfile = getUserProfile();
const isLoading = false;
const menuItems = getMenuItems();
const hasPermission = checkPermission();

// ❌ Bad
const data = getUserProfile();
const flag = false;
const items = getMenuItems();
const check = checkPermission();
```

### Functions
```typescript
// ✅ Good - Descriptive and action-oriented
const validateEmailFormat = (email: string): boolean => { };
const fetchUserProfile = async (userId: string): Promise<User> => { };
const handleSubmitForm = (formData: FormData): void => { };

// ❌ Bad - Vague or unclear
const validate = (input: string): boolean => { };
const getData = async (id: string): Promise<any> => { };
const submit = (data: any): void => { };
```

### Constants
```typescript
// ✅ Good - SCREAMING_SNAKE_CASE for constants
export const API_ENDPOINTS = {
  USERS: '/api/v1/users',
  MENU_ITEMS: '/api/v1/menu-items',
} as const;

export const VALIDATION_RULES = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 8,
} as const;
```

### Boolean Variables
```typescript
// ✅ Good - Use is/has/can/should prefixes
const isVisible = true;
const hasPermission = false;
const canEdit = true;
const shouldValidate = false;

// ❌ Bad - Unclear boolean intent
const visible = true;
const permission = false;
const edit = true;
```

## 🌐 API Integration Standards

### Service Layer Pattern
```typescript
// src/services/userService.ts
class UserService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getUser(id: string): Promise<User> {
    try {
      const response = await this.apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new ApiError('Failed to fetch user', error);
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await this.apiClient.put<User>(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new ApiError('Failed to update user', error);
    }
  }
}

export const userService = new UserService(apiClient);
```

### API Response Handling
```typescript
// Standard API response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Error handling pattern
const handleApiCall = async <T>(
  apiCall: () => Promise<ApiResponse<T>>
): Promise<T> => {
  try {
    const response = await apiCall();
    
    if (!response.success) {
      throw new ApiError(response.message || 'API call failed', response.errors);
    }
    
    return response.data!;
  } catch (error) {
    logger.error('API call failed:', error);
    throw error;
  }
};
```

### Request/Response Types
```typescript
// ✅ Good - Specific types for requests and responses
interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface CreateUserResponse {
  user: User;
  token: string;
}

// ❌ Bad - Generic or unclear types
interface UserData {
  [key: string]: any;
}
```

## ✅ Validation Standards

### Centralized Validation System
```typescript
// src/utils/validation/validators.ts
export const validators = {
  email: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: 'Email is required' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true };
  },

  phone: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: 'Phone number is required' };
    if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
      return { isValid: false, error: 'Phone number must be 10 digits' };
    }
    return { isValid: true };
  },

  password: (value: string): ValidationResult => {
    if (!value) return { isValid: false, error: 'Password is required' };
    if (value.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return { isValid: false, error: 'Password must contain uppercase, lowercase, and number' };
    }
    return { isValid: true };
  },

  required: (fieldName: string) => (value: any): ValidationResult => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  },

  minLength: (min: number, fieldName: string) => (value: string): ValidationResult => {
    if (value && value.length < min) {
      return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
    }
    return { isValid: true };
  },

  maxLength: (max: number, fieldName: string) => (value: string): ValidationResult => {
    if (value && value.length > max) {
      return { isValid: false, error: `${fieldName} must not exceed ${max} characters` };
    }
    return { isValid: true };
  },
};

interface ValidationResult {
  isValid: boolean;
  error?: string;
}
```

### Form Validation Hook
```typescript
// src/hooks/useFormValidation.ts
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = (field: keyof T, value: any): string | undefined => {
    const rules = validationRules[field];
    if (!rules) return undefined;

    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        return result.error;
      }
    }
    return undefined;
  };

  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const field in validationRules) {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>));

    return isValid;
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    isValid: Object.keys(errors).length === 0,
  };
};
```

### Validation Usage Example
```typescript
// Usage in components
const UserForm = () => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    isValid
  } = useFormValidation(
    { email: '', password: '', firstName: '' },
    {
      email: [validators.required('Email'), validators.email],
      password: [validators.required('Password'), validators.password],
      firstName: [validators.required('First Name'), validators.minLength(2, 'First Name')],
    }
  );

  const handleSubmit = () => {
    if (validateAll()) {
      // Submit form
    }
  };

  return (
    <form>
      <TextField
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
        error={touched.email && !!errors.email}
        helperText={touched.email && errors.email}
      />
      {/* Other fields */}
    </form>
  );
};
```

## 🎨 UI Component Standards

### Component Props Interface
```typescript
// ✅ Good - Well-defined props with defaults
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  onClick,
  children,
  className,
  'data-testid': testId,
  ...rest
}) => {
  // Implementation
};
```

### Consistent Styling Approach
```typescript
// Use theme-based styling
const useButtonStyles = (variant: string, size: string) => {
  const theme = useTheme();
  
  return {
    root: {
      borderRadius: theme.shape.borderRadius,
      fontWeight: theme.typography.fontWeightMedium,
      textTransform: 'none' as const,
      transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color']),
      
      // Variant styles
      ...(variant === 'primary' && {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      }),
      
      // Size styles
      ...(size === 'small' && {
        padding: theme.spacing(0.5, 1),
        fontSize: theme.typography.pxToRem(13),
      }),
    },
  };
};
```

### Error Boundary Pattern
```typescript
// src/components/common/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean; error?: Error }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    logger.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}
```

## 🚩 Feature Flag System

### Environment-Based Configuration
```typescript
// src/config/featureFlags.ts
interface FeatureFlags {
  newDashboard: boolean;
  advancedAnalytics: boolean;
  betaFeatures: boolean;
  experimentalUI: boolean;
  debugMode: boolean;
}

export const getFeatureFlags = (): FeatureFlags => ({
  newDashboard: process.env.REACT_APP_FEATURE_NEW_DASHBOARD === 'true',
  advancedAnalytics: process.env.REACT_APP_FEATURE_ADVANCED_ANALYTICS === 'true',
  betaFeatures: process.env.REACT_APP_FEATURE_BETA === 'true',
  experimentalUI: process.env.REACT_APP_FEATURE_EXPERIMENTAL_UI === 'true',
  debugMode: process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true',
});

// Hook for feature flags
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags();
  return flags[flag];
};
```

### Feature Flag Component
```typescript
// src/components/common/FeatureFlag.tsx
interface FeatureFlagProps {
  flag: keyof FeatureFlags;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flag,
  fallback = null,
  children
}) => {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

// Usage
<FeatureFlag flag="newDashboard" fallback={<OldDashboard />}>
  <NewDashboard />
</FeatureFlag>
```

## 🚨 Error Handling

### Standardized Error Types
```typescript
// src/types/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number, details?: any) {
    super(message, 'API_ERROR', statusCode, details);
    this.name = 'ApiError';
  }
}
```

### Error Handling Hook
```typescript
// src/hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const showToast = useToast();

  const handleError = useCallback((error: Error | AppError) => {
    logger.error('Error occurred:', error);

    if (error instanceof ValidationError) {
      showToast(error.message, 'error');
    } else if (error instanceof ApiError) {
      showToast(error.message || 'An API error occurred', 'error');
    } else {
      showToast('An unexpected error occurred', 'error');
    }
  }, [showToast]);

  return { handleError };
};
```

## ⚡ Performance Guidelines

### Code Splitting
```typescript
// Lazy load components
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

### Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Memoize components
export const MemoizedComponent = React.memo(Component);
```

### Bundle Optimization
```typescript
// Tree-shakable imports
import { Button } from '@mui/material/Button';
// Instead of: import { Button } from '@mui/material';

// Dynamic imports for large libraries
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

## 🧪 Testing Standards

### Component Testing
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should login user successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

## 🔄 Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `refactor/component-name` - Code refactoring
- `docs/update-readme` - Documentation updates

### Commit Messages
```
type(scope): description

feat(auth): add password reset functionality
fix(validation): correct email validation regex
refactor(components): standardize button component
docs(readme): update installation instructions
test(hooks): add tests for useAuth hook
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
```

---

## 📚 Additional Resources

- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)
- [Material-UI Customization Guide](https://mui.com/customization/theming/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)

---

**Last Updated**: October 2024  
**Version**: 1.0.0  
**Maintainer**: Dino Development Team