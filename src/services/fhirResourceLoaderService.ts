/**
 * FHIR Resource Loader Service
 * 
 * Provides dynamic loading of FHIR resources (ValueSets, CodeSystems, ConceptMaps, etc.)
 * from external sources instead of bundling them in the application.
 * 
 * Resolution strategy:
 * 1. Try published URL (canonical URL + .json)
 * 2. Fallback to CI/draft build ({profile}.github.io/{repo}/{resource_id}.json)
 * 
 * Supports loading from any FHIR Implementation Guide (IG), not just DAKs.
 * 
 * @module fhirResourceLoaderService
 */

import logger from '../utils/logger';

const serviceLogger = logger.getLogger('FHIRResourceLoader');

/**
 * Options for FHIR resource loading
 */
export interface FHIRResourceLoadOptions {
  /** Whether to allow loading from CI/draft builds */
  allowCIBuild?: boolean;
  /** Whether to allow loading from published builds */
  allowPublished?: boolean;
  /** Custom timeout in milliseconds */
  timeout?: number;
  /** Whether to cache the resource in memory */
  cache?: boolean;
}

/**
 * FHIR resource metadata
 */
export interface FHIRResource {
  resourceType: string;
  id: string;
  url?: string;
  [key: string]: any;
}

/**
 * Cache for loaded FHIR resources
 */
const resourceCache = new Map<string, FHIRResource>();

/**
 * Default options for resource loading
 */
const DEFAULT_OPTIONS: FHIRResourceLoadOptions = {
  allowCIBuild: true,
  allowPublished: true,
  timeout: 10000, // 10 seconds
  cache: true,
};

/**
 * Extract GitHub profile and repo from a canonical URL
 * 
 * @param canonicalUrl - The canonical URL of the resource
 * @returns Object with profile and repo, or null if not a GitHub URL
 */
function parseGitHubUrl(canonicalUrl: string): { profile: string; repo: string } | null {
  // Pattern: https://profile.github.io/repo/...
  const match = canonicalUrl.match(/https?:\/\/([^.]+)\.github\.io\/([^/]+)/);
  if (match) {
    return {
      profile: match[1],
      repo: match[2],
    };
  }
  return null;
}

/**
 * Extract resource ID from a canonical URL
 * 
 * @param canonicalUrl - The canonical URL of the resource
 * @returns The resource ID (last part of the URL)
 */
function extractResourceId(canonicalUrl: string): string {
  // Remove trailing slash if present
  const url = canonicalUrl.replace(/\/$/, '');
  // Get the last segment
  const parts = url.split('/');
  return parts[parts.length - 1];
}

/**
 * Construct published resource URL from canonical URL
 * 
 * @param canonicalUrl - The canonical URL of the resource
 * @returns The URL with .json extension
 */
function getPublishedUrl(canonicalUrl: string): string {
  // If already ends with .json, return as-is
  if (canonicalUrl.endsWith('.json')) {
    return canonicalUrl;
  }
  // Add .json extension
  return `${canonicalUrl}.json`;
}

/**
 * Construct CI build URL from canonical URL
 * 
 * @param canonicalUrl - The canonical URL of the resource
 * @returns The CI build URL, or null if not a GitHub URL
 */
function getCIBuildUrl(canonicalUrl: string): string | null {
  const githubInfo = parseGitHubUrl(canonicalUrl);
  if (!githubInfo) {
    return null;
  }
  
  const resourceId = extractResourceId(canonicalUrl);
  return `https://${githubInfo.profile}.github.io/${githubInfo.repo}/${resourceId}.json`;
}

/**
 * Fetch a resource from a URL with timeout
 * 
 * @param url - The URL to fetch from
 * @param timeout - Timeout in milliseconds
 * @returns The fetched resource, or null if fetch fails
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<FHIRResource | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    serviceLogger.debug(`Fetching resource from: ${url}`);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/fhir+json, application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      serviceLogger.debug(`Failed to fetch from ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    serviceLogger.info(`Successfully loaded resource from: ${url}`);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        serviceLogger.warn(`Request timeout for: ${url}`);
      } else {
        serviceLogger.debug(`Error fetching from ${url}: ${error.message}`);
      }
    }
    return null;
  }
}

/**
 * Load a FHIR resource by its canonical URL
 * 
 * This function attempts to load a FHIR resource (ValueSet, CodeSystem, ConceptMap, etc.)
 * from external sources using a fallback strategy:
 * 
 * 1. If allowPublished is true, try the published URL (canonical URL + .json)
 * 2. If that fails and allowCIBuild is true, try the CI build URL
 * 
 * @param canonicalUrl - The canonical URL of the FHIR resource
 * @param options - Loading options
 * @returns The loaded FHIR resource, or null if not found
 * 
 * @example
 * ```typescript
 * // Load a ValueSet from published URL
 * const valueSet = await loadFHIRResource('http://hl7.org/fhir/ValueSet/administrative-gender');
 * 
 * // Load with custom options
 * const codeSystem = await loadFHIRResource(
 *   'https://profile.github.io/repo/CodeSystem/my-codes',
 *   { allowCIBuild: true, allowPublished: false }
 * );
 * ```
 */
