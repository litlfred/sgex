/**
 * Program Indicator Component Object
 * Handles retrieval, saving, and validation of Program Indicator instances
 */

import {
  ProgramIndicator,
  ProgramIndicatorSource,
  DAKComponentType,
  DAKRepository,
  DAKValidationResult
} from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';

export class ProgramIndicatorComponent extends BaseDAKComponentObject<
  ProgramIndicator,
  ProgramIndicatorSource
> {
  constructor(
    repository: DAKRepository,
    sourceResolver: SourceResolutionService,
    stagingGroundService: any,
    onSourcesChanged?: (sources: ProgramIndicatorSource[]) => Promise<void>
  ) {
    super(
      DAKComponentType.INDICATORS,
      repository,
      sourceResolver,
      stagingGroundService,
      onSourcesChanged
    );
  }

  /**
   * Determine file path for Program Indicator
   * Indicators are typically stored as JSON or FSH files
   */
  protected async determineFilePath(data: ProgramIndicator): Promise<string> {
    const indicatorData = data as any;
    const id = indicatorData.id || 'new-indicator';
    return `input/indicators/${id}.json`;
  }

  /**
   * Serialize Program Indicator to JSON format
   */
  protected serializeToFile(data: ProgramIndicator): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Parse Program Indicator from JSON content
   */
  protected parseFromFile(content: string): ProgramIndicator {
    return JSON.parse(content);
  }

  /**
   * Validate Program Indicator instance
   */
  async validate(data: ProgramIndicator): Promise<DAKValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    const indicatorData = data as any;

    // Check for ID
    if (!indicatorData.id) {
      warnings.push({
        code: 'MISSING_ID',
        message: 'Program Indicator should have an id'
      });
    }

    // Check for name or title
    if (!indicatorData.name && !indicatorData.title) {
      errors.push({
        code: 'MISSING_NAME',
        message: 'Program Indicator must have a name or title'
      });
    }

    // Check for description
    if (!indicatorData.description) {
      warnings.push({
        code: 'MISSING_DESCRIPTION',
        message: 'Program Indicator should have a description'
      });
    }

    // Check for numerator/denominator (typical for indicators)
    if (!indicatorData.numerator && !indicatorData.denominator) {
      warnings.push({
        code: 'MISSING_CALCULATION',
        message: 'Program Indicator should define numerator and denominator'
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
