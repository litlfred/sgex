#!/bin/bash

# Security Headers Verification Script
# This script verifies that all required security headers are properly implemented

set -e

echo "🔒 SGeX Workbench Security Headers Verification"
echo "=============================================="
echo

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a file contains a security header
check_header() {
    local file="$1"
    local header="$2"
    local description="$3"
    
    if [ -f "$file" ]; then
        if grep -q "$header" "$file"; then
            echo -e "✅ ${GREEN}$description${NC} found in $file"
            return 0
        else
            echo -e "❌ ${RED}$description${NC} missing in $file"
            return 1
        fi
    else
        echo -e "⚠️  ${YELLOW}File $file not found${NC}"
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || ! grep -q "sgex-workbench" package.json; then
    echo -e "❌ ${RED}This script must be run from the SGeX Workbench root directory${NC}"
    exit 1
fi

echo "📁 Checking source files..."
echo

# Check public/index.html
echo "🔍 Checking public/index.html:"
check_header "public/index.html" "Content-Security-Policy" "Content Security Policy"
check_header "public/index.html" "X-Frame-Options" "X-Frame-Options"
check_header "public/index.html" "X-Content-Type-Options" "X-Content-Type-Options"
check_header "public/index.html" "referrer" "Referrer Policy"
check_header "public/index.html" "Permissions-Policy" "Permissions Policy"

echo

# Check if build directory exists and verify built files
if [ -d "build" ]; then
    echo "📦 Checking built files..."
    echo
    
    echo "🔍 Checking build/index.html:"
    check_header "build/index.html" "Content-Security-Policy" "Content Security Policy"
    check_header "build/index.html" "X-Frame-Options" "X-Frame-Options"
    check_header "build/index.html" "X-Content-Type-Options" "X-Content-Type-Options"
    check_header "build/index.html" "referrer" "Referrer Policy"
    check_header "build/index.html" "Permissions-Policy" "Permissions Policy"
else
    echo -e "⚠️  ${YELLOW}Build directory not found. Run 'npm run build' to create built files.${NC}"
fi

echo
echo "🔧 Checking GitHub Actions workflow configuration..."

# Check if CI=false is set in the workflow
if check_header ".github/workflows/landing-page-deployment.yml" "CI=false" "CI=false setting"; then
    echo "✅ GitHub Actions workflow properly configured to avoid CSS warnings as errors"
else
    echo -e "⚠️  ${YELLOW}CI=false setting not found in GitHub Actions workflow${NC}"
fi

echo
echo "📚 Checking documentation..."
check_header "public/docs/security-headers.md" "Security Headers Implementation" "Security documentation"

echo
echo "🎯 Security Headers Summary:"
echo "=============================="
echo "✅ Content Security Policy (CSP) - Prevents code injection attacks"
echo "✅ X-Frame-Options - Prevents clickjacking attacks"
echo "✅ X-Content-Type-Options - Prevents MIME sniffing attacks"
echo "✅ Referrer Policy - Controls referrer information leakage"
echo "✅ Permissions Policy - Restricts browser features"
echo
echo "🌐 Allowed External Domains:"
echo "• api.github.com (GitHub REST API)"
echo "• github.com (GitHub web interface)"
echo "• avatars.githubusercontent.com (User avatars)"
echo "• raw.githubusercontent.com (Raw file access)"
echo "• iris.who.int (WHO Digital Library)"
echo "• unpkg.com (React CDN resources if needed)"
echo
echo "📝 Notes:"
echo "• Headers are implemented via HTML meta tags due to GitHub Pages limitations"
echo "• HTTPS enforcement is automatically provided by GitHub Pages"
echo "• Some CSP restrictions (unsafe-inline, unsafe-eval) are required for React"
echo
echo -e "🎉 ${GREEN}Security headers verification completed!${NC}"
echo
echo "To test the implementation locally:"
echo "1. Run: npm run build"
echo "2. Run: cd build && python3 -m http.server 8080"
echo "3. Open: http://localhost:8080"
echo "4. Check browser Developer Tools → Security tab"