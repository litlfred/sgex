/**
 * Terminology Coverage Question Component
 * Analyzes data element files for terminology standards and value set references
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionDefinition, QuestionResult, CacheHint, QuestionLevel, ParameterDefinition } from '../../../types/QuestionDefinition.js';

// Question metadata
export const metadata = new QuestionDefinition({
  id: 'terminology-coverage',
  level: QuestionLevel.ASSET,
  title: 'Terminology Coverage',
  description: 'What terminology standards are used in this data element?',
  parameters: [
    new ParameterDefinition({
      name: 'assetFile',
      type: 'string',
      required: true,
      description: 'Path to the data element file to analyze'
    })
  ],
  tags: ['asset', 'core-data-elements', 'terminology', 'standards'],
  version: '1.0.0',
  assetTypes: ['json', 'yaml', 'xml'],
  isTemplate: true
});

/**
 * Execute the terminology coverage question
 * @param {Object} input - Question input parameters
 * @param {string} input.repository - Repository identifier
 * @param {string} input.locale - Locale for response
 * @param {string} input.branch - Git branch
 * @param {string} input.assetFile - Path to the data element file
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
          terminologies: [],
          valueSets: [],
          codeSystems: [],
          fileName: assetFile,
          totalTerminologies: 0
        },
        narrative: getLocalizedNarrative(locale, 'file_not_found', { fileName: assetFile }),
        errors: [getLocalizedError(locale, 'file_not_found', { fileName: assetFile })],
        meta: {
          cacheHint: new CacheHint({
            scope: 'file',
            key: `terminology-coverage-${assetFile}`,
            ttl: 3600,
            dependencies: [assetFile]
          })
        }
      });
    }

    // Read and analyze the file
    const fileContent = await storage.readFile(assetFile);
    const analysisResult = await analyzeTerminologyUsage(fileContent.toString('utf-8'), assetFile);

    if (analysisResult.totalTerminologies === 0) {
      warnings.push(getLocalizedError(locale, 'no_terminology_found', { fileName: assetFile }));
    }

    return new QuestionResult({
      structured: analysisResult,
      narrative: getLocalizedNarrative(locale, 'success', analysisResult),
      warnings,
      errors,
      meta: {
        cacheHint: new CacheHint({
          scope: 'file',
          key: `terminology-coverage-${assetFile}`,
          ttl: 1800, // 30 minutes
          dependencies: [assetFile]
        })
      }
    });

  } catch (error) {
    return new QuestionResult({
      structured: { 
        terminologies: [],
        valueSets: [],
        codeSystems: [],
        fileName: assetFile,
        totalTerminologies: 0,
        error: error.message
      },
      narrative: getLocalizedNarrative(locale, 'error', { fileName: assetFile }),
      errors: [getLocalizedError(locale, 'parse_error', { fileName: assetFile, error: error.message })],
      meta: {
        cacheHint: new CacheHint({
          scope: 'file',
          key: `terminology-coverage-${assetFile}`,
          ttl: 60, // Short cache on error
          dependencies: [assetFile]
        })
      }
    });
  }
}

/**
 * Analyze file content for terminology usage
 * @param {string} content - File content
 * @param {string} fileName - File name for reference
 * @returns {Object} - Analysis result with terminology information
 */
async function analyzeTerminologyUsage(content, fileName) {
  const result = {
    fileName,
    terminologies: [],
    valueSets: [],
    codeSystems: [],
    bindings: [],
    totalTerminologies: 0,
    statistics: {
      uniqueCodeSystems: 0,
      uniqueValueSets: 0,
      strongBindings: 0,
      weakBindings: 0,
      preferredBindings: 0
    }
  };

  try {
    let data;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Parse based on file type
    if (fileExtension === 'json') {
      data = JSON.parse(content);
    } else if (fileExtension === 'yaml' || fileExtension === 'yml') {
      // Basic YAML parsing for common patterns
      data = parseYamlLike(content);
    } else if (fileExtension === 'xml') {
      data = parseXmlForTerminology(content);
    } else {
      // Fall back to text analysis
      data = parseTextForTerminology(content);
    }

    // Extract terminology references
    extractTerminologyReferences(data, result);

    // Calculate statistics
    const uniqueCodeSystems = new Set(result.codeSystems.map(cs => cs.system));
    const uniqueValueSets = new Set(result.valueSets.map(vs => vs.url));

    result.statistics.uniqueCodeSystems = uniqueCodeSystems.size;
    result.statistics.uniqueValueSets = uniqueValueSets.size;
    result.statistics.strongBindings = result.bindings.filter(b => b.strength === 'required').length;
    result.statistics.weakBindings = result.bindings.filter(b => b.strength === 'extensible').length;
    result.statistics.preferredBindings = result.bindings.filter(b => b.strength === 'preferred').length;

    result.totalTerminologies = result.terminologies.length;

    return result;

  } catch (error) {
    throw new Error(`Failed to analyze terminology in file ${fileName}: ${error.message}`);
  }
}

