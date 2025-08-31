/**
 * Canonical Schema Service
 * 
 * Handles loading and caching of WHO SMART Guidelines canonical ValueSets and Logical Models
 * from published FHIR Implementation Guides.
 */

import { CanonicalSchema, ValueSetExpansion, ValueSetCode, CanonicalReference } from '../../types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CanonicalSchemaService {
  private static instance: CanonicalSchemaService;
  private schemaCache: Map<string, CanonicalSchema> = new Map();
  private valueSetCache: Map<string, ValueSetExpansion> = new Map();
  private cacheDir: string;
  private maxCacheAge: number = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private constructor() {
    this.cacheDir = path.resolve(__dirname, '../../cache/canonical');
    this.ensureCacheDirectory();
  }

  public static getInstance(): CanonicalSchemaService {
    if (!CanonicalSchemaService.instance) {
      CanonicalSchemaService.instance = new CanonicalSchemaService();
    }
    return CanonicalSchemaService.instance;
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error: any) {
      console.warn('Could not create cache directory:', error.message);
    }
  }

  /**
   * Load a canonical schema from URL with caching and fallback
   */
  async loadCanonicalSchema(url: string, version?: string): Promise<CanonicalSchema | null> {
    const cacheKey = version ? `${url}#${version}` : url;
    
    // Check memory cache first
    const cached = this.schemaCache.get(cacheKey);
    if (cached && !this.isCacheExpired(cached.loadedAt)) {
      return cached;
    }

    // Try to load from remote
    try {
      const schema = await this.fetchSchemaFromRemote(url);
      if (schema) {
        const canonicalSchema: CanonicalSchema = {
          url,
          version,
          schema,
          loadedAt: new Date(),
          source: 'remote'
        };
        
        // Cache in memory and disk
        this.schemaCache.set(cacheKey, canonicalSchema);
        await this.saveToDiskCache(cacheKey, canonicalSchema);
        
        return canonicalSchema;
      }
    } catch (error: any) {
      console.warn(`Failed to load canonical schema from ${url}:`, error.message);
    }

    // Fallback to disk cache
    return await this.loadFromDiskCache(cacheKey);
  }

  /**
   * Fetch schema from remote URL
   */
  private async fetchSchemaFromRemote(url: string): Promise<any> {
    try {
      // In a real implementation, you would use fetch() here
      // For now, we'll simulate this since we don't have network access
      console.log(`Would fetch schema from: ${url}`);
      
      // Simulate loading a WHO ValueSet schema
      if (url.includes('ValueSet-')) {
        return this.createMockValueSetSchema(url);
      } else if (url.includes('StructureDefinition-')) {
        return this.createMockStructureDefinitionSchema(url);
      }
      
      return null;
    } catch (error) {
      throw new Error(`HTTP request failed: ${error}`);
    }
  }

  /**
   * Create a mock ValueSet schema for demonstration
   */
  private createMockValueSetSchema(url: string): any {
    const name = this.extractNameFromUrl(url);
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: `ValueSet ${name}`,
      type: 'object',
      properties: {
        code: {
          type: 'string',
          enum: this.getMockValueSetCodes(name),
          description: `Code from ValueSet ${name}`
        },
        display: {
          type: 'string',
          description: 'Display name for the code'
        },
        system: {
          type: 'string',
          description: 'Code system URI'
        }
      },
      required: ['code'],
      'x-canonical-url': url,
      'x-fhir-type': 'ValueSet'
    };
  }

  /**
   * Create a mock StructureDefinition schema for demonstration
   */
  private createMockStructureDefinitionSchema(url: string): any {
    const name = this.extractNameFromUrl(url);
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: `LogicalModel ${name}`,
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Logical identifier' },
        meta: {
          type: 'object',
          properties: {
            profile: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      },
      required: ['id'],
      'x-canonical-url': url,
      'x-fhir-type': 'StructureDefinition'
    };
  }

  /**
   * Get mock codes for ValueSet (in real implementation, this would come from the actual ValueSet)
   */
  private getMockValueSetCodes(name: string): string[] {
    const codeMaps: Record<string, string[]> = {
      'CDHIv1': ['component1', 'component2', 'component3', 'component4', 'component5', 'component6', 'component7', 'component8'],
      'DAKComponentType': ['business-processes', 'decision-support-logic', 'indicators', 'forms', 'terminology', 'profiles', 'extensions', 'test-data'],
      'ActorType': ['person', 'device', 'organization', 'system'],
      'InterventionType': ['prevention', 'treatment', 'diagnosis', 'monitoring', 'education']
    };

    return codeMaps[name] || ['code1', 'code2', 'code3'];
  }

  /**
   * Extract name from canonical URL
   */
  private extractNameFromUrl(url: string): string {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.replace('.schema.json', '').replace('ValueSet-', '').replace('StructureDefinition-', '');
  }

  /**
   * Expand a ValueSet to get all codes
   */
  async expandValueSet(url: string): Promise<ValueSetExpansion | null> {
    const cached = this.valueSetCache.get(url);
    if (cached && !this.isCacheExpired(cached.loadedAt)) {
      return cached;
    }

    const schema = await this.loadCanonicalSchema(url);
    if (!schema || !schema.schema.properties?.code?.enum) {
      return null;
    }

    const codes: ValueSetCode[] = schema.schema.properties.code.enum.map((code: string) => ({
      code,
      display: this.generateDisplayName(code),
      system: 'http://smart.who.int/fhir/CodeSystem/example'
    }));

    const expansion: ValueSetExpansion = {
      url,
      codes,
      loadedAt: new Date()
    };

    this.valueSetCache.set(url, expansion);
    return expansion;
  }

  /**
   * Generate display name from code
   */
  private generateDisplayName(code: string): string {
    return code.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Check if a code is valid for a ValueSet
   */
  async validateValueSetCode(valueSetUrl: string, code: string): Promise<boolean> {
    const expansion = await this.expandValueSet(valueSetUrl);
    if (!expansion) {
      return false;
    }

    return expansion.codes.some(c => c.code === code);
  }

  /**
   * Validate an object against a canonical schema
   */
  async validateAgainstCanonical(canonicalUrl: string, data: any): Promise<{ isValid: boolean; errors: string[] }> {
    const schema = await this.loadCanonicalSchema(canonicalUrl);
    if (!schema) {
      return {
        isValid: false,
        errors: [`Could not load canonical schema: ${canonicalUrl}`]
      };
    }

    // Basic validation - in a real implementation, you'd use a JSON Schema validator like Ajv
    const errors: string[] = [];
    const schemaObj = schema.schema;

    if (schemaObj.required) {
      for (const requiredField of schemaObj.required) {
        if (!data.hasOwnProperty(requiredField)) {
          errors.push(`Missing required field: ${requiredField}`);
        }
      }
    }

    if (schemaObj.properties) {
      for (const [field, fieldSchema] of Object.entries(schemaObj.properties)) {
        if (data.hasOwnProperty(field)) {
          const fieldValue = data[field];
          const fieldSchemaObj = fieldSchema as any;
          
          if (fieldSchemaObj.type && typeof fieldValue !== fieldSchemaObj.type) {
            errors.push(`Field ${field} must be of type ${fieldSchemaObj.type}`);
          }
          
          if (fieldSchemaObj.enum && !fieldSchemaObj.enum.includes(fieldValue)) {
            errors.push(`Field ${field} must be one of: ${fieldSchemaObj.enum.join(', ')}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isCacheExpired(loadedAt: Date): boolean {
    return Date.now() - loadedAt.getTime() > this.maxCacheAge;
  }

  /**
   * Save schema to disk cache
   */
  private async saveToDiskCache(cacheKey: string, schema: CanonicalSchema): Promise<void> {
    try {
      const filePath = path.join(this.cacheDir, `${this.sanitizeFileName(cacheKey)}.json`);
      await fs.writeFile(filePath, JSON.stringify(schema, null, 2));
    } catch (error: any) {
      console.warn('Could not save to disk cache:', error.message);
    }
  }

  /**
   * Load schema from disk cache
   */
  private async loadFromDiskCache(cacheKey: string): Promise<CanonicalSchema | null> {
    try {
      const filePath = path.join(this.cacheDir, `${this.sanitizeFileName(cacheKey)}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const cached = JSON.parse(content) as CanonicalSchema;
      
      // Mark as loaded from cache
      cached.source = 'cache';
      cached.loadedAt = new Date(cached.loadedAt); // Restore Date object
      
      // Update memory cache
      this.schemaCache.set(cacheKey, cached);
      
      return cached;
    } catch (error: any) {
      console.warn(`Could not load from disk cache (${cacheKey}):`, error.message);
      return null;
    }
  }

  /**
   * Sanitize filename for cache
   */
  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9-_.#]/g, '_');
  }

  /**
   * Get known canonical URLs for WHO SMART Guidelines
   */
  getKnownCanonicalUrls(): Record<string, CanonicalReference[]> {
    return {
      'ValueSets': [
        {
          type: 'ValueSet',
          url: 'https://worldhealthorganization.github.io/smart-base/ValueSet-CDHIv1.schema.json',
          description: 'Core DAK Health Interventions ValueSet',
          purpose: 'Defines the 8 core DAK components'
        },
        {
          type: 'ValueSet', 
          url: 'https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json',
          description: 'DAK Component Types',
          purpose: 'Classifies DAK component types'
        },
        {
          type: 'ValueSet',
          url: 'https://worldhealthorganization.github.io/smart-base/ValueSet-ActorType.schema.json', 
          description: 'Actor Types for SMART Guidelines',
          purpose: 'Defines types of actors in health workflows'
        }
      ],
      'LogicalModels': [
        {
          type: 'LogicalModel',
          url: 'https://worldhealthorganization.github.io/smart-base/StructureDefinition-DAK.schema.json',
          description: 'DAK Logical Model',
          purpose: 'Defines the structure of a Digital Adaptation Kit'
        }
      ]
    };
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    this.schemaCache.clear();
    this.valueSetCache.clear();
    
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.cacheDir, file));
        }
      }
    } catch (error: any) {
      console.warn('Could not clear disk cache:', error.message);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { memorySchemas: number; memoryValueSets: number; cacheDir: string } {
    return {
      memorySchemas: this.schemaCache.size,
      memoryValueSets: this.valueSetCache.size,
      cacheDir: this.cacheDir
    };
  }
}