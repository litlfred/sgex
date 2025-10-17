import { GenericPersonaComponent } from '../../components/personas';
import { GenericPersonaSource } from '../../types';
import { StagingGroundIntegrationService } from '../../stagingGroundIntegration';

// Mock StagingGroundIntegrationService
jest.mock('../../stagingGroundIntegration');

describe('GenericPersonaComponent', () => {
  let component: GenericPersonaComponent;
  let mockStagingIntegration: jest.Mocked<StagingGroundIntegrationService>;

  beforeEach(() => {
    mockStagingIntegration = {
      loadFile: jest.fn(),
      saveFile: jest.fn(),
      loadDakJson: jest.fn(),
      saveDakJson: jest.fn(),
      createRelativeUrlSource: jest.fn(),
      createInlineSource: jest.fn(),
    } as any;

    component = new GenericPersonaComponent(mockStagingIntegration);
  });

  describe('getSources', () => {
    it('should return empty array initially', () => {
      expect(component.getSources()).toEqual([]);
    });

    it('should return added sources', () => {
      const source: GenericPersonaSource = {
        url: 'input/fsh/actors/patient.fsh',
        metadata: { id: 'patient', name: 'Patient' }
      };
      component.addSource(source);
      expect(component.getSources()).toContain(source);
    });
  });

  describe('addSource', () => {
    it('should add a URL source', () => {
      const source: GenericPersonaSource = {
        url: 'input/fsh/actors/practitioner.fsh',
        metadata: { id: 'practitioner', name: 'Practitioner' }
      };
      component.addSource(source);
      expect(component.getSources()).toHaveLength(1);
    });

    it('should add an inline source', () => {
      const source: GenericPersonaSource = {
        instance: { 
          id: 'admin',
          name: 'Administrator',
          description: 'System administrator'
        },
        metadata: { id: 'admin' }
      };
      component.addSource(source);
      expect(component.getSources()).toHaveLength(1);
    });
  });

  describe('retrieveAll', () => {
    it('should retrieve all personas from file sources', async () => {
      mockStagingIntegration.loadFile.mockResolvedValue('Alias: $Patient = http://hl7.org/fhir/StructureDefinition/Patient');
      
      component.addSource({
        url: 'input/fsh/actors/patient.fsh',
        metadata: { id: 'patient' }
      });

      const result = await component.retrieveAll();
      expect(result).toHaveLength(1);
      expect(mockStagingIntegration.loadFile).toHaveBeenCalledWith('input/fsh/actors/patient.fsh');
    });

    it('should retrieve inline personas', async () => {
      const personaData = {
        id: 'admin',
        name: 'Administrator',
        description: 'System administrator'
      };
      
      component.addSource({
        instance: personaData,
        metadata: { id: 'admin' }
      });

      const result = await component.retrieveAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(personaData);
    });
  });

  describe('save', () => {
    it('should save persona to file', async () => {
      const personaContent = 'Alias: $Patient = http://hl7.org/fhir/StructureDefinition/Patient';
      
      await component.save(personaContent, {
        saveType: 'file',
        path: 'input/fsh/actors/patient.fsh',
        metadata: { id: 'patient' }
      });

      expect(mockStagingIntegration.saveFile).toHaveBeenCalledWith(
        'input/fsh/actors/patient.fsh',
        personaContent
      );
    });
  });

  describe('validate', () => {
    it('should validate FSH format', async () => {
      const validFSH = 'Alias: $Patient = http://hl7.org/fhir/StructureDefinition/Patient';
      const result = await component.validate(validFSH);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid FSH format', async () => {
      const invalidFSH = 'This is not valid FSH';
      const result = await component.validate(invalidFSH);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
