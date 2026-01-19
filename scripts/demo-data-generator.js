#!/usr/bin/env node

/**
 * Demo Data Generator for MCP Performance Monitor
 * Generates realistic performance data for testing and demonstration
 */

const fs = require('fs');
const path = require('path');
const { DatabaseManager } = require('../packages/monitoring-agent/dist/database');

// Server configurations
const SERVERS = [
  {
    name: 'filesystem',
    category: 'Local',
    url: 'local://filesystem',
    costPerCall: 0.00001,
    operations: ['read_file', 'write_file', 'list_files', 'delete_file']
  },
  {
    name: 'brave-search',
    category: 'Search',
    url: 'https://api.brave.com/search',
    costPerCall: 0.0001,
    operations: ['search', 'news_search', 'image_search', 'video_search']
  },
  {
    name: 'github',
    category: 'Development',
    url: 'https://api.github.com',
    costPerCall: 0.00005,
    operations: ['get_repo', 'list_issues', 'create_pr', 'read_file']
  },
  {
    name: 'sqlite',
    category: 'Database',
    url: 'local://sqlite',
    costPerCall: 0.00002,
    operations: ['query', 'insert', 'update', 'delete', 'create_table']
  },
  {
    name: 'weather',
    category: 'Data',
    url: 'https://api.weather.com',
    costPerCall: 0.00015,
    operations: ['current_weather', 'forecast', 'historical', 'alerts']
  },
  {
    name: 'notion',
    category: 'Productivity',
    url: 'https://api.notion.com',
    costPerCall: 0.0002,
    operations: ['get_page', 'create_page', 'update_page', 'search']
  },
  {
    name: 'discord',
    category: 'Communication',
    url: 'https://discord.com/api',
    costPerCall: 0.00003,
    operations: ['send_message', 'get_channels', 'create_channel', 'list_members']
  },
  {
    name: 'openai',
    category: 'AI',
    url: 'https://api.openai.com',
    costPerCall: 0.0015,
    operations: ['chat_completion', 'embeddings', 'moderation', 'image_generation']
  }
];

// Error types and probabilities
const ERROR_TYPES = [
  { type: 'timeout', probability: 0.02 },
  { type: 'rate_limit', probability: 0.03 },
  { type: 'auth_error', probability: 0.01 },
  { type: 'network_error', probability: 0.015 },
  { type: 'server_error', probability: 0.01 },
  { type: 'validation_error', probability: 0.005 }
];

// Time patterns (calls per hour for a typical day)
const TIME_PATTERNS = {
  'filesystem': [5, 3, 2, 1, 1, 2, 10, 25, 40, 35, 30, 25, 20, 25, 30, 35, 40, 35, 30, 25, 20, 15, 10, 5],
  'brave-search': [2, 1, 1, 0, 0, 1, 5, 15, 25, 30, 35, 40, 45, 40, 35, 30, 25, 20, 15, 10, 5, 3, 2, 1],
  'github': [1, 0, 0, 0, 0, 1, 3, 10, 20, 25, 30, 35, 30, 25, 20, 15, 10, 8, 6, 4, 3, 2, 1, 1],
  'sqlite': [3, 2, 1, 1, 1, 2, 8, 20, 30, 25, 20, 15, 12, 15, 20, 25, 30, 25, 20, 15, 10, 8, 5, 3],
  'weather': [1, 1, 1, 1, 1, 2, 5, 10, 15, 12, 10, 8, 6, 8, 10, 12, 15, 12, 10, 8, 6, 4, 2, 1],
  'notion': [0, 0, 0, 0, 0, 1, 3, 8, 15, 20, 25, 30, 25, 20, 15, 10, 8, 6, 4, 3, 2, 1, 0, 0],
  'discord': [2, 1, 1, 1, 1, 2, 5, 10, 15, 20, 25, 30, 25, 20, 15, 10, 8, 6, 4, 3, 2, 2, 1, 1],
  'openai': [1, 0, 0, 0, 0, 1, 3, 8, 15, 20, 25, 30, 25, 20, 15, 10, 8, 6, 4, 3, 2, 1, 1, 0]
};

