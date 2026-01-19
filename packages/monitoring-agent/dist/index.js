"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = exports.closeMonitor = exports.initializeMonitor = exports.monitorMCPCall = exports.getMonitor = exports.MCPMonitor = void 0;
__exportStar(require("./types"), exports);
__exportStar(require("./monitor"), exports);
// Re-export commonly used functions and classes
var monitor_1 = require("./monitor");
Object.defineProperty(exports, "MCPMonitor", { enumerable: true, get: function () { return monitor_1.MCPMonitor; } });
Object.defineProperty(exports, "getMonitor", { enumerable: true, get: function () { return monitor_1.getMonitor; } });
Object.defineProperty(exports, "monitorMCPCall", { enumerable: true, get: function () { return monitor_1.monitorMCPCall; } });
Object.defineProperty(exports, "initializeMonitor", { enumerable: true, get: function () { return monitor_1.initializeMonitor; } });
Object.defineProperty(exports, "closeMonitor", { enumerable: true, get: function () { return monitor_1.closeMonitor; } });
var database_1 = require("./database");
Object.defineProperty(exports, "DatabaseManager", { enumerable: true, get: function () { return database_1.DatabaseManager; } });
// Default export for convenience
const monitor_2 = require("./monitor");
exports.default = monitor_2.MCPMonitor;
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
//# sourceMappingURL=index.js.map