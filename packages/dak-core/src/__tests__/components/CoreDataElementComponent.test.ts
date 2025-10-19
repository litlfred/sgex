import { CoreDataElementComponent } from '../../components/CoreDataElementComponent';
import { StagingGroundIntegrationService } from '../../services/StagingGroundIntegrationService';
import { DAKRepository } from '../../types';

// Mock the staging ground integration
jest.mock('../../services/StagingGroundIntegrationService');

describe('CoreDataElementComponent', () => {
  let component: CoreDataElementComponent;
  let mockStagingGround: jest.Mocked<StagingGroundIntegrationService>;
  const mockRepository: DAKRepository = {
    owner: 'test-owner',
    repo: 'test-repo',
    branch: 'main'
  };

  beforeEach(() => {
    mockStagingGround = {
      loadFile: jest.fn(),
      saveFile: jest.fn(),
      loadDakJson: jest.fn(),
      saveDakJson: jest.fn(),
      createRelativeUrlSource: jest.fn(),
      createInlineSource: jest.fn()
    } as any;

    component = new CoreDataElementComponent(mockRepository, mockStagingGround);
  });

  describe('getSources', () => {
    it('should return empty array when no sources exist', () => {
      const sources = component.getSources();
      expect(sources).toEqual([]);
    });

    it('should return all added sources', () => {
      const source1 = { relativeUrl: 'input/vocabulary/test1.json' };
      const source2 = { relativeUrl: 'input/vocabulary/test2.json' };
      
      component.addSource(source1);
      component.addSource(source2);
      
      const sources = component.getSources();
      expect(sources).toHaveLength(2);
      expect(sources).toContain(source1);
      expect(sources).toContain(source2);
    });
  });

  describe('addSource', () => {
    it('should add a relative URL source', () => {
      const source = { relativeUrl: 'input/vocabulary/test.json' };
      component.addSource(source);
      
      expect(component.getSources()).toContain(source);
    });

    it('should add a canonical IRI source', () => {
      const source = { canonicalIri: 'http://example.org/fhir/ValueSet/test' };
      component.addSource(source);
      
      expect(component.getSources()).toContain(source);
    });

    it('should add an absolute URL source', () => {
      const source = { absoluteUrl: 'https://example.org/valuesets/test.json' };
      component.addSource(source);
      
      expect(component.getSources()).toContain(source);
    });

    it('should add an inline instance source', () => {
      const source = { 
        instance: {
          type: 'valueset',
          canonical: 'http://example.org/fhir/ValueSet/test',
          id: 'test-vs',
          description: 'Test value set'
        }
      };
      component.addSource(source);
      
      expect(component.getSources()).toContain(source);
    });
  });

  describe('retrieveAll', () => {
    it('should retrieve all core data elements from sources', async () => {
      const mockElement = {
        type: 'valueset',
        canonical: 'http://example.org/fhir/ValueSet/test',
        id: 'test-vs',
        description: 'Test value set'
      };

      mockStagingGround.loadFile.mockResolvedValue(JSON.stringify(mockElement));
      
      component.addSource({ relativeUrl: 'input/vocabulary/test.json' });
      
      const elements = await component.retrieveAll();
      expect(elements).toHaveLength(1);
      expect(elements[0]).toEqual(mockElement);
      expect(mockStagingGround.loadFile).toHaveBeenCalledWith('input/vocabulary/test.json');
    });

    it('should handle inline instance sources', async () => {
      const mockElement = {
        type: 'codesystem',
        canonical: 'http://example.org/fhir/CodeSystem/test',
        id: 'test-cs',
        description: 'Test code system'
      };

      component.addSource({ instance: mockElement });
      
      const elements = await component.retrieveAll();
      expect(elements).toHaveLength(1);
      expect(elements[0]).toEqual(mockElement);
      expect(mockStagingGround.loadFile).not.toHaveBeenCalled();
    });
  });

  describe('retrieveById', () => {
    it('should retrieve a specific core data element by id', async () => {
      const mockElement = {
        type: 'valueset',
        canonical: 'http://example.org/fhir/ValueSet/test',
        id: 'test-vs',
        description: 'Test value set'
      };

      mockStagingGround.loadFile.mockResolvedValue(JSON.stringify(mockElement));
      component.addSource({ relativeUrl: 'input/vocabulary/test.json' });
      
      const element = await component.retrieveById('test-vs');
      expect(element).toEqual(mockElement);
    });

    it('should return undefined if element not found', async () => {
      const element = await component.retrieveById('nonexistent');
      expect(element).toBeUndefined();
    });
  });

  describe('save', () => {
    it('should save a core data element to file', async () => {
      const element = {
        type: 'valueset',
        canonical: 'http://example.org/fhir/ValueSet/test',
        id: 'test-vs',
        description: 'Test value set'
      };

      mockStagingGround.createRelativeUrlSource.mockReturnValue({
        relativeUrl: 'input/vocabulary/test-vs.json'
      });

      await component.save(element, { saveType: 'file', path: 'input/vocabulary/test-vs.json' });
      
      expect(mockStagingGround.saveFile).toHaveBeenCalledWith(
        'input/vocabulary/test-vs.json',
        JSON.stringify(element, null, 2)
      );
      expect(mockStagingGround.createRelativeUrlSource).toHaveBeenCalled();
    });

    it('should save as inline instance when saveType is inline', async () => {
      const element = {
        type: 'codesystem',
        canonical: 'http://example.org/fhir/CodeSystem/test',
        id: 'test-cs',
        description: 'Test code system'
      };

      mockStagingGround.createInlineSource.mockReturnValue({ instance: element });

      await component.save(element, { saveType: 'inline' });
      
      expect(mockStagingGround.saveFile).not.toHaveBeenCalled();
      expect(mockStagingGround.createInlineSource).toHaveBeenCalledWith(element);
    });
  });

  describe('validate', () => {
    it('should validate a valueset type', async () => {
      const element = {
        type: 'valueset',
        canonical: 'http://example.org/fhir/ValueSet/test',
        id: 'test-vs',
        description: 'Test value set'
      };

      const result = await component.validate(element);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a codesystem type', async () => {
      const element = {
        type: 'codesystem',
        canonical: 'http://example.org/fhir/CodeSystem/test'
      };

      const result = await component.validate(element);
      expect(result.valid).toBe(true);
    });

    it('should validate a conceptmap type', async () => {
      const element = {
        type: 'conceptmap',
        canonical: 'http://example.org/fhir/ConceptMap/test'
      };

      const result = await component.validate(element);
      expect(result.valid).toBe(true);
    });

    it('should validate a logicalmodel type', async () => {
      const element = {
        type: 'logicalmodel',
        canonical: 'http://example.org/fhir/StructureDefinition/test'
      };

      const result = await component.validate(element);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for missing type', async () => {
      const element = {
        canonical: 'http://example.org/fhir/ValueSet/test'
      } as any;

      const result = await component.validate(element);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Type is required');
    });

    it('should fail validation for invalid type', async () => {
      const element = {
        type: 'invalid',
        canonical: 'http://example.org/fhir/ValueSet/test'
      } as any;

      const result = await component.validate(element);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Type must be one of: valueset, codesystem, conceptmap, logicalmodel');
    });

    it('should fail validation for missing canonical', async () => {
      const element = {
        type: 'valueset'
      } as any;

      const result = await component.validate(element);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Canonical URI is required');
    });

    it('should allow description as string or URI', async () => {
      const element1 = {
        type: 'valueset',
        canonical: 'http://example.org/fhir/ValueSet/test',
        description: 'String description'
      };

      const element2 = {
        type: 'valueset',
        canonical: 'http://example.org/fhir/ValueSet/test',
        description: 'http://example.org/description'
      };

      const result1 = await component.validate(element1);
      const result2 = await component.validate(element2);
      
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });
  });
});