// Latency ranges by server (in milliseconds)
const LATENCY_RANGES = {
  'filesystem': { min: 10, max: 100, p95: 50, p99: 80 },
  'brave-search': { min: 200, max: 2000, p95: 800, p99: 1500 },
  'github': { min: 150, max: 1500, p95: 600, p99: 1200 },
  'sqlite': { min: 20, max: 300, p95: 100, p99: 200 },
  'weather': { min: 100, max: 1000, p95: 400, p99: 800 },
  'notion': { min: 300, max: 2500, p95: 1200, p99: 2000 },
  'discord': { min: 100, max: 800, p95: 350, p99: 600 },
  'openai': { min: 500, max: 5000, p95: 2000, p99: 4000 }
};

// Token usage ranges (for AI services)
const TOKEN_RANGES = {
  'openai': { min: 100, max: 4000, avg: 800 }
};

class DemoDataGenerator {
  constructor(dbPath = './mcp-monitor.db') {
    this.dbManager = new DatabaseManager(dbPath);
  }

  async initialize() {
    await this.dbManager.initialize();
    console.log('Database initialized');
  }

  async registerServers() {
    console.log('Registering servers...');
    
    for (const server of SERVERS) {
      try {
        await this.dbManager.registerServer({
          name: server.name,
          url: server.url,
          category: server.category,
          version: '1.0.0',
          enabled: true,
          costPerCall: server.costPerCall
        });
        console.log(`Registered server: ${server.name}`);
      } catch (error) {
        console.log(`Server ${server.name} already exists or error: ${error.message}`);
      }
    }
  }

  generateLatency(serverName) {
    const range = LATENCY_RANGES[serverName];
    if (!range) return 100;
    
    // Generate realistic latency with some outliers
    const rand = Math.random();
    if (rand < 0.01) {
      // 1% chance of very high latency (outlier)
      return range.max * (1 + Math.random() * 0.5);
    } else if (rand < 0.05) {
      // 5% chance of high latency (p99)
      return range.p99 * (0.8 + Math.random() * 0.4);
    } else if (rand < 0.10) {
      // 10% chance of moderate high latency (p95)
      return range.p95 * (0.9 + Math.random() * 0.2);
    } else {
      // Normal latency
      return range.min + Math.random() * (range.avg || ((range.min + range.max) / 2) - range.min);
    }
  }

  generateTokens(serverName) {
    const range = TOKEN_RANGES[serverName];
    if (!range) return null;
    
    return Math.floor(range.min + Math.random() * (range.max - range.min));
  }

  generateError() {
    const rand = Math.random();
    let cumulative = 0;
    
    for (const error of ERROR_TYPES) {
      cumulative += error.probability;
      if (rand < cumulative) {
        return {
          success: false,
          errorType: error.type
        };
      }
    }
    
    return { success: true, errorType: null };
  }

