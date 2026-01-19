import { useQuery } from '@tanstack/react-query';
import { apiClient, MCPServer } from '../api/client';
import { Server, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ServerListProps {
  limit?: number;
}

function ServerList({ limit }: ServerListProps) {
  const { data: servers, isLoading, error } = useQuery<MCPServer[]>({
    queryKey: ['servers'],
    queryFn: apiClient.getServers,
  });

  const { data: metrics } = useQuery({
    queryKey: ['metrics', 'all'],
    queryFn: () => apiClient.getAllMetrics('24h'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-error-400 mx-auto" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load servers</h3>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  if (!servers || servers.length === 0) {
    return (
      <div className="text-center py-8">
        <Server className="h-12 w-12 text-gray-400 mx-auto" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No servers found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by registering your first MCP server.
        </p>
      </div>
    );
  }

  const displayedServers = limit ? servers.slice(0, limit) : servers;

  const getServerMetrics = (serverName: string) => {
    return metrics?.byServer.find(m => m.serverName === serverName);
  };

  const getStatusColor = (successRate: number) => {
    if (successRate >= 0.95) return 'text-success-600';
    if (successRate >= 0.85) return 'text-warning-600';
    return 'text-error-600';
  };

  const getStatusBgColor = (successRate: number) => {
    if (successRate >= 0.95) return 'bg-success-100';
    if (successRate >= 0.85) return 'bg-warning-100';
    return 'bg-error-100';
  };

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Server
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Success Rate
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Avg Latency
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Calls (24h)
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {displayedServers.map((server) => {
            const serverMetrics = getServerMetrics(server.name);
            const successRate = serverMetrics?.successRate || 0;
            
            return (
              <tr key={server.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Server className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{server.name}</div>
                      <div className="text-sm text-gray-500">{server.category || 'Uncategorized'}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBgColor(successRate)} ${getStatusColor(successRate)}`}>
                    {server.enabled ? (
                      <>
                        <div className="h-1.5 w-1.5 rounded-full bg-current mr-1.5"></div>
                        Active
                      </>
                    ) : (
                      'Disabled'
                    )}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <div className="flex items-center">
                    {successRate >= 0.95 ? (
                      <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-error-500 mr-2" />
                    )}
                    <span className={`font-medium ${getStatusColor(successRate)}`}>
                      {(successRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {serverMetrics ? `${Math.round(serverMetrics.avgLatencyMs)}ms` : 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {serverMetrics?.totalCalls.toLocaleString() || '0'}
                    </span>
                  </div>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button className="text-primary-600 hover:text-primary-900">
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {limit && servers.length > limit && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {limit} of {servers.length} servers
            <button className="ml-2 text-primary-600 hover:text-primary-900 font-medium">
              View all servers →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServerList;