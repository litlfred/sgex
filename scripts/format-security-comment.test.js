/**
 * Tests for format-security-comment.js
 * 
 * Tests the security comment formatter that creates condensed PR comments
 * with badges and status indicators.
 */

const fs = require('fs');
const path = require('path');

// Mock fs
jest.mock('fs');

describe('Format Security Comment', () => {
  let module;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Suppress console output during tests
    global.console = {
      ...console,
      log: jest.fn(),
      error: jest.fn()
    };
    
    // Load the module fresh for each test
    module = require('./format-security-comment.js');
  });

  describe('getStatusDisplay', () => {
    it('should return correct display for pass status', () => {
      const display = module.getStatusDisplay('pass', 'none');
      
      expect(display.emoji).toBe('✅');
      expect(display.color).toBe('brightgreen');
      expect(display.circle).toBe('🟢');
    });

    it('should return correct display for critical fail status', () => {
      const display = module.getStatusDisplay('fail', 'critical');
      
      expect(display.emoji).toBe('❌');
      expect(display.color).toBe('critical');
      expect(display.circle).toBe('🔴');
    });

    it('should return correct display for high fail status', () => {
      const display = module.getStatusDisplay('fail', 'high');
      
      expect(display.emoji).toBe('❌');
      expect(display.color).toBe('red');
      expect(display.circle).toBe('🔴');
    });

    it('should return correct display for warn status', () => {
      const display = module.getStatusDisplay('warn', 'moderate');
      
      expect(display.emoji).toBe('⚠️');
      expect(display.color).toBe('yellow');
      expect(display.circle).toBe('🟡');
    });

    it('should return correct display for info status', () => {
      const display = module.getStatusDisplay('info', 'low');
      
      expect(display.emoji).toBe('ℹ️');
      expect(display.color).toBe('blue');
      expect(display.circle).toBe('🔵');
    });

    it('should return correct display for skip status', () => {
      const display = module.getStatusDisplay('skip', 'none');
      
      expect(display.emoji).toBe('⏭️');
      expect(display.color).toBe('lightgrey');
      expect(display.circle).toBe('⚪');
    });

    it('should handle unknown status', () => {
      const display = module.getStatusDisplay('unknown', 'none');
      
      expect(display.emoji).toBe('❓');
      expect(display.color).toBe('lightgrey');
      expect(display.circle).toBe('⚪');
    });
  });

  describe('generateBadgeUrl', () => {
    it('should generate correct shields.io badge URL', () => {
      const url = module.generateBadgeUrl('Security Status', 'SECURE', 'brightgreen');
      
      expect(url).toContain('https://img.shields.io/badge/');
      expect(url).toContain('Security%20Status');
      expect(url).toContain('SECURE');
      expect(url).toContain('brightgreen');
      expect(url).toContain('style=flat-square');
    });

    it('should properly encode special characters', () => {
      const url = module.generateBadgeUrl('Test & Check', 'Pass/Fail', 'green');
      
      expect(url).toContain('Test%20%26%20Check');
      expect(url).toContain('Pass%2FFail');
    });
  });

  describe('formatSecurityComment', () => {
    it('should format comment for all passing checks', () => {
      const results = {
        timestamp: '2025-01-01T00:00:00.000Z',
        summary: {
          overallStatus: 'pass',
          overallSeverity: 'none',
          passed: 7,
          warned: 0,
          failed: 0,
          skipped: 0,
          info: 0,
          total: 7
        },
        checks: [
          {
            name: 'NPM Audit',
            id: 'npm-audit',
            status: 'pass',
            severity: 'none',
            summary: 'No vulnerabilities found',
            details: {},
            recommendation: null
          }
        ]
      };
      
      const comment = module.formatSecurityComment(results);
      
      expect(comment).toContain('## 🔒 Security Check Report');
      expect(comment).toContain('![Security Status]');
      expect(comment).toContain('SECURE');
      expect(comment).toContain('🟢 7 passed');
      expect(comment).toContain('### ✅ Security Status: CLEAN');
      expect(comment).not.toContain('Action Items');
    });

    it('should format comment for checks with warnings', () => {
      const results = {
        timestamp: '2025-01-01T00:00:00.000Z',
        summary: {
          overallStatus: 'warn',
          overallSeverity: 'moderate',
          passed: 5,
          warned: 1,
          failed: 0,
          skipped: 1,
          info: 0,
          total: 7
        },
        checks: [
          {
            name: 'Security Headers',
            id: 'security-headers',
            status: 'warn',
            severity: 'moderate',
            summary: 'Some headers missing',
            details: {},
            recommendation: 'Add missing security headers'
          }
        ]
      };
      
      const comment = module.formatSecurityComment(results);
      
      expect(comment).toContain('WARNINGS');
      expect(comment).toContain('🟢 5 passed');
      expect(comment).toContain('🟡 1 warnings');
      expect(comment).toContain('⚪ 1 skipped');
      expect(comment).toContain('### 🔍 Action Items');
      expect(comment).toContain('### ⚠️ Security Status: WARNINGS');
    });

    it('should format comment for checks with failures', () => {
      const results = {
        timestamp: '2025-01-01T00:00:00.000Z',
        summary: {
          overallStatus: 'fail',
          overallSeverity: 'critical',
          passed: 4,
          warned: 1,
          failed: 2,
          skipped: 0,
          info: 0,
          total: 7
        },
        checks: [
          {
            name: 'NPM Audit',
            id: 'npm-audit',
            status: 'fail',
            severity: 'critical',
            summary: '5 vulnerabilities found',
            details: {
              total: 5,
              critical: 2,
              high: 3
            },
            recommendation: 'Run npm audit fix'
          },
          {
            name: 'Secret Scanning',
            id: 'secret-scan',
            status: 'fail',
            severity: 'critical',
            summary: '2 secrets found',
            details: {
              findings: [
                { file: 'src/config.js', type: 'API Keys' }
              ]
            },
            recommendation: 'Remove hardcoded secrets'
          }
        ]
      };
      
      const comment = module.formatSecurityComment(results);
      
      expect(comment).toContain('ISSUES%20FOUND'); // URL encoded in badge
      expect(comment).toContain('🟢 4 passed');
      expect(comment).toContain('🟡 1 warnings');
      expect(comment).toContain('🔴 2 failed');
      expect(comment).toContain('### 🔍 Action Items');
      expect(comment).toContain('### ❌ Security Status: ACTION REQUIRED');
    });

    it('should include expandable details for npm audit failures', () => {
      const results = {
        timestamp: '2025-01-01T00:00:00.000Z',
        summary: {
          overallStatus: 'fail',
          overallSeverity: 'high',
          passed: 6,
          warned: 0,
          failed: 1,
          skipped: 0,
          info: 0,
          total: 7
        },
        checks: [
          {
            name: 'NPM Audit',
            id: 'npm-audit',
            status: 'fail',
            severity: 'high',
            summary: '10 vulnerabilities found',
            details: {
              total: 10,
              critical: 0,
              high: 5,
              moderate: 3,
              low: 2
            },
            recommendation: 'Run npm audit fix'
          }
        ]
      };
      
      const comment = module.formatSecurityComment(results);
      
      expect(comment).toContain('<details>');
      expect(comment).toContain('<summary>');
      expect(comment).toContain('NPM Audit');
      expect(comment).toContain('Critical: 0');
      expect(comment).toContain('High: 5');
      expect(comment).toContain('Moderate: 3');
      expect(comment).toContain('Low: 2');
      expect(comment).toContain('Run npm audit fix');
    });

    it('should include timestamp in footer', () => {
      const results = {
        timestamp: '2025-01-01T12:34:56.789Z',
        summary: {
          overallStatus: 'pass',
          overallSeverity: 'none',
          passed: 7,
          warned: 0,
          failed: 0,
          skipped: 0,
          info: 0,
          total: 7
        },
        checks: []
      };
      
      const comment = module.formatSecurityComment(results);
      
      expect(comment).toContain('Last checked:');
      expect(comment).toMatch(/\d{4}/); // Contains year
    });
  });

  describe('generateCondensedStatus', () => {
    it('should generate compact status string', () => {
      const results = {
        summary: {
          passed: 5,
          warned: 1,
          failed: 0
        }
      };
      
      const status = module.generateCondensedStatus(results);
      
      expect(status).toContain('5✅');
      expect(status).toContain('1⚠️');
      expect(status).not.toContain('0❌');
    });

    it('should handle all zeros', () => {
      const results = {
        summary: {
          passed: 0,
          warned: 0,
          failed: 0
        }
      };
      
      const status = module.generateCondensedStatus(results);
      
      expect(status).toBe('');
    });
  });

  describe('Table formatting', () => {
    it('should create proper HTML table structure', () => {
      const results = {
        timestamp: '2025-01-01T00:00:00.000Z',
        summary: {
          overallStatus: 'pass',
          overallSeverity: 'none',
          passed: 2,
          warned: 0,
          failed: 0,
          skipped: 0,
          info: 0,
          total: 2
        },
        checks: [
          {
            name: 'Check One',
            id: 'check-1',
            status: 'pass',
            severity: 'none',
            summary: 'All good',
            details: {},
            recommendation: null
          },
          {
            name: 'Check Two',
            id: 'check-2',
            status: 'pass',
            severity: 'none',
            summary: 'Also good',
            details: {},
            recommendation: null
          }
        ]
      };
      
      const comment = module.formatSecurityComment(results);
      
      expect(comment).toContain('<table>');
      expect(comment).toContain('</table>');
      expect(comment).toContain('<tr><th>Check</th><th>Status</th><th>Details</th></tr>');
      expect(comment).toContain('<td><strong>Check One</strong></td>');
      expect(comment).toContain('<td><strong>Check Two</strong></td>');
      expect(comment).toContain('All good');
      expect(comment).toContain('Also good');
    });
  });
});
