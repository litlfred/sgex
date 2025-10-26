/**
 * Bug Report Service
 * 
 * Service for creating bug reports and GitHub issues with templates and screenshots
 * 
 * @module bugReportService
 */

import githubService from './githubService';
import issueTrackingService from './issueTrackingService';
import { lazyLoadYaml } from '../services/libraryLoaderService';
import repositoryConfig from '../config/repositoryConfig';

// Dynamically import html2canvas when needed
let html2canvas: any = null;
const ensureHtml2Canvas = async () => {
  if (!html2canvas) {
    const module = await import('html2canvas');
    html2canvas = module.default;
  }
  return html2canvas;
};

/**
 * Template body field
 */
export interface TemplateField {
  /** Field type (markdown, textarea, input, dropdown, checkboxes) */
  type: string;
  /** Field ID */
  id?: string;
  /** Field attributes */
  attributes?: {
    label?: string;
    description?: string;
    placeholder?: string;
    value?: string;
    options?: Array<{ label: string; value: string } | string>;
  };
  /** Field validations */
  validations?: {
    required?: boolean;
  };
}

/**
 * Issue template
 * @example { "name": "Bug Report", "description": "Create a bug report", "title": "Bug: ", "labels": ["bug"] }
 */
export interface IssueTemplate {
  /** Template ID */
  id?: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Template about (legacy) */
  about?: string;
  /** Template type (bug, feature, etc.) */
  type?: string;
  /** Default title prefix */
  title?: string;
  /** Default labels */
  labels?: string[];
  /** Template body */
  body?: TemplateField[] | string;
  /** Assignees */
  assignees?: string[];
}

/**
 * Bug report data
 */
export interface BugReportData {
  /** Report title */
  title: string;
  /** Report description */
  description: string;
  /** Steps to reproduce */
  stepsToReproduce?: string;
  /** Expected behavior */
  expectedBehavior?: string;
  /** Actual behavior */
  actualBehavior?: string;
  /** Browser info */
  browserInfo?: string;
  /** Screenshot */
  screenshot?: string;
  /** Labels */
  labels?: string[];
  /** Assignees */
  assignees?: string[];
}

/**
 * Template cache entry
 */
interface TemplateCacheEntry {
  /** Cached templates */
  templates: IssueTemplate[];
  /** Fetch timestamp */
  fetchedAt: number;
}

/**
 * Bug Report Service class
 * 
 * @openapi
 * components:
 *   schemas:
 *     BugReportData:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 */
class BugReportService {
  private templates: Map<string, IssueTemplate>;
  private templateCache: Map<string, TemplateCacheEntry>;

  constructor() {
    this.templates = new Map();
    this.templateCache = new Map();
  }

