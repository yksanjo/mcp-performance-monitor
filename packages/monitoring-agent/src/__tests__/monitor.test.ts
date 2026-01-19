import { MCPMonitor } from '../monitor';
import { DatabaseManager } from '../database';
import * as fs from 'fs';
import * as path from 'path';

describe('MCPMonitor', () => {
  let monitor: MCPMonitor;
  const testDbPath = './test-mcp-monitor.db';

  beforeEach(async () => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    monitor = new MCPMonitor();
    // Override database path for testing
    (monitor as any).dbManager = new DatabaseManager(testDbPath);
    await monitor.initialize();
  });

  afterEach(async () => {
    await monitor.close();
    
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('monitorMCPCall', () => {
    it('should monitor a successful call', async () => {
      const result = await monitor.monitorMCPCall({
        serverName: 'test-server',
        operation: 'test-operation',
        call: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return 'success';
        }
      });

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.latencyMs).toBeGreaterThanOrEqual(50);
      expect(result.error).toBeUndefined();
    });

    it('should monitor a failed call', async () => {
      const result = await monitor.monitorMCPCall({
        serverName: 'test-server',
        operation: 'test-operation',
        call: async () => {
          await new Promise(resolve => setTimeout(resolve, 30));
          throw new Error('Test error');
        }
      });

      expect(result.success).toBe(false);
      expect(result.result).toBeUndefined();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Test error');
      expect(result.latencyMs).toBeGreaterThanOrEqual(30);
    });

    it('should log performance data', async () => {
      await monitor.monitorMCPCall({
        serverName: 'test-server',
        operation: 'test-operation',
        call: async () => 'success'
      });

      const logs = await monitor.getPerformanceLogs('test-server', 10);
      expect(logs.length).toBe(1);
      expect(logs[0].serverName).toBe('test-server');
      expect(logs[0].operation).toBe('test-operation');
      expect(logs[0].success).toBe(true);
    });
  });

  describe('server management', () => {
    it('should register a new server', async () => {
      const serverId = await monitor.registerServer({
        name: 'new-server',
        url: 'http://localhost:8000',
        category: 'filesystem',
        enabled: true,
        costPerCall: 0.001
      });

      expect(serverId).toBeGreaterThan(0);

      const servers = await monitor.getServers();
      expect(servers.length).toBe(1);
      expect(servers[0].name).toBe('new-server');
      expect(servers[0].url).toBe('http://localhost:8000');
      expect(servers[0].costPerCall).toBe(0.001);
    });

    it('should get server metrics', async () => {
      // Make some calls first
      await monitor.monitorMCPCall({
        serverName: 'metrics-server',
        operation: 'op1',
        call: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'success';
        }
      });

      await monitor.monitorMCPCall({
        serverName: 'metrics-server',
        operation: 'op2',
        call: async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          return 'success';
        }
      });

      const metrics = await monitor.getServerMetrics('metrics-server');
      expect(metrics.serverName).toBe('metrics-server');
      expect(metrics.totalCalls).toBe(2);
      expect(metrics.successfulCalls).toBe(2);
      expect(metrics.successRate).toBe(1);
      expect(metrics.avgLatencyMs).toBeGreaterThan(100);
    });
  });

  describe('configuration', () => {
    it('should load configuration from file', async () => {
      const configPath = './test-config.yaml';
      const configContent = `
monitoring:
  enabled: true
  sample_rate: 0.5

servers:
  - name: "filesystem"
    enabled: true
    cost_per_call: 0.0001
    url: "http://localhost:8001"

alerts:
  latency_threshold_ms: 1000
  error_rate_threshold: 0.1

storage:
  type: "sqlite"
  path: "./test-config.db"
  retention_days: 30
`;

      fs.writeFileSync(configPath, configContent);

      const configuredMonitor = new MCPMonitor(configPath);
      await configuredMonitor.initialize();

      // Clean up
      await configuredMonitor.close();
      fs.unlinkSync(configPath);
      if (fs.existsSync('./test-config.db')) {
        fs.unlinkSync('./test-config.db');
      }
    });
  });
});