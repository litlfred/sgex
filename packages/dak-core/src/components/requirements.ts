/**
 * Requirements Component Object
 * Handles retrieval, saving, and validation of Requirements instances
 */

import {
  Requirements,
  RequirementsSource,
  DAKComponentType,
  DAKRepository,
  DAKValidationResult
} from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';

export class RequirementsComponent extends BaseDAKComponentObject<
  Requirements,
  RequirementsSource
> {
  constructor(
    repository: DAKRepository,
    sourceResolver: SourceResolutionService,
    stagingGroundService: any,
    onSourcesChanged?: (sources: RequirementsSource[]) => Promise<void>
  ) {
    super(
      DAKComponentType.REQUIREMENTS,
      repository,
      sourceResolver,
      stagingGroundService,
      onSourcesChanged
    );
  }

  /**
   * Determine file path for Requirements
   * Requirements are typically stored as markdown files
   */
  protected async determineFilePath(data: Requirements): Promise<string> {
    const requirementsData = data as any;
    const id = requirementsData.id || 'requirements';
    return `input/requirements/${id}.md`;
  }

  /**
   * Serialize Requirements to markdown format
   */
  protected serializeToFile(data: Requirements): string {
    const requirementsData = data as any;
    
    // If markdown content already exists, return it
    if (requirementsData.markdown) {
      return requirementsData.markdown;
    }
    
    // Otherwise create basic markdown structure
    const title = requirementsData.title || 'Functional and Non-Functional Requirements';
    
    let markdown = `# ${title}\n\n`;
    
    // Add functional requirements
    if (requirementsData.functional && Array.isArray(requirementsData.functional)) {
      markdown += `## Functional Requirements\n\n`;
      requirementsData.functional.forEach((req: any, index: number) => {
        markdown += `### FR${index + 1}: ${req.title || req.name}\n\n`;
        if (req.description) {
          markdown += `${req.description}\n\n`;
        }
      });
    }
    
    // Add non-functional requirements
    if (requirementsData.nonFunctional && Array.isArray(requirementsData.nonFunctional)) {
      markdown += `## Non-Functional Requirements\n\n`;
      requirementsData.nonFunctional.forEach((req: any, index: number) => {
        markdown += `### NFR${index + 1}: ${req.title || req.name}\n\n`;
        if (req.description) {
          markdown += `${req.description}\n\n`;
        }
      });
    }
    
    return markdown;
  }

  /**
   * Parse Requirements from markdown content
   */
  protected parseFromFile(content: string): Requirements {
    const requirementsData: any = {
      requirements: [],
      functional: [],
      nonFunctional: []
    };

    const lines = content.split('\n');
    let currentSection = '';
    let currentRequirement: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        requirementsData.title = trimmed.substring(2);
      } else if (trimmed.startsWith('## Functional Requirements')) {
        currentSection = 'functional';
      } else if (trimmed.startsWith('## Non-Functional Requirements')) {
        currentSection = 'nonFunctional';
      } else if (trimmed.startsWith('### FR') || trimmed.startsWith('### NFR')) {
        if (currentRequirement) {
          if (currentSection === 'functional') {
            requirementsData.functional.push(currentRequirement);
          } else if (currentSection === 'nonFunctional') {
            requirementsData.nonFunctional.push(currentRequirement);
          }
        }
        currentRequirement = {
          title: trimmed.substring(trimmed.indexOf(':') + 1).trim(),
          description: ''
        };
      } else if (trimmed && currentRequirement) {
        currentRequirement.description += trimmed + ' ';
      }
    }

    // Add last requirement
    if (currentRequirement) {
      if (currentSection === 'functional') {
        requirementsData.functional.push(currentRequirement);
      } else if (currentSection === 'nonFunctional') {
        requirementsData.nonFunctional.push(currentRequirement);
      }
    }

    // Store original markdown
    requirementsData.markdown = content;

    return requirementsData;
  }

  /**
   * Validate Requirements instance
   */
  async validate(data: Requirements): Promise<DAKValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    const requirementsData = data as any;

    // Check for ID
    if (!requirementsData.id) {
      warnings.push({
        code: 'MISSING_ID',
        message: 'Requirements should have an id'
      });
    }

    // Check for requirements
    const hasFunctional = requirementsData.functional && requirementsData.functional.length > 0;
    const hasNonFunctional = requirementsData.nonFunctional && requirementsData.nonFunctional.length > 0;
    
    if (!hasFunctional && !hasNonFunctional) {
      warnings.push({
        code: 'NO_REQUIREMENTS',
        message: 'Requirements should contain at least one functional or non-functional requirement'
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
