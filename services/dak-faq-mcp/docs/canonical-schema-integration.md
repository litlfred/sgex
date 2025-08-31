# WHO SMART Guidelines Canonical Schema Integration

## Overview

The DAK FAQ MCP service has been enhanced to integrate with WHO SMART Guidelines canonical ValueSets and Logical Models. This enables better validation, standardization, and interoperability with FHIR Implementation Guides.

## Key Features

### 1. Canonical Schema Service

The `CanonicalSchemaService` provides:
- Loading and caching of WHO ValueSets and Logical Models
- Mock schema generation for development and testing
- Fallback mechanisms when canonical URLs are unavailable
- Memory and disk caching for performance

### 2. Enhanced Question Definitions

Questions can now include:
- **Canonical References**: Links to WHO ValueSets or Logical Models
- **ValueSet Bindings**: Parameter validation against specific ValueSets
- **Enhanced Schemas**: JSON schemas with canonical metadata

### 3. New API Endpoints

#### Canonical Schema Operations

```bash
# Get known canonical references
GET /faq/canonical/known

# Validate data against canonical schema
POST /faq/canonical/validate
{
  "canonicalUrl": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json",
  "data": {"code": "business-processes"}
}

# Expand ValueSet to get all codes
GET /faq/canonical/valuesets/https%3A%2F%2F...%2FValueSet-DAKComponentType.schema.json/expand

# Validate code against ValueSet
POST /faq/canonical/valuesets/validate-code
{
  "valueSetUrl": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json",
  "code": "business-processes"
}

# Load canonical schema
GET /faq/canonical/schemas/https%3A%2F%2F...%2FValueSet-DAKComponentType.schema.json

# Get ValueSets for question parameters
GET /faq/canonical/questions/:questionId/valuesets

# Cache management
GET /faq/canonical/cache/stats
DELETE /faq/canonical/cache
```

## Creating Enhanced Question Definitions

### Basic Question with Canonical References

```json
{
  "id": "my-question",
  "level": "component",
  "title": "My Question Title",
  "description": "Question description",
  "parameters": [
    {
      "name": "componentType",
      "type": "string",
      "required": true,
      "description": "Type of DAK component",
      "valueSetBinding": {
        "strength": "required",
        "valueSetUrl": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json",
        "description": "DAK Component Types ValueSet"
      }
    }
  ],
  "canonicalRefs": [
    {
      "type": "ValueSet",
      "url": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json",
      "description": "Component types defined in WHO SMART Guidelines",
      "purpose": "parameter validation"
    }
  ],
  "schema": {
    "input": {
      "type": "object",
      "properties": {
        "componentType": {
          "type": "string",
          "x-valueset-binding": {
            "strength": "required",
            "valueSetUrl": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json"
          },
          "externalDocs": {
            "description": "Browse DAK Component Types ValueSet",
            "url": "https://worldhealthorganization.github.io/smart-base/ValueSet-DAKComponentType.schema.json"
          }
        }
      },
      "required": ["componentType"]
    },
    "output": {
      "type": "object",
      "properties": {
        "structured": {"type": "object"},
        "narrative": {"type": "string"},
        "errors": {"type": "array", "items": {"type": "string"}},
        "warnings": {"type": "array", "items": {"type": "string"}},
        "meta": {"type": "object"}
      }
    }
  }
}
```

### ValueSet Binding Strengths

- **required**: Parameter value MUST be from the ValueSet
- **extensible**: Parameter value SHOULD be from the ValueSet (warnings for invalid codes)
- **preferred**: Parameter value is RECOMMENDED to be from the ValueSet
- **example**: ValueSet provides examples only

## Available WHO Canonical References

The service includes references to these WHO SMART Guidelines resources:

### ValueSets
- **CDHIv1**: Core DAK Health Interventions (8 core components)
- **DAKComponentType**: DAK component classification
- **ActorType**: Health workflow actor types

### Logical Models
- **DAK**: Digital Adaptation Kit structure definition

## Enhanced Validation

Questions with canonical references provide enhanced validation:

```typescript
// Enhanced validation result
interface CanonicalValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedAgainst: string[]; // URLs of canonicals used
}
```

### Example Validation

```javascript
// Valid component type
{
  "componentType": "business-processes",
  "actorType": "person"
}
// Result: isValid=true, validatedAgainst=["https://...ValueSet-DAKComponentType.schema.json"]

// Invalid component type
{
  "componentType": "invalid-component"
}
// Result: isValid=false, errors=["Parameter componentType value 'invalid-component' is not valid for required ValueSet..."]
```

## Caching and Performance

### Cache Behavior
- **Memory Cache**: Fast access to frequently used schemas
- **Disk Cache**: Persistent storage for offline access
- **TTL**: 24-hour cache expiration by default
- **Fallback**: Graceful degradation when canonical URLs unavailable

### Cache Management

```bash
# Check cache status
curl http://127.0.0.1:3001/faq/canonical/cache/stats

# Clear cache
curl -X DELETE http://127.0.0.1:3001/faq/canonical/cache
```

## OpenAPI Integration

The enhanced OpenAPI documentation includes:
- Canonical schema references in parameter documentation
- External links to browse ValueSets
- Enhanced schema descriptions with WHO compliance notes

Access via: `GET /faq/openapi`

## Development Workflow

### 1. Define Question with Canonical References

Create question definition JSON with:
- `canonicalRefs` array for schema references
- `valueSetBinding` for parameters requiring ValueSet validation
- Enhanced `schema` with canonical metadata

### 2. Test Validation

```bash
# Test parameter validation
curl -X POST http://127.0.0.1:3001/faq/validate \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "my-question",
    "parameters": {"componentType": "business-processes"}
  }'
```

### 3. Verify ValueSet Integration

```bash
# Get available codes for parameter
curl http://127.0.0.1:3001/faq/canonical/questions/my-question/valuesets
```

## Error Handling

The service provides graceful error handling:
- **Network Failures**: Fall back to cached schemas
- **Invalid URLs**: Clear error messages with fallback options
- **Validation Errors**: Detailed parameter-level error reporting
- **Cache Issues**: Warnings without blocking functionality

## Future Enhancements

- Real network access to canonical URLs (currently uses mock schemas)
- Integration with FHIR terminology servers
- Support for additional WHO SMART Guidelines resources
- Advanced caching strategies
- Performance optimizations for large ValueSets

## Troubleshooting

### Common Issues

1. **Cache Directory Permissions**
   - Ensure write access to `services/dak-faq-mcp/cache/canonical/`

2. **Network Access**
   - Currently uses mock schemas; real URLs will require network access

3. **Question Loading**
   - Ensure questions directory is properly copied to dist/ during build

4. **TypeScript Compilation**
   - Run `npm run build` after making changes to TypeScript files

### Debug Commands

```bash
# Check server health
curl http://127.0.0.1:3001/health

# List available endpoints
curl http://127.0.0.1:3001/

# Check cache statistics
curl http://127.0.0.1:3001/faq/canonical/cache/stats
```

---

This integration provides a foundation for WHO SMART Guidelines compliance and enables better standardization across DAK FAQ functionality.