import { BusinessProcessWorkflowComponent } from '../../components/businessProcesses';
import { StagingGroundIntegrationService } from '../../stagingGroundIntegration';
import { DAKRepository } from '../../types';

describe('BusinessProcessWorkflowComponent', () => {
  let component: BusinessProcessWorkflowComponent;
  let mockStagingIntegration: jest.Mocked<StagingGroundIntegrationService>;
  let mockRepository: DAKRepository;

  beforeEach(() => {
    mockRepository = {
      owner: 'test-owner',
      repo: 'test-repo',
      branch: 'main'
    };

    mockStagingIntegration = {
      loadFile: jest.fn(),
      saveFile: jest.fn(),
      loadDakJson: jest.fn(),
      saveDakJson: jest.fn(),
      createRelativeUrlSource: jest.fn(),
      createInlineSource: jest.fn()
    } as any;

    component = new BusinessProcessWorkflowComponent(mockRepository, mockStagingIntegration);
  });

  describe('getSources', () => {
    it('should return empty array when no sources', () => {
      const sources = component.getSources();
      expect(sources).toEqual([]);
    });

    it('should return added sources', () => {
      const source = {
        relativeUrl: 'input/process/workflow.bpmn'
      };
      component.addSource(source);
      const sources = component.getSources();
      expect(sources).toHaveLength(1);
      expect(sources[0]).toEqual(source);
    });
  });

  describe('addSource', () => {
    it('should add BPMN workflow source', () => {
      const source = {
        relativeUrl: 'input/process/anc-workflow.bpmn'
      };
      component.addSource(source);
      expect(component.getSources()).toContainEqual(source);
    });

    it('should add multiple sources', () => {
      component.addSource({ relativeUrl: 'input/process/workflow1.bpmn' });
      component.addSource({ relativeUrl: 'input/process/workflow2.bpmn' });
      expect(component.getSources()).toHaveLength(2);
    });
  });

  describe('retrieveAll', () => {
    it('should retrieve all BPMN workflows', async () => {
      const bpmnXml = '<?xml version="1.0" encoding="UTF-8"?><definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"></definitions>';
      
      mockStagingIntegration.loadFile.mockResolvedValue(bpmnXml);
      component.addSource({ relativeUrl: 'input/process/workflow.bpmn' });

      const workflows = await component.retrieveAll();
      
      expect(workflows).toHaveLength(1);
      expect(workflows[0].content).toBe(bpmnXml);
      expect(mockStagingIntegration.loadFile).toHaveBeenCalledWith('input/process/workflow.bpmn');
    });

    it('should handle multiple workflows', async () => {
      mockStagingIntegration.loadFile.mockResolvedValue('<definitions></definitions>');
      component.addSource({ relativeUrl: 'input/process/workflow1.bpmn' });
      component.addSource({ relativeUrl: 'input/process/workflow2.bpmn' });

      const workflows = await component.retrieveAll();
      
      expect(workflows).toHaveLength(2);
    });
  });

  describe('retrieveById', () => {
    it('should retrieve workflow by relative URL', async () => {
      const bpmnXml = '<definitions></definitions>';
      mockStagingIntegration.loadFile.mockResolvedValue(bpmnXml);
      component.addSource({ relativeUrl: 'input/process/target.bpmn' });

      const workflow = await component.retrieveById('input/process/target.bpmn');
      
      expect(workflow).toBeDefined();
      expect(workflow?.content).toBe(bpmnXml);
    });

    it('should return null for non-existent workflow', async () => {
      const workflow = await component.retrieveById('non-existent.bpmn');
      expect(workflow).toBeNull();
    });
  });

  describe('save', () => {
    it('should save BPMN workflow', async () => {
      const bpmnXml = '<definitions></definitions>';
      const options = { saveType: 'file' as const, path: 'input/process/new-workflow.bpmn' };

      await component.save(bpmnXml, options);

      expect(mockStagingIntegration.saveFile).toHaveBeenCalledWith('input/process/new-workflow.bpmn', bpmnXml);
    });

    it('should add source after successful save', async () => {
      const bpmnXml = '<definitions></definitions>';
      const options = { saveType: 'file' as const, path: 'input/process/workflow.bpmn' };

      await component.save(bpmnXml, options);

      const sources = component.getSources();
      expect(sources).toContainEqual({ relativeUrl: 'input/process/workflow.bpmn' });
    });
  });

  describe('validate', () => {
    it('should validate BPMN XML structure', async () => {
      const validBpmn = '<?xml version="1.0" encoding="UTF-8"?><definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"></definitions>';
      
      const result = await component.validate(validBpmn);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid XML', async () => {
      const invalidBpmn = 'not valid xml';
      
      const result = await component.validate(invalidBpmn);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
