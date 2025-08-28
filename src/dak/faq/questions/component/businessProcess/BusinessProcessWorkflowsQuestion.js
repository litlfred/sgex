/**
 * Business Process Workflows Question Component
 * Scans BPMN diagrams and extracts workflow information
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionDefinition, QuestionResult, CacheHint, QuestionLevel, ParameterDefinition } from '../../../types/QuestionDefinition.js';

// Use browser DOMParser when available
const getDOMParser = () => {
  if (typeof DOMParser !== 'undefined') {
    return DOMParser;
  } else {
    throw new Error('DOMParser not available (browser environment required for BPMN parsing)');
  }
};

// Question metadata
export const metadata = new QuestionDefinition({
  id: 'business-process-workflows',
  level: QuestionLevel.COMPONENT,
  title: 'Business Process Workflows',
  description: 'Scans BPMN diagrams and extracts workflow definitions with @name attributes',
  parameters: [
    new ParameterDefinition({
      name: 'bpmnDirectory',
      type: 'string',
      required: false,
      defaultValue: 'input/images',
      description: 'Directory containing BPMN files'
    }),
    new ParameterDefinition({
      name: 'includeSubprocesses',
      type: 'boolean',
      required: false,
      defaultValue: true,
      description: 'Whether to include subprocess definitions'
    })
  ],
  tags: ['component', 'business-process', 'workflows', 'bpmn'],
  version: '1.0.0',
  componentTypes: ['businessProcess']
});

/**
 * Execute the business process workflows question
 * @param {Object} input - Question input parameters
 * @param {string} input.repository - Repository identifier
 * @param {string} input.locale - Locale for response
 * @param {string} input.branch - Git branch
 * @param {string} input.bpmnDirectory - Directory containing BPMN files
 * @param {boolean} input.includeSubprocesses - Whether to include subprocesses
 * @param {Storage} input.storage - Storage interface
 * @returns {Promise<QuestionResult>} - Question result
 */
export async function execute(input) {
  const { 
    locale = 'en_US', 
    bpmnDirectory = 'input/images',
    includeSubprocesses = true,
    storage 
  } = input;
  
  const warnings = [];
  const errors = [];
  const workflows = [];

  try {
    // Find BPMN files in the specified directory
    const bpmnFiles = await storage.listFiles(`${bpmnDirectory}/*.bpmn`);
    
    if (bpmnFiles.length === 0) {
      warnings.push(getLocalizedError(locale, 'no_bpmn_files', { directory: bpmnDirectory }));
    }

    // Process each BPMN file
    for (const bpmnFile of bpmnFiles) {
      try {
        const bpmnContent = await storage.readFile(bpmnFile);
        const workflow = await parseBpmnWorkflow(bpmnContent.toString('utf-8'), bpmnFile, includeSubprocesses);
        if (workflow) {
          workflows.push(workflow);
        }
      } catch (error) {
        errors.push(getLocalizedError(locale, 'parse_error', { file: bpmnFile, error: error.message }));
      }
    }

    // Extract summary statistics
    const stats = {
      totalWorkflows: workflows.length,
      totalProcesses: workflows.reduce((sum, w) => sum + (w.processes?.length || 0), 0),
      totalSubprocesses: workflows.reduce((sum, w) => sum + (w.subprocesses?.length || 0), 0),
      totalTasks: workflows.reduce((sum, w) => sum + (w.tasks?.length || 0), 0)
    };

    return new QuestionResult({
      structured: { 
        workflows,
        statistics: stats,
        bpmnDirectory,
        filesScanned: bpmnFiles.length
      },
      narrative: getLocalizedNarrative(locale, 'success', { workflows, stats }),
      warnings,
      errors,
      meta: {
        cacheHint: new CacheHint({
          scope: 'repository',
          key: `business-process-workflows-${bpmnDirectory}`,
          ttl: 1800, // 30 minutes
          dependencies: bpmnFiles
        })
      }
    });

  } catch (error) {
    return new QuestionResult({
      structured: { workflows: [], statistics: {} },
      narrative: getLocalizedNarrative(locale, 'error'),
      errors: [getLocalizedError(locale, 'general_error', { error: error.message })],
      meta: {
        cacheHint: new CacheHint({
          scope: 'repository',
          key: `business-process-workflows-${bpmnDirectory}`,
          ttl: 60, // Short cache on error
          dependencies: []
        })
      }
    });
  }
}

/**
 * Parse BPMN workflow from XML content
 * @param {string} bpmnContent - BPMN XML content
 * @param {string} fileName - File name for reference
 * @param {boolean} includeSubprocesses - Whether to include subprocesses
 * @returns {Object} - Parsed workflow information
 */
