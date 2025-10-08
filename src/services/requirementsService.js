/**
 * Requirements Service
 * 
 * Manages functional and non-functional requirements based on WHO smart-base logical models.
 * Handles conversion to FSH (FHIR Shorthand) format and integration with staging ground.
 * 
 * Based on:
 * - FunctionalRequirement: https://worldhealthorganization.github.io/smart-base/StructureDefinition-FunctionalRequirement.html
 * - NonFunctionalRequirement: https://worldhealthorganization.github.io/smart-base/StructureDefinition-NonFunctionalRequirement.html
 */

import stagingGroundService from './stagingGroundService';
import { escapeFSHString, extractFSHMetadata } from '@sgex/dak-core/dist/browser';

class RequirementsService {
  /**
   * Validate requirement ID according to WHO IG Starter Kit naming conventions
   * https://smart.who.int/ig-starter-kit/authoring_conventions.html#naming-conventions
   * 
   * Rules:
   * - IDs MUST start with a capital letter
   * - IDs MAY contain hyphens (although not preferred)
   * - IDs SHALL NOT contain underscores
   * 
   * @param {string} id - The requirement ID to validate
   * @returns {object} - { isValid: boolean, error: string|null }
   */
  validateRequirementId(id) {
    if (!id || typeof id !== 'string') {
      return {
        isValid: false,
        error: 'ID is required'
      };
    }

    // Check if ID starts with capital letter
    if (!/^[A-Z]/.test(id)) {
      return {
        isValid: false,
        error: 'ID must start with a capital letter (e.g., "Resourceid" or "Resource-id")'
      };
    }

    // Check for underscores (not allowed)
    if (id.includes('_')) {
      return {
        isValid: false,
        error: 'ID SHALL NOT contain underscores. Use "Resource-id" instead of "Resource_id"'
      };
    }

    // Check for valid characters (letters, numbers, hyphens)
    if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(id)) {
      return {
        isValid: false,
        error: 'ID may only contain letters, numbers, and hyphens'
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Generate FSH Logical Model header
   */
  generateLogicalModelHeader(id, title, description, parentType) {
    const escapedTitle = escapeFSHString(title);
    const escapedDescription = escapeFSHString(description);
    
    return `Logical: ${id}
Parent: ${parentType}
Id: ${id}
Title: "${escapedTitle}"
Description: "${escapedDescription}"`;
  }

  /**
   * Generate FSH content for functional requirement
   */
  generateFunctionalRequirementFSH(requirement) {
    const { id, title, description, activity, actor, capability, benefit, classification } = requirement;
    
    if (!id) {
      throw new Error('Requirement ID is required');
    }

    // Validate ID
    const idValidation = this.validateRequirementId(id);
    if (!idValidation.isValid) {
      throw new Error(`Invalid ID: ${idValidation.error}`);
    }

    const header = this.generateLogicalModelHeader(
      id,
      title || 'Functional Requirement',
      description || 'Description of the functional requirement',
      'FunctionalRequirement'
    );
    
    const fields = [];
    fields.push(`* id = "${id}"`);
    if (activity) fields.push(`* activity = "${escapeFSHString(activity)}"`);
    if (actor) fields.push(`* actor = Reference(${actor})`);
    if (capability) fields.push(`* capability = "${escapeFSHString(capability)}"`);
    if (benefit) fields.push(`* benefit = "${escapeFSHString(benefit)}"`);
    if (classification) fields.push(`* classification = #${classification}`);
    
    return `${header}\n\n${fields.join('\n')}\n`;
  }

  /**
   * Generate FSH content for non-functional requirement
   */
  generateNonFunctionalRequirementFSH(requirement) {
    const { id, title, description, requirement: reqText, category, classification } = requirement;
    
    if (!id) {
      throw new Error('Requirement ID is required');
    }

    // Validate ID
    const idValidation = this.validateRequirementId(id);
    if (!idValidation.isValid) {
      throw new Error(`Invalid ID: ${idValidation.error}`);
    }

    const header = this.generateLogicalModelHeader(
      id,
      title || 'Non-Functional Requirement',
      description || 'Description of the non-functional requirement',
      'NonFunctionalRequirement'
    );
    
    const fields = [];
    fields.push(`* id = "${id}"`);
    if (reqText) fields.push(`* requirement = "${escapeFSHString(reqText)}"`);
    if (category) fields.push(`* category = #${category}`);
    if (classification) fields.push(`* classification = #${classification}`);
    
    return `${header}\n\n${fields.join('\n')}\n`;
  }

  /**
   * Generate FSH for any requirement type
   */
  generateFSH(requirement, type) {
    if (type === 'functional') {
      return this.generateFunctionalRequirementFSH(requirement);
    } else if (type === 'nonfunctional') {
      return this.generateNonFunctionalRequirementFSH(requirement);
    } else {
      throw new Error(`Unknown requirement type: ${type}`);
    }
  }

  /**
   * Validate requirement object
   */
  validateRequirement(requirement, type) {
    const errors = [];

    if (!requirement.id) {
      errors.push('ID is required');
    } else {
      const idValidation = this.validateRequirementId(requirement.id);
      if (!idValidation.isValid) {
        errors.push(idValidation.error);
      }
    }

    if (type === 'functional') {
      if (!requirement.activity) {
        errors.push('Activity is required for functional requirements');
      }
    } else if (type === 'nonfunctional') {
      if (!requirement.requirement) {
        errors.push('Requirement text is required for non-functional requirements');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Save requirement to staging ground
   * Integrates with the DAK JSON object for centralized change management
   */
  async saveToStagingGround(requirement, type) {
    try {
      // Validate first
      const validation = this.validateRequirement(requirement, type);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate FSH content
      const fshContent = this.generateFSH(requirement, type);
      
      // Create file path in staging ground structure
      const prefix = type === 'functional' ? 'Functional' : 'NonFunctional';
      const filePath = `input/fsh/requirements/${prefix}Requirement-${requirement.id}.fsh`;
      
      // Save to staging ground with metadata
      const success = stagingGroundService.updateFile(filePath, fshContent, {
        type: `${type}-requirement`,
        requirementId: requirement.id,
        requirementTitle: requirement.title,
        requirementType: type,
        lastModified: Date.now(),
        source: 'requirements-editor'
      });

      if (!success) {
        throw new Error('Failed to save to staging ground');
      }

      return {
        success: true,
        filePath: filePath
      };
    } catch (error) {
      console.error('Error saving requirement to staging ground:', error);
      throw error;
    }
  }

  /**
   * Parse FSH content to extract requirement data
   */
  parseFSH(fshContent) {
    try {
      const metadata = extractFSHMetadata(fshContent);
      const lines = fshContent.split('\n');
      
      const requirement = {
        id: metadata.id || '',
        title: metadata.title || '',
        description: metadata.description || ''
      };

      // Parse field values
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('* activity =')) {
          requirement.activity = this.extractQuotedValue(trimmed);
        } else if (trimmed.startsWith('* actor =')) {
          requirement.actor = this.extractReferenceValue(trimmed);
        } else if (trimmed.startsWith('* capability =')) {
          requirement.capability = this.extractQuotedValue(trimmed);
        } else if (trimmed.startsWith('* benefit =')) {
          requirement.benefit = this.extractQuotedValue(trimmed);
        } else if (trimmed.startsWith('* requirement =')) {
          requirement.requirement = this.extractQuotedValue(trimmed);
        } else if (trimmed.startsWith('* category =')) {
          requirement.category = this.extractCodeValue(trimmed);
        } else if (trimmed.startsWith('* classification =')) {
          requirement.classification = this.extractCodeValue(trimmed);
        }
      });

      return requirement;
    } catch (error) {
      console.error('Error parsing FSH:', error);
      throw error;
    }
  }

  /**
   * Extract quoted string value from FSH line
   */
  extractQuotedValue(line) {
    const match = line.match(/=\s*"(.*)"/);
    return match ? match[1] : '';
  }

  /**
   * Extract code value (after #) from FSH line
   */
  extractCodeValue(line) {
    const match = line.match(/=\s*#(\S+)/);
    return match ? match[1] : '';
  }

  /**
   * Extract reference value from FSH line
   */
  extractReferenceValue(line) {
    const match = line.match(/=\s*Reference\(([^)]+)\)/);
    return match ? match[1] : '';
  }
}

// Export singleton instance
const requirementsService = new RequirementsService();
export default requirementsService;
