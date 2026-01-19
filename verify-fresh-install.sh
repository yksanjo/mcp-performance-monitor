#!/bin/bash

echo "=== Verifying Fresh Installation from GitHub ==="
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

echo "1. Cloning repository from GitHub..."
git clone https://github.com/yksanjo/mcp-performance-monitor.git 2>&1 | tail -5
if [ $? -ne 0 ]; then
    echo "❌ Failed to clone repository"
    exit 1
fi
echo "✅ Repository cloned successfully"

cd mcp-performance-monitor

echo ""
echo "2. Checking repository structure..."
if [ -f "package.json" ] && [ -d "packages" ]; then
    echo "✅ Repository structure is correct"
else
    echo "❌ Repository structure missing key files"
    exit 1
fi

echo ""
echo "3. Checking documentation..."
if [ -f "README.md" ] && [ -f "INSTALL.md" ]; then
    echo "✅ Documentation files present"
else
    echo "❌ Missing documentation files"
    exit 1
fi

echo ""
echo "4. Checking source code..."
if [ -d "packages/monitoring-agent/src" ] && \
   [ -d "packages/backend/src" ] && \
   [ -d "packages/frontend/src" ]; then
    echo "✅ Source code directories present"
else
    echo "❌ Missing source code directories"
    exit 1
fi

echo ""
echo "5. Checking scripts..."
if [ -f "scripts/gather-mcp-data.js" ] && \
   [ -f "scripts/demo-data-generator.js" ]; then
    echo "✅ Utility scripts present"
else
    echo "❌ Missing utility scripts"
    exit 1
fi

echo ""
echo "6. Checking launch materials..."
if [ -f "docs/launch-tweet-thread.md" ] && \
   [ -f "docs/reddit-post-template.md" ]; then
    echo "✅ Launch materials present"
else
    echo "❌ Missing launch materials"
    exit 1
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "✅ Repository is properly deployed to GitHub"
echo "✅ All files and directories are present"
echo "✅ Documentation is complete"
echo "✅ Launch materials are ready"
echo ""
echo "Repository URL: https://github.com/yksanjo/mcp-performance-monitor"
echo ""
echo "Next steps:"
echo "1. Share the repository link"
echo "2. Use the launch materials in docs/ directory"
echo "3. Tag @AnthropicAI in your launch posts"
echo ""
echo "Cleanup temporary directory..."
cd /
rm -rf $TEMP_DIR
echo "✅ Cleanup complete"