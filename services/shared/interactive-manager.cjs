#!/usr/bin/env node

/**
 * Interactive Terminal Interface for MCP Services
 * Provides split-screen view with service status indicators and scrollable logging
 * Uses blessed library for reliable cross-platform terminal UI on Ubuntu/Linux
 * Enhanced with service category filtering and SGEX logger integration
 */

const blessed = require('blessed');
const { spawn } = require('child_process');
const { join } = require('path');

class MCPServiceManager {
  constructor() {
    this.services = new Map();
    this.logs = [];
    this.filteredLogs = [];
    this.maxLogs = 1000;
    this.screen = null;
    this.statusBox = null;
    this.logBox = null;
    this.filterBox = null;
    this.currentFilter = {
      categories: ['mcp-dak-faq', 'mcp-publication-api', 'web-service'],
      levels: ['error', 'warn', 'info'],
      searchText: ''
    };
    this.setupUI();
    this.setupServices();
  }

  setupUI() {
    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'SGEX MCP Services Manager - Enhanced Logging'
    });

    // Status panel (top 25% of screen)
    this.statusBox = blessed.box({
      label: ' Service Status ',
      top: 0,
      left: 0,
      width: '100%',
      height: '25%',
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

    // Filter panel (25% to 35% of screen)
    this.filterBox = blessed.box({
      label: ' Log Filters ',
      top: '25%',
      left: 0,
      width: '100%',
      height: '10%',
      border: {
        type: 'line'
      },
      style: {
        fg: 'yellow',
        border: {
          fg: 'yellow'
        },
        label: {
          fg: 'white',
          bold: true
        }
      },
      scrollable: false
    });

    // Log panel (bottom 65% of screen)
    this.logBox = blessed.log({
      label: ' Filtered Service Logs ',
      top: '35%',
      left: 0,
      width: '100%',
      height: '65%',
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
    this.screen.append(this.filterBox);
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

    // Filter controls
    this.screen.key(['f'], () => {
      this.showFilterDialog();
    });

    // Render screen
    this.screen.render();
  }

  setupServices() {
    // Define services with categories
    const serviceConfigs = [
      {
        id: 'dak-faq-mcp',
        name: 'DAK FAQ MCP Service',
        category: 'mcp-dak-faq',
        port: 3001,
        path: 'services/dak-faq-mcp',
        command: 'npm',
        args: ['start']
      },
      {
        id: 'dak-publication-api',
        name: 'DAK Publication API Service', 
        category: 'mcp-publication-api',
        port: 3002,
        path: 'services/dak-publication-api',
        command: 'npm',
        args: ['start']
      },
      {
        id: 'sgex-web',
        name: 'SGEX Web Application',
        category: 'web-service',
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
    this.updateFilterDisplay();
  }

  /**
   * Apply current filter to logs and update display
   */
  applyFilter() {
    this.filteredLogs = this.logs.filter(log => {
      // Filter by category
      if (!this.currentFilter.categories.includes(log.category)) {
        return false;
      }

      // Filter by level
      if (!this.currentFilter.levels.includes(log.level)) {
        return false;
      }

      // Filter by search text
      if (this.currentFilter.searchText && 
          !log.message.toLowerCase().includes(this.currentFilter.searchText.toLowerCase())) {
        return false;
      }

      return true;
    });

    // Clear and repopulate log box
    this.logBox.setContent('');
    this.filteredLogs.forEach(log => {
      this.logBox.log(log.formattedMessage);
    });
    this.screen.render();
  }

  /**
   * Show filter configuration dialog
   */
  showFilterDialog() {
    const filterDialog = blessed.form({
      parent: this.screen,
      keys: true,
      left: 'center',
      top: 'center',
      width: 60,
      height: 20,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'yellow'
        }
      },
      label: ' Configure Log Filters '
    });

    const instructions = blessed.box({
      parent: filterDialog,
      top: 1,
      left: 2,
      width: '90%',
      height: 3,
      content: 'Use arrow keys to navigate, Enter to toggle, Esc to close',
      style: {
        fg: 'cyan'
      }
    });

    // Category checkboxes
    let checkboxTop = 4;
    const categoryCheckboxes = [];
    ['mcp-dak-faq', 'mcp-publication-api', 'web-service'].forEach((cat, index) => {
      const checkbox = blessed.checkbox({
        parent: filterDialog,
        top: checkboxTop + index,
        left: 2,
        width: 25,
        height: 1,
        text: cat,
        checked: this.currentFilter.categories.includes(cat),
        style: {
          fg: 'white'
        }
      });
      categoryCheckboxes.push({ checkbox, category: cat });
    });

    // Level checkboxes
    checkboxTop = 8;
    const levelCheckboxes = [];
    ['error', 'warn', 'info', 'debug'].forEach((level, index) => {
      const checkbox = blessed.checkbox({
        parent: filterDialog,
        top: checkboxTop + index,
        left: 30,
        width: 15,
        height: 1,
        text: level,
        checked: this.currentFilter.levels.includes(level),
        style: {
          fg: 'white'
        }
      });
      levelCheckboxes.push({ checkbox, level });
    });

    // Search textbox
    const searchBox = blessed.textbox({
      parent: filterDialog,
      label: ' Search Text ',
      top: 13,
      left: 2,
      width: '90%',
      height: 3,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'green'
        }
      },
      value: this.currentFilter.searchText
    });

    // Apply button
    const applyButton = blessed.button({
      parent: filterDialog,
      mouse: true,
      keys: true,
      shrink: true,
      padding: {
        left: 1,
        right: 1
      },
      left: 'center',
      top: 17,
      content: 'Apply Filter',
      style: {
        bg: 'green',
        fg: 'white',
        focus: {
          bg: 'blue'
        }
      }
    });

    applyButton.on('press', () => {
      // Update filter from checkboxes
      this.currentFilter.categories = categoryCheckboxes
        .filter(item => item.checkbox.checked)
        .map(item => item.category);
      
      this.currentFilter.levels = levelCheckboxes
        .filter(item => item.checkbox.checked)
        .map(item => item.level);

      this.currentFilter.searchText = searchBox.value || '';

      this.applyFilter();
      this.updateFilterDisplay();
      filterDialog.destroy();
      this.screen.render();
    });

    filterDialog.on('keypress', (ch, key) => {
      if (key.name === 'escape') {
        filterDialog.destroy();
        this.screen.render();
      }
    });

    filterDialog.show();
    filterDialog.focus();
    this.screen.render();
  }

  updateFilterDisplay() {
    let content = '';
    content += '{bold}Active Filters:{/bold}\n';
    content += `Categories: ${this.currentFilter.categories.join(', ')}\n`;
    content += `Levels: ${this.currentFilter.levels.join(', ')}\n`;
    if (this.currentFilter.searchText) {
      content += `Search: "${this.currentFilter.searchText}"\n`;
    }
    content += `Showing: ${this.filteredLogs.length}/${this.logs.length} logs`;

    this.filterBox.setContent(content);
    this.screen.render();
  }

  startService(serviceId) {
    const service = this.services.get(serviceId);
    if (!service || service.status === 'running') {
      return;
    }

    this.log(`Starting ${service.name}...`, 'info', service.category);
    
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
      const lines = data.toString().split('\n').filter((line) => line.trim());
      lines.forEach((line) => {
        this.log(`[${service.name}] ${line}`, 'info', service.category);
      });
      
      // Check if service is ready
      if (data.toString().includes('running on') || data.toString().includes('Server running')) {
        service.status = 'running';
        this.updateStatusDisplay();
      }
    });

    // Handle stderr  
    childProcess.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter((line) => line.trim());
      lines.forEach((line) => {
        this.log(`[${service.name}] ${line}`, 'error', service.category);
      });
    });

    // Handle process exit
    childProcess.on('exit', (code) => {
      service.status = code === 0 ? 'stopped' : 'failed';
      service.process = null;
      this.log(`${service.name} exited with code ${code}`, code === 0 ? 'info' : 'error', service.category);
      this.updateStatusDisplay();
    });

    this.updateStatusDisplay();
  }

  stopService(serviceId) {
    const service = this.services.get(serviceId);
    if (!service || !service.process) {
      return;
    }

    this.log(`Stopping ${service.name}...`, 'info', service.category);
    service.status = 'stopping';
    service.process.kill('SIGTERM');
    
    // Force kill after 5 seconds
    setTimeout(() => {
      if (service.process) {
        service.process.kill('SIGKILL');
        this.log(`Force killed ${service.name}`, 'warn', service.category);
      }
    }, 5000);

    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    let content = '';
    content += '{bold}SGEX MCP Services Manager - Enhanced Logging{/bold}\n';
    content += '{bold}================================================{/bold}\n\n';
    
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
      content += `  Category: ${service.category}\n`;
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
    content += '  [f] Configure Filters\n';
    content += '  [h] Show Help\n';
    content += '  [q] Quit\n';

    this.statusBox.setContent(content);
    this.screen.render();
  }

  log(message, level = 'info', category = 'shared-service') {
    const timestamp = new Date().toISOString();
    const coloredMessage = this.colorizeLogMessage(message, level);
    
    const logEntry = {
      timestamp,
      message,
      level,
      category,
      formattedMessage: `${timestamp} ${coloredMessage}`
    };

    this.logs.push(logEntry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Apply filter and update display
    this.applyFilter();
    this.updateFilterDisplay();
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
{bold}SGEX MCP Services Manager - Enhanced Logging{/bold}

{bold}Service Controls:{/bold}
  [1] - Start DAK FAQ MCP Service (port 3001)
  [2] - Start DAK Publication API Service (port 3002) 
  [3] - Start SGEX Web Application (port 3000)
  [a] - Start All Services
  [s] - Stop All Services

{bold}Log Filtering:{/bold}
  [f] - Open filter configuration dialog
  Filter by: Service categories, log levels, search text
  Categories: mcp-dak-faq, mcp-publication-api, web-service
  Levels: error, warn, info, debug

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
      this.log('Starting all services...', 'info', 'shared-service');
      this.startService('dak-faq-mcp');
      setTimeout(() => this.startService('dak-publication-api'), 2000);
      setTimeout(() => this.startService('sgex-web'), 4000);
    });

    this.screen.key(['s'], () => {
      this.log('Stopping all services...', 'info', 'shared-service');
      for (const [id] of this.services) {
        this.stopService(id);
      }
    });
  }

  shutdown() {
    this.log('Shutting down services manager...', 'info', 'shared-service');
    
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
    this.log('SGEX MCP Services Manager with Enhanced Logging started', 'success', 'shared-service');
    this.log('Press [h] for help, [f] for filters, [a] to start all services, [q] to quit', 'info', 'shared-service');
    this.updateStatusDisplay();
    this.applyFilter();
  }
}

// Check if running directly
if (require.main === module) {
  const manager = new MCPServiceManager();
  manager.start();
}

module.exports = MCPServiceManager;