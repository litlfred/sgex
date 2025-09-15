# fmlrunner Service Requirements for SGEX Integration

## Overview

This document specifies the required API endpoints and service capabilities that fmlrunner must provide to support comprehensive FML/StructureMap authoring, visualization, and execution within the SGEX Workbench.

## Service Architecture Requirements

### Deployment Model
- **Client-Side Integration**: fmlrunner runs as a separate service that SGEX communicates with via REST APIs
- **CORS Support**: Must allow cross-origin requests from SGEX domains
- **Local Development**: Support for local development environment (localhost:8080)
- **Production Deployment**: Configurable base URL for production environments

### Performance Requirements
- **Response Time**: < 500ms for validation requests
- **Throughput**: Support concurrent requests from multiple SGEX users
- **Caching**: Implement intelligent caching for repeated validation requests
- **Timeout Handling**: Graceful handling of long-running transformation operations

## Required API Endpoints

### 1. Health Check and Service Discovery

#### GET /api/v1/health
**Purpose**: Service health monitoring and capability discovery

**Response:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "version": "1.0.0",
  "capabilities": {
    "fmlValidation": true,
    "structureMapTransformation": true,
    "terminologyServices": true,
    "codeCompletion": true
  },
  "uptime": 3600,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. FML Validation and Parsing

#### POST /api/v1/fml/validate
**Purpose**: Validate FML syntax and semantics with detailed error reporting

**Request:**
```json
{
  "fml": "map \"MyMap\" = \"http://example.org/fhir/StructureMap/MyMap\"\n\nuses \"http://...",
  "context": {
    "sourceProfiles": [
      "http://example.org/fhir/StructureDefinition/SourceProfile"
    ],
    "targetProfiles": [
      "http://example.org/fhir/StructureDefinition/TargetProfile"
    ],
    "dependencies": [
      "http://hl7.org/fhir/StructureDefinition/Patient"
    ]
  },
  "validateSemantics": true,
  "includeWarnings": true
}
```

**Response:**
```json
{
  "isValid": false,
  "errors": [
    {
      "line": 5,
      "column": 12,
      "endLine": 5,
      "endColumn": 20,
      "message": "Unknown source element 'invalidField'",
      "severity": "error|warning|info",
      "code": "FML001",
      "category": "syntax|semantic|terminology",
      "suggestion": "Did you mean 'validField'?",
      "context": {
        "sourceElement": "Patient.invalidField",
        "availableElements": ["Patient.name", "Patient.birthDate"]
      }
    }
  ],
  "warnings": [
    {
      "line": 3,
      "column": 8,
      "message": "Unused import statement",
      "severity": "warning",
      "code": "FML002"
    }
  ],
  "parseTree": {
    "mapName": "MyMap",
    "uses": [...],
    "groups": [...],
    "dependencies": [...]
  },
  "validationTime": 250
}
```

#### POST /api/v1/fml/parse
**Purpose**: Parse FML content into StructureMap JSON representation

**Request:**
```json
{
  "fml": "map \"MyMap\" = \"http://example.org/fhir/StructureMap/MyMap\"...",
  "outputFormat": "json|xml",
  "includeMetadata": true
}
```

**Response:**
```json
{
  "success": true,
  "structureMap": {
    "resourceType": "StructureMap",
    "id": "MyMap",
    "url": "http://example.org/fhir/StructureMap/MyMap",
    "name": "MyMap",
    "status": "draft",
    "structure": [...],
    "group": [...]
  },
  "metadata": {
    "parseTime": 150,
    "fmlVersion": "1.0",
    "dependencies": [...]
  }
}
```

### 3. Code Completion and IntelliSense

#### POST /api/v1/fml/complete
**Purpose**: Provide code completion suggestions for FML editing

**Request:**
```json
{
  "fml": "map \"MyMap\" = \"http://example.org/fhir/StructureMap/MyMap\"\n\ngroup main(source src : Patient, target tgt : Patient) {\n  src.",
  "position": {
    "line": 4,
    "column": 6
  },
  "context": {
    "sourceProfiles": ["http://hl7.org/fhir/StructureDefinition/Patient"],
    "targetProfiles": ["http://hl7.org/fhir/StructureDefinition/Patient"]
  },
  "triggerCharacter": "."
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "label": "name",
      "insertText": "name",
      "detail": "HumanName[]",
      "documentation": {
        "value": "A name associated with the patient",
        "kind": "markdown"
      },
      "kind": "field",
      "sortText": "0001",
      "filterText": "name",
      "cardinality": "0..*",
      "type": "HumanName"
    },
    {
      "label": "birthDate",
      "insertText": "birthDate",
      "detail": "date",
      "documentation": "The date of birth for the patient",
      "kind": "field",
      "sortText": "0002"
    }
  ],
  "incomplete": false
}
```

#### POST /api/v1/fml/hover
**Purpose**: Provide hover information for FML elements

