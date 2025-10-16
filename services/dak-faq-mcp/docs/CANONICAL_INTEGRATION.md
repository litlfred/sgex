# WHO SMART Guidelines Canonical Integration Guide

## Overview

This document describes how the DAK FAQ MCP service integrates with WHO SMART Guidelines canonical resources (ValueSets, Logical Models, and FHIR profiles) published at https://worldhealthorganization.github.io/smart-base/.

## Architecture

### Key Components

1. **CanonicalSchemaService** (`server/util/CanonicalSchemaService.ts`)
   - Fetches canonical schemas from WHO SMART Guidelines repositories
   - Caches schemas locally for performance and offline support
   - Validates values against ValueSet enumerations
   - Manages cache expiration and updates

2. **FAQSchemaService** (`server/util/FAQSchemaService.ts`)
   - Enhanced to recognize `x-canonical-url` schema extensions
   - Automatically fetches and integrates canonical schemas
   - Validates parameters against canonical ValueSets
   - Generates enriched OpenAPI documentation

3. **Audit Tool** (`scripts/audit-canonical-refs.ts`)
   - Scans all question schemas for canonical references
   - Identifies opportunities to add canonical references
   - Reports on canonical integration status

## Adding Canonical References to Schemas

### Using x-canonical-url Extension

Add the `x-canonical-url` field to any schema property that should reference a WHO canonical resource:

```json
{
  "type": "string",
  "description": "Type of DAK component",
  "x-canonical-url": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json",
  "x-canonical-note": "Optional note explaining the canonical reference"
}
```

### Example: ValueSet Reference

For a parameter that should use values from a WHO ValueSet:

```json
{
  "componentType": {
    "type": "string",
    "description": "DAK component type filter",
    "x-canonical-url": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json",
    "enum": [
      "business-processes",
      "decision-support-logic",
      "indicators-measures"
    ]
  }
}
```

**Note:** When `x-canonical-url` is present, the service will:
1. Fetch the ValueSet schema from the URL
2. Extract valid enum values from the ValueSet
3. Validate input parameters against those values
4. Include the canonical reference in generated documentation

### Example: Logical Model Reference

For complex objects that follow a WHO Logical Model:

```json
{
  "dakMetadata": {
    "type": "object",
    "$ref": "https://worldhealthorganization.github.io/smart-base/StructureDefinition-DAK.schema.json",
    "x-canonical-url": "https://worldhealthorganization.github.io/smart-base/StructureDefinition-DAK.schema.json",
    "description": "DAK metadata following WHO SMART Guidelines Logical Model"
  }
}
```

## Caching Mechanism

### Cache Location
- **Directory:** `services/dak-faq-mcp/.cache/canonical-schemas/`
- **Format:** JSON files with sanitized URL names
- **Duration:** 24 hours (configurable)

### Cache Management

```typescript
import { CanonicalSchemaService } from './server/util/CanonicalSchemaService.js';

const service = CanonicalSchemaService.getInstance();

// Clear expired cache entries
await service.clearExpiredCache();

// Clear all cache
await service.clearCache();

// View cached resources
const cached = service.getCachedResources();
console.log(cached);
```

### Offline Support

If a canonical resource cannot be fetched:
1. Service checks for cached version (even if expired)
2. Warning is logged but processing continues
3. Validation falls back to hand-authored enum values if present

## Validation

### Automatic Validation

When a parameter has a `x-canonical-url`:

```typescript
// In FAQSchemaService.validateQuestionParameters()
// Automatically validates against the canonical ValueSet

const result = await schemaService.validateQuestionParameters(
  'data-elements',
  { type: 'Profile' }
);

if (!result.isValid) {
  console.error(result.errors);
}
```

### Manual Validation

For custom validation needs:

```typescript
import { CanonicalSchemaService } from './server/util/CanonicalSchemaService.js';

const service = CanonicalSchemaService.getInstance();

const validation = await service.validateAgainstValueSet(
  'business-processes',
  'https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json'
);

console.log(validation.isValid); // true/false
console.log(validation.error);   // error message if invalid
```

## Known WHO SMART Guidelines Canonical Resources

### ValueSets

| ValueSet | URL | Description |
|----------|-----|-------------|
| CDHIv1 | https://worldhealthorganization.github.io/smart-base/ValueSet-CDHIv1.schema.json | Core Data for Health Indicators |
| DAKComponentType | https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json | Types of DAK components |

### Logical Models

| Model | URL | Description |
|-------|-----|-------------|
| DAK | https://worldhealthorganization.github.io/smart-base/StructureDefinition-DAK.schema.json | Digital Adaptation Kit structure |

### Finding More Canonicals

1. Browse the smart-base repository:
   - https://github.com/WorldHealthOrganization/smart-base/tree/main/files/input/fsh/models

2. View published schemas:
   - https://worldhealthorganization.github.io/smart-base/

