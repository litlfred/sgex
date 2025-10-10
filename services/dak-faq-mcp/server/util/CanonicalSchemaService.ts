/**
 * Canonical Schema Service
 * 
 * Manages fetching, caching, and validation of WHO SMART Guidelines canonical schemas
 * including ValueSets and Logical Models from smart-base repository.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Canonical resource metadata
 */
export interface CanonicalResource {
  url: string;
  type: 'ValueSet' | 'LogicalModel' | 'StructureDefinition';
  version?: string;
  schema?: any;
  lastFetched?: Date;
}

/**
 * Cache entry for canonical resources
 */
interface CacheEntry {
  resource: CanonicalResource;
  expiresAt: Date;
}

/**
 * Service for managing WHO SMART Guidelines canonical schemas
 */
export class CanonicalSchemaService {
  private static instance: CanonicalSchemaService;
  private cache: Map<string, CacheEntry>;
  private cacheDir: string;
  private cacheDuration: number = 24 * 60 * 60 * 1000; // 24 hours
  private initialized: boolean = false;

  // Known WHO SMART Guidelines canonical base URLs
  private readonly CANONICAL_BASES = [
    'https://worldhealthorganization.github.io/smart-base/',
    'https://smart.who.int/base/',
  ];

  private constructor() {
    this.cache = new Map();
    // Store cache in service directory
    this.cacheDir = path.resolve(__dirname, '../../.cache/canonical-schemas');
  }

  public static getInstance(): CanonicalSchemaService {
    if (!CanonicalSchemaService.instance) {
      CanonicalSchemaService.instance = new CanonicalSchemaService();
    }
    return CanonicalSchemaService.instance;
  }

  /**
   * Initialize the service (create cache directory if needed)
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      await this.loadCacheFromDisk();
      this.initialized = true;
    } catch (error: any) {
      console.warn('Failed to initialize canonical schema cache:', error.message);
    }
  }

  /**
   * Fetch a canonical resource by URL
   * Returns cached version if available and not expired
   */
  public async fetchCanonicalResource(canonicalUrl: string): Promise<CanonicalResource | null> {
    await this.initialize();

    // Check cache first
    const cached = this.cache.get(canonicalUrl);
    if (cached && cached.expiresAt > new Date()) {
      console.log(`Using cached canonical resource: ${canonicalUrl}`);
      return cached.resource;
    }

    // Try to fetch from network
    try {
      const schema = await this.fetchSchemaFromNetwork(canonicalUrl);
      if (schema) {
        const resource: CanonicalResource = {
          url: canonicalUrl,
          type: this.determineResourceType(canonicalUrl),
          schema,
          lastFetched: new Date()
        };

        // Cache the resource
        await this.cacheResource(canonicalUrl, resource);
        return resource;
      }
    } catch (error: any) {
      console.warn(`Failed to fetch canonical resource from network: ${error.message}`);
    }

    // Try to use expired cache as fallback
    if (cached) {
      console.warn(`Using expired cached resource: ${canonicalUrl}`);
      return cached.resource;
    }

    return null;
  }

  /**
   * Fetch schema from network
   */
  private async fetchSchemaFromNetwork(url: string): Promise<any | null> {
    try {
      // Only fetch if URL is a known WHO canonical base
      if (!this.isKnownCanonicalUrl(url)) {
        console.warn(`Not a known WHO canonical URL: ${url}`);
        return null;
      }

      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`HTTP ${response.status} fetching ${url}`);
        return null;
      }

