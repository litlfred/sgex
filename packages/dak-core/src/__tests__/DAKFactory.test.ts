/**
 * Test for DAKFactory
 */

import { DAKFactory } from '../dakFactory';
import { DAKRepository, DAKMetadata } from '../types';
import { StagingGroundIntegrationService } from '../stagingGroundIntegration';

// Mock dependencies
jest.mock('../stagingGroundIntegration');

describe('DAKFactory', () => {
  let mockStagingIntegration: jest.Mocked<StagingGroundIntegrationService>;
  let mockRepository: DAKRepository;

  beforeEach(() => {
    mockRepository = {
      owner: 'WorldHealthOrganization',
      repo: 'smart-immunizations',
      branch: 'main'
    };

    mockStagingIntegration = {
      loadDakJson: jest.fn(),
      saveDakJson: jest.fn(),
      loadArtifact: jest.fn(),
      saveArtifact: jest.fn(),
      createRelativeUrlSource: jest.fn(),
      createInlineSource: jest.fn()
    } as any;
  });

  describe('createFromRepository', () => {
    test('should create DAK object from repository', async () => {
      const mockDakJson = {
        id: 'smart.who.int.immunizations',
        name: 'Immunizations',
        title: 'WHO SMART Guidelines - Immunizations',
        description: 'Digital Adaptation Kit for Immunizations',
        version: '1.0.0',
        status: 'active',
        publicationUrl: 'http://smart.who.int/immunizations',
        license: 'Apache-2.0',
        copyrightYear: '2024',
        publisher: {
          name: 'WHO',
          url: 'https://www.who.int'
        },
        healthInterventions: [],
        genericPersonas: [],
        userScenarios: [],
        businessProcesses: [],
        coreDataElements: [],
        decisionSupportLogic: [],
        indicators: [],
        requirements: [],
        testScenarios: []
      };

      mockStagingIntegration.loadDakJson.mockResolvedValue(mockDakJson);

      const factory = new DAKFactory(mockStagingIntegration);
      const dak = await factory.createFromRepository('WHO', 'immunizations', 'main');

      expect(dak).toBeDefined();
      expect(dak.getMetadata().id).toBe('smart.who.int.immunizations');
      expect(mockStagingIntegration.loadDakJson).toHaveBeenCalledWith('WHO', 'immunizations', 'main');
    });

    test('should handle repository without dak.json', async () => {
      mockStagingIntegration.loadDakJson.mockResolvedValue(null);

      const factory = new DAKFactory(mockStagingIntegration);
      
      await expect(factory.createFromRepository('WHO', 'test-repo', 'main'))
        .rejects.toThrow();
    });

    test('should use default branch if not specified', async () => {
      const mockDakJson = {
        id: 'test.dak',
        name: 'Test',
        version: '1.0.0',
        healthInterventions: [],
        genericPersonas: [],
        userScenarios: [],
        businessProcesses: [],
        coreDataElements: [],
        decisionSupportLogic: [],
        indicators: [],
        requirements: [],
        testScenarios: []
      };

      mockStagingIntegration.loadDakJson.mockResolvedValue(mockDakJson);

      const factory = new DAKFactory(mockStagingIntegration);
      await factory.createFromRepository('WHO', 'test-repo');

      expect(mockStagingIntegration.loadDakJson).toHaveBeenCalledWith('WHO', 'test-repo', 'main');
    });
  });

  describe('createFromDakJson', () => {
    test('should create DAK object from dak.json content', () => {
      const dakJson = {
        id: 'smart.who.int.test',
        name: 'Test DAK',
        title: 'Test Digital Adaptation Kit',
        description: 'A test DAK',
        version: '1.0.0',
        status: 'draft',
        healthInterventions: [
          {
            canonical: 'http://smart.who.int/test/HealthIntervention1',
            metadata: { title: 'Intervention 1', description: 'Test intervention' }
          }
        ],
        genericPersonas: [],
        userScenarios: [],
        businessProcesses: [],
        coreDataElements: [],
        decisionSupportLogic: [],
        indicators: [],
        requirements: [],
        testScenarios: []
      };

      const factory = new DAKFactory(mockStagingIntegration);
      const dak = factory.createFromDakJson(dakJson, mockRepository);

      expect(dak).toBeDefined();
      expect(dak.getMetadata().id).toBe('smart.who.int.test');
      expect(dak.getMetadata().name).toBe('Test DAK');
    });

    test('should load component sources from dak.json', () => {
      const dakJson = {
        id: 'test.dak',
        name: 'Test',
        version: '1.0.0',
        healthInterventions: [
          { canonical: 'http://example.com/intervention1' }
        ],
        genericPersonas: [
          { url: 'input/fsh/actors/actor1.fsh' }
        ],
        businessProcesses: [
          { url: 'input/process/workflow1.bpmn' }
        ],
        userScenarios: [],
        coreDataElements: [],
        decisionSupportLogic: [],
        indicators: [],
        requirements: [],
        testScenarios: []
      };

      const factory = new DAKFactory(mockStagingIntegration);
      const dak = factory.createFromDakJson(dakJson, mockRepository);

      expect(dak.healthInterventions.getSources()).toHaveLength(1);
      expect(dak.personas.getSources()).toHaveLength(1);
      expect(dak.businessProcesses.getSources()).toHaveLength(1);
    });

    test('should handle minimal dak.json', () => {
      const dakJson = {
        id: 'minimal.dak',
        name: 'Minimal',
        version: '1.0.0'
      };

      const factory = new DAKFactory(mockStagingIntegration);
      const dak = factory.createFromDakJson(dakJson, mockRepository);

      expect(dak).toBeDefined();
      expect(dak.getMetadata().id).toBe('minimal.dak');
    });
  });

  describe('createEmpty', () => {
    test('should create empty DAK object with metadata', () => {
      const metadata: DAKMetadata = {
        id: 'new.dak',
        name: 'New DAK',
        title: 'New Digital Adaptation Kit',
        description: 'A brand new DAK',
        version: '0.1.0',
        status: 'draft',
        license: 'Apache-2.0',
        copyrightYear: '2024',
        publisher: {
          name: 'WHO',
          url: 'https://www.who.int'
        }
      };

      const factory = new DAKFactory(mockStagingIntegration);
      const dak = factory.createEmpty(mockRepository, metadata);

      expect(dak).toBeDefined();
      expect(dak.getMetadata()).toEqual(metadata);
    });

    test('should create DAK with empty component sources', () => {
      const metadata: DAKMetadata = {
        id: 'empty.dak',
        name: 'Empty',
        version: '1.0.0'
      };

      const factory = new DAKFactory(mockStagingIntegration);
      const dak = factory.createEmpty(mockRepository, metadata);

      expect(dak.healthInterventions.getSources()).toHaveLength(0);
      expect(dak.personas.getSources()).toHaveLength(0);
      expect(dak.businessProcesses.getSources()).toHaveLength(0);
      expect(dak.dataElements.getSources()).toHaveLength(0);
      expect(dak.decisionLogic.getSources()).toHaveLength(0);
      expect(dak.indicators.getSources()).toHaveLength(0);
      expect(dak.requirements.getSources()).toHaveLength(0);
      expect(dak.testScenarios.getSources()).toHaveLength(0);
      expect(dak.userScenarios.getSources()).toHaveLength(0);
    });

    test('should use default values for optional metadata fields', () => {
      const minimalMetadata = {
        id: 'test.dak',
        name: 'Test',
        version: '1.0.0'
      };

      const factory = new DAKFactory(mockStagingIntegration);
      const dak = factory.createEmpty(mockRepository, minimalMetadata);

      const metadata = dak.getMetadata();
      expect(metadata.id).toBe('test.dak');
      expect(metadata.name).toBe('Test');
      expect(metadata.version).toBe('1.0.0');
    });
  });

  describe('Error Handling', () => {
    test('should handle staging ground loading errors', async () => {
      mockStagingIntegration.loadDakJson.mockRejectedValue(new Error('Loading failed'));

      const factory = new DAKFactory(mockStagingIntegration);
      
      await expect(factory.createFromRepository('WHO', 'test-repo'))
        .rejects.toThrow('Loading failed');
    });

    test('should handle invalid dak.json structure', () => {
      const invalidDakJson = {
        // Missing required fields
        randomField: 'value'
      } as any;

      const factory = new DAKFactory(mockStagingIntegration);
      
      expect(() => factory.createFromDakJson(invalidDakJson, mockRepository))
        .toThrow();
    });
  });
});
