import bugReportService from '../services/bugReportService';

describe('BugReportService - Blank Template', () => {
  test('should include blank template in default templates', () => {
    const templates = bugReportService.getDefaultTemplates();
    const blankTemplate = templates.find(t => t.type === 'blank');
    
    expect(blankTemplate).toBeDefined();
    expect(blankTemplate.id).toBe('blank');
    expect(blankTemplate.name).toBe('Report an Issue');
    expect(blankTemplate.description).toContain('Create an issue without a template');
    expect(blankTemplate.labels).toEqual(['blank-issue']);
    expect(blankTemplate.type).toBe('blank');
  });

  test('should place blank template first in the list', () => {
    const templates = bugReportService.getDefaultTemplates();
    expect(templates[0].type).toBe('blank');
    expect(templates[0].name).toBe('Report an Issue');
  });

  test('should have minimal form fields for blank template', () => {
    const templates = bugReportService.getDefaultTemplates();
    const blankTemplate = templates.find(t => t.type === 'blank');
    
    expect(blankTemplate.body).toHaveLength(1);
    
    const descriptionField = blankTemplate.body[0];
    expect(descriptionField.type).toBe('textarea');
    expect(descriptionField.id).toBe('description');
    expect(descriptionField.attributes.label).toBe('Description');
    expect(descriptionField.validations.required).toBe(true);
  });

  test('should generate proper issue URL for blank template', () => {
    const templates = bugReportService.getDefaultTemplates();
    const blankTemplate = templates.find(t => t.type === 'blank');
    
    const formData = {
      description: 'Test issue description'
    };
    
    const contextData = {
      pageId: 'test-page',
      selectedDak: { name: 'test-dak' }
    };
    
    const url = bugReportService.generateIssueUrl(
      'litlfred',
      'sgex',
      blankTemplate,
      formData,
      false,
      '',
      contextData
    );
    
    expect(url).toContain('https://github.com/litlfred/sgex/issues/new');
    expect(url).toContain('labels=blank-issue');
    expect(url).toContain('description=Test%20issue%20description');
    expect(url).not.toContain('template=');
  });

  test('should generate proper issue body for blank template', () => {
    const templates = bugReportService.getDefaultTemplates();
    const blankTemplate = templates.find(t => t.type === 'blank');
    
    const formData = {
      description: 'Test issue description'
    };
    
    const contextData = {
      pageId: 'test-page'
    };
    
    const body = bugReportService.generateIssueBody(
      blankTemplate,
      formData,
      false,
      '',
      contextData
    );
    
    expect(body).toContain('## Description');
    expect(body).toContain('Test issue description');
    expect(body).toContain('## Environment & Context');
    expect(body).toContain('"pageId": "test-page"');
  });
});