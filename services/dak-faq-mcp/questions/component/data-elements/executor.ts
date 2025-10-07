/**
 * Data Elements Question Executor
 * Scans for core data element definitions, value sets, and profiles
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const dataElements: any[] = [];
    
    // Check for vocabulary directory
    const vocabularyPath = 'input/vocabulary';
    try {
      const vocabFiles = await storage.listFiles(`${vocabularyPath}/**/*.json`, { nodir: true });
      
      for (const file of vocabFiles) {
        const fileName = file.split('/').pop() || file;
        let elementName = fileName.replace(/\.json$/i, '');
        let elementType = 'vocabulary';
        
        // Try to determine type from filename
        if (fileName.includes('ValueSet')) {
          elementType = 'ValueSet';
        } else if (fileName.includes('CodeSystem')) {
          elementType = 'CodeSystem';
        } else if (fileName.includes('ConceptMap')) {
          elementType = 'ConceptMap';
        }
        
        // Try to read file for more details
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          const jsonData = JSON.parse(contentStr);
          
          elementName = jsonData.name || jsonData.title || jsonData.id || elementName;
          elementType = jsonData.resourceType || elementType;
        } catch {
          // Use filename if can't parse
        }
        
        dataElements.push({
          name: elementName,
          file,
          type: elementType
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Check for profiles
    const profilesPath = 'input/profiles';
    try {
      const profileFiles = await storage.listFiles(`${profilesPath}/**/*.json`, { nodir: true });
      
      for (const file of profileFiles) {
        const fileName = file.split('/').pop() || file;
        let elementName = fileName.replace(/\.json$/i, '');
        
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          const jsonData = JSON.parse(contentStr);
          
          elementName = jsonData.name || jsonData.title || jsonData.id || elementName;
        } catch {
          // Use filename if can't parse
        }
        
        dataElements.push({
          name: elementName,
          file,
          type: 'StructureDefinition'
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Check for extensions
    const extensionsPath = 'input/extensions';
    try {
      const extensionFiles = await storage.listFiles(`${extensionsPath}/**/*.json`, { nodir: true });
      
      for (const file of extensionFiles) {
        const fileName = file.split('/').pop() || file;
        let elementName = fileName.replace(/\.json$/i, '');
        
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          const jsonData = JSON.parse(contentStr);
          
          elementName = jsonData.name || jsonData.title || jsonData.id || elementName;
        } catch {
          // Use filename if can't parse
        }
        
        dataElements.push({
          name: elementName,
          file,
          type: 'Extension'
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Build narrative
    let narrative = `<h4>${t('dak.faq.data_elements.title')}</h4>`;
    
    if (dataElements.length === 0) {
      narrative += `<p>${t('dak.faq.data_elements.none_found')}</p>`;
    } else {
      narrative += `<p>${t('dak.faq.data_elements.found_count', { count: dataElements.length })}</p>`;
      
      // Group by type
      const byType = dataElements.reduce((acc, element) => {
        if (!acc[element.type]) acc[element.type] = [];
        acc[element.type].push(element);
        return acc;
      }, {} as Record<string, any[]>);
      
      Object.keys(byType).forEach(type => {
        narrative += `<h5>${type} (${byType[type].length})</h5>`;
        narrative += '<ul>';
        byType[type].forEach((element: any) => {
          narrative += `<li><strong>${element.name}</strong> - <code>${element.file}</code></li>`;
        });
        narrative += '</ul>';
      });
    }

    return {
      structured: { dataElements },
      narrative,
      errors: [],
      warnings: dataElements.length === 0 ? [t('dak.faq.data_elements.no_elements_warning')] : [],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'data-elements',
          ttl: 3600,
          dependencies: ['input/vocabulary/', 'input/profiles/', 'input/extensions/']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { dataElements: [] },
      narrative: `<h4>${t('dak.faq.data_elements.title')}</h4><p class="error">${t('dak.faq.data_elements.error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};