**Request:**
```json
{
  "fml": "...",
  "position": { "line": 4, "column": 10 }
}
```

**Response:**
```json
{
  "hover": {
    "contents": [
      {
        "language": "fml",
        "value": "Patient.name : HumanName[]"
      },
      "A name associated with the patient. **Cardinality**: 0..*"
    ],
    "range": {
      "start": { "line": 4, "column": 6 },
      "end": { "line": 4, "column": 10 }
    }
  }
}
```

### 4. StructureMap Transformation

#### POST /api/v1/structuremap/transform
**Purpose**: Execute StructureMap transformation on source resources

**Request:**
```json
{
  "structureMap": {
    "resourceType": "StructureMap",
    "id": "MyMap",
    "...": "... complete StructureMap resource"
  },
  "source": {
    "resourceType": "Patient",
    "id": "example",
    "name": [
      {
        "family": "Doe",
        "given": ["John"]
      }
    ],
    "birthDate": "1980-01-01"
  },
  "parameters": {
    "defaultValues": {
      "system": "http://example.org"
    }
  },
  "options": {
    "includeTrace": true,
    "validateOutput": true,
    "terminologyValidation": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "resourceType": "Patient",
    "id": "transformed-example",
    "meta": {
      "profile": ["http://example.org/fhir/StructureDefinition/TransformedPatient"]
    },
    "name": [
      {
        "family": "Doe",
        "given": ["John"],
        "use": "official"
      }
    ],
    "birthDate": "1980-01-01"
  },
  "logs": [
    {
      "level": "info|warn|error",
      "message": "Applied rule: Patient.name -> Patient.name",
      "timestamp": "2024-01-15T10:30:01Z",
      "location": {
        "fmlLine": 5,
        "ruleName": "main",
        "sourceElement": "Patient.name"
      }
    }
  ],
  "trace": [
    {
      "step": 1,
      "action": "copy",
      "source": "Patient.name[0].family",
      "target": "Patient.name[0].family",
      "value": "Doe"
    }
  ],
  "statistics": {
    "transformationTime": 125,
    "rulesExecuted": 15,
    "elementsProcessed": 8,
    "errorsCount": 0,
    "warningsCount": 1
  },
  "validation": {
    "isValid": true,
    "errors": []
  }
}
```

#### POST /api/v1/structuremap/batch-transform
**Purpose**: Transform multiple resources in a single request

**Request:**
```json
{
  "structureMap": { "...": "StructureMap resource" },
  "sources": [
    { "resourceType": "Patient", "id": "patient1", "...": "..." },
    { "resourceType": "Patient", "id": "patient2", "...": "..." }
  ],
  "parameters": {},
  "options": {
    "continueOnError": true,
    "maxConcurrency": 5
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "sourceId": "patient1",
      "success": true,
      "result": { "...": "transformed resource" },
      "logs": []
    },
    {
      "sourceId": "patient2", 
      "success": false,
      "error": {
        "message": "Transformation failed",
        "code": "TRANSFORM_ERROR",
        "details": "..."
      }
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1,
    "totalTime": 350
  }
}
```

### 5. Terminology Services

#### POST /api/v1/terminology/translate
**Purpose**: Translate concepts using ConceptMaps

**Request:**
```json
{
  "conceptMap": {
    "resourceType": "ConceptMap",
    "...": "complete ConceptMap resource"
  },
  "system": "http://loinc.org",
  "code": "8302-2",
  "target": "http://snomed.info/sct"
}
```

**Response:**
```json
{
  "result": [
    {
      "equivalence": "equal|equivalent|wider|subsumes|narrower|specializes|inexact|unmatched|disjoint",
      "concept": {
        "system": "http://snomed.info/sct",
        "code": "50373000",
        "display": "Body height measure"
      },
      "dependsOn": [],
      "product": []
    }
  ],
  "message": "Translation completed successfully"
}
```

#### POST /api/v1/terminology/validate-code
**Purpose**: Validate codes against ValueSets

**Request:**
```json
{
  "valueSet": {
    "resourceType": "ValueSet",
    "...": "complete ValueSet resource"
  },
  "system": "http://snomed.info/sct",
  "code": "50373000",
  "display": "Body height measure"
}
```

**Response:**
```json
{
  "result": true,
  "message": "Code is valid",
  "display": "Body height measure",
  "system": "http://snomed.info/sct"
}
```

### 6. Debugging and Analysis

#### POST /api/v1/fml/analyze
**Purpose**: Provide detailed analysis of FML mappings

**Request:**
```json
{
  "fml": "...",
  "analysisType": "coverage|complexity|performance|dependencies"
}
```

