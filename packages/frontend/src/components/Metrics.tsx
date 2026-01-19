import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import axios from 'axios';

const Metrics = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await axios.get('/api/metrics');
      return response.data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading metrics</div>
      </div>
    );
  }

  const overall = metrics?.overall || {};
  const byServer = metrics?.byServer || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Metrics</h1>
        <p className="text-gray-600 mt-2">
          Real-time performance metrics across all MCP servers
        </p>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {overall.totalCalls?.toLocaleString() || 0}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {overall.successRate ? `${(overall.successRate * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {overall.totalCalls ? `${((overall.errorCalls / overall.totalCalls) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-danger-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${overall.totalCostUsd?.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-warning-600" />
          </div>
        </div>
      </div>

      {/* Server-specific metrics */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Server Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Server
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {byServer.map((server: any) => (
                <tr key={server.serverName} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {server.serverName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {server.totalCalls?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {server.successRate ? `${(server.successRate * 100).toFixed(1)}%` : '0%'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {server.avgLatencyMs ? `${server.avgLatencyMs.toFixed(0)}ms` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${server.totalCostUsd?.toFixed(2) || '0.00'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Time Range</h3>
            <p className="text-sm text-gray-600 mt-1">
              Select time range for metrics analysis
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">
              24 Hours
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
              7 Days
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
              30 Days
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;