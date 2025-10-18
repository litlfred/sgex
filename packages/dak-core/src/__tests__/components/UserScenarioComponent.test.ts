import { UserScenarioComponent } from '../../components/UserScenarioComponent';
import { StagingGroundIntegrationService } from '../../services/stagingGroundIntegration';
import { DAKRepository } from '../../types';

// Mock the staging ground integration
jest.mock('../../services/stagingGroundIntegration');

describe('UserScenarioComponent', () => {
  let component: UserScenarioComponent;
  let mockStagingGround: jest.Mocked<StagingGroundIntegrationService>;
  let mockRepository: DAKRepository;

  beforeEach(() => {
    mockRepository = {
      owner: 'test-owner',
      repo: 'test-repo',
      branch: 'main'
    };

    mockStagingGround = {
      loadFile: jest.fn(),
      saveFile: jest.fn(),
      loadDakJson: jest.fn(),
      saveDakJson: jest.fn(),
      createRelativeUrlSource: jest.fn(),
      createInlineSource: jest.fn()
    } as any;

    component = new UserScenarioComponent(mockRepository, mockStagingGround);
  });

  describe('initialization', () => {
    it('should initialize with repository and staging ground', () => {
      expect(component).toBeDefined();
      expect(component.componentType).toBe('userScenarios');
    });
  });

  describe('getSources', () => {
    it('should return empty array when no sources exist', () => {
      const sources = component.getSources();
      expect(sources).toEqual([]);
    });

    it('should return added sources', () => {
      const source = { relativeUrl: 'input/scenarios/scenario1.md' };
      component.addSource(source);
      const sources = component.getSources();
      expect(sources).toHaveLength(1);
      expect(sources[0]).toEqual(source);
    });
  });

  describe('addSource', () => {
    it('should add a relative URL source', () => {
      const source = { relativeUrl: 'input/scenarios/scenario1.md' };
      component.addSource(source);
      expect(component.getSources()).toContainEqual(source);
    });

    it('should add an inline source', () => {
      const source = { 
        instance: { 
          title: 'Test Scenario',
          description: 'Test scenario description',
          actors: ['Actor1'],
          steps: ['Step 1', 'Step 2']
        } 
      };
      component.addSource(source);
      expect(component.getSources()).toContainEqual(source);
    });

    it('should add a canonical source', () => {
      const source = { canonical: 'http://example.org/scenarios/scenario1' };
      component.addSource(source);
      expect(component.getSources()).toContainEqual(source);
    });
  });

  describe('retrieveAll', () => {
    it('should retrieve all user scenarios from staging ground', async () => {
      const mockScenarios = [
        { id: 'scenario1', title: 'Scenario 1', actors: ['Actor1'], steps: ['Step 1'] },
        { id: 'scenario2', title: 'Scenario 2', actors: ['Actor2'], steps: ['Step 2'] }
      ];

      mockStagingGround.loadFile.mockResolvedValueOnce(
        '# Scenario 1\n\nActors: Actor1\nSteps: Step 1'
      );
      mockStagingGround.loadFile.mockResolvedValueOnce(
        '# Scenario 2\n\nActors: Actor2\nSteps: Step 2'
      );

      component.addSource({ relativeUrl: 'input/scenarios/scenario1.md' });
      component.addSource({ relativeUrl: 'input/scenarios/scenario2.md' });

      const result = await component.retrieveAll();
      
      expect(result).toBeDefined();
      expect(mockStagingGround.loadFile).toHaveBeenCalledTimes(2);
    });

    it('should handle inline sources', async () => {
      const inlineScenario = {
        id: 'scenario1',
        title: 'Test Scenario',
        actors: ['Actor1'],
        steps: ['Step 1']
      };

      component.addSource({ instance: inlineScenario });

      const result = await component.retrieveAll();
      
      expect(result).toBeDefined();
      expect(mockStagingGround.loadFile).not.toHaveBeenCalled();
    });

    it('should handle empty sources', async () => {
      const result = await component.retrieveAll();
      expect(result).toBeDefined();
    });
  });

  describe('retrieveById', () => {
    it('should retrieve a specific user scenario by id', async () => {
      mockStagingGround.loadFile.mockResolvedValue(
        '# Test Scenario\n\nActors: Actor1\nSteps: Step 1'
      );

      component.addSource({ relativeUrl: 'input/scenarios/scenario1.md' });

      const result = await component.retrieveById('scenario1');
      
      expect(result).toBeDefined();
      expect(mockStagingGround.loadFile).toHaveBeenCalled();
    });

    it('should return null for non-existent id', async () => {
      const result = await component.retrieveById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save user scenario to file', async () => {
      const scenario = {
        id: 'scenario1',
        title: 'Test Scenario',
        description: 'Test description',
        actors: ['Actor1'],
        steps: ['Step 1', 'Step 2']
      };

      mockStagingGround.saveFile.mockResolvedValue(undefined);
      mockStagingGround.createRelativeUrlSource.mockReturnValue({
        relativeUrl: 'input/scenarios/scenario1.md'
      });

      await component.save(scenario, { 
        saveType: 'file',
        path: 'input/scenarios/scenario1.md'
      });

      expect(mockStagingGround.saveFile).toHaveBeenCalled();
      expect(mockStagingGround.createRelativeUrlSource).toHaveBeenCalled();
    });

    it('should save user scenario as inline', async () => {
      const scenario = {
        id: 'scenario1',
        title: 'Test Scenario',
        actors: ['Actor1'],
        steps: ['Step 1']
      };

      mockStagingGround.createInlineSource.mockReturnValue({
        instance: scenario
      });

      await component.save(scenario, { saveType: 'inline' });

      expect(mockStagingGround.createInlineSource).toHaveBeenCalledWith(scenario);
    });
  });

  describe('validate', () => {
    it('should validate a valid user scenario', async () => {
      const scenario = {
        id: 'scenario1',
        title: 'Test Scenario',
        actors: ['Actor1'],
        steps: ['Step 1', 'Step 2']
      };

      const result = await component.validate(scenario);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid scenario (missing required fields)', async () => {
      const invalidScenario = {
        id: 'scenario1'
        // Missing title, actors, steps
      } as any;

      const result = await component.validate(invalidScenario);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate scenario with empty actors array', async () => {
      const scenario = {
        id: 'scenario1',
        title: 'Test Scenario',
        actors: [],
        steps: ['Step 1']
      };

      const result = await component.validate(scenario);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Actors array cannot be empty');
    });

    it('should validate scenario with empty steps array', async () => {
      const scenario = {
        id: 'scenario1',
        title: 'Test Scenario',
        actors: ['Actor1'],
        steps: []
      };

      const result = await component.validate(scenario);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Steps array cannot be empty');
    });
  });
});
