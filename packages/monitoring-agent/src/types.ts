export interface MCPCallOptions {
  serverName: string;
  operation: string;
  call: () => Promise<any>;
  metadata?: Record<string, any>;
}

export interface MCPCallResult {
  success: boolean;
  result?: any;
  error?: Error;
  latencyMs: number;
  timestamp: Date;
}

export interface PerformanceLog {
  id?: number;
  serverName: string;
  operation: string;
  latencyMs: number;
  success: boolean;
  errorType?: string;
  tokensUsed?: number;
  costUsd?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MCPServer {
  id?: number;
  name: string;
  url?: string;
  category?: string;
  version?: string;
  enabled: boolean;
  costPerCall?: number;
  addedAt?: Date;
}

export interface MonitoringConfig {
  monitoring: {
    enabled: boolean;
    sampleRate: number;
  };
  servers: Array<{
    name: string;
    enabled: boolean;
    costPerCall?: number;
    url?: string;
    category?: string;
  }>;
  alerts: {
    latencyThresholdMs: number;
    errorRateThreshold: number;
    dailyCostLimitUsd?: number;
  };
  storage: {
    type: 'sqlite' | 'postgresql';
    path: string;
    retentionDays: number;
  };
}

export interface PerformanceMetrics {
  serverName: string;
  totalCalls: number;
  successfulCalls: number;
  errorCalls: number;
  successRate: number;
  errorRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  totalCostUsd: number;
  callsPerHour: number;
  lastUpdated: Date;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface AggregatedMetrics {
  byServer: Record<string, PerformanceMetrics>;
  overall: {
    totalCalls: number;
    successfulCalls: number;
    errorCalls: number;
    successRate: number;
    avgLatencyMs: number;
    totalCostUsd: number;
  };
  timeSeries: Array<{
    timestamp: Date;
    calls: number;
    successRate: number;
    avgLatencyMs: number;
  }>;
}