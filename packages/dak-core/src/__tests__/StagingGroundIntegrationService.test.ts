import { StagingGroundIntegrationService } from '../stagingGroundIntegration';
import { DAK } from '../types';

describe('StagingGroundIntegrationService', () => {
  let service: StagingGroundIntegrationService;
  let mockStagingGroundService: any;

  beforeEach(() => {
    mockStagingGroundService = {
      loadFile: jest.fn(),
      saveFile: jest.fn(),
      listFiles: jest.fn(),
      deleteFile: jest.fn()
    };

    service = new StagingGroundIntegrationService(
      'testUser',
      'testRepo',
      'main',
      mockStagingGroundService
    );
  });

  describe('File Operations', () => {
    it('should load file from staging ground', async () => {
      const fileContent = 'Instance: TestActor\nInstanceOf: Actor';
      mockStagingGroundService.loadFile.mockResolvedValue(fileContent);

      const result = await service.loadFile('fsh/actors/TestActor.fsh');

      expect(result).toBe(fileContent);
      expect(mockStagingGroundService.loadFile).toHaveBeenCalledWith(
        'testUser',
        'testRepo',
        'main',
        'input/fsh/actors/TestActor.fsh'
      );
    });

    it('should save file to staging ground', async () => {
      const fileContent = '<?xml version="1.0"?><definitions></definitions>';
      mockStagingGroundService.saveFile.mockResolvedValue(undefined);

      await service.saveFile('process/workflow.bpmn', fileContent);

      expect(mockStagingGroundService.saveFile).toHaveBeenCalledWith(
        'testUser',
        'testRepo',
        'main',
        'input/process/workflow.bpmn',
        fileContent
      );
    });

    it('should handle file load errors', async () => {
      mockStagingGroundService.loadFile.mockRejectedValue(
        new Error('File not found')
      );

      await expect(service.loadFile('missing.txt')).rejects.toThrow('File not found');
    });

    it('should handle file save errors', async () => {
      mockStagingGroundService.saveFile.mockRejectedValue(
        new Error('Permission denied')
      );

      await expect(
        service.saveFile('test.txt', 'content')
      ).rejects.toThrow('Permission denied');
    });
  });

  describe('dak.json Management', () => {
    it('should load dak.json from staging ground', async () => {
      const dakJson: DAK = {
        metadata: {
          title: 'Test DAK',
          description: 'Test Description'
        },
        healthInterventions: [],
        personas: [],
        userScenarios: [],
        businessProcesses: [],
        dataElements: [],
        decisionLogic: [],
        indicators: [],
        requirements: [],
        testScenarios: []
      };

      mockStagingGroundService.loadFile.mockResolvedValue(JSON.stringify(dakJson));

      const result = await service.loadDakJson();

      expect(result).toEqual(dakJson);
      expect(mockStagingGroundService.loadFile).toHaveBeenCalledWith(
        'testUser',
        'testRepo',
        'main',
        'input/dak.json'
      );
    });

    it('should save dak.json to staging ground', async () => {
      const dakJson: DAK = {
        metadata: {
          title: 'Test DAK',
          description: 'Test Description'
        },
        healthInterventions: [],
        personas: [],
        userScenarios: [],
        businessProcesses: [],
        dataElements: [],
        decisionLogic: [],
        indicators: [],
        requirements: [],
        testScenarios: []
      };

      mockStagingGroundService.saveFile.mockResolvedValue(undefined);

      await service.saveDakJson(dakJson);

      expect(mockStagingGroundService.saveFile).toHaveBeenCalledWith(
        'testUser',
        'testRepo',
        'main',
        'input/dak.json',
        JSON.stringify(dakJson, null, 2)
      );
    });

    it('should handle missing dak.json gracefully', async () => {
      mockStagingGroundService.loadFile.mockRejectedValue(
        new Error('File not found')
      );

      const result = await service.loadDakJson();

      expect(result).toBeNull();
    });
  });

  describe('Path Handling', () => {
    it('should correctly prepend input/ to relative paths', async () => {
      mockStagingGroundService.loadFile.mockResolvedValue('content');

      await service.loadFile('fsh/actors/test.fsh');
      await service.loadFile('vocabulary/valueset.json');
      await service.loadFile('process/workflow.bpmn');

      expect(mockStagingGroundService.loadFile).toHaveBeenNthCalledWith(
        1, 'testUser', 'testRepo', 'main', 'input/fsh/actors/test.fsh'
      );
      expect(mockStagingGroundService.loadFile).toHaveBeenNthCalledWith(
        2, 'testUser', 'testRepo', 'main', 'input/vocabulary/valueset.json'
      );
      expect(mockStagingGroundService.loadFile).toHaveBeenNthCalledWith(
        3, 'testUser', 'testRepo', 'main', 'input/process/workflow.bpmn'
      );
    });

    it('should not double-prepend input/ if already present', async () => {
      mockStagingGroundService.loadFile.mockResolvedValue('content');

      await service.loadFile('input/fsh/actors/test.fsh');

      expect(mockStagingGroundService.loadFile).toHaveBeenCalledWith(
        'testUser',
        'testRepo',
        'main',
        'input/fsh/actors/test.fsh'
      );
    });
  });

  describe('Source Creation Helpers', () => {
    it('should create relative URL source', () => {
      const source = service.createRelativeUrlSource('fsh/actors/Nurse.fsh');

      expect(source).toEqual({
        url: 'fsh/actors/Nurse.fsh'
      });
    });

    it('should create relative URL source with metadata', () => {
      const source = service.createRelativeUrlSource(
        'vocabulary/valueset.json',
        { version: '1.0' }
      );

      expect(source).toEqual({
        url: 'vocabulary/valueset.json',
        metadata: { version: '1.0' }
      });
    });

    it('should create inline source', () => {
      const data = { name: 'Test', value: '123' };
      const source = service.createInlineSource(data);

      expect(source).toEqual({
        instance: data
      });
    });

    it('should create inline source with metadata', () => {
      const data = { name: 'Test' };
      const source = service.createInlineSource(data, { id: 'test-123' });

      expect(source).toEqual({
        instance: data,
        metadata: { id: 'test-123' }
      });
    });
  });

  describe('Component Artifact Management', () => {
    it('should list component artifacts', async () => {
      const files = [
        'input/fsh/actors/Nurse.fsh',
        'input/fsh/actors/Doctor.fsh',
        'input/vocabulary/codes.json'
      ];

      mockStagingGroundService.listFiles.mockResolvedValue(files);

      const result = await service.listComponentArtifacts('fsh/actors/');

      expect(result).toEqual([
        'fsh/actors/Nurse.fsh',
        'fsh/actors/Doctor.fsh'
      ]);
    });

    it('should handle empty artifact lists', async () => {
      mockStagingGroundService.listFiles.mockResolvedValue([]);

      const result = await service.listComponentArtifacts('fsh/actors/');

      expect(result).toEqual([]);
    });
  });

  describe('Repository Information', () => {
    it('should provide repository information', () => {
      const info = service.getRepositoryInfo();

      expect(info).toEqual({
        owner: 'testUser',
        repo: 'testRepo',
        branch: 'main'
      });
    });

    it('should update repository context', () => {
      service.updateRepository('newUser', 'newRepo', 'develop');

      const info = service.getRepositoryInfo();

      expect(info).toEqual({
        owner: 'newUser',
        repo: 'newRepo',
        branch: 'develop'
      });
    });
  });
});
