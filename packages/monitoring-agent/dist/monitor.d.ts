import { MCPCallOptions, MCPCallResult, PerformanceLog, MCPServer } from './types';
export declare class MCPMonitor {
    private dbManager;
    private config;
    private initialized;
    constructor(configPath?: string);
    private loadConfig;
    initialize(): Promise<void>;
    monitorMCPCall(options: MCPCallOptions): Promise<MCPCallResult>;
    private logPerformance;
    private checkAlerts;
    getServerMetrics(serverName: string, timeRange?: {
        start: Date;
        end: Date;
    }): Promise<any>;
    getAllMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<any[]>;
    getPerformanceLogs(serverName?: string, limit?: number): Promise<PerformanceLog[]>;
    registerServer(server: Omit<MCPServer, 'id' | 'addedAt'>): Promise<number>;
    getServers(): Promise<MCPServer[]>;
    cleanup(): Promise<number>;
    close(): Promise<void>;
}
export declare function getMonitor(configPath?: string): MCPMonitor;
export declare function monitorMCPCall(options: MCPCallOptions): Promise<MCPCallResult>;
export declare function initializeMonitor(configPath?: string): Promise<void>;
export declare function closeMonitor(): Promise<void>;
//# sourceMappingURL=monitor.d.ts.map