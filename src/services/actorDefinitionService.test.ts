import actorDefinitionService from '../services/actorDefinitionService';
import stagingGroundService from '../services/stagingGroundService';

// Mock staging ground service
jest.mock('../services/stagingGroundService', () => ({
  updateFile: jest.fn(),
  removeFile: jest.fn(),
  getStagingGround: jest.fn()
}));

describe('ActorDefinitionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateActorDefinition', () => {
    it('should validate a complete actor definition', () => {
      const actorDef = {
        id: 'test-actor',
        name: 'Test Actor',
        description: 'A test actor for validation',
        type: 'practitioner',
        roles: [
          { code: '123', display: 'Test Role' }
        ]
      };

      const result = actorDefinitionService.validateActorDefinition(actorDef);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject actor definition with invalid ID', () => {
      const actorDef = {
        id: '123-invalid', // starts with number
        name: 'Test Actor',
        description: 'A test actor',
        type: 'practitioner',
        roles: [{ code: '123', display: 'Test Role' }]
      };

      const result = actorDefinitionService.validateActorDefinition(actorDef);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ID must start with a letter and contain only letters, numbers, underscores, and hyphens');
    });

    it('should reject actor definition without required fields', () => {
      const actorDef = {
        id: 'test-actor'
        // missing required fields
      };

      const result = actorDefinitionService.validateActorDefinition(actorDef);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('generateFSH', () => {
    it('should generate valid FSH from actor definition', () => {
      const actorDef = {
        id: 'primary-care-physician',
        name: 'Primary Care Physician',
        description: 'A healthcare practitioner providing primary care services',
        type: 'practitioner',
        roles: [
          {
            code: '158965000',
            display: 'Medical practitioner',
            system: 'http://snomed.info/sct'
          }
        ],
        metadata: {
          status: 'active',
          version: '1.0.0'
        }
      };

      const fsh = actorDefinitionService.generateFSH(actorDef);
      
      expect(fsh).toContain('Profile: primary-care-physician');
      expect(fsh).toContain('Parent: ActorDefinition');
      expect(fsh).toContain('Title: "Primary Care Physician"');
      expect(fsh).toContain('Description: "A healthcare practitioner providing primary care services"');
      expect(fsh).toContain('* status = #active');
      expect(fsh).toContain('* type = #practitioner');
      expect(fsh).toContain('* role[0].coding.system = "http://snomed.info/sct"');
      expect(fsh).toContain('* role[0].coding.code = #158965000');
      expect(fsh).toContain('* role[0].coding.display = "Medical practitioner"');
    });

    it('should handle special characters in FSH strings', () => {
      const actorDef = {
        id: 'test-actor',
        name: 'Test "Actor" with quotes',
        description: 'Description with\nnewlines and "quotes"',
        type: 'person',
        roles: [{ code: '123', display: 'Test Role' }]
      };

      const fsh = actorDefinitionService.generateFSH(actorDef);
      
      expect(fsh).toContain('Title: "Test \\"Actor\\" with quotes"');
      expect(fsh).toContain('Description: "Description with\\nnewlines and \\"quotes\\""');
    });
  });

  describe('saveToStagingGround', () => {
    it('should save valid actor definition to staging ground', async () => {
      const actorDef = {
        id: 'test-actor',
        name: 'Test Actor',
        description: 'A test actor',
        type: 'practitioner',
        roles: [{ code: '123', display: 'Test Role' }]
      };

      stagingGroundService.updateFile.mockReturnValue(true);

      const result = await actorDefinitionService.saveToStagingGround(actorDef);
      
      expect(result.success).toBe(true);
      expect(result.filePath).toBe('input/fsh/actors/test-actor.fsh');
      expect(stagingGroundService.updateFile).toHaveBeenCalledWith(
        'input/fsh/actors/test-actor.fsh',
        expect.stringContaining('Profile: test-actor'),
        expect.objectContaining({
          type: 'actor-definition',
          actorId: 'test-actor',
          actorName: 'Test Actor',
          source: 'actor-editor'
        })
      );
    });

    it('should reject invalid actor definition', async () => {
      const actorDef = {
        id: '', // invalid
        name: 'Test Actor'
      };

      const result = await actorDefinitionService.saveToStagingGround(actorDef);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(stagingGroundService.updateFile).not.toHaveBeenCalled();
    });
  });

  describe('listStagedActors', () => {
    it('should list staged actor files', () => {
      const mockStagingGround = {
        files: [
          {
            path: 'input/fsh/actors/actor1.fsh',
            metadata: {
              type: 'actor-definition',
              actorId: 'actor1',
              actorName: 'Actor 1'
            },
            timestamp: 1000
          },
          {
            path: 'input/fsh/actors/actor2.fsh',
            metadata: {
              type: 'actor-definition',
              actorId: 'actor2',
              actorName: 'Actor 2'
            },
            timestamp: 2000
          },
          {
            path: 'input/fsh/other/file.fsh',
            metadata: { type: 'other' },
            timestamp: 1500
          }
        ]
      };

      stagingGroundService.getStagingGround.mockReturnValue(mockStagingGround);

      const actors = actorDefinitionService.listStagedActors();
      
      expect(actors).toHaveLength(2);
      expect(actors[0].id).toBe('actor2'); // Most recent first
      expect(actors[0].name).toBe('Actor 2');
      expect(actors[1].id).toBe('actor1');
      expect(actors[1].name).toBe('Actor 1');
    });
  });

  describe('createEmptyActorDefinition', () => {
    it('should create a valid empty actor definition', () => {
      const empty = actorDefinitionService.createEmptyActorDefinition();
      
      expect(empty).toHaveProperty('id', '');
      expect(empty).toHaveProperty('name', '');
      expect(empty).toHaveProperty('description', '');
      expect(empty).toHaveProperty('type', 'person');
      expect(empty).toHaveProperty('roles');
      expect(empty.roles).toHaveLength(1);
      expect(empty.roles[0]).toEqual({
        code: '',
        display: '',
        system: 'http://snomed.info/sct'
      });
    });
  });

  describe('getActorTemplates', () => {
    it('should return predefined actor templates', () => {
      const templates = actorDefinitionService.getActorTemplates();
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('id');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('description');
      expect(templates[0]).toHaveProperty('type');
      expect(templates[0]).toHaveProperty('roles');
      
      // Check that we have expected templates
      const templateIds = templates.map(t => t.id);
      expect(templateIds).toContain('clinician-template');
      expect(templateIds).toContain('nurse-template');
      expect(templateIds).toContain('patient-template');
    });
  });
});