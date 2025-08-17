// Simple test to verify the blank template changes without React Router dependencies
import '../services/bugReportService.js';

// Mock the imports that cause issues
jest.mock('../utils/lazyRouteUtils.js', () => ({}));
jest.mock('../services/githubService.js', () => ({}));

// Import the actual bugReportService default function
const BugReportService = require('../services/bugReportService.js').default;

describe('Bug Report Service - Blank Template', () => {
  test('should have blank template as first in default templates', () => {
    const service = new BugReportService();
    const templates = service.getDefaultTemplates();
    
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0].id).toBe('blank');
    expect(templates[0].name).toBe('Blank Issue');
    expect(templates[0].type).toBe('blank');
  });

  test('should recognize blank template type from filename', () => {
    const service = new BugReportService();
    const templateType = service._getTemplateType('blank.yml');
    
    expect(templateType).toBe('blank');
  });

  test('should recognize blank template type from filename with different variations', () => {
    const service = new BugReportService();
    
    expect(service._getTemplateType('blank_issue.yml')).toBe('blank');
    expect(service._getTemplateType('BLANK_TEMPLATE.yaml')).toBe('blank');
    expect(service._getTemplateType('custom-blank.yml')).toBe('blank');
  });
});