3. Use the IG Publisher output:
   - Look for `*.schema.json` files in the published IG

## Audit and Maintenance

### Running the Audit

```bash
cd services/dak-faq-mcp
npm run audit:canonicals
```

Output includes:
- Questions with canonical references ✅
- Questions without canonical references ⚠️
- Suggestions for adding references 💡
- Cached canonical resources 📦

### When to Update Schemas

1. **New WHO ValueSets Released**
   - Clear cache: `service.clearCache()`
   - Update `x-canonical-url` references if needed
   - Re-run audit to verify

2. **Question Schemas Changed**
   - Run audit after schema modifications
   - Check for opportunities to add canonical references
   - Verify existing references still work

3. **Canonical URLs Change**
   - Update `x-canonical-url` fields in question definitions
   - Clear cache to force re-fetch
   - Test validation with new URLs

## Best Practices

### 1. Prefer Canonical References Over Hard-Coded Enums

❌ **Don't:**
```json
{
  "type": {
    "enum": ["type1", "type2", "type3"]
  }
}
```

✅ **Do:**
```json
{
  "type": {
    "x-canonical-url": "https://worldhealthorganization.github.io/smart-base/ValueSet-SomeType.schema.json",
    "enum": ["type1", "type2", "type3"]
  }
}
```

Keep the enum for offline support, but add the canonical reference.

### 2. Document Canonical Mappings

Always add `x-canonical-note` to explain why a canonical is used:

```json
{
  "x-canonical-url": "...",
  "x-canonical-note": "Aligns with WHO SMART Guidelines DAK component taxonomy"
}
```

### 3. Handle Canonical Fetch Failures Gracefully

Always provide fallback enum values for critical parameters:

```json
{
  "status": {
    "enum": ["draft", "active", "retired"],
    "x-canonical-url": "https://worldhealthorganization.github.io/smart-base/ValueSet-PublicationStatus.schema.json"
  }
}
```

### 4. Version Canonical References

When referencing versioned canonicals, include version in URL:

```json
{
  "x-canonical-url": "https://worldhealthorganization.github.io/smart-base/ValueSet-CDHIv1.schema.json|1.0.0"
}
```

### 5. Test Canonical Integration

Before committing schema changes:

```bash
# Build and run audit
npm run audit:canonicals

# Test question execution with canonical validation
npm run start-mcp
```

## OpenAPI Documentation Enhancement

Schemas with canonical references are automatically enhanced in OpenAPI output:

```yaml
components:
  schemas:
    data-elements-input:
      properties:
        type:
          type: string
          description: "Type of data element\n\nCanonical: https://worldhealthorganization.github.io/smart-base/ValueSet-DataElementType.schema.json"
          enum: [Profile, Extension, ValueSet, CodeSystem]
          x-canonical-resource:
            url: https://worldhealthorganization.github.io/smart-base/ValueSet-DataElementType.schema.json
            type: ValueSet
            lastFetched: 2025-01-15T10:30:00Z
```

## Troubleshooting

### Problem: Canonical fetch fails

**Solution:**
1. Check network connectivity
2. Verify URL is correct and accessible
3. Check cache for fallback: `service.getCachedResources()`
4. Ensure fallback enum values exist in schema

### Problem: Validation fails unexpectedly

**Solution:**
1. Run audit to verify canonical references
2. Check if ValueSet has been updated
3. Clear cache and re-fetch: `service.clearCache()`
4. Verify parameter value matches canonical values

### Problem: Cache grows too large

**Solution:**
1. Run periodic cleanup: `service.clearExpiredCache()`
2. Adjust cache duration in `CanonicalSchemaService` constructor
3. Add `.cache/` to `.gitignore`

## Future Enhancements

Potential improvements to the canonical integration:

1. **Subscription to WHO Updates**
   - Webhook or polling for canonical schema updates
   - Automatic cache invalidation on updates

2. **Canonical Validation in MCP Tools**
   - Add tool-level validation before execution
   - Return validation errors via MCP error responses

3. **Canonical Browser UI**
   - Web interface to browse cached canonicals
   - Visual mapping of questions to canonicals

4. **Canonical Version Management**
   - Support multiple versions of same canonical
   - Automatic migration when canonicals change

5. **Extended Canonical Types**
   - Support for more FHIR resource types
   - Integration with OCL, PCMT canonical sources

## Resources

- **WHO SMART Guidelines:** https://smart.who.int/
- **smart-base Repository:** https://github.com/WorldHealthOrganization/smart-base
- **Published IG:** https://worldhealthorganization.github.io/smart-base/
- **FHIR R4 Spec:** https://hl7.org/fhir/R4/
- **MCP Specification:** https://modelcontextprotocol.io/

---

**Maintainers:** Please keep this document updated as new canonical resources are identified and integration patterns evolve.
