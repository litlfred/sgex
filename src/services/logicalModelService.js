/**
 * Logical Model Service
 * 
 * Handles detection, parsing, and management of FHIR Logical Models (StructureDefinition)
 * from published Implementation Guide artifacts and generation of FHIR Questionnaires.
 */

import githubService from './githubService';

class LogicalModelService {
  constructor() {
    this.cache = new Map();
    this.maxDepth = 5;
  }

  /**
   * Detect logical models from published Implementation Guide artifacts
   * @param {string} baseUrl - Base URL of published IG artifacts
   * @param {string} user - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @returns {Promise<Array>} Array of detected logical models
   */
  async detectLogicalModels(baseUrl, user, repo, branch) {
    const cacheKey = `${user}/${repo}/${branch}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Look for logical models in the FSH files (regardless of artifacts page)
      const logicalModels = await this.scanFSHFilesForLogicalModels(user, repo, branch);
      
      // Cache the results
      this.cache.set(cacheKey, logicalModels);
      
      return logicalModels;
    } catch (error) {
      console.warn('Error detecting logical models:', error);
      return [];
    }
  }

  /**
   * Scan FSH files for logical model definitions
   * @param {string} user - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @returns {Promise<Array>} Array of logical models found in FSH files
   */
  async scanFSHFilesForLogicalModels(user, repo, branch) {
    const logicalModels = [];

    try {
      // Check common FSH directories for logical models
      const fshDirectories = [
        'input/fsh',
        'input/fsh/logicalmodels',
        'input/fsh/profiles'
      ];

      for (const directory of fshDirectories) {
        try {
          const files = await githubService.getDirectoryContents(user, repo, directory, branch);
          
          const fshFiles = files.filter(file => 
            file.type === 'file' && file.name.endsWith('.fsh')
          );

          for (const file of fshFiles) {
            const content = await githubService.getFileContent(user, repo, file.path, branch);
            const models = this.parseFSHForLogicalModels(content, file.path);
            logicalModels.push(...models);
          }
        } catch (dirError) {
          // Directory might not exist, continue with next one
          console.debug(`Directory ${directory} not found or inaccessible`);
        }
      }
    } catch (error) {
      console.warn('Error scanning FSH files for logical models:', error);
    }

    return logicalModels;
  }

  /**
   * Parse FSH content to extract logical model definitions
   * @param {string} fshContent - FSH file content
   * @param {string} filePath - Path to the FSH file
   * @returns {Array} Array of logical models found in the content
   */
  parseFSHForLogicalModels(fshContent, filePath) {
    const logicalModels = [];
    const lines = fshContent.split('\n');
    let currentModel = null;
    let inModel = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect logical model definition
      const logicalModelMatch = line.match(/^Logical:\s*(\S+)/);
      if (logicalModelMatch) {
        if (currentModel) {
          logicalModels.push(currentModel);
        }
        
        currentModel = {
          id: logicalModelMatch[1],
          name: logicalModelMatch[1],
          title: '',
          description: '',
          elements: [],
          filePath: filePath,
          type: 'LogicalModel'
        };
        inModel = true;
        continue;
      }

      if (!inModel || !currentModel) continue;

      // Parse metadata
      if (line.startsWith('Title:')) {
        currentModel.title = line.replace('Title:', '').trim().replace(/"/g, '');
      } else if (line.startsWith('Description:')) {
        currentModel.description = line.replace('Description:', '').trim().replace(/"/g, '');
      } else if (line.startsWith('Id:')) {
        currentModel.id = line.replace('Id:', '').trim();
      }

      // Parse elements (simplified FSH parsing)
      const elementMatch = line.match(/^\*\s+(\S+)\s+(\d+)\.\.(\d+|\*)\s+(\S+)\s*"([^"]+)"/);
      if (elementMatch) {
        const [, name, min, max, type, description] = elementMatch;
        currentModel.elements.push({
          name: name,
          path: `${currentModel.id}.${name}`,
          min: parseInt(min),
          max: max === '*' ? '*' : parseInt(max),
          type: type,
          description: description,
          required: parseInt(min) > 0
        });
      }
    }

    // Add the last model if exists
    if (currentModel) {
      logicalModels.push(currentModel);
    }

    return logicalModels;
  }

  /**
   * Generate FHIR Questionnaire from logical model
   * @param {Object} logicalModel - Logical model definition
   * @param {Object} options - Generation options
   * @returns {Object} Generated FHIR Questionnaire
   */
  generateQuestionnaireFromLogicalModel(logicalModel, options = {}) {
    const {
      questionnaireId = `questionnaire-${logicalModel.id.toLowerCase()}`,
      title = `Questionnaire for ${logicalModel.title || logicalModel.name}`,
      description = `Auto-generated questionnaire based on ${logicalModel.title || logicalModel.name} logical model`,
      prefix = 'q'
    } = options;

    const questionnaire = {
      resourceType: 'Questionnaire',
      id: questionnaireId,
      url: `http://example.org/fhir/Questionnaire/${questionnaireId}`,
      version: '1.0.0',
      name: questionnaireId,
      title: title,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      publisher: 'WHO SMART Guidelines',
      description: description,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Questionnaire']
      },
      item: []
    };

    // Add metadata about source logical model
    questionnaire.extension = [
      {
        url: 'http://smart.who.int/fhir/StructureDefinition/sgex-source-logical-model',
        valueString: logicalModel.id
      }
    ];

    // Generate questions for each element
    let linkIdCounter = 1;
    for (const element of logicalModel.elements || []) {
      const questionItem = this.generateQuestionFromElement(element, linkIdCounter, prefix);
      questionnaire.item.push(questionItem);
      linkIdCounter++;
    }

    return questionnaire;
  }

  /**
   * Generate a questionnaire item from a logical model element
   * @param {Object} element - Logical model element
   * @param {number} linkId - Link ID for the question
   * @param {string} prefix - Prefix for question IDs
   * @returns {Object} FHIR Questionnaire item
   */
  generateQuestionFromElement(element, linkId, prefix = 'q') {
    const questionItem = {
      linkId: `${prefix}-${linkId}`,
      code: [
        {
          system: 'http://smart.who.int/fhir/CodeSystem/sgex-logical-model-elements',
          code: element.name,
          display: element.description || element.name
        }
      ],
      text: element.description || element.name,
      type: this.mapTypeToQuestionType(element.type),
      required: element.required || false
    };

    // Handle cardinality
    if (element.max === '*' || element.max > 1) {
      questionItem.repeats = true;
    }

    // Add help text if available
    if (element.description && element.description !== element.name) {
      questionItem.extension = [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'help',
                display: 'Help-Button'
              }
            ]
          }
        }
      ];
    }

    return questionItem;
  }

  /**
   * Map logical model element type to FHIR Questionnaire item type
   * @param {string} elementType - Element type from logical model
   * @returns {string} FHIR Questionnaire item type
   */
  mapTypeToQuestionType(elementType) {
    const typeMapping = {
      'string': 'string',
      'text': 'text',
      'boolean': 'boolean',
      'integer': 'integer',
      'decimal': 'decimal',
      'date': 'date',
      'dateTime': 'dateTime',
      'time': 'time',
      'code': 'choice',
      'Coding': 'choice',
      'CodeableConcept': 'choice',
      'Quantity': 'quantity',
      'url': 'url',
      'uri': 'url'
    };

    return typeMapping[elementType] || 'string';
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const logicalModelService = new LogicalModelService();

export default logicalModelService;