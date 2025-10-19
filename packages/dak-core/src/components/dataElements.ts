/**
 * Core Data Element Component Object
 * Handles retrieval, saving, and validation of Core Data Element instances
 */

import {
  CoreDataElement,
  CoreDataElementSource,
  DAKComponentType,
  DAKRepository,
  DAKValidationResult
} from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';

export class CoreDataElementComponent extends BaseDAKComponentObject<
  CoreDataElement,
  CoreDataElementSource
> {
  constructor(
    repository: DAKRepository,
    sourceResolver: SourceResolutionService,
    stagingGroundService: any,
    onSourcesChanged?: (sources: CoreDataElementSource[]) => Promise<void>
  ) {
    super(
      DAKComponentType.DATA_ELEMENTS,
      repository,
      sourceResolver,
      stagingGroundService,
      onSourcesChanged
    );
  }

  /**
   * Determine file path for Core Data Element
   * Core data elements reference FHIR resources by canonical URI
   * For inline storage, we use a JSON format
   */
  protected async determineFilePath(data: CoreDataElement): Promise<string> {
    const id = data.id || 'new-data-element';
    return `input/vocabulary/${id}.json`;
  }

  /**
   * Serialize Core Data Element to JSON format
   */
  protected serializeToFile(data: CoreDataElement): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Parse Core Data Element from JSON content
   */
  protected parseFromFile(content: string): CoreDataElement {
    return JSON.parse(content);
  }

  /**
   * Validate Core Data Element instance
   */
  async validate(data: CoreDataElement): Promise<DAKValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Required fields validation
    if (!data.type) {
      errors.push({
        code: 'MISSING_TYPE',
        message: 'Core Data Element must have a type (valueset, codesystem, conceptmap, or logicalmodel)'
      });
    } else {
      // Validate type is one of the allowed values
      const validTypes = ['valueset', 'codesystem', 'conceptmap', 'logicalmodel'];
      if (!validTypes.includes(data.type)) {
        errors.push({
          code: 'INVALID_TYPE',
          message: `Invalid type: ${data.type}. Must be one of: ${validTypes.join(', ')}`
        });
      }
    }

    if (!data.canonical) {
      errors.push({
        code: 'MISSING_CANONICAL',
        message: 'Core Data Element must have a canonical URI'
      });
    } else {
      // Validate canonical is a valid URI
      try {
        new URL(data.canonical);
      } catch {
        errors.push({
          code: 'INVALID_CANONICAL',
          message: `Invalid canonical URI: ${data.canonical}`
        });
      }
    }

    // Optional fields warnings
    if (!data.id) {
      warnings.push({
        code: 'MISSING_ID',
        message: 'Core Data Element should have an id for better tracking'
      });
    }

    if (!data.description) {
      warnings.push({
        code: 'MISSING_DESCRIPTION',
        message: 'Core Data Element should have a description'
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
