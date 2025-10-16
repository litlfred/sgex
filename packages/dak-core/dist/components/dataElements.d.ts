/**
 * Core Data Element Component Object
 * Handles retrieval, saving, and validation of Core Data Element instances
 */
import { CoreDataElement, CoreDataElementSource, DAKRepository, DAKValidationResult } from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';
export declare class CoreDataElementComponent extends BaseDAKComponentObject<CoreDataElement, CoreDataElementSource> {
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, onSourcesChanged?: (sources: CoreDataElementSource[]) => Promise<void>);
    /**
     * Determine file path for Core Data Element
     * Core data elements reference FHIR resources by canonical URI
     * For inline storage, we use a JSON format
     */
    protected determineFilePath(data: CoreDataElement): Promise<string>;
    /**
     * Serialize Core Data Element to JSON format
     */
    protected serializeToFile(data: CoreDataElement): string;
    /**
     * Parse Core Data Element from JSON content
     */
    protected parseFromFile(content: string): CoreDataElement;
    /**
     * Validate Core Data Element instance
     */
    validate(data: CoreDataElement): Promise<DAKValidationResult>;
}
