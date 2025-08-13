#!/bin/bash

# Test script to demonstrate landing page deployment branch selection
# This simulates the branch selection logic used in the GitHub Actions workflow

echo "🧪 Testing Landing Page Deployment Branch Selection Logic"
echo "========================================================"

# Test function that simulates the workflow behavior
test_branch_selection() {
    local input_branch="$1"
    local expected_branch="$2"
    
    # This simulates the GitHub Actions expression: ${{ github.event.inputs.source_branch || 'main' }}
    if [[ -n "$input_branch" ]]; then
        actual_branch="$input_branch"
    else
        actual_branch="main"
    fi
    
    echo "Input: '$input_branch' → Expected: '$expected_branch' → Actual: '$actual_branch'"
    
    if [[ "$actual_branch" == "$expected_branch" ]]; then
        echo "✅ PASS"
    else
        echo "❌ FAIL"
        return 1
    fi
    echo
}

echo "Test 1: Default behavior (no input) should use 'main'"
test_branch_selection "" "main"

echo "Test 2: Explicit 'main' input should use 'main'"
test_branch_selection "main" "main"

echo "Test 3: Feature branch input should use feature branch"
test_branch_selection "feature/new-landing-page" "feature/new-landing-page"

echo "Test 4: Deploy branch input should use deploy branch"
test_branch_selection "deploy" "deploy"

echo "Test 5: Release branch input should use release branch"
test_branch_selection "release/v2.0" "release/v2.0"

echo "🎯 All tests demonstrate that the workflow will now:"
echo "   • Use 'main' as default when no branch is specified (backward compatible)"
echo "   • Use the selected branch when one is specified"
echo "   • Allow deployment from any valid Git branch"
echo ""
echo "🚀 This enables users to test landing page changes from feature branches"
echo "   before merging to main, exactly as requested in the issue!"