/**
 * Jest test wrapper for Profile Creation Compliance
 * 
 * This ensures compliance tests are run as part of the normal test suite
 */

const ProfileCreationComplianceTest = require('./profileCreationCompliance');

describe('Profile Creation Compliance', () => {
  let complianceTest;
  
  beforeAll(() => {
    complianceTest = new ProfileCreationComplianceTest();
  });

  test('should pass profile creation compliance requirements', async () => {
    const passed = await complianceTest.runCompliance();
    const status = complianceTest.getComplianceStatus();
    
    if (!passed) {
      const violationSummary = status.violationTypes.join(', ');
      throw new Error(`Profile creation compliance failed with ${status.violations} violations. Types: ${violationSummary}. See test output for details.`);
    }
    
    expect(passed).toBe(true);
    expect(status.violations).toBe(0);
  }, 30000); // 30 second timeout for file scanning

  test('should scan a reasonable number of files', async () => {
    // This test ensures our compliance scanner is actually working
    const status = complianceTest.getComplianceStatus();
    
    expect(status.scannedFiles).toBeGreaterThan(10); // Should scan at least 10 files
    expect(status.totalFiles).toBeGreaterThan(10);
  });
});