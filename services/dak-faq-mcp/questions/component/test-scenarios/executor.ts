/**
 * Test Scenarios Question Executor
 * Scans for test scenario, test case, and validation files
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const testScenarios: any[] = [];
    
    // Check for tests directory
    const testsPath = 'input/tests';
    try {
      const testFiles = await storage.listFiles(`${testsPath}/**/*.{json,xml,feature}`, { nodir: true });
      
      for (const file of testFiles) {
        const fileName = file.split('/').pop() || file;
        let testName = fileName.replace(/\.(json|xml|feature)$/i, '');
        let testType = 'test';
        
        // Determine type from extension
        if (fileName.endsWith('.feature')) {
          testType = 'Gherkin';
        } else if (fileName.endsWith('.xml')) {
          testType = 'XML';
        } else if (fileName.endsWith('.json')) {
          testType = 'JSON';
        }
        
        // Try to read file for more details
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          
          if (file.endsWith('.json')) {
            const jsonData = JSON.parse(contentStr);
            testName = jsonData.name || jsonData.title || jsonData.id || testName;
            testType = jsonData.resourceType || testType;
          } else if (file.endsWith('.feature')) {
            // Extract feature name from Gherkin
            const featureMatch = contentStr.match(/^Feature:\s+(.+)$/m);
            if (featureMatch) {
              testName = featureMatch[1];
            }
          }
        } catch {
          // Use filename if can't parse
        }
        
        testScenarios.push({
          name: testName,
          file,
          type: testType
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Check for examples directory (test data)
    const examplesPath = 'input/examples';
    try {
      const exampleFiles = await storage.listFiles(`${examplesPath}/**/*.{json,xml}`, { nodir: true });
      
      for (const file of exampleFiles) {
        const fileName = file.split('/').pop() || file;
        let exampleName = fileName.replace(/\.(json|xml)$/i, '');
        
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          
          if (file.endsWith('.json')) {
            const jsonData = JSON.parse(contentStr);
            exampleName = jsonData.name || jsonData.title || jsonData.id || exampleName;
          }
        } catch {
          // Use filename if can't parse
        }
        
        testScenarios.push({
          name: exampleName,
          file,
          type: 'example'
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Check for TestScript resources
    try {
      const testScriptFiles = await storage.listFiles('input/**/TestScript*.json', { nodir: true });
      
      for (const file of testScriptFiles) {
        const fileName = file.split('/').pop() || file;
        let scriptName = fileName.replace(/\.json$/i, '');
        
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          const jsonData = JSON.parse(contentStr);
          
          scriptName = jsonData.name || jsonData.title || jsonData.id || scriptName;
        } catch {
          // Use filename if can't parse
        }
        
        testScenarios.push({
          name: scriptName,
          file,
          type: 'TestScript'
        });
      }
    } catch {
      // No matching files
    }
    
    // Check for test-related files in pagecontent
    try {
      const testDocFiles = await storage.listFiles('input/pagecontent/*test*.md', { nodir: true });
      
      testDocFiles.forEach(file => {
        if (!testScenarios.find(t => t.file === file)) {
          const fileName = file.split('/').pop() || file;
          testScenarios.push({
            name: fileName.replace(/\.md$/i, '').replace(/-/g, ' '),
            file,
            type: 'documentation'
          });
        }
      });
    } catch {
      // No matching files
    }
    
    // Build narrative
    let narrative = `<h4>${t('dak.faq.test_scenarios.title')}</h4>`;
    
    if (testScenarios.length === 0) {
      narrative += `<p>${t('dak.faq.test_scenarios.none_found')}</p>`;
    } else {
      narrative += `<p>${t('dak.faq.test_scenarios.found_count', { count: testScenarios.length })}</p>`;
      
      // Group by type
      const byType = testScenarios.reduce((acc, test) => {
        if (!acc[test.type]) acc[test.type] = [];
        acc[test.type].push(test);
        return acc;
      }, {} as Record<string, any[]>);
      
      Object.keys(byType).forEach(type => {
        narrative += `<h5>${type} (${byType[type].length})</h5>`;
        narrative += '<ul>';
        byType[type].forEach((test: any) => {
          narrative += `<li><strong>${test.name}</strong> - <code>${test.file}</code></li>`;
        });
        narrative += '</ul>';
      });
    }

    return {
      structured: { testScenarios },
      narrative,
      errors: [],
      warnings: testScenarios.length === 0 ? [t('dak.faq.test_scenarios.no_scenarios_warning')] : [],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'test-scenarios',
          ttl: 3600,
          dependencies: ['input/tests/', 'input/examples/']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { testScenarios: [] },
      narrative: `<h4>${t('dak.faq.test_scenarios.title')}</h4><p class="error">${t('dak.faq.test_scenarios.error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};