/**
 * Extract terminology references from parsed data
 * @param {Object} data - Parsed file data
 * @param {Object} result - Result object to populate
 */
function extractTerminologyReferences(data, result) {
  if (!data || typeof data !== 'object') return;

  const terminologyPatterns = {
    // Common terminology systems
    'SNOMED CT': /snomed|snomedct|http:\/\/snomed\.info\/sct/i,
    'LOINC': /loinc|http:\/\/loinc\.org/i,
    'ICD-10': /icd.?10|http:\/\/hl7\.org\/fhir\/sid\/icd-10/i,
    'ICD-11': /icd.?11|http:\/\/id\.who\.int\/icd\/release\/11/i,
    'RxNorm': /rxnorm|http:\/\/www\.nlm\.nih\.gov\/research\/umls\/rxnorm/i,
    'UCUM': /ucum|http:\/\/unitsofmeasure\.org/i,
    'HL7 FHIR': /http:\/\/hl7\.org\/fhir/i,
    'WHO ATC': /atc|http:\/\/www\.whocc\.no\/atc/i,
    'ISO 3166': /iso.?3166/i,
    'OCL': /openconceptlab|ocl/i
  };

  // Recursively search for terminology references
  function searchObject(obj, path = '') {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => searchObject(item, `${path}[${index}]`));
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const currentPath = path ? `${path}.${key}` : key;

        // Check for URL patterns
        if (typeof value === 'string') {
          // Check for code system URLs
          if (value.startsWith('http://') || value.startsWith('https://')) {
            for (const [terminology, pattern] of Object.entries(terminologyPatterns)) {
              if (pattern.test(value)) {
                addTerminologyReference(terminology, value, currentPath, key);
              }
            }
          }

          // Check for value set references
          if (key.toLowerCase().includes('valueset') || key.toLowerCase().includes('binding')) {
            addValueSetReference(value, currentPath);
          }

          // Check for code system references
          if (key.toLowerCase().includes('codesystem') || key.toLowerCase().includes('system')) {
            addCodeSystemReference(value, currentPath);
          }
        }

        searchObject(value, currentPath);
      });
    }
  }

  function addTerminologyReference(terminology, url, path, context) {
    if (!result.terminologies.find(t => t.name === terminology && t.url === url)) {
      result.terminologies.push({
        name: terminology,
        url: url,
        path: path,
        context: context
      });
    }
  }

  function addValueSetReference(url, path) {
    if (!result.valueSets.find(vs => vs.url === url)) {
      result.valueSets.push({
        url: url,
        path: path,
        name: extractNameFromUrl(url)
      });
    }
  }

  function addCodeSystemReference(system, path) {
    if (!result.codeSystems.find(cs => cs.system === system)) {
      result.codeSystems.push({
        system: system,
        path: path,
        name: extractNameFromUrl(system)
      });
    }
  }

  searchObject(data);

  // Look for binding information
  searchForBindings(data, result);
}

/**
 * Search for binding strength information
 * @param {Object} data - Parsed data
 * @param {Object} result - Result object
 */
function searchForBindings(data, result) {
  function findBindings(obj, path = '') {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => findBindings(item, `${path}[${index}]`));
    } else if (obj && typeof obj === 'object') {
      // Look for binding objects
      if (obj.strength && obj.valueSet) {
        result.bindings.push({
          strength: obj.strength,
          valueSet: obj.valueSet,
          path: path,
          description: obj.description
        });
      }

      Object.keys(obj).forEach(key => {
        findBindings(obj[key], path ? `${path}.${key}` : key);
      });
    }
  }

  findBindings(data);
}

/**
 * Extract name from URL
 * @param {string} url - URL to extract name from
 * @returns {string} - Extracted name
 */
