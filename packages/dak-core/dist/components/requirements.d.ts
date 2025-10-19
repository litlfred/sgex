/**
 * Requirements Component Object
 * Handles retrieval, saving, and validation of Requirements instances
 */
import { Requirements, RequirementsSource, DAKRepository, DAKValidationResult } from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';
export declare class RequirementsComponent extends BaseDAKComponentObject<Requirements, RequirementsSource> {
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, onSourcesChanged?: (sources: RequirementsSource[]) => Promise<void>);
    /**
     * Determine file path for Requirements
     * Requirements are typically stored as markdown files
     */
    protected determineFilePath(data: Requirements): Promise<string>;
    /**
     * Serialize Requirements to markdown format
     */
    protected serializeToFile(data: Requirements): string;
    /**
     * Parse Requirements from markdown content
     */
    protected parseFromFile(content: string): Requirements;
    /**
     * Validate Requirements instance
     */
    validate(data: Requirements): Promise<DAKValidationResult>;
}
