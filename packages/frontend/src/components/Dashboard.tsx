import { useQuery } from '@tanstack/react-query';
import { apiClient, OverallMetrics } from '../api/client';
import { 
  Activity, 
  Server, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ServerList from './ServerList';
import PerformanceChart from './PerformanceChart';

function Dashboard() {
  const { data: metrics, isLoading, error } = useQuery<OverallMetrics>({
    queryKey: ['metrics', 'overall'],
    queryFn: () => apiClient.getAllMetrics('24h'),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: servers } = useQuery({
    queryKey: ['servers'],
    queryFn: apiClient.getServers,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-error-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-800">
              Failed to load dashboard data
            </h3>
            <div className="mt-2 text-sm text-error-700">
              {error.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const overall = metrics?.overall || {
    totalCalls: 0,
    successfulCalls: 0,
    errorCalls: 0,
    successRate: 0,
    totalCostUsd: 0,
  };

  const serverMetrics = metrics?.byServer || [];

  // Calculate top performers
  const topServers = [...(serverMetrics || [])]
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 3);

  const worstServers = [...(serverMetrics || [])]
    .sort((a, b) => a.successRate - b.successRate)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Real-time monitoring of MCP server performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <div className="stat-value">{overall.totalCalls.toLocaleString()}</div>
              <div className="stat-label">Total Calls (24h)</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <div className="stat-value">{(overall.successRate * 100).toFixed(1)}%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <div className="stat-value">
                {serverMetrics.length > 0 
                  ? Math.round(serverMetrics.reduce((sum, m) => sum + m.avgLatencyMs, 0) / serverMetrics.length)
                  : 0}ms
              </div>
              <div className="stat-label">Avg Latency</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <div className="stat-value">${overall.totalCostUsd.toFixed(2)}</div>
              <div className="stat-label">Total Cost (24h)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Server List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
            <PerformanceChart metrics={serverMetrics} />
          </div>
        </div>

        {/* Server Status */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Server Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Servers</span>
                  <span className="text-sm font-bold text-gray-900">{servers?.length || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success-600 h-2 rounded-full" 
                    style={{ width: `${(servers?.filter(s => s.enabled).length || 0) / (servers?.length || 1) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Top Performers</h3>
                <div className="space-y-3">
                  {topServers.map((server) => (
                    <div key={server.serverName} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate">{server.serverName}</span>
                      <span className="text-sm font-bold text-success-600">
                        {(server.successRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Needs Attention</h3>
                <div className="space-y-3">
                  {worstServers.map((server) => (
                    <div key={server.serverName} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate">{server.serverName}</span>
                      <span className="text-sm font-bold text-error-600">
                        {(server.successRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full btn btn-primary">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Report
              </button>
              <button className="w-full btn btn-secondary">
                <Server className="h-4 w-4 mr-2" />
                Add New Server
              </button>
              <button className="w-full btn btn-secondary">
                <AlertCircle className="h-4 w-4 mr-2" />
                View Alerts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-primary-600 hover:text-primary-800">
            View All →
          </button>
        </div>
        <ServerList limit={5} />
      </div>
    </div>
  );
}

export default Dashboard;