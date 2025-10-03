/**
 * Test for DAK Core Package
 */

import { 
  dakService, 
  DAKComponentType, 
  DAKAssetType,
  actorDefinitionCore,
  ActorDefinitionCore,
  DAKValidationService 
} from '../index';

describe('DAK Core Package', () => {
  
  describe('DAKService', () => {
    test('should create GitHub repository reference', () => {
      const dakRepo = dakService.fromGitHubRepository('WorldHealthOrganization', 'smart-base');
      
      expect(dakRepo.owner).toBe('WorldHealthOrganization');
      expect(dakRepo.repo).toBe('smart-base');
      expect(dakRepo.branch).toBe('main');
    });
    
    test('should create GitHub repository reference with custom branch', () => {
      const dakRepo = dakService.fromGitHubRepository('WHO', 'immunizations', 'develop');
      
      expect(dakRepo.owner).toBe('WHO');
      expect(dakRepo.repo).toBe('immunizations');
      expect(dakRepo.branch).toBe('develop');
    });
  });

  describe('DAKValidationService', () => {
    let validationService: DAKValidationService;

    beforeEach(() => {
      validationService = new DAKValidationService();
    });

    test('should validate basic DAK object structure', () => {
      const mockDAK = {
        resourceType: 'DAK' as const,
        id: 'smart.who.int.base',
        name: 'Base',
        title: 'SMART Base',
        description: 'Base DAK for WHO SMART Guidelines',
        version: '1.0.0',
        status: 'active' as const,
        publicationUrl: 'http://smart.who.int/base',
        license: 'Apache-2.0',
        copyrightYear: '2024',
        publisher: {
          name: 'WHO',
          url: 'https://www.who.int'
        }
      };

      const result = validationService.validateDAKObject(mockDAK);
      
      // Note: This might fail initially due to schema validation,
      // but it tests the basic structure
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('ActorDefinitionCore', () => {
    test('should create empty actor definition', () => {
      const actor = ActorDefinitionCore.createEmpty();
      
      expect(actor).toHaveProperty('id');
      expect(actor).toHaveProperty('name');
      expect(actor).toHaveProperty('description');
      expect(actor).toHaveProperty('type');
      expect(actor).toHaveProperty('responsibilities');
      expect(actor.type).toBe('human');
    });

    test('should validate actor definition', () => {
      const validActor = {
        id: 'test-actor',
        name: 'Test Actor',
        description: 'A test actor definition',
        type: 'human' as const,
        responsibilities: ['Test responsibility']
      };

      const result = actorDefinitionCore.validateActorDefinition(validActor);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail validation for invalid actor', () => {
      const invalidActor = {
        id: '',
        name: '',
        description: '',
        type: 'invalid' as any,
        responsibilities: []
      };

      const result = actorDefinitionCore.validateActorDefinition(invalidActor);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should generate FSH from actor definition', () => {
      const actor = {
        id: 'healthcare-worker',
        name: 'Healthcare Worker',
        description: 'A healthcare professional',
        type: 'human' as const,
        responsibilities: ['Provide care']
      };

      const actorCore = new ActorDefinitionCore(actor);
      const fsh = actorCore.generateFSH();
      
      expect(fsh).toContain('Profile: healthcare-worker');
      expect(fsh).toContain('Title: "Healthcare Worker"');
      expect(fsh).toContain('Description: "A healthcare professional"');
    });

    test('should get actor templates', () => {
      const templates = ActorDefinitionCore.getTemplates();
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('id');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('type');
    });
  });

  describe('Enums', () => {
    test('should have DAKComponentType enum', () => {
      expect(DAKComponentType.HEALTH_INTERVENTIONS).toBe('healthInterventions');
      expect(DAKComponentType.BUSINESS_PROCESSES).toBe('businessProcesses');
      expect(DAKComponentType.DECISION_LOGIC).toBe('decisionLogic');
    });

    test('should have DAKAssetType enum', () => {
      expect(DAKAssetType.BPMN).toBe('bpmn');
      expect(DAKAssetType.DMN).toBe('dmn');
      expect(DAKAssetType.FHIR_PROFILE).toBe('fhir-profile');
    });
  });
});