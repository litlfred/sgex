import { HealthInterventionsComponent } from '../../components/HealthInterventionsComponent';
import { StagingGroundIntegrationService } from '../../services/stagingGroundIntegrationService';
import { DAKRepository } from '../../types';

// Mock the staging ground integration service
jest.mock('../../services/stagingGroundIntegrationService');

describe('HealthInterventionsComponent', () => {
  let component: HealthInterventionsComponent;
  let mockStagingGroundIntegration: jest.Mocked<StagingGroundIntegrationService>;
  let mockRepository: DAKRepository;

  beforeEach(() => {
    mockRepository = {
      owner: 'test-owner',
      repo: 'test-repo',
      branch: 'main'
    };

    mockStagingGroundIntegration = {
      loadFile: jest.fn(),
      saveFile: jest.fn(),
      loadDakJson: jest.fn(),
      saveDakJson: jest.fn(),
      createRelativeUrlSource: jest.fn(),
      createInlineSource: jest.fn(),
    } as any;

    component = new HealthInterventionsComponent(mockRepository, mockStagingGroundIntegration);
  });

  describe('getSources', () => {
    it('should return empty array when no sources added', () => {
      const sources = component.getSources();
      expect(sources).toEqual([]);
    });

    it('should return added sources', () => {
      const source = { relativeUrl: 'pagecontent/intervention1.md' };
      component.addSource(source);
      
      const sources = component.getSources();
      expect(sources).toHaveLength(1);
      expect(sources[0]).toEqual(source);
    });
  });

  describe('addSource', () => {
    it('should add a relative URL source', () => {
      const source = { relativeUrl: 'pagecontent/intervention1.md' };
      component.addSource(source);
      
      expect(component.getSources()).toContain(source);
    });

    it('should add an inline source', () => {
      const source = { instance: { title: 'Intervention 1', description: 'Test intervention' } };
      component.addSource(source);
      
      expect(component.getSources()).toContain(source);
    });
  });

  describe('retrieveAll', () => {
    it('should retrieve all interventions from relative URL sources', async () => {
      const source = { relativeUrl: 'pagecontent/intervention1.md' };
      component.addSource(source);
      
      mockStagingGroundIntegration.loadFile.mockResolvedValue('# Intervention 1\n\nDescription of intervention');

      const interventions = await component.retrieveAll();
      
      expect(interventions).toHaveLength(1);
      expect(mockStagingGroundIntegration.loadFile).toHaveBeenCalledWith('input/pagecontent/intervention1.md');
    });

    it('should retrieve inline interventions', async () => {
      const interventionData = { title: 'Intervention 1', description: 'Test intervention' };
      const source = { instance: interventionData };
      component.addSource(source);

      const interventions = await component.retrieveAll();
      
      expect(interventions).toHaveLength(1);
      expect(interventions[0]).toEqual(interventionData);
    });
  });

  describe('save', () => {
    it('should save intervention markdown file', async () => {
      const interventionData = '# Intervention 1\n\nDescription';
      const options = { saveType: 'file' as const, path: 'pagecontent/intervention1.md' };

      await component.save(interventionData, options);
      
      expect(mockStagingGroundIntegration.saveFile).toHaveBeenCalledWith(
        'input/pagecontent/intervention1.md',
        interventionData
      );
    });

    it('should create relative URL source when saving file', async () => {
      const interventionData = '# Intervention 1';
      const options = { saveType: 'file' as const, path: 'pagecontent/intervention1.md' };

      mockStagingGroundIntegration.createRelativeUrlSource.mockReturnValue({
        relativeUrl: 'pagecontent/intervention1.md'
      });

      await component.save(interventionData, options);
      
      expect(mockStagingGroundIntegration.createRelativeUrlSource).toHaveBeenCalledWith(
        'pagecontent/intervention1.md'
      );
    });
  });

  describe('validate', () => {
    it('should validate markdown content', async () => {
      const validMarkdown = '# Intervention Title\n\nIntervention description';
      
      const result = await component.validate(validMarkdown);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return error for empty content', async () => {
      const invalidMarkdown = '';
      
      const result = await component.validate(invalidMarkdown);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Intervention content cannot be empty');
    });

    it('should return error for non-string content', async () => {
      const invalidData = { not: 'a string' } as any;
      
      const result = await component.validate(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
