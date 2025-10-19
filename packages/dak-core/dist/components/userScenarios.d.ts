/**
 * User Scenario Component Object
 * Handles retrieval, saving, and validation of User Scenario instances
 */
import { UserScenario, UserScenarioSource, DAKRepository, DAKValidationResult } from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';
export declare class UserScenarioComponent extends BaseDAKComponentObject<UserScenario, UserScenarioSource> {
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, onSourcesChanged?: (sources: UserScenarioSource[]) => Promise<void>);
    /**
     * Determine file path for User Scenario
     * User scenarios are typically stored as markdown files
     */
    protected determineFilePath(data: UserScenario): Promise<string>;
    /**
     * Serialize User Scenario to markdown format
     */
    protected serializeToFile(data: UserScenario): string;
    /**
     * Parse User Scenario from markdown content
     */
    protected parseFromFile(content: string): UserScenario;
    /**
     * Validate User Scenario instance
     */
    validate(data: UserScenario): Promise<DAKValidationResult>;
}
