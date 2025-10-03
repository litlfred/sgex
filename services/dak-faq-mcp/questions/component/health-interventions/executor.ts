/**
 * Health Interventions Question Executor
 * Scans for health intervention and recommendation files
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const interventions: any[] = [];
    
    // Check for L2-DAK markdown file (main health interventions documentation)
    const l2DakPath = 'input/pagecontent/l2-dak.md';
    const l2Exists = await storage.fileExists(l2DakPath);
    if (l2Exists) {
      interventions.push({
        name: 'L2 DAK Health Interventions',
        file: l2DakPath,
        type: 'documentation'
      });
    }
    
    // Check for IRIS references directory
    const irisPath = 'input/iris-references';
    try {
      const irisFiles = await storage.listFiles(`${irisPath}/**/*`, { nodir: true });
      irisFiles.forEach(file => {
        const fileName = file.split('/').pop() || file;
        interventions.push({
          name: fileName.replace(/\.(json|md|txt)$/i, ''),
          file,
          type: 'iris-reference'
        });
      });
    } catch {
      // Directory doesn't exist, continue
    }
    
    // Check for health intervention files in pagecontent
    const pagecontentPath = 'input/pagecontent';
    try {
      const interventionFiles = await storage.listFiles(`${pagecontentPath}/*health*.md`, { nodir: true });
      interventionFiles.forEach(file => {
        const fileName = file.split('/').pop() || file;
        if (file !== l2DakPath) {
          interventions.push({
            name: fileName.replace(/\.md$/i, '').replace(/-/g, ' '),
            file,
            type: 'guideline'
          });
        }
      });
    } catch {
      // No matching files
    }
    
    // Build narrative
    let narrative = `<h4>${t('dak.faq.health_interventions.title')}</h4>`;
    
    if (interventions.length === 0) {
      narrative += `<p>${t('dak.faq.health_interventions.none_found')}</p>`;
    } else {
      narrative += `<p>${t('dak.faq.health_interventions.found_count', { count: interventions.length })}</p>`;
      narrative += '<ul>';
      interventions.forEach(intervention => {
        narrative += `<li><strong>${intervention.name}</strong> - <code>${intervention.file}</code> (${intervention.type})</li>`;
      });
      narrative += '</ul>';
    }

    return {
      structured: { interventions },
      narrative,
      errors: [],
      warnings: interventions.length === 0 ? [t('dak.faq.health_interventions.no_interventions_warning')] : [],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'health-interventions',
          ttl: 3600,
          dependencies: ['input/pagecontent/', 'input/iris-references/']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { interventions: [] },
      narrative: `<h4>${t('dak.faq.health_interventions.title')}</h4><p class="error">${t('dak.faq.health_interventions.error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};
