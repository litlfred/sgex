/**
 * DAK Name Question Executor
 * Extracts the DAK name from sushi-config.yaml
 */
export const executor = async (input) => {
    const { storage, locale = 'en', t } = input;
    try {
        const exists = await storage.fileExists('sushi-config.yaml');
        if (!exists) {
            return {
                structured: { name: null },
                narrative: `<h4>${t('dak.faq.name.title')}</h4><p class="error">${t('dak.faq.name.config_not_found')}</p>`,
                errors: [t('dak.faq.name.config_not_found')],
                warnings: [],
                meta: {}
            };
        }
        const content = await storage.readFile('sushi-config.yaml');
        const yaml = await import('js-yaml');
        const config = yaml.load(content.toString('utf-8'));
        const name = config?.name || config?.title || config?.id || null;
        return {
            structured: {
                name,
                id: config?.id,
                title: config?.title,
                version: config?.version
            },
            narrative: name
                ? `<h4>${t('dak.faq.name.title')}</h4><p>${t('dak.faq.name.found', { name })}</p>`
                : `<h4>${t('dak.faq.name.title')}</h4><p>${t('dak.faq.name.not_found')}</p>`,
            errors: [],
            warnings: name ? [] : [t('dak.faq.name.no_name_field')],
            meta: {
                cacheHint: {
                    scope: 'repository',
                    key: 'dak-name',
                    ttl: 3600,
                    dependencies: ['sushi-config.yaml']
                }
            }
        };
    }
    catch (error) {
        return {
            structured: { name: null },
            narrative: `<h4>${t('dak.faq.name.title')}</h4><p class="error">${t('dak.faq.name.read_error', { error: error.message })}</p>`,
            errors: [error.message],
            warnings: [],
            meta: {}
        };
    }
};
//# sourceMappingURL=executor.js.map