/**
 * Personas Question Executor
 * Scans for persona/actor definition files
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const personas: any[] = [];
    
    // Check for actors directory
    const actorsPath = 'input/actors';
    try {
      const actorFiles = await storage.listFiles(`${actorsPath}/**/*.{json,md}`, { nodir: true });
      
      for (const file of actorFiles) {
        const fileName = file.split('/').pop() || file;
        let personaName = fileName.replace(/\.(json|md)$/i, '');
        let role = 'Actor';
        
        // Try to read file content for more details
        try {
          const content = await storage.readFile(file);
          const contentStr = content.toString('utf-8');
          
          if (file.endsWith('.json')) {
            const jsonData = JSON.parse(contentStr);
            personaName = jsonData.name || jsonData.title || jsonData.id || personaName;
            role = jsonData.role || jsonData.type || 'Actor';
          } else if (file.endsWith('.md')) {
            // Extract title from markdown
            const titleMatch = contentStr.match(/^#\s+(.+)$/m);
            if (titleMatch) {
              personaName = titleMatch[1];
            }
          }
        } catch {
          // Use filename if can't parse
        }
        
        personas.push({
          name: personaName,
          file,
          role
        });
      }
    } catch {
      // Directory doesn't exist
    }
    
    // Also check for persona definitions in other locations
    try {
      const personaFiles = await storage.listFiles('input/**/persona*.{json,md}', { nodir: true });
      personaFiles.forEach(file => {
        if (!personas.find(p => p.file === file)) {
          const fileName = file.split('/').pop() || file;
          personas.push({
            name: fileName.replace(/\.(json|md)$/i, '').replace(/-/g, ' '),
            file,
            role: 'Persona'
          });
        }
      });
    } catch {
      // No matching files
    }
    
    // Build narrative
    let narrative = `<h4>${t('dak.faq.personas.title')}</h4>`;
    
    if (personas.length === 0) {
      narrative += `<p>${t('dak.faq.personas.none_found')}</p>`;
    } else {
      narrative += `<p>${t('dak.faq.personas.found_count', { count: personas.length })}</p>`;
      narrative += '<ul>';
      personas.forEach(persona => {
        narrative += `<li><strong>${persona.name}</strong> (${persona.role}) - <code>${persona.file}</code></li>`;
      });
      narrative += '</ul>';
    }

    return {
      structured: { personas },
      narrative,
      errors: [],
      warnings: personas.length === 0 ? [t('dak.faq.personas.no_personas_warning')] : [],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'personas',
          ttl: 3600,
          dependencies: ['input/actors/']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { personas: [] },
      narrative: `<h4>${t('dak.faq.personas.title')}</h4><p class="error">${t('dak.faq.personas.error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};
