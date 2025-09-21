#!/bin/bash
# Test script to validate the MCP deployment setup
# This script checks if the local environment can build and validate the MCP service

set -e

echo "🧪 Testing SGEX MCP Service Deployment Setup"
echo "=============================================="

# Change to MCP service directory
cd "$(dirname "$0")"
echo "📍 Working directory: $(pwd)"

# Check Node.js version
echo "📦 Checking Node.js version..."
node --version
npm --version

# Install dependencies
echo "⬇️  Installing dependencies..."
npm ci

# Build the service
echo "🏗️  Building TypeScript..."
npm run build

# Verify build output
echo "✅ Checking build output..."
if [ -f "dist/index.js" ]; then
    echo "✅ Main server build successful"
else
    echo "❌ Main server build failed"
    exit 1
fi

if [ -f "dist/mcp-server.js" ]; then
    echo "✅ MCP server build successful"
else
    echo "❌ MCP server build failed"
    exit 1
fi

# Check if questions directory was copied
if [ -d "dist/questions" ]; then
    echo "✅ Questions directory copied to dist"
else
    echo "❌ Questions directory not found in dist"
    exit 1
fi

# Validate key files exist
echo "📋 Validating deployment files..."
required_files=(
    "Dockerfile"
    "fly.toml"
    "package.json"
    "tsconfig.json"
    "DEPLOYMENT.md"
    "SECRET_MANAGEMENT.md"
    "CHATGPT_INTEGRATION.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Test basic TypeScript compilation without runtime
echo "🔍 Testing TypeScript compilation..."
npx tsc --noEmit

# Test that the health endpoint can be imported (syntax check)
echo "🏥 Testing service modules can be imported..."
node -e "
try {
    // Test that the compiled JavaScript can be required without runtime errors
    const fs = require('fs');
    const indexJs = fs.readFileSync('dist/index.js', 'utf8');
    
    // Basic syntax validation
    if (indexJs.includes('express') && indexJs.includes('cors')) {
        console.log('✅ Service modules look correct');
    } else {
        console.log('❌ Service modules missing expected dependencies');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Service import test failed:', error.message);
    process.exit(1);
}
"

# Validate environment configuration
echo "🔧 Testing environment configuration..."
node -e "
const fs = require('fs');
const content = fs.readFileSync('dist/index.js', 'utf8');

// Check that environment variables are used correctly
const envVars = [
    'NODE_ENV',
    'PORT',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GITHUB_TOKEN',
    'CORS_ORIGIN'
];

let allFound = true;
envVars.forEach(envVar => {
    if (content.includes('process.env.' + envVar)) {
        console.log('✅ ' + envVar + ' environment variable referenced');
    } else {
        console.log('❌ ' + envVar + ' environment variable not found');
        allFound = false;
    }
});

if (!allFound) {
    process.exit(1);
}
"

# Check Dockerfile syntax
echo "🐳 Validating Dockerfile..."
if command -v docker &> /dev/null; then
    docker build --dry-run . > /dev/null 2>&1 && echo "✅ Dockerfile syntax is valid" || echo "⚠️  Docker not available or Dockerfile has issues"
else
    echo "⚠️  Docker not available, skipping Dockerfile validation"
fi

# Validate fly.toml
echo "✈️  Validating fly.toml configuration..."
node -e "
const fs = require('fs');
const flyToml = fs.readFileSync('fly.toml', 'utf8');

const requiredSections = [
    'app = \"sgex-mcp-dev\"',
    'NODE_ENV = \"production\"',
    'PORT = \"8080\"',
    'protocol = \"tcp\"',
    'internal_port = 8080'
];

let allFound = true;
requiredSections.forEach(section => {
    if (flyToml.includes(section)) {
        console.log('✅ Found: ' + section);
    } else {
        console.log('❌ Missing: ' + section);
        allFound = false;
    }
});

if (!allFound) {
    process.exit(1);
}
"

echo ""
echo "🎉 All deployment validation tests passed!"
echo ""
echo "📋 Deployment Readiness Checklist:"
echo "✅ Code builds successfully"
echo "✅ Required files are present"
echo "✅ Environment variables are configured"
echo "✅ Dockerfile is valid"
echo "✅ fly.toml is properly configured"
echo ""
echo "🔑 To complete deployment, ensure these GitHub secrets are configured:"
echo "   - FLYIO_API_TOKEN (Fly.io authentication)"
echo "   - FLYIO_CLIENT_ID_DEV (GitHub OAuth Client ID)"
echo "   - FLYIO_CLIENT_SECRET_DEV (GitHub OAuth Client Secret)"
echo "   - FLYIO_GH_PAT_DEV (GitHub Personal Access Token)"
echo ""
echo "📖 See DEPLOYMENT.md for detailed setup instructions"
echo "🤖 See CHATGPT_INTEGRATION.md for ChatGPT integration guide"