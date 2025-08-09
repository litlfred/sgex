/**
 * Decision Table Rules Question Component
 * Analyzes DMN files and counts rules in decision tables
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionDefinition, QuestionResult, CacheHint, QuestionLevel, ParameterDefinition } from '../../../types/QuestionDefinition.js';

// Use browser DOMParser when available
const getDOMParser = () => {
  if (typeof DOMParser !== 'undefined') {
    return DOMParser;
  } else {
    throw new Error('DOMParser not available (browser environment required for DMN parsing)');
  }
};

// Question metadata
export const metadata = new QuestionDefinition({
  id: 'decision-table-rules',
  level: QuestionLevel.ASSET,
  title: 'Decision Table Rules',
  description: 'How many rules are defined in this decision table?',
  parameters: [
    new ParameterDefinition({
      name: 'assetFile',
      type: 'string',
      required: true,
      description: 'Path to the DMN file to analyze'
    })
  ],
  tags: ['asset', 'decision-support', 'dmn', 'rules'],
  version: '1.0.0',
  assetTypes: ['dmn'],
  isTemplate: true
});

/**
 * Execute the decision table rules question
 * @param {Object} input - Question input parameters
 * @param {string} input.repository - Repository identifier
 * @param {string} input.locale - Locale for response
 * @param {string} input.branch - Git branch
 * @param {string} input.assetFile - Path to the DMN file
 * @param {Storage} input.storage - Storage interface
 * @returns {Promise<QuestionResult>} - Question result
 */
export async function execute(input) {
  const { locale = 'en_US', assetFile, storage } = input;
  const warnings = [];
  const errors = [];

  try {
    // Check if the DMN file exists
    const fileExists = await storage.fileExists(assetFile);
    if (!fileExists) {
      return new QuestionResult({
        structured: { 
          rules: [],
          decisionTables: [],
          fileName: assetFile,
          totalRules: 0
        },
        narrative: getLocalizedNarrative(locale, 'file_not_found', { fileName: assetFile }),
        errors: [getLocalizedError(locale, 'file_not_found', { fileName: assetFile })],
        meta: {
          cacheHint: new CacheHint({
            scope: 'file',
            key: `decision-table-rules-${assetFile}`,
            ttl: 3600,
            dependencies: [assetFile]
          })
        }
      });
    }

    // Read and parse the DMN file
    const dmnContent = await storage.readFile(assetFile);
    const analysisResult = await analyzeDmnRules(dmnContent.toString('utf-8'), assetFile);

    if (analysisResult.totalRules === 0) {
      warnings.push(getLocalizedError(locale, 'no_rules_found', { fileName: assetFile }));
    }

    return new QuestionResult({
      structured: analysisResult,
      narrative: getLocalizedNarrative(locale, 'success', analysisResult),
      warnings,
      errors,
      meta: {
        cacheHint: new CacheHint({
          scope: 'file',
          key: `decision-table-rules-${assetFile}`,
          ttl: 1800, // 30 minutes
          dependencies: [assetFile]
        })
      }
    });

  } catch (error) {
    return new QuestionResult({
      structured: { 
        rules: [],
        decisionTables: [],
        fileName: assetFile,
        totalRules: 0,
        error: error.message
      },
      narrative: getLocalizedNarrative(locale, 'error', { fileName: assetFile }),
      errors: [getLocalizedError(locale, 'parse_error', { fileName: assetFile, error: error.message })],
      meta: {
        cacheHint: new CacheHint({
          scope: 'file',
          key: `decision-table-rules-${assetFile}`,
          ttl: 60, // Short cache on error
          dependencies: [assetFile]
        })
      }
    });
  }
}

/**
 * Analyze DMN file and extract rule information
 * @param {string} dmnContent - DMN XML content
 * @param {string} fileName - File name for reference
 * @returns {Object} - Analysis result with rules and decision tables
 */
