/**
 * User Scenarios Question Executor
 * Scans for user scenario and use case files
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const scenarios: any[] = [];
    
    // Check for scenarios directory
    const scenariosPath = 'input/scenarios';
    try {
      const scenarioFiles = await storage.listFiles(`${scenariosPath}/**/*.{json,md,txt}`, { nodir: true });
      
      for (const file of scenarioFiles) {
        const fileName = file.split('/').pop() || file;
        let scenarioName = fileName.replace(/\.(json|md|txt)$/i, '');
        let description = '';
        
        // Try to read file content for more details
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          
          if (file.endsWith('.json')) {
            const jsonData = JSON.parse(contentStr);
            scenarioName = jsonData.name || jsonData.title || jsonData.id || scenarioName;
            description = jsonData.description || jsonData.summary || '';
          } else if (file.endsWith('.md')) {
            // Extract title from markdown
            const titleMatch = contentStr.match(/^#\s+(.+)$/m);
            if (titleMatch) {
              scenarioName = titleMatch[1];
            }
            // Extract first paragraph as description
            const descMatch = contentStr.match(/^[^#\n].+/m);
            if (descMatch) {
              description = descMatch[0].substring(0, 100);
            }
          }
        } catch {
          // Use filename if can't parse
        }
        
        scenarios.push({
          name: scenarioName,
          file,
          description
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Also check for scenario files in other locations
    try {
      const useCaseFiles = await storage.listFiles('input/**/*scenario*.{json,md}', { nodir: true });
      useCaseFiles.forEach(file => {
        if (!scenarios.find(s => s.file === file)) {
          const fileName = file.split('/').pop() || file;
          scenarios.push({
            name: fileName.replace(/\.(json|md)$/i, '').replace(/-/g, ' '),
            file,
            description: ''
          });
        }
      });
    } catch {
      // No matching files
    }
    
    // Build narrative
    let narrative = `<h4>${t('dak.faq.user_scenarios.title')}</h4>`;
    
    if (scenarios.length === 0) {
      narrative += `<p>${t('dak.faq.user_scenarios.none_found')}</p>`;
    } else {
      narrative += `<p>${t('dak.faq.user_scenarios.found_count', { count: scenarios.length })}</p>`;
      narrative += '<ul>';
      scenarios.forEach(scenario => {
        narrative += `<li><strong>${scenario.name}</strong> - <code>${scenario.file}</code>`;
        if (scenario.description) {
          narrative += `<br/><em>${scenario.description}</em>`;
        }
        narrative += '</li>';
      });
      narrative += '</ul>';
    }

    return {
      structured: { scenarios },
      narrative,
      errors: [],
      warnings: scenarios.length === 0 ? [t('dak.faq.user_scenarios.no_scenarios_warning')] : [],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'user-scenarios',
          ttl: 3600,
          dependencies: ['input/scenarios/']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { scenarios: [] },
      narrative: `<h4>${t('dak.faq.user_scenarios.title')}</h4><p class="error">${t('dak.faq.user_scenarios.error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};