      return await response.json();
    } catch (error: any) {
      console.error(`Error fetching schema from ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Check if URL is a known WHO canonical URL
   */
  private isKnownCanonicalUrl(url: string): boolean {
    return this.CANONICAL_BASES.some(base => url.startsWith(base));
  }

  /**
   * Determine resource type from URL
   */
  private determineResourceType(url: string): 'ValueSet' | 'LogicalModel' | 'StructureDefinition' {
    if (url.includes('ValueSet')) return 'ValueSet';
    if (url.includes('StructureDefinition')) return 'StructureDefinition';
    return 'LogicalModel';
  }

  /**
   * Cache a resource
   */
  private async cacheResource(url: string, resource: CanonicalResource): Promise<void> {
    const expiresAt = new Date(Date.now() + this.cacheDuration);
    this.cache.set(url, { resource, expiresAt });

    // Save to disk
    try {
      const filename = this.urlToFilename(url);
      const filepath = path.join(this.cacheDir, filename);
      await fs.writeFile(
        filepath,
        JSON.stringify({ resource, expiresAt: expiresAt.toISOString() }, null, 2)
      );
    } catch (error: any) {
      console.warn(`Failed to save cache to disk: ${error.message}`);
    }
  }

  /**
   * Load cache from disk
   */
  private async loadCacheFromDisk(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        try {
          const filepath = path.join(this.cacheDir, file);
          const content = await fs.readFile(filepath, 'utf-8');
          const { resource, expiresAt } = JSON.parse(content);
          
          this.cache.set(resource.url, {
            resource,
            expiresAt: new Date(expiresAt)
          });
        } catch (error: any) {
          console.warn(`Failed to load cache file ${file}: ${error.message}`);
        }
      }
      console.log(`Loaded ${this.cache.size} canonical schemas from cache`);
    } catch (error: any) {
      // Cache directory doesn't exist yet, that's ok
    }
  }

  /**
   * Convert URL to safe filename
   */
  private urlToFilename(url: string): string {
    return url
      .replace(/https?:\/\//, '')
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      + '.json';
  }

  /**
   * Extract enum values from a ValueSet schema
   */
  public extractValueSetEnum(schema: any): string[] | null {
    if (!schema) return null;

    // Handle FHIR R4 ValueSet schema structure
    if (schema.enum && Array.isArray(schema.enum)) {
      return schema.enum;
    }

    // Handle nested structures
    if (schema.properties?.code?.enum) {
      return schema.properties.code.enum;
    }

    if (schema.compose?.include) {
      const codes: string[] = [];
      for (const include of schema.compose.include) {
        if (include.concept) {
          codes.push(...include.concept.map((c: any) => c.code));
        }
      }
      return codes.length > 0 ? codes : null;
    }

    return null;
  }

  /**
   * Validate a value against a ValueSet
   */
  public async validateAgainstValueSet(
    value: string,
    valueSetUrl: string
  ): Promise<{ isValid: boolean; error?: string }> {
    const resource = await this.fetchCanonicalResource(valueSetUrl);
    
    if (!resource) {
      return {
        isValid: false,
        error: `Could not fetch ValueSet: ${valueSetUrl}`
      };
    }

    const validValues = this.extractValueSetEnum(resource.schema);
    if (!validValues) {
      return {
        isValid: false,
        error: 'Could not extract valid values from ValueSet'
      };
    }

    const isValid = validValues.includes(value);
    return {
      isValid,
      error: isValid ? undefined : `Value '${value}' not found in ValueSet ${valueSetUrl}`
    };
  }

  /**
   * Get all cached resources
   */
  public getCachedResources(): CanonicalResource[] {
    return Array.from(this.cache.values()).map(entry => entry.resource);
  }

  /**
   * Clear expired cache entries
   */
  public async clearExpiredCache(): Promise<void> {
    const now = new Date();
    const expiredUrls: string[] = [];

    for (const [url, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        expiredUrls.push(url);
      }
    }

    for (const url of expiredUrls) {
      this.cache.delete(url);
      
      // Also delete from disk
      try {
        const filename = this.urlToFilename(url);
        const filepath = path.join(this.cacheDir, filename);
        await fs.unlink(filepath);
      } catch (error: any) {
        // File might not exist, that's ok
      }
    }

    console.log(`Cleared ${expiredUrls.length} expired cache entries`);
  }

  /**
   * Clear all cache
   */
  public async clearCache(): Promise<void> {
    this.cache.clear();
    
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.cacheDir, file));
        }
      }
    } catch (error: any) {
      console.warn(`Failed to clear cache directory: ${error.message}`);
    }
  }
}
