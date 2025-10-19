/**
 * Health Interventions Component Object
 * Handles retrieval, saving, and validation of Health Interventions instances
 */

import {
  HealthInterventions,
  HealthInterventionsSource,
  DAKComponentType,
  DAKRepository,
  DAKValidationResult
} from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';

export class HealthInterventionsComponent extends BaseDAKComponentObject<
  HealthInterventions,
  HealthInterventionsSource
> {
  constructor(
    repository: DAKRepository,
    sourceResolver: SourceResolutionService,
    stagingGroundService: any,
    onSourcesChanged?: (sources: HealthInterventionsSource[]) => Promise<void>
  ) {
    super(
      DAKComponentType.HEALTH_INTERVENTIONS,
      repository,
      sourceResolver,
      stagingGroundService,
      onSourcesChanged
    );
  }

  /**
   * Determine file path for Health Interventions
   * Health interventions are typically stored in markdown or JSON format
   */
  protected async determineFilePath(data: HealthInterventions): Promise<string> {
    const interventionData = data as any;
    const id = interventionData.id || 'health-interventions';
    return `input/pagecontent/l2-dak-${id}.md`;
  }

  /**
   * Serialize Health Interventions to markdown format
   */
  protected serializeToFile(data: HealthInterventions): string {
    const interventionData = data as any;
    
    // If markdown content already exists, return it
    if (interventionData.markdown) {
      return interventionData.markdown;
    }
    
    // Otherwise create basic markdown structure
    const title = interventionData.title || 'Health Interventions';
    const description = interventionData.description || '';
    
    let markdown = `# ${title}\n\n`;
    if (description) {
      markdown += `${description}\n\n`;
    }
    
    // Add interventions list if available
    if (interventionData.interventions && Array.isArray(interventionData.interventions)) {
      markdown += `## Interventions\n\n`;
      interventionData.interventions.forEach((intervention: any) => {
        markdown += `- ${intervention.name || intervention.title || 'Intervention'}\n`;
      });
    }
    
    return markdown;
  }

  /**
   * Parse Health Interventions from markdown content
   */
  protected parseFromFile(content: string): HealthInterventions {
    const interventionData: any = {
      interventions: []
    };

    const lines = content.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        interventionData.title = trimmed.substring(2);
      } else if (trimmed.startsWith('## ')) {
        currentSection = trimmed.substring(3).toLowerCase();
      } else if (trimmed.startsWith('- ') && currentSection === 'interventions') {
        interventionData.interventions.push({
          name: trimmed.substring(2)
        });
      }
    }

    // Store original markdown
    interventionData.markdown = content;

    return interventionData;
  }

  /**
   * Validate Health Interventions instance
   */
  async validate(data: HealthInterventions): Promise<DAKValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    const interventionData = data as any;

    // Check for ID
    if (!interventionData.id) {
      warnings.push({
        code: 'MISSING_ID',
        message: 'Health Interventions should have an id'
      });
    }

    // Check for title or content
    if (!interventionData.title && !interventionData.markdown) {
      warnings.push({
        code: 'MISSING_CONTENT',
        message: 'Health Interventions should have a title or markdown content'
      });
    }

    // Check for interventions array
    if (!interventionData.interventions || interventionData.interventions.length === 0) {
      warnings.push({
        code: 'NO_INTERVENTIONS',
        message: 'Health Interventions should contain at least one intervention'
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