async function parseBpmnWorkflow(bpmnContent, fileName, includeSubprocesses) {
  try {
    const DOMParserClass = getDOMParser();
    const parser = new DOMParserClass();
    const doc = parser.parseFromString(bpmnContent, 'text/xml');
    
    // Check for parsing errors
    const parseError = doc.getElementsByTagName('parsererror')[0];
    if (parseError) {
      throw new Error(`XML parsing error: ${parseError.textContent}`);
    }

    // Extract workflow information
    const workflow = {
      fileName,
      processes: [],
      subprocesses: [],
      tasks: [],
      name: null,
      description: null
    };

    // Find all process elements
    const processes = doc.getElementsByTagNameNS('*', 'process') || doc.getElementsByTagName('process');
    for (let i = 0; i < processes.length; i++) {
      const process = processes[i];
      const processInfo = {
        id: process.getAttribute('id'),
        name: process.getAttribute('name') || extractNameFromDocumentation(process),
        isExecutable: process.getAttribute('isExecutable') === 'true',
        type: 'process'
      };

      if (processInfo.name && processInfo.name.includes('@name')) {
        // Extract @name attribute value
        const nameMatch = processInfo.name.match(/@name\s*=\s*["']([^"']+)["']/);
        if (nameMatch) {
          processInfo.extractedName = nameMatch[1];
        }
      }

      workflow.processes.push(processInfo);

      // Set workflow name from first named process
      if (!workflow.name && processInfo.name) {
        workflow.name = processInfo.extractedName || processInfo.name;
      }
    }

    // Find subprocess elements if requested
    if (includeSubprocesses) {
      const subprocesses = doc.getElementsByTagNameNS('*', 'subProcess') || doc.getElementsByTagName('subProcess');
      for (let i = 0; i < subprocesses.length; i++) {
        const subprocess = subprocesses[i];
        const subprocessInfo = {
          id: subprocess.getAttribute('id'),
          name: subprocess.getAttribute('name') || extractNameFromDocumentation(subprocess),
          type: 'subprocess'
        };

        if (subprocessInfo.name && subprocessInfo.name.includes('@name')) {
          const nameMatch = subprocessInfo.name.match(/@name\s*=\s*["']([^"']+)["']/);
          if (nameMatch) {
            subprocessInfo.extractedName = nameMatch[1];
          }
        }

        workflow.subprocesses.push(subprocessInfo);
      }
    }

    // Find task elements
    const taskTypes = ['task', 'userTask', 'serviceTask', 'scriptTask', 'manualTask', 'businessRuleTask'];
    for (const taskType of taskTypes) {
      const tasks = doc.getElementsByTagNameNS('*', taskType) || doc.getElementsByTagName(taskType);
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const taskInfo = {
          id: task.getAttribute('id'),
          name: task.getAttribute('name') || extractNameFromDocumentation(task),
          type: taskType
        };

        workflow.tasks.push(taskInfo);
      }
    }

    return workflow;

  } catch (error) {
    throw new Error(`Failed to parse BPMN file ${fileName}: ${error.message}`);
  }
}

/**
 * Extract name from documentation element
 * @param {Element} element - BPMN element
 * @returns {string|null} - Extracted name or null
 */
function extractNameFromDocumentation(element) {
  const documentation = element.getElementsByTagNameNS('*', 'documentation')[0] || 
                       element.getElementsByTagName('documentation')[0];
  
  if (documentation && documentation.textContent) {
    const text = documentation.textContent.trim();
    // Look for @name pattern in documentation
    const nameMatch = text.match(/@name\s*=\s*["']([^"']+)["']/);
    if (nameMatch) {
      return nameMatch[1];
    }
    return text.length > 0 ? text : null;
  }
  
  return null;
}

/**
 * React component for rendering workflows narrative
 */
