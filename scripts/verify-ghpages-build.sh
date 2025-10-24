#!/usr/bin/env bash
#
# verify-ghpages-build.sh
# Portable script to verify GitHub Pages build succeeds
# Used both in CI and by automated agents (including Copilot) to verify builds before committing
#
# Usage:
#   ./scripts/verify-ghpages-build.sh
#   GH_PAGES_OUTPUT_DIR=public ./scripts/verify-ghpages-build.sh
#
# Exit codes:
#   0  - Build succeeded
#   1  - Build failed
#   2  - Configuration error or missing dependencies

set -e
set -o pipefail

# Color output helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_OUTPUT_DIR="${GH_PAGES_OUTPUT_DIR:-build}"
ARTIFACTS_DIR="${ARTIFACTS_DIR:-artifacts}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to repository root
cd "$REPO_ROOT"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🔍 GitHub Pages Build Verification${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "Repository root: ${REPO_ROOT}"
echo -e "Build output directory: ${BUILD_OUTPUT_DIR}"
echo -e "Artifacts directory: ${ARTIFACTS_DIR}"
echo ""

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log error
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to log info
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Create artifacts directory
mkdir -p "$ARTIFACTS_DIR"

# Step 1: Check for package.json (npm/node project)
echo -e "${BLUE}📋 Step 1: Detecting build system...${NC}"
if [ -f "package.json" ]; then
    log_success "Found package.json - Node.js project detected"
    
    # Check if build script exists
    if grep -q '"build"' package.json; then
        log_success "Found 'build' script in package.json"
        BUILD_COMMAND="npm run build"
    else
        log_error "No 'build' script found in package.json"
        log_info "Expected package.json to contain: \"build\": \"...\""
        exit 2
    fi
    
# Step 2: Check for other common static site generators
elif [ -f "config.toml" ] || [ -f "config.yaml" ] || [ -f "hugo.toml" ]; then
    log_success "Hugo configuration detected"
    
    if command -v hugo &> /dev/null; then
        BUILD_COMMAND="hugo"
    else
        log_error "Hugo is not installed"
        log_info "Install Hugo from: https://gohugo.io/installation/"
        exit 2
    fi
    
elif [ -f "mkdocs.yml" ]; then
    log_success "MkDocs configuration detected"
    
    if command -v mkdocs &> /dev/null; then
        BUILD_COMMAND="mkdocs build"
    else
        log_error "MkDocs is not installed"
        log_info "Install MkDocs with: pip install mkdocs"
        exit 2
    fi
    
elif [ -f "_config.yml" ] && command -v jekyll &> /dev/null; then
    log_success "Jekyll configuration detected"
    BUILD_COMMAND="jekyll build"
    
else
    log_error "No supported build system detected"
    log_info "Supported systems: npm (package.json), Hugo, MkDocs, Jekyll"
    exit 2
fi

echo ""
echo -e "${BLUE}📋 Step 2: Installing dependencies...${NC}"

# Install dependencies based on detected build system
if [ -f "package.json" ]; then
    log_info "Running: npm ci --legacy-peer-deps"
    
    if npm ci --legacy-peer-deps > "$ARTIFACTS_DIR/npm-install.log" 2>&1; then
        log_success "Dependencies installed successfully"
    else
        log_error "Dependency installation failed"
        echo ""
        log_info "Last 20 lines of npm-install.log:"
        tail -n 20 "$ARTIFACTS_DIR/npm-install.log"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📋 Step 3: Running build...${NC}"
log_info "Build command: ${BUILD_COMMAND}"
log_info "Build output will be written to: ${BUILD_OUTPUT_DIR}"
echo ""

# Clean previous build output if it exists
if [ -d "$BUILD_OUTPUT_DIR" ]; then
    log_warning "Removing previous build output from ${BUILD_OUTPUT_DIR}"
    rm -rf "$BUILD_OUTPUT_DIR"
fi

# Set environment variables for build
export CI=false
export ESLINT_NO_DEV_ERRORS=true
export GENERATE_SOURCEMAP=false
export PUBLIC_URL="${PUBLIC_URL:-/sgex/}"

log_info "Environment: CI=$CI, PUBLIC_URL=$PUBLIC_URL"
echo ""

# Execute build with timestamp logging
START_TIME=$(date +%s)

# The following pipeline preserves the exit code of the build command because 'set -o pipefail' is set above.
# Do not remove or change 'set -o pipefail' if you want to ensure build failures are detected correctly.
if $BUILD_COMMAND 2>&1 | tee "$ARTIFACTS_DIR/build-verification.log"; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo ""
    log_success "Build completed successfully in ${DURATION} seconds"
else
    EXIT_CODE=$?
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo ""
    log_error "Build failed after ${DURATION} seconds with exit code: ${EXIT_CODE}"
    echo ""
    log_info "Last 30 lines of build output:"
    tail -n 30 "$ARTIFACTS_DIR/build-verification.log"
    echo ""
    log_info "Full build log saved to: ${ARTIFACTS_DIR}/build-verification.log"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Step 4: Verifying build output...${NC}"

# Verify build output directory exists
if [ ! -d "$BUILD_OUTPUT_DIR" ]; then
    log_error "Build output directory not found: ${BUILD_OUTPUT_DIR}"
    log_info "Build command completed but did not create expected output directory"
    exit 1
fi

# Count files in build output
FILE_COUNT=$(find "$BUILD_OUTPUT_DIR" -type f | wc -l)
if [ "$FILE_COUNT" -eq 0 ]; then
    log_error "Build output directory is empty"
    exit 1
fi

log_success "Build output contains ${FILE_COUNT} files"

# Check for index.html (required for GitHub Pages)
if [ -f "$BUILD_OUTPUT_DIR/index.html" ]; then
    log_success "Found index.html in build output"
else
    log_warning "No index.html found in build output root"
    log_info "GitHub Pages may not work correctly without an index.html"
fi

# Calculate total build size
if command -v du &> /dev/null; then
    BUILD_SIZE=$(du -sh "$BUILD_OUTPUT_DIR" | cut -f1)
    log_info "Total build size: ${BUILD_SIZE}"
fi

# List largest files in build
echo ""
log_info "Top 10 largest files in build:"
find "$BUILD_OUTPUT_DIR" -type f -exec ls -lh {} \; | sort -k5 -hr | head -n 10 | awk '{printf "  %s  %s\n", $5, $9}'

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Build Verification PASSED${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
log_success "The GitHub Pages build completed successfully"
log_success "Build artifacts are ready for deployment"
log_info "Build verification log: ${ARTIFACTS_DIR}/build-verification.log"
echo ""

exit 0
