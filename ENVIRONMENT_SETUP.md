# Environment Configuration Guide

This guide explains how to manage different environments (development and production) for the Deep Cleaning Hub project.

## Environment URLs

### Development Environment
- **API Base URL**: `http://192.168.29.112:5001/api`
- **Health Check**: `http://192.168.29.112:5001/health`
- **Environment**: `development`

### Production Environment
- **API Base URL**: `http://13.211.76.43:5001/api`
- **Health Check**: `http://13.211.76.43:5001/health`
- **Environment**: `production`

## Quick Environment Switching

Use the provided script to quickly switch between environments:

```bash
# Switch to development environment
node switch-env.js development

# Switch to production environment
node switch-env.js production
```

This script will:
1. Create `.env` files in all project directories
2. Set the appropriate environment variables
3. Configure API URLs for the selected environment

## Manual Environment Configuration

### Backend Configuration

The backend automatically detects the environment based on `NODE_ENV`:

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

### Frontend Configuration

Frontend apps use `EXPO_PUBLIC_ENVIRONMENT` to determine the environment:

```bash
# Development
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_API_BASE_URL=http://192.168.29.112:5001/api

# Production
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_API_BASE_URL=http://13.211.76.43:5001/api
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
API_BASE_URL=http://192.168.29.112:5001/api
```

### Frontend (.env)
```
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_API_BASE_URL=http://192.168.29.112:5001/api
```

## How It Works

1. **Backend**: Reads `NODE_ENV` and automatically configures API URLs and CORS origins
2. **Admin App**: Uses `EXPO_PUBLIC_ENVIRONMENT` to determine which API URL to use
3. **Shared Apps**: Use the environment configuration system to automatically switch URLs
4. **CORS**: Backend automatically allows the correct origins based on environment

## Testing Environment Switching

1. **Switch to development**:
   ```bash
   node switch-env.js development
   npm run start:dev  # or your development start command
   ```

2. **Switch to production**:
   ```bash
   node switch-env.js production
   npm run start:prod  # or your production start command
   ```

3. **Verify the switch**:
   - Check backend logs for the correct API URL
   - Check frontend console logs for environment configuration
   - Test API calls to ensure they're going to the correct server

## Troubleshooting

### Backend not switching environments
- Ensure `NODE_ENV` is set correctly
- Restart the backend server after changing environment variables

### Frontend not switching environments
- Ensure `EXPO_PUBLIC_ENVIRONMENT` is set correctly
- Clear Expo cache: `expo start -c`
- Restart the frontend apps

### CORS issues
- Check that the backend is allowing the correct origins for your environment
- Verify the IP addresses match between frontend and backend configurations

## Files Modified

- `backend/src/server.js` - Environment-based configuration
- `admin-app/src/config/environment.ts` - Environment detection
- `shared/src/config/environment.ts` - Environment-based API URLs
- `shared/shared/src/config/environment.ts` - Environment-based API URLs
- `switch-env.js` - Environment switching script
