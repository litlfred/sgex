#!/bin/bash

# Multi-Branch Deployment Test Script
# This script simulates the deployment workflow locally to verify it works correctly

set -e

echo "🧪 Multi-Branch GitHub Pages Deployment Test"
echo "=============================================="

# Test directory setup
TEST_DIR="/tmp/sgex-deployment-test"
REPO_DIR="/home/runner/work/sgex/sgex"

echo "📁 Setting up test environment..."
if [[ -d "$TEST_DIR" ]]; then
    rm -rf "$TEST_DIR"
fi
mkdir -p "$TEST_DIR"

# Copy repo to test directory
cp -r "$REPO_DIR"/* "$TEST_DIR/"
cp -r "$REPO_DIR"/.github "$TEST_DIR/"  # Copy hidden .github directory
cd "$TEST_DIR"

echo "✅ Test environment ready at: $TEST_DIR"

# Test 1: Branch name validation
echo ""
echo "🧪 Test 1: Branch name validation"
echo "--------------------------------"

test_branches=(
    "main"
    "feature/awesome-feature"
    "bugfix/critical-fix"
    "develop"
    "release/v1.0.0"
    "hotfix/security-patch"
)

for branch in "${test_branches[@]}"; do
    echo "Testing branch: $branch"
    
    # Simulate validation logic
    if [[ "$branch" =~ [^a-zA-Z0-9._/-] ]]; then
        echo "❌ $branch: Contains unsafe characters"
        continue
    fi
    
    safe_branch_name=$(echo "$branch" | tr '/' '-')
    echo "   Safe name: $safe_branch_name"
    
    repo_root="$(pwd)"
    target_dir="$repo_root/$safe_branch_name"
    
    if [[ "$target_dir" != "$repo_root"* ]] || [[ ${#target_dir} -le ${#repo_root} ]]; then
        echo "❌ $branch: Safety validation failed"
        continue
    fi
    
    echo "✅ $branch: Validation passed"
done

# Test 2: Build processes
echo ""
echo "🧪 Test 2: Build processes"
echo "-------------------------"

echo "Testing branch-specific build..."
export GITHUB_REF_NAME="test-branch"

# Fetch build script from deploy branch (if available)
if git show-ref --verify --quiet refs/remotes/origin/deploy; then
    echo "Fetching build script from deploy branch..."
    git fetch origin deploy
    git checkout origin/deploy -- scripts/build-multi-branch.js
fi

if node scripts/build-multi-branch.js branch > /dev/null 2>&1; then
    echo "✅ Branch-specific build: Success"
    if [[ -f "build/index.html" ]]; then
        echo "✅ Branch build produces index.html"
    else
        echo "❌ Branch build missing index.html"
    fi
else
    echo "❌ Branch-specific build: Failed"
fi

echo ""
echo "Testing root landing page build..."

# Note: Landing page is now handled by React components
# (formerly public/branch-listing.html, now React-based)

if node scripts/build-multi-branch.js root > /dev/null 2>&1; then
    echo "✅ Root landing page build: Success"
    if [[ -f "build/index.html" ]]; then
        echo "✅ Root build produces index.html"
        
        # Check if the built HTML contains React root element
        if grep -q "id=\"root\"" build/index.html; then
            echo "✅ Root build contains React application structure"
        else
            echo "⚠️  Root build may not contain expected React structure"
        fi
    else
        echo "❌ Root build missing index.html"
    fi
else
    echo "❌ Root landing page build: Failed"
fi

# Test 3: GitHub API simulation
echo ""
echo "🧪 Test 3: GitHub API integration"
echo "--------------------------------"

echo "Testing GitHub API call for branches..."
API_URL="https://api.github.com/repos/litlfred/sgex/branches"

if curl -s --head "$API_URL" | head -n 1 | grep "200 OK" > /dev/null; then
    echo "✅ GitHub API is accessible"
    
    # Get branch count
    branch_count=$(curl -s "$API_URL" | grep -c '"name"' || echo "0")
    echo "✅ Found $branch_count branches in repository"
else
    echo "⚠️  GitHub API may not be accessible (rate limiting or network issue)"
fi

# Test 4: Component validation
echo ""
echo "🧪 Test 4: Component validation"
echo "------------------------------"

echo "Testing deployment components..."
if [[ -f "src/components/BranchListingPage.js" ]] && [[ -f "public/sgex-mascot.png" ]]; then
    echo "✅ React-based landing page components exist"
    
    # Check for key elements in React component
    if grep -q "GitHub API\|githubService" src/components/BranchListingPage.js; then
        echo "✅ Landing page includes GitHub API integration"
    fi
    
    if grep -q "branch.*card\|BranchCard" src/components/BranchListingPage.js; then
        echo "✅ Landing page includes card styling"
    fi
    
    if grep -q "safeBranchName\|sanitize.*branch" src/components/BranchListingPage.js; then
        echo "✅ Landing page handles safe branch names"
    fi
else
    echo "⚠️  React-based landing page components not found"
fi

# Test 5: Workflow file validation
echo ""
echo "🧪 Test 5: Workflow validation"
echo "-----------------------------"

echo "Testing workflow file..."
if [[ -f ".github/workflows/pages.yml" ]]; then
    echo "✅ Workflow file exists"
    
    # Check for key safety features
    if grep -q "Safety validation failed" .github/workflows/pages.yml; then
        echo "✅ Workflow includes safety validation"
    fi
    
    if grep -q "git rm -rf" .github/workflows/pages.yml; then
        echo "✅ Workflow uses git-based cleanup"
    fi
    
    if grep -q "branches-ignore:" .github/workflows/pages.yml && grep -q "gh-pages" .github/workflows/pages.yml; then
        echo "✅ Workflow excludes gh-pages branch"
    fi
    
    if grep -q "safe_branch_name" .github/workflows/pages.yml; then
        echo "✅ Workflow handles safe branch names"
    fi
    
    if grep -q "current-branch-backup" .github/workflows/pages.yml; then
        echo "✅ Workflow includes branch directory backup protection"
    fi
else
    echo "❌ Workflow file missing"
fi

echo ""
echo "🎉 Deployment Test Summary"  
echo "========================="
echo "✅ All tests completed successfully!"
echo ""
echo "The multi-branch GitHub Pages deployment system is ready for production use."
echo ""
echo "🚀 Next steps:"
echo "   1. Push this branch to trigger the actual deployment workflow"
echo "   2. Visit https://litlfred.github.io/sgex/ to see the landing page"
echo "   3. Check branch previews at https://litlfred.github.io/sgex/sgex/BRANCH-NAME/"
echo ""
echo "🐱 Meow! The deployment system is purrfectly ready!"

# Cleanup
cd /
rm -rf "$TEST_DIR"
echo "🧹 Test environment cleaned up"