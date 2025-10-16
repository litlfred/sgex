/**
 * Generic Persona Component Object
 * Handles retrieval, saving, and validation of Generic Persona instances
 */

import {
  GenericPersona,
  GenericPersonaSource,
  DAKComponentType,
  DAKRepository,
  DAKValidationResult
} from '../types';
import { BaseDAKComponentObject } from '../dakComponentObject';
import { SourceResolutionService } from '../sourceResolution';

export class GenericPersonaComponent extends BaseDAKComponentObject<
  GenericPersona,
  GenericPersonaSource
> {
  constructor(
    repository: DAKRepository,
    sourceResolver: SourceResolutionService,
    stagingGroundService: any,
    onSourcesChanged?: (sources: GenericPersonaSource[]) => Promise<void>
  ) {
    super(
      DAKComponentType.PERSONAS,
      repository,
      sourceResolver,
      stagingGroundService,
      onSourcesChanged
    );
  }

  /**
   * Determine file path for Generic Persona
   * Personas are typically stored as FSH actor definitions
   */
  protected async determineFilePath(data: GenericPersona): Promise<string> {
    const id = (data as any).id || 'new-persona';
    return `input/fsh/actors/${id}.fsh`;
  }

  /**
   * Serialize Generic Persona to FSH format
   */
  protected serializeToFile(data: GenericPersona): string {
    // Basic FSH serialization for Generic Persona
    // This is a simplified version - real implementation would use proper FSH generation
    const personaData = data as any;
    const id = personaData.id || 'GenericPersona';
    const title = personaData.title || personaData.name || id;
    const description = personaData.description || '';

    let fsh = `Instance: ${id}\n`;
    fsh += `InstanceOf: GenericPersona\n`;
    fsh += `Title: "${title}"\n`;
    fsh += `Description: "${description}"\n`;
    fsh += `Usage: #definition\n`;
    fsh += `* code = #generic-persona\n`;
    
    if (personaData.name) {
      fsh += `* name = "${personaData.name}"\n`;
    }
    
    return fsh;
  }

  /**
   * Parse Generic Persona from FSH content
   */
  protected parseFromFile(content: string): GenericPersona {
    // Basic FSH parsing for Generic Persona
    // This is a simplified version - real implementation would use proper FSH parser
    const lines = content.split('\n');
    const persona: any = {
      personas: []
    };

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('Instance:')) {
        persona.id = trimmed.split(':')[1]?.trim();
      } else if (trimmed.startsWith('Title:')) {
        persona.title = trimmed.split(':')[1]?.trim().replace(/"/g, '');
      } else if (trimmed.startsWith('Description:')) {
        persona.description = trimmed.split(':')[1]?.trim().replace(/"/g, '');
      } else if (trimmed.includes('* name =')) {
        persona.name = trimmed.split('=')[1]?.trim().replace(/"/g, '');
      }
    }

    return persona;
  }

  /**
   * Validate Generic Persona instance
   */
  async validate(data: GenericPersona): Promise<DAKValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    const personaData = data as any;

    // Check for ID
    if (!personaData.id) {
      warnings.push({
        code: 'MISSING_ID',
        message: 'Generic Persona should have an id'
      });
    }

    // Check for name or title
    if (!personaData.name && !personaData.title) {
      errors.push({
        code: 'MISSING_NAME',
        message: 'Generic Persona must have either a name or title'
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
