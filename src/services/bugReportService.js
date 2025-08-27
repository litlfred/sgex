import githubService from './githubService';
import issueTrackingService from './issueTrackingService';
import { lazyLoadYaml } from '../utils/lazyRouteUtils';

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
      const yaml = await lazyLoadYaml();
      const template = yaml.load(yamlContent);
      
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
  generateIssueBody(template, formData, includeConsole = false, consoleOutput = '', contextData = {}, screenshotBlob = null) {
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
    
    // Add screenshot reference if provided
    if (screenshotBlob) {
      body += `## Screenshot\n\n*A screenshot has been captured and will be attached to this issue.*\n\n`;
    }
    
    // Add console output if requested
    if (includeConsole && consoleOutput) {
      const truncatedOutput = this._truncateConsoleOutput(consoleOutput);
      body += `## Console Output\n\n\`\`\`\n${truncatedOutput}\n\`\`\`\n\n`;
    }
    
    // Add enhanced environment and context information
    body += this._generateContextualInfo(contextData);
    
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

  // Generate comprehensive context information including environment and user context
  _generateContextualInfo(contextData = {}) {
    // Capture basic environment info
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
      },
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Capture SGEX-specific context
    const sgexContext = this._extractSGEXContext(contextData);

    // Combine all context information
    const fullContext = {
      environment: env,
      sgexContext: sgexContext
    };
    
    return `## Environment & Context\n\n\`\`\`json\n${JSON.stringify(fullContext, null, 2)}\n\`\`\``;
  }

  // Extract SGEX-specific contextual information
  _extractSGEXContext(contextData = {}) {
    const context = {
      page: {
        id: contextData.pageId || this._detectCurrentPage(),
        url: window.location.href,
        pathname: window.location.pathname
      },
      authentication: {
        isAuthenticated: this._isUserAuthenticated(),
        authMode: this._getAuthenticationMode()
      }
    };

    // Add repository context if available
    if (contextData.repository) {
      context.repository = {
        name: contextData.repository.name || contextData.repository,
        owner: contextData.repository.owner || contextData.repository.split('/')[0],
        branch: contextData.branch || 'unknown'
      };
    }

    // Add DAK context if available
    if (contextData.selectedDak) {
      context.dak = {
        name: contextData.selectedDak.name,
        description: contextData.selectedDak.description,
        compliance: contextData.selectedDak.compliance
      };
    }

    // Add component context if available
    if (contextData.component) {
      context.component = {
        type: contextData.component,
        isEditing: contextData.isEditing || false
      };
    }

    // Add user profile context if available
    if (contextData.profile) {
      context.profile = {
        login: contextData.profile.login,
        type: contextData.profile.type
      };
    }

    // Add any other relevant context
    if (contextData.hasQuestionnaires !== undefined) {
      context.features = context.features || {};
      context.features.hasQuestionnaires = contextData.hasQuestionnaires;
    }

    if (contextData.selectedReferencesCount !== undefined) {
      context.features = context.features || {};
      context.features.selectedReferencesCount = contextData.selectedReferencesCount;
    }

    return context;
  }

  // Detect current page from URL if pageId not provided
  _detectCurrentPage() {
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(Boolean);
    
    if (pathSegments.length > 0) {
      return pathSegments[pathSegments.length - 1] || 'unknown';
    }
    
    return 'root';
  }

  // Check if user is authenticated (avoiding circular import)
  _isUserAuthenticated() {
    try {
      // Check for common authentication indicators
      const hasToken = localStorage.getItem('github_token') || 
                      sessionStorage.getItem('github_token') ||
                      window.githubToken;
      return !!hasToken;
    } catch (error) {
      return false;
    }
  }

  // Determine authentication mode
  _getAuthenticationMode() {
    if (this._isUserAuthenticated()) {
      return 'authenticated';
    } else if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
      return 'local_development';
    } else {
      return 'demo_mode';
    }
  }

  // Take a screenshot of the current page
  async takeScreenshot() {
    try {
      // Check if the browser supports the Screen Capture API
      if ('getDisplayMedia' in navigator.mediaDevices) {
        return await this._takeScreenshotWithScreenCapture();
      } else if ('html2canvas' in window) {
        // Fallback to html2canvas if available
        return await this._takeScreenshotWithHtml2Canvas();
      } else {
        // If no screenshot capabilities available, return null
        console.warn('Screenshot functionality not available in this browser');
        return null;
      }
    } catch (error) {
      console.warn('Failed to take screenshot:', error);
      return null;
    }
  }

  // Take screenshot using Screen Capture API (requires user permission)
  async _takeScreenshotWithScreenCapture() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          
          // Stop the stream
          stream.getTracks().forEach(track => track.stop());
          
          // Convert to blob
          canvas.toBlob(resolve, 'image/png');
        };
        
        video.onerror = reject;
      });
    } catch (error) {
      console.warn('Screen capture failed:', error);
      return null;
    }
  }

  // Fallback screenshot using html2canvas (if loaded)
  async _takeScreenshotWithHtml2Canvas() {
    try {
      if (typeof window.html2canvas !== 'function') {
        console.warn('html2canvas not available');
        return null;
      }
      
      const canvas = await window.html2canvas(document.body, {
        height: window.innerHeight,
        width: window.innerWidth,
        scrollX: 0,
        scrollY: 0
      });
      
      return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });
    } catch (error) {
      console.warn('html2canvas screenshot failed:', error);
      return null;
    }
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
  async submitIssue(owner, repo, template, formData, includeConsole = false, consoleOutput = '', contextData = {}, screenshotBlob = null) {
    try {
      // Generate title
      const titlePrefix = template.title || '';
      const title = titlePrefix + (formData.title || 'Issue submitted via SGEX');
      
      // Generate body
      const body = this.generateIssueBody(template, formData, includeConsole, consoleOutput, contextData, screenshotBlob);
      
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
      
      // TODO: If screenshot is provided and issue was created successfully,
      // we would need to upload the screenshot as an attachment
      // This requires additional GitHub API calls for file uploads
      if (screenshotBlob && result.success && result.issue) {
        console.log('Screenshot captured but attachment upload not yet implemented');
        // Future enhancement: Upload screenshot to GitHub issue
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
  generateIssueUrl(owner, repo, template, formData, includeConsole = false, consoleOutput = '', contextData = {}, screenshotBlob = null) {
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
      
      // Add contextual information as a separate field
      const contextInfo = this._generateContextualInfo(contextData);
      params.set('context-info', contextInfo);
      
      // Add note about screenshot if provided
      if (screenshotBlob) {
        params.set('screenshot-note', 'A screenshot was captured and will be manually attached to this issue.');
      }
    } else {
      // Fallback to body parameter for non-template issues
      const body = this.generateIssueBody(template, formData, includeConsole, consoleOutput, contextData, screenshotBlob);
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