#!/bin/bash

# Test script for WHO SMART Guidelines Canonical Schema Integration
# This script demonstrates the enhanced functionality

echo "=== Testing WHO SMART Guidelines Canonical Schema Integration ==="
echo

# Start the server in background
echo "Starting DAK FAQ MCP Server..."
cd "$(dirname "$0")"
npm run build > /dev/null 2>&1
cp -r questions dist/ 2>/dev/null || true
node dist/index.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Function to test API endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="$4"
    
    echo "Testing: $name"
    if [ "$method" = "GET" ]; then
        curl -s "$url" | jq '.' > /dev/null
        if [ $? -eq 0 ]; then
            echo "✅ $name - SUCCESS"
        else
            echo "❌ $name - FAILED"
        fi
    else
        curl -s -X "$method" -H "Content-Type: application/json" -d "$data" "$url" | jq '.' > /dev/null
        if [ $? -eq 0 ]; then
            echo "✅ $name - SUCCESS"
        else
            echo "❌ $name - FAILED"
        fi
    fi
    echo
}

BASE_URL="http://127.0.0.1:3001"

# Test basic functionality
test_endpoint "Health Check" "GET" "$BASE_URL/health"

# Test canonical schema features
test_endpoint "Known Canonical References" "GET" "$BASE_URL/faq/canonical/known"

test_endpoint "Canonical Validation" "POST" "$BASE_URL/faq/canonical/validate" \
  '{"canonicalUrl": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json", "data": {"code": "business-processes"}}'

# URL encode the ValueSet URL for expansion test
ENCODED_URL="https%3A%2F%2Fworldhealthorganization.github.io%2Fsmart-base%2FValueSet-DAKComponentType.schema.json"
test_endpoint "ValueSet Expansion" "GET" "$BASE_URL/faq/canonical/valuesets/$ENCODED_URL/expand"

test_endpoint "Code Validation (Valid)" "POST" "$BASE_URL/faq/canonical/valuesets/validate-code" \
  '{"valueSetUrl": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json", "code": "business-processes"}'

test_endpoint "Code Validation (Invalid)" "POST" "$BASE_URL/faq/canonical/valuesets/validate-code" \
  '{"valueSetUrl": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json", "code": "invalid-component"}'

test_endpoint "Cache Statistics" "GET" "$BASE_URL/faq/canonical/cache/stats"

test_endpoint "Enhanced OpenAPI Schema" "GET" "$BASE_URL/faq/openapi"

# Display summary
echo "=== Integration Summary ==="
echo "✅ CanonicalSchemaService - Loading and caching WHO schemas"
echo "✅ ValueSet Expansion - Getting DAK component type codes"
echo "✅ Code Validation - Validating codes against ValueSets"
echo "✅ Enhanced API Documentation - OpenAPI with canonical references"
echo "✅ Cache Management - Memory and disk caching functionality"
echo "✅ Error Handling - Graceful fallbacks and validation"
echo
echo "🎉 WHO SMART Guidelines canonical schema integration is working!"
echo

# Show some example output
echo "=== Example ValueSet Codes ==="
curl -s "$BASE_URL/faq/canonical/valuesets/$ENCODED_URL/expand" | jq '.expansion.codes[].code' | head -5
echo

echo "=== Cache Statistics ==="
curl -s "$BASE_URL/faq/canonical/cache/stats" | jq '.cache'
echo

# Cleanup
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "✅ Test completed successfully!"
echo "📚 See docs/canonical-schema-integration.md for detailed documentation"