export function Render({ result, locale = 'en_US' }) {
  const { t } = useTranslation();

  if (!result || !result.structured) {
    return <div className="faq-answer error">{t('dak.faq.workflows.no_data')}</div>;
  }

  const { workflows, statistics, bpmnDirectory, filesScanned } = result.structured;

  return (
    <div className="faq-answer success">
      <h4>{t('dak.faq.workflows.title')}</h4>
      
      <div className="workflow-summary">
        <p>
          <strong>{t('dak.faq.workflows.scanned_files')}: </strong>
          {filesScanned} files in <code>{bpmnDirectory}</code>
        </p>
        
        {statistics && (
          <div className="workflow-stats">
            <div className="stat-item">
              <span className="stat-label">{t('dak.faq.workflows.total_workflows')}: </span>
              <span className="stat-value">{statistics.totalWorkflows}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('dak.faq.workflows.total_processes')}: </span>
              <span className="stat-value">{statistics.totalProcesses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('dak.faq.workflows.total_subprocesses')}: </span>
              <span className="stat-value">{statistics.totalSubprocesses}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('dak.faq.workflows.total_tasks')}: </span>
              <span className="stat-value">{statistics.totalTasks}</span>
            </div>
          </div>
        )}
      </div>

      {workflows.length > 0 && (
        <div className="workflows-list">
          <h5>{t('dak.faq.workflows.workflows_found')}</h5>
          {workflows.map((workflow, index) => (
            <div key={index} className="workflow-item">
              <div className="workflow-header">
                <strong>{workflow.name || workflow.fileName}</strong>
                <small className="file-name">({workflow.fileName})</small>
              </div>
              
              {workflow.processes.length > 0 && (
                <div className="workflow-processes">
                  <strong>{t('dak.faq.workflows.processes')}: </strong>
                  <ul>
                    {workflow.processes.map((process, pIndex) => (
                      <li key={pIndex}>
                        {process.extractedName || process.name || process.id}
                        {process.isExecutable && <span className="executable-badge">Executable</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {workflow.subprocesses.length > 0 && (
                <div className="workflow-subprocesses">
                  <strong>{t('dak.faq.workflows.subprocesses')}: </strong>
                  <ul>
                    {workflow.subprocesses.map((subprocess, sIndex) => (
                      <li key={sIndex}>
                        {subprocess.extractedName || subprocess.name || subprocess.id}
                      </li>
                    ))}
                  </ul>
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
        const { workflows, stats } = params;
        let html = `<h4>Business Process Workflows</h4>`;
        
        if (workflows.length === 0) {
          html += `<p>No workflows found in BPMN files.</p>`;
        } else {
          html += `<p>Found <strong>${workflows.length}</strong> workflow(s) with <strong>${stats.totalProcesses}</strong> process(es).</p>`;
          html += `<ul>`;
          workflows.forEach(workflow => {
            html += `<li><strong>${workflow.name || workflow.fileName}</strong> - ${workflow.processes.length} process(es)</li>`;
          });
          html += `</ul>`;
        }
        
        return html;
      })(),
      error: `<h4>Business Process Workflows</h4><p class="error">An error occurred while scanning BPMN files.</p>`
    },
    fr_FR: {
      success: (() => {
        const { workflows, stats } = params;
        let html = `<h4>Flux de processus métier</h4>`;
        
        if (workflows.length === 0) {
          html += `<p>Aucun flux de travail trouvé dans les fichiers BPMN.</p>`;
        } else {
          html += `<p>Trouvé <strong>${workflows.length}</strong> flux de travail avec <strong>${stats.totalProcesses}</strong> processus.</p>`;
          html += `<ul>`;
          workflows.forEach(workflow => {
            html += `<li><strong>${workflow.name || workflow.fileName}</strong> - ${workflow.processes.length} processus</li>`;
          });
          html += `</ul>`;
        }
        
        return html;
      })(),
      error: `<h4>Flux de processus métier</h4><p class="error">Une erreur s'est produite lors de l'analyse des fichiers BPMN.</p>`
    },
    es_ES: {
      success: (() => {
        const { workflows, stats } = params;
        let html = `<h4>Flujos de procesos de negocio</h4>`;
        
        if (workflows.length === 0) {
          html += `<p>No se encontraron flujos de trabajo en los archivos BPMN.</p>`;
        } else {
          html += `<p>Se encontraron <strong>${workflows.length}</strong> flujo(s) de trabajo con <strong>${stats.totalProcesses}</strong> proceso(s).</p>`;
          html += `<ul>`;
          workflows.forEach(workflow => {
            html += `<li><strong>${workflow.name || workflow.fileName}</strong> - ${workflow.processes.length} proceso(s)</li>`;
          });
          html += `</ul>`;
        }
        
        return html;
      })(),
      error: `<h4>Flujos de procesos de negocio</h4><p class="error">Ocurrió un error al escanear los archivos BPMN.</p>`
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
      no_bpmn_files: `No BPMN files found in directory: ${params.directory}`,
      parse_error: `Failed to parse BPMN file ${params.file}: ${params.error}`,
      general_error: `Error scanning business processes: ${params.error}`
    },
    fr_FR: {
      no_bpmn_files: `Aucun fichier BPMN trouvé dans le répertoire: ${params.directory}`,
      parse_error: `Échec de l'analyse du fichier BPMN ${params.file}: ${params.error}`,
      general_error: `Erreur lors de l'analyse des processus métier: ${params.error}`
    },
    es_ES: {
      no_bpmn_files: `No se encontraron archivos BPMN en el directorio: ${params.directory}`,
      parse_error: `Error al analizar el archivo BPMN ${params.file}: ${params.error}`,
      general_error: `Error al escanear procesos de negocio: ${params.error}`
    }
  };

  const localeData = errors[locale] || errors['en_US'];
  return localeData[type] || `Unknown error: ${type}`;
}