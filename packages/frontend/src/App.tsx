import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './components/Dashboard';
import Servers from './components/Servers';
import Metrics from './components/Metrics';
import Usage from './components/Usage';
import { Activity, Server, BarChart3, TrendingUp } from 'lucide-react';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="ml-3 text-xl font-bold text-gray-900">
                      MCP Monitor
                    </span>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-primary-500"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/servers"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300"
                    >
                      <Server className="h-4 w-4 mr-2" />
                      Servers
                    </Link>
                    <Link
                      to="/metrics"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Metrics
                    </Link>
                    <Link
                      to="/usage"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Usage
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Demo Mode
                    </div>
                    <div className="relative">
                      <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/servers" element={<Servers />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/usage" element={<Usage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  MCP Performance Monitor v1.0.0 • Demo Data
                </div>
                <div className="text-sm text-gray-500">
                  <a 
                    href="https://github.com/yourusername/mcp-performance-monitor" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;