import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { PerformanceLog, MCPServer } from './types';

export class DatabaseManager {
  private db: Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = './mcp-monitor.db') {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create MCP Servers table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS mcp_servers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        url TEXT,
        category TEXT,
        version TEXT,
        enabled BOOLEAN DEFAULT TRUE,
        cost_per_call REAL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Performance Logs table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS performance_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        latency_ms REAL NOT NULL,
        success BOOLEAN NOT NULL,
        error_type TEXT,
        tokens_used INTEGER,
        cost_usd REAL,
        metadata TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_performance_logs_server_name 
      ON performance_logs(server_name);
      
      CREATE INDEX IF NOT EXISTS idx_performance_logs_timestamp 
      ON performance_logs(timestamp);
      
      CREATE INDEX IF NOT EXISTS idx_performance_logs_operation 
      ON performance_logs(operation);
    `);
  }

  async addServer(server: Omit<MCPServer, 'id' | 'addedAt'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(
      `INSERT OR REPLACE INTO mcp_servers 
       (name, url, category, version, enabled, cost_per_call) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        server.name,
        server.url || null,
        server.category || null,
        server.version || null,
        server.enabled ? 1 : 0,
        server.costPerCall || null
      ]
    );

    return result.lastID!;
  }

  async getServer(name: string): Promise<MCPServer | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.get(
      `SELECT * FROM mcp_servers WHERE name = ?`,
      [name]
    );

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      url: row.url,
      category: row.category,
      version: row.version,
      enabled: Boolean(row.enabled),
      costPerCall: row.cost_per_call,
      addedAt: new Date(row.added_at)
    };
  }

  async getAllServers(): Promise<MCPServer[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(`SELECT * FROM mcp_servers ORDER BY name`);
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      url: row.url,
      category: row.category,
      version: row.version,
      enabled: Boolean(row.enabled),
      costPerCall: row.cost_per_call,
      addedAt: new Date(row.added_at)
    }));
  }

  async logPerformance(log: Omit<PerformanceLog, 'id' | 'timestamp'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.run(
      `INSERT INTO performance_logs 
       (server_name, operation, latency_ms, success, error_type, tokens_used, cost_usd, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        log.serverName,
        log.operation,
        log.latencyMs,
        log.success ? 1 : 0,
        log.errorType || null,
        log.tokensUsed || null,
        log.costUsd || null,
        log.metadata ? JSON.stringify(log.metadata) : null
      ]
    );

    return result.lastID!;
  }

  async getPerformanceLogs(
    serverName?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 1000
  ): Promise<PerformanceLog[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `SELECT * FROM performance_logs WHERE 1=1`;
    const params: any[] = [];

    if (serverName) {
      query += ` AND server_name = ?`;
      params.push(serverName);
    }

    if (startDate) {
      query += ` AND timestamp >= ?`;
      params.push(startDate.toISOString());
    }

    if (endDate) {
      query += ` AND timestamp <= ?`;
      params.push(endDate.toISOString());
    }

    query += ` ORDER BY timestamp DESC LIMIT ?`;
    params.push(limit);

    const rows = await this.db.all(query, params);

    return rows.map((row: any) => ({
      id: row.id,
      serverName: row.server_name,
      operation: row.operation,
      latencyMs: row.latency_ms,
      success: Boolean(row.success),
      errorType: row.error_type,
      tokensUsed: row.tokens_used,
      costUsd: row.cost_usd,
      timestamp: new Date(row.timestamp),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    }));
  }

  async getMetrics(
    serverName?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT 
        server_name,
        COUNT(*) as total_calls,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_calls,
        AVG(latency_ms) as avg_latency,
        MIN(latency_ms) as min_latency,
        MAX(latency_ms) as max_latency,
        SUM(cost_usd) as total_cost
      FROM performance_logs
      WHERE 1=1
    `;

    const params: any[] = [];

    if (serverName) {
      query += ` AND server_name = ?`;
      params.push(serverName);
    }

    if (startDate) {
      query += ` AND timestamp >= ?`;
      params.push(startDate.toISOString());
    }

    if (endDate) {
      query += ` AND timestamp <= ?`;
      params.push(endDate.toISOString());
    }

    query += ` GROUP BY server_name`;

    const rows = await this.db.all(query, params);

    return rows.map((row: any) => ({
      serverName: row.server_name,
      totalCalls: row.total_calls,
      successfulCalls: row.successful_calls,
      errorCalls: row.total_calls - row.successful_calls,
      successRate: row.successful_calls / row.total_calls,
      avgLatencyMs: row.avg_latency,
      minLatencyMs: row.min_latency,
      maxLatencyMs: row.max_latency,
      totalCostUsd: row.total_cost || 0
    }));
  }

  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.db.run(
      `DELETE FROM performance_logs WHERE timestamp < ?`,
      [cutoffDate.toISOString()]
    );

    return result.changes || 0;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}