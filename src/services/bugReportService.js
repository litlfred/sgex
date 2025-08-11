import githubService from './githubService';
import issueTrackingService from './issueTrackingService';

class BugReportService {
  constructor() {
    this.templates = new Map();
    this.templateCache = new Map();
  }

  // Fetch available bug report templates from GitHub
  async fetchIssueTemplates(owner = 'litlfred', repo = 'sgex') {
    try {
      // Try to get templates from .github/ISSUE_TEMPLATE directory
      const templates = await this._fetchTemplatesFromDirectory(owner, repo, '.github/ISSUE_TEMPLATE');
      
      // Cache the templates
      const cacheKey = `${owner}/${repo}`;
      this.templateCache.set(cacheKey, {
        templates,
        fetchedAt: Date.now()
      });
      
      return templates;
    } catch (error) {
      console.warn('Failed to fetch issue templates:', error);
      // Return default templates if fetching fails
      return this._getDefaultTemplates();
    }
  }

  // Fetch templates from a specific directory
  async _fetchTemplatesFromDirectory(owner, repo, path) {
    const templates = [];
    
    try {
      const contents = await githubService.getDirectoryContents(owner, repo, path);
      
      // Filter for YAML files
      const yamlFiles = contents.filter(file => 
        file.type === 'file' && 
        (file.name.endsWith('.yml') || file.name.endsWith('.yaml')) &&
        file.name !== 'config.yml' // Skip config file
      );
      
      // Fetch and parse each template
      for (const file of yamlFiles) {
        try {
          const fileContent = await githubService.getFileContent(owner, repo, file.path);
          const template = await this._parseIssueTemplate(fileContent, file.name);
          if (template) {
            templates.push(template);
          }
        } catch (error) {
          console.warn(`Failed to parse template ${file.name}:`, error);
        }
      }
      
      return templates;
    } catch (error) {
      console.warn(`Failed to fetch templates from ${path}:`, error);
      return [];
    }
  }

  // Parse a YAML issue template
  async _parseIssueTemplate(yamlContent, filename) {
    try {
      // Lazy load js-yaml to improve initial page responsiveness
      const jsYaml = await import('js-yaml');
      const template = jsYaml.default.load(yamlContent);
      
      if (!template || !template.name || !template.body) {
        console.warn(`Invalid template structure in ${filename}`);
        return null;
      }
      
      // Determine template type from filename
      const templateType = this._getTemplateType(filename);
      
      return {
        id: filename.replace(/\.(yml|yaml)$/, ''),
        name: template.name,
        description: template.description || '',
        title: template.title || '',
        labels: template.labels || [],
        body: template.body || [],
        filename,
        type: templateType
      };
    } catch (error) {
      console.error(`Failed to parse YAML template ${filename}:`, error);
      return null;
    }
  }

  // Determine template type from filename
  _getTemplateType(filename) {
    const name = filename.toLowerCase();
    if (name.includes('bug')) return 'bug';
    if (name.includes('feature')) return 'feature';
    if (name.includes('question')) return 'question';
    if (name.includes('documentation')) return 'documentation';
    return 'general';
  }

  // Get default templates as fallback (public method)
  getDefaultTemplates() {
    return this._getDefaultTemplates();
  }

  // Get default templates as fallback
  _getDefaultTemplates() {
    return [
      {
        id: 'bug_report',
        name: 'Bug Report',
        description: 'File a bug report to help us improve',
        title: '[Bug]: ',
        labels: ['bug'],
        type: 'bug',
        body: [
          {
            type: 'textarea',
            id: 'what-happened',
            attributes: {
              label: 'What happened?',
              description: 'A clear description of what the bug is.'
            },
            validations: {
              required: true
            }
          },
          {
            type: 'textarea',
            id: 'expected',
            attributes: {
              label: 'Expected behavior',
              description: 'What did you expect to happen?'
            },
            validations: {
              required: true
            }
          },
          {
            type: 'textarea',
            id: 'steps',
            attributes: {
              label: 'Steps to reproduce',
              description: 'Steps to reproduce the behavior',
              placeholder: '1. Go to \'...\'\n2. Click on \'....\'\n3. See error'
            },
            validations: {
              required: true
            }
          }
        ]
      },
      {
        id: 'feature_request',
        name: 'Feature Request',
        description: 'Suggest an idea for this project',
        title: '[Feature]: ',
        labels: ['enhancement'],
        type: 'feature',
        body: [
          {
            type: 'textarea',
            id: 'description',
            attributes: {
              label: 'Feature Description',
              description: 'A clear description of what you want to happen.'
            },
            validations: {
              required: true
            }
          },
          {
            type: 'textarea',
            id: 'use-case',
            attributes: {
              label: 'Use Case',
              description: 'Describe the use case and why this feature would be beneficial.'
            },
            validations: {
              required: true
            }
          }
        ]
      },
      {
        id: 'question',
        name: 'Question',
        description: 'Ask for help or clarification about SGEX Workbench',
        title: '[Question]: ',
        labels: ['question'],
        type: 'question',
        body: [
          {
            type: 'textarea',
            id: 'question',
            attributes: {
              label: 'Your Question',
              description: 'What would you like to know?'
            },
            validations: {
              required: true
            }
          },
          {
            type: 'textarea',
            id: 'context',
            attributes: {
              label: 'Context',
              description: 'What were you trying to do when this question came up?'
            },
            validations: {
              required: false
            }
          }
        ]
      }
    ];
  }

