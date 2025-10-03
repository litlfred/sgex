/**
 * Indicators Question Executor
 * Scans for program indicator and measure definition files
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const indicators: any[] = [];
    
    // Check for indicators directory
    const indicatorsPath = 'input/indicators';
    try {
      const indicatorFiles = await storage.listFiles(`${indicatorsPath}/**/*.{json,md}`, { nodir: true });
      
      for (const file of indicatorFiles) {
        const fileName = file.split('/').pop() || file;
        let indicatorName = fileName.replace(/\.(json|md)$/i, '');
        let indicatorType = 'indicator';
        
        // Try to read file for more details
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          
          if (file.endsWith('.json')) {
            const jsonData = JSON.parse(contentStr);
            indicatorName = jsonData.name || jsonData.title || jsonData.id || indicatorName;
            indicatorType = jsonData.resourceType || indicatorType;
          } else if (file.endsWith('.md')) {
            // Extract title from markdown
            const titleMatch = contentStr.match(/^#\s+(.+)$/m);
            if (titleMatch) {
              indicatorName = titleMatch[1];
            }
          }
        } catch {
          // Use filename if can't parse
        }
        
        indicators.push({
          name: indicatorName,
          file,
          type: indicatorType
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Check for Measure resources
    const measuresPath = 'input/measures';
    try {
      const measureFiles = await storage.listFiles(`${measuresPath}/**/*.json`, { nodir: true });
      
      for (const file of measureFiles) {
        const fileName = file.split('/').pop() || file;
        let measureName = fileName.replace(/\.json$/i, '');
        
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          const jsonData = JSON.parse(contentStr);
          
          measureName = jsonData.name || jsonData.title || jsonData.id || measureName;
        } catch {
          // Use filename if can't parse
        }
        
        indicators.push({
          name: measureName,
          file,
          type: 'Measure'
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Check for Measure files in other locations
    try {
      const measureFiles = await storage.listFiles('input/**/Measure*.json', { nodir: true });
      
      measureFiles.forEach(file => {
        if (!indicators.find(i => i.file === file)) {
          const fileName = file.split('/').pop() || file;
          let measureName = fileName.replace(/\.json$/i, '');
          
          try {
            // Already added from measures directory
          } catch {
            indicators.push({
              name: measureName,
              file,
              type: 'Measure'
            });
          }
        }
      });
    } catch {
      // No matching files
    }
    
    // Build narrative
    let narrative = `<h4>${t('dak.faq.indicators.title')}</h4>`;
    
    if (indicators.length === 0) {
      narrative += `<p>${t('dak.faq.indicators.none_found')}</p>`;
    } else {
      narrative += `<p>${t('dak.faq.indicators.found_count', { count: indicators.length })}</p>`;
      
      // Group by type
      const byType = indicators.reduce((acc, indicator) => {
        if (!acc[indicator.type]) acc[indicator.type] = [];
        acc[indicator.type].push(indicator);
        return acc;
      }, {} as Record<string, any[]>);
      
      Object.keys(byType).forEach(type => {
        narrative += `<h5>${type} (${byType[type].length})</h5>`;
        narrative += '<ul>';
        byType[type].forEach((indicator: any) => {
          narrative += `<li><strong>${indicator.name}</strong> - <code>${indicator.file}</code></li>`;
        });
        narrative += '</ul>';
      });
    }

    return {
      structured: { indicators },
      narrative,
      errors: [],
      warnings: indicators.length === 0 ? [t('dak.faq.indicators.no_indicators_warning')] : [],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'indicators',
          ttl: 3600,
          dependencies: ['input/indicators/', 'input/measures/']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { indicators: [] },
      narrative: `<h4>${t('dak.faq.indicators.title')}</h4><p class="error">${t('dak.faq.indicators.error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};
