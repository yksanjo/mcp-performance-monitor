
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { PerformanceMetrics } from '../api/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

interface PerformanceChartProps {
  metrics: PerformanceMetrics[];
}

function PerformanceChart({ metrics }: PerformanceChartProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 mb-2">No performance data available</div>
          <div className="text-sm text-gray-500">Start monitoring MCP servers to see metrics</div>
        </div>
      </div>
    );
  }

  // Prepare data for bar chart (success rates)
  const barChartData = {
    labels: metrics.map(m => m.serverName),
    datasets: [
      {
        label: 'Success Rate',
        data: metrics.map(m => m.successRate * 100),
        backgroundColor: metrics.map(m => {
          if (m.successRate >= 0.95) return '#22c55e'; // success-500
          if (m.successRate >= 0.85) return '#eab308'; // warning-500
          return '#ef4444'; // error-500
        }),
        borderColor: metrics.map(m => {
          if (m.successRate >= 0.95) return '#16a34a'; // success-600
          if (m.successRate >= 0.85) return '#ca8a04'; // warning-600
          return '#dc2626'; // error-600
        }),
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for line chart (latency)
  const lineChartData = {
    labels: metrics.map(m => m.serverName),
    datasets: [
      {
        label: 'Average Latency (ms)',
        data: metrics.map(m => m.avgLatencyMs),
        borderColor: '#3b82f6', // primary-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'P95 Latency (ms)',
        data: metrics.map(m => m.p95LatencyMs),
        borderColor: '#8b5cf6', // purple-500
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: false,
        borderDash: [5, 5],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Success Rate: ${context.raw.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Success Rate (%)',
        },
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw.toFixed(0)}ms`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Latency (ms)',
        },
        ticks: {
          callback: (value: any) => `${value}ms`,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Success Rates by Server</h3>
        <div className="h-64">
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Latency Metrics</h3>
        <div className="h-64">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-primary-500 rounded-full mr-2"></div>
            <span>Average Latency</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-purple-500 rounded-full mr-2"></div>
            <span>P95 Latency</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Fastest Server</div>
          <div className="text-lg font-bold text-gray-900">
            {metrics.reduce((prev, current) => 
              prev.avgLatencyMs < current.avgLatencyMs ? prev : current
            ).serverName}
          </div>
          <div className="text-sm text-gray-500">
            {Math.round(metrics.reduce((prev, current) => 
              prev.avgLatencyMs < current.avgLatencyMs ? prev : current
            ).avgLatencyMs)}ms avg
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Most Reliable</div>
          <div className="text-lg font-bold text-gray-900">
            {metrics.reduce((prev, current) => 
              prev.successRate > current.successRate ? prev : current
            ).serverName}
          </div>
          <div className="text-sm text-gray-500">
            {(metrics.reduce((prev, current) => 
              prev.successRate > current.successRate ? prev : current
            ).successRate * 100).toFixed(1)}% success rate
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Most Used</div>
          <div className="text-lg font-bold text-gray-900">
            {metrics.reduce((prev, current) => 
              prev.totalCalls > current.totalCalls ? prev : current
            ).serverName}
          </div>
          <div className="text-sm text-gray-500">
            {metrics.reduce((prev, current) => 
              prev.totalCalls > current.totalCalls ? prev : current
            ).totalCalls.toLocaleString()} calls
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceChart;