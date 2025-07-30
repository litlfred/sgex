/**
 * Actor Definition Service
 * 
 * Manages actor definitions based on FHIR Persona logical model.
 * Handles conversion to FSH (FHIR Shorthand) format and integration with staging ground.
 */

import stagingGroundService from './stagingGroundService';

class ActorDefinitionService {
  constructor() {
    this.actorSchema = null;
    this.loadSchema();
  }

  /**
   * Load the actor definition JSON schema
   */
  async loadSchema() {
    try {
      const response = await fetch('/schemas/actor-definition.json');
      this.actorSchema = await response.json();
    } catch (error) {
      console.warn('Could not load actor definition schema:', error);
    }
  }

  /**
   * Convert actor definition to FSH format
   */
  generateFSH(actorDefinition) {
    if (!actorDefinition || !actorDefinition.id) {
      throw new Error('Invalid actor definition: missing required fields');
    }

    const fsh = [];
    
    // Profile header
    fsh.push(`Profile: ${actorDefinition.id}`);
    fsh.push(`Parent: ActorDefinition`);
    fsh.push(`Id: ${actorDefinition.id}`);
    fsh.push(`Title: "${this.escapeFSHString(actorDefinition.name)}"`);
    fsh.push(`Description: "${this.escapeFSHString(actorDefinition.description)}"`);
    
    if (actorDefinition.metadata?.status) {
      fsh.push(`* status = #${actorDefinition.metadata.status}`);
    }
    
    // Actor type
    if (actorDefinition.type) {
      fsh.push(`* type = #${actorDefinition.type}`);
    }
    
    // Roles
    if (actorDefinition.roles && actorDefinition.roles.length > 0) {
      actorDefinition.roles.forEach((role, index) => {
        if (role.system) {
          fsh.push(`* role[${index}].coding.system = "${role.system}"`);
        }
        fsh.push(`* role[${index}].coding.code = #${role.code}`);
        fsh.push(`* role[${index}].coding.display = "${this.escapeFSHString(role.display)}"`);
      });
    }
    
    // Qualifications
    if (actorDefinition.qualifications && actorDefinition.qualifications.length > 0) {
      actorDefinition.qualifications.forEach((qual, index) => {
        fsh.push(`* qualification[${index}].code.coding.code = #${qual.code}`);
        fsh.push(`* qualification[${index}].code.coding.display = "${this.escapeFSHString(qual.display)}"`);
        if (qual.issuer) {
          fsh.push(`* qualification[${index}].issuer.display = "${this.escapeFSHString(qual.issuer)}"`);
        }
      });
    }
    
    // Specialties
    if (actorDefinition.specialties && actorDefinition.specialties.length > 0) {
      actorDefinition.specialties.forEach((specialty, index) => {
        if (specialty.system) {
          fsh.push(`* specialty[${index}].coding.system = "${specialty.system}"`);
        }
        fsh.push(`* specialty[${index}].coding.code = #${specialty.code}`);
        fsh.push(`* specialty[${index}].coding.display = "${this.escapeFSHString(specialty.display)}"`);
      });
    }
    
    // Location context
    if (actorDefinition.location) {
      if (actorDefinition.location.type) {
        fsh.push(`* location.type = #${actorDefinition.location.type}`);
      }
      if (actorDefinition.location.description) {
        fsh.push(`* location.description = "${this.escapeFSHString(actorDefinition.location.description)}"`);
      }
    }
    
    // Access level as extension
    if (actorDefinition.accessLevel) {
      fsh.push(`* extension[accessLevel].valueCode = #${actorDefinition.accessLevel}`);
    }
    
    // Interactions as extensions
    if (actorDefinition.interactions && actorDefinition.interactions.length > 0) {
      actorDefinition.interactions.forEach((interaction, index) => {
        fsh.push(`* extension[interaction][${index}].extension[type].valueCode = #${interaction.type}`);
        fsh.push(`* extension[interaction][${index}].extension[target].valueString = "${this.escapeFSHString(interaction.target)}"`);
        if (interaction.description) {
          fsh.push(`* extension[interaction][${index}].extension[description].valueString = "${this.escapeFSHString(interaction.description)}"`);
        }
      });
    }
    
    // Add metadata
    if (actorDefinition.metadata) {
      if (actorDefinition.metadata.version) {
        fsh.push(`* version = "${actorDefinition.metadata.version}"`);
      }
      if (actorDefinition.metadata.publisher) {
        fsh.push(`* publisher = "${this.escapeFSHString(actorDefinition.metadata.publisher)}"`);
      }
      if (actorDefinition.metadata.contact && actorDefinition.metadata.contact.length > 0) {
        actorDefinition.metadata.contact.forEach((contact, index) => {
          if (contact.name) {
            fsh.push(`* contact[${index}].name = "${this.escapeFSHString(contact.name)}"`);
          }
          if (contact.email) {
            fsh.push(`* contact[${index}].telecom.system = #email`);
            fsh.push(`* contact[${index}].telecom.value = "${contact.email}"`);
          }
        });
      }
    }
    
    return fsh.join('\n');
  }

