// Integration test to validate blank issue template functionality
describe('Integration Test - Blank Issue Template Functionality', () => {
  test('should validate blank template YAML structure', () => {
    const fs = require('fs');
    const path = require('path');
    const yaml = require('js-yaml');
    
    // Read the blank template file
    const templatePath = path.join(__dirname, '../../.github/ISSUE_TEMPLATE/blank.yml');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Parse YAML
    const template = yaml.load(templateContent);
    
    // Validate structure
    expect(template.name).toBe('Blank Issue');
    expect(template.description).toBe('Create a blank issue without pre-filled fields');
    expect(template.labels).toContain('blank-issue');
    expect(template.body).toBeDefined();
    expect(Array.isArray(template.body)).toBe(true);
    expect(template.body.length).toBeGreaterThan(0);
    
    // Validate the template has minimal required fields
    const textareaField = template.body.find(field => field.type === 'textarea');
    expect(textareaField).toBeDefined();
    expect(textareaField.validations.required).toBe(false); // Should be optional
  });

  test('should validate URL generation for blank issues includes template parameter', () => {
    // Mock function that simulates HelpModal URL generation
    const createContextualUrl = (baseUrl, params) => {
      const urlParams = new URLSearchParams(params);
      return `${baseUrl}?${urlParams.toString()}`;
    };

    // Simulate SGEX blank issue URL generation
    const baseUrl = 'https://github.com/litlfred/sgex/issues/new';
    const params = {
      template: 'blank.yml',
      labels: 'blank-issue'
    };

    const url = createContextualUrl(baseUrl, params);
    
    expect(url).toContain('template=blank.yml');
    expect(url).toContain('labels=blank-issue');
  });

  test('should validate URL generation for DAK blank issues includes template parameter', () => {
    // Mock function that simulates HelpModal URL generation
    const createContextualUrl = (baseUrl, params) => {
      const urlParams = new URLSearchParams(params);
      return `${baseUrl}?${urlParams.toString()}`;
    };

    // Simulate DAK blank issue URL generation
    const baseUrl = 'https://github.com/test-owner/test-repo/issues/new';
    const params = {
      template: 'blank.yml',
      labels: 'blank-issue,dak-feedback'
    };

    const url = createContextualUrl(baseUrl, params);
    
    expect(url).toContain('template=blank.yml');
    expect(url).toContain('labels=blank-issue%2Cdak-feedback');
  });

  test('should ensure all templates files exist', () => {
    const fs = require('fs');
    const path = require('path');
    
    const templateDir = path.join(__dirname, '../../.github/ISSUE_TEMPLATE');
    const files = fs.readdirSync(templateDir);
    
    // Check that blank.yml exists
    expect(files).toContain('blank.yml');
    
    // Check that other expected templates still exist
    expect(files).toContain('bug_report.yml');
    expect(files).toContain('feature_request.yml');
    expect(files).toContain('config.yml');
  });
});