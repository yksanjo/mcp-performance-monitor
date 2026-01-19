import { MCPMonitor } from '@mcp-monitor/agent';

async function seedDemoData() {
  console.log('Seeding demo data...');
  
  const monitor = new MCPMonitor();
  await monitor.initialize();

  // Register demo servers
  const demoServers = [
    {
      name: 'filesystem',
      url: 'http://localhost:8001',
      category: 'storage',
      enabled: true,
      costPerCall: 0.0001
    },
    {
      name: 'brave-search',
      url: 'http://localhost:8002',
      category: 'search',
      enabled: true,
      costPerCall: 0.002
    },
    {
      name: 'github',
      url: 'http://localhost:8003',
      category: 'development',
      enabled: true,
      costPerCall: 0.0005
    },
    {
      name: 'sqlite',
      url: 'http://localhost:8004',
      category: 'database',
      enabled: true,
      costPerCall: 0.0003
    },
    {
      name: 'weather',
      url: 'http://localhost:8005',
      category: 'utility',
      enabled: true,
      costPerCall: 0.001
    }
  ];

  for (const server of demoServers) {
    await monitor.registerServer(server);
    console.log(`Registered server: ${server.name}`);
  }

  // Generate demo performance logs
  console.log('Generating demo performance logs...');
  
  const operations = {
    filesystem: ['read_file', 'write_file', 'list_directory', 'delete_file'],
    'brave-search': ['search', 'news_search', 'image_search', 'video_search'],
    github: ['get_repo', 'list_issues', 'create_pr', 'search_code'],
    sqlite: ['query', 'insert', 'update', 'delete'],
    weather: ['current', 'forecast', 'historical', 'alerts']
  };

  const now = new Date();
  
  // Generate logs for the last 7 days
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    for (const server of demoServers) {
      const serverOps = operations[server.name as keyof typeof operations] || ['default_op'];
      
      // Generate 50-200 calls per day per server
      const callsPerDay = Math.floor(Math.random() * 150) + 50;
      
      for (let i = 0; i < callsPerDay; i++) {
        const operation = serverOps[Math.floor(Math.random() * serverOps.length)];
        
        // Simulate varying latency (50ms - 2000ms)
        const latencyMs = Math.floor(Math.random() * 1950) + 50;
        
        // 95% success rate
        const success = Math.random() > 0.05;
        
        // Simulate error types
        let errorType: string | undefined;
        if (!success) {
          const errorTypes = ['timeout', 'auth_error', 'rate_limit', 'server_error'];
          errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        }
        
        // Create timestamp within the day
        const timestamp = new Date(date);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));
        timestamp.setSeconds(Math.floor(Math.random() * 60));
        
        // Simulate token usage for some operations
        let tokensUsed: number | undefined;
        if (server.name === 'brave-search' || server.name === 'github') {
          tokensUsed = Math.floor(Math.random() * 1000) + 100;
        }
        
        // Log the performance data
        await (monitor as any).logPerformance({
          serverName: server.name,
          operation,
          latencyMs,
          success,
          errorType,
          tokensUsed,
          costUsd: server.costPerCall
        });
      }
    }
    
    console.log(`Generated logs for day ${day + 1}/7`);
  }

  console.log('Demo data seeding completed!');
  console.log(`Total servers: ${demoServers.length}`);
  console.log('You can now start the backend and frontend servers.');
  
  await monitor.close();
}

seedDemoData().catch(console.error);