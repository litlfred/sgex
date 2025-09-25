/**
 * Indicator Calculations Question Component
 * Analyzes indicator definition files for calculation formulas and methods
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionDefinition, QuestionResult, CacheHint, QuestionLevel, ParameterDefinition } from '../../../types/QuestionDefinition.js';

// Question metadata
export const metadata = new QuestionDefinition({
  id: 'indicator-calculations',
  level: QuestionLevel.ASSET,
  title: 'Indicator Calculations',
  description: 'How is this indicator calculated?',
  parameters: [
    new ParameterDefinition({
      name: 'assetFile',
      type: 'string',
      required: true,
      description: 'Path to the indicator definition file to analyze'
    })
  ],
  tags: ['asset', 'program-indicators', 'calculations', 'measures'],
  version: '1.0.0',
  assetTypes: ['json', 'yaml', 'xml'],
  isTemplate: true
});

/**
 * Execute the indicator calculations question
 * @param {Object} input - Question input parameters
 * @param {string} input.repository - Repository identifier
 * @param {string} input.locale - Locale for response
 * @param {string} input.branch - Git branch
 * @param {string} input.assetFile - Path to the indicator file
 * @param {Storage} input.storage - Storage interface
 * @returns {Promise<QuestionResult>} - Question result
 */
export async function execute(input) {
  const { locale = 'en_US', assetFile, storage } = input;
  const warnings = [];
  const errors = [];

  try {
    // Check if the file exists
    const fileExists = await storage.fileExists(assetFile);
    if (!fileExists) {
      return new QuestionResult({
        structured: { 
          calculations: [],
          indicators: [],
          fileName: assetFile,
          totalCalculations: 0
        },
        narrative: getLocalizedNarrative(locale, 'file_not_found', { fileName: assetFile }),
        errors: [getLocalizedError(locale, 'file_not_found', { fileName: assetFile })],
        meta: {
          cacheHint: new CacheHint({
            scope: 'file',
            key: `indicator-calculations-${assetFile}`,
            ttl: 3600,
            dependencies: [assetFile]
          })
        }
      });
    }

    // Read and analyze the file
    const fileContent = await storage.readFile(assetFile);
    const analysisResult = await analyzeIndicatorCalculations(fileContent, assetFile);

    if (analysisResult.totalCalculations === 0) {
      warnings.push(getLocalizedError(locale, 'no_calculations_found', { fileName: assetFile }));
    }

    return new QuestionResult({
      structured: analysisResult,
      narrative: getLocalizedNarrative(locale, 'success', analysisResult),
      warnings,
      errors,
      meta: {
        cacheHint: new CacheHint({
          scope: 'file',
          key: `indicator-calculations-${assetFile}`,
          ttl: 1800, // 30 minutes
          dependencies: [assetFile]
        })
      }
    });

  } catch (error) {
    return new QuestionResult({
      structured: { 
        calculations: [],
        indicators: [],
        fileName: assetFile,
        totalCalculations: 0,
        error: error.message
      },
      narrative: getLocalizedNarrative(locale, 'error', { fileName: assetFile }),
      errors: [getLocalizedError(locale, 'parse_error', { fileName: assetFile, error: error.message })],
      meta: {
        cacheHint: new CacheHint({
          scope: 'file',
          key: `indicator-calculations-${assetFile}`,
          ttl: 60, // Short cache on error
          dependencies: [assetFile]
        })
      }
    });
  }
}

/**
 * Analyze file content for indicator calculations
 * @param {string} content - File content
 * @param {string} fileName - File name for reference
 * @returns {Object} - Analysis result with calculation information
 */
