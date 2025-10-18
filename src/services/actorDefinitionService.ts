/**
 * Actor Definition Service
 * 
 * Manages actor definitions based on FHIR Persona logical model.
 * Handles conversion to FSH (FHIR Shorthand) format and integration with staging ground.
 * 
 * REFACTORED: Now uses @sgex/dak-core for business logic to reduce duplication
 * 
 * @module actorDefinitionService
 */

import stagingGroundService from './stagingGroundService';
import { ActorDefinitionCore, escapeFSHString, extractFSHMetadata } from '@sgex/dak-core/dist/browser';

/**
 * Actor role definition
 * @example { "code": "224571005", "display": "Nurse Practitioner", "system": "http://snomed.info/sct" }
 */
export interface ActorRole {
  /** SNOMED code */
  code: string;
  /** Display name */
  display: string;
  /** Code system */
  system: string;
}

/**
 * Actor location
 */
export interface ActorLocation {
  /** Location type */
  type: string;
  /** Location description */
  description: string;
}

/**
 * Actor metadata
 */
export interface ActorMetadata {
  /** Status */
  status?: string;
  /** Version */
  version?: string;
  /** Last updated */
  lastUpdated?: string;
}

/**
 * Actor definition
 * @example { "id": "nurse-practitioner", "name": "Nurse Practitioner", "type": "person" }
 */
export interface ActorDefinition {
  /** Actor ID */
  id: string;
  /** Actor name */
  name: string;
  /** Description */
  description: string;
  /** Actor type */
  type: 'person' | 'system' | 'organization';
  /** Roles */
  roles?: ActorRole[];
  /** Location */
  location?: ActorLocation;
  /** Access level */
  accessLevel?: string;
  /** Metadata */
  metadata?: ActorMetadata;
}

/**
 * Actor definition template
 */
export interface ActorTemplate extends ActorDefinition {
  /** Template ID */
  id: string;
}

/**
 * FSH metadata
 */
export interface FSHMetadata {
  /** Profile ID */
  profileId?: string;
  /** Title */
  title?: string;
  /** Description */
  description?: string;
}

/**
 * Actor Definition Service class
 * 
 * Manages actor definitions using FHIR Persona model.
 * 
 * @openapi
 * components:
 *   schemas:
 *     ActorDefinition:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - description
 *         - type
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [person, system, organization]
 */
class ActorDefinitionService {
  private actorSchema: any;
  private core: ActorDefinitionCore;

  constructor() {
    this.actorSchema = null;
    this.core = new ActorDefinitionCore();
    this.loadSchema();
  }

  /**
   * Load the actor definition JSON schema
   */
  async loadSchema(): Promise<void> {
    try {
      const response = await fetch(`${process.env.PUBLIC_URL || ''}/schemas/actor-definition.json`);
      this.actorSchema = await response.json();
    } catch (error) {
      console.warn('Could not load actor definition schema:', error);
    }
  }

  /**
   * Convert actor definition to FSH format
   * Delegates to @sgex/dak-core ActorDefinitionCore
   */
  generateFSH(actorDefinition: ActorDefinition): string {
    if (!actorDefinition || !actorDefinition.id) {
      throw new Error('Invalid actor definition: missing required fields');
    }

    const fsh: string[] = [];
    
    // Profile header
    fsh.push(`Profile: ${actorDefinition.id}`);
    fsh.push(`Parent: ActorDefinition`);
    fsh.push(`Id: ${actorDefinition.id}`);
    fsh.push(`Title: "${this.escapeFSHString(actorDefinition.name)}"`);
    fsh.push(`Description: "${this.escapeFSHString(actorDefinition.description)}"`);
    
    if (actorDefinition.metadata?.status) {
      fsh.push(`* status = #${actorDefinition.metadata.status}`);
    }
    
    // Type
    fsh.push(`* type = #${actorDefinition.type}`);
    
    // Roles
    if (actorDefinition.roles && actorDefinition.roles.length > 0) {
      actorDefinition.roles.forEach(role => {
        fsh.push(`* role = ${role.system}#${role.code} "${role.display}"`);
      });
    }
    
    return fsh.join('\n');
  }

