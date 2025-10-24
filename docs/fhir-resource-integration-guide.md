# FHIR Resource Loader Integration Guide

This guide shows how to integrate the FHIR Resource Loader service into SGEX Workbench components to achieve the ~3 MB bundle size reduction.

## Overview

The FHIR Resource Loader service (`src/services/fhirResourceLoaderService.ts`) enables dynamic loading of FHIR resources instead of bundling them in the application. This integration guide provides practical examples for replacing static imports.

## Quick Start

### 1. Import the Service

```typescript
import { loadFHIRResource } from './services/fhirResourceLoaderService';
```

### 2. Load a Resource

```typescript
const valueSet = await loadFHIRResource(
  'http://hl7.org/fhir/ValueSet/administrative-gender'
);
```

### 3. Use Helper Functions (Recommended)

```typescript
import { useFHIRValueSet } from './utils/fhirResourceIntegration';

function MyComponent() {
  const { valueSet, loading, error } = useFHIRValueSet(
    'http://hl7.org/fhir/ValueSet/administrative-gender'
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{valueSet?.name}</div>;
}
```

## Integration Helpers

The integration helper utilities are located in `src/utils/fhirResourceIntegration.tsx` and provide:

### React Hook: `useFHIRValueSet`

Loads a FHIR ValueSet with loading and error states:

```typescript
const { valueSet, loading, error } = useFHIRValueSet(canonicalUrl, options);
```

### Questionnaire ValueSets: `loadQuestionnaireValueSets`

Extracts and loads all ValueSets from a FHIR Questionnaire:

```typescript
const valueSets = await loadQuestionnaireValueSets(questionnaire);
```

### Code Validation: `validateCode`

Validates if a code exists in a CodeSystem:

```typescript
const isValid = await validateCode(codeSystemUrl, 'code123');
```

### Code Display: `getCodeDisplay`

Gets display text for a code:

```typescript
const display = await getCodeDisplay(codeSystemUrl, 'code123');
```

### ValueSet Expansion: `expandValueSet`

Expands a ValueSet to get all codes:

```typescript
const codes = await expandValueSet(valueSetUrl);
```

## Integration Patterns

### Pattern 1: Component with Single ValueSet

**Before:**
```typescript
// Component using static import (avoid this)
import genderValueSet from './data/gender-valueset.json';

function GenderSelector() {
  const options = genderValueSet.concept;
  // ...
}
```

**After:**
```typescript
import { useFHIRValueSet } from '../utils/fhirResourceIntegration';

function GenderSelector() {
  const { valueSet, loading, error } = useFHIRValueSet(
    'http://hl7.org/fhir/ValueSet/administrative-gender'
  );
  
  if (loading) return <div>Loading gender options...</div>;
  if (error || !valueSet) return <div>Unable to load options</div>;
  
  const options = valueSet.compose?.include?.[0]?.concept || [];
  // ...
}
```

### Pattern 2: Form with Multiple ValueSets

```typescript
import { loadMultipleFHIRResources } from '../services/fhirResourceLoaderService';

function PatientForm() {
  const [valueSets, setValueSets] = React.useState<any>({});
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function loadResources() {
      const resources = await loadMultipleFHIRResources([
        'http://hl7.org/fhir/ValueSet/administrative-gender',
        'http://hl7.org/fhir/ValueSet/marital-status',
        'http://hl7.org/fhir/ValueSet/languages',
      ]);
      
      setValueSets({
        gender: resources[0],
        maritalStatus: resources[1],
        languages: resources[2],
      });
      setLoading(false);
    }
    
    loadResources();
  }, []);
  
  if (loading) return <div>Loading form...</div>;
  
  return (
    <form>
      <GenderField valueSet={valueSets.gender} />
      <MaritalStatusField valueSet={valueSets.maritalStatus} />
      <LanguageField valueSet={valueSets.languages} />
    </form>
  );
}
```

### Pattern 3: Questionnaire Renderer