async function analyzeIndicatorCalculations(content, fileName) {
  const result = {
    fileName,
    indicators: [],
    calculations: [],
    totalCalculations: 0,
    statistics: {
      ratioIndicators: 0,
      proportionIndicators: 0,
      countIndicators: 0,
      complexCalculations: 0,
      indicatorsWithTargets: 0
    }
  };

  try {
    let data;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Parse based on file type
    if (fileExtension === 'json') {
      data = JSON.parse(content);
    } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
      data = parseYamlLike(content);
    } else if (fileExtension === 'xml') {
      data = parseXmlForIndicators(content);
    } else {
      // Fall back to text analysis
      data = parseTextForIndicators(content);
    }

    // Extract indicator calculations
    extractIndicatorCalculations(data, result);

    // Calculate statistics
    result.statistics.ratioIndicators = result.calculations.filter(c => c.type === 'ratio').length;
    result.statistics.proportionIndicators = result.calculations.filter(c => c.type === 'proportion').length;
    result.statistics.countIndicators = result.calculations.filter(c => c.type === 'count').length;
    result.statistics.complexCalculations = result.calculations.filter(c => c.complexity === 'complex').length;
    result.statistics.indicatorsWithTargets = result.indicators.filter(i => i.target !== null).length;

    result.totalCalculations = result.calculations.length;

    return result;

  } catch (error) {
    throw new Error(`Failed to analyze indicators in file ${fileName}: ${error.message}`);
  }
}

/**
 * Extract indicator calculations from parsed data
 * @param {Object} data - Parsed file data
 * @param {Object} result - Result object to populate
 */
function extractIndicatorCalculations(data, result) {
  if (!data || typeof data !== 'object') return;

  // Look for common indicator patterns
  function searchForIndicators(obj, path = '') {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => searchForIndicators(item, `${path}[${index}]`));
    } else if (obj && typeof obj === 'object') {
      // Check if this object represents an indicator
      if (isIndicatorObject(obj)) {
        const indicator = extractIndicatorInfo(obj, path);
        result.indicators.push(indicator);
        
        // Extract calculation from this indicator
        const calculation = extractCalculationInfo(obj, indicator.id, path);
        if (calculation) {
          result.calculations.push(calculation);
        }
      }

      // Continue searching in nested objects
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;
        searchForIndicators(value, currentPath);
      });
    }
  }

  // Also look for FHIR Measure resources
  if (data.resourceType === 'Measure' || data.type === 'Measure') {
    const indicator = extractFhirMeasureInfo(data);
    result.indicators.push(indicator);
    
    const calculation = extractFhirMeasureCalculation(data);
    if (calculation) {
      result.calculations.push(calculation);
    }
  }

  searchForIndicators(data);
}

/**
 * Check if an object represents an indicator
 * @param {Object} obj - Object to check
 * @returns {boolean} - True if object appears to be an indicator
 */
function isIndicatorObject(obj) {
  if (!obj || typeof obj !== 'object') return false;

  const indicatorKeys = [
    'indicator', 'measure', 'metric', 'kpi', 'calculation',
    'numerator', 'denominator', 'formula', 'target'
  ];

  const objectKeys = Object.keys(obj).map(k => k.toLowerCase());
  
  // Check if object has indicator-related keys
  return indicatorKeys.some(key => objectKeys.includes(key)) ||
         objectKeys.some(key => indicatorKeys.some(indKey => key.includes(indKey)));
}

/**
 * Extract indicator information from object
 * @param {Object} obj - Indicator object
 * @param {string} path - Object path
 * @returns {Object} - Indicator information
 */
function extractIndicatorInfo(obj, path) {
  return {
    id: obj.id || obj.name || obj.title || `indicator_${result.indicators.length}`,
    name: obj.name || obj.title || obj.label,
    description: obj.description || obj.definition,
    type: obj.type || determineIndicatorType(obj),
    target: obj.target || obj.goal || obj.benchmark,
    frequency: obj.frequency || obj.reportingPeriod,
    path: path,
    dataSource: obj.dataSource || obj.source
  };
}

/**
 * Extract calculation information from indicator object
 * @param {Object} obj - Indicator object
 * @param {string} indicatorId - Indicator ID
 * @param {string} path - Object path
 * @returns {Object|null} - Calculation information
 */
