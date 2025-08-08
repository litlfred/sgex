#!/bin/bash

# Verification script for CSP branch deployment fix
# This script verifies that the CSP changes allow scripts from subpaths

echo "=== CSP Branch Deployment Fix Verification ==="
echo

# Check the source HTML file
echo "1. Checking source public/index.html for CSP directive..."
csp_line=$(grep -o 'script-src[^;]*' public/index.html)
echo "CSP script-src directive: $csp_line"
echo

# Verify domain allows subpaths
if [[ $csp_line == *"https://litlfred.github.io"* ]] && [[ $csp_line != *"https://litlfred.github.io/sgex"* ]]; then
    echo "✅ PASS: CSP allows scripts from entire domain (supports branch deployments)"
else
    echo "❌ FAIL: CSP is too restrictive for branch deployments"
    exit 1
fi

# Check for X-Frame-Options removal
echo "2. Checking for X-Frame-Options meta tag (should be absent)..."
if grep -q "X-Frame-Options" public/index.html; then
    echo "❌ FAIL: X-Frame-Options meta tag still present"
    exit 1
else
    echo "✅ PASS: X-Frame-Options meta tag correctly removed"
fi

# Check built file
echo
echo "3. Checking built index.html..."
if [ -f "build/index.html" ]; then
    built_csp=$(grep -o 'script-src[^;]*' build/index.html)
    echo "Built CSP script-src directive: $built_csp"
    
    if [[ $built_csp == *"https://litlfred.github.io"* ]] && [[ $built_csp != *"https://litlfred.github.io/sgex"* ]]; then
        echo "✅ PASS: Built file has correct CSP for branch deployments"
    else
        echo "❌ FAIL: Built file has incorrect CSP"
        exit 1
    fi
    
    if grep -q "X-Frame-Options" build/index.html; then
        echo "❌ FAIL: Built file still contains X-Frame-Options meta tag"
        exit 1
    else
        echo "✅ PASS: Built file has no X-Frame-Options meta tag"
    fi
else
    echo "⚠️ WARNING: No build/index.html found. Run 'npm run build' first."
fi

echo
echo "=== All checks passed! CSP is configured correctly for branch deployments ==="
echo
echo "Branch deployment URLs that will now work:"
echo "  • https://litlfred.github.io/sgex/ (main deployment)"
echo "  • https://litlfred.github.io/sgex/copilot-fix-665/ (branch deployment)"
echo "  • https://litlfred.github.io/sgex/any-branch-name/ (any branch deployment)"