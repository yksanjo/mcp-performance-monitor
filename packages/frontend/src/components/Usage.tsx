import { useQuery } from '@tanstack/react-query';
import { Activity, Clock, TrendingUp, Users } from 'lucide-react';
import axios from 'axios';

const Usage = () => {
  const { data: usagePatterns, isLoading, error } = useQuery({
    queryKey: ['usage-patterns'],
    queryFn: async () => {
      const response = await axios.get('/api/usage/patterns');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading usage patterns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading usage patterns</div>
      </div>
    );
  }

  const hourlyDistribution = usagePatterns?.hourlyDistribution || [];
  const operationDistribution = usagePatterns?.operationDistribution || [];
  const totalServers = usagePatterns?.totalServers || 0;
  const totalCalls = usagePatterns?.totalCalls || 0;

  // Find peak hour
  const peakHour = hourlyDistribution.reduce((max: any, hour: any) => 
    hour.calls > max.calls ? hour : max, 
    { hour: 0, calls: 0 }
  );

  // Find most common operation
  const mostCommonOperation = operationDistribution[0] || { operation: 'N/A', count: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usage Patterns</h1>
        <p className="text-gray-600 mt-2">
          Analyze usage patterns and optimize your MCP server deployment
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Servers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalServers}
              </p>
            </div>
            <Users className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalCalls.toLocaleString()}
              </p>
            </div>
            <Activity className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peak Hour</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {peakHour.hour}:00
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {peakHour.calls} calls
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Operation</p>
              <p className="text-2xl font-bold text-gray-900 mt-2 truncate">
                {mostCommonOperation.operation}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {mostCommonOperation.count} calls
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-info-600" />
          </div>
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Hourly Distribution</h2>
          <p className="text-sm text-gray-600 mt-1">
            Call volume throughout the day (last 24 hours)
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-12 gap-2">
            {hourlyDistribution.map((hour: any) => {
              const height = Math.max(10, (hour.calls / (peakHour.calls || 1)) * 100);
              return (
                <div key={hour.hour} className="flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">
                    {hour.hour}:00
                  </div>
                  <div
                    className="w-full bg-primary-500 rounded-t"
                    style={{ height: `${height}px` }}
                    title={`${hour.calls} calls`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {hour.calls}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operation Distribution */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Operation Distribution</h2>
          <p className="text-sm text-gray-600 mt-1">
            Most frequently used operations across all servers
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {operationDistribution.slice(0, 10).map((op: any, index: number) => {
              const percentage = totalCalls > 0 ? (op.count / totalCalls) * 100 : 0;
              return (
                <div key={op.operation} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {index + 1}. {op.operation}
                    </div>
                    <div className="text-sm text-gray-500">
                      {op.count.toLocaleString()} calls ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optimization Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          <TrendingUp className="h-5 w-5 inline-block mr-2" />
          Optimization Tips
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5">•</div>
            <p className="ml-3 text-sm text-blue-800">
              <strong>Peak Hours:</strong> Consider scaling resources during {peakHour.hour}:00 when call volume is highest
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5">•</div>
            <p className="ml-3 text-sm text-blue-800">
              <strong>Operation Optimization:</strong> "{mostCommonOperation.operation}" is your most frequent operation - consider caching or optimization
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5">•</div>
            <p className="ml-3 text-sm text-blue-800">
              <strong>Cost Savings:</strong> Review low-usage hours for potential cost optimization opportunities
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Usage;