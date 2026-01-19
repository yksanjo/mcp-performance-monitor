export * from './types';
export * from './monitor';

// Re-export commonly used functions and classes
export { MCPMonitor, getMonitor, monitorMCPCall, initializeMonitor, closeMonitor } from './monitor';
export { DatabaseManager } from './database';

// Default export for convenience
import { MCPMonitor } from './monitor';
export default MCPMonitor;

// Example usage documentation
/**
 * Example usage:
 * 
 * ```typescript
 * import { monitorMCPCall, initializeMonitor } from '@mcp-monitor/agent';
 * 
 * // Initialize the monitor (optional - will auto-initialize on first call)
 * await initializeMonitor('./mcp-monitor.config.yaml');
 * 
 * // Monitor an MCP call
 * const result = await monitorMCPCall({
 *   serverName: 'filesystem',
 *   operation: 'read_file',
 *   call: async () => {
 *     // Your actual MCP call here
 *     return await mcpClient.readFile('/path/to/file');
 *   },
 *   metadata: {
 *     filePath: '/path/to/file',
 *     userId: 'user123'
 *   }
 * });
 * 
 * if (result.success) {
 *   console.log('Operation succeeded:', result.result);
 * } else {
 *   console.error('Operation failed:', result.error);
 * }
 * ```
 */