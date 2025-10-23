# DAK FAQ MCP Server API Documentation

## Overview

The DAK FAQ MCP (Model Context Protocol) Server provides a comprehensive API for accessing Digital Adaptation Kit (DAK) information and FAQ functionality. All endpoints are rooted under `/mcp` for Model Context Protocol compatibility and designed for local-only operation.

## Base URL

```
http://127.0.0.1:3001/mcp
```

⚠️ **Security Note**: This server is designed for local use only and binds to 127.0.0.1 exclusively. It should never be exposed to remote networks.

## Authentication

No authentication is required as the server operates in a local-only environment.

## OpenAPI Specification

The complete OpenAPI 3.x specification is available at:
- **File**: `services/dak-faq-mcp/openapi.yaml`
- **Live endpoint**: `GET /mcp/faq/openapi` (when server is running)

## Core Endpoints

### Health Check

#### `GET /mcp/health`

Returns server health status and version information.

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T12:00:00.000Z",
  "version": "1.0.0",
  "description": "DAK FAQ MCP Server - Local Only"
}
```

### FAQ Question Management

#### `GET /mcp/faq/questions/catalog`

Returns available FAQ questions with optional filtering.

**Query Parameters:**
- `level` (optional): Filter by question level (`dak`, `component`, `asset`)
- `tags` (optional): Comma-separated list of tags
- `componentType` (optional): Filter by component type
- `assetType` (optional): Filter by asset type
- `format` (optional): Response format (`json`, `openapi`)

**Example Request:**
```bash
curl "http://127.0.0.1:3001/mcp/faq/questions/catalog?level=dak&tags=metadata"
```

**Response Example:**
```json
{
  "success": true,
  "timestamp": "2025-01-08T12:00:00.000Z",
  "filters": {
    "level": "dak",
    "tags": ["metadata"]
  },
  "count": 3,
  "questions": [
    {
      "id": "dak-name",
      "level": "dak",
      "title": "DAK Name",
      "description": "Get the name of the Digital Adaptation Kit",
      "parameters": [],
      "tags": ["metadata", "basic"]
    }
  ]
}
```

#### `POST /mcp/faq/questions/execute`

Execute one or more FAQ questions in batch.

**Request Body:**
```json
{
  "requests": [
    {
      "questionId": "dak-name",
      "parameters": {
        "locale": "en_US"
      }
    }
  ],
  "context": {
    "repositoryPath": "/path/to/dak"
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "timestamp": "2025-01-08T12:00:00.000Z",
  "results": [
    {
      "questionId": "dak-name",
      "success": true,
      "result": {
        "structured": { "name": "Example DAK" },
        "narrative": "<h4>DAK Name</h4><p>The name of this DAK is <strong>Example DAK</strong>.</p>",
        "errors": [],
        "warnings": [],
        "meta": {}
      },
      "timestamp": "2025-01-08T12:00:00.000Z"
    }
  ],
  "summary": {
    "total": 1,
    "successful": 1,
    "failed": 0
  }
}
```

#### `POST /mcp/faq/execute`

Execute a single FAQ question (alternative endpoint).

**Request Body:**
```json
{
  "questionId": "dak-name",
  "parameters": {
    "locale": "en_US"
  },
  "context": {
    "repositoryPath": "/path/to/dak"
  }
}
```

## DAK Component Endpoints

These endpoints provide information about the various components available in a Digital Adaptation Kit.

### Value Sets

#### `GET /mcp/faq/valuesets`

Returns a list of all value sets available in the DAK.

**Response Example:**
```json
{
  "success": true,
  "timestamp": "2025-01-08T12:00:00.000Z",
  "count": 3,
  "valueSets": [
    {
      "id": "anc-care-settings",
      "name": "ANC Care Settings",
      "description": "Settings where antenatal care can be provided",
      "conceptCount": 5
    },
    {
      "id": "pregnancy-risk-factors",
      "name": "Pregnancy Risk Factors",
      "description": "Risk factors during pregnancy",
      "conceptCount": 12
    }
  ]
}
```

**Value Set Properties:**
- `id`: Unique identifier for the value set
- `name`: Human-readable name
- `description`: Optional description of the value set
- `conceptCount`: Optional number of concepts in the value set

### Decision Tables

#### `GET /mcp/faq/decision-tables`

Returns a list of all decision tables (DMN files) available in the DAK.

**Response Example:**
```json
{
  "success": true,
  "timestamp": "2025-01-08T12:00:00.000Z",
  "count": 3,
  "decisionTables": [
    {
      "id": "anc-contact-schedule",
      "name": "ANC Contact Schedule",
      "description": "Decision logic for scheduling antenatal care contacts",
      "file": "input/pagecontent/anc-contact-schedule.dmn"
    },
    {
      "id": "immunization-schedule",
      "name": "Immunization Schedule",
      "description": "Decision logic for immunization scheduling",
      "file": "input/pagecontent/immunization-schedule.dmn"
    }
  ]
}
```

**Decision Table Properties:**
- `id`: Unique identifier for the decision table
- `name`: Human-readable name
- `description`: Optional description of the decision logic
- `file`: Path to the DMN file containing the decision table

### Business Processes

#### `GET /mcp/faq/business-processes`

Returns a list of business processes defined in the DAK.

**Response Example:**
```json
{
  "success": true,
  "timestamp": "2025-01-08T12:00:00.000Z",
  "count": 3,
  "businessProcesses": [
    {
      "id": "anc-contact-process",
      "name": "ANC Contact Process",
      "description": "End-to-end process for antenatal care contacts"
    },
    {
      "id": "immunization-workflow",
      "name": "Immunization Workflow",
      "description": "Workflow for vaccine administration and tracking"
    }
  ]
}
```

**Business Process Properties:**
- `id`: Unique identifier for the business process
- `name`: Human-readable name
- `description`: Optional description of the process

### Personas

#### `GET /mcp/faq/personas`

Returns a list of personas/actors defined in the DAK.

**Response Example:**
```json
{
  "success": true,
  "timestamp": "2025-01-08T12:00:00.000Z",
  "count": 4,
  "personas": [
    {
      "id": "anc-nurse",
      "name": "ANC Nurse",
      "role": "Healthcare Provider",
      "description": "Nurse specializing in antenatal care services"
    },
    {
      "id": "community-health-worker",
      "name": "Community Health Worker",
      "role": "Community Healthcare",
      "description": "Health worker providing services at community level"
    }
  ]
}
```

**Persona Properties:**
- `id`: Unique identifier for the persona
- `name`: Human-readable name
- `role`: Optional role of the persona
- `description`: Optional description of the persona

### Questionnaires

#### `GET /mcp/faq/questionnaires`

Returns a list of questionnaires available in the DAK.

**Response Example:**
```json
{
  "success": true,
  "timestamp": "2025-01-08T12:00:00.000Z",
  "count": 4,
  "questionnaires": [
    {
      "id": "anc-registration",
      "name": "ANC Registration",
      "description": "Initial registration questionnaire for antenatal care",
      "questionCount": 15
    },
    {
      "id": "anc-contact",
      "name": "ANC Contact",
      "description": "Questionnaire for routine antenatal care contacts",
      "questionCount": 25
    }
  ]
}
```

**Questionnaire Properties:**
- `id`: Unique identifier for the questionnaire
- `name`: Human-readable name
- `description`: Optional description of the questionnaire
- `questionCount`: Optional number of questions in the questionnaire

## Error Handling

All endpoints return consistent error responses in case of failures:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "MACHINE_READABLE_ERROR_CODE",
    "timestamp": "2025-01-08T12:00:00.000Z",
    "details": ["Additional error details if available"],
    "path": "/mcp/faq/endpoint",
    "method": "GET"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Invalid request format or missing required fields
- `CATALOG_ERROR`: Error retrieving FAQ catalog
- `EXECUTION_ERROR`: Error executing FAQ questions
- `VALUESETS_ERROR`: Error retrieving value sets
- `DECISION_TABLES_ERROR`: Error retrieving decision tables
- `BUSINESS_PROCESSES_ERROR`: Error retrieving business processes
- `PERSONAS_ERROR`: Error retrieving personas
- `QUESTIONNAIRES_ERROR`: Error retrieving questionnaires
- `NOT_FOUND`: Requested resource not found
- `INTERNAL_ERROR`: Internal server error

## Usage Examples

### Starting the Server

```bash
cd services/dak-faq-mcp
npm install
npm start
```

### Testing Endpoints

```bash
# Health check
curl http://127.0.0.1:3001/mcp/health

# Get all value sets
curl http://127.0.0.1:3001/mcp/faq/valuesets

# Get decision tables
curl http://127.0.0.1:3001/mcp/faq/decision-tables

# Get business processes
curl http://127.0.0.1:3001/mcp/faq/business-processes

# Get personas
curl http://127.0.0.1:3001/mcp/faq/personas

# Get questionnaires
curl http://127.0.0.1:3001/mcp/faq/questionnaires

# Get FAQ catalog with filtering
curl "http://127.0.0.1:3001/mcp/faq/questions/catalog?level=dak&tags=metadata"
```

### Executing FAQ Questions

```bash
curl -X POST http://127.0.0.1:3001/mcp/faq/questions/execute \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "questionId": "dak-name",
        "parameters": {
          "locale": "en_US"
        }
      }
    ],
    "context": {
      "repositoryPath": "/path/to/dak"
    }
  }'
```

## Integration Notes

### Model Context Protocol (MCP) Compatibility

This server follows MCP conventions:
- All endpoints under `/mcp` prefix
- Standardized JSON request/response formats
- Consistent error handling patterns
- Local-only operation for security

### WHO SMART Guidelines Compliance

The server provides access to WHO SMART Guidelines DAK components:
- Value sets for terminology management
- Decision tables for clinical decision support
- Business processes for workflow definition
- Personas for user role management
- Questionnaires for data collection

### Development Workflow

1. **Local Development**: Server runs on 127.0.0.1:3001
2. **CORS Configuration**: Allows localhost:3000 for web UI integration
3. **Security**: No remote access, local binding only
4. **Data Format**: All responses use structured JSON with timestamps

## Related Documentation

- [DAK Components Overview](dak-components.md) - General DAK component information
- [Solution Architecture](solution-architecture.md) - Overall system architecture
- [Requirements](requirements.md) - Functional and non-functional requirements
- OpenAPI specification: `services/dak-faq-mcp/openapi.yaml`