async function analyzeDmnRules(dmnContent, fileName) {
  try {
    const DOMParserClass = getDOMParser();
    const parser = new DOMParserClass();
    const doc = parser.parseFromString(dmnContent, 'text/xml');
    
    // Check for parsing errors
    const parseError = doc.getElementsByTagName('parsererror')[0];
    if (parseError) {
      throw new Error(`XML parsing error: ${parseError.textContent}`);
    }

    const result = {
      fileName,
      decisionTables: [],
      rules: [],
      totalRules: 0,
      totalTables: 0,
      statistics: {
        averageRulesPerTable: 0,
        maxRulesInTable: 0,
        minRulesInTable: 0,
        tablesWithNoRules: 0
      }
    };

    // Find all decision tables
    const decisionTables = doc.getElementsByTagNameNS('*', 'decisionTable') || doc.getElementsByTagName('decisionTable');
    result.totalTables = decisionTables.length;

    const ruleCounts = [];

    for (let i = 0; i < decisionTables.length; i++) {
      const decisionTable = decisionTables[i];
      
      // Get decision element that contains this table
      const decision = decisionTable.closest('[*|*="decision"]') || 
                      decisionTable.parentElement?.closest('[name*="decision"]') ||
                      findDecisionParent(decisionTable);

      const tableInfo = {
        id: decisionTable.getAttribute('id'),
        hitPolicy: decisionTable.getAttribute('hitPolicy') || 'UNIQUE',
        aggregation: decisionTable.getAttribute('aggregation'),
        decisionId: decision?.getAttribute('id'),
        decisionName: decision?.getAttribute('name'),
        rules: [],
        ruleCount: 0
      };

      // Find all rules in this decision table
      const rules = decisionTable.getElementsByTagNameNS('*', 'rule') || decisionTable.getElementsByTagName('rule');
      tableInfo.ruleCount = rules.length;
      ruleCounts.push(rules.length);

      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        const ruleInfo = {
          id: rule.getAttribute('id'),
          index: j + 1,
          tableId: tableInfo.id,
          decisionId: tableInfo.decisionId,
          inputEntries: [],
          outputEntries: [],
          description: null
        };

        // Get input entries
        const inputEntries = rule.getElementsByTagNameNS('*', 'inputEntry') || rule.getElementsByTagName('inputEntry');
        for (let k = 0; k < inputEntries.length; k++) {
          const inputEntry = inputEntries[k];
          const textElement = inputEntry.getElementsByTagNameNS('*', 'text')[0] || inputEntry.getElementsByTagName('text')[0];
          ruleInfo.inputEntries.push({
            index: k + 1,
            text: textElement?.textContent?.trim() || ''
          });
        }

        // Get output entries
        const outputEntries = rule.getElementsByTagNameNS('*', 'outputEntry') || rule.getElementsByTagName('outputEntry');
        for (let k = 0; k < outputEntries.length; k++) {
          const outputEntry = outputEntries[k];
          const textElement = outputEntry.getElementsByTagNameNS('*', 'text')[0] || outputEntry.getElementsByTagName('text')[0];
          ruleInfo.outputEntries.push({
            index: k + 1,
            text: textElement?.textContent?.trim() || ''
          });
        }

        // Look for description
        const descriptions = rule.getElementsByTagNameNS('*', 'description') || rule.getElementsByTagName('description');
        if (descriptions.length > 0) {
          ruleInfo.description = descriptions[0].textContent.trim();
        }

        tableInfo.rules.push(ruleInfo);
        result.rules.push(ruleInfo);
      }

      result.decisionTables.push(tableInfo);
    }

    // Calculate statistics
    result.totalRules = result.rules.length;
    
    if (ruleCounts.length > 0) {
      result.statistics.averageRulesPerTable = (ruleCounts.reduce((sum, count) => sum + count, 0) / ruleCounts.length).toFixed(1);
      result.statistics.maxRulesInTable = Math.max(...ruleCounts);
      result.statistics.minRulesInTable = Math.min(...ruleCounts);
      result.statistics.tablesWithNoRules = ruleCounts.filter(count => count === 0).length;
    }

    return result;

  } catch (error) {
    throw new Error(`Failed to parse DMN file ${fileName}: ${error.message}`);
  }
}

/**
 * Find decision parent element for a decision table
 * @param {Element} decisionTable - Decision table element
 * @returns {Element|null} - Decision parent element
 */
