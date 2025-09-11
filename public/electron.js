const { app, BrowserWindow, Tray, Menu, shell, dialog, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const net = require('net');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

class SGEXDesktopApp {
  constructor() {
    this.serverProcess = null;
    this.serverPort = null;
    this.tray = null;
    this.mainWindow = null;
    this.isQuitting = false;
    this.restartAttempts = 0;
    this.maxRestartAttempts = 5;
    this.restartDelay = 1000; // Start with 1 second delay
    this.isDev = process.env.ELECTRON_IS_DEV === '1';
    
    log.info('SGEX Desktop App initializing', { isDev: this.isDev });
    
    this.setupApp();
  }

  setupApp() {
    // Set app user model id for Windows
    if (process.platform === 'win32') {
      app.setAppUserModelId('org.who.sgex-workbench');
    }

    // Handle app events
    app.whenReady().then(() => this.onReady());
    app.on('window-all-closed', () => this.onWindowAllClosed());
    app.on('activate', () => this.onActivate());
    app.on('before-quit', () => this.onBeforeQuit());
  }

  async onReady() {
    log.info('App ready, starting initialization');
    
    try {
      await this.createTray();
      await this.startServer();
    } catch (error) {
      log.error('Failed to initialize app', { error: error.message });
      this.showErrorNotification('Failed to start SGEX Workbench', error.message);
    }
  }

  onWindowAllClosed() {
    // On macOS, keep app running when all windows are closed
    if (process.platform !== 'darwin') {
      this.quit();
    }
  }

  onActivate() {
    // On macOS, recreate window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      this.openInBrowser();
    }
  }

  onBeforeQuit() {
    this.isQuitting = true;
    this.stopServer();
  }

  async createTray() {
    const iconPath = this.getIconPath();
    log.info('Creating tray with icon', { iconPath });
    
    this.tray = new Tray(iconPath);
    this.tray.setToolTip('SGEX Workbench');
    
    this.updateTrayMenu();
    
    this.tray.on('click', () => {
      this.openInBrowser();
    });
  }

  getIconPath() {
    // Use different icon formats based on platform
    if (process.platform === 'win32') {
      return path.join(__dirname, 'electron', 'icons', 'icon.ico');
    } else if (process.platform === 'darwin') {
      return path.join(__dirname, 'electron', 'icons', 'icon.icns');
    } else {
      return path.join(__dirname, 'electron', 'icons', 'icon.png');
    }
  }

  updateTrayMenu(serverRunning = false) {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'SGEX Workbench',
        type: 'normal',
        enabled: false
      },
      { type: 'separator' },
      {
        label: serverRunning ? '✅ Server Running' : '❌ Server Stopped',
        type: 'normal',
        enabled: false
      },
      {
        label: 'Open in Browser',
        type: 'normal',
        enabled: serverRunning,
        click: () => this.openInBrowser()
      },
      { type: 'separator' },
      {
        label: 'Restart Service',
        type: 'normal',
        click: () => this.restartServer()
      },
      {
        label: 'Show Logs',
        type: 'normal',
        click: () => this.showLogs()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        type: 'normal',
        click: () => this.quit()
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  async findAvailablePort() {
    const minPort = 40000;
    const maxPort = 49999;
    
    for (let attempts = 0; attempts < 100; attempts++) {
      const port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
      
      if (await this.isPortAvailable(port)) {
        log.info('Found available port', { port });
        return port;
      }
    }
    
    throw new Error('No available ports found in range 40000-49999');
  }

  isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      
      server.on('error', () => resolve(false));
    });
  }

  async startServer() {
    try {
      this.serverPort = await this.findAvailablePort();
      
      log.info('Starting SGEX server', { port: this.serverPort });
      
      const serverScript = path.join(__dirname, 'electron', 'server.js');
      const staticPath = this.isDev 
        ? path.join(process.cwd(), 'build')
        : path.join(process.resourcesPath, 'app');
      
      this.serverProcess = spawn('node', [serverScript], {
        env: {
          ...process.env,
          PORT: this.serverPort,
          STATIC_PATH: staticPath
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.serverProcess.stdout.on('data', (data) => {
        log.info('Server stdout:', data.toString());
      });

      this.serverProcess.stderr.on('data', (data) => {
        log.error('Server stderr:', data.toString());
      });

      this.serverProcess.on('error', (error) => {
        log.error('Server process error', { error: error.message });
        this.handleServerError(error);
      });

      this.serverProcess.on('exit', (code, signal) => {
        log.info('Server process exited', { code, signal });
        if (!this.isQuitting) {
          this.handleServerExit(code, signal);
        }
      });

      // Wait for server to be ready
      await this.waitForServer();
      
      this.updateTrayMenu(true);
      this.restartAttempts = 0; // Reset restart attempts on successful start
      
      log.info('Server started successfully', { 
        port: this.serverPort,
        url: this.getServerUrl()
      });
      
      // Auto-open browser on first start
      setTimeout(() => {
        this.openInBrowser();
      }, 1000);
      
    } catch (error) {
      log.error('Failed to start server', { error: error.message });
      this.handleServerError(error);
    }
  }

  async waitForServer() {
    const maxAttempts = 30;
    const delay = 1000;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await this.checkServerHealth();
        return;
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw new Error('Server failed to start within timeout period');
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  checkServerHealth() {
    return new Promise((resolve, reject) => {
      const req = http.get(this.getServerUrl(), (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Server returned status ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Health check timeout'));
      });
    });
  }

  getServerUrl() {
    return `http://localhost:${this.serverPort}/sgex`;
  }

  async handleServerError(error) {
    this.updateTrayMenu(false);
    
    if (this.restartAttempts < this.maxRestartAttempts && !this.isQuitting) {
      this.restartAttempts++;
      const delay = Math.min(this.restartDelay * Math.pow(2, this.restartAttempts - 1), 30000);
      
      log.info('Attempting to restart server', { 
        attempt: this.restartAttempts, 
        delay,
        maxAttempts: this.maxRestartAttempts 
      });
      
      setTimeout(() => {
        this.startServer();
      }, delay);
      
    } else {
      log.error('Max restart attempts reached or app is quitting');
      this.showErrorNotification(
        'SGEX Service Failed',
        'The SGEX service has stopped unexpectedly and could not be restarted.'
      );
    }
  }

  handleServerExit(code, signal) {
    if (code !== 0 && !this.isQuitting) {
      this.handleServerError(new Error(`Server exited with code ${code}, signal ${signal}`));
    }
  }

  async restartServer() {
    log.info('Manual server restart requested');
    this.restartAttempts = 0; // Reset attempts for manual restart
    
    this.stopServer();
    
    // Wait a moment before restarting
    setTimeout(() => {
      this.startServer();
    }, 1000);
  }

  stopServer() {
    if (this.serverProcess) {
      log.info('Stopping server process');
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
      this.updateTrayMenu(false);
    }
  }

  openInBrowser() {
    if (this.serverPort) {
      const url = this.getServerUrl();
      log.info('Opening browser', { url });
      shell.openExternal(url);
    } else {
      log.warn('Cannot open browser - server not running');
      this.showErrorNotification('Service Not Ready', 'Please wait for the SGEX service to start.');
    }
  }

  showLogs() {
    const logPath = log.transports.file.getFile().path;
    log.info('Opening log file', { logPath });
    shell.showItemInFolder(logPath);
  }

  showErrorNotification(title, message) {
    if (Notification.isSupported()) {
      new Notification({
        title,
        body: message,
        icon: this.getIconPath()
      }).show();
    }
    
    log.error('Error notification', { title, message });
  }

  quit() {
    log.info('Application quit requested');
    this.isQuitting = true;
    this.stopServer();
    app.quit();
  }
}

// Create and start the app
new SGEXDesktopApp();