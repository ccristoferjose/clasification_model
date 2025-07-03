# Security Setup Guide

## Environment Variables Setup

Create a `.env` file in the root directory with your Firebase configuration:

```env
# Firebase Configuration
# Get these values from Firebase Console > Project Settings > General > Your apps
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id

# Optional: App-specific configuration
VITE_APP_ID=your_actual_app_id
VITE_INITIAL_AUTH_TOKEN=null

# API Configuration (for production)
VITE_API_BASE_URL=http://15.222.200.111:3000
```

## Security Best Practices

✅ **DO:**
- Use environment variables for all sensitive data
- Keep `.env` files local (never commit them)
- Use the `.env.example` pattern for documentation
- Use different configurations for dev/staging/production

❌ **DON'T:**
- Commit credentials files to Git
- Put API keys directly in source code
- Share sensitive environment files
- Use production credentials in development

## Firebase Credentials File

The `firebase_credentials.json` file contains sensitive service account credentials and should NEVER be committed to Git. If you need server-side Firebase access:

1. Keep the file local only
2. Use environment variables in production
3. Set up proper IAM roles in cloud environments
4. Use Firebase Admin SDK environment variables instead

## Deployment Security

For production deployment:
- Use cloud provider secrets management (AWS Secrets Manager, etc.)
- Set environment variables in your deployment platform
- Never include sensitive files in build artifacts
- Use HTTPS for all API communications

## What Was Fixed

1. ✅ Removed `firebase_credentials.json` from Git tracking
2. ✅ Updated `.gitignore` to prevent future commits of sensitive files
3. ✅ Your existing `firebase.js` already uses environment variables correctly
4. ✅ The app will continue working with your local `.env` file 