function extractNameFromUrl(url) {
  if (!url || typeof url !== 'string') return 'Unknown';
  
  const segments = url.split('/');
  const lastSegment = segments[segments.length - 1];
  
  // Remove query parameters and fragments
  const cleanSegment = lastSegment.split('?')[0].split('#')[0];
  
  return cleanSegment || 'Unknown';
}

/**
 * Basic YAML-like parsing for terminology extraction
 * @param {string} content - YAML content
 * @returns {Object} - Parsed object
 */
function parseYamlLike(content) {
  // Simple YAML parsing - look for key-value pairs
  const result = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        if (value) {
          result[key] = value.replace(/^["']|["']$/g, ''); // Remove quotes
        }
      }
    }
  }
  
  return result;
}

/**
 * Parse XML content for terminology references
 * @param {string} content - XML content
 * @returns {Object} - Extracted terminology data
 */
function parseXmlForTerminology(content) {
  const result = {};
  
  // Look for common XML patterns
  const urlPattern = /(?:system|valueSet|url)=["']([^"']+)["']/g;
  const matches = content.match(urlPattern);
  
  if (matches) {
    matches.forEach((match, index) => {
      const url = match.replace(/.*=["']([^"']+)["']/, '$1');
      result[`xmlRef${index}`] = url;
    });
  }
  
  return result;
}

/**
 * Parse text content for terminology references
 * @param {string} content - Text content
 * @returns {Object} - Extracted terminology data
 */
