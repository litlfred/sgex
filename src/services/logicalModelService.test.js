/**
 * Tests for LogicalModelService
 */

import logicalModelService from '../services/logicalModelService';

// Mock githubService
jest.mock('../services/githubService', () => ({
  getDirectoryContents: jest.fn(),
  getFileContent: jest.fn()
}));

import githubService from '../services/githubService';

describe('LogicalModelService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logicalModelService.clearCache();
  });

  describe('parseFSHForLogicalModels', () => {
    test('should parse basic logical model definition', () => {
      const fshContent = `
Logical: PatientLogicalModel
Title: "Patient Logical Model"
Description: "Logical model for patient information"
Id: patient-lm

* name 1..1 string "Patient name"
* age 0..1 integer "Patient age"
* gender 1..1 code "Patient gender"
      `.trim();

      const models = logicalModelService.parseFSHForLogicalModels(fshContent, 'test.fsh');
      
      expect(models).toHaveLength(1);
      expect(models[0]).toMatchObject({
        id: 'patient-lm', // Uses the Id field when present
        name: 'PatientLogicalModel', // Uses the Logical field
        title: 'Patient Logical Model',
        description: 'Logical model for patient information',
        type: 'LogicalModel',
        filePath: 'test.fsh'
      });
      
      expect(models[0].elements).toHaveLength(3);
      expect(models[0].elements[0]).toMatchObject({
        name: 'name',
        min: 1,
        max: 1,
        type: 'string',
        description: 'Patient name',
        required: true
      });
    });

    test('should handle multiple logical models in one file', () => {
      const fshContent = `
Logical: Model1
Title: "First Model"

* element1 1..1 string "Element 1"

Logical: Model2
Title: "Second Model" 

* element2 0..* code "Element 2"
      `.trim();

      const models = logicalModelService.parseFSHForLogicalModels(fshContent, 'test.fsh');
      
      expect(models).toHaveLength(2);
      expect(models[0].id).toBe('Model1');
      expect(models[1].id).toBe('Model2');
    });

    test('should handle empty or invalid content', () => {
      const models = logicalModelService.parseFSHForLogicalModels('', 'test.fsh');
      expect(models).toHaveLength(0);
    });
  });

  describe('generateQuestionnaireFromLogicalModel', () => {
    test('should generate basic questionnaire from logical model', () => {
      const logicalModel = {
        id: 'PatientLM',
        name: 'PatientLM',
        title: 'Patient Logical Model',
        description: 'Patient information model',
        elements: [
          {
            name: 'name',
            path: 'PatientLM.name',
            min: 1,
            max: 1,
            type: 'string',
            description: 'Patient name',
            required: true
          },
          {
            name: 'age',
            path: 'PatientLM.age',
            min: 0,
            max: 1,
            type: 'integer',
            description: 'Patient age in years',
            required: false
          }
        ]
      };

      const questionnaire = logicalModelService.generateQuestionnaireFromLogicalModel(logicalModel);
      
      expect(questionnaire.resourceType).toBe('Questionnaire');
      expect(questionnaire.id).toBe('questionnaire-patientlm');
      expect(questionnaire.title).toContain('Patient Logical Model');
      expect(questionnaire.status).toBe('draft');
      expect(questionnaire.item).toHaveLength(2);
      
      expect(questionnaire.item[0]).toMatchObject({
        linkId: 'q-1',
        text: 'Patient name',
        type: 'string',
        required: true
      });
      
      expect(questionnaire.item[1]).toMatchObject({
        linkId: 'q-2', 
        text: 'Patient age in years',
        type: 'integer',
        required: false
      });
    });

    test('should handle repeating elements', () => {
      const logicalModel = {
        id: 'TestLM',
        name: 'TestLM',
        elements: [
          {
            name: 'addresses',
            type: 'string',
            description: 'Patient addresses',
            min: 0,
            max: '*',
            required: false
          }
        ]
      };

      const questionnaire = logicalModelService.generateQuestionnaireFromLogicalModel(logicalModel);
      
      expect(questionnaire.item[0].repeats).toBe(true);
    });
  });

  describe('mapTypeToQuestionType', () => {
    test('should map common FHIR types to questionnaire types', () => {
      expect(logicalModelService.mapTypeToQuestionType('string')).toBe('string');
      expect(logicalModelService.mapTypeToQuestionType('integer')).toBe('integer');
      expect(logicalModelService.mapTypeToQuestionType('boolean')).toBe('boolean');
      expect(logicalModelService.mapTypeToQuestionType('date')).toBe('date');
      expect(logicalModelService.mapTypeToQuestionType('code')).toBe('choice');
      expect(logicalModelService.mapTypeToQuestionType('unknown')).toBe('string');
    });
  });

  describe('detectLogicalModels', () => {
    test('should scan FSH files and detect logical models', async () => {
      const mockFiles = [
        { name: 'patient.fsh', type: 'file', path: 'input/fsh/patient.fsh' },
        { name: 'other.txt', type: 'file', path: 'input/fsh/other.txt' }
      ];

      const mockFshContent = `
Logical: PatientModel
Title: "Patient Model"
* name 1..1 string "Name"
      `.trim();

      githubService.getDirectoryContents.mockResolvedValueOnce(mockFiles);
      githubService.getFileContent.mockResolvedValueOnce(mockFshContent);

      // Mock fetch for artifacts page check
      global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });

      const models = await logicalModelService.detectLogicalModels(
        'https://example.com', 
        'user', 
        'repo', 
        'main'
      );

      expect(models).toHaveLength(1);
      expect(models[0].id).toBe('PatientModel');
      expect(githubService.getDirectoryContents).toHaveBeenCalledWith('user', 'repo', 'input/fsh', 'main');
      expect(githubService.getFileContent).toHaveBeenCalledWith('user', 'repo', 'input/fsh/patient.fsh', 'main');
    });

    test('should handle missing directories gracefully', async () => {
      githubService.getDirectoryContents.mockRejectedValueOnce(new Error('Directory not found'));
      
      // Mock fetch for artifacts page check
      global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });

      const models = await logicalModelService.detectLogicalModels(
        'https://example.com',
        'user', 
        'repo', 
        'main'
      );

      expect(models).toHaveLength(0);
    });
  });

  describe('cache functionality', () => {
    test('should cache detection results', async () => {
      const cacheKey = 'user/repo/main';
      
      // Mock fetch for artifacts page check
      global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
      githubService.getDirectoryContents.mockResolvedValueOnce([]);

      // First call
      await logicalModelService.detectLogicalModels('https://example.com', 'user', 'repo', 'main');
      
      // Second call should use cache
      await logicalModelService.detectLogicalModels('https://example.com', 'user', 'repo', 'main');

      expect(githubService.getDirectoryContents).toHaveBeenCalledTimes(3); // Once per directory
    });

    test('should clear cache', () => {
      const stats = logicalModelService.getCacheStats();
      expect(stats.size).toBe(0);
      
      logicalModelService.cache.set('test', []);
      expect(logicalModelService.getCacheStats().size).toBe(1);
      
      logicalModelService.clearCache();
      expect(logicalModelService.getCacheStats().size).toBe(0);
    });
  });
});