export async function loadFHIRResource(
  canonicalUrl: string,
  options: FHIRResourceLoadOptions = {}
): Promise<FHIRResource | null> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  serviceLogger.info(`Loading FHIR resource: ${canonicalUrl}`);
  
  // Check cache first if caching is enabled
  if (opts.cache && resourceCache.has(canonicalUrl)) {
    serviceLogger.debug(`Returning cached resource: ${canonicalUrl}`);
    return resourceCache.get(canonicalUrl)!;
  }
  
  let resource: FHIRResource | null = null;
  
  // Try published URL first
  if (opts.allowPublished) {
    const publishedUrl = getPublishedUrl(canonicalUrl);
    resource = await fetchWithTimeout(publishedUrl, opts.timeout!);
    
    if (resource) {
      serviceLogger.info(`Loaded resource from published URL: ${publishedUrl}`);
      if (opts.cache) {
        resourceCache.set(canonicalUrl, resource);
      }
      return resource;
    }
  }
  
  // Fallback to CI build URL
  if (opts.allowCIBuild) {
    const ciBuildUrl = getCIBuildUrl(canonicalUrl);
    if (ciBuildUrl) {
      resource = await fetchWithTimeout(ciBuildUrl, opts.timeout!);
      
      if (resource) {
        serviceLogger.info(`Loaded resource from CI build URL: ${ciBuildUrl}`);
        if (opts.cache) {
          resourceCache.set(canonicalUrl, resource);
        }
        return resource;
      }
    }
  }
  
  serviceLogger.warn(`Failed to load FHIR resource: ${canonicalUrl}`);
  return null;
}

/**
 * Load multiple FHIR resources in parallel
 * 
 * @param canonicalUrls - Array of canonical URLs to load
 * @param options - Loading options (applied to all resources)
 * @returns Array of loaded resources (nulls for failed loads)
 */
export async function loadMultipleFHIRResources(
  canonicalUrls: string[],
  options: FHIRResourceLoadOptions = {}
): Promise<(FHIRResource | null)[]> {
  serviceLogger.info(`Loading ${canonicalUrls.length} FHIR resources in parallel`);
  
  const promises = canonicalUrls.map(url => loadFHIRResource(url, options));
  return Promise.all(promises);
}

/**
 * Clear the resource cache
 * 
 * @param canonicalUrl - Optional specific URL to clear, or clear all if not provided
 */
export function clearResourceCache(canonicalUrl?: string): void {
  if (canonicalUrl) {
    resourceCache.delete(canonicalUrl);
    serviceLogger.debug(`Cleared cache for: ${canonicalUrl}`);
  } else {
    resourceCache.clear();
    serviceLogger.debug('Cleared entire resource cache');
  }
}

/**
 * Get the current cache size
 * 
 * @returns Number of cached resources
 */
export function getCacheSize(): number {
  return resourceCache.size;
}

/**
 * Check if a resource is in the cache
 * 
 * @param canonicalUrl - The canonical URL to check
 * @returns True if the resource is cached
 */
export function isResourceCached(canonicalUrl: string): boolean {
  return resourceCache.has(canonicalUrl);
}

/**
 * Preload FHIR resources for better performance
 * 
 * Useful for preloading commonly used resources during application startup
 * 
 * @param canonicalUrls - Array of canonical URLs to preload
 * @param options - Loading options
 */
export async function preloadFHIRResources(
  canonicalUrls: string[],
  options: FHIRResourceLoadOptions = {}
): Promise<void> {
  serviceLogger.info(`Preloading ${canonicalUrls.length} FHIR resources`);
  await loadMultipleFHIRResources(canonicalUrls, options);
}

/**
 * FHIR Resource Loader Service
 */
const FHIRResourceLoaderService = {
  loadFHIRResource,
  loadMultipleFHIRResources,
  clearResourceCache,
  getCacheSize,
  isResourceCached,
  preloadFHIRResources,
};

export default FHIRResourceLoaderService;
