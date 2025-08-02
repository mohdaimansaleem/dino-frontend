# Configuration Guide

This directory contains all application configuration files.

## Environment Configuration (`env.ts`)

The main configuration file that centralizes all environment variables and settings.

### Chart Configuration

Chart animations and behavior can be configured using environment variables:

```bash
# Chart Animation Settings
REACT_APP_CHART_ANIMATION_INTERVAL=30000    # Animation refresh interval (30 seconds)
REACT_APP_CHART_ANIMATION_DURATION=1000     # Animation duration (1 second)
REACT_APP_CHART_ANIMATION_EASING=easeInOutQuart  # Animation easing
REACT_APP_CHART_ANIMATIONS_ENABLED=true     # Enable/disable animations
REACT_APP_CHART_AUTO_REFRESH_ENABLED=true   # Enable/disable auto-refresh
```

### Default Values

If no environment variables are set, the following defaults are used:

- **Animation Interval**: 30 seconds (30000ms)
- **Animation Duration**: 1 second (1000ms)
- **Animation Easing**: easeInOutQuart
- **Animations Enabled**: true
- **Auto Refresh**: true

### Usage in Components

```typescript
import { config } from '../config/env';

// Access chart configuration
const animationInterval = config.charts.animationInterval;
const animationsEnabled = config.charts.animationsEnabled;
```

### Customization Examples

**Faster animations (15 seconds):**
```bash
REACT_APP_CHART_ANIMATION_INTERVAL=15000
```

**Slower animations (60 seconds):**
```bash
REACT_APP_CHART_ANIMATION_INTERVAL=60000
```

**Disable animations:**
```bash
REACT_APP_CHART_ANIMATIONS_ENABLED=false
```

**Different easing:**
```bash
REACT_APP_CHART_ANIMATION_EASING=easeInOutCubic
```