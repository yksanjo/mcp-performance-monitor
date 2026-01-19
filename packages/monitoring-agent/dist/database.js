"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
class DatabaseManager {
    constructor(dbPath = './mcp-monitor.db') {
        this.db = null;
        this.dbPath = dbPath;
    }
    async initialize() {
        this.db = await (0, sqlite_1.open)({
            filename: this.dbPath,
            driver: sqlite3_1.default.Database
        });
        await this.createTables();
    }
    async createTables() {
        if (!this.db)
            throw new Error('Database not initialized');
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
    async addServer(server) {
        if (!this.db)
            throw new Error('Database not initialized');
        const result = await this.db.run(`INSERT OR REPLACE INTO mcp_servers 
       (name, url, category, version, enabled, cost_per_call) 
       VALUES (?, ?, ?, ?, ?, ?)`, [
            server.name,
            server.url || null,
            server.category || null,
            server.version || null,
            server.enabled ? 1 : 0,
            server.costPerCall || null
        ]);
        return result.lastID;
    }
    async getServer(name) {
        if (!this.db)
            throw new Error('Database not initialized');
        const row = await this.db.get(`SELECT * FROM mcp_servers WHERE name = ?`, [name]);
        if (!row)
            return null;
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
    async getAllServers() {
        if (!this.db)
            throw new Error('Database not initialized');
        const rows = await this.db.all(`SELECT * FROM mcp_servers ORDER BY name`);
        return rows.map((row) => ({
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
    async logPerformance(log) {
        if (!this.db)
            throw new Error('Database not initialized');
        const result = await this.db.run(`INSERT INTO performance_logs 
       (server_name, operation, latency_ms, success, error_type, tokens_used, cost_usd, metadata) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            log.serverName,
            log.operation,
            log.latencyMs,
            log.success ? 1 : 0,
            log.errorType || null,
            log.tokensUsed || null,
            log.costUsd || null,
            log.metadata ? JSON.stringify(log.metadata) : null
        ]);
        return result.lastID;
    }
    async getPerformanceLogs(serverName, startDate, endDate, limit = 1000) {
        if (!this.db)
            throw new Error('Database not initialized');
        let query = `SELECT * FROM performance_logs WHERE 1=1`;
        const params = [];
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
        return rows.map((row) => ({
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
    async getMetrics(serverName, startDate, endDate) {
        if (!this.db)
            throw new Error('Database not initialized');
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
        const params = [];
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
        return rows.map((row) => ({
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
    async cleanupOldLogs(retentionDays = 90) {
        if (!this.db)
            throw new Error('Database not initialized');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const result = await this.db.run(`DELETE FROM performance_logs WHERE timestamp < ?`, [cutoffDate.toISOString()]);
        return result.changes || 0;
    }
    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=database.js.map