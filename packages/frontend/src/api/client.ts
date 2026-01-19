import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || 'Server error';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('Network error - please check your connection'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

export interface MCPServer {
  id: number;
  name: string;
  url?: string;
  category?: string;
  version?: string;
  enabled: boolean;
  costPerCall?: number;
  addedAt: string;
}

export interface PerformanceMetrics {
  serverName: string;
  totalCalls: number;
  successfulCalls: number;
  errorCalls: number;
  successRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  totalCostUsd: number;
  callsPerHour: number;
  recentLogs: PerformanceLog[];
}

export interface PerformanceLog {
  id: number;
  serverName: string;
  operation: string;
  latencyMs: number;
  success: boolean;
  errorType?: string;
  tokensUsed?: number;
  costUsd?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface OverallMetrics {
  byServer: PerformanceMetrics[];
  overall: {
    totalCalls: number;
    successfulCalls: number;
    errorCalls: number;
    successRate: number;
    totalCostUsd: number;
  };
}

export interface UsagePatterns {
  hourlyDistribution: Array<{
    hour: number;
    calls: number;
  }>;
  operationDistribution: Array<{
    operation: string;
    count: number;
  }>;
  totalServers: number;
  totalCalls: number;
}

// API methods
export const apiClient = {
  // Servers
  getServers: (): Promise<MCPServer[]> => api.get('/servers'),
  getServer: (id: string): Promise<MCPServer> => api.get(`/servers/${id}`),
  registerServer: (server: Omit<MCPServer, 'id' | 'addedAt'>): Promise<MCPServer> => 
    api.post('/servers', server),

  // Metrics
  getServerMetrics: (serverId: string, timeRange?: string): Promise<PerformanceMetrics> => 
    api.get(`/servers/${serverId}/metrics`, { params: { timeRange } }),
  getAllMetrics: (timeRange?: string): Promise<OverallMetrics> => 
    api.get('/metrics', { params: { timeRange } }),

  // Logs
  getLogs: (serverName?: string, limit?: number): Promise<PerformanceLog[]> => 
    api.get('/logs', { params: { server: serverName, limit } }),

  // Comparison
  compareServers: (serverIds: string[]): Promise<any[]> => 
    api.get('/servers/compare', { params: { ids: serverIds.join(',') } }),

  // Usage patterns
  getUsagePatterns: (): Promise<UsagePatterns> => api.get('/usage/patterns'),

  // Health
  getHealth: (): Promise<{ status: string; timestamp: string }> => api.get('/health'),
};

export default apiClient;