  /**
   * Escape special characters in FSH strings
   */
  escapeFSHString(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  }

  /**
   * Parse FSH content back to actor definition (basic implementation)
   */
  parseFSH(fshContent) {
    // This is a simplified parser - a full implementation would need a proper FSH parser
    const lines = fshContent.split('\n').map(line => line.trim()).filter(line => line);
    const actorDefinition = {
      roles: [],
      qualifications: [],
      specialties: [],
      interactions: [],
      metadata: {}
    };

    for (const line of lines) {
      if (line.startsWith('Profile:')) {
        actorDefinition.id = line.split(':')[1].trim();
      } else if (line.startsWith('Id:')) {
        actorDefinition.id = line.split(':')[1].trim();
      } else if (line.startsWith('Title:')) {
        actorDefinition.name = line.split(':')[1].trim().replace(/"/g, '');
      } else if (line.startsWith('Description:')) {
        actorDefinition.description = line.split(':')[1].trim().replace(/"/g, '');
      } else if (line.includes('type = #')) {
        actorDefinition.type = line.split('#')[1].trim();
      }
      // Add more parsing logic as needed
    }

    return actorDefinition;
  }

  /**
   * Validate actor definition against schema
   */
  validateActorDefinition(actorDefinition) {
    const errors = [];
    
    // Basic validation
    if (!actorDefinition.id || !actorDefinition.id.match(/^[a-zA-Z][a-zA-Z0-9_-]*$/)) {
      errors.push('ID must start with a letter and contain only letters, numbers, underscores, and hyphens');
    }
    
    if (!actorDefinition.name || actorDefinition.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!actorDefinition.description || actorDefinition.description.trim().length === 0) {
      errors.push('Description is required');
    }
    
    if (!actorDefinition.type) {
      errors.push('Actor type is required');
    }
    
    if (!actorDefinition.roles || actorDefinition.roles.length === 0) {
      errors.push('At least one role is required');
    } else {
      actorDefinition.roles.forEach((role, index) => {
        if (!role.code || !role.display) {
          errors.push(`Role ${index + 1} must have both code and display name`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Save actor definition to staging ground as FSH
   */
  async saveToStagingGround(actorDefinition) {
    try {
      // Validate first
      const validation = this.validateActorDefinition(actorDefinition);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate FSH content
      const fshContent = this.generateFSH(actorDefinition);
      
      // Create file path in staging ground structure
      const filePath = `input/fsh/actors/${actorDefinition.id}.fsh`;
      
      // Save to staging ground
      const success = stagingGroundService.updateFile(filePath, fshContent, {
        type: 'actor-definition',
        actorId: actorDefinition.id,
        actorName: actorDefinition.name,
        lastModified: Date.now(),
        source: 'actor-editor'
      });
      
      if (!success) {
        throw new Error('Failed to save to staging ground');
      }
      
      return {
        success: true,
        filePath,
        content: fshContent
      };
      
    } catch (error) {
      console.error('Error saving actor definition:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load actor definition from staging ground
   */
  getFromStagingGround(actorId) {
    try {
      const stagingGround = stagingGroundService.getStagingGround();
      const filePath = `input/fsh/actors/${actorId}.fsh`;
      
      const file = stagingGround.files.find(f => f.path === filePath);
      if (!file) {
        return null;
      }
      
      // Parse FSH back to actor definition
      const actorDefinition = this.parseFSH(file.content);
      
      return {
        actorDefinition,
        metadata: file.metadata,
        lastModified: file.timestamp
      };
      
    } catch (error) {
      console.error('Error loading actor definition from staging ground:', error);
      return null;
    }
  }

  /**
   * List all actor definitions in staging ground
   */
  listStagedActors() {
    try {
      const stagingGround = stagingGroundService.getStagingGround();
      
      return stagingGround.files
        .filter(file => 
          file.path.startsWith('input/fsh/actors/') && 
          file.path.endsWith('.fsh') &&
          file.metadata?.type === 'actor-definition'
        )
        .map(file => ({
          id: file.metadata?.actorId || file.path.split('/').pop().replace('.fsh', ''),
          name: file.metadata?.actorName || 'Unknown Actor',
          filePath: file.path,
          lastModified: file.timestamp,
          metadata: file.metadata
        }))
        .sort((a, b) => b.lastModified - a.lastModified);
        
    } catch (error) {
      console.error('Error listing staged actors:', error);
      return [];
    }
  }

  /**
   * Remove actor definition from staging ground
   */
  removeFromStagingGround(actorId) {
    try {
      const filePath = `input/fsh/actors/${actorId}.fsh`;
      return stagingGroundService.removeFile(filePath);
    } catch (error) {
      console.error('Error removing actor definition:', error);
      return false;
    }
  }

  /**
   * Create a new empty actor definition with defaults
   */
  createEmptyActorDefinition() {
    return {
      id: '',
      name: '',
      description: '',
      type: 'person',
      roles: [
        {
          code: '',
          display: '',
          system: 'http://snomed.info/sct'
        }
      ],
      qualifications: [],
      specialties: [],
      location: {
        type: 'facility',
        description: ''
      },
      accessLevel: 'standard',
      interactions: [],
      constraints: {
        availability: '',
        jurisdiction: '',
        limitations: []
      },
      metadata: {
        version: '1.0.0',
        status: 'draft',
        publisher: '',
        contact: [],
        tags: []
      }
    };
  }

  /**
   * Get predefined actor templates
   */
  getActorTemplates() {
    return [
      {
        id: 'clinician-template',
        name: 'Healthcare Clinician',
        description: 'A qualified healthcare practitioner who provides direct patient care',
        type: 'practitioner',
        roles: [
          {
            code: '158965000',
            display: 'Medical practitioner',
            system: 'http://snomed.info/sct'
          }
        ],
        location: {
          type: 'facility',
          description: 'Healthcare facility or clinic'
        },
        accessLevel: 'standard'
      },
      {
        id: 'nurse-template',
        name: 'Registered Nurse',
        description: 'Licensed nursing professional providing patient care and health education',
        type: 'practitioner',
        roles: [
          {
            code: '224535009',
            display: 'Registered nurse',
            system: 'http://snomed.info/sct'
          }
        ],
        location: {
          type: 'facility',
          description: 'Hospital ward, clinic, or community health center'
        },
        accessLevel: 'standard'
      },
      {
        id: 'patient-template',
        name: 'Patient',
        description: 'Individual receiving healthcare services',
        type: 'patient',
        roles: [
          {
            code: '116154003',
            display: 'Patient',
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