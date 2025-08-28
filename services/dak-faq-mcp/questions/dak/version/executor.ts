/**
 * DAK Version Question Executor
 * Extracts the DAK version from sushi-config.yaml
 */

import { FAQExecutor, FAQExecutionInput, FAQExecutionResult } from '../../../types.js';

export const executor: FAQExecutor = async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
  const { storage, locale = 'en', t } = input;
  
  try {
    const exists = await storage.fileExists('sushi-config.yaml');
    if (!exists) {
      return {
        structured: { version: null },
        narrative: `<h4>${t('dak.faq.version.title')}</h4><p class="error">${t('dak.faq.version.config_not_found')}</p>`,
        errors: [t('dak.faq.version.config_not_found')],
        warnings: [],
        meta: {}
      };
    }

    const content = await storage.readFile('sushi-config.yaml');
    const yaml = await import('js-yaml');
    const config = yaml.load(content.toString('utf-8')) as any;
    
    const version = config?.version || null;
    const status = config?.status || null;
    
    return {
      structured: { 
        version,
        status,
        releaseDate: config?.releaseDate || config?.date,
        name: config?.name,
        id: config?.id
      },
      narrative: version 
        ? `<h4>${t('dak.faq.version.title')}</h4><p>${t('dak.faq.version.found', { version })}</p>${status ? `<p>${t('dak.faq.version.status', { status })}</p>` : ''}`
        : `<h4>${t('dak.faq.version.title')}</h4><p>${t('dak.faq.version.not_found')}</p>`,
      errors: [],
      warnings: version ? [] : [t('dak.faq.version.no_version_field')],
      meta: {
        cacheHint: {
          scope: 'repository',
          key: 'dak-version',
          ttl: 3600,
          dependencies: ['sushi-config.yaml']
        }
      }
    };
  } catch (error: any) {
    return {
      structured: { version: null },
      narrative: `<h4>${t('dak.faq.version.title')}</h4><p class="error">${t('dak.faq.version.read_error', { error: error.message })}</p>`,
      errors: [error.message],
      warnings: [],
      meta: {}
    };
  }
};