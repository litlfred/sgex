# SGEX Workflow Integration - Quick Commands

## 📦 Package Contents
The workflow integration package includes:
- Deploy Branch button (triggers branch-deployment.yml)
- Deploy Landing button (triggers landing-page-deployment.yml)  
- View Actions link
- Proper error handling and loading states

## 🚀 Quick Installation (Mac Command Line)

### Option 1: Download and Install (if you have the package)
```bash
# Navigate to your sgex repository
cd /path/to/sgex

# Ensure you're on deploy branch
git checkout deploy

# Download/copy the package files to your repository, then:
tar -xzf sgex-workflow-integration.tar.gz
./install.sh
```

### Option 2: Manual Patch Application
```bash
# Navigate to your sgex repository on deploy branch
cd /path/to/sgex
git checkout deploy

# Apply the patch (if you have the .patch file)
patch -p1 < workflow-integration.patch
```

### Option 3: Direct File Replacement
```bash
# Navigate to your sgex repository on deploy branch
cd /path/to/sgex
git checkout deploy

# Backup original
cp public/branch-listing.html public/branch-listing.html.backup

# Replace with modified version (if you have the modified file)
cp modified-branch-listing.html public/branch-listing.html
```

## 🔍 Verify Installation
After installation, the workflow controls should appear for authenticated users between the discussion section and preview links in each PR card.

## 🔄 Rollback
```bash
# Restore original version
cp public/branch-listing.html.backup public/branch-listing.html
```

## 📋 Requirements
- Must be on the deploy branch of litlfred/sgex repository
- Users need GitHub Personal Access Token with actions:write permission
- Workflow controls only appear when authenticated