# MCP Performance Monitor 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

A comprehensive monitoring and optimization platform for Model Context Protocol (MCP) servers. Track performance, analyze costs, and make data-driven decisions about your MCP infrastructure.

## ✨ Features

### 📊 Real-time Monitoring
- **Performance Metrics**: Track response times (p50, p95, p99), success rates, error rates
- **Cost Analysis**: Monitor API costs across providers, set budgets, get optimization suggestions
- **Usage Patterns**: Heatmaps, peak hour analysis, operation distribution
- **Server Comparison**: Side-by-side comparison of multiple servers

### 🛠️ Easy Integration
- **Lightweight Agent**: Simple wrapper for your MCP calls
- **Zero Configuration**: Auto-detects and starts monitoring
- **Multiple Backends**: SQLite (default), PostgreSQL, MySQL support
- **REST API**: Full-featured API for integration with other tools

### 🚨 Alerting & Notifications
- **Custom Alerts**: Set thresholds for latency, errors, costs
- **Multiple Channels**: Email, Slack, Webhook notifications
- **Smart Detection**: Anomaly detection for unusual patterns

### 📈 Visualization & Reporting
- **Interactive Dashboards**: Real-time charts and graphs
- **Export Data**: CSV, JSON exports for further analysis
- **Scheduled Reports**: Daily/weekly performance reports

## 🏗️ Architecture

```
mcp-performance-monitor/
├── packages/
│   ├── monitoring-agent/     # TypeScript monitoring library
│   ├── backend/              # Node.js + Express API
│   └── frontend/             # React + TypeScript dashboard
├── configs/                  # Configuration files
├── scripts/                  # Utility scripts
├── docs/                     # Documentation
└── reports/                  # Generated reports
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite3 (included)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-performance-monitor.git
cd mcp-performance-monitor

# Install dependencies
npm run install:all

# Initialize database with demo data
npm run db:seed

# Start all services
npm run start:all
```

Or use the demo command:
```bash
npm run start:demo
```

Open your browser to `http://localhost:5173`

## 📖 Usage

### 1. Monitor Your MCP Calls

Wrap your MCP calls with our monitoring agent:

```typescript
import { monitorMCPCall } from '@mcp-monitor/agent';

const result = await monitorMCPCall({
  serverName: 'filesystem',
  operation: 'read_file',
  call: async () => {
    // Your actual MCP call here
    return await mcpClient.readFile('/path/to/file');
  },
  metadata: {
    filePath: '/path/to/file',
    userId: 'user123'
  }
});
```

### 2. Configuration

Create `mcp-monitor.config.yaml`:

```yaml
monitoring:
  enabled: true
  sample_rate: 1.0

servers:
  - name: "filesystem"
    enabled: true
    cost_per_call: 0.0001
  - name: "brave-search"
    enabled: true
    cost_per_call: 0.001

alerts:
  latency_threshold_ms: 5000
  error_rate_threshold: 0.05
  daily_cost_limit_usd: 10.00

storage:
  type: "sqlite"
  path: "./mcp-monitor.db"
  retention_days: 90
```

### 3. View Dashboard

Access the web dashboard at `http://localhost:5173` to:
- View real-time performance metrics
- Analyze cost breakdowns
- Compare server performance
- Set up alerts and notifications

## 🔧 API Reference

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/servers` | List all servers |
| GET | `/api/servers/:id` | Get server details |
| POST | `/api/servers` | Register new server |
| GET | `/api/servers/:id/metrics` | Get server metrics |
| GET | `/api/metrics` | Get all metrics |
| GET | `/api/logs` | Get performance logs |
| GET | `/api/servers/compare` | Compare multiple servers |
| GET | `/api/usage/patterns` | Get usage patterns |

### Monitoring Agent API

```typescript
// Initialize monitor
import { initializeMonitor } from '@mcp-monitor/agent';
await initializeMonitor('./mcp-monitor.config.yaml');

// Monitor a call
const result = await monitorMCPCall(options);

