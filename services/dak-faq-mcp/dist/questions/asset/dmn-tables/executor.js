/**
 * Decision Table Inputs Question Executor
 * Analyzes DMN files to extract decision table input requirements
 */
export const executor = async (input) => {
    const { storage, assetFile, locale = 'en', t } = input;
    if (!assetFile) {
        return {
            structured: { inputs: [], decisionTables: [] },
            narrative: `<h4>${t('dak.faq.decision_table_inputs.title')}</h4><p class="error">${t('dak.faq.decision_table_inputs.no_asset_file')}</p>`,
            errors: [t('dak.faq.decision_table_inputs.no_asset_file')],
            warnings: [],
            meta: {}
        };
    }
    try {
        const exists = await storage.fileExists(assetFile);
        if (!exists) {
            return {
                structured: { inputs: [], decisionTables: [] },
                narrative: `<h4>${t('dak.faq.decision_table_inputs.title')}</h4><p class="error">${t('dak.faq.decision_table_inputs.file_not_found', { file: assetFile })}</p>`,
                errors: [t('dak.faq.decision_table_inputs.file_not_found', { file: assetFile })],
                warnings: [],
                meta: {}
            };
        }
        const content = await storage.readFile(assetFile);
        const xmlContent = content.toString('utf-8');
        // Parse XML using DOMParser
        const { DOMParser } = await import('@xmldom/xmldom');
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlContent, 'text/xml');
        // Check for parse errors
        const parseError = doc.getElementsByTagName('parsererror')[0];
        if (parseError) {
            return {
                structured: { inputs: [], decisionTables: [] },
                narrative: `<h4>${t('dak.faq.decision_table_inputs.title')}</h4><p class="error">${t('dak.faq.decision_table_inputs.parse_error')}</p>`,
                errors: [t('dak.faq.decision_table_inputs.parse_error')],
                warnings: [],
                meta: {}
            };
        }
        // Extract inputs from DMN
        const inputs = [];
        const inputElements = doc.getElementsByTagName('inputData');
        for (let i = 0; i < inputElements.length; i++) {
            const element = inputElements[i];
            const id = element.getAttribute('id') || '';
            const name = element.getAttribute('name') || '';
            inputs.push({
                id,
                label: name,
                type: 'input',
                expression: ''
            });
        }
        // Extract decision tables
        const decisionTables = [];
        const decisionElements = doc.getElementsByTagName('decision');
        for (let i = 0; i < decisionElements.length; i++) {
            const element = decisionElements[i];
            const id = element.getAttribute('id') || '';
            const name = element.getAttribute('name') || '';
            // Find decision table within decision
            const tableElements = element.getElementsByTagName('decisionTable');
            if (tableElements.length > 0) {
                const table = tableElements[0];
                const hitPolicy = table.getAttribute('hitPolicy') || 'UNIQUE';
                // Extract table inputs
                const tableInputs = [];
                const inputElements = table.getElementsByTagName('input');
                for (let j = 0; j < inputElements.length; j++) {
                    const input = inputElements[j];
                    tableInputs.push({
                        id: input.getAttribute('id') || '',
                        label: input.getAttribute('label') || '',
                        expression: input.getElementsByTagName('inputExpression')[0]?.getAttribute('typeRef') || ''
                    });
                }
                // Extract table outputs
                const tableOutputs = [];
                const outputElements = table.getElementsByTagName('output');
                for (let j = 0; j < outputElements.length; j++) {
                    const output = outputElements[j];
                    tableOutputs.push({
                        id: output.getAttribute('id') || '',
                        label: output.getAttribute('label') || '',
                        type: output.getAttribute('typeRef') || ''
                    });
                }
                decisionTables.push({
                    id,
                    name,
                    hitPolicy,
                    inputs: tableInputs,
                    outputs: tableOutputs
                });
            }
        }
        // Build narrative
        let narrative = `<h4>${t('dak.faq.decision_table_inputs.title')}</h4>`;
        if (decisionTables.length === 0) {
            narrative += `<p>${t('dak.faq.decision_table_inputs.no_tables')}</p>`;
        }
        else {
            narrative += `<p>${t('dak.faq.decision_table_inputs.found_tables', { count: decisionTables.length })}</p>`;
            decisionTables.forEach(table => {
                narrative += `<div class="decision-table">`;
                narrative += `<h5>${table.name} (${table.id})</h5>`;
                narrative += `<p><strong>${t('dak.faq.decision_table_inputs.hit_policy')}:</strong> ${table.hitPolicy}</p>`;
                if (table.inputs.length > 0) {
                    narrative += `<p><strong>${t('dak.faq.decision_table_inputs.inputs')}:</strong></p><ul>`;
                    table.inputs.forEach((input) => {
                        narrative += `<li>${input.label || input.id}${input.expression ? ` (${input.expression})` : ''}</li>`;
                    });
                    narrative += `</ul>`;
                }
                if (table.outputs.length > 0) {
                    narrative += `<p><strong>${t('dak.faq.decision_table_inputs.outputs')}:</strong></p><ul>`;
                    table.outputs.forEach((output) => {
                        narrative += `<li>${output.label || output.id}${output.type ? ` (${output.type})` : ''}</li>`;
                    });
                    narrative += `</ul>`;
                }
                narrative += `</div>`;
            });
        }
        return {
            structured: { inputs, decisionTables },
            narrative,
            errors: [],
            warnings: inputs.length === 0 ? [t('dak.faq.decision_table_inputs.no_inputs')] : [],
            meta: {
                cacheHint: {
                    scope: 'file',
                    key: `decision-table-inputs-${assetFile}`,
                    ttl: 1800,
                    dependencies: [assetFile]
                }
            }
        };
    }
    catch (error) {
        return {
            structured: { inputs: [], decisionTables: [] },
            narrative: `<h4>${t('dak.faq.decision_table_inputs.title')}</h4><p class="error">${t('dak.faq.decision_table_inputs.analysis_error', { error: error.message })}</p>`,
            errors: [error.message],
            warnings: [],
            meta: {}
        };
    }
};
//# sourceMappingURL=executor.js.map