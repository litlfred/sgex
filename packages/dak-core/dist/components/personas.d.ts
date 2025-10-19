/**
 * Generic Persona Component Object
 * Handles retrieval, saving, and validation of Generic Persona instances
 */
import { GenericPersona, GenericPersonaSource, DAKRepository, DAKValidationResult } from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';
export declare class GenericPersonaComponent extends BaseDAKComponentObject<GenericPersona, GenericPersonaSource> {
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, onSourcesChanged?: (sources: GenericPersonaSource[]) => Promise<void>);
    /**
     * Determine file path for Generic Persona
     * Personas are typically stored as FSH actor definitions
     */
    protected determineFilePath(data: GenericPersona): Promise<string>;
    /**
     * Serialize Generic Persona to FSH format
     */
    protected serializeToFile(data: GenericPersona): string;
    /**
     * Parse Generic Persona from FSH content
     */
    protected parseFromFile(content: string): GenericPersona;
    /**
     * Validate Generic Persona instance
     */
    validate(data: GenericPersona): Promise<DAKValidationResult>;
}
