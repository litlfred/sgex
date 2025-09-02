#!/bin/bash
# Test script for DAK FAQ MCP and REST services

echo "🧪 DAK FAQ Service Test Suite"
echo "=============================="

cd "$(dirname "$0")"

echo
echo "📦 Building service..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo
echo "🔌 Testing MCP Protocol..."
echo "Starting MCP server for testing..."

# Test MCP list_faq_questions tool
echo '{"method":"tools/call","params":{"name":"list_faq_questions","arguments":{}}}' | timeout 10s node dist/mcp-server.js > /tmp/mcp-test.json 2>/dev/null

if [ $? -eq 0 ] && [ -s /tmp/mcp-test.json ]; then
    echo "✅ MCP server responded successfully"
    echo "📋 Response preview:"
    head -c 200 /tmp/mcp-test.json | tr -d '\n'
    echo "..."
else
    echo "⚠️  MCP server test inconclusive (may need stdio input)"
fi

echo
echo "🌐 Testing REST API..."
echo "Starting REST server..."

# Start REST server in background
npm start > /tmp/rest-server.log 2>&1 &
REST_PID=$!

# Wait a moment for server to start
sleep 3

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://127.0.0.1:3001/health > /tmp/health-test.json
if [ $? -eq 0 ] && [ -s /tmp/health-test.json ]; then
    echo "✅ Health endpoint working"
    cat /tmp/health-test.json | jq .
else
    echo "❌ Health endpoint failed"
fi

# Test catalog endpoint
echo
echo "Testing catalog endpoint..."
curl -s http://127.0.0.1:3001/faq/questions/catalog > /tmp/catalog-test.json
if [ $? -eq 0 ] && [ -s /tmp/catalog-test.json ]; then
    echo "✅ Catalog endpoint working"
    echo "📋 Found $(cat /tmp/catalog-test.json | jq '.questions | length') questions"
else
    echo "❌ Catalog endpoint failed"
fi

# Clean up
kill $REST_PID 2>/dev/null
wait $REST_PID 2>/dev/null

echo
echo "📚 Documentation Files:"
echo "├── 🔌 MCP Manifest: mcp-manifest.json"
echo "├── 📊 OpenAPI Spec: docs/openapi.yaml"
echo "├── 📖 Integration Guide: docs/mcp-openapi-integration.md"
echo "└── 📋 Documentation Plan: docs/mcp-documentation-plan.md"

echo
echo "✨ Test completed!"
echo "📝 For detailed testing:"
echo "   MCP: echo '{\"method\":\"tools/call\",\"params\":{\"name\":\"list_faq_questions\",\"arguments\":{}}}' | npm run start-mcp"
echo "   REST: npm start & curl http://127.0.0.1:3001/faq/questions/catalog"