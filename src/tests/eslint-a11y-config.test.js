/**
 * Test to verify eslint-plugin-jsx-a11y configuration is working
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('ESLint jsx-a11y Configuration', () => {
  test('should have eslint-plugin-jsx-a11y installed', () => {
    const packageJson = require('../../package.json');
    const nodeModules = fs.existsSync(path.join(__dirname, '../../node_modules/eslint-plugin-jsx-a11y'));
    
    // Plugin should be available either as direct dependency or via react-scripts
    expect(nodeModules).toBe(true);
  });

  test('should have .eslintrc.js configuration file', () => {
    const eslintrcPath = path.join(__dirname, '../../.eslintrc.js');
    expect(fs.existsSync(eslintrcPath)).toBe(true);
  });

  test('should include jsx-a11y in ESLint configuration', () => {
    const eslintrc = require('../../.eslintrc.js');
    
    // Should extend jsx-a11y/recommended
    expect(eslintrc.extends).toContain('plugin:jsx-a11y/recommended');
    
    // Should include jsx-a11y plugin
    expect(eslintrc.plugins).toContain('jsx-a11y');
    
    // Should have accessibility rules defined
    expect(eslintrc.rules).toHaveProperty('jsx-a11y/click-events-have-key-events');
    expect(eslintrc.rules).toHaveProperty('jsx-a11y/label-has-associated-control');
  });

  test('should detect jsx-a11y issues when running ESLint', () => {
    try {
      // Create a test file with accessibility issues
      const testFile = path.join(__dirname, 'temp-a11y-test.js');
      const testContent = `
        import React from 'react';
        
        const TestComponent = () => (
          <div>
            <div onClick={() => {}} />
            <label>Input:</label>
            <input type="text" />
            <img src="test.jpg" />
          </div>
        );
        
        export default TestComponent;
      `;
      
      fs.writeFileSync(testFile, testContent);
      
      // Run ESLint on the test file
      const output = execSync(`npx eslint ${testFile} --format=compact`, { 
        encoding: 'utf-8',
        cwd: path.join(__dirname, '../..')
      });
      
      // Clean up test file
      fs.unlinkSync(testFile);
      
      // Should detect jsx-a11y issues
      expect(output).toMatch(/jsx-a11y/);
      
    } catch (error) {
      // Clean up test file if it exists
      const testFile = path.join(__dirname, 'temp-a11y-test.js');
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      
      // ESLint should exit with non-zero code when issues are found
      expect(error.status).toBeGreaterThan(0);
      expect(error.stdout || error.stderr).toMatch(/jsx-a11y/);
    }
  });

  test('should have accessibility linting scripts in package.json', () => {
    const packageJson = require('../../package.json');
    
    expect(packageJson.scripts).toHaveProperty('lint');
    expect(packageJson.scripts).toHaveProperty('lint:a11y');
    expect(packageJson.scripts).toHaveProperty('lint:fix');
  });
});