  /**
   * Escape FSH string
   */
  escapeFSHString(str: string): string {
    if (!str) return '';
    return str.replace(/"/g, '\\"').replace(/\n/g, ' ');
  }

  /**
   * Extract FSH metadata from FSH content
   */
  extractFSHMetadata(fshContent: string): FSHMetadata {
    const metadata: FSHMetadata = {};
    
    const profileMatch = fshContent.match(/Profile:\s+(\S+)/);
    if (profileMatch) {
      metadata.profileId = profileMatch[1];
    }
    
    const titleMatch = fshContent.match(/Title:\s+"([^"]+)"/);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    }
    
    const descMatch = fshContent.match(/Description:\s+"([^"]+)"/);
    if (descMatch) {
      metadata.description = descMatch[1];
    }
    
    return metadata;
  }

  /**
   * Save actor definition to staging ground
   */
  async saveActorDefinition(actorDefinition: ActorDefinition, repository: any, branch: string): Promise<boolean> {
    try {
      const fshContent = this.generateFSH(actorDefinition);
      const filePath = `input/fsh/actors/${actorDefinition.id}.fsh`;
      
      return stagingGroundService.updateFile(filePath, fshContent, {
        actorId: actorDefinition.id,
        actorName: actorDefinition.name,
        type: 'actor-definition'
      });
    } catch (error) {
      console.error('Error saving actor definition:', error);
      throw error;
    }
  }

  /**
   * Load actor definition from FSH content
   */
  parseActorDefinition(fshContent: string): ActorDefinition | null {
    try {
      const metadata = this.extractFSHMetadata(fshContent);
      
      if (!metadata.profileId) {
        return null;
      }
      
      const actorDefinition: ActorDefinition = {
        id: metadata.profileId,
        name: metadata.title || metadata.profileId,
        description: metadata.description || '',
        type: 'person' // Default type
      };
      
      // Extract type
      const typeMatch = fshContent.match(/\*\s+type\s+=\s+#(\w+)/);
      if (typeMatch) {
        actorDefinition.type = typeMatch[1] as 'person' | 'system' | 'organization';
      }
      
      // Extract roles
      const roleMatches = Array.from(fshContent.matchAll(/\*\s+role\s+=\s+([^\s]+)#([^\s]+)\s+"([^"]+)"/g));
      const roles: ActorRole[] = [];
      for (const match of roleMatches) {
        roles.push({
          system: match[1],
          code: match[2],
          display: match[3]
        });
      }
      if (roles.length > 0) {
        actorDefinition.roles = roles;
      }
      
      return actorDefinition;
    } catch (error) {
      console.error('Error parsing actor definition:', error);
      return null;
    }
  }

  /**
   * Validate actor definition against schema
   */
  validateActorDefinition(actorDefinition: ActorDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!actorDefinition.id) {
      errors.push('Actor ID is required');
    }
    
    if (!actorDefinition.name) {
      errors.push('Actor name is required');
    }
    
    if (!actorDefinition.description) {
      errors.push('Actor description is required');
    }
    
    if (!['person', 'system', 'organization'].includes(actorDefinition.type)) {
      errors.push('Actor type must be person, system, or organization');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get JSON schema for actor definitions
   */
  getSchema(): any {
    return this.actorSchema;
  }

  /**
   * Get actor definition templates
   */
  getTemplates(): ActorTemplate[] {
    return [
      {
        id: 'practitioner-template',
        name: 'Healthcare Practitioner',
        description: 'Healthcare professional providing direct patient care',
        type: 'person',
        roles: [
          {
            code: '224571005',
            display: 'Nurse Practitioner',
            system: 'http://snomed.info/sct'
          }
        ],
        location: {
          type: 'facility',
          description: 'Any healthcare setting where patient receives care'
        },
        accessLevel: 'read-only'
      },
      {
        id: 'admin-template',
        name: 'Healthcare Administrator',
        description: 'Administrative staff managing healthcare operations and data',
        type: 'person',
        roles: [
          {
            code: '394738000',
            display: 'Other related persons',
            system: 'http://snomed.info/sct'
          }
        ],
        location: {
          type: 'facility',
          description: 'Administrative offices within healthcare organization'
        },
        accessLevel: 'administrative'
      }
    ];
  }
}

// Create singleton instance
const actorDefinitionService = new ActorDefinitionService();

export default actorDefinitionService;