  /**
   * Fetch available bug report templates from GitHub
   */
  async fetchIssueTemplates(owner: string = repositoryConfig.getOwner(), repo: string = repositoryConfig.getName()): Promise<IssueTemplate[]> {
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

  /**
   * Fetch templates from a specific directory
   */
  async _fetchTemplatesFromDirectory(owner: string, repo: string, path: string): Promise<IssueTemplate[]> {
    const templates: IssueTemplate[] = [];
    
    try {
      const contents = await githubService.getDirectoryContents(owner, repo, path);
      
      if (!contents || !Array.isArray(contents)) {
        return templates;
      }

      for (const file of contents) {
        if (file.type === 'file' && (file.name.endsWith('.md') || file.name.endsWith('.yml') || file.name.endsWith('.yaml'))) {
          const template = await this._parseTemplateFile(owner, repo, file.path);
          if (template) {
            templates.push(template);
          }
        }
      }
      
      return templates;
    } catch (error) {
      console.error('Error fetching templates from directory:', error);
      return templates;
    }
  }

  /**
   * Parse template file
   */
  async _parseTemplateFile(owner: string, repo: string, path: string): Promise<IssueTemplate | null> {
    try {
      const content = await githubService.getFileContent(owner, repo, path);
      
      if (!content) {
        return null;
      }

      // Parse YAML front matter for .md files
      if (path.endsWith('.md')) {
        return await this._parseMarkdownTemplate(content);
      } else if (path.endsWith('.yml') || path.endsWith('.yaml')) {
        return this._parseYAMLTemplate(content);
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing template file:', error);
      return null;
    }
  }

  /**
   * Parse markdown template with YAML front matter
   */
  async _parseMarkdownTemplate(content: string): Promise<IssueTemplate | null> {
    try {
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      
      if (!frontMatterMatch) {
        return null;
      }

      const yaml = await lazyLoadYaml();
      const frontMatter = yaml.load(frontMatterMatch[1]) as any;
      const bodyContent = frontMatterMatch[2];

      // Determine template type based on labels
      let templateType = 'general';
      if (frontMatter.labels) {
        if (frontMatter.labels.includes('bug')) templateType = 'bug';
        else if (frontMatter.labels.includes('enhancement') || frontMatter.labels.includes('feature')) templateType = 'feature';
        else if (frontMatter.labels.includes('question')) templateType = 'question';
        else if (frontMatter.labels.includes('documentation')) templateType = 'documentation';
      }

      // Generate ID from name
      const id = (frontMatter.name || 'unnamed').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      return {
        id,
        name: frontMatter.name || 'Unnamed Template',
        description: frontMatter.about || frontMatter.description || '',
        about: frontMatter.about || frontMatter.description || '',
        type: templateType,
        title: frontMatter.title || '',
        labels: frontMatter.labels || [],
        body: bodyContent.trim(),
        assignees: frontMatter.assignees || []
      };
    } catch (error) {
      console.error('Error parsing markdown template:', error);
      return null;
    }
  }

  /**
   * Parse YAML template
   */
  async _parseYAMLTemplate(content: string): Promise<IssueTemplate | null> {
    try {
      const yaml = await lazyLoadYaml();
      const data = yaml.load(content) as any;

      // Determine template type based on labels
      let templateType = 'general';
      if (data.labels) {
        if (data.labels.includes('bug')) templateType = 'bug';
        else if (data.labels.includes('enhancement') || data.labels.includes('feature')) templateType = 'feature';
        else if (data.labels.includes('question')) templateType = 'question';
        else if (data.labels.includes('documentation')) templateType = 'documentation';
      }

      // Generate ID from name
      const id = (data.name || 'unnamed').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      return {
        id,
        name: data.name || 'Unnamed Template',
        description: data.description || data.about || '',
        about: data.about || data.description || '',
        type: templateType,
        title: data.title || '',
        labels: data.labels || [],
        body: data.body || [],
        assignees: data.assignees || []
      };
    } catch (error) {
      console.error('Error parsing YAML template:', error);
      return null;
    }
  }

  /**
   * Get default templates
   */
  _getDefaultTemplates(): IssueTemplate[] {
    return [
      {
        id: 'bug-report',
        name: 'Bug Report',
        description: 'Create a report to help us improve',
        about: 'Create a report to help us improve',
        type: 'bug',
        title: 'Bug: ',
        labels: ['bug'],
        body: [
          {
            type: 'markdown',
            attributes: {
              value: 'Thanks for taking the time to fill out this bug report!'
            }
          },
          {
            type: 'textarea',
            id: 'description',
            attributes: {
              label: 'Bug Description',
              description: 'A clear and concise description of what the bug is.',
              placeholder: 'Describe the bug...'
            },
            validations: {
              required: true
            }
          },
          {
            type: 'textarea',
            id: 'steps',
            attributes: {
              label: 'Steps to Reproduce',
              description: 'Steps to reproduce the behavior',
              placeholder: '1. Go to...\n2. Click on...\n3. See error...'
            },
            validations: {
              required: true
            }
          },
          {
            type: 'textarea',
            id: 'expected',
            attributes: {
              label: 'Expected Behavior',
              description: 'What did you expect to happen?'
            },
            validations: {
              required: true
            }
          },
          {
            type: 'textarea',
            id: 'actual',
            attributes: {
              label: 'Actual Behavior',
              description: 'What actually happened?'
            },
            validations: {
              required: true
            }
          },
          {
            type: 'input',
            id: 'browser',
            attributes: {
              label: 'Browser',
              placeholder: 'e.g. Chrome 120, Firefox 121, Safari 17'
            }
          },
          {
            type: 'input',
            id: 'os',
            attributes: {
              label: 'Operating System',
              placeholder: 'e.g. Windows 11, macOS 14, Ubuntu 22.04'
            }
          }
        ]
      },
      {
        id: 'feature-request',
        name: 'Feature Request',
        description: 'Suggest an idea for this project',
        about: 'Suggest an idea for this project',
        type: 'feature',
        title: 'Feature: ',
        labels: ['enhancement'],
        body: [
          {
            type: 'markdown',
            attributes: {
              value: 'Thanks for suggesting a new feature!'
            }
          },
          {
            type: 'textarea',
            id: 'description',
            attributes: {
              label: 'Feature Description',
              description: 'A clear and concise description of the feature you\'d like to see.',
              placeholder: 'Describe the feature...'
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
              description: 'Explain how this feature would be used and who would benefit from it.'
            },
            validations: {
              required: true
            }
          },
          {
            type: 'textarea',
            id: 'solution',
            attributes: {
              label: 'Proposed Solution',
              description: 'How do you envision this feature working?'
            }
          },
          {
            type: 'textarea',
            id: 'alternatives',
            attributes: {
              label: 'Alternatives Considered',
              description: 'Are there alternative solutions or workarounds you\'ve considered?'
            }
          }
        ]
      }
    ];
  }

  /**
   * Create bug report from data
   */
  async createBugReport(data: BugReportData, owner: string, repo: string): Promise<number | null> {
    try {
      const body = this._formatBugReportBody(data);
      
      const issueData = {
        title: data.title,
        body,
        labels: data.labels || ['bug'],
        assignees: data.assignees || []
      };

      const issue = await issueTrackingService.createIssue(owner, repo, issueData);
      return issue ? issue.number : null;
    } catch (error) {
      console.error('Error creating bug report:', error);
      return null;
    }
  }

  /**
   * Format bug report body
   */
  _formatBugReportBody(data: BugReportData): string {
    let body = `## Bug Description\n${data.description}\n\n`;

    if (data.stepsToReproduce) {
      body += `## Steps to Reproduce\n${data.stepsToReproduce}\n\n`;
    }

    if (data.expectedBehavior) {
      body += `## Expected Behavior\n${data.expectedBehavior}\n\n`;
    }

    if (data.actualBehavior) {
      body += `## Actual Behavior\n${data.actualBehavior}\n\n`;
    }

    if (data.browserInfo) {
      body += `## Environment\n${data.browserInfo}\n\n`;
    }

    if (data.screenshot) {
      body += `## Screenshot\n![Screenshot](${data.screenshot})\n\n`;
    }

    return body;
  }

  /**
   * Capture screenshot of current page
   */
  async captureScreenshot(): Promise<string | null> {
    try {
      const canvas = await ensureHtml2Canvas();
      const screenshot = await canvas(document.body);
      return screenshot.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return null;
    }
  }

  /**
   * Get browser info
   */
  getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    return `- Browser: ${userAgent}\n- Platform: ${platform}\n- URL: ${window.location.href}`;
  }

  /**
   * Capture console output for debugging
   * @returns Object with stop method to stop capturing and get captured logs
   */
  captureConsoleOutput(): { stop: () => void; getLogs: () => string[] } {
    const logs: string[] = [];
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    // Override console methods to capture output
    console.log = (...args: any[]) => {
      logs.push(`[LOG] ${args.map(a => String(a)).join(' ')}`);
      originalConsole.log(...args);
    };

    console.warn = (...args: any[]) => {
      logs.push(`[WARN] ${args.map(a => String(a)).join(' ')}`);
      originalConsole.warn(...args);
    };

    console.error = (...args: any[]) => {
      logs.push(`[ERROR] ${args.map(a => String(a)).join(' ')}`);
      originalConsole.error(...args);
    };

    console.info = (...args: any[]) => {
      logs.push(`[INFO] ${args.map(a => String(a)).join(' ')}`);
      originalConsole.info(...args);
    };

    return {
      stop: () => {
        // Restore original console methods
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
        console.info = originalConsole.info;
      },
      getLogs: () => logs
    };
  }

  /**
   * Get issue templates
   * @param owner - Repository owner (optional, uses config default)
   * @param repo - Repository name (optional, uses config default)
   * @returns Promise resolving to array of issue templates
   */
  async getTemplates(owner?: string, repo?: string): Promise<IssueTemplate[]> {
    const repoOwner = owner || repositoryConfig.getOwner();
    const repoName = repo || repositoryConfig.getName();
    const cacheKey = `${repoOwner}/${repoName}`;

    // Check cache first (cache valid for 5 minutes)
    const cached = this.templateCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < 5 * 60 * 1000) {
      return cached.templates;
    }

    // Fetch fresh templates
    return await this.fetchIssueTemplates(repoOwner, repoName);
  }