  generateMetadata(serverName, operation) {
    const metadata = {
      operation,
      timestamp: new Date().toISOString(),
      demo: true
    };
    
    // Add server-specific metadata
    switch (serverName) {
      case 'filesystem':
        metadata.filePath = `/path/to/${operation === 'read_file' ? 'read' : 'write'}_${Math.floor(Math.random() * 100)}.txt`;
        metadata.fileSize = Math.floor(Math.random() * 1000000);
        break;
      case 'brave-search':
        metadata.query = `demo search ${Math.floor(Math.random() * 100)}`;
        metadata.country = ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)];
        break;
      case 'github':
        metadata.repo = `owner/repo-${Math.floor(Math.random() * 10)}`;
        metadata.action = operation;
        break;
      case 'sqlite':
        metadata.table = `table_${Math.floor(Math.random() * 5)}`;
        metadata.queryType = operation;
        break;
      case 'weather':
        metadata.location = `City${Math.floor(Math.random() * 10)}`;
        metadata.units = Math.random() > 0.5 ? 'metric' : 'imperial';
        break;
      case 'openai':
        metadata.model = Math.random() > 0.7 ? 'gpt-4' : 'gpt-3.5-turbo';
        metadata.temperature = 0.7 + Math.random() * 0.3;
        break;
    }
    
    return metadata;
  }

  async generateLogsForPeriod(days = 7) {
    console.log(`Generating demo performance logs for ${days} days...`);
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let totalLogs = 0;
    
    for (let day = 0; day < days; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      
      console.log(`Generating logs for day ${day + 1}/${days} (${currentDate.toDateString()})`);
      
      for (const server of SERVERS) {
        const pattern = TIME_PATTERNS[server.name] || TIME_PATTERNS['filesystem'];
        
        for (let hour = 0; hour < 24; hour++) {
          const callsThisHour = pattern[hour];
          
          for (let call = 0; call < callsThisHour; call++) {
            const timestamp = new Date(currentDate);
            timestamp.setHours(hour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
            
            const operation = server.operations[Math.floor(Math.random() * server.operations.length)];
            const errorResult = this.generateError();
            const latency = this.generateLatency(server.name);
            const tokens = this.generateTokens(server.name);
            
            // Calculate cost
            let cost = server.costPerCall;
            if (server.name === 'openai' && tokens) {
              cost = (tokens / 1000) * 0.0015; // Approximate GPT-3.5 pricing
            }
            
            const log = {
              serverName: server.name,
              operation,
              latencyMs: latency,
              success: errorResult.success,
              errorType: errorResult.errorType,
              tokensUsed: tokens,
              costUsd: cost,
              metadata: this.generateMetadata(server.name, operation)
            };
            
            // Simulate timestamp by adjusting date
            const logWithTimestamp = {
              ...log,
              timestamp
            };
            
            await this.dbManager.logPerformance(logWithTimestamp);
            totalLogs++;
          }
        }
      }
    }
    
    console.log(`Demo data generation completed!`);
    console.log(`Total logs generated: ${totalLogs}`);
    console.log(`Time period: ${days} days`);
    console.log(`Servers: ${SERVERS.length}`);
    
    return totalLogs;
  }

  async generateSummaryReport() {
    const servers = await this.dbManager.getAllServers();
    const metrics = await this.dbManager.getMetrics();
    
    console.log('\n=== DEMO DATA SUMMARY ===');
    console.log(`Total servers: ${servers.length}`);
    
    for (const metric of metrics) {
      console.log(`\n${metric.serverName}:`);
      console.log(`  Total calls: ${metric.totalCalls}`);
      console.log(`  Success rate: ${(metric.successRate * 100).toFixed(1)}%`);
      console.log(`  Avg latency: ${metric.avgLatencyMs.toFixed(0)}ms`);
      console.log(`  Total cost: $${metric.totalCostUsd.toFixed(4)}`);
    }
    
    const totalCalls = metrics.reduce((sum, m) => sum + m.totalCalls, 0);
    const totalCost = metrics.reduce((sum, m) => sum + m.totalCostUsd, 0);
    
    console.log(`\n=== OVERALL ===`);
    console.log(`Total calls: ${totalCalls}`);
    console.log(`Total cost: $${totalCost.toFixed(2)}`);
    console.log(`Avg cost per call: $${(totalCost / totalCalls).toFixed(6)}`);
  }

  async close() {
    await this.dbManager.close();
  }
}

// Main execution
async function main() {
  const generator = new DemoDataGenerator();
  
  try {
    await generator.initialize();
    await generator.registerServers();
    await generator.generateLogsForPeriod(7); // Generate 7 days of data
    await generator.generateSummaryReport();
    
    console.log('\n✅ Demo data generation complete!');
    console.log('You can now start the backend and frontend servers:');
    console.log('  npm run start:backend');
    console.log('  npm run start:frontend');
    console.log('\nOr use the demo command:');
    console.log('  npm run start:demo');
    
  } catch (error) {
    console.error('Error generating demo data:', error);
  } finally {
    await generator.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DemoDataGenerator;