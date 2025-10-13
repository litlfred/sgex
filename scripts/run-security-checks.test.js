/**
 * Tests for run-security-checks.js
 * 
 * Tests the comprehensive security check script focusing on
 * the security summary generation and result structure validation.
 */

describe('Security Check Script', () => {
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
    module = require('./run-security-checks.js');
  });

  describe('Security Summary Generation', () => {
    it('should calculate correct overall status for all passing checks', () => {
      const checks = [
        { status: 'pass', severity: 'none' },
        { status: 'pass', severity: 'none' },
        { status: 'pass', severity: 'none' }
      ];
      
      const summary = module.generateSecuritySummary(checks);
      
      expect(summary.overallStatus).toBe('pass');
      expect(summary.overallSeverity).toBe('none');
      expect(summary.passed).toBe(3);
      expect(summary.failed).toBe(0);
      expect(summary.warned).toBe(0);
    });

    it('should set overall status to fail when any check fails', () => {
      const checks = [
        { status: 'pass', severity: 'none' },
        { status: 'fail', severity: 'critical' },
        { status: 'pass', severity: 'none' }
      ];
      
      const summary = module.generateSecuritySummary(checks);
      
      expect(summary.overallStatus).toBe('fail');
      expect(summary.overallSeverity).toBe('critical');
      expect(summary.passed).toBe(2);
      expect(summary.failed).toBe(1);
    });

    it('should set overall status to warn when checks have warnings but no failures', () => {
      const checks = [
        { status: 'pass', severity: 'none' },
        { status: 'warn', severity: 'moderate' },
        { status: 'pass', severity: 'none' }
      ];
      
      const summary = module.generateSecuritySummary(checks);
      
      expect(summary.overallStatus).toBe('warn');
      expect(summary.overallSeverity).toBe('moderate');
      expect(summary.passed).toBe(2);
      expect(summary.warned).toBe(1);
      expect(summary.failed).toBe(0);
    });

    it('should prioritize critical severity over high', () => {
      const checks = [
        { status: 'fail', severity: 'high' },
        { status: 'fail', severity: 'critical' }
      ];
      
      const summary = module.generateSecuritySummary(checks);
      
      expect(summary.overallSeverity).toBe('critical');
    });

    it('should prioritize high severity over moderate', () => {
      const checks = [
        { status: 'warn', severity: 'moderate' },
        { status: 'warn', severity: 'high' }
      ];
      
      const summary = module.generateSecuritySummary(checks);
      
      expect(summary.overallSeverity).toBe('high');
    });

    it('should count skipped and info status checks', () => {
      const checks = [
        { status: 'pass', severity: 'none' },
        { status: 'skip', severity: 'none' },
        { status: 'info', severity: 'low' }
      ];
      
      const summary = module.generateSecuritySummary(checks);
      
      expect(summary.passed).toBe(1);
      expect(summary.skipped).toBe(1);
      expect(summary.info).toBe(1);
      expect(summary.total).toBe(3);
    });
  });

  describe('Module Exports', () => {
    it('should export required functions', () => {
      expect(module).toHaveProperty('main');
      expect(module).toHaveProperty('generateSecuritySummary');
      expect(module).toHaveProperty('runNpmAudit');
      expect(module).toHaveProperty('checkOutdatedDependencies');
      expect(module).toHaveProperty('runEslintSecurityCheck');
      expect(module).toHaveProperty('checkSecurityHeaders');
      expect(module).toHaveProperty('checkLicenseCompliance');
      expect(module).toHaveProperty('scanForSecrets');
      expect(module).toHaveProperty('checkFrameworkCompliance');
    });

    it('should export functions as callable', () => {
      expect(typeof module.generateSecuritySummary).toBe('function');
      expect(typeof module.runNpmAudit).toBe('function');
      expect(typeof module.checkOutdatedDependencies).toBe('function');
    });
  });
});