// Get monitor instance
import { getMonitor } from '@mcp-monitor/agent';
const monitor = getMonitor();
const metrics = await monitor.getServerMetrics('filesystem');
```

## 📊 Supported MCP Servers

The monitor works with any MCP server, but includes built-in support for:

| Server | Category | Cost Model | Popularity |
|--------|----------|------------|------------|
| filesystem | Local | Free | ⭐⭐⭐⭐⭐ |
| brave-search | Search | Freemium | ⭐⭐⭐⭐ |
| github | Development | Freemium | ⭐⭐⭐⭐ |
| sqlite | Database | Free | ⭐⭐⭐ |
| weather | Data | Freemium | ⭐⭐⭐ |
| notion | Productivity | Subscription | ⭐⭐⭐⭐ |
| discord | Communication | Free | ⭐⭐⭐ |
| openai | AI | Usage-based | ⭐⭐⭐⭐⭐ |

## 🎯 Use Cases

### For Individual Developers
- **Cost Optimization**: Track and reduce API spending
- **Performance Tuning**: Identify and fix slow operations
- **Server Selection**: Choose the best servers for your needs
- **Debugging**: Quickly identify and resolve issues

### For Teams
- **Team Visibility**: Shared dashboards for all team members
- **Budget Management**: Set and track team budgets
- **Capacity Planning**: Understand usage patterns for scaling
- **Compliance**: Audit trails and usage reporting

### For Enterprises
- **Multi-team Management**: Organization-wide monitoring
- **Cost Allocation**: Chargeback/showback reporting
- **SLA Monitoring**: Ensure service level agreements are met
- **Security**: Monitor for unusual access patterns

## 🚢 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Kubernetes Deployment

```yaml
# See kubernetes/ directory for full manifests
kubectl apply -f kubernetes/
```

### Cloud Providers
- **AWS**: ECS, EKS, or EC2 deployment
- **GCP**: Cloud Run, GKE, or Compute Engine
- **Azure**: AKS, Container Instances, or App Service

## 🔍 Monitoring & Alerting

### Built-in Alerts
- **Latency Alerts**: Notify when response times exceed thresholds
- **Error Rate Alerts**: Alert on increasing error rates
- **Cost Alerts**: Warn when approaching budget limits
- **Anomaly Detection**: Detect unusual patterns automatically

### Integration with Monitoring Tools
- **Prometheus**: Export metrics in Prometheus format
- **Grafana**: Pre-built dashboards available
- **Datadog**: Native integration
- **New Relic**: APM integration

## 📈 Performance

- **Lightweight Agent**: < 1ms overhead per call
- **Scalable Backend**: Handles thousands of requests per second
- **Efficient Storage**: Compressed logging with configurable retention
- **Real-time Updates**: WebSocket support for live dashboards

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Submit a pull request**

### Development Setup

```bash
# Install dependencies
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

### Project Structure

- `/packages/monitoring-agent`: Core monitoring library
- `/packages/backend`: REST API and data processing
- `/packages/frontend`: Web dashboard
- `/configs`: Configuration templates
- `/scripts`: Build and utility scripts
- `/docs`: Documentation
- `/tests`: Test suites

## 📚 Documentation

- [Getting Started Guide](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Configuration Guide](docs/configuration.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🛡️ Security

### Security Features
- **Encrypted Storage**: Sensitive data encrypted at rest
- **Access Control**: Role-based access control (RBAC)
- **Audit Logging**: Comprehensive audit trails
- **API Security**: Rate limiting, input validation

### Reporting Security Issues
Please report security issues to security@example.com. Do not use GitHub issues.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the MCP community
- Inspired by the Model Context Protocol specification
- Thanks to all our contributors and users

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/mcp-performance-monitor/issues)
- **Discord**: [Join our community](https://discord.gg/your-invite)
- **Email**: support@example.com
- **Documentation**: [Full documentation](https://docs.mcp-monitor.example.com)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/mcp-performance-monitor&type=Date)](https://star-history.com/#yourusername/mcp-performance-monitor&Date)

---

<div align="center">
  <p>
    <strong>MCP Performance Monitor</strong> • Making MCP server management easier since 2024
  </p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>