function extractCalculationInfo(obj, indicatorId, path) {
  const calculation = {
    indicatorId: indicatorId,
    type: determineCalculationType(obj),
    complexity: 'simple',
    numerator: null,
    denominator: null,
    formula: null,
    parameters: [],
    path: path
  };

  // Extract numerator
  if (obj.numerator) {
    calculation.numerator = {
      description: obj.numerator.description || obj.numerator,
      criteria: obj.numerator.criteria || obj.numerator.definition,
      dataSource: obj.numerator.dataSource
    };
  }

  // Extract denominator
  if (obj.denominator) {
    calculation.denominator = {
      description: obj.denominator.description || obj.denominator,
      criteria: obj.denominator.criteria || obj.denominator.definition,
      dataSource: obj.denominator.dataSource
    };
  }

  // Extract formula
  if (obj.formula || obj.calculation || obj.expression) {
    calculation.formula = obj.formula || obj.calculation || obj.expression;
    calculation.complexity = analyzeFormulaComplexity(calculation.formula);
  }

  // Extract parameters
  if (obj.parameters || obj.variables) {
    calculation.parameters = extractParameters(obj.parameters || obj.variables);
  }

  // Only return calculation if we found meaningful calculation data
  if (calculation.numerator || calculation.denominator || calculation.formula || calculation.parameters.length > 0) {
    return calculation;
  }

  return null;
}

/**
 * Determine indicator type from object properties
 * @param {Object} obj - Indicator object
 * @returns {string} - Indicator type
 */
function determineIndicatorType(obj) {
  if (obj.type) return obj.type;
  
  if (obj.numerator && obj.denominator) {
    return 'ratio';
  }
  
  if (obj.formula && typeof obj.formula === 'string') {
    if (obj.formula.includes('/') || obj.formula.includes('divided')) {
      return 'ratio';
    }
    if (obj.formula.includes('%') || obj.formula.includes('proportion')) {
      return 'proportion';
    }
  }
  
  return 'count';
}

/**
 * Determine calculation type
 * @param {Object} obj - Object containing calculation info
 * @returns {string} - Calculation type
 */
function determineCalculationType(obj) {
  if (obj.numerator && obj.denominator) {
    return 'ratio';
  }
  
  if (obj.formula) {
    const formula = obj.formula.toLowerCase();
    if (formula.includes('sum') || formula.includes('count')) {
      return 'count';
    }
    if (formula.includes('%') || formula.includes('percentage')) {
      return 'proportion';
    }
    if (formula.includes('/') || formula.includes('divide')) {
      return 'ratio';
    }
  }
  
  return 'simple';
}

/**
 * Analyze formula complexity
 * @param {string} formula - Formula string
 * @returns {string} - Complexity level
 */
function analyzeFormulaComplexity(formula) {
  if (!formula || typeof formula !== 'string') return 'simple';
  
  const complexPatterns = [
    /\([^)]*\([^)]*\)/,  // Nested parentheses
    /\b(if|case|when|switch)\b/i,  // Conditional logic
    /\b(sum|avg|mean|median|std|variance)\b/i,  // Aggregate functions
    /[+\-*/]{2,}/,  // Multiple operators in sequence
  ];
  
  if (complexPatterns.some(pattern => pattern.test(formula))) {
    return 'complex';
  }
  
  // Count operators
  const operators = (formula.match(/[+\-*/()]/g) || []).length;
  return operators > 3 ? 'moderate' : 'simple';
}

/**
 * Extract parameters from parameters object
 * @param {Object|Array} params - Parameters object or array
 * @returns {Array} - Array of parameter objects
 */
function extractParameters(params) {
  if (!params) return [];
  
  if (Array.isArray(params)) {
    return params.map((param, index) => ({
      name: param.name || param.key || `param${index}`,
      type: param.type || 'string',
      description: param.description,
      defaultValue: param.default || param.defaultValue
    }));
  }
  
  if (typeof params === 'object') {
    return Object.keys(params).map(key => ({
      name: key,
      type: typeof params[key],
      description: params[key].description,
      defaultValue: params[key].default || params[key]
    }));
  }
  
  return [];
}

