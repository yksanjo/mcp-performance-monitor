import { PerformanceLog, MCPServer } from './types';
export declare class DatabaseManager {
    private db;
    private dbPath;
    constructor(dbPath?: string);
    initialize(): Promise<void>;
    private createTables;
    addServer(server: Omit<MCPServer, 'id' | 'addedAt'>): Promise<number>;
    getServer(name: string): Promise<MCPServer | null>;
    getAllServers(): Promise<MCPServer[]>;
    logPerformance(log: Omit<PerformanceLog, 'id' | 'timestamp'>): Promise<number>;
    getPerformanceLogs(serverName?: string, startDate?: Date, endDate?: Date, limit?: number): Promise<PerformanceLog[]>;
    getMetrics(serverName?: string, startDate?: Date, endDate?: Date): Promise<any>;
    cleanupOldLogs(retentionDays?: number): Promise<number>;
    close(): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map