```typescript
import { loadQuestionnaireValueSets } from '../utils/fhirResourceIntegration';

function QuestionnaireRenderer({ questionnaire }) {
  const [valueSets, setValueSets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function loadValueSets() {
      const sets = await loadQuestionnaireValueSets(questionnaire);
      setValueSets(sets);
      setLoading(false);
    }
    
    loadValueSets();
  }, [questionnaire]);
  
  if (loading) return <div>Loading questionnaire...</div>;
  
  // Render questionnaire with loaded value sets
  return <QuestionnaireForm questionnaire={questionnaire} valueSets={valueSets} />;
}
```

### Pattern 4: Code Validation in Forms

```typescript
import { validateCode } from '../utils/fhirResourceIntegration';

function CodeInput({ codeSystemUrl }) {
  const [code, setCode] = React.useState('');
  const [valid, setValid] = React.useState<boolean | null>(null);
  
  const handleValidate = async () => {
    const isValid = await validateCode(codeSystemUrl, code);
    setValid(isValid);
  };
  
  return (
    <div>
      <input 
        value={code} 
        onChange={(e) => setCode(e.target.value)} 
      />
      <button onClick={handleValidate}>Validate</button>
      {valid !== null && (
        <span>{valid ? '✅ Valid' : '❌ Invalid'}</span>
      )}
    </div>
  );
}
```

## Application-Level Integration

### App Initialization

Add FHIR resource preloading to your application startup:

```typescript
// In App.js or App.tsx
import { initializeFHIRResources } from './utils/fhirResourceIntegration';

function App() {
  React.useEffect(() => {
    // Preload common resources in the background
    initializeFHIRResources().catch(err => {
      console.warn('Failed to preload FHIR resources:', err);
    });
  }, []);
  
  return (
    // Your app content
  );
}
```

### Context Provider (Optional)

For larger applications, use the context provider:

```typescript
// In App.js or App.tsx
import { FHIRResourceProvider } from './utils/fhirResourceIntegration';

function App() {
  return (
    <FHIRResourceProvider>
      {/* Your app content */}
    </FHIRResourceProvider>
  );
}

// In any component
import { useFHIRResourceLoader } from './utils/fhirResourceIntegration';

function MyComponent() {
  const { loadResource } = useFHIRResourceLoader();
  
  const handleLoad = async () => {
    const resource = await loadResource(canonicalUrl);
    // ...
  };
}
```

## Migration Checklist

### Step 1: Identify Components Using FHIR Resources

Find components that import or use FHIR resources:
```bash
# Search for potential FHIR resource usage
grep -r "ValueSet\|CodeSystem\|ConceptMap" src/components/
```

### Step 2: Replace Static Imports

For each component:
- [ ] Remove static JSON imports
- [ ] Add FHIR Resource Loader import
- [ ] Use `useFHIRValueSet` hook or `loadFHIRResource` function
- [ ] Add loading and error states
- [ ] Test the component

### Step 3: Add Preloading

Identify frequently used resources and add to preload list:

```typescript
// In src/utils/fhirResourceIntegration.tsx
export const COMMON_VALUE_SETS = [
  'http://hl7.org/fhir/ValueSet/administrative-gender',
  'http://hl7.org/fhir/ValueSet/marital-status',
  // Add more commonly used resources
];
```

### Step 4: Measure Impact

After migration:
```bash
# Build and check bundle size
npm run build:check

# Expected results:
# - Main bundle reduction: ~3 MB
# - Largest chunk reduction: significant decrease
# - Total bundle: under 10 MB target
```

## Component Examples

### Example 1: CoreDataDictionaryViewer

If this component uses ValueSets:

```typescript
// Before (hypothetical)
import valueSets from './valuesets.json';

// After
import { loadMultipleFHIRResources } from '../services/fhirResourceLoaderService';

function CoreDataDictionaryViewer() {
  const [valueSets, setValueSets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    async function loadValueSets() {
      const urls = getValueSetUrlsFromDictionary();
      const resources = await loadMultipleFHIRResources(urls);
      setValueSets(resources.filter(r => r !== null));
      setLoading(false);
    }
    
    loadValueSets();
  }, []);
  
  // Component logic
}
```