/**
 * Extract FHIR Measure information
 * @param {Object} measure - FHIR Measure resource
 * @returns {Object} - Indicator information
 */
function extractFhirMeasureInfo(measure) {
  return {
    id: measure.id,
    name: measure.name || measure.title,
    description: measure.description,
    type: measure.type || 'fhir-measure',
    target: measure.target,
    frequency: measure.reportingPeriod,
    path: 'fhir-measure',
    dataSource: 'FHIR'
  };
}

/**
 * Extract FHIR Measure calculation
 * @param {Object} measure - FHIR Measure resource
 * @returns {Object|null} - Calculation information
 */
function extractFhirMeasureCalculation(measure) {
  if (!measure.group || !measure.group.length) return null;
  
  const group = measure.group[0];
  const calculation = {
    indicatorId: measure.id,
    type: 'fhir-measure',
    complexity: 'moderate',
    numerator: null,
    denominator: null,
    formula: null,
    parameters: [],
    path: 'fhir-measure'
  };
  
  // Extract population criteria
  if (group.population) {
    group.population.forEach(pop => {
      if (pop.code && pop.code.coding) {
        const coding = pop.code.coding[0];
        if (coding.code === 'numerator') {
          calculation.numerator = {
            description: pop.description,
            criteria: pop.criteria?.expression
          };
        } else if (coding.code === 'denominator') {
          calculation.denominator = {
            description: pop.description,
            criteria: pop.criteria?.expression
          };
        }
      }
    });
  }
  
  return calculation;
}

/**
 * Basic YAML-like parsing for indicators
 * @param {string} content - YAML content
 * @returns {Object} - Parsed object
 */
function parseYamlLike(content) {
  const result = {};
  const lines = content.split('\n');
  let currentSection = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        
        if (value) {
          result[key] = value.replace(/^["']|["']$/g, '');
        } else {
          currentSection = key;
          result[key] = {};
        }
      } else if (currentSection && trimmed.startsWith('-')) {
        // Handle array items
        if (!Array.isArray(result[currentSection])) {
          result[currentSection] = [];
        }
        result[currentSection].push(trimmed.substring(1).trim());
      }
    }
  }
  
  return result;
}

/**
 * Parse XML content for indicators
 * @param {string} content - XML content
 * @returns {Object} - Extracted indicator data
 */
function parseXmlForIndicators(content) {
  const result = {};
  
  // Look for common XML indicator patterns
  const patterns = {
    numerator: /<numerator[^>]*>(.*?)<\/numerator>/gi,
    denominator: /<denominator[^>]*>(.*?)<\/denominator>/gi,
    formula: /<formula[^>]*>(.*?)<\/formula>/gi,
    target: /<target[^>]*>(.*?)<\/target>/gi
  };
  
  Object.keys(patterns).forEach(key => {
    const matches = content.match(patterns[key]);
    if (matches) {
      result[key] = matches.map(match => 
        match.replace(patterns[key], '$1').trim()
      );
    }
  });
  
  return result;
}

/**
 * Parse text content for indicators
 * @param {string} content - Text content
 * @returns {Object} - Extracted indicator data
 */
function parseTextForIndicators(content) {
  const result = {};
  
  // Look for calculation patterns in text
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    
    if (lower.includes('numerator') || lower.includes('dividend')) {
      result[`numerator_${index}`] = line.trim();
    }
    
    if (lower.includes('denominator') || lower.includes('divisor')) {
      result[`denominator_${index}`] = line.trim();
    }
    
    if (lower.includes('formula') || lower.includes('calculation')) {
      result[`formula_${index}`] = line.trim();
    }
    
    if (lower.includes('target') || lower.includes('goal')) {
      result[`target_${index}`] = line.trim();
    }
  });
  
  return result;
}

