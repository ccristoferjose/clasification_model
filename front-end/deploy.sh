#!/bin/bash

# S3 deployment script for React app
# Replace 'clasification-app' with your actual S3 bucket name

BUCKET_NAME="clasification-app"
BUILD_DIR="dist"

echo "🚀 Starting deployment to S3..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
fi

# Upload to S3
echo "☁️  Uploading to S3 bucket: $BUCKET_NAME"
aws s3 sync $BUILD_DIR/ s3://$BUCKET_NAME/ --delete

if [ $? -ne 0 ]; then
    echo "❌ Upload failed!"
    exit 1
fi

echo "✅ Deployment complete!"
echo "🌐 Visit: http://$BUCKET_NAME.s3-website.us-east-2.amazonaws.com"
echo ""
echo "📋 Remember to configure:"
echo "   - S3 error document: index.html"
echo "   - Backend CORS for your S3 domain"
echo "   - S3 bucket policy for public access" 