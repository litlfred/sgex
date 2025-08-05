#!/bin/bash

# Script to set up the deploy branch with branch-listing functionality
# This script moves branch-listing.html from main to deploy branch as index.html

set -e

echo "🚀 Setting up deploy branch with branch-listing functionality..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Ensure we have the latest main and deploy branches
echo "📥 Fetching latest branches..."
git fetch origin main:main 2>/dev/null || echo "Main branch already up to date"
git fetch origin deploy:deploy 2>/dev/null || echo "Deploy branch already up to date"

# Switch to deploy branch
echo "🔄 Switching to deploy branch..."
git checkout deploy

# Get branch-listing.html from main branch
echo "📋 Copying branch-listing.html from main branch..."
git show main:public/branch-listing.html > branch-listing.html

# Backup current index.html if it exists
if [ -f "index.html" ]; then
    echo "💾 Backing up current index.html..."
    cp index.html index.html.backup
fi

# Replace index.html with branch-listing functionality
echo "🔄 Replacing index.html with branch-listing functionality..."
cp branch-listing.html index.html

# Clean up temporary file
rm branch-listing.html

# Show the changes
echo "📊 Changes made:"
git status

# Commit the changes
echo "💾 Committing changes..."
git add index.html
git commit -m "Replace index.html with branch-listing functionality

- Moved branch-listing.html from main branch to deploy branch as index.html
- This allows the deploy branch to serve as the canonical source for the landing page
- Branch selector landing page is now directly available as index.html on deploy branch"

echo "✅ Deploy branch setup complete!"
echo ""
echo "Next steps:"
echo "1. Push the deploy branch: git push origin deploy"
echo "2. The landing page deployment workflow will now use the deploy branch by default"
echo "3. The workflow will deploy the index.html from the deploy branch as the landing page"
echo ""
echo "🎉 Setup complete! The deploy branch now contains the branch-listing functionality as index.html"