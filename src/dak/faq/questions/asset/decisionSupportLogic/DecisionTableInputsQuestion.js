/**
 * Decision Table Inputs Question Component
 * Analyzes DMN files and extracts input requirements for decision tables
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
  id: 'decision-table-inputs',
  level: QuestionLevel.ASSET,
  title: 'Decision Table Inputs',
  description: 'What are the inputs required for this decision table?',
  parameters: [
    new ParameterDefinition({
      name: 'assetFile',
      type: 'string',
      required: true,
      description: 'Path to the DMN file to analyze'
    })
  ],
  tags: ['asset', 'decision-support', 'dmn', 'inputs'],
  version: '1.0.0',
  assetTypes: ['dmn'],
  isTemplate: true
});

/**
 * Execute the decision table inputs question
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
          inputs: [],
          decisionTables: [],
          fileName: assetFile
        },
        narrative: getLocalizedNarrative(locale, 'file_not_found', { fileName: assetFile }),
        errors: [getLocalizedError(locale, 'file_not_found', { fileName: assetFile })],
        meta: {
          cacheHint: new CacheHint({
            scope: 'file',
            key: `decision-table-inputs-${assetFile}`,
            ttl: 3600,
            dependencies: [assetFile]
          })
        }
      });
    }

    // Read and parse the DMN file
    const dmnContent = await storage.readFile(assetFile);
    const analysisResult = await analyzeDmnInputs(dmnContent, assetFile);

    if (analysisResult.inputs.length === 0) {
      warnings.push(getLocalizedError(locale, 'no_inputs_found', { fileName: assetFile }));
    }

    return new QuestionResult({
      structured: analysisResult,
      narrative: getLocalizedNarrative(locale, 'success', analysisResult),
      warnings,
      errors,
      meta: {
        cacheHint: new CacheHint({
          scope: 'file',
          key: `decision-table-inputs-${assetFile}`,
          ttl: 1800, // 30 minutes
          dependencies: [assetFile]
        })
      }
    });

  } catch (error) {
    return new QuestionResult({
      structured: { 
        inputs: [],
        decisionTables: [],
        fileName: assetFile,
        error: error.message
      },
      narrative: getLocalizedNarrative(locale, 'error', { fileName: assetFile }),
      errors: [getLocalizedError(locale, 'parse_error', { fileName: assetFile, error: error.message })],
      meta: {
        cacheHint: new CacheHint({
          scope: 'file',
          key: `decision-table-inputs-${assetFile}`,
          ttl: 60, // Short cache on error
          dependencies: [assetFile]
        })
      }
    });
  }
}

/**
 * Analyze DMN file and extract input requirements
 * @param {string} dmnContent - DMN XML content
 * @param {string} fileName - File name for reference
 * @returns {Object} - Analysis result with inputs and decision tables
 */
