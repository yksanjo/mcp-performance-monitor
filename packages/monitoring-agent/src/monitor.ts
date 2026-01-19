import { DatabaseManager } from './database';
import { MCPCallOptions, MCPCallResult, PerformanceLog, MCPServer, MonitoringConfig } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

export class MCPMonitor {
  private dbManager: DatabaseManager;
  private config: MonitoringConfig;
  private initialized: boolean = false;

  constructor(configPath?: string) {
    this.dbManager = new DatabaseManager();
    
    // Load default config
    this.config = {
      monitoring: {
        enabled: true,
        sampleRate: 1.0
      },
      servers: [],
      alerts: {
        latencyThresholdMs: 5000,
        errorRateThreshold: 0.05,
        dailyCostLimitUsd: 10.00
      },
      storage: {
        type: 'sqlite',
        path: './mcp-monitor.db',
        retentionDays: 90
      }
    };

    if (configPath) {
      this.loadConfig(configPath);
    }
  }

  private loadConfig(configPath: string): void {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const loadedConfig = yaml.parse(configContent);
      
      // Merge with default config
      this.config = {
        ...this.config,
        ...loadedConfig
      };

      // Update database path if specified
      if (loadedConfig.storage?.path) {
        this.dbManager = new DatabaseManager(loadedConfig.storage.path);
      }
    } catch (error) {
      console.warn(`Failed to load config from ${configPath}:`, error);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.dbManager.initialize();
    
    // Register servers from config
    for (const serverConfig of this.config.servers) {
      const server: Omit<MCPServer, 'id' | 'addedAt'> = {
        name: serverConfig.name,
        url: serverConfig.url,
        category: serverConfig.category,
        enabled: serverConfig.enabled,
        costPerCall: serverConfig.costPerCall
      };
      
      await this.dbManager.addServer(server);
    }

    this.initialized = true;
  }

  async monitorMCPCall(options: MCPCallOptions): Promise<MCPCallResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.config.monitoring.enabled) {
      // If monitoring is disabled, just execute the call
      const startTime = Date.now();
      try {
        const result = await options.call();
        const latencyMs = Date.now() - startTime;
        
        return {
          success: true,
          result,
          latencyMs,
          timestamp: new Date()
        };
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        
        return {
          success: false,
          error: error as Error,
          latencyMs,
          timestamp: new Date()
        };
      }
    }

    // Apply sampling rate
    if (Math.random() > this.config.monitoring.sampleRate) {
      // Skip monitoring for this call based on sample rate
      const startTime = Date.now();
      try {
        const result = await options.call();
        const latencyMs = Date.now() - startTime;
        
        return {
          success: true,
          result,
          latencyMs,
          timestamp: new Date()
        };
      } catch (error) {
        const latencyMs = Date.now() - startTime;
        
        return {
          success: false,
          error: error as Error,
          latencyMs,
          timestamp: new Date()
        };
      }
    }

    const startTime = Date.now();
    let success = false;
    let result: any;
    let error: Error | undefined;

    try {
      result = await options.call();
      success = true;
    } catch (err) {
      error = err as Error;
      success = false;
    }

    const latencyMs = Date.now() - startTime;
    const timestamp = new Date();

    // Log the performance data
    await this.logPerformance({
      serverName: options.serverName,
      operation: options.operation,
      latencyMs,
      success,
      errorType: error?.name,
      metadata: options.metadata
    });

    // Check for alerts
    await this.checkAlerts(options.serverName, latencyMs, success);

    return {
      success,
      result,
      error,
      latencyMs,
      timestamp
    };
  }

  private async logPerformance(log: Omit<PerformanceLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      // Get server info to calculate cost
      const server = await this.dbManager.getServer(log.serverName);
      let costUsd: number | undefined;

      if (server?.costPerCall) {
        costUsd = server.costPerCall;
      }

      await this.dbManager.logPerformance({
        ...log,
        costUsd
      });
    } catch (error) {
      console.error('Failed to log performance:', error);
    }
  }

  private async checkAlerts(serverName: string, latencyMs: number, success: boolean): Promise<void> {
    // Check latency threshold
    if (latencyMs > this.config.alerts.latencyThresholdMs) {
      console.warn(`High latency alert for ${serverName}: ${latencyMs}ms`);
    }

    // Check error rate (we'd need to calculate this from recent logs)
    // For now, just log individual errors
    if (!success) {
      console.warn(`Error alert for ${serverName}: Operation failed`);
    }
  }

  async getServerMetrics(serverName: string, timeRange?: { start: Date; end: Date }): Promise<any> {
    if (!this.initialized) {
      await this.initialize();
    }

    const metrics = await this.dbManager.getMetrics(
      serverName,
      timeRange?.start,
      timeRange?.end
    );

    if (metrics.length === 0) {
      return {
        serverName,
        totalCalls: 0,
        successfulCalls: 0,
        errorCalls: 0,
        successRate: 0,
        avgLatencyMs: 0,
        minLatencyMs: 0,
        maxLatencyMs: 0,
        totalCostUsd: 0
      };
    }

    return metrics[0];
  }

  async getAllMetrics(timeRange?: { start: Date; end: Date }): Promise<any[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.dbManager.getMetrics(
      undefined,
      timeRange?.start,
      timeRange?.end
    );
  }

  async getPerformanceLogs(
    serverName?: string,
    limit: number = 100
  ): Promise<PerformanceLog[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.dbManager.getPerformanceLogs(serverName, undefined, undefined, limit);
  }

  async registerServer(server: Omit<MCPServer, 'id' | 'addedAt'>): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.dbManager.addServer(server);
  }

  async getServers(): Promise<MCPServer[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.dbManager.getAllServers();
  }

  async cleanup(): Promise<number> {
    if (!this.initialized) {
      await this.initialize();
    }

    return await this.dbManager.cleanupOldLogs(this.config.storage.retentionDays);
  }

  async close(): Promise<void> {
    await this.dbManager.close();
    this.initialized = false;
  }
}

// Singleton instance for convenience
let globalMonitor: MCPMonitor | null = null;

export function getMonitor(configPath?: string): MCPMonitor {
  if (!globalMonitor) {
    globalMonitor = new MCPMonitor(configPath);
  }
  return globalMonitor;
}

export async function monitorMCPCall(options: MCPCallOptions): Promise<MCPCallResult> {
  const monitor = getMonitor();
  return await monitor.monitorMCPCall(options);
}

export async function initializeMonitor(configPath?: string): Promise<void> {
  const monitor = getMonitor(configPath);
  await monitor.initialize();
}

export async function closeMonitor(): Promise<void> {
  if (globalMonitor) {
    await globalMonitor.close();
    globalMonitor = null;
  }
}