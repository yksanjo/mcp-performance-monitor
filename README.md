# MCP Performance Monitor

A web-based dashboard that monitors and analyzes Model Context Protocol (MCP) server performance, helping developers choose the right MCP servers and optimize their costs.

## Features

### Phase 1 (MVP)
- ✅ Lightweight monitoring agent for MCP server calls
- ✅ SQLite database with performance logging
- ✅ React dashboard with real-time metrics
- ✅ REST API for data access
- ✅ Demo mode with synthetic data

### Phase 2 (Coming Soon)
- Cost analysis and calculation
- Usage pattern visualizations
- Compatibility matrix
- Real-time updates via WebSocket
- Dark mode UI

### Phase 3 (Future)
- Auto-discovery of MCP servers
- Anomaly detection alerts
- Comparison tool for benchmarking
- Community compatibility contributions
- Docker deployment

## Architecture

```
mcp-performance-monitor/
├── packages/
│   ├── monitoring-agent/  # TypeScript/JavaScript monitoring agent
│   ├── backend/           # Node.js + Express API
│   └── frontend/          # React + TypeScript dashboard
├── configs/               # Configuration files
├── scripts/               # Utility scripts
└── docs/                  # Documentation
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite3

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mcp-performance-monitor
```

2. Install dependencies:
```bash
# Install all packages
npm run install:all

# Or install individually:
cd packages/monitoring-agent && npm install
cd packages/backend && npm install
cd packages/frontend && npm install
```

3. Set up the database:
```bash
npm run db:init
```

4. Start the services:
```bash
# Start backend API
npm run start:backend

# Start frontend dashboard (in another terminal)
npm run start:frontend

# Or start both with demo data
npm run start:demo
```

5. Open your browser to `http://localhost:5173`

## Usage

### Monitoring Agent

Wrap your MCP client calls with the monitoring agent:

```javascript
import { monitorMCPCall } from '@mcp-monitor/agent';

// Wrap your MCP calls
const result = await monitorMCPCall({
  serverName: 'filesystem',
  operation: 'read_file',
  call: async () => {
    // Your actual MCP call here
    return await mcpClient.readFile('/path/to/file');
  }
});
```

### Configuration

Create a `mcp-monitor.config.yaml` file:

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
  
storage:
  type: "sqlite"
  path: "./mcp-monitor.db"
  retention_days: 90
```

## API Endpoints

- `GET /api/servers` - List all monitored MCP servers
- `GET /api/servers/:id/metrics` - Performance metrics for a server
- `GET /api/servers/:id/costs` - Cost breakdown
- `GET /api/servers/compare?ids=1,2,3` - Compare multiple servers
- `GET /api/usage/patterns` - Usage heatmaps and trends
- `POST /api/servers` - Register new server

## Dashboard Features

1. **Performance Metrics View**
   - Response time percentiles (p50, p95, p99)
   - Success rate over time
   - Throughput and error rates
   - Availability timeline

2. **Cost Analysis View** (Phase 2)
   - Cost per operation breakdown
   - Total spend with trend lines
   - Cost efficiency metrics
   - Budget alerts

3. **Usage Patterns Dashboard** (Phase 2)
   - Peak hours heatmap
   - Operation distribution
   - Call volume trends
   - Top consumers

## Development

### Project Structure

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + SQLite
- **Monitoring Agent**: TypeScript package for MCP call interception

### Running Tests

```bash
# Run all tests
npm test

# Run specific package tests
cd packages/monitoring-agent && npm test
cd packages/backend && npm test
```

### Building for Production

```bash
# Build all packages
npm run build

# Build individually
cd packages/monitoring-agent && npm run build
cd packages/backend && npm run build
cd packages/frontend && npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/mcp-performance-monitor/issues)
- Documentation: [Project Wiki](https://github.com/yourusername/mcp-performance-monitor/wiki)
- Discussions: [GitHub Discussions](https://github.com/yourusername/mcp-performance-monitor/discussions)