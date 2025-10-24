/**
 * Example integration of FHIR Resource Loader Service
 * 
 * This file demonstrates how to replace static FHIR resource imports
 * with dynamic loading using the FHIR Resource Loader service.
 * 
 * Usage: Import and use these helper functions in components that need FHIR resources.
 */

import {
  loadFHIRResource,
  loadMultipleFHIRResources,
  preloadFHIRResources,
  FHIRResource,
  FHIRResourceLoadOptions,
} from '../services/fhirResourceLoaderService';

/**
 * Common FHIR value sets that can be preloaded
 */
export const COMMON_VALUE_SETS = [
  'http://hl7.org/fhir/ValueSet/administrative-gender',
  'http://hl7.org/fhir/ValueSet/marital-status',
  'http://hl7.org/fhir/ValueSet/languages',
  'http://hl7.org/fhir/ValueSet/contact-point-system',
  'http://hl7.org/fhir/ValueSet/contact-point-use',
];

/**
 * Hook to load a FHIR ValueSet
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { valueSet, loading, error } = useFHIRValueSet(
 *     'http://hl7.org/fhir/ValueSet/administrative-gender'
 *   );
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!valueSet) return <div>ValueSet not found</div>;
 *   
 *   return <div>{valueSet.name}</div>;
 * }
 * ```
 */
