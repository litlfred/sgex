/**
 * Test Scenario Component Object
 * Handles retrieval, saving, and validation of Test Scenario instances
 */

import {
  TestScenario,
  TestScenarioSource,
  DAKComponentType,
  DAKRepository,
  DAKValidationResult
} from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';

export class TestScenarioComponent extends BaseDAKComponentObject<
  TestScenario,
  TestScenarioSource
> {
  constructor(
    repository: DAKRepository,
    sourceResolver: SourceResolutionService,
    stagingGroundService: any,
    onSourcesChanged?: (sources: TestScenarioSource[]) => Promise<void>
  ) {
    super(
      DAKComponentType.TEST_SCENARIOS,
      repository,
      sourceResolver,
      stagingGroundService,
      onSourcesChanged
    );
  }

  /**
   * Determine file path for Test Scenario
   * Test scenarios are typically stored as JSON or FSH files
   */
  protected async determineFilePath(data: TestScenario): Promise<string> {
    const scenarioData = data as any;
    const id = scenarioData.id || 'new-test-scenario';
    return `input/tests/${id}.json`;
  }

  /**
   * Serialize Test Scenario to JSON format
   */
  protected serializeToFile(data: TestScenario): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Parse Test Scenario from JSON content
   */
  protected parseFromFile(content: string): TestScenario {
    return JSON.parse(content);
  }

  /**
   * Validate Test Scenario instance
   */
  async validate(data: TestScenario): Promise<DAKValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    const scenarioData = data as any;

    // Check for ID
    if (!scenarioData.id) {
      warnings.push({
        code: 'MISSING_ID',
        message: 'Test Scenario should have an id'
      });
    }

    // Check for title or name
    if (!scenarioData.title && !scenarioData.name) {
      errors.push({
        code: 'MISSING_TITLE',
        message: 'Test Scenario must have a title or name'
      });
    }

    // Check for test cases
    if (!scenarioData.testCases && !scenarioData.scenarios) {
      warnings.push({
        code: 'NO_TEST_CASES',
        message: 'Test Scenario should contain at least one test case'
      });
    }

    // Check for description
    if (!scenarioData.description) {
      warnings.push({
        code: 'MISSING_DESCRIPTION',
        message: 'Test Scenario should have a description'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date()
    };
  }
}