**Response:**
```json
{
  "coverage": {
    "sourceElementsCovered": 15,
    "sourceElementsTotal": 20,
    "targetElementsCovered": 12,
    "targetElementsTotal": 18,
    "coveragePercentage": 75.0,
    "uncoveredElements": [
      {
        "element": "Patient.telecom",
        "reason": "no_mapping_rule",
        "suggestion": "Consider adding mapping for contact information"
      }
    ]
  },
  "complexity": {
    "totalRules": 25,
    "simpleRules": 18,
    "complexRules": 7,
    "conditionalRules": 5,
    "cyclomaticComplexity": 12,
    "maintainabilityIndex": 85
  },
  "dependencies": {
    "externalProfiles": [...],
    "terminologyDependencies": [...],
    "circularDependencies": []
  }
}
```

## Configuration Requirements

### Environment Variables
```bash
# Service Configuration
FMLRUNNER_PORT=8080
FMLRUNNER_HOST=0.0.0.0

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://litlfred.github.io
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,Accept

# Performance Configuration
MAX_REQUEST_SIZE=50MB
REQUEST_TIMEOUT=30s
CACHE_TTL=300s
MAX_CONCURRENT_REQUESTS=100

# FHIR Configuration
FHIR_VERSION=4.0.1
TERMINOLOGY_SERVER_URL=https://tx.fhir.org/r4
ENABLE_TERMINOLOGY_VALIDATION=true

# Logging Configuration
LOG_LEVEL=INFO
LOG_FORMAT=JSON
ENABLE_REQUEST_LOGGING=true
```

### Security Requirements

#### CORS Configuration
```javascript
// Required CORS headers
Access-Control-Allow-Origin: http://localhost:3000, https://litlfred.github.io
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept, Cache-Control
Access-Control-Max-Age: 86400
```

#### Rate Limiting
- **Per IP**: 1000 requests per minute
- **Per Session**: 100 validation requests per minute
- **Bulk Operations**: 10 batch transformations per minute

#### Input Validation
- **FML Size Limit**: Maximum 1MB per FML content
- **Resource Size Limit**: Maximum 10MB per FHIR resource
- **Batch Size Limit**: Maximum 100 resources per batch request

## Error Handling Standards

### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (invalid input)
- **422**: Unprocessable Entity (validation errors)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error
- **503**: Service Unavailable

### Error Response Format
```json
{
  "error": {
    "code": "FML_VALIDATION_ERROR",
    "message": "FML validation failed",
    "details": "Syntax error on line 5: unexpected token",
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "abc123-def456",
    "context": {
      "line": 5,
      "column": 12,
      "fmlSnippet": "src.invalid -> tgt.field"
    }
  }
}
```

## Performance Specifications

### Response Time Requirements
- **FML Validation**: < 500ms for files up to 100KB
- **Code Completion**: < 200ms for typical requests
- **Simple Transformation**: < 1000ms for single resource
- **Batch Transformation**: < 5000ms for 10 resources

### Throughput Requirements
- **Concurrent Users**: Support 50+ concurrent SGEX users
- **Validation Requests**: 1000+ validations per minute
- **Transformation Requests**: 100+ transformations per minute

### Resource Utilization
- **Memory**: < 2GB for typical workload
- **CPU**: < 80% utilization under normal load
- **Disk**: Minimal temporary storage for caching

## Testing Requirements

### Unit Test Coverage
- **API Endpoints**: 100% coverage
- **FML Parsing**: Comprehensive test cases
- **Transformation Engine**: Edge case testing
- **Error Handling**: All error scenarios covered

### Integration Testing
- **SGEX Integration**: End-to-end workflow testing
- **FHIR Compliance**: Validation against FHIR specification
- **Performance Testing**: Load testing with concurrent requests

### Test Data Requirements
- **Sample FML Files**: Various complexity levels
- **FHIR Resources**: Patient, Observation, etc.
- **StructureMaps**: Real-world mapping scenarios
- **Error Cases**: Invalid FML and malformed resources

## Monitoring and Observability

### Health Metrics
- **Service Uptime**: 99.9% availability target
- **Response Times**: P95 < 1000ms
- **Error Rates**: < 1% for valid requests
- **Cache Hit Rates**: > 80% for validation requests

### Logging Requirements
- **Request Logging**: All API calls with timing
- **Error Logging**: Detailed error information
- **Performance Logging**: Response times and resource usage
- **Audit Logging**: Transformation operations and results

### Metrics Endpoints
```
GET /api/v1/metrics/health
GET /api/v1/metrics/performance  
GET /api/v1/metrics/usage
```

## Version Compatibility

### API Versioning
- **Current Version**: v1
- **Backwards Compatibility**: Support for previous minor versions
- **Deprecation Policy**: 6-month notice for breaking changes
- **Version Header**: `Accept: application/vnd.fmlrunner.v1+json`

### FML Language Support
- **FML Version**: Support latest FHIR Mapping Language specification
- **FHIR Version**: Primary support for R4, R5 compatibility
- **Backwards Compatibility**: Support for older FML syntax where possible

---

*This specification ensures that fmlrunner provides all necessary capabilities for comprehensive FML/StructureMap integration within the SGEX Workbench, following REST API best practices and performance requirements.*