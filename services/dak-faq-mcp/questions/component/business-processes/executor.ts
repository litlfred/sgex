/**
 * Business Processes Question Executor
 * Scans for business process and workflow files (BPMN)
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const processes: any[] = [];
    
    // Check for process directory
    const processPath = 'input/process';
    try {
      const processFiles = await storage.listFiles(`${processPath}/**/*.bpmn`, { nodir: true });
      
      for (const file of processFiles) {
        const fileName = file.split('/').pop() || file;
        let processName = fileName.replace(/\.bpmn$/i, '');
        
        // Try to read BPMN file for process name
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          
          // Extract process name from BPMN XML
          const nameMatch = contentStr.match(/name="([^"]+)"/);
          if (nameMatch) {
            processName = nameMatch[1];
          }
        } catch {
          // Use filename if can't parse
        }
        
        processes.push({
          name: processName,
          file,
          type: 'bpmn'
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Also check for BPMN files in other locations
    try {
      const bpmnFiles = await storage.listFiles('input/**/*.bpmn', { nodir: true });
      bpmnFiles.forEach(file => {
        if (!processes.find(p => p.file === file)) {
          const fileName = file.split('/').pop() || file;
          processes.push({
            name: fileName.replace(/\.bpmn$/i, '').replace(/-/g, ' '),
            file,
            type: 'bpmn'
          });
        }
      });
    } catch {
      // No matching files
    }
    
    // Check for workflow documentation files
    try {
      const workflowFiles = await storage.listFiles('input/**/*workflow*.md', { nodir: true });
      workflowFiles.forEach(file => {
        const fileName = file.split('/').pop() || file;
        processes.push({
          name: fileName.replace(/\.md$/i, '').replace(/-/g, ' '),
          file,
          type: 'documentation'
        });
      });
    } catch {
      // No matching files
    }
    
    // Build narrative
    let narrative = `<h4>${t('dak.faq.business_processes.title')}</h4>`;
    
    if (processes.length === 0) {
      narrative += `<p>${t('dak.faq.business_processes.none_found')}</p>`;
    } else {
      narrative += `<p>${t('dak.faq.business_processes.found_count', { count: processes.length })}</p>`;
      narrative += '<ul>';
      processes.forEach(process => {
        narrative += `<li><strong>${process.name}</strong> (${process.type}) - <code>${process.file}</code></li>`;
      });
      narrative += '</ul>';
    }

    return {
      structured: { processes },
      narrative,
      errors: [],
      warnings: processes.length === 0 ? [t('dak.faq.business_processes.no_processes_warning')] : [],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'business-processes',
          ttl: 3600,
          dependencies: ['input/process/']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { processes: [] },
      narrative: `<h4>${t('dak.faq.business_processes.title')}</h4><p class="error">${t('dak.faq.business_processes.error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};
