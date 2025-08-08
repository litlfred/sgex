#!/bin/bash

# Test script for deployment workflow validation
# This script tests the backup and recovery mechanism of the deployment workflow

set -e

echo "🧪 Testing deployment workflow backup mechanism..."

# Create test directory structure
TEST_DIR="/tmp/sgex-workflow-test-$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

echo "Created test directory: $TEST_DIR"

# Initialize a test git repository
git init
git config user.name "Test User"
git config user.email "test@example.com"

# Create initial commit
echo "# Test Repo" > README.md
git add README.md
git commit -m "Initial commit"

# Create gh-pages branch
git checkout --orphan gh-pages
git rm -rf .
echo "# GitHub Pages" > README.md
git add README.md
git commit -m "Initial gh-pages branch"

# Test the backup mechanism
echo "📦 Testing backup creation..."

# Simulate build directory
mkdir -p build/static/js build/static/css
echo "<html><body>Test App</body></html>" > build/index.html
echo "/* test css */" > build/static/css/main.css
echo "// test js" > build/static/js/main.js

# Simulate target directory creation (what would happen in workflow)
target_subdir="test-branch"
mkdir -p "$target_subdir"
cp -a build/. "$target_subdir/"

echo "✅ Created target directory: $target_subdir"

# Test backup creation (simulating our new workflow step)
backup_dir="/tmp/sgex-deployment-backup-$$"
mkdir -p "$backup_dir"

if [[ -d "$target_subdir" ]]; then
  echo "Backing up target directory: $target_subdir"
  cp -a "$target_subdir" "$backup_dir/"
else
  echo "❌ Target directory not found"
  exit 1
fi

echo "✅ Backup created at: $backup_dir"

# Simulate what happens in workflow: checkout gh-pages and reset
git add -A
git commit -m "Add test deployment"

# Simulate concurrent deployment scenario - remove target directory
rm -rf "$target_subdir"
echo "🔄 Simulated reset scenario - target directory removed"

# Test recovery from backup (simulating our improved workflow)
if [[ -d "$backup_dir/$target_subdir" ]]; then
  cp -a "$backup_dir/$target_subdir" "./"
  echo "✅ Restored $target_subdir from backup"
else
  echo "❌ Backup directory not found: $backup_dir/$target_subdir"
  exit 1
fi

# Verify restoration
if [[ -f "$target_subdir/index.html" ]]; then
  echo "✅ Verified: index.html exists after restoration"
else
  echo "❌ index.html missing after restoration"
  exit 1
fi

# Cleanup
cd /
rm -rf "$TEST_DIR" "$backup_dir"

echo "🎉 All tests passed! Backup and recovery mechanism works correctly."