function parseTextForTerminology(content) {
  const result = {};
  
  // Look for URL patterns in text
  const urlPattern = /https?:\/\/[^\s<>"']+/g;
  const matches = content.match(urlPattern);
  
  if (matches) {
    matches.forEach((url, index) => {
      result[`textRef${index}`] = url;
    });
  }
  
  return result;
}

/**
 * React component for rendering terminology coverage narrative
 */
export function Render({ result, locale = 'en_US' }) {
  const { t } = useTranslation();

  if (!result || !result.structured) {
    return <div className="faq-answer error">{t('dak.faq.terminology.no_data')}</div>;
  }

  const { terminologies, valueSets, codeSystems, bindings, fileName, totalTerminologies, statistics } = result.structured;

  if (totalTerminologies === 0) {
    return (
      <div className="faq-answer warning">
        <h4>{t('dak.faq.terminology.title')}</h4>
        <p>No terminology standards found in <code>{fileName}</code></p>
        {result.errors?.map((error, index) => (
          <div key={index} className="error-message">{error}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="faq-answer success">
      <h4>{t('dak.faq.terminology.title')}</h4>
      
      <div className="terminology-summary">
        <p>
          <strong>File: </strong><code>{fileName}</code>
        </p>
        <p>
          <strong>Terminologies Found: </strong><span className="highlight">{totalTerminologies}</span>
        </p>
      </div>

      {statistics && (
        <div className="terminology-statistics">
          <h5>Terminology Statistics</h5>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>Unique Code Systems: </strong>{statistics.uniqueCodeSystems}
            </div>
            <div className="stat-item">
              <strong>Unique Value Sets: </strong>{statistics.uniqueValueSets}
            </div>
            <div className="stat-item">
              <strong>Strong Bindings: </strong>{statistics.strongBindings}
            </div>
            <div className="stat-item">
              <strong>Weak Bindings: </strong>{statistics.weakBindings}
            </div>
          </div>
        </div>
      )}

      {terminologies.length > 0 && (
        <div className="terminologies-list">
          <h5>Terminology Standards Used</h5>
          {terminologies.map((terminology, index) => (
            <div key={index} className="terminology-item">
              <div className="terminology-header">
                <strong>{terminology.name}</strong>
              </div>
              <div className="terminology-details">
                <div className="terminology-url">
                  <strong>URL: </strong>
                  <code>{terminology.url}</code>
                </div>
                <div className="terminology-context">
                  <strong>Context: </strong>{terminology.context}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {bindings.length > 0 && (
        <div className="bindings-list">
          <h5>Terminology Bindings</h5>
          {bindings.map((binding, index) => (
            <div key={index} className="binding-item">
              <div className="binding-header">
                <strong>{binding.valueSet}</strong>
                <span className={`binding-strength ${binding.strength}`}>({binding.strength})</span>
              </div>
              {binding.description && (
                <div className="binding-description">{binding.description}</div>
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
        const { terminologies, totalTerminologies, fileName, statistics } = params;
        let html = `<h4>Terminology Coverage</h4>`;
        html += `<p>Analysis of <strong>${fileName}</strong>:</p>`;
        
        if (totalTerminologies === 0) {
          html += `<p class="warning">No terminology standards found in this file.</p>`;
        } else {
          html += `<p>This file uses <strong>${totalTerminologies}</strong> terminology standard(s):</p>`;
          html += `<ul>`;
          terminologies.forEach(terminology => {
            html += `<li><strong>${terminology.name}</strong> - <code>${terminology.url}</code></li>`;
          });
          html += `</ul>`;
          
          if (statistics) {
            html += `<p>Found ${statistics.uniqueCodeSystems} unique code systems and ${statistics.uniqueValueSets} value sets.</p>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Terminology Coverage</h4><p class="error">The file <code>${params.fileName}</code> was not found.</p>`,
      error: `<h4>Terminology Coverage</h4><p class="error">An error occurred while analyzing the file <code>${params.fileName}</code>.</p>`
    },
    fr_FR: {
      success: (() => {
        const { terminologies, totalTerminologies, fileName, statistics } = params;
        let html = `<h4>Couverture terminologique</h4>`;
        html += `<p>Analyse de <strong>${fileName}</strong>:</p>`;
        
        if (totalTerminologies === 0) {
          html += `<p class="warning">Aucun standard terminologique trouvé dans ce fichier.</p>`;
        } else {
          html += `<p>Ce fichier utilise <strong>${totalTerminologies}</strong> standard(s) terminologique(s):</p>`;
          html += `<ul>`;
          terminologies.forEach(terminology => {
            html += `<li><strong>${terminology.name}</strong> - <code>${terminology.url}</code></li>`;
          });
          html += `</ul>`;
          
          if (statistics) {
            html += `<p>Trouvé ${statistics.uniqueCodeSystems} systèmes de codes uniques et ${statistics.uniqueValueSets} ensembles de valeurs.</p>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Couverture terminologique</h4><p class="error">Le fichier <code>${params.fileName}</code> n'a pas été trouvé.</p>`,
      error: `<h4>Couverture terminologique</h4><p class="error">Une erreur s'est produite lors de l'analyse du fichier <code>${params.fileName}</code>.</p>`
    },
    es_ES: {
      success: (() => {
        const { terminologies, totalTerminologies, fileName, statistics } = params;
        let html = `<h4>Cobertura terminológica</h4>`;
        html += `<p>Análisis de <strong>${fileName}</strong>:</p>`;
        
        if (totalTerminologies === 0) {
          html += `<p class="warning">No se encontraron estándares terminológicos en este archivo.</p>`;
        } else {
          html += `<p>Este archivo utiliza <strong>${totalTerminologies}</strong> estándar(es) terminológico(s):</p>`;
          html += `<ul>`;
          terminologies.forEach(terminology => {
            html += `<li><strong>${terminology.name}</strong> - <code>${terminology.url}</code></li>`;
          });
          html += `</ul>`;
          
          if (statistics) {
            html += `<p>Se encontraron ${statistics.uniqueCodeSystems} sistemas de códigos únicos y ${statistics.uniqueValueSets} conjuntos de valores.</p>`;
          }
        }
        
        return html;
      })(),
      file_not_found: `<h4>Cobertura terminológica</h4><p class="error">El archivo <code>${params.fileName}</code> no se encontró.</p>`,
      error: `<h4>Cobertura terminológica</h4><p class="error">Ocurrió un error al analizar el archivo <code>${params.fileName}</code>.</p>`
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
      no_terminology_found: `No terminology standards found in file: ${params.fileName}`,
      parse_error: `Failed to parse file ${params.fileName}: ${params.error}`
    },
    fr_FR: {
      file_not_found: `Fichier non trouvé: ${params.fileName}`,
      no_terminology_found: `Aucun standard terminologique trouvé dans le fichier: ${params.fileName}`,
      parse_error: `Échec de l'analyse du fichier ${params.fileName}: ${params.error}`
    },
    es_ES: {
      file_not_found: `Archivo no encontrado: ${params.fileName}`,
      no_terminology_found: `No se encontraron estándares terminológicos en el archivo: ${params.fileName}`,
      parse_error: `Error al analizar el archivo ${params.fileName}: ${params.error}`
    }
  };

  const localeData = errors[locale] || errors['en_US'];
  return localeData[type] || `Unknown error: ${type}`;
}