import express from 'express';
import cors from 'cors';
import { MCPMonitor } from '@mcp-monitor/agent';
import { MCPServer, PerformanceLog } from '@mcp-monitor/agent';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize monitor
const monitor = new MCPMonitor();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all servers
app.get('/api/servers', async (req, res) => {
  try {
    const servers = await monitor.getServers();
    res.json(servers);
  } catch (error) {
    console.error('Error getting servers:', error);
    res.status(500).json({ error: 'Failed to get servers' });
  }
});

// Get server by ID or name
app.get('/api/servers/:id', async (req, res) => {
  try {
    const servers = await monitor.getServers();
    const server = servers.find(s => 
      s.id?.toString() === req.params.id || s.name === req.params.id
    );
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    res.json(server);
  } catch (error) {
    console.error('Error getting server:', error);
    res.status(500).json({ error: 'Failed to get server' });
  }
});

// Register a new server
app.post('/api/servers', async (req, res) => {
  try {
    const serverData: Omit<MCPServer, 'id' | 'addedAt'> = req.body;
    
    if (!serverData.name) {
      return res.status(400).json({ error: 'Server name is required' });
    }
    
    const serverId = await monitor.registerServer(serverData);
    res.status(201).json({ id: serverId, ...serverData });
  } catch (error) {
    console.error('Error registering server:', error);
    res.status(500).json({ error: 'Failed to register server' });
  }
});

// Get server metrics
app.get('/api/servers/:id/metrics', async (req, res) => {
  try {
    const servers = await monitor.getServers();
    const server = servers.find(s => 
      s.id?.toString() === req.params.id || s.name === req.params.id
    );
    
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }
    
    // Parse time range from query params
    const timeRange = req.query.timeRange as string;
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (timeRange === '24h') {
      endDate = new Date();
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeRange === '7d') {
      endDate = new Date();
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      endDate = new Date();
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const metrics = await monitor.getServerMetrics(server.name, 
      startDate && endDate ? { start: startDate, end: endDate } : undefined
    );
    
    // Get recent logs for more detailed metrics
    const recentLogs = await monitor.getPerformanceLogs(server.name, 100);
    
    // Calculate percentiles
    const latencies = recentLogs.map(log => log.latencyMs).sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
    
    // Calculate calls per hour (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs24h = recentLogs.filter(log => 
      log.timestamp > twentyFourHoursAgo
    );
    const callsPerHour = logs24h.length / 24;
    
    res.json({
      ...metrics,
      p50LatencyMs: p50,
      p95LatencyMs: p95,
      p99LatencyMs: p99,
      callsPerHour,
      recentLogs: recentLogs.slice(0, 20) // Return last 20 logs
    });
  } catch (error) {
    console.error('Error getting server metrics:', error);
    res.status(500).json({ error: 'Failed to get server metrics' });
  }
});

// Get all metrics
app.get('/api/metrics', async (req, res) => {
  try {
    // Parse time range from query params
    const timeRange = req.query.timeRange as string;
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (timeRange === '24h') {
      endDate = new Date();
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeRange === '7d') {
      endDate = new Date();
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '30d') {
      endDate = new Date();
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const allMetrics = await monitor.getAllMetrics(
      startDate && endDate ? { start: startDate, end: endDate } : undefined
    );
    
    // Calculate overall metrics
    const overall: any = {
      totalCalls: allMetrics.reduce((sum, m) => sum + m.totalCalls, 0),
      successfulCalls: allMetrics.reduce((sum, m) => sum + m.successfulCalls, 0),
      errorCalls: allMetrics.reduce((sum, m) => sum + m.errorCalls, 0),
      totalCostUsd: allMetrics.reduce((sum, m) => sum + m.totalCostUsd, 0)
    };
    
    overall.successRate = overall.totalCalls > 0 
      ? overall.successfulCalls / overall.totalCalls 
      : 0;
    
    res.json({
      byServer: allMetrics,
      overall
    });
  } catch (error) {
    console.error('Error getting all metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Get performance logs
app.get('/api/logs', async (req, res) => {
  try {
    const serverName = req.query.server as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    
    const logs = await monitor.getPerformanceLogs(serverName, limit);
    res.json(logs);
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Compare multiple servers
app.get('/api/servers/compare', async (req, res) => {
  try {
    const serverIds = (req.query.ids as string)?.split(',') || [];
    
    if (serverIds.length === 0) {
      return res.status(400).json({ error: 'No server IDs provided' });
    }
    
    const servers = await monitor.getServers();
    const comparison = [];
    
    for (const serverId of serverIds) {
      const server = servers.find(s => 
        s.id?.toString() === serverId || s.name === serverId
      );
      
      if (server) {
        const metrics = await monitor.getServerMetrics(server.name);
        comparison.push({
          server,
          metrics
        });
      }
    }
    
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing servers:', error);
    res.status(500).json({ error: 'Failed to compare servers' });
  }
});

// Get usage patterns
app.get('/api/usage/patterns', async (req, res) => {
  try {
    // For now, return basic usage patterns
    // In Phase 2, this will include heatmaps and detailed analysis
    const allMetrics = await monitor.getAllMetrics();
    
    // Calculate hourly distribution (simplified)
    const hourlyDistribution = Array(24).fill(0).map((_, hour) => ({
      hour,
      calls: Math.floor(Math.random() * 100) // Placeholder - will be real data in Phase 2
    }));
    
    // Calculate operation distribution
    const operationDistribution: Record<string, number> = {};
    const servers = await monitor.getServers();
    
    for (const server of servers) {
      const logs = await monitor.getPerformanceLogs(server.name, 1000);
      logs.forEach(log => {
        operationDistribution[log.operation] = (operationDistribution[log.operation] || 0) + 1;
      });
    }
    
    res.json({
      hourlyDistribution,
      operationDistribution: Object.entries(operationDistribution)
        .map(([operation, count]) => ({ operation, count }))
        .sort((a, b) => b.count - a.count),
      totalServers: servers.length,
      totalCalls: allMetrics.reduce((sum, m) => sum + m.totalCalls, 0)
    });
  } catch (error) {
    console.error('Error getting usage patterns:', error);
    res.status(500).json({ error: 'Failed to get usage patterns' });
  }
});

// Initialize and start server
async function startServer() {
  try {
    await monitor.initialize();
    console.log('MCP Monitor initialized');
    
    app.listen(port, () => {
      console.log(`Backend API server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/api/health`);
      console.log(`API documentation:`);
      console.log(`  GET  /api/servers           - List all servers`);
      console.log(`  GET  /api/servers/:id       - Get server details`);
      console.log(`  POST /api/servers           - Register new server`);
      console.log(`  GET  /api/servers/:id/metrics - Get server metrics`);
      console.log(`  GET  /api/metrics           - Get all metrics`);
      console.log(`  GET  /api/logs              - Get performance logs`);
      console.log(`  GET  /api/servers/compare   - Compare servers`);
      console.log(`  GET  /api/usage/patterns    - Get usage patterns`);
    });
  } catch (error) {
    console.error('Failed to initialize monitor:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await monitor.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await monitor.close();
  process.exit(0);
});

startServer();