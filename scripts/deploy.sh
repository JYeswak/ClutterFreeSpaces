#!/bin/bash
# ClutterFreeSpaces Production Deployment Script
# Simple helper to prepare for production deployment

echo "🚀 ClutterFreeSpaces Production Deployment Prep"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "api-server.js" ]; then
    echo "❌ Error: api-server.js not found. Run this script from your project root."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: No .env file found"
    echo "   Copy .env.example to .env and configure your environment variables"
    echo ""
    
    read -p "Create .env file from .env.example? (y/n): " create_env
    if [ "$create_env" = "y" ] || [ "$create_env" = "Y" ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your actual values:"
        echo "   - SendGrid_API_Key (required)"
        echo "   - AIRTABLE_API_KEY (optional)"
        echo "   - AIRTABLE_BASE_ID (optional)"
        echo ""
    fi
fi

# Check dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing npm packages..."
    npm install
fi

# Check if PDF exists
if [ ! -f "downloads/rv-organization-checklist.pdf" ]; then
    echo "⚠️  Warning: PDF file not found at downloads/rv-organization-checklist.pdf"
    echo "   This might cause 404 errors for the lead magnet download"
fi

# Test local server
echo ""
echo "🧪 Testing local server..."
echo "   Starting server for 5 seconds to test..."

# Start server in background and capture PID
node api-server.js &
SERVER_PID=$!

# Wait a moment for server to start
sleep 2

# Test health endpoint
if curl -s "http://localhost:3001/health" > /dev/null; then
    echo "✅ Health check passed - server is working locally"
else
    echo "❌ Health check failed - check your configuration"
fi

# Stop the test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "✅ Pre-deployment checks complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub"
echo "2. Go to railway.app and create a new project"
echo "3. Connect your GitHub repository"
echo "4. Add environment variables in Railway dashboard"
echo "5. Deploy!"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo "🧪 See PRODUCTION_TESTING_CHECKLIST.md for testing steps"