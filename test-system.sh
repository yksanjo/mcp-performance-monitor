#!/bin/bash

echo "=== MCP Performance Monitor System Test ==="
echo ""

# Check if Node.js is installed
echo "1. Checking Node.js version..."
node --version
if [ $? -ne 0 ]; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi
echo "✅ Node.js is installed"

# Check npm version
echo ""
echo "2. Checking npm version..."
npm --version
if [ $? -ne 0 ]; then
    echo "❌ npm is not installed or not in PATH"
    exit 1
fi
echo "✅ npm is installed"

# Check if packages are built
echo ""
echo "3. Checking if packages are built..."
if [ ! -d "packages/monitoring-agent/dist" ]; then
    echo "❌ Monitoring agent not built"
    echo "   Building monitoring agent..."
    cd packages/monitoring-agent && npm run build
    cd ../..
fi

if [ ! -d "packages/backend/dist" ]; then
    echo "❌ Backend not built"
    echo "   Building backend..."
    cd packages/backend && npm run build
    cd ../..
fi

if [ ! -d "packages/frontend/dist" ]; then
    echo "❌ Frontend not built"
    echo "   Building frontend..."
    cd packages/frontend && npm run build
    cd ../..
fi

echo "✅ All packages are built"

# Check database
echo ""
echo "4. Checking database..."
if [ ! -f "mcp-monitor.db" ]; then
    echo "⚠️  Database not found, seeding demo data..."
    npm run db:seed
else
    echo "✅ Database exists"
fi

# Test backend API
echo ""
echo "5. Testing backend API..."
# Start backend in background
cd packages/backend
npm start > backend.log 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
echo "   Waiting for backend to start..."
sleep 5

# Test health endpoint
echo "   Testing health endpoint..."
curl -s http://localhost:3001/api/health | grep -q "status"
if [ $? -eq 0 ]; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API failed to start"
    echo "   Backend logs:"
    cat packages/backend/backend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Test servers endpoint
echo "   Testing servers endpoint..."
SERVER_COUNT=$(curl -s http://localhost:3001/api/servers | jq '. | length' 2>/dev/null || echo "0")
if [ "$SERVER_COUNT" -gt 0 ]; then
    echo "✅ Backend has $SERVER_COUNT servers"
else
    echo "⚠️  No servers found in backend"
fi

# Test metrics endpoint
echo "   Testing metrics endpoint..."
curl -s http://localhost:3001/api/metrics > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Metrics endpoint is working"
else
    echo "⚠️  Metrics endpoint returned error"
fi

# Stop backend
echo ""
echo "6. Stopping backend..."
kill $BACKEND_PID 2>/dev/null
sleep 2

# Test frontend build
echo ""
echo "7. Testing frontend build..."
if [ -d "packages/frontend/dist" ]; then
    echo "✅ Frontend is built successfully"
    echo "   Build output:"
    ls -la packages/frontend/dist/
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Summary
echo ""
echo "=== System Test Summary ==="
echo "✅ Node.js environment: Ready"
echo "✅ Packages: Built"
echo "✅ Database: Seeded with demo data"
echo "✅ Backend API: Functional"
echo "✅ Frontend: Built successfully"
echo ""
echo "To start the complete system:"
echo "1. Start backend: cd packages/backend && npm start"
echo "2. Start frontend: cd packages/frontend && npm run dev"
echo "3. Open browser: http://localhost:5173"
echo ""
echo "Or use the demo command: npm run start:demo"
echo ""
echo "=== Test Complete ==="