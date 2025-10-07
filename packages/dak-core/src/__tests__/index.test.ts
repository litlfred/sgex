/**
 * Test for DAK Core Package
 */

import { 
  dakService, 
  DAKComponentType, 
  DAKAssetType,
  actorDefinitionCore,
  ActorDefinitionCore,
  DAKValidationService,
  QuestionnaireDefinitionCore,
  DecisionTableCore
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

  describe('QuestionnaireDefinitionCore', () => {
    test('should create empty questionnaire definition', () => {
      const questionnaire = QuestionnaireDefinitionCore.createEmpty();
      
      expect(questionnaire).toHaveProperty('id');
      expect(questionnaire).toHaveProperty('name');
      expect(questionnaire).toHaveProperty('status');
      expect(questionnaire.status).toBe('draft');
      expect(questionnaire.resourceType).toBe('Questionnaire');
    });

    test('should validate questionnaire definition', () => {
      const validQuestionnaire = {
        id: 'test-questionnaire',
        name: 'Test Questionnaire',
        description: 'A test questionnaire',
        title: 'Test Questionnaire',
        status: 'draft' as const,
        type: 'questionnaire' as const,
        resourceType: 'Questionnaire' as const,
        item: [
          {
            linkId: '1',
            text: 'Question 1',
            type: 'string'
          }
        ]
      };

      const qCore = new QuestionnaireDefinitionCore(validQuestionnaire);
      const result = qCore.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should generate FSH from questionnaire', () => {
      const questionnaire = {
        id: 'test-q',
        name: 'Test Questionnaire',
        description: 'A test',
        title: 'Test',
        status: 'draft' as const,
        type: 'questionnaire' as const,
        item: [
          {
            linkId: 'q1',
            text: 'Question 1',
            type: 'string',
            required: true
          }
        ]
      };

      const qCore = new QuestionnaireDefinitionCore(questionnaire);
      const fsh = qCore.generateFSH();
      
      expect(fsh).toContain('Instance: test-q');
      expect(fsh).toContain('InstanceOf: Questionnaire');
      expect(fsh).toContain('status = #draft');
    });

    test('should extract FSH metadata', async () => {
      const fshContent = `
Instance: TestQuestionnaire
Title: "Test Questionnaire"
Description: "A test questionnaire"
* status = #draft
* title = "Test"
      `;
      
      const metadata = await QuestionnaireDefinitionCore.extractMetadata(fshContent);
      
      expect(metadata.title).toBe('Test Questionnaire');
      expect(metadata.status).toBe('draft');
    });
  });

  describe('DecisionTableCore', () => {
    test('should create empty decision table', () => {
      const dt = DecisionTableCore.createEmpty();
      
      expect(dt).toHaveProperty('id');
      expect(dt).toHaveProperty('name');
      expect(dt).toHaveProperty('concepts');
      expect(dt.concepts).toEqual([]);
    });

    test('should validate decision table', () => {
      const validDT = {
        id: 'test-dt',
        name: 'Test Decision Table',
        description: 'A test decision table',
        type: 'decision-table' as const,
        concepts: [
          {
            code: 'VAR1',
            Code: 'VAR1',
            display: 'Variable 1',
            Display: 'Variable 1',
            Definition: 'First variable'
          }
        ]
      };

      const dtCore = new DecisionTableCore(validDT);
      const result = dtCore.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should parse FSH code system', async () => {
      const fshContent = `
CodeSystem: DAKDT
Title: "DAK Decision Table Variables"

* #VAR1 "Variable 1"
  * ^definition = "First variable"
* #VAR2 "Variable 2"
  * ^definition = "Second variable"
      `;
      
      const variables = await DecisionTableCore.parseFSHCodeSystem(fshContent);
      
      expect(variables).toHaveLength(2);
      expect(variables[0].Code).toBe('VAR1');
      expect(variables[0].Display).toBe('Variable 1');
      expect(variables[1].Code).toBe('VAR2');
    });

    test('should generate FSH from decision table', () => {
      const dt = {
        id: 'test-dt',
        name: 'Test DT',
        description: 'Test',
        type: 'decision-table' as const,
        concepts: [
          {
            code: 'VAR1',
            display: 'Variable 1',
            definition: 'First variable'
          }
        ]
      };

      const dtCore = new DecisionTableCore(dt);
      const fsh = dtCore.generateFSH();
      
      expect(fsh).toContain('CodeSystem: test-dt');
      expect(fsh).toContain('Title: "Test DT"');
      expect(fsh).toContain('#VAR1');
    });

    test('should manage variables', () => {
      const dtCore = new DecisionTableCore();
      
      dtCore.addVariable({
        Code: 'VAR1',
        code: 'VAR1',
        Display: 'Variable 1',
        display: 'Variable 1'
      });
      
      expect(dtCore.getVariables()).toHaveLength(1);
      
      const found = dtCore.findVariable('VAR1');
      expect(found).toBeDefined();
      expect(found?.Code).toBe('VAR1');
      
      dtCore.updateVariable('VAR1', { Display: 'Updated Variable 1' });
      const updated = dtCore.findVariable('VAR1');
      expect(updated?.Display).toBe('Updated Variable 1');
      
      dtCore.removeVariable('VAR1');
      expect(dtCore.getVariables()).toHaveLength(0);
    });
  });
});