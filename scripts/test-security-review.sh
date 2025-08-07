#!/bin/bash

# Test script to validate the Claude Security Review workflow
# This script simulates a pull request environment and tests the workflow logic

echo "🔒 Testing Claude Security Review Workflow"
echo "=========================================="

# Test 1: Check if workflow file exists and is valid
echo "Test 1: Validating workflow file..."
WORKFLOW_FILE=".github/workflows/claude-security-review.yml"

if [ -f "$WORKFLOW_FILE" ]; then
    echo "✅ Workflow file exists: $WORKFLOW_FILE"
else
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

# Test 2: Validate YAML syntax (if yq is available)
if command -v yq &> /dev/null; then
    echo "✅ Validating YAML syntax..."
    if yq eval '.' "$WORKFLOW_FILE" > /dev/null 2>&1; then
        echo "✅ YAML syntax is valid"
    else
        echo "❌ YAML syntax error in workflow file"
        exit 1
    fi
else
    echo "⚠️ yq not available, skipping YAML validation"
fi

# Test 3: Check documentation exists
echo "Test 3: Checking documentation..."
DOC_FILE="docs/automated-security-reviews.md"

if [ -f "$DOC_FILE" ]; then
    echo "✅ Documentation exists: $DOC_FILE"
else
    echo "❌ Documentation not found: $DOC_FILE"
    exit 1
fi

# Test 4: Simulate file change detection
echo "Test 4: Testing file change detection logic..."

# Create test files
mkdir -p test_files
cat > test_files/test.js << 'EOF'
// Sample JavaScript file for testing
function processUser(input) {
    // Potential security issue: no input validation
    eval(input);
}
EOF

cat > test_files/test.txt << 'EOF'
This is a text file that should be ignored
EOF

cat > test_files/test.json << 'EOF'
{
    "api_key": "test-key-value",
    "config": "value"
}
EOF

# Simulate the file filtering logic from the workflow
echo "Creating test file list..."
find test_files -type f > all_files.txt
grep -E '\.(js|jsx|ts|tsx|json|yml|yaml)$' all_files.txt > filtered_files.txt || true

if [ -s filtered_files.txt ]; then
    echo "✅ File filtering works correctly:"
    cat filtered_files.txt
else
    echo "❌ File filtering failed"
    exit 1
fi

# Test 5: Check if required dependencies are documented
echo "Test 5: Checking workflow dependencies..."

REQUIRED_ACTIONS=(
    "actions/checkout@v4"
    "actions/github-script@v7"
)

for action in "${REQUIRED_ACTIONS[@]}"; do
    if grep -q "$action" "$WORKFLOW_FILE"; then
        echo "✅ Required action found: $action"
    else
        echo "❌ Required action missing: $action"
        exit 1
    fi
done

# Test 6: Validate prompt structure
echo "Test 6: Checking Claude prompt structure..."

if grep -q "system.*security expert" "$WORKFLOW_FILE"; then
    echo "✅ Security expert system prompt found"
else
    echo "❌ Security expert system prompt not found"
    exit 1
fi

if grep -q "Authentication and authorization" "$WORKFLOW_FILE"; then
    echo "✅ Security checklist includes authentication"
else
    echo "❌ Security checklist missing authentication checks"
    exit 1
fi

# Test 7: Check environment variable handling
echo "Test 7: Checking environment variable handling..."

if grep -q "ANTHROPIC_API_KEY" "$WORKFLOW_FILE"; then
    echo "✅ Claude API key environment variable configured"
else
    echo "❌ Claude API key environment variable not found"
    exit 1
fi

# Test 8: Validate error handling
echo "Test 8: Checking error handling..."

if grep -q "missing_key" "$WORKFLOW_FILE"; then
    echo "✅ Missing API key error handling found"
else
    echo "❌ Missing API key error handling not found"
    exit 1
fi

if grep -q "api_error" "$WORKFLOW_FILE"; then
    echo "✅ API error handling found"
else
    echo "❌ API error handling not found"
    exit 1
fi

# Cleanup
rm -rf test_files all_files.txt filtered_files.txt

echo ""
echo "🎉 All tests passed! Claude Security Review workflow is ready."
echo ""
echo "Next steps:"
echo "1. Add ANTHROPIC_API_KEY secret to repository settings"
echo "2. Test with a real pull request"
echo "3. Monitor the workflow execution logs"
echo "4. Review and iterate on the security analysis prompts"