async function analyzeDmnInputs(dmnContent, fileName) {
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
      inputs: [],
      decisionTables: [],
      decisions: [],
      totalInputs: 0
    };

    // Find all decision elements
    const decisions = doc.getElementsByTagNameNS('*', 'decision') || doc.getElementsByTagName('decision');
    
    for (let i = 0; i < decisions.length; i++) {
      const decision = decisions[i];
      const decisionInfo = {
        id: decision.getAttribute('id'),
        name: decision.getAttribute('name') || decision.getAttribute('label'),
        question: null,
        inputs: []
      };

      // Extract question from decision element
      const questionElements = decision.getElementsByTagNameNS('*', 'question') || decision.getElementsByTagName('question');
      if (questionElements.length > 0) {
        decisionInfo.question = questionElements[0].textContent.trim();
      }

      result.decisions.push(decisionInfo);

      // Find decision tables within this decision
      const decisionTables = decision.getElementsByTagNameNS('*', 'decisionTable') || decision.getElementsByTagName('decisionTable');
      
      for (let j = 0; j < decisionTables.length; j++) {
        const decisionTable = decisionTables[j];
        const tableInfo = {
          id: decisionTable.getAttribute('id'),
          hitPolicy: decisionTable.getAttribute('hitPolicy') || 'UNIQUE',
          aggregation: decisionTable.getAttribute('aggregation'),
          decisionId: decisionInfo.id,
          decisionName: decisionInfo.name,
          inputs: [],
          outputs: []
        };

        // Extract input columns
        const inputs = decisionTable.getElementsByTagNameNS('*', 'input') || decisionTable.getElementsByTagName('input');
        
        for (let k = 0; k < inputs.length; k++) {
          const input = inputs[k];
          const inputInfo = {
            id: input.getAttribute('id'),
            label: input.getAttribute('label'),
            typeRef: null,
            expression: null,
            description: null
          };

          // Get input expression
          const inputExpressions = input.getElementsByTagNameNS('*', 'inputExpression') || input.getElementsByTagName('inputExpression');
          if (inputExpressions.length > 0) {
            const inputExpression = inputExpressions[0];
            inputInfo.typeRef = inputExpression.getAttribute('typeRef');
            
            // Get the text content of the input expression
            const textElements = inputExpression.getElementsByTagNameNS('*', 'text') || inputExpression.getElementsByTagName('text');
            if (textElements.length > 0) {
              inputInfo.expression = textElements[0].textContent.trim();
            }
          }

          // Look for description in input expression
          if (inputExpressions.length > 0) {
            const descriptions = inputExpressions[0].getElementsByTagNameNS('*', 'description') || 
                               inputExpressions[0].getElementsByTagName('description');
            if (descriptions.length > 0) {
              inputInfo.description = descriptions[0].textContent.trim();
            }
          }

          tableInfo.inputs.push(inputInfo);
          
          // Add to global inputs list if not already present
          const existingInput = result.inputs.find(i => 
            i.label === inputInfo.label || 
            i.expression === inputInfo.expression
          );
          
          if (!existingInput) {
            result.inputs.push({
              ...inputInfo,
              usedInTables: [tableInfo.id || tableInfo.decisionId],
              usedInDecisions: [decisionInfo.id]
            });
          } else {
            // Add reference to this table/decision
            if (!existingInput.usedInTables.includes(tableInfo.id || tableInfo.decisionId)) {
              existingInput.usedInTables.push(tableInfo.id || tableInfo.decisionId);
            }
            if (!existingInput.usedInDecisions.includes(decisionInfo.id)) {
              existingInput.usedInDecisions.push(decisionInfo.id);
            }
          }
        }

        // Extract output columns for completeness
        const outputs = decisionTable.getElementsByTagNameNS('*', 'output') || decisionTable.getElementsByTagName('output');
        
        for (let k = 0; k < outputs.length; k++) {
          const output = outputs[k];
          const outputInfo = {
            id: output.getAttribute('id'),
            label: output.getAttribute('label'),
            typeRef: output.getAttribute('typeRef'),
            description: null
          };

          // Look for description
          const descriptions = output.getElementsByTagNameNS('*', 'description') || output.getElementsByTagName('description');
          if (descriptions.length > 0) {
            outputInfo.description = descriptions[0].textContent.trim();
          }

          tableInfo.outputs.push(outputInfo);
        }

        result.decisionTables.push(tableInfo);
      }
    }

    result.totalInputs = result.inputs.length;
    
    return result;

  } catch (error) {
    throw new Error(`Failed to parse DMN file ${fileName}: ${error.message}`);
  }
}

/**
 * React component for rendering decision table inputs narrative
 */
