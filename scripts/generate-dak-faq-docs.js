#!/usr/bin/env node

/**
 * DAK FAQ Documentation Generator
 * 
 * Generates comprehensive, pretty-printed static HTML documentation
 * for all DAK FAQ MCP service endpoints and question definitions.
 * 
 * Sources:
 * - docs/dak-faq-system.md
 * - docs/dak/faq/implementation-summary.md  
 * - docs/dak/faq/component-questions-draft.md
 * - /src/dak/faq/questions/* (JSDoc comments)
 * - MCP service API endpoints and schemas
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  outputPath: path.join(__dirname, '../public/docs/dak-faq-documentation.html'),
  sourcePaths: {
    systemDocs: path.join(__dirname, '../docs/dak-faq-system.md'),
    implementationSummary: path.join(__dirname, '../docs/dak/faq/implementation-summary.md'),
    questionsCatalog: path.join(__dirname, '../docs/dak/faq/component-questions-draft.md'),
    questionsSourceDir: path.join(__dirname, '../src/dak/faq/questions'),
    mcpServiceDir: path.join(__dirname, '../services/dak-faq-mcp')
  },
  mcpServerPort: 3001,
  title: 'DAK FAQ MCP Service Documentation',
  subtitle: 'Comprehensive API and Question Reference'
};

class DAKFAQDocumentationGenerator {
  constructor() {
    this.mcpServerProcess = null;
    this.documentation = {
      overview: '',
      systemArchitecture: '',
      apiEndpoints: [],
      questionCatalog: [],
      implementationExamples: [],
      jsDocComments: [],
      openApiSchema: null
    };
  }

  /**
   * Main entry point for documentation generation
   */
  async generate() {
    console.log('🚀 Starting DAK FAQ Documentation Generation...');
    
    try {
      // Start MCP server for API introspection
      await this.startMCPServer();
      
      // Extract content from all sources
      await this.extractDocumentationSources();
      
      // Query MCP service for API details
      await this.extractMCPServiceDetails();
      
      // Generate HTML documentation
      const html = await this.generateHTML();
      
      // Write output file
      await fs.writeFile(CONFIG.outputPath, html, 'utf8');
      
      console.log(`✅ Documentation generated successfully: ${CONFIG.outputPath}`);
      
    } catch (error) {
      console.error('❌ Documentation generation failed:', error);
      throw error;
    } finally {
      await this.stopMCPServer();
    }
  }

  /**
   * Start the MCP server for API introspection
   */
  async startMCPServer() {
    console.log('📡 Starting MCP server for API introspection...');
    
    try {
      // Build the MCP service first
      console.log('🔨 Building MCP service...');
      execSync('npm run build', { 
        cwd: CONFIG.sourcePaths.mcpServiceDir,
        stdio: 'pipe'
      });
      
      // Start server in background
      const { spawn } = require('child_process');
      this.mcpServerProcess = spawn('node', ['dist/index.js'], {
        cwd: CONFIG.sourcePaths.mcpServiceDir,
        stdio: 'pipe'
      });
      
      // Wait for server to start
      await this.waitForServerStart();
      console.log('✅ MCP server started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start MCP server:', error);
      throw error;
    }
  }

  /**
   * Wait for MCP server to start accepting connections
   */
  async waitForServerStart() {
    const maxAttempts = 30;
    const delay = 1000;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`http://127.0.0.1:${CONFIG.mcpServerPort}/health`);
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    throw new Error('MCP server failed to start within timeout');
  }

  /**
   * Stop the MCP server
   */
  async stopMCPServer() {
    if (this.mcpServerProcess) {
      console.log('🛑 Stopping MCP server...');
      this.mcpServerProcess.kill();
      this.mcpServerProcess = null;
    }
  }

  /**
   * Extract content from markdown documentation sources
   */
  async extractDocumentationSources() {
    console.log('📚 Extracting documentation sources...');
    
    // Read system documentation
    try {
      const systemDocs = await fs.readFile(CONFIG.sourcePaths.systemDocs, 'utf8');
      this.documentation.systemArchitecture = this.extractSystemArchitecture(systemDocs);
      this.documentation.overview = this.extractOverview(systemDocs);
    } catch (error) {
      console.warn('⚠️ Could not read system docs:', error.message);
    }

    // Read implementation summary
    try {
      const implSummary = await fs.readFile(CONFIG.sourcePaths.implementationSummary, 'utf8');
      this.documentation.implementationExamples = this.extractImplementationExamples(implSummary);
    } catch (error) {
      console.warn('⚠️ Could not read implementation summary:', error.message);
    }

    // Read questions catalog
    try {
      const questionsCatalog = await fs.readFile(CONFIG.sourcePaths.questionsCatalog, 'utf8');
      this.documentation.questionCatalog = this.extractQuestionCatalog(questionsCatalog);
    } catch (error) {
      console.warn('⚠️ Could not read questions catalog:', error.message);
    }

    // Extract JSDoc comments from source files
    await this.extractJSDocComments();
  }

  /**
   * Extract overview section from system documentation
   */
  extractOverview(content) {
    const overviewMatch = content.match(/## Overview\s*\n\n([\s\S]*?)(?=\n## |\n# |$)/);
    return overviewMatch ? overviewMatch[1].trim() : '';
  }

  /**
   * Extract system architecture information
   */
  extractSystemArchitecture(content) {
    const archMatch = content.match(/## Architecture\s*\n\n([\s\S]*?)(?=\n## |\n# |$)/);
    return archMatch ? archMatch[1].trim() : '';
  }

  /**
   * Extract implementation examples from summary
   */
  extractImplementationExamples(content) {
    const examples = [];
    
    // Extract usage examples section
    const usageMatch = content.match(/## Usage Examples\s*\n\n([\s\S]*?)(?=\n## |\n# |$)/);
    if (usageMatch) {
      examples.push({
        title: 'Usage Examples',
        content: usageMatch[1].trim()
      });
    }
    
    return examples;
  }

  /**
   * Extract question catalog from draft document
   */
  extractQuestionCatalog(content) {
    const catalog = [];
    
    // Extract each component section
    const componentSections = content.split(/## \d+\. /);
    
    for (const section of componentSections.slice(1)) { // Skip first empty section
      const lines = section.split('\n');
      const componentName = lines[0];
      
      const questions = [];
      let currentQuestion = null;
      
      for (const line of lines) {
        const questionMatch = line.match(/- \*\*`([^`]+)`\*\*: "([^"]+)"/);
        if (questionMatch) {
          if (currentQuestion) {
            questions.push(currentQuestion);
          }
          currentQuestion = {
            id: questionMatch[1],
            description: questionMatch[2],
            details: []
          };
        } else if (currentQuestion && line.trim().startsWith('- ')) {
          currentQuestion.details.push(line.trim().substring(2));
        }
      }
      
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      
      if (questions.length > 0) {
        catalog.push({
          component: componentName,
          questions: questions
        });
      }
    }
    
    return catalog;
  }

  /**
   * Extract JSDoc comments from question source files
   */
  async extractJSDocComments() {
    console.log('🔍 Extracting JSDoc comments from source files...');
    
    const jsDocComments = [];
    
    try {
      await this.walkDirectory(CONFIG.sourcePaths.questionsSourceDir, async (filePath) => {
        if (filePath.endsWith('.js')) {
          const content = await fs.readFile(filePath, 'utf8');
          const relativePath = path.relative(CONFIG.sourcePaths.questionsSourceDir, filePath);
          
          const comments = this.extractJSDocFromFile(content, relativePath);
          if (comments.length > 0) {
            jsDocComments.push({
              file: relativePath,
              comments: comments
            });
          }
        }
      });
    } catch (error) {
      console.warn('⚠️ Error extracting JSDoc comments:', error.message);
    }
    
    this.documentation.jsDocComments = jsDocComments;
  }

  /**
   * Walk directory recursively
   */
  async walkDirectory(dir, callback) {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        await this.walkDirectory(filePath, callback);
      } else {
        await callback(filePath);
      }
    }
  }

  /**
   * Extract JSDoc comments from a JavaScript file
   */
  extractJSDocFromFile(content, relativePath) {
    const comments = [];
    
    // Match JSDoc comment blocks
    const jsDocRegex = /\/\*\*\s*\n([\s\S]*?)\*\//g;
    let match;
    
    while ((match = jsDocRegex.exec(content)) !== null) {
      const commentBlock = match[1];
      const cleanComment = commentBlock
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, ''))
        .join('\n')
        .trim();
      
      if (cleanComment.length > 0) {
        comments.push(cleanComment);
      }
    }
    
    // Also extract metadata and execute function descriptions
    const metadataMatch = content.match(/export const metadata = new QuestionDefinition\(\{([\s\S]*?)\}\);/);
    if (metadataMatch) {
      comments.unshift(`**Question Metadata:**\n\`\`\`javascript\n${metadataMatch[0]}\n\`\`\``);
    }
    
    return comments;
  }

  /**
   * Query MCP service for API details
   */
  async extractMCPServiceDetails() {
    console.log('🌐 Querying MCP service for API details...');
    
    try {
      // Get API endpoints from root
      const rootResponse = await fetch(`http://127.0.0.1:${CONFIG.mcpServerPort}/`);
      const rootData = await rootResponse.json();
      
      // Get question catalog
      const catalogResponse = await fetch(`http://127.0.0.1:${CONFIG.mcpServerPort}/faq/questions/catalog`);
      const catalogData = await catalogResponse.json();
      
      // Get OpenAPI schema
      const openApiResponse = await fetch(`http://127.0.0.1:${CONFIG.mcpServerPort}/faq/questions/catalog?format=openapi`);
      const openApiData = await openApiResponse.json();
      
      this.documentation.apiEndpoints = this.formatApiEndpoints(rootData);
      this.documentation.openApiSchema = openApiData;
      
      console.log(`✅ Retrieved API details: ${catalogData.count} questions available`);
      
    } catch (error) {
      console.warn('⚠️ Could not query MCP service:', error.message);
    }
  }

  /**
   * Format API endpoints information
   */
  formatApiEndpoints(rootData) {
    const endpoints = [];
    
    if (rootData.endpoints) {
      for (const [endpoint, description] of Object.entries(rootData.endpoints)) {
        endpoints.push({
          endpoint: endpoint,
          description: description,
          method: endpoint.startsWith('GET') ? 'GET' : 'POST'
        });
      }
    }
    
    return endpoints;
  }

  /**
   * Generate complete HTML documentation
   */
  async generateHTML() {
    console.log('🎨 Generating HTML documentation...');
    
    const timestamp = new Date().toISOString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${CONFIG.title}</title>
    <style>
        ${this.getCSS()}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>${CONFIG.title}</h1>
            <p class="subtitle">${CONFIG.subtitle}</p>
            <p class="timestamp">Generated: ${timestamp}</p>
        </header>
        
        <nav class="toc">
            <h2>Table of Contents</h2>
            <ul>
                <li><a href="#overview">Overview</a></li>
                <li><a href="#architecture">System Architecture</a></li>
                <li><a href="#api-endpoints">API Endpoints</a></li>
                <li><a href="#question-catalog">Question Catalog</a></li>
                <li><a href="#implementation-examples">Implementation Examples</a></li>
                <li><a href="#source-documentation">Source Documentation</a></li>
                <li><a href="#openapi-schema">OpenAPI Schema</a></li>
            </ul>
        </nav>
        
        <main class="content">
            ${this.generateOverviewSection()}
            ${this.generateArchitectureSection()}
            ${this.generateApiEndpointsSection()}
            ${this.generateQuestionCatalogSection()}
            ${this.generateImplementationExamplesSection()}
            ${this.generateSourceDocumentationSection()}
            ${this.generateOpenApiSection()}
        </main>
        
        <footer class="footer">
            <p>Generated by SGeX Workbench DAK FAQ Documentation Generator</p>
            <p>WHO SMART Guidelines Exchange - Digital Adaptation Kit FAQ System</p>
        </footer>
    </div>
</body>
</html>`;
  }

  /**
   * Get CSS styles for the documentation
   */
  getCSS() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
            color: white;
            padding: 40px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .timestamp {
            font-size: 0.9em;
            opacity: 0.8;
        }
        
        .toc {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .toc h2 {
            color: #005a9e;
            margin-bottom: 20px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
        }
        
        .toc ul {
            list-style: none;
        }
        
        .toc li {
            margin: 10px 0;
        }
        
        .toc a {
            color: #0078d4;
            text-decoration: none;
            font-weight: 500;
        }
        
        .toc a:hover {
            text-decoration: underline;
        }
        
        .content {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .section {
            margin-bottom: 50px;
        }
        
        .section h2 {
            color: #005a9e;
            font-size: 2em;
            margin-bottom: 20px;
            border-bottom: 3px solid #0078d4;
            padding-bottom: 10px;
        }
        
        .section h3 {
            color: #333;
            margin: 30px 0 15px 0;
            font-size: 1.4em;
        }
        
        .section h4 {
            color: #555;
            margin: 20px 0 10px 0;
            font-size: 1.2em;
        }
        
        .api-endpoint {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .endpoint-method {
            display: inline-block;
            background: #0078d4;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9em;
            margin-right: 10px;
        }
        
        .endpoint-path {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #333;
        }
        
        .question-item {
            background: #f8f9fa;
            border-left: 4px solid #0078d4;
            padding: 20px;
            margin: 15px 0;
            border-radius: 0 6px 6px 0;
        }
        
        .question-id {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
            color: #005a9e;
        }
        
        .question-description {
            font-weight: bold;
            color: #333;
            margin: 5px 0;
        }
        
        .question-details {
            margin-top: 10px;
        }
        
        .question-details ul {
            margin-left: 20px;
        }
        
        pre {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            line-height: 1.4;
        }
        
        code {
            background: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        .source-file {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .source-file h4 {
            color: #005a9e;
            margin-bottom: 15px;
            font-family: 'Courier New', monospace;
        }
        
        .comment-block {
            background: white;
            border-left: 3px solid #0078d4;
            padding: 15px;
            margin: 10px 0;
        }
        
        .footer {
            text-align: center;
            padding: 30px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .content {
                padding: 20px;
            }
        }
    `;
  }

  /**
   * Generate overview section
   */
  generateOverviewSection() {
    return `
        <section class="section" id="overview">
            <h2>Overview</h2>
            ${this.documentation.overview ? this.markdownToHtml(this.documentation.overview) : '<p>No overview documentation available.</p>'}
        </section>
    `;
  }

  /**
   * Generate architecture section
   */
  generateArchitectureSection() {
    return `
        <section class="section" id="architecture">
            <h2>System Architecture</h2>
            ${this.documentation.systemArchitecture ? this.markdownToHtml(this.documentation.systemArchitecture) : '<p>No architecture documentation available.</p>'}
        </section>
    `;
  }

  /**
   * Generate API endpoints section
   */
  generateApiEndpointsSection() {
    const endpointsHtml = this.documentation.apiEndpoints.map(endpoint => `
        <div class="api-endpoint">
            <span class="endpoint-method">${endpoint.method}</span>
            <span class="endpoint-path">${endpoint.endpoint}</span>
            <p>${endpoint.description}</p>
        </div>
    `).join('');

    return `
        <section class="section" id="api-endpoints">
            <h2>API Endpoints</h2>
            <p>The DAK FAQ MCP Server provides the following REST API endpoints:</p>
            ${endpointsHtml || '<p>No API endpoint information available.</p>'}
        </section>
    `;
  }

  /**
   * Generate question catalog section
   */
  generateQuestionCatalogSection() {
    const catalogHtml = this.documentation.questionCatalog.map(component => `
        <h3>${component.component}</h3>
        ${component.questions.map(question => `
            <div class="question-item">
                <span class="question-id">${question.id}</span>
                <div class="question-description">${question.description}</div>
                ${question.details.length > 0 ? `
                    <div class="question-details">
                        <ul>
                            ${question.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `).join('')}
    `).join('');

    return `
        <section class="section" id="question-catalog">
            <h2>Question Catalog</h2>
            <p>Available questions organized by DAK component type:</p>
            ${catalogHtml || '<p>No question catalog available.</p>'}
        </section>
    `;
  }

  /**
   * Generate implementation examples section
   */
  generateImplementationExamplesSection() {
    const examplesHtml = this.documentation.implementationExamples.map(example => `
        <h3>${example.title}</h3>
        ${this.markdownToHtml(example.content)}
    `).join('');

    return `
        <section class="section" id="implementation-examples">
            <h2>Implementation Examples</h2>
            ${examplesHtml || '<p>No implementation examples available.</p>'}
        </section>
    `;
  }

  /**
   * Generate source documentation section
   */
  generateSourceDocumentationSection() {
    const sourceHtml = this.documentation.jsDocComments.map(fileDoc => `
        <div class="source-file">
            <h4>${fileDoc.file}</h4>
            ${fileDoc.comments.map(comment => `
                <div class="comment-block">
                    ${this.markdownToHtml(comment)}
                </div>
            `).join('')}
        </div>
    `).join('');

    return `
        <section class="section" id="source-documentation">
            <h2>Source Documentation</h2>
            <p>JSDoc comments and metadata extracted from question source files:</p>
            ${sourceHtml || '<p>No source documentation available.</p>'}
        </section>
    `;
  }

  /**
   * Generate OpenAPI schema section
   */
  generateOpenApiSection() {
    const schemaJson = this.documentation.openApiSchema ? 
      JSON.stringify(this.documentation.openApiSchema, null, 2) : 
      'No OpenAPI schema available.';

    return `
        <section class="section" id="openapi-schema">
            <h2>OpenAPI Schema</h2>
            <p>Complete OpenAPI 3.0 schema for the DAK FAQ MCP API:</p>
            <pre><code>${this.escapeHtml(schemaJson)}</code></pre>
        </section>
    `;
  }

  /**
   * Convert markdown to HTML (basic conversion)
   */
  markdownToHtml(markdown) {
    // Handle code blocks first to protect them from other transformations
    const codeBlocks = [];
    let codeBlockIndex = 0;
    
    let processed = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const placeholder = `__CODEBLOCK_${codeBlockIndex}__`;
      codeBlocks[codeBlockIndex] = `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`;
      codeBlockIndex++;
      return placeholder;
    });
    
    // Process other markdown
    processed = processed
      .replace(/### (.+)/g, '<h4>$1</h4>')
      .replace(/## (.+)/g, '<h3>$1</h3>')
      .replace(/# (.+)/g, '<h2>$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+?)`/g, '<code>$1</code>')
      .split('\n\n').map(paragraph => {
        if (paragraph.trim().startsWith('- ')) {
          // Handle lists
          const items = paragraph.split('\n').filter(line => line.trim().startsWith('- '));
          const listItems = items.map(item => `<li>${item.substring(2).trim()}</li>`).join('');
          return `<ul>${listItems}</ul>`;
        } else if (paragraph.trim().length > 0) {
          return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
        }
        return '';
      }).join('\n');
    
    // Restore code blocks
    for (let i = 0; i < codeBlocks.length; i++) {
      processed = processed.replace(`__CODEBLOCK_${i}__`, codeBlocks[i]);
    }
    
    return processed;
  }

  /**
   * Escape HTML characters
   */
  escapeHtml(text) {
    const div = { innerHTML: text };
    return div.innerHTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Main execution
async function main() {
  try {
    const generator = new DAKFAQDocumentationGenerator();
    await generator.generate();
    console.log('📖 DAK FAQ Documentation generation completed successfully!');
  } catch (error) {
    console.error('💥 Documentation generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DAKFAQDocumentationGenerator, CONFIG };