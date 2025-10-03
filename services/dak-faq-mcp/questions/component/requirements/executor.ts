/**
 * Requirements Question Executor
 * Scans for functional and non-functional requirement specification files
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const requirements: any[] = [];
    
    // Check for requirements directory
    const requirementsPath = 'input/requirements';
    try {
      const requirementFiles = await storage.listFiles(`${requirementsPath}/**/*.{json,md,txt}`, { nodir: true });
      
      for (const file of requirementFiles) {
        const fileName = file.split('/').pop() || file;
        let reqName = fileName.replace(/\.(json|md|txt)$/i, '');
        let category = 'requirement';
        
        // Determine category from filename or path
        if (file.toLowerCase().includes('functional')) {
          category = 'functional';
        } else if (file.toLowerCase().includes('non-functional') || file.toLowerCase().includes('nonfunctional')) {
          category = 'non-functional';
        } else if (file.toLowerCase().includes('business')) {
          category = 'business';
        } else if (file.toLowerCase().includes('technical')) {
          category = 'technical';
        }
        
        // Try to read file for more details
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          
          if (file.endsWith('.json')) {
            const jsonData = JSON.parse(contentStr);
            reqName = jsonData.name || jsonData.title || jsonData.id || reqName;
            category = jsonData.category || jsonData.type || category;
          } else if (file.endsWith('.md')) {
            // Extract title from markdown
            const titleMatch = contentStr.match(/^#\s+(.+)$/m);
            if (titleMatch) {
              reqName = titleMatch[1];
            }
          }
        } catch {
          // Use filename if can't parse
        }
        
        requirements.push({
          name: reqName,
          file,
          category
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Check for Requirements resources (FHIR)
    try {
      const reqResourceFiles = await storage.listFiles('input/**/Requirements*.json', { nodir: true });
      
      for (const file of reqResourceFiles) {
        const fileName = file.split('/').pop() || file;
        let reqName = fileName.replace(/\.json$/i, '');
        
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          const jsonData = JSON.parse(contentStr);
          
          reqName = jsonData.name || jsonData.title || jsonData.id || reqName;
        } catch {
          // Use filename if can't parse
        }
        
        requirements.push({
          name: reqName,
          file,
          category: 'Requirements'
        });
      }
    } catch {
      // No matching files
    }
    
    // Check for requirement docs in pagecontent
    try {
      const reqDocFiles = await storage.listFiles('input/pagecontent/*requirement*.md', { nodir: true });
      
      reqDocFiles.forEach(file => {
        if (!requirements.find(r => r.file === file)) {
          const fileName = file.split('/').pop() || file;
          requirements.push({
            name: fileName.replace(/\.md$/i, '').replace(/-/g, ' '),
            file,
            category: 'documentation'
          });
        }
      });
    } catch {
      // No matching files
    }
    
    // Build narrative
    let narrative = `<h4>${t('dak.faq.requirements.title')}</h4>`;
    
    if (requirements.length === 0) {
      narrative += `<p>${t('dak.faq.requirements.none_found')}</p>`;
    } else {
      narrative += `<p>${t('dak.faq.requirements.found_count', { count: requirements.length })}</p>`;
      
      // Group by category
      const byCategory = requirements.reduce((acc, req) => {
        if (!acc[req.category]) acc[req.category] = [];
        acc[req.category].push(req);
        return acc;
      }, {} as Record<string, any[]>);
      
      Object.keys(byCategory).forEach(category => {
        narrative += `<h5>${category} (${byCategory[category].length})</h5>`;
        narrative += '<ul>';
        byCategory[category].forEach((req: any) => {
          narrative += `<li><strong>${req.name}</strong> - <code>${req.file}</code></li>`;
        });
        narrative += '</ul>';
      });
    }

    return {
      structured: { requirements },
      narrative,
      errors: [],
      warnings: requirements.length === 0 ? [t('dak.faq.requirements.no_requirements_warning')] : [],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'requirements',
          ttl: 3600,
          dependencies: ['input/requirements/']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { requirements: [] },
      narrative: `<h4>${t('dak.faq.requirements.title')}</h4><p class="error">${t('dak.faq.requirements.error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};
