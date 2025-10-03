/**
 * Decision Logic Question Executor
 * Scans for decision support logic files (DMN, CQL)
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const decisionLogic: any[] = [];
    
    // Check for decision-support directory
    const decisionPath = 'input/decision-support';
    try {
      const decisionFiles = await storage.listFiles(`${decisionPath}/**/*.{dmn,cql}`, { nodir: true });
      
      for (const file of decisionFiles) {
        const fileName = file.split('/').pop() || file;
        let logicName = fileName.replace(/\.(dmn|cql)$/i, '');
        const fileType = fileName.endsWith('.dmn') ? 'dmn' : 'cql';
        
        // Try to read file for decision name
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          
          if (fileType === 'dmn') {
            // Extract decision name from DMN XML
            const nameMatch = contentStr.match(/name="([^"]+)"/);
            if (nameMatch) {
              logicName = nameMatch[1];
            }
          } else if (fileType === 'cql') {
            // Extract library name from CQL
            const libMatch = contentStr.match(/library\s+(\w+)/);
            if (libMatch) {
              logicName = libMatch[1];
            }
          }
        } catch {
          // Use filename if can't parse
        }
        
        decisionLogic.push({
          name: logicName,
          file,
          type: fileType.toUpperCase()
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Check for CQL directory
    const cqlPath = 'input/cql';
    try {
      const cqlFiles = await storage.listFiles(`${cqlPath}/**/*.cql`, { nodir: true });
      
      cqlFiles.forEach(file => {
        if (!decisionLogic.find(d => d.file === file)) {
          const fileName = file.split('/').pop() || file;
          decisionLogic.push({
            name: fileName.replace(/\.cql$/i, ''),
            file,
            type: 'CQL'
          });
        }
      });
    } catch {
      // Directory doesn't exist
    }
    
    // Check for DMN files in other locations
    try {
      const dmnFiles = await storage.listFiles('input/**/*.dmn', { nodir: true });
      
      dmnFiles.forEach(file => {
        if (!decisionLogic.find(d => d.file === file)) {
          const fileName = file.split('/').pop() || file;
          decisionLogic.push({
            name: fileName.replace(/\.dmn$/i, '').replace(/-/g, ' '),
            file,
            type: 'DMN'
          });
        }
      });
    } catch {
      // No matching files
    }
    
    // Check for PlanDefinition files (decision support)
    try {
      const planFiles = await storage.listFiles('input/**/PlanDefinition*.json', { nodir: true });
      
      for (const file of planFiles) {
        const fileName = file.split('/').pop() || file;
        let planName = fileName.replace(/\.json$/i, '');
        
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          const jsonData = JSON.parse(contentStr);
          
          planName = jsonData.name || jsonData.title || jsonData.id || planName;
        } catch {
          // Use filename if can't parse
        }
        
        decisionLogic.push({
          name: planName,
          file,
          type: 'PlanDefinition'
        });
      }
    } catch {
      // No matching files
    }
    
    // Build narrative
    let narrative = `<h4>${t('dak.faq.decision_logic.title')}</h4>`;
    
    if (decisionLogic.length === 0) {
      narrative += `<p>${t('dak.faq.decision_logic.none_found')}</p>`;
    } else {
      narrative += `<p>${t('dak.faq.decision_logic.found_count', { count: decisionLogic.length })}</p>`;
      
      // Group by type
      const byType = decisionLogic.reduce((acc, logic) => {
        if (!acc[logic.type]) acc[logic.type] = [];
        acc[logic.type].push(logic);
        return acc;
      }, {} as Record<string, any[]>);
      
      Object.keys(byType).forEach(type => {
        narrative += `<h5>${type} (${byType[type].length})</h5>`;
        narrative += '<ul>';
        byType[type].forEach((logic: any) => {
          narrative += `<li><strong>${logic.name}</strong> - <code>${logic.file}</code></li>`;
        });
        narrative += '</ul>';
      });
    }

    return {
      structured: { decisionLogic },
      narrative,
      errors: [],
      warnings: decisionLogic.length === 0 ? [t('dak.faq.decision_logic.no_logic_warning')] : [],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'decision-logic',
          ttl: 3600,
          dependencies: ['input/decision-support/', 'input/cql/']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { decisionLogic: [] },
      narrative: `<h4>${t('dak.faq.decision_logic.title')}</h4><p class="error">${t('dak.faq.decision_logic.error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};