export function useFHIRValueSet(canonicalUrl: string, options?: FHIRResourceLoadOptions) {
  const [valueSet, setValueSet] = React.useState<FHIRResource | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const resource = await loadFHIRResource(canonicalUrl, options);
        
        if (mounted) {
          if (resource) {
            setValueSet(resource);
          } else {
            setError('ValueSet not found');
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load ValueSet');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [canonicalUrl, options]);

  return { valueSet, loading, error };
}

/**
 * Load ValueSets for a Questionnaire
 * 
 * Extracts and loads all ValueSets referenced in a FHIR Questionnaire
 * 
 * @example
 * ```typescript
 * const valueSets = await loadQuestionnaireValueSets(questionnaire);
 * console.log(`Loaded ${valueSets.length} value sets`);
 * ```
 */
export async function loadQuestionnaireValueSets(
  questionnaire: any,
  options?: FHIRResourceLoadOptions
): Promise<FHIRResource[]> {
  if (!questionnaire.item) {
    return [];
  }

  // Extract all answerValueSet URLs from questionnaire items
  const valueSetUrls: string[] = [];
  
  function extractValueSets(items: any[]) {
    items.forEach(item => {
      if (item.answerValueSet) {
        valueSetUrls.push(item.answerValueSet);
      }
      if (item.item) {
        extractValueSets(item.item);
      }
    });
  }

  extractValueSets(questionnaire.item);

  // Remove duplicates
  const uniqueUrls = [...new Set(valueSetUrls)];

  // Load all value sets in parallel
  const resources = await loadMultipleFHIRResources(uniqueUrls, options);

  // Filter out nulls (failed loads)
  return resources.filter((r): r is FHIRResource => r !== null);
}

/**
 * Load a CodeSystem and check if a code is valid
 * 
 * @example
 * ```typescript
 * const isValid = await validateCode(
 *   'http://hl7.org/fhir/CodeSystem/observation-category',
 *   'vital-signs'
 * );
 * ```
 */
export async function validateCode(
  codeSystemUrl: string,
  code: string,
  options?: FHIRResourceLoadOptions
): Promise<boolean> {
  const codeSystem = await loadFHIRResource(codeSystemUrl, options);

  if (!codeSystem) {
    throw new Error(`CodeSystem not found: ${codeSystemUrl}`);
  }

  if (!codeSystem.concept) {
    return false;
  }

  // Check if code exists in concepts
  function findCode(concepts: any[]): boolean {
    for (const concept of concepts) {
      if (concept.code === code) {
        return true;
      }
      // Check nested concepts
      if (concept.concept && findCode(concept.concept)) {
        return true;
      }
    }
    return false;
  }

  return findCode(codeSystem.concept);
}

/**
 * Get display text for a code from a CodeSystem
 * 
 * @example
 * ```typescript
 * const display = await getCodeDisplay(
 *   'http://hl7.org/fhir/CodeSystem/observation-category',
 *   'vital-signs'
 * );
 * console.log(display); // "Vital Signs"
 * ```
 */
export async function getCodeDisplay(
  codeSystemUrl: string,
  code: string,
  options?: FHIRResourceLoadOptions
): Promise<string | null> {
  const codeSystem = await loadFHIRResource(codeSystemUrl, options);

  if (!codeSystem || !codeSystem.concept) {
    return null;
  }

  // Find the concept with matching code
  function findDisplay(concepts: any[]): string | null {
    for (const concept of concepts) {
      if (concept.code === code) {
        return concept.display || null;
      }
      // Check nested concepts
      if (concept.concept) {
        const display = findDisplay(concept.concept);
        if (display) return display;
      }
    }
    return null;
  }

  return findDisplay(codeSystem.concept);
}

/**
 * Expand a ValueSet to get all codes
 * 
 * Note: This performs a simple expansion. For full FHIR terminology services,
 * consider using a terminology server.
 * 
 * @example
 * ```typescript
 * const codes = await expandValueSet(
 *   'http://hl7.org/fhir/ValueSet/administrative-gender'
 * );
 * ```
 */
export async function expandValueSet(
  valueSetUrl: string,
  options?: FHIRResourceLoadOptions
): Promise<{ code: string; display?: string; system?: string }[]> {
  const valueSet = await loadFHIRResource(valueSetUrl, options);

  if (!valueSet) {
    return [];
  }

  const codes: { code: string; display?: string; system?: string }[] = [];

  // Handle compose.include
  if (valueSet.compose?.include) {
    for (const include of valueSet.compose.include) {
      if (include.concept) {
        // Explicitly listed concepts
        include.concept.forEach((concept: any) => {
          codes.push({
            code: concept.code,
            display: concept.display,
            system: include.system,
          });
        });
      } else if (include.system) {
        // Include all codes from a system - would need to load the CodeSystem
        const codeSystem = await loadFHIRResource(include.system, options);
        if (codeSystem?.concept) {
          function extractCodes(concepts: any[]) {
            concepts.forEach(concept => {
              codes.push({
                code: concept.code,
                display: concept.display,
                system: include.system,
              });
              if (concept.concept) {
                extractCodes(concept.concept);
              }
            });
          }
          extractCodes(codeSystem.concept);
        }
      }
    }
  }

  return codes;
}

/**
 * Initialize FHIR resource loading
 * 
 * Call this during application startup to preload common resources
 * 
 * @example
 * ```typescript
 * // In App.js or index.js
 * initializeFHIRResources().catch(err => {
 *   console.warn('Failed to preload FHIR resources:', err);
 * });
 * ```
 */
export async function initializeFHIRResources(): Promise<void> {
  // Preload common value sets in the background
  await preloadFHIRResources(COMMON_VALUE_SETS);
}

/**
 * React context for FHIR resources (optional enhancement)
 * 
 * Provides a centralized way to manage FHIR resource loading
 */
export const FHIRResourceContext = React.createContext<{
  loadResource: typeof loadFHIRResource;
  loadMultiple: typeof loadMultipleFHIRResources;
}>({
  loadResource: loadFHIRResource,
  loadMultiple: loadMultipleFHIRResources,
});

/**
 * Provider component for FHIR resources
 */
export function FHIRResourceProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Preload common resources on mount
    initializeFHIRResources().catch(err => {
      console.warn('Failed to preload FHIR resources:', err);
    });
  }, []);

  return (
    <FHIRResourceContext.Provider
      value={{
        loadResource: loadFHIRResource,
        loadMultiple: loadMultipleFHIRResources,
      }}
    >
      {children}
    </FHIRResourceContext.Provider>
  );
}

/**
 * Hook to access FHIR resource loader from context
 */
export function useFHIRResourceLoader() {
  return React.useContext(FHIRResourceContext);
}

// Add React import at the top
import React from 'react';
