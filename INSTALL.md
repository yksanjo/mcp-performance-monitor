# MCP Performance Monitor - Installation Guide

## Quick Start

### Option 1: Clone and Run (Recommended)

```bash
# Clone the repository
git clone https://github.com/yksanjo/mcp-performance-monitor.git
cd mcp-performance-monitor

# Install dependencies
npm run install:all

# Seed demo data
npm run db:seed

# Start the application
npm run start:all

# Or use demo mode (starts both backend and frontend)
npm run start:demo
```

### Option 2: Using Docker (Coming Soon)

```bash
# Clone the repository
git clone https://github.com/yksanjo/mcp-performance-monitor.git
cd mcp-performance-monitor

# Build and run with Docker Compose
docker-compose up -d
```

## Access Points

Once running:
- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher (or yarn)
- **SQLite3** (included with Node.js)

## Manual Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/yksanjo/mcp-performance-monitor.git
cd mcp-performance-monitor
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install package dependencies
npm run install:packages

# Or install individually:
cd packages/monitoring-agent && npm install
cd packages/backend && npm install
cd packages/frontend && npm install
```

### 3. Build Packages

```bash
# Build all packages
npm run build:all

# Or build individually:
npm run build:agent
npm run build:backend
npm run build:frontend
```

### 4. Initialize Database

```bash
# Initialize database with demo data
npm run db:seed

# Or initialize empty database
npm run db:init
```

### 5. Start Services

```bash
# Start backend API (port 3001)
npm run start:backend

# In another terminal, start frontend (port 5173)
npm run start:frontend

# Or start both with demo mode
npm run start:demo
```

## Development Setup

### For Contributors

```bash
# Clone and setup
git clone https://github.com/yksanjo/mcp-performance-monitor.git
cd mcp-performance-monitor

# Install all dependencies
npm run install:all

# Start development servers
npm run start:backend & npm run start:frontend

# Run tests
npm run test:all

# Lint code
npm run lint:all

# Format code
npm run format:all
```

### Development URLs
- **Frontend Dev Server**: http://localhost:5173
- **Backend Dev Server**: http://localhost:3001
- **API Documentation**: See console output when backend starts

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend Configuration
PORT=3001
NODE_ENV=development
DATABASE_URL=./mcp-monitor.db

# Frontend Configuration
VITE_API_URL=http://localhost:3001
VITE_APP_NAME="MCP Performance Monitor"
```

### Configuration File

Create `mcp-monitor.config.yaml`:

```yaml
monitoring:
  enabled: true
  sample_rate: 1.0

servers:
  - name: "filesystem"
    enabled: true
    cost_per_call: 0.0001

alerts:
  latency_threshold_ms: 5000
  error_rate_threshold: 0.05
  daily_cost_limit_usd: 10.00

storage:
  type: "sqlite"
  path: "./mcp-monitor.db"
  retention_days: 90
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   lsof -i :5173
   
   # Kill the process or change ports in .env
   ```

2. **Database errors**
   ```bash
   # Reset database
   npm run db:reset
   
   # Or delete and recreate
   rm -f mcp-monitor.db
   npm run db:seed
   ```

3. **Build errors**
   ```bash
   # Clean and rebuild
   npm run clean
   npm run build:all
   ```

4. **Dependency issues**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules packages/*/node_modules
   npm run install:all
   ```

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/yksanjo/mcp-performance-monitor/issues)
- **Documentation**: Check the [README.md](README.md) for more details
- **Demo Mode**: Use `npm run start:demo` for a complete demo setup

## Production Deployment

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start services with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Systemd

```bash
# Copy systemd service file
sudo cp systemd/mcp-monitor.service /etc/systemd/system/

# Enable and start service
sudo systemctl enable mcp-monitor
sudo systemctl start mcp-monitor

# Check status
sudo systemctl status mcp-monitor
```

### Docker Deployment

```bash
# Build Docker image
docker build -t mcp-performance-monitor .

# Run container
docker run -p 3001:3001 -p 5173:5173 mcp-performance-monitor

# Or use Docker Compose
docker-compose up -d
```

## Updating

### Update from GitHub

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
npm run install:all

# Rebuild packages
npm run build:all

# Restart services
npm run start:all
```

### Database Migrations

```bash
# Backup existing database
cp mcp-monitor.db mcp-monitor.db.backup

# Run migrations (if available)
npm run db:migrate
```

## Uninstallation

### Remove Application

```bash
# Stop services
npm run stop:all

# Remove database
rm -f mcp-monitor.db

# Remove dependencies
rm -rf node_modules packages/*/node_modules

# Remove cloned repository
cd ..
rm -rf mcp-performance-monitor
```

### Remove from PM2

```bash
pm2 stop mcp-monitor
pm2 delete mcp-monitor
```

### Remove from Systemd

```bash
sudo systemctl stop mcp-monitor
sudo systemctl disable mcp-monitor
sudo rm /etc/systemd/system/mcp-monitor.service
```

## Support

For additional help:
- Check the [GitHub repository](https://github.com/yksanjo/mcp-performance-monitor)
- Review the [API documentation](docs/api-reference.md)
- Open an [issue](https://github.com/yksanjo/mcp-performance-monitor/issues)

---

**Note**: This is a development version. For production deployment, additional security and performance considerations should be addressed.