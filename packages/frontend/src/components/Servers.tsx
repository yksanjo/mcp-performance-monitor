import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, MCPServer } from '../api/client';
import { 
  Server, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  ExternalLink,
  Copy
} from 'lucide-react';

function Servers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServer, setNewServer] = useState({
    name: '',
    url: '',
    category: '',
    enabled: true,
    costPerCall: 0.001,
  });

  const queryClient = useQueryClient();

  const { data: servers, isLoading, error } = useQuery<MCPServer[]>({
    queryKey: ['servers'],
    queryFn: apiClient.getServers,
  });

  const addServerMutation = useMutation({
    mutationFn: apiClient.registerServer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      setShowAddForm(false);
      setNewServer({
        name: '',
        url: '',
        category: '',
        enabled: true,
        costPerCall: 0.001,
      });
    },
  });

  const filteredServers = servers?.filter(server =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    server.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServerMutation.mutate(newServer);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
          <div className="ml-3">
            <h3 className="text-sm font-medium text-error-800">
              Failed to load servers
            </h3>
            <div className="mt-2 text-sm text-error-700">
              {error.message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MCP Servers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor your MCP servers
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 btn btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Server
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search servers by name or category..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-secondary inline-flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Add Server Form */}
      {showAddForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Server</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Server Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder="e.g., filesystem, brave-search"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={newServer.category}
                  onChange={(e) => setNewServer({ ...newServer, category: e.target.value })}
                  placeholder="e.g., storage, search, database"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={newServer.url}
                  onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                  placeholder="http://localhost:8000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Call (USD)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={newServer.costPerCall}
                  onChange={(e) => setNewServer({ ...newServer, costPerCall: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={newServer.enabled}
                onChange={(e) => setNewServer({ ...newServer, enabled: e.target.checked })}
              />
              <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                Enable monitoring for this server
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addServerMutation.isPending}
                className="btn btn-primary"
              >
                {addServerMutation.isPending ? 'Adding...' : 'Add Server'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Servers Grid */}
      {filteredServers && filteredServers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map((server) => (
            <div key={server.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Server className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{server.name}</h3>
                    <p className="text-sm text-gray-500">{server.category || 'Uncategorized'}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  server.enabled 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {server.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="space-y-3">
                {server.url && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{server.url}</span>
                    <button
                      onClick={() => copyToClipboard(server.url!)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      title="Copy URL"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {server.costPerCall && (
                  <div className="text-sm">
                    <span className="text-gray-600">Cost per call:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      ${server.costPerCall.toFixed(4)}
                    </span>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  Added {new Date(server.addedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
                <button className="text-sm text-primary-600 hover:text-primary-900 font-medium">
                  <Eye className="h-4 w-4 inline mr-1" />
                  View Metrics
                </button>
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-error-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No servers found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm ? 'Try a different search term' : 'Get started by adding your first MCP server'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 btn btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Server
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      {servers && servers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-value">{servers.length}</div>
            <div className="stat-label">Total Servers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {servers.filter(s => s.enabled).length}
            </div>
            <div className="stat-label">Active Servers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {new Set(servers.map(s => s.category).filter(Boolean)).size}
            </div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ${servers.reduce((sum, s) => sum + (s.costPerCall || 0), 0).toFixed(4)}
            </div>
            <div className="stat-label">Total Cost Rate</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servers;