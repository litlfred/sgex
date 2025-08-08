#!/bin/bash
# Fix Deploy Branch Missing Configuration Files
# This script adds the missing route configuration files to the deploy branch

echo "🔧 Adding missing route configuration files to deploy branch..."

# Switch to deploy branch
git checkout deploy

# Copy the missing files from main branch
git checkout main -- public/routeConfig.js public/routes-config.json public/routes-config.deploy.json

# Also copy the updated index.html that includes routeConfig.js script tag
git checkout main -- public/index.html

# Verify files were copied
echo "✅ Files copied successfully:"
ls -la public/routes-config* public/routeConfig.js public/index.html

# Add and commit the files
git add public/routeConfig.js public/routes-config.json public/routes-config.deploy.json public/index.html

git commit -m "Add missing route configuration files for deploy branch

- Copy routeConfig.js, routes-config.json, and routes-config.deploy.json from main
- Copy updated index.html with routeConfig.js script tag
- Required for landing page deployment workflow to work correctly  
- Fixes missing configuration that caused deployment failures

These files are essential for the React app to load the correct routes
when deployed as the landing page branch selector."

echo "✅ Deploy branch updated with missing configuration files"
echo ""
echo "Next steps:"
echo "1. Push deploy branch: git push origin deploy"
echo "2. Trigger landing page deployment workflow"
echo "3. Verify landing page loads correctly at https://litlfred.github.io/sgex/"

# Switch back to original branch
git checkout main