/**
 * Decision Support Logic Component Object
 * Handles retrieval, saving, and validation of Decision Support Logic instances (DMN)
 */
import { DecisionSupportLogic, DecisionSupportLogicSource, DAKRepository, DAKValidationResult } from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';
export declare class DecisionSupportLogicComponent extends BaseDAKComponentObject<DecisionSupportLogic, DecisionSupportLogicSource> {
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, onSourcesChanged?: (sources: DecisionSupportLogicSource[]) => Promise<void>);
    /**
     * Determine file path for Decision Support Logic
     * Decision logic is typically stored as DMN XML files
     */
    protected determineFilePath(data: DecisionSupportLogic): Promise<string>;
    /**
     * Serialize Decision Support Logic to DMN XML format
     */
    protected serializeToFile(data: DecisionSupportLogic): string;
    /**
     * Parse Decision Support Logic from DMN XML content
     */
    protected parseFromFile(content: string): DecisionSupportLogic;
    /**
     * Validate Decision Support Logic instance
     */
    validate(data: DecisionSupportLogic): Promise<DAKValidationResult>;
}