export function Render({ result, locale = 'en_US' }) {
  const { t } = useTranslation();

  if (!result || !result.structured) {
    return <div className="faq-answer error">{t('dak.faq.decision_inputs.no_data')}</div>;
  }

  const { inputs, decisionTables, decisions, fileName, totalInputs } = result.structured;

  if (inputs.length === 0) {
    return (
      <div className="faq-answer warning">
        <h4>{t('dak.faq.decision_inputs.title')}</h4>
        <p>No inputs found in <code>{fileName}</code></p>
        {result.errors?.map((error, index) => (
          <div key={index} className="error-message">{error}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="faq-answer success">
      <h4>{t('dak.faq.decision_inputs.title')}</h4>
      
      <div className="decision-summary">
        <p>
          <strong>File: </strong><code>{fileName}</code>
        </p>
        <p>
          <strong>Total Inputs Required: </strong><span className="highlight">{totalInputs}</span>
        </p>
        <p>
          <strong>Decision Tables: </strong>{decisionTables.length}
        </p>
        <p>
          <strong>Decisions: </strong>{decisions.length}
        </p>
      </div>

      <div className="inputs-list">
        <h5>Required Inputs</h5>
        {inputs.map((input, index) => (
          <div key={index} className="input-item">
            <div className="input-header">
              <strong>{input.label || input.id}</strong>
              {input.typeRef && <span className="type-ref">({input.typeRef})</span>}
            </div>
            
            {input.expression && (
              <div className="input-expression">
                <strong>Expression: </strong>
                <code>{input.expression}</code>
              </div>
            )}
            
            {input.description && (
              <div className="input-description">
                <strong>Description: </strong>
                {input.description}
              </div>
            )}
            
            <div className="input-usage">
              <strong>Used in: </strong>
              {input.usedInDecisions.length} decision(s), {input.usedInTables.length} table(s)
            </div>
          </div>
        ))}
      </div>

      {decisionTables.length > 0 && (
        <div className="decision-tables-list">
          <h5>Decision Tables</h5>
          {decisionTables.map((table, index) => (
            <div key={index} className="table-item">
              <div className="table-header">
                <strong>{table.decisionName || table.decisionId}</strong>
                <span className="hit-policy">Hit Policy: {table.hitPolicy}</span>
              </div>
              
              <div className="table-details">
                <div className="table-inputs">
                  <strong>Inputs ({table.inputs.length}): </strong>
                  {table.inputs.map(input => input.label || input.id).join(', ')}
                </div>
                
                <div className="table-outputs">
                  <strong>Outputs ({table.outputs.length}): </strong>
                  {table.outputs.map(output => output.label || output.id).join(', ')}
                </div>
              </div>
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
        const { inputs, decisionTables, fileName, totalInputs } = params;
        let html = `<h4>Decision Table Inputs</h4>`;
        html += `<p>Analysis of <strong>${fileName}</strong>:</p>`;
        
        if (totalInputs === 0) {
          html += `<p class="warning">No inputs found in this decision table.</p>`;
        } else {
          html += `<p>This decision table requires <strong>${totalInputs}</strong> input(s):</p>`;
          html += `<ul>`;
          inputs.forEach(input => {
            html += `<li><strong>${input.label || input.id}</strong>`;
            if (input.typeRef) html += ` (${input.typeRef})`;
            if (input.expression) html += ` - <code>${input.expression}</code>`;
            html += `</li>`;
          });
          html += `</ul>`;
          
          if (decisionTables.length > 1) {
            html += `<p>Found ${decisionTables.length} decision tables in this file.</p>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Decision Table Inputs</h4><p class="error">The DMN file <code>${params.fileName}</code> was not found.</p>`,
      error: `<h4>Decision Table Inputs</h4><p class="error">An error occurred while analyzing the DMN file <code>${params.fileName}</code>.</p>`
    },
    fr_FR: {
      success: (() => {
        const { inputs, decisionTables, fileName, totalInputs } = params;
        let html = `<h4>Entrées de table de décision</h4>`;
        html += `<p>Analyse de <strong>${fileName}</strong>:</p>`;
        
        if (totalInputs === 0) {
          html += `<p class="warning">Aucune entrée trouvée dans cette table de décision.</p>`;
        } else {
          html += `<p>Cette table de décision nécessite <strong>${totalInputs}</strong> entrée(s):</p>`;
          html += `<ul>`;
          inputs.forEach(input => {
            html += `<li><strong>${input.label || input.id}</strong>`;
            if (input.typeRef) html += ` (${input.typeRef})`;
            if (input.expression) html += ` - <code>${input.expression}</code>`;
            html += `</li>`;
          });
          html += `</ul>`;
          
          if (decisionTables.length > 1) {
            html += `<p>Trouvé ${decisionTables.length} tables de décision dans ce fichier.</p>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Entrées de table de décision</h4><p class="error">Le fichier DMN <code>${params.fileName}</code> n'a pas été trouvé.</p>`,
      error: `<h4>Entrées de table de décision</h4><p class="error">Une erreur s'est produite lors de l'analyse du fichier DMN <code>${params.fileName}</code>.</p>`
    },
    es_ES: {
      success: (() => {
        const { inputs, decisionTables, fileName, totalInputs } = params;
        let html = `<h4>Entradas de tabla de decisión</h4>`;
        html += `<p>Análisis de <strong>${fileName}</strong>:</p>`;
        
        if (totalInputs === 0) {
          html += `<p class="warning">No se encontraron entradas en esta tabla de decisión.</p>`;
        } else {
          html += `<p>Esta tabla de decisión requiere <strong>${totalInputs}</strong> entrada(s):</p>`;
          html += `<ul>`;
          inputs.forEach(input => {
            html += `<li><strong>${input.label || input.id}</strong>`;
            if (input.typeRef) html += ` (${input.typeRef})`;
            if (input.expression) html += ` - <code>${input.expression}</code>`;
            html += `</li>`;
          });
          html += `</ul>`;
          
          if (decisionTables.length > 1) {
            html += `<p>Se encontraron ${decisionTables.length} tablas de decisión en este archivo.</p>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Entradas de tabla de decisión</h4><p class="error">El archivo DMN <code>${params.fileName}</code> no se encontró.</p>`,
      error: `<h4>Entradas de tabla de decisión</h4><p class="error">Ocurrió un error al analizar el archivo DMN <code>${params.fileName}</code>.</p>`
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
      no_inputs_found: `No inputs found in DMN file: ${params.fileName}`,
      parse_error: `Failed to parse DMN file ${params.fileName}: ${params.error}`
    },
    fr_FR: {
      file_not_found: `Fichier DMN non trouvé: ${params.fileName}`,
      no_inputs_found: `Aucune entrée trouvée dans le fichier DMN: ${params.fileName}`,
      parse_error: `Échec de l'analyse du fichier DMN ${params.fileName}: ${params.error}`
    },
    es_ES: {
      file_not_found: `Archivo DMN no encontrado: ${params.fileName}`,
      no_inputs_found: `No se encontraron entradas en el archivo DMN: ${params.fileName}`,
      parse_error: `Error al analizar el archivo DMN ${params.fileName}: ${params.error}`
    }
  };

  const localeData = errors[locale] || errors['en_US'];
  return localeData[type] || `Unknown error: ${type}`;
}