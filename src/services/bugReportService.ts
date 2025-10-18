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
 * Issue template
 * @example { "name": "Bug Report", "about": "Create a bug report", "title": "Bug: ", "labels": ["bug"] }
 */
export interface IssueTemplate {
  /** Template name */
  name: string;
  /** Template description */
  about: string;
  /** Default title prefix */
  title?: string;
  /** Default labels */
  labels?: string[];
  /** Template body */
  body?: string;
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
        return this._parseMarkdownTemplate(content);
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
  _parseMarkdownTemplate(content: string): IssueTemplate | null {
    try {
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      
      if (!frontMatterMatch) {
        return null;
      }

      const yaml = lazyLoadYaml();
      const frontMatter = yaml.load(frontMatterMatch[1]) as any;
      const body = frontMatterMatch[2];

      return {
        name: frontMatter.name || 'Unnamed Template',
        about: frontMatter.about || '',
        title: frontMatter.title || '',
        labels: frontMatter.labels || [],
        body: body.trim(),
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

      return {
        name: data.name || 'Unnamed Template',
        about: data.about || data.description || '',
        title: data.title || '',
        labels: data.labels || [],
        body: data.body || '',
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
        name: 'Bug Report',
        about: 'Create a report to help us improve',
        title: 'Bug: ',
        labels: ['bug'],
        body: `## Bug Description\n\n## Steps to Reproduce\n\n## Expected Behavior\n\n## Actual Behavior\n\n## Environment\n- Browser:\n- OS:\n`
      },
      {
        name: 'Feature Request',
        about: 'Suggest an idea for this project',
        title: 'Feature: ',
        labels: ['enhancement'],
        body: `## Feature Description\n\n## Use Case\n\n## Proposed Solution\n\n## Alternatives Considered\n`
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
}

// Export singleton instance
const bugReportService = new BugReportService();
export default bugReportService;
