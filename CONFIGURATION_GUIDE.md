# 🔧 Dino Frontend Configuration Management Guide

## 📋 Overview

The Dino frontend uses a sophisticated configuration system that automatically handles development and production environments with proper separation of concerns.

## 🎯 Single Point of Control

### For Production Deployments (GitHub → Cloud Run)

**✅ ONLY EDIT: `cloudbuild.yaml` lines 36-66**

All production configuration is controlled through Cloud Build environment variables. When you push to GitHub, Cloud Build will:
1. Build the Docker container
2. Deploy to Cloud Run with your specified environment variables
3. Container startup will generate runtime configuration from these variables

## 🔧 Common Configuration Changes

### 1. Enable/Disable Theme Toggle

**In `cloudbuild.yaml`:**
```yaml
'--set-env-vars', 'ENABLE_THEME_TOGGLE=true',  # Enable
'--set-env-vars', 'ENABLE_THEME_TOGGLE=false', # Disable
```

### 2. Change Backend URL

**In `cloudbuild.yaml`:**
```yaml
'--set-env-vars', 'BACKEND_URL=https://your-backend-url.com',
```

### 3. Enable Debug Mode

**In `cloudbuild.yaml`:**
```yaml
'--set-env-vars', 'DEBUG_MODE=true',
```

### 4. Configure Feature Flags

**In `cloudbuild.yaml`:**
```yaml
'--set-env-vars', 'ENABLE_ANALYTICS=true',
'--set-env-vars', 'ENABLE_QR_CODES=true',
'--set-env-vars', 'ENABLE_NOTIFICATIONS=true',
'--set-env-vars', 'ENABLE_DEMO_MODE=false',
```

## 🏗️ How the System Works

### Development Environment
```
.env.local → .env → src/config/runtime.ts → React App
```

- Edit `.env.local` for local development changes
- `public/config.js` detects localhost and doesn't override
- React reads from `process.env.REACT_APP_*` variables

### Production Environment
```
cloudbuild.yaml → Cloud Run Env Vars → generate-config.sh → public/config.js → React App
```

- Edit `cloudbuild.yaml` for production changes
- Container startup generates `public/config.js` from environment variables
- React reads from `window.APP_CONFIG` (highest priority)

## 📁 File Responsibilities

| File | Purpose | When to Edit |
|------|---------|--------------|
| `cloudbuild.yaml` | **Production config** | ✅ Edit for production changes |
| `.env.local` | **Local development** | ✅ Edit for local development |
| `.env` | **Development defaults** | ⚠️ Rarely edit |
| `public/config.js` | **Development fallback** | ❌ Never edit (auto-managed) |
| `src/config/runtime.ts` | **Config loader** | ❌ Never edit (system file) |

## 🚀 Deployment Process

### 1. Make Configuration Changes
Edit `cloudbuild.yaml` with your desired settings:

```yaml
'--set-env-vars', 'BACKEND_URL=https://new-backend.com',
'--set-env-vars', 'ENABLE_THEME_TOGGLE=true',
'--set-env-vars', 'DEBUG_MODE=false',
```

### 2. Commit and Push
```bash
git add cloudbuild.yaml
git commit -m "Update production configuration"
git push origin main
```

### 3. Automatic Deployment
- GitHub triggers Cloud Build
- Cloud Build builds and deploys with new configuration
- New configuration is live immediately

## 🔍 Debugging Configuration

### Check Current Production Config
Visit your deployed app and open browser console:
```javascript
console.log(window.APP_CONFIG);
```

### Debug Endpoints
- **Config file**: `https://your-app.com/config.js`
- **Health check**: `https://your-app.com/health`
- **Environment info**: `https://your-app.com/debug/env`

### Check Container Logs
```bash
gcloud logs read --service=dino-frontend --limit=50
```

## 🌐 Nginx API Proxying

### Already Configured ✅
Your nginx is already set up to:
- Proxy `/api/*` requests to your backend
- Handle CORS headers automatically
- Support WebSocket connections at `/ws`
- Use `BACKEND_URL` environment variable

### Backend URL Configuration
The nginx configuration automatically uses the `BACKEND_URL` environment variable:
```nginx
location /api/ {
  set $backend_url "${BACKEND_URL}";
  proxy_pass $backend_url;
  # ... CORS and other headers
}
```

## 📊 Available Configuration Options

### API Configuration
- `API_BASE_URL` - Frontend API base path (default: `/api/v1`)
- `WS_URL` - WebSocket path (default: `/ws`)
- `BACKEND_URL` - Backend server URL for nginx proxy
- `API_TIMEOUT` - Request timeout in milliseconds
- `API_RATE_LIMIT` - Requests per minute limit

### Feature Flags
- `ENABLE_THEME_TOGGLE` - Show/hide theme switcher
- `ENABLE_DEMO_MODE` - Enable demo login
- `ENABLE_ANALYTICS` - Enable analytics tracking
- `ENABLE_QR_CODES` - Enable QR code features
- `ENABLE_NOTIFICATIONS` - Enable notifications
- `ENABLE_I18N` - Enable internationalization
- `ENABLE_ANIMATIONS` - Enable UI animations

### App Settings
- `APP_NAME` - Application display name
- `APP_VERSION` - Application version
- `APP_ENV` - Environment (development/staging/production)
- `DEBUG_MODE` - Enable debug logging

### Authentication
- `JWT_EXPIRY_HOURS` - Token expiry time
- `SESSION_TIMEOUT_MINUTES` - Session timeout
- `MIN_PASSWORD_LENGTH` - Password requirements

### UI Configuration
- `DEFAULT_THEME` - Default theme (light/dark)
- `CHART_ANIMATION_INTERVAL` - Chart refresh interval
- `CHART_ANIMATIONS_ENABLED` - Enable chart animations

## ⚠️ Important Notes

1. **Never edit `public/config.js` directly** - it's auto-generated
2. **Always test locally first** using `.env.local`
3. **Production changes require deployment** - no hot-swapping
4. **Environment variables are case-sensitive**
5. **Boolean values must be strings**: `'true'` or `'false'`

## 🆘 Troubleshooting

### Theme Toggle Not Showing
Check `cloudbuild.yaml`:
```yaml
'--set-env-vars', 'ENABLE_THEME_TOGGLE=true',
```

### API Calls Failing
1. Check `BACKEND_URL` in `cloudbuild.yaml`
2. Verify backend is accessible
3. Check nginx logs for proxy errors

### Configuration Not Updating
1. Verify `cloudbuild.yaml` syntax
2. Check Cloud Build logs
3. Confirm deployment completed successfully
4. Clear browser cache

## 📞 Quick Reference

| Need to... | Edit this file... | Then... |
|------------|-------------------|---------|
| Change production config | `cloudbuild.yaml` | Commit & push |
| Test locally | `.env.local` | Restart dev server |
| Debug config | Browser console | Check `window.APP_CONFIG` |
| View logs | Cloud Console | Check Cloud Run logs |

---

**🎯 Remember: `cloudbuild.yaml` is your single source of truth for production configuration!**