  // Get cached templates or fetch if not available
  async getTemplates(owner = 'litlfred', repo = 'sgex', forceRefresh = false) {
    const cacheKey = `${owner}/${repo}`;
    const cached = this.templateCache.get(cacheKey);
    
    // Use cache if available and not forcing refresh and not too old (1 hour)
    if (!forceRefresh && cached && (Date.now() - cached.fetchedAt) < 3600000) {
      return cached.templates;
    }
    
    // Fetch fresh templates
    return await this.fetchIssueTemplates(owner, repo);
  }

  // Generate issue body from form data and template
  generateIssueBody(template, formData, includeConsole = false, consoleOutput = '') {
    let body = '';
    
    // Process template body fields
    for (const field of template.body) {
      if (field.type === 'markdown') {
        // Add markdown content as-is
        body += `${field.attributes.value}\n\n`;
      } else if (field.id && formData[field.id]) {
        // Add field label and value
        const label = field.attributes?.label || field.id;
        const value = formData[field.id];
        
        body += `## ${label}\n\n${value}\n\n`;
      }
    }
    
    // Add console output if requested
    if (includeConsole && consoleOutput) {
      const truncatedOutput = this._truncateConsoleOutput(consoleOutput);
      body += `## Console Output\n\n\`\`\`\n${truncatedOutput}\n\`\`\`\n\n`;
    }
    
    // Add environment information
    body += this._generateEnvironmentInfo();
    
    return body.trim();
  }

  // Truncate console output to prevent hitting GitHub limits
  _truncateConsoleOutput(consoleOutput) {
    // GitHub issue body limit is ~65,536 characters
    // We'll use half that for console output to leave room for other content
    const maxLength = 32768;
    
    if (consoleOutput.length <= maxLength) {
      return consoleOutput;
    }
    
    const truncated = consoleOutput.substring(0, maxLength);
    return `${truncated}\n\n... (output truncated to ${maxLength} characters)`;
  }

  // Generate environment information
  _generateEnvironmentInfo() {
    const env = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height
      }
    };
    
    return `## Environment\n\n\`\`\`json\n${JSON.stringify(env, null, 2)}\n\`\`\``;
  }

  // Capture console output
  captureConsoleOutput() {
    const logs = [];
    const originalMethods = {};
    
    // Store original console methods
    ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
      originalMethods[method] = console[method];
    });
    
    // Override console methods to capture output
    ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
      console[method] = (...args) => {
        // Call original method
        originalMethods[method].apply(console, args);
        
        // Capture the output
        const timestamp = new Date().toISOString();
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        logs.push(`[${timestamp}] ${method.toUpperCase()}: ${message}`);
      };
    });
    
    // Return a function to stop capturing and get logs
    return {
      stop: () => {
        // Restore original console methods
        Object.keys(originalMethods).forEach(method => {
          console[method] = originalMethods[method];
        });
        return logs.join('\n');
      },
      getLogs: () => logs.join('\n')
    };
  }

  // Submit issue via GitHub API
  async submitIssue(owner, repo, template, formData, includeConsole = false, consoleOutput = '') {
    try {
      // Generate title
      const titlePrefix = template.title || '';
      const title = titlePrefix + (formData.title || 'Issue submitted via SGEX');
      
      // Generate body
      const body = this.generateIssueBody(template, formData, includeConsole, consoleOutput);
      
      // Submit issue
      const result = await githubService.createIssue(
        owner,
        repo,
        title,
        body,
        template.labels || [],
        [] // assignees
      );
      
      // If issue was created successfully and user is authenticated, track it
      if (result.success && result.issue && githubService.isAuth()) {
        try {
          await issueTrackingService.addTrackedIssue({
            ...result.issue,
            repository: `${owner}/${repo}`
          });
        } catch (trackingError) {
          console.warn('Failed to track created issue:', trackingError);
          // Don't fail the submission if tracking fails
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to submit issue:', error);
      return {
        success: false,
        error: {
          message: error.message,
          type: 'submission_error'
        }
      };
    }
  }

  // Generate pre-populated GitHub issue URL
  generateIssueUrl(owner, repo, template, formData, includeConsole = false, consoleOutput = '') {
    const params = new URLSearchParams();
    
    // Set template
    if (template.filename) {
      params.set('template', template.filename);
    }
    
    // Set labels
    if (template.labels && template.labels.length > 0) {
      params.set('labels', template.labels.join(','));
    }
    
    // Set title
    const titlePrefix = template.title || '';
    const title = titlePrefix + (formData.title || '');
    if (title) {
      params.set('title', title);
    }
    
    // For template-based issues, populate individual fields instead of body
    if (template.filename && template.body) {
      // Add form field values as individual parameters
      for (const field of template.body) {
        if (field.id && formData[field.id]) {
          params.set(field.id, formData[field.id]);
        }
      }
      
      // Add console output as a separate field if included
      if (includeConsole && consoleOutput) {
        const truncatedOutput = this._truncateConsoleOutput(consoleOutput);
        const consoleField = 'console-output';
        params.set(consoleField, `\`\`\`\n${truncatedOutput}\n\`\`\``);
      }
    } else {
      // Fallback to body parameter for non-template issues
      const body = this.generateIssueBody(template, formData, includeConsole, consoleOutput);
      if (body) {
        // URL encode and truncate if too long
        const maxBodyLength = 2000; // Conservative limit for URL
        const truncatedBody = body.length > maxBodyLength ? 
          body.substring(0, maxBodyLength) + '\n\n... (content truncated, please add remaining details)' : 
          body;
        params.set('body', truncatedBody);
      }
    }
    
    return `https://github.com/${owner}/${repo}/issues/new?${params.toString()}`;
  }

  // Clear template cache
  clearCache() {
    this.templateCache.clear();
  }
}

// Create and export singleton instance
const bugReportService = new BugReportService();
export default bugReportService;