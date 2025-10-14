/**
 * Program Indicator Component Object
 * Handles retrieval, saving, and validation of Program Indicator instances
 */
import { ProgramIndicator, ProgramIndicatorSource, DAKRepository, DAKValidationResult } from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';
export declare class ProgramIndicatorComponent extends BaseDAKComponentObject<ProgramIndicator, ProgramIndicatorSource> {
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, onSourcesChanged?: (sources: ProgramIndicatorSource[]) => Promise<void>);
    /**
     * Determine file path for Program Indicator
     * Indicators are typically stored as JSON or FSH files
     */
    protected determineFilePath(data: ProgramIndicator): Promise<string>;
    /**
     * Serialize Program Indicator to JSON format
     */
    protected serializeToFile(data: ProgramIndicator): string;
    /**
     * Parse Program Indicator from JSON content
     */
    protected parseFromFile(content: string): ProgramIndicator;
    /**
     * Validate Program Indicator instance
     */
    validate(data: ProgramIndicator): Promise<DAKValidationResult>;
}