### Example 2: DecisionSupportLogicView

If this component validates codes:

```typescript
import { validateCode, getCodeDisplay } from '../utils/fhirResourceIntegration';

function DecisionSupportLogicView() {
  const [codeInfo, setCodeInfo] = React.useState<any>(null);
  
  const loadCodeInfo = async (system: string, code: string) => {
    const [isValid, display] = await Promise.all([
      validateCode(system, code),
      getCodeDisplay(system, code),
    ]);
    
    setCodeInfo({ isValid, display });
  };
  
  // Component logic
}
```

## Performance Considerations

### Caching

The service caches loaded resources by default:
- First load: Network request
- Subsequent loads: Instant from cache
- Cache persists for the session

### Parallel Loading

Load multiple resources concurrently:
```typescript
// Good: Parallel loading
const resources = await loadMultipleFHIRResources([url1, url2, url3]);

// Avoid: Sequential loading
const res1 = await loadFHIRResource(url1);
const res2 = await loadFHIRResource(url2);
const res3 = await loadFHIRResource(url3);
```

### Preloading

Preload common resources during app initialization:
- Reduces perceived loading time
- Resources ready when needed
- Happens in background

## Testing

### Unit Tests

Mock the FHIR Resource Loader in tests:

```typescript
jest.mock('./services/fhirResourceLoaderService', () => ({
  loadFHIRResource: jest.fn(),
  loadMultipleFHIRResources: jest.fn(),
}));

test('loads ValueSet on mount', async () => {
  const mockValueSet = { resourceType: 'ValueSet', id: 'test' };
  (loadFHIRResource as jest.Mock).mockResolvedValue(mockValueSet);
  
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(loadFHIRResource).toHaveBeenCalledWith(expectedUrl);
  });
});
```

### Integration Tests

Test with real network requests:

```typescript
test('loads actual FHIR resource', async () => {
  const resource = await loadFHIRResource(
    'http://hl7.org/fhir/ValueSet/administrative-gender'
  );
  
  expect(resource).not.toBeNull();
  expect(resource?.resourceType).toBe('ValueSet');
});
```

## Troubleshooting

### Resource Not Found

If a resource fails to load:
1. Check the canonical URL is correct
2. Verify the published URL is accessible
3. Check if CI build URL fallback is needed
4. Review browser console for network errors

### CORS Issues

If you encounter CORS errors:
1. Ensure the FHIR server supports CORS
2. Consider proxying requests through your backend
3. Use published resources from CORS-enabled servers

### Performance Issues

If loading feels slow:
1. Enable preloading for common resources
2. Use parallel loading with `loadMultipleFHIRResources`
3. Verify caching is enabled (default)
4. Consider adjusting timeout settings

## Bundle Size Verification

After integration, verify the bundle size reduction:

```bash
# Build the application
npm run build

# Check bundle sizes
npm run check-bundle-size

# Expected improvements:
# ✅ Main bundle: <500 KB (from 532 KB)
# ✅ Largest chunk: <2 MB (from 5.64 MB)
# ✅ Total JS: <8 MB (from 10.43 MB)
```

## Next Steps

1. **Identify integration points**: Run grep to find components using FHIR resources
2. **Start with high-impact components**: Focus on components with most FHIR usage
3. **Migrate incrementally**: Convert one component at a time
4. **Test thoroughly**: Ensure functionality is preserved
5. **Measure impact**: Check bundle size after each major migration
6. **Document changes**: Update component documentation

## Resources

- [FHIR Resource Loader Service](../services/fhirResourceLoaderService.ts)
- [FHIR Resource Loader Documentation](fhir-resource-loader.md)
- [Integration Helpers](../utils/fhirResourceIntegration.tsx)
- [Bundle Analysis Report](../BUNDLE_ANALYSIS_REPORT.md)

## Support

For questions or issues:
1. Check this integration guide
2. Review the FHIR Resource Loader documentation
3. Check the service tests for examples
4. Open an issue in the repository
