# Environment Configuration Guide

This guide explains how to configure environment variables for the Dino E-Menu application.

## Quick Start

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your specific configuration values.

3. **Restart the development server** for changes to take effect:
   ```bash
   npm start
   ```

## Environment Files

| File | Purpose | Tracked in Git |
|------|---------|----------------|
| `.env` | Default configuration with safe values | ✅ Yes |
| `.env.example` | Template showing all available options | ✅ Yes |
| `.env.local` | Local development overrides | ❌ No |
| `.env.production` | Production-specific values | ❌ No |
| `.env.staging` | Staging-specific values | ❌ No |

## Feature Flags

Feature flags allow you to enable/disable specific functionality without code changes.

### Theme Toggle Feature

Controls whether the dark/light mode toggle button is visible in the UI.

```bash
# Show theme toggle button (default)
REACT_APP_ENABLE_THEME_TOGGLE=true

# Hide theme toggle button
REACT_APP_ENABLE_THEME_TOGGLE=false
```

**Usage in Components:**
```tsx
import { useFeatureFlag } from '../hooks/useFeatureFlag';

const MyComponent = () => {
  const isThemeToggleEnabled = useFeatureFlag('themeToggle');
  
  return (
    <div>
      {isThemeToggleEnabled && <ThemeToggle />}
    </div>
  );
};
```

### Other Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `REACT_APP_ENABLE_DEMO_MODE` | Enables demo login functionality | `true` |
| `REACT_APP_ENABLE_ANALYTICS` | Enables analytics and reporting features | `false` |
| `REACT_APP_ENABLE_QR_CODES` | Enables QR code generation | `true` |
| `REACT_APP_ENABLE_NOTIFICATIONS` | Enables real-time notifications | `true` |
| `REACT_APP_ENABLE_I18N` | Enables multi-language support | `false` |

## Configuration Categories

### Application Settings
```bash
REACT_APP_ENV=development          # Environment: development, staging, production
REACT_APP_NAME=Dino E-Menu         # Application name
REACT_APP_VERSION=1.0.0            # Application version
REACT_APP_DEBUG_MODE=false         # Enable debug logging
```

### API Configuration
```bash
REACT_APP_API_BASE_URL=http://localhost:8080/api  # Backend API URL
REACT_APP_API_TIMEOUT=30000                       # Request timeout (ms)
REACT_APP_API_RATE_LIMIT=100                      # Requests per minute
```

### Authentication & Security
```bash
REACT_APP_JWT_EXPIRY_HOURS=24           # JWT token expiry
REACT_APP_SESSION_TIMEOUT_MINUTES=60    # Session timeout
REACT_APP_MIN_PASSWORD_LENGTH=8         # Minimum password length
```

### Third-party Services
```bash
# Google Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=

# Stripe Payments
REACT_APP_STRIPE_PUBLIC_KEY=

# Error Tracking
REACT_APP_SENTRY_DSN=

# Firebase (for real-time features)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
```

### UI/UX Settings
```bash
REACT_APP_DEFAULT_THEME=light      # Default theme: light, dark, system
REACT_APP_ENABLE_ANIMATIONS=true   # Enable UI animations
```

## Using Configuration in Code

### Import Configuration
```tsx
import { config } from '../config/env';

// Access configuration values
const apiUrl = config.api.baseUrl;
const isDebugMode = config.app.debugMode;
```

### Use Feature Flags
```tsx
import { useFeatureFlag, useFeatureFlags } from '../hooks/useFeatureFlag';

// Single feature flag
const isAnalyticsEnabled = useFeatureFlag('analytics');

// Multiple feature flags
const features = useFeatureFlags(['themeToggle', 'qrCodes', 'notifications']);
```

### Check Environment
```tsx
import { useIsDevelopment, useIsProduction } from '../hooks/useFeatureFlag';

const isDev = useIsDevelopment();
const isProd = useIsProduction();
```

## Environment-Specific Setup

### Development
```bash
REACT_APP_ENV=development
REACT_APP_DEBUG_MODE=true
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ENABLE_THEME_TOGGLE=true
```

### Staging
```bash
REACT_APP_ENV=staging
REACT_APP_DEBUG_MODE=false
REACT_APP_API_BASE_URL=https://staging-api.dinoemenu.com
REACT_APP_ENABLE_THEME_TOGGLE=true
```

### Production
```bash
REACT_APP_ENV=production
REACT_APP_DEBUG_MODE=false
REACT_APP_API_BASE_URL=https://api.dinoemenu.com
REACT_APP_ENABLE_THEME_TOGGLE=false  # Hide in production if desired
```

## Best Practices

### Security
- ✅ Never commit sensitive values like API keys to git
- ✅ Use `.env.local` for local development secrets
- ✅ Set production values in your hosting platform
- ❌ Don't put sensitive data in `.env` (it's tracked in git)

### Organization
- ✅ Group related variables together
- ✅ Use descriptive variable names
- ✅ Add comments explaining what each variable does
- ✅ Provide sensible defaults

### Development
- ✅ Restart the dev server after changing environment variables
- ✅ Use TypeScript for type-safe configuration access
- ✅ Validate configuration on app startup
- ✅ Log warnings for missing required values

## Troubleshooting

### Environment Variables Not Working
1. **Check the variable name** - Must start with `REACT_APP_`
2. **Restart the development server** - Changes require a restart
3. **Check for typos** - Variable names are case-sensitive
4. **Verify the file location** - Should be in the project root

### Feature Not Showing/Hiding
1. **Check the feature flag value** - Must be exactly `true` or `false`
2. **Clear browser cache** - Old cached values might persist
3. **Check component implementation** - Ensure feature flag is properly used

### Configuration Not Loading
1. **Check file permissions** - Ensure `.env` file is readable
2. **Verify file encoding** - Should be UTF-8
3. **Check for syntax errors** - No spaces around `=` sign

## Examples

### Hide Theme Toggle in Production
```bash
# .env.production
REACT_APP_ENABLE_THEME_TOGGLE=false
```

### Enable All Features for Development
```bash
# .env.local
REACT_APP_ENABLE_THEME_TOGGLE=true
REACT_APP_ENABLE_DEMO_MODE=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_QR_CODES=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_I18N=true
```

### Minimal Production Configuration
```bash
# .env.production
REACT_APP_ENV=production
REACT_APP_API_BASE_URL=https://api.dinoemenu.com
REACT_APP_ENABLE_THEME_TOGGLE=false
REACT_APP_ENABLE_DEMO_MODE=false
REACT_APP_DEBUG_MODE=false
```