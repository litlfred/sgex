# DAK FAQ Model Context Protocol (MCP) Documentation

This directory contains documentation for the DAK FAQ MCP service implementation.

## Overview

The DAK FAQ MCP service provides a RESTful API for accessing WHO SMART Guidelines Digital Adaptation Kit (DAK) information through structured FAQ questions and DAK component endpoints.

## Documentation Files

### Core Documentation
- **[dak-faq-mcp-api.md](./dak-faq-mcp-api.md)** - Complete API documentation with usage examples
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.x specification for the service

### Quick Reference

#### Service Information
- **Base URL**: `http://127.0.0.1:3001/mcp`
- **Protocol**: REST API with JSON responses
- **Security**: Local binding only (127.0.0.1:3001)

#### Available Endpoints

##### FAQ Questions API
- `GET /faq/questions/catalog` - List all available FAQ questions with filtering
- `POST /faq/questions/execute` - Execute multiple FAQ questions in batch
- `POST /faq/execute` - Execute single FAQ question (alias)

##### DAK Components API
- `GET /faq/valuesets` - Get all value sets in the DAK
- `GET /faq/decision-tables` - Get all decision tables (DMN files)
- `GET /faq/business-processes` - Get all business processes
- `GET /faq/personas` - Get all personas/actors
- `GET /faq/questionnaires` - Get all questionnaires

##### Health Check
- `GET /health` - Service health and version information

## Usage Examples

### Get Available Questions
```bash
curl http://127.0.0.1:3001/mcp/faq/questions/catalog
```

### Get DAK Value Sets
```bash
curl http://127.0.0.1:3001/mcp/faq/valuesets
```

### Execute FAQ Question
```bash
curl -X POST http://127.0.0.1:3001/mcp/faq/execute \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "dak-name",
    "parameters": {
      "repository": "who/smart-immunizations"
    }
  }'
```

## Integration Notes

This MCP service is designed to integrate with:
- AI assistants and chatbots
- Development environments requiring DAK information
- Automated documentation systems
- Clinical decision support tools

## WHO SMART Guidelines Compliance

All endpoints and responses follow WHO SMART Guidelines Digital Adaptation Kit standards and terminology. The service provides both Level 2 (L2) business logic representations and references to Level 3 (L3) FHIR R4 implementations.

## Development and Deployment

For development setup and deployment information, see:
- Service source code: `services/dak-faq-mcp/`
- Main project documentation: `public/docs/`
- Deployment guides: `DEPLOYMENT.md`