function findDecisionParent(decisionTable) {
  let parent = decisionTable.parentElement;
  while (parent) {
    if (parent.tagName && (parent.tagName.includes('decision') || parent.tagName.endsWith(':decision'))) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

/**
 * React component for rendering decision table rules narrative
 */
export function Render({ result, locale = 'en_US' }) {
  const { t } = useTranslation();

  if (!result || !result.structured) {
    return <div className="faq-answer error">{t('dak.faq.decision_rules.no_data')}</div>;
  }

  const { decisionTables, rules, fileName, totalRules, totalTables, statistics } = result.structured;

  if (totalRules === 0) {
    return (
      <div className="faq-answer warning">
        <h4>{t('dak.faq.decision_rules.title')}</h4>
        <p>No rules found in <code>{fileName}</code></p>
        {result.errors?.map((error, index) => (
          <div key={index} className="error-message">{error}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="faq-answer success">
      <h4>{t('dak.faq.decision_rules.title')}</h4>
      
      <div className="decision-summary">
        <p>
          <strong>File: </strong><code>{fileName}</code>
        </p>
        <p>
          <strong>Total Rules: </strong><span className="highlight">{totalRules}</span>
        </p>
        <p>
          <strong>Decision Tables: </strong>{totalTables}
        </p>
      </div>

      {statistics && (
        <div className="rule-statistics">
          <h5>Rule Statistics</h5>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Average rules per table: </strong>{statistics.averageRulesPerTable}
            </div>
            <div className="stat-item">
              <strong>Maximum rules in a table: </strong>{statistics.maxRulesInTable}
            </div>
            <div className="stat-item">
              <strong>Minimum rules in a table: </strong>{statistics.minRulesInTable}
            </div>
            {statistics.tablesWithNoRules > 0 && (
              <div className="stat-item warning">
                <strong>Tables with no rules: </strong>{statistics.tablesWithNoRules}
              </div>
            )}
          </div>
        </div>
      )}

      {decisionTables.length > 0 && (
        <div className="decision-tables-list">
          <h5>Decision Tables</h5>
          {decisionTables.map((table, index) => (
            <div key={index} className="table-item">
              <div className="table-header">
                <strong>{table.decisionName || table.decisionId || `Table ${index + 1}`}</strong>
                <span className="rule-count">({table.ruleCount} rules)</span>
                <span className="hit-policy">Hit Policy: {table.hitPolicy}</span>
              </div>
              
              {table.rules.length > 0 && (
                <div className="table-rules">
                  <div className="rules-summary">
                    Rules {table.rules[0].index} - {table.rules[table.rules.length - 1].index} 
                    ({table.rules.length} total)
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {result.warnings?.map((warning, index) => (
        <div key={index} className="warning-message">{warning}</div>
      ))}
      
      {result.errors?.map((error, index) => (
        <div key={index} className="error-message">{error}</div>
      ))}
    </div>
  );
}

/**
 * Get localized narrative text
 */
function getLocalizedNarrative(locale, type, params = {}) {
  const narratives = {
    en_US: {
      success: (() => {
        const { totalRules, totalTables, fileName, statistics } = params;
        let html = `<h4>Decision Table Rules</h4>`;
        html += `<p>Analysis of <strong>${fileName}</strong>:</p>`;
        
        if (totalRules === 0) {
          html += `<p class="warning">No rules found in this decision table.</p>`;
        } else {
          html += `<p>This file contains <strong>${totalRules}</strong> rule(s) across <strong>${totalTables}</strong> decision table(s).</p>`;
          
          if (statistics) {
            html += `<div class="rule-stats">`;
            html += `<p><strong>Average rules per table:</strong> ${statistics.averageRulesPerTable}</p>`;
            html += `<p><strong>Maximum rules in a table:</strong> ${statistics.maxRulesInTable}</p>`;
            if (statistics.tablesWithNoRules > 0) {
              html += `<p class="warning"><strong>Tables with no rules:</strong> ${statistics.tablesWithNoRules}</p>`;
            }
            html += `</div>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Decision Table Rules</h4><p class="error">The DMN file <code>${params.fileName}</code> was not found.</p>`,
      error: `<h4>Decision Table Rules</h4><p class="error">An error occurred while analyzing the DMN file <code>${params.fileName}</code>.</p>`
    },
    fr_FR: {
      success: (() => {
        const { totalRules, totalTables, fileName, statistics } = params;
        let html = `<h4>Règles de table de décision</h4>`;
        html += `<p>Analyse de <strong>${fileName}</strong>:</p>`;
        
        if (totalRules === 0) {
          html += `<p class="warning">Aucune règle trouvée dans cette table de décision.</p>`;
        } else {
          html += `<p>Ce fichier contient <strong>${totalRules}</strong> règle(s) dans <strong>${totalTables}</strong> table(s) de décision.</p>`;
          
          if (statistics) {
            html += `<div class="rule-stats">`;
            html += `<p><strong>Règles moyennes par table:</strong> ${statistics.averageRulesPerTable}</p>`;
            html += `<p><strong>Maximum de règles dans une table:</strong> ${statistics.maxRulesInTable}</p>`;
            if (statistics.tablesWithNoRules > 0) {
              html += `<p class="warning"><strong>Tables sans règles:</strong> ${statistics.tablesWithNoRules}</p>`;
            }
            html += `</div>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Règles de table de décision</h4><p class="error">Le fichier DMN <code>${params.fileName}</code> n'a pas été trouvé.</p>`,
      error: `<h4>Règles de table de décision</h4><p class="error">Une erreur s'est produite lors de l'analyse du fichier DMN <code>${params.fileName}</code>.</p>`
    },
    es_ES: {
      success: (() => {
        const { totalRules, totalTables, fileName, statistics } = params;
        let html = `<h4>Reglas de tabla de decisión</h4>`;
        html += `<p>Análisis de <strong>${fileName}</strong>:</p>`;
        
        if (totalRules === 0) {
          html += `<p class="warning">No se encontraron reglas en esta tabla de decisión.</p>`;
        } else {
          html += `<p>Este archivo contiene <strong>${totalRules}</strong> regla(s) en <strong>${totalTables}</strong> tabla(s) de decisión.</p>`;
          
          if (statistics) {
            html += `<div class="rule-stats">`;
            html += `<p><strong>Promedio de reglas por tabla:</strong> ${statistics.averageRulesPerTable}</p>`;
            html += `<p><strong>Máximo de reglas en una tabla:</strong> ${statistics.maxRulesInTable}</p>`;
            if (statistics.tablesWithNoRules > 0) {
              html += `<p class="warning"><strong>Tablas sin reglas:</strong> ${statistics.tablesWithNoRules}</p>`;
            }
            html += `</div>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Reglas de tabla de decisión</h4><p class="error">El archivo DMN <code>${params.fileName}</code> no se encontró.</p>`,
      error: `<h4>Reglas de tabla de decisión</h4><p class="error">Ocurrió un error al analizar el archivo DMN <code>${params.fileName}</code>.</p>`
    }
  };

  const localeData = narratives[locale] || narratives['en_US'];
  return localeData[type] || localeData.error;
}

/**
 * Get localized error message
 */
function getLocalizedError(locale, type, params = {}) {
  const errors = {
    en_US: {
      file_not_found: `DMN file not found: ${params.fileName}`,
      no_rules_found: `No rules found in DMN file: ${params.fileName}`,
      parse_error: `Failed to parse DMN file ${params.fileName}: ${params.error}`
    },
    fr_FR: {
      file_not_found: `Fichier DMN non trouvé: ${params.fileName}`,
      no_rules_found: `Aucune règle trouvée dans le fichier DMN: ${params.fileName}`,
      parse_error: `Échec de l'analyse du fichier DMN ${params.fileName}: ${params.error}`
    },
    es_ES: {
      file_not_found: `Archivo DMN no encontrado: ${params.fileName}`,
      no_rules_found: `No se encontraron reglas en el archivo DMN: ${params.fileName}`,
      parse_error: `Error al analizar el archivo DMN ${params.fileName}: ${params.error}`
    }
  };

  const localeData = errors[locale] || errors['en_US'];
  return localeData[type] || `Unknown error: ${type}`;
}