/**
 * React component for rendering indicator calculations narrative
 */
export function Render({ result, locale = 'en_US' }) {
  const { t } = useTranslation();

  if (!result || !result.structured) {
    return <div className="faq-answer error">{t('dak.faq.indicators.no_data')}</div>;
  }

  const { indicators, calculations, fileName, totalCalculations, statistics } = result.structured;

  if (totalCalculations === 0) {
    return (
      <div className="faq-answer warning">
        <h4>{t('dak.faq.indicators.title')}</h4>
        <p>No indicator calculations found in <code>{fileName}</code></p>
        {result.errors?.map((error, index) => (
          <div key={index} className="error-message">{error}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="faq-answer success">
      <h4>{t('dak.faq.indicators.title')}</h4>
      
      <div className="indicator-summary">
        <p>
          <strong>File: </strong><code>{fileName}</code>
        </p>
        <p>
          <strong>Calculations Found: </strong><span className="highlight">{totalCalculations}</span>
        </p>
        <p>
          <strong>Indicators: </strong>{indicators.length}
        </p>
      </div>

      {statistics && (
        <div className="indicator-statistics">
          <h5>Calculation Statistics</h5>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Ratio Indicators: </strong>{statistics.ratioIndicators}
            </div>
            <div className="stat-item">
              <strong>Proportion Indicators: </strong>{statistics.proportionIndicators}
            </div>
            <div className="stat-item">
              <strong>Count Indicators: </strong>{statistics.countIndicators}
            </div>
            <div className="stat-item">
              <strong>Complex Calculations: </strong>{statistics.complexCalculations}
            </div>
            <div className="stat-item">
              <strong>Indicators with Targets: </strong>{statistics.indicatorsWithTargets}
            </div>
          </div>
        </div>
      )}

      {calculations.length > 0 && (
        <div className="calculations-list">
          <h5>Indicator Calculations</h5>
          {calculations.map((calculation, index) => (
            <div key={index} className="calculation-item">
              <div className="calculation-header">
                <strong>{calculation.indicatorId}</strong>
                <span className="calculation-type">({calculation.type})</span>
                <span className={`complexity-badge ${calculation.complexity}`}>
                  {calculation.complexity}
                </span>
              </div>
              
              {calculation.numerator && (
                <div className="calculation-component">
                  <strong>Numerator: </strong>
                  {calculation.numerator.description || calculation.numerator.criteria}
                </div>
              )}
              
              {calculation.denominator && (
                <div className="calculation-component">
                  <strong>Denominator: </strong>
                  {calculation.denominator.description || calculation.denominator.criteria}
                </div>
              )}
              
              {calculation.formula && (
                <div className="calculation-formula">
                  <strong>Formula: </strong>
                  <code>{calculation.formula}</code>
                </div>
              )}
              
              {calculation.parameters.length > 0 && (
                <div className="calculation-parameters">
                  <strong>Parameters: </strong>
                  {calculation.parameters.map(param => param.name).join(', ')}
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
        const { calculations, totalCalculations, fileName, statistics } = params;
        let html = `<h4>Indicator Calculations</h4>`;
        html += `<p>Analysis of <strong>${fileName}</strong>:</p>`;
        
        if (totalCalculations === 0) {
          html += `<p class="warning">No indicator calculations found in this file.</p>`;
        } else {
          html += `<p>This file contains <strong>${totalCalculations}</strong> calculation(s):</p>`;
          html += `<ul>`;
          calculations.forEach(calc => {
            html += `<li><strong>${calc.indicatorId}</strong> (${calc.type})`;
            if (calc.formula) {
              html += ` - <code>${calc.formula}</code>`;
            }
            html += `</li>`;
          });
          html += `</ul>`;
          
          if (statistics) {
            html += `<p>Found ${statistics.ratioIndicators} ratio indicators, ${statistics.proportionIndicators} proportion indicators, and ${statistics.countIndicators} count indicators.</p>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Indicator Calculations</h4><p class="error">The file <code>${params.fileName}</code> was not found.</p>`,
      error: `<h4>Indicator Calculations</h4><p class="error">An error occurred while analyzing the file <code>${params.fileName}</code>.</p>`
    },
    fr_FR: {
      success: (() => {
        const { calculations, totalCalculations, fileName, statistics } = params;
        let html = `<h4>Calculs d'indicateurs</h4>`;
        html += `<p>Analyse de <strong>${fileName}</strong>:</p>`;
        
        if (totalCalculations === 0) {
          html += `<p class="warning">Aucun calcul d'indicateur trouvé dans ce fichier.</p>`;
        } else {
          html += `<p>Ce fichier contient <strong>${totalCalculations}</strong> calcul(s):</p>`;
          html += `<ul>`;
          calculations.forEach(calc => {
            html += `<li><strong>${calc.indicatorId}</strong> (${calc.type})`;
            if (calc.formula) {
              html += ` - <code>${calc.formula}</code>`;
            }
            html += `</li>`;
          });
          html += `</ul>`;
          
          if (statistics) {
            html += `<p>Trouvé ${statistics.ratioIndicators} indicateurs de ratio, ${statistics.proportionIndicators} indicateurs de proportion, et ${statistics.countIndicators} indicateurs de comptage.</p>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Calculs d'indicateurs</h4><p class="error">Le fichier <code>${params.fileName}</code> n'a pas été trouvé.</p>`,
      error: `<h4>Calculs d'indicateurs</h4><p class="error">Une erreur s'est produite lors de l'analyse du fichier <code>${params.fileName}</code>.</p>`
    },
    es_ES: {
      success: (() => {
        const { calculations, totalCalculations, fileName, statistics } = params;
        let html = `<h4>Cálculos de indicadores</h4>`;
        html += `<p>Análisis de <strong>${fileName}</strong>:</p>`;
        
        if (totalCalculations === 0) {
          html += `<p class="warning">No se encontraron cálculos de indicadores en este archivo.</p>`;
        } else {
          html += `<p>Este archivo contiene <strong>${totalCalculations}</strong> cálculo(s):</p>`;
          html += `<ul>`;
          calculations.forEach(calc => {
            html += `<li><strong>${calc.indicatorId}</strong> (${calc.type})`;
            if (calc.formula) {
              html += ` - <code>${calc.formula}</code>`;
            }
            html += `</li>`;
          });
          html += `</ul>`;
          
          if (statistics) {
            html += `<p>Se encontraron ${statistics.ratioIndicators} indicadores de ratio, ${statistics.proportionIndicators} indicadores de proporción, y ${statistics.countIndicators} indicadores de conteo.</p>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Cálculos de indicadores</h4><p class="error">El archivo <code>${params.fileName}</code> no se encontró.</p>`,
      error: `<h4>Cálculos de indicadores</h4><p class="error">Ocurrió un error al analizar el archivo <code>${params.fileName}</code>.</p>`
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
      file_not_found: `File not found: ${params.fileName}`,
      no_calculations_found: `No indicator calculations found in file: ${params.fileName}`,
      parse_error: `Failed to parse file ${params.fileName}: ${params.error}`
    },
    fr_FR: {
      file_not_found: `Fichier non trouvé: ${params.fileName}`,
      no_calculations_found: `Aucun calcul d'indicateur trouvé dans le fichier: ${params.fileName}`,
      parse_error: `Échec de l'analyse du fichier ${params.fileName}: ${params.error}`
    },
    es_ES: {
      file_not_found: `Archivo no encontrado: ${params.fileName}`,
      no_calculations_found: `No se encontraron cálculos de indicadores en el archivo: ${params.fileName}`,
      parse_error: `Error al analizar el archivo ${params.fileName}: ${params.error}`
    }
  };

  const localeData = errors[locale] || errors['en_US'];
  return localeData[type] || `Unknown error: ${type}`;
}