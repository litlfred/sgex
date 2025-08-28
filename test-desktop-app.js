#!/usr/bin/env node

/**
 * Test script to verify SGEX Desktop App functionality
 * This simulates the main electron app functionality without the GUI
 */

const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const net = require('net');

class SGEXTest {
  constructor() {
    this.serverProcess = null;
    this.serverPort = null;
  }

  async findAvailablePort() {
    const minPort = 40000;
    const maxPort = 49999;
    
    for (let attempts = 0; attempts < 100; attempts++) {
      const port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
      
      if (await this.isPortAvailable(port)) {
        console.log(`✅ Found available port: ${port}`);
        return port;
      }
    }
    
    throw new Error('❌ No available ports found in range 40000-49999');
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
      
      console.log(`🚀 Starting SGEX server on port ${this.serverPort}`);
      
      const serverScript = path.join(__dirname, 'public', 'electron', 'server.js');
      const staticPath = path.join(__dirname, 'build');
      
      this.serverProcess = spawn('node', [serverScript], {
        env: {
          ...process.env,
          PORT: this.serverPort,
          STATIC_PATH: staticPath
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.serverProcess.stdout.on('data', (data) => {
        console.log('📋 Server:', data.toString().trim());
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('❌ Server Error:', data.toString().trim());
      });

      this.serverProcess.on('error', (error) => {
        console.error('❌ Process Error:', error.message);
      });

      this.serverProcess.on('exit', (code, signal) => {
        console.log(`🛑 Server exited with code ${code}, signal ${signal}`);
      });

      // Wait for server to be ready
      await this.waitForServer();
      
      console.log(`✅ Server started successfully at http://localhost:${this.serverPort}/sgex`);
      
    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      throw error;
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
          throw new Error('❌ Server failed to start within timeout period');
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  checkServerHealth() {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${this.serverPort}/health`, (res) => {
        if (res.statusCode === 200) {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              console.log('💚 Health check response:', response);
              resolve();
            } catch (e) {
              reject(new Error('Invalid health response'));
            }
          });
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

  async testRoutes() {
    console.log('🧪 Testing server routes...');
    
    // Test health endpoint
    await this.checkServerHealth();
    console.log('✅ Health endpoint working');
    
    // Test main route
    return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${this.serverPort}/sgex`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 301) {
          console.log('✅ SGEX route working (status:', res.statusCode + ')');
          resolve();
        } else {
          reject(new Error(`SGEX route returned status ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('SGEX route timeout'));
      });
    });
  }

  stopServer() {
    if (this.serverProcess) {
      console.log('🛑 Stopping server...');
      this.serverProcess.kill('SIGTERM');
      this.serverProcess = null;
    }
  }

  async runTests() {
    try {
      console.log('🧪 Starting SGEX Desktop App Tests\n');
      
      await this.startServer();
      await this.testRoutes();
      
      console.log('\n✅ All tests passed! SGEX Desktop App is working correctly.');
      console.log(`🌐 You can test the app at: http://localhost:${this.serverPort}/sgex`);
      
      // Keep server running for a bit to allow manual testing
      console.log('\n⏱️  Server will stop in 10 seconds...');
      setTimeout(() => {
        this.stopServer();
        console.log('🎉 Test completed successfully!');
        process.exit(0);
      }, 10000);
      
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      this.stopServer();
      process.exit(1);
    }
  }
}

// Run tests if script is called directly
if (require.main === module) {
  const test = new SGEXTest();
  test.runTests();
}

module.exports = SGEXTest;