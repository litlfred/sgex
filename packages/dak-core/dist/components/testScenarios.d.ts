/**
 * Test Scenario Component Object
 * Handles retrieval, saving, and validation of Test Scenario instances
 */
import { TestScenario, TestScenarioSource, DAKRepository, DAKValidationResult } from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';
export declare class TestScenarioComponent extends BaseDAKComponentObject<TestScenario, TestScenarioSource> {
    constructor(repository: DAKRepository, sourceResolver: SourceResolutionService, stagingGroundService: any, onSourcesChanged?: (sources: TestScenarioSource[]) => Promise<void>);
    /**
     * Determine file path for Test Scenario
     * Test scenarios are typically stored as JSON or FSH files
     */
    protected determineFilePath(data: TestScenario): Promise<string>;
    /**
     * Serialize Test Scenario to JSON format
     */
    protected serializeToFile(data: TestScenario): string;
    /**
     * Parse Test Scenario from JSON content
     */
    protected parseFromFile(content: string): TestScenario;
    /**
     * Validate Test Scenario instance
     */
    validate(data: TestScenario): Promise<DAKValidationResult>;
}
