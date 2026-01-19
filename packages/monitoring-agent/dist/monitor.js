"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPMonitor = void 0;
exports.getMonitor = getMonitor;
exports.monitorMCPCall = monitorMCPCall;
exports.initializeMonitor = initializeMonitor;
exports.closeMonitor = closeMonitor;
const database_1 = require("./database");
const fs = __importStar(require("fs"));
const yaml = __importStar(require("yaml"));
class MCPMonitor {
    constructor(configPath) {
        this.initialized = false;
        this.dbManager = new database_1.DatabaseManager();
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
    loadConfig(configPath) {
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
                this.dbManager = new database_1.DatabaseManager(loadedConfig.storage.path);
            }
        }
        catch (error) {
            console.warn(`Failed to load config from ${configPath}:`, error);
        }
    }
    async initialize() {
        if (this.initialized)
            return;
        await this.dbManager.initialize();
        // Register servers from config
        for (const serverConfig of this.config.servers) {
            const server = {
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
    async monitorMCPCall(options) {
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
            }
            catch (error) {
                const latencyMs = Date.now() - startTime;
                return {
                    success: false,
                    error: error,
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
            }
            catch (error) {
                const latencyMs = Date.now() - startTime;
                return {
                    success: false,
                    error: error,
                    latencyMs,
                    timestamp: new Date()
                };
            }
        }
        const startTime = Date.now();
        let success = false;
        let result;
        let error;
        try {
            result = await options.call();
            success = true;
        }
        catch (err) {
            error = err;
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
    async logPerformance(log) {
        try {
            // Get server info to calculate cost
            const server = await this.dbManager.getServer(log.serverName);
            let costUsd;
            if (server?.costPerCall) {
                costUsd = server.costPerCall;
            }
            await this.dbManager.logPerformance({
                ...log,
                costUsd
            });
        }
        catch (error) {
            console.error('Failed to log performance:', error);
        }
    }
    async checkAlerts(serverName, latencyMs, success) {
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
    async getServerMetrics(serverName, timeRange) {
        if (!this.initialized) {
            await this.initialize();
        }
        const metrics = await this.dbManager.getMetrics(serverName, timeRange?.start, timeRange?.end);
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
    async getAllMetrics(timeRange) {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.dbManager.getMetrics(undefined, timeRange?.start, timeRange?.end);
    }
    async getPerformanceLogs(serverName, limit = 100) {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.dbManager.getPerformanceLogs(serverName, undefined, undefined, limit);
    }
    async registerServer(server) {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.dbManager.addServer(server);
    }
    async getServers() {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.dbManager.getAllServers();
    }
    async cleanup() {
        if (!this.initialized) {
            await this.initialize();
        }
        return await this.dbManager.cleanupOldLogs(this.config.storage.retentionDays);
    }
    async close() {
        await this.dbManager.close();
        this.initialized = false;
    }
}
exports.MCPMonitor = MCPMonitor;
// Singleton instance for convenience
let globalMonitor = null;
function getMonitor(configPath) {
    if (!globalMonitor) {
        globalMonitor = new MCPMonitor(configPath);
    }
    return globalMonitor;
}
async function monitorMCPCall(options) {
    const monitor = getMonitor();
    return await monitor.monitorMCPCall(options);
}
async function initializeMonitor(configPath) {
    const monitor = getMonitor(configPath);
    await monitor.initialize();
}
async function closeMonitor() {
    if (globalMonitor) {
        await globalMonitor.close();
        globalMonitor = null;
    }
}
//# sourceMappingURL=monitor.js.map