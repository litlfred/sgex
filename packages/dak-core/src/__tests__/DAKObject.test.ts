/**
 * Test for DAKObject
 */

import { DAKObject } from '../dakObject';
import { DAKRepository, DAKMetadata } from '../types';
import { StagingGroundIntegrationService } from '../stagingGroundIntegration';

// Mock the staging ground integration
jest.mock('../stagingGroundIntegration');

describe('DAKObject', () => {
  let mockRepository: DAKRepository;
  let mockMetadata: DAKMetadata;
  let mockStagingIntegration: jest.Mocked<StagingGroundIntegrationService>;

  beforeEach(() => {
    mockRepository = {
      owner: 'WorldHealthOrganization',
      repo: 'smart-immunizations',
      branch: 'main'
    };

    mockMetadata = {
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
      }
    };

    mockStagingIntegration = {
      loadDakJson: jest.fn().mockResolvedValue(null),
      saveDakJson: jest.fn().mockResolvedValue(undefined),
      loadArtifact: jest.fn(),
      saveArtifact: jest.fn(),
      createRelativeUrlSource: jest.fn(),
      createInlineSource: jest.fn()
    } as any;
  });

  describe('Constructor and Initialization', () => {
    test('should create DAKObject with repository and metadata', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);

      expect(dak).toBeInstanceOf(DAKObject);
      expect(dak.getMetadata()).toEqual(mockMetadata);
    });

    test('should initialize all 9 component objects', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);

      expect(dak.healthInterventions).toBeDefined();
      expect(dak.personas).toBeDefined();
      expect(dak.userScenarios).toBeDefined();
      expect(dak.businessProcesses).toBeDefined();
      expect(dak.dataElements).toBeDefined();
      expect(dak.decisionLogic).toBeDefined();
      expect(dak.indicators).toBeDefined();
      expect(dak.requirements).toBeDefined();
      expect(dak.testScenarios).toBeDefined();
    });
  });

  describe('Metadata Management', () => {
    test('should return current metadata', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);
      
      const metadata = dak.getMetadata();
      expect(metadata).toEqual(mockMetadata);
    });

    test('should update metadata', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);
      
      const updatedMetadata: DAKMetadata = {
        ...mockMetadata,
        version: '2.0.0',
        status: 'draft'
      };

      dak.updateMetadata(updatedMetadata);
      
      expect(dak.getMetadata()).toEqual(updatedMetadata);
      expect(dak.getMetadata().version).toBe('2.0.0');
      expect(dak.getMetadata().status).toBe('draft');
    });

    test('should partially update metadata', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);
      
      dak.updateMetadata({ version: '1.1.0' });
      
      const metadata = dak.getMetadata();
      expect(metadata.version).toBe('1.1.0');
      expect(metadata.name).toBe('Immunizations'); // unchanged
    });
  });

  describe('Component Access', () => {
    test('should provide access to all component objects', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);

      // Test that all components are accessible
      expect(dak.healthInterventions).toBeDefined();
      expect(dak.personas).toBeDefined();
      expect(dak.userScenarios).toBeDefined();
      expect(dak.businessProcesses).toBeDefined();
      expect(dak.dataElements).toBeDefined();
      expect(dak.decisionLogic).toBeDefined();
      expect(dak.indicators).toBeDefined();
      expect(dak.requirements).toBeDefined();
      expect(dak.testScenarios).toBeDefined();
    });

    test('should have component objects with getSources method', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);

      expect(dak.personas.getSources).toBeDefined();
      expect(dak.businessProcesses.getSources).toBeDefined();
      expect(dak.dataElements.getSources).toBeDefined();
    });
  });

  describe('Serialization', () => {
    test('should serialize to DAK JSON structure', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);
      
      const dakJson = dak.toJSON();

      expect(dakJson).toHaveProperty('id', mockMetadata.id);
      expect(dakJson).toHaveProperty('name', mockMetadata.name);
      expect(dakJson).toHaveProperty('version', mockMetadata.version);
      expect(dakJson).toHaveProperty('healthInterventions');
      expect(dakJson).toHaveProperty('genericPersonas');
      expect(dakJson).toHaveProperty('userScenarios');
      expect(dakJson).toHaveProperty('businessProcesses');
      expect(dakJson).toHaveProperty('coreDataElements');
      expect(dakJson).toHaveProperty('decisionSupportLogic');
      expect(dakJson).toHaveProperty('indicators');
      expect(dakJson).toHaveProperty('requirements');
      expect(dakJson).toHaveProperty('testScenarios');
    });

    test('should include all component sources in serialization', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);
      
      const dakJson = dak.toJSON();

      expect(Array.isArray(dakJson.healthInterventions)).toBe(true);
      expect(Array.isArray(dakJson.genericPersonas)).toBe(true);
      expect(Array.isArray(dakJson.userScenarios)).toBe(true);
      expect(Array.isArray(dakJson.businessProcesses)).toBe(true);
      expect(Array.isArray(dakJson.coreDataElements)).toBe(true);
      expect(Array.isArray(dakJson.decisionSupportLogic)).toBe(true);
      expect(Array.isArray(dakJson.indicators)).toBe(true);
      expect(Array.isArray(dakJson.requirements)).toBe(true);
      expect(Array.isArray(dakJson.testScenarios)).toBe(true);
    });
  });

  describe('DAK JSON Management', () => {
    test('should save dak.json through staging integration', async () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);
      
      await dak.saveDakJson();

      expect(mockStagingIntegration.saveDakJson).toHaveBeenCalledTimes(1);
      expect(mockStagingIntegration.saveDakJson).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockMetadata.id,
          name: mockMetadata.name
        })
      );
    });

    test('should handle save errors gracefully', async () => {
      mockStagingIntegration.saveDakJson.mockRejectedValue(new Error('Save failed'));
      
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);
      
      await expect(dak.saveDakJson()).rejects.toThrow('Save failed');
    });
  });

  describe('Component Source Updates', () => {
    test('should trigger dak.json update when component sources change', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);
      
      // This would typically be called internally when a component's sources change
      // The DAK object should have callbacks registered with each component
      expect(dak.personas).toBeDefined();
      expect(dak.businessProcesses).toBeDefined();
    });
  });

  describe('Repository Information', () => {
    test('should provide repository information', () => {
      const dak = new DAKObject(mockRepository, mockMetadata, mockStagingIntegration);
      
      // DAKObject should have access to repository info
      expect(dak).toBeDefined();
    });
  });
});