  /**
   * Get default templates (public method)
   * @returns Array of default issue templates
   */
  getDefaultTemplates(): IssueTemplate[] {
    return this._getDefaultTemplates();
  }

  /**
   * Take a screenshot of the current page
   * @returns Promise resolving to a Blob of the screenshot, or null if capture fails
   */
  async takeScreenshot(): Promise<Blob | null> {
    try {
      const html2canvasModule = await ensureHtml2Canvas();
      const canvas = await html2canvasModule(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false
      });
      
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return null;
    }
  }

  /**
   * Generate a GitHub issue URL with pre-filled data
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param template - Issue template
   * @param formData - Form field values
   * @param includeConsole - Whether to include console output
   * @param consoleOutput - Console output logs
   * @param contextData - Additional context data
   * @param screenshot - Screenshot blob (will be noted but not embedded)
   * @returns GitHub issue creation URL
   */
  generateIssueUrl(
    owner: string,
    repo: string,
    template: IssueTemplate,
    formData: Record<string, any>,
    includeConsole: boolean,
    consoleOutput: string[] | string,
    contextData?: Record<string, any>,
    screenshot?: Blob | null
  ): string {
    const baseUrl = `https://github.com/${owner}/${repo}/issues/new`;
    const params = new URLSearchParams();

    // Add template if it has an ID
    if (template.id) {
      params.append('template', `${template.id}.yml`);
    }

    // Add title
    const title = template.title || '';
    params.append('title', title);

    // Add labels
    if (template.labels && template.labels.length > 0) {
      params.append('labels', template.labels.join(','));
    }

    // Build body from form data
    let body = '';
    
    // Add form field values
    if (Array.isArray(template.body)) {
      for (const field of template.body) {
        if (field.type === 'markdown') continue;
        
        const fieldId = field.id;
        if (fieldId && formData[fieldId]) {
          const label = field.attributes?.label || fieldId;
          body += `### ${label}\n${formData[fieldId]}\n\n`;
        }
      }
    }

    // Add context information
    if (contextData) {
      body += '\n---\n\n### Context Information\n';
      if (contextData.pageId) body += `**Page:** ${contextData.pageId}\n`;
      if (contextData.repository) body += `**Repository:** ${contextData.repository.name || contextData.repository}\n`;
      if (contextData.branch) body += `**Branch:** ${contextData.branch}\n`;
      body += `**URL:** ${window.location.href}\n`;
      body += `**User Agent:** ${navigator.userAgent}\n`;
    }

    // Add console output if included
    if (includeConsole && consoleOutput) {
      const logs = Array.isArray(consoleOutput) ? consoleOutput.join('\n') : consoleOutput;
      if (logs.length > 0) {
        body += '\n---\n\n### Console Output\n```\n';
        // Limit console output to avoid URL length issues
        const truncated = logs.length > 5000 ? logs.substring(0, 5000) + '\n... (truncated)' : logs;
        body += truncated;
        body += '\n```\n';
      }
    }

    // Note about screenshot if included
    if (screenshot) {
      body += '\n---\n\n_Note: A screenshot was captured but cannot be automatically attached via URL. Please paste it manually after creating the issue._\n';
    }

    params.append('body', body);

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Submit an issue directly via GitHub API
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param template - Issue template
   * @param formData - Form field values
   * @param includeConsole - Whether to include console output
   * @param consoleOutput - Console output logs
   * @param contextData - Additional context data
   * @param screenshot - Screenshot blob
   * @returns Promise resolving to submission result
   */
  async submitIssue(
    owner: string,
    repo: string,
    template: IssueTemplate,
    formData: Record<string, any>,
    includeConsole: boolean,
    consoleOutput: string[] | string,
    contextData?: Record<string, any>,
    screenshot?: Blob | null
  ): Promise<{ success: boolean; issue?: any; error?: any }> {
    try {
      // Build title
      const title = (template.title || '') + (formData.title || formData.description?.substring(0, 50) || 'New Issue');

      // Build body
      let body = '';
      
      // Add form field values
      if (Array.isArray(template.body)) {
        for (const field of template.body) {
          if (field.type === 'markdown') continue;
          
          const fieldId = field.id;
          if (fieldId && formData[fieldId]) {
            const label = field.attributes?.label || fieldId;
            body += `### ${label}\n${formData[fieldId]}\n\n`;
          }
        }
      }

      // Add context information
      if (contextData) {
        body += '\n---\n\n### Context Information\n';
        if (contextData.pageId) body += `**Page:** ${contextData.pageId}\n`;
        if (contextData.repository) body += `**Repository:** ${contextData.repository.name || contextData.repository}\n`;
        if (contextData.branch) body += `**Branch:** ${contextData.branch}\n`;
        body += `**URL:** ${window.location.href}\n`;
        body += `**User Agent:** ${navigator.userAgent}\n`;
      }

      // Add console output if included
      if (includeConsole && consoleOutput) {
        const logs = Array.isArray(consoleOutput) ? consoleOutput.join('\n') : consoleOutput;
        if (logs.length > 0) {
          body += '\n---\n\n### Console Output\n```\n' + logs + '\n```\n';
        }
      }

      // Create issue via issueTrackingService
      const issue = await issueTrackingService.createIssue(owner, repo, {
        title,
        body,
        labels: template.labels || []
      });

      if (!issue) {
        return {
          success: false,
          error: { message: 'Failed to create issue' }
        };
      }

      // TODO: Upload screenshot as comment if provided
      // This would require additional API call to add a comment with the image

      return {
        success: true,
        issue
      };
    } catch (error: any) {
      console.error('Error submitting issue:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Failed to submit issue',
          details: error
        }
      };
    }
  }
}

// Export singleton instance
const bugReportService = new BugReportService();
export default bugReportService;
