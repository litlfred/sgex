/**
 * Business Process Workflow Component Object
 * Handles retrieval, saving, and validation of Business Process instances (BPMN)
 */
import { BusinessProcessWorkflow, BusinessProcessWorkflowSource, DAKRepository, DAKValidationResult } from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';
export declare class BusinessProcessWorkflowComponent extends BaseDAKComponentObject<BusinessProcessWorkflow, BusinessProcessWorkflowSource> {
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, onSourcesChanged?: (sources: BusinessProcessWorkflowSource[]) => Promise<void>);
    /**
     * Determine file path for Business Process
     * Business processes are stored as BPMN XML files
     */
    protected determineFilePath(data: BusinessProcessWorkflow): Promise<string>;
    /**
     * Serialize Business Process to BPMN XML format
     */
    protected serializeToFile(data: BusinessProcessWorkflow): string;
    /**
     * Parse Business Process from BPMN XML content
     */
    protected parseFromFile(content: string): BusinessProcessWorkflow;
    /**
     * Validate Business Process instance
     */
    validate(data: BusinessProcessWorkflow): Promise<DAKValidationResult>;
}
