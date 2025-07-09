# S3 Static Hosting Deployment Guide

This guide explains how to properly deploy your React application to S3 static hosting and fix the routing and API issues.

## Issues Fixed

✅ **API calls now work in production** - Uses direct backend URLs instead of proxy
✅ **Client-side routing fixed** - S3 configured to serve index.html for all routes
✅ **Environment-specific configuration** - Different API endpoints for dev/prod

## 1. Build the Application

```bash
npm run build
```

## 2. S3 Bucket Configuration

### Static Website Hosting
1. Go to your S3 bucket in AWS Console
2. Go to **Properties** tab
3. Scroll down to **Static website hosting**
4. Click **Edit**
5. Enable **Static website hosting**
6. Set:
   - **Index document**: `index.html`
   - **Error document**: `index.html` ⚠️ **IMPORTANT: This fixes React Router**

### Bucket Policy (Make Public)
Add this bucket policy to make your files publicly readable:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

Replace `your-bucket-name` with your actual S3 bucket name.

## 3. Upload Files

Upload all files from the `dist/` folder to your S3 bucket.

### Using AWS CLI:
```bash
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

### Using AWS Console:
1. Go to your S3 bucket
2. Click **Upload**
3. Select all files from the `dist/` folder
4. Upload them

## 4. CORS Configuration (If Needed)

If you experience CORS issues with your API, add this CORS configuration to your S3 bucket:

1. Go to **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Add this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## 5. Backend API Configuration

Your backend server at `http://15.222.200.111:3000` needs to allow CORS from your S3 domain:

```javascript
// In your backend server
app.use(cors({
    origin: [
        'http://localhost:5173', // Development
        'http://clasification-app.s3-website.us-east-2.amazonaws.com', // Production S3
        'https://clasification-app.s3-website.us-east-2.amazonaws.com' // If using HTTPS
    ]
}));
```

## 6. Testing

After deployment, test these scenarios:

1. **Direct URL access**: Visit `http://your-s3-domain.com/login` directly
2. **API calls**: Check browser console for API request errors
3. **Navigation**: Test all internal links and back/forward buttons

## 7. Troubleshooting

### Problem: "404 Not Found" on Direct URLs
**Solution**: Make sure the S3 error document is set to `index.html`

### Problem: API calls return 404
**Solution**: 
- Check if your backend server is running
- Verify CORS configuration on backend
- Check the API base URL in production

### Problem: "Access Denied" errors
**Solution**: 
- Check S3 bucket policy allows public read access
- Verify all files are uploaded correctly

## 8. Environment Variables

Make sure your environment variables are properly configured:

### Development (`.env.local`):
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Production:
The app automatically uses `http://15.222.200.111:3000` in production mode.

## 9. Deployment Script

You can create a deployment script to automate the process:

```bash
#!/bin/bash
# deploy.sh

echo "Building application..."
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://your-bucket-name/ --delete

echo "Deployment complete!"
echo "Visit: http://your-s3-domain.com"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 10. Security Considerations

For production, consider:
- Using CloudFront for HTTPS and caching
- Implementing proper authentication tokens
- Securing your backend API with proper authentication
- Using environment-specific backend URLs

## Summary

The key changes made to fix your issues:

1. **API Configuration**: Created `src/lib/api.js` that uses different URLs for dev/prod
2. **Component Updates**: Updated all components to use the new API utility
3. **S3 Configuration**: Error document set to `index.html` for React Router
4. **Build Optimization**: Improved Vite config for better S3 deployment

Your app should now work correctly on S3 static hosting with proper routing and API calls! 