#!/usr/bin/env node

/**
 * Interactive Terminal Interface for MCP Services
 * Provides split-screen view with service status indicators and scrollable logging
 * Uses blessed library for reliable cross-platform terminal UI on Ubuntu/Linux
 */

import blessed from 'blessed';
import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

class MCPServiceManager {
  constructor() {
    this.services = new Map();
    this.logs = [];
    this.maxLogs = 1000;
    this.screen = null;
    this.statusBox = null;
    this.logBox = null;
    this.setupUI();
    this.setupServices();
  }

  setupUI() {
    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'SGEX MCP Services Manager'
    });

    // Status panel (top 30% of screen)
    this.statusBox = blessed.box({
      label: ' Service Status ',
      top: 0,
      left: 0,
      width: '100%',
      height: '30%',
      border: {
        type: 'line'
      },
      style: {
        fg: 'cyan',
        border: {
          fg: 'cyan'
        },
        label: {
          fg: 'white',
          bold: true
        }
      },
      scrollable: false
    });

    // Log panel (bottom 70% of screen)
    this.logBox = blessed.log({
      label: ' Service Logs ',
      top: '30%',
      left: 0,
      width: '100%',
      height: '70%',
      border: {
        type: 'line'
      },
      style: {
        fg: 'white',
        border: {
          fg: 'green'
        },
        label: {
          fg: 'white',
          bold: true
        }
      },
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true,
      vi: true
    });

    // Add boxes to screen
    this.screen.append(this.statusBox);
    this.screen.append(this.logBox);

    // Focus on log box for scrolling
    this.logBox.focus();

    // Quit on Escape, q, or C-c
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.shutdown();
    });

    // Help text
    this.screen.key(['h', '?'], () => {
      this.showHelp();
    });

    // Render screen
    this.screen.render();
  }

  setupServices() {
    // Define services
    const serviceConfigs = [
      {
        id: 'dak-faq-mcp',
        name: 'DAK FAQ MCP Service',
        port: 3001,
        path: 'services/dak-faq-mcp',
        command: 'npm',
        args: ['start']
      },
      {
        id: 'dak-publication-api',
        name: 'DAK Publication API Service', 
        port: 3002,
        path: 'services/dak-publication-api',
        command: 'npm',
        args: ['start']
      },
      {
        id: 'sgex-web',
        name: 'SGEX Web Application',
        port: 3000,
        path: '.',
        command: 'npm',
        args: ['start']
      }
    ];

    // Initialize service status
    serviceConfigs.forEach(config => {
      this.services.set(config.id, {
        ...config,
        status: 'stopped',
        process: null,
        startTime: null,
        logs: []
      });
    });

    this.updateStatusDisplay();
  }

  startService(serviceId) {
    const service = this.services.get(serviceId);
    if (!service || service.status === 'running') {
      return;
    }

    this.log(`Starting ${service.name}...`, 'info');
    
    // Set environment variables for MCP logging integration
    const env = {
      ...process.env,
      MCP_INTERACTIVE: 'true',
      MCP_LOG_LEVEL: 'info'
    };

    const childProcess = spawn(service.command, service.args, {
      cwd: join(process.cwd(), service.path),
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    service.process = childProcess;
    service.status = 'starting';
    service.startTime = new Date();

    // Handle stdout
    childProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        this.log(`[${service.name}] ${line}`, 'info');
      });
      
      // Check if service is ready
      if (data.toString().includes('running on') || data.toString().includes('Server running')) {
        service.status = 'running';
        this.updateStatusDisplay();
      }
    });

    // Handle stderr  
    childProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        this.log(`[${service.name}] ${line}`, 'error');
      });
    });

    // Handle process exit
    childProcess.on('exit', (code) => {
      service.status = code === 0 ? 'stopped' : 'failed';
      service.process = null;
      this.log(`${service.name} exited with code ${code}`, code === 0 ? 'info' : 'error');
      this.updateStatusDisplay();
    });

    this.updateStatusDisplay();
  }

  stopService(serviceId) {
    const service = this.services.get(serviceId);
    if (!service || !service.process) {
      return;
    }

    this.log(`Stopping ${service.name}...`, 'info');
    service.status = 'stopping';
    service.process.kill('SIGTERM');
    
    // Force kill after 5 seconds
    setTimeout(() => {
      if (service.process) {
        service.process.kill('SIGKILL');
        this.log(`Force killed ${service.name}`, 'warn');
      }
    }, 5000);

    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    let content = '';
    content += '{bold}SGEX MCP Services Manager{/bold}\n';
    content += '{bold}================================{/bold}\n\n';
    
    for (const [id, service] of this.services) {
      let statusColor = 'red';
      let statusText = service.status.toUpperCase();
      
      switch (service.status) {
        case 'running':
          statusColor = 'green';
          break;
        case 'starting':
          statusColor = 'yellow';
          break;
        case 'stopping':
          statusColor = 'yellow';
          break;
        case 'failed':
          statusColor = 'red';
          break;
        default:
          statusColor = 'grey';
      }

      const uptime = service.startTime && service.status === 'running' 
        ? this.formatUptime(Date.now() - service.startTime.getTime())
        : '';

      content += `{bold}${service.name}{/bold}\n`;
      content += `  Status: {${statusColor}-fg}●{/} {${statusColor}-fg}${statusText}{/}\n`;
      content += `  Port: ${service.port}\n`;
      if (uptime) {
        content += `  Uptime: ${uptime}\n`;
      }
      content += '\n';
    }

    content += '\n{bold}Controls:{/bold}\n';
    content += '  [1] Start DAK FAQ MCP Service\n';
    content += '  [2] Start DAK Publication API Service\n';
    content += '  [3] Start SGEX Web Application\n';
    content += '  [a] Start All Services\n';
    content += '  [s] Stop All Services\n';
    content += '  [h] Show Help\n';
    content += '  [q] Quit\n';

    this.statusBox.setContent(content);
    this.screen.render();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const coloredMessage = this.colorizeLogMessage(message, level);
    
    this.logs.push({
      timestamp,
      message,
      level
    });

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Add to log box
    this.logBox.log(`${timestamp} ${coloredMessage}`);
    this.screen.render();
  }

  colorizeLogMessage(message, level) {
    switch (level) {
      case 'error':
        return `{red-fg}${message}{/}`;
      case 'warn':
        return `{yellow-fg}${message}{/}`;
      case 'info':
        return `{cyan-fg}${message}{/}`;
      case 'debug':
        return `{grey-fg}${message}{/}`;
      case 'success':
        return `{green-fg}${message}{/}`;
      default:
        return message;
    }
  }

  formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  showHelp() {
    const helpBox = blessed.message({
      parent: this.screen,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ' Help ',
      tags: true,
      keys: true,
      hidden: true,
      vi: true
    });

    const helpContent = `
{bold}SGEX MCP Services Manager Help{/bold}

{bold}Service Controls:{/bold}
  [1] - Start DAK FAQ MCP Service (port 3001)
  [2] - Start DAK Publication API Service (port 3002) 
  [3] - Start SGEX Web Application (port 3000)
  [a] - Start All Services
  [s] - Stop All Services

{bold}Navigation:{/bold}
  [Arrow Keys] - Scroll through logs
  [Page Up/Down] - Scroll faster
  [Home/End] - Jump to top/bottom of logs

{bold}Other:{/bold}
  [h] or [?] - Show this help
  [q] or [Esc] - Quit manager
  [Ctrl+C] - Force quit

{bold}Service URLs:{/bold}
  • DAK FAQ MCP: http://127.0.0.1:3001/mcp
  • Publication API: http://127.0.0.1:3002
  • SGEX Web App: http://localhost:3000/sgex

Press any key to close this help.
`;

    helpBox.setContent(helpContent);
    helpBox.show();
    this.screen.render();

    helpBox.once('keypress', () => {
      helpBox.hide();
      this.screen.render();
    });
  }

  setupKeyHandlers() {
    // Service control keys
    this.screen.key(['1'], () => {
      this.startService('dak-faq-mcp');
    });

    this.screen.key(['2'], () => {
      this.startService('dak-publication-api');
    });

    this.screen.key(['3'], () => {
      this.startService('sgex-web');
    });

    this.screen.key(['a'], () => {
      this.log('Starting all services...', 'info');
      this.startService('dak-faq-mcp');
      setTimeout(() => this.startService('dak-publication-api'), 2000);
      setTimeout(() => this.startService('sgex-web'), 4000);
    });

    this.screen.key(['s'], () => {
      this.log('Stopping all services...', 'info');
      for (const [id] of this.services) {
        this.stopService(id);
      }
    });
  }

  shutdown() {
    this.log('Shutting down services manager...', 'info');
    
    // Stop all services
    for (const [id, service] of this.services) {
      if (service.process) {
        service.process.kill('SIGTERM');
      }
    }

    // Wait a bit then force exit
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }

  start() {
    this.setupKeyHandlers();
    this.log('SGEX MCP Services Manager started', 'success');
    this.log('Press [h] for help, [a] to start all services, [q] to quit', 'info');
    this.updateStatusDisplay();
  }
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new MCPServiceManager();
  manager.start();
}

export default MCPServiceManager;