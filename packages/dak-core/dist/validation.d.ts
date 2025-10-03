/**
 * DAK Validation Service
 * Core business logic for validating WHO SMART Guidelines DAK repositories and components
 */
import { DAK, DAKValidationResult, DAKComponentType } from './types';
export declare class DAKValidationService {
    private ajv;
    private dakSchema;
    constructor();
    /**
     * Load the WHO SMART Guidelines DAK JSON Schema
     */
    private loadDAKSchema;
    /**
     * Validate if a repository is a valid WHO SMART Guidelines DAK
     * Based on presence and structure of sushi-config.yaml
     */
    validateDAKRepository(repositoryPath: string): Promise<DAKValidationResult>;
    /**
     * Validate a DAK object against the WHO SMART Guidelines DAK schema
     */
    validateDAKObject(dak: DAK): DAKValidationResult;
    /**
     * Extract DAK metadata from sushi-config.yaml
     */
    extractDAKMetadata(repositoryPath: string): any;
    /**
     * Get expected component directories for WHO SMART Guidelines DAK
     */
    private getExpectedComponentDirectories;
    /**
     * Validate DAK component file
     */
    validateComponentFile(filePath: string, componentType: DAKComponentType): DAKValidationResult;
    /**
     * Validate BPMN file basic structure
     */
    private validateBPMNFile;
    /**
     * Validate DMN file basic structure
     */
    private validateDMNFile;
    /**
     * Validate FHIR profile file basic structure
     */
    private validateFHIRProfileFile;
}
