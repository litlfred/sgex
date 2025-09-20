# MCP Services Documentation

SGEX Workbench includes comprehensive Model Context Protocol (MCP) services that provide structured API access to DAK information and publication capabilities. This documentation covers all available MCP services, their endpoints, usage, and integration.

## Overview

The SGEX MCP services architecture provides:

- **Local-only security**: All services bind to localhost (127.0.0.1) for development safety
- **Centralized logging**: Enhanced logging with service category filtering and SGEX integration
- **Interactive management**: Terminal-based service management with real-time monitoring
- **Service discovery**: Dynamic discovery and health monitoring of running services
- **Standards compliance**: OpenAPI documentation and structured API responses

## Available MCP Services

### 1. DAK FAQ MCP Service

**Service Category**: `mcp-dak-faq`  
**Port**: 3001  
**Base URL**: `http://127.0.0.1:3001/mcp`  
**Purpose**: Provides comprehensive FAQ functionality and DAK component access

#### Endpoints (14 total)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/faq/questions/catalog` | List all available FAQ questions |
| POST | `/faq/questions/execute` | Execute FAQ questions in batch |
| POST | `/faq/execute/:questionId` | Execute specific FAQ question by ID |
| POST | `/faq/execute` | Execute single FAQ question |
| GET | `/faq/schemas` | Get all question schemas |
| GET | `/faq/schemas/:questionId` | Get schema for specific question |
| GET | `/faq/openapi` | Get OpenAPI schema for all questions |
| POST | `/faq/validate` | Validate question parameters |
| GET | `/faq/valuesets` | List value sets available in DAK |
| GET | `/faq/decision-tables` | List decision tables in DAK |
| GET | `/faq/business-processes` | List business processes in DAK |
| GET | `/faq/personas` | List personas/actors in DAK |
| GET | `/faq/questionnaires` | List questionnaires in DAK |

#### Service Discovery

The DAK FAQ MCP service provides service registry capabilities at:

```bash
GET http://127.0.0.1:3001/mcp/services
```

This endpoint dynamically discovers all running MCP services and returns metadata including:
- Service capabilities and endpoints
- Health status and uptime
- Functionality grouping
- Transport protocols

### 2. DAK Publication API Service

**Service Category**: `mcp-publication-api`  
**Port**: 3002  
**Base URL**: `http://127.0.0.1:3002`  
**Purpose**: OpenAPI-driven DAK publication generation with WYSIWYG-first architecture

#### Endpoints (16 total)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service information and status |
| GET | `/status` | Detailed service health check |
| GET | `/api/templates` | List publication templates |
| POST | `/api/templates` | Create new publication template |
| GET | `/api/templates/:id` | Get specific template |
| PUT | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |
| GET | `/api/variables` | List template variables |
| POST | `/api/variables` | Create template variable |
| GET | `/api/content` | List generated content |
| POST | `/api/content` | Generate content from template |
| POST | `/api/publications` | Create publication |
| GET | `/api/publications/:id` | Get publication details |
| GET | `/api/integrations` | List external integrations |
| POST | `/api/integrations` | Configure integration |
| GET | `/docs` | Swagger/OpenAPI documentation |

#### Features

- **Template Management**: WYSIWYG template creation and editing
- **Variable Substitution**: Dynamic content generation
- **Publication Workflows**: Complete publication pipeline
- **External Integrations**: Connectivity to publishing systems
- **OpenAPI Documentation**: Complete API documentation at `/docs`

### 3. SGEX Web Application Service

**Service Category**: `web-service`  
**Port**: 3000  
**Base URL**: `http://localhost:3000/sgex`  
**Purpose**: Main SGEX Workbench web application

## Service Management

### Individual Service Setup

Using **DAK FAQ MCP Service** as an example:

```bash
cd services/dak-faq-mcp
npm install
npm start
```

Similarly for **DAK Publication API Service**:

```bash
cd services/dak-publication-api
npm install
npm start
```

### Unified Service Management

#### Interactive Mode (Recommended for Development)

```bash
npm run run-all-services-interactive
```

**Features**:
- Split-screen terminal interface with service status indicators
- Real-time scrollable logging buffer with color-coded messages
- Service category filtering (`mcp-dak-faq`, `mcp-publication-api`, `web-service`)
- Log level filtering (`error`, `warn`, `info`, `debug`)
- Search text filtering
- Keyboard shortcuts for service control
- Uptime tracking and performance monitoring

**Controls**:
- `[1]` - Start DAK FAQ MCP Service
- `[2]` - Start DAK Publication API Service  
- `[3]` - Start SGEX Web Application
- `[a]` - Start All Services
- `[s]` - Stop All Services
- `[f]` - Configure Log Filters
- `[h]` - Show Help
- `[q]` - Quit

#### Non-Interactive Mode (CI/CD, Scripting)

```bash
npm run run-all-services-non-interactive
```

**Features**:
- Stderr logging suitable for background execution
- Color-coded service prefixes for identification
- Environment variable `MCP_INTERACTIVE=false`
- Graceful shutdown handling

#### Basic Mode (Backward Compatibility)

```bash
npm run run-all-services
```

## Enhanced Logging System

### Features

- **Service Lifecycle Logging**: Initialization, running status, graceful shutdown with uptime
- **API Query Monitoring**: Request/response logging with timing and status codes
- **Error Tracking**: Stack traces and detailed error information
- **SGEX Integration**: Leverages existing SGEX logging service when available
- **Category-based Filtering**: Filter logs by service category, level, or search text
- **Log History**: Maintains searchable log history with configurable buffer size

### Log Categories

| Category | Description | Example Services |
|----------|-------------|------------------|
| `SERVICE_INIT` | Service initialization and startup | All services |
| `SERVICE_RUNNING` | Service ready and operational status | All services |
| `SERVICE_SHUTDOWN` | Service shutdown and cleanup | All services |
| `API_QUERY` | HTTP request/response logging with timing | MCP services |
| `SERVICE_DISCOVERY` | MCP service registry operations | DAK FAQ MCP |
| `SERVER_ERROR` | Error conditions and stack traces | All services |

### Service Categories

| Category | Services | Purpose |
|----------|----------|---------|
| `mcp-dak-faq` | DAK FAQ MCP Service | FAQ functionality and DAK components |
| `mcp-publication-api` | DAK Publication API Service | Publication generation and templates |
| `web-service` | SGEX Web Application | Main workbench interface |
| `shared-service` | Service Manager, Shared utilities | Cross-service functionality |

### Environment Variables

```bash
# Logging configuration
MCP_INTERACTIVE=true          # Enable interactive terminal mode
MCP_LOG_LEVEL=info            # Set log level (error/warn/info/debug/trace)
MCP_LOG_FILE=/path/to/log     # Optional log file output

# Service configuration
PORT=3001                     # Override default service port
NODE_ENV=development          # Environment mode
```

## Security and Development

### Security Model

- **Local binding only**: All services bind to `127.0.0.1` (localhost)
- **Development-only**: Not intended for production deployment
- **CORS restrictions**: Limited to localhost origins
- **No authentication**: Services are intended for local development

### Integration with SGEX Workbench

#### MCP Inspector

The SGEX Workbench includes an MCP Inspector component for real-time service monitoring:

- **URL**: `http://localhost:3000/sgex/mcp-inspector` (local development only)
- **Features**: Service discovery, traffic monitoring, JSON syntax highlighting
- **Security**: Only available when running locally

#### Service Discovery Integration

The MCP services integrate with the SGEX Welcome page:
- MCP Inspector card appears automatically when services are detected
- Direct links to service endpoints and documentation
- Real-time service status indicators

## Build Integration

MCP services are integrated into the main build process:

```bash
npm run build  # Builds MCP services first, then main application
```

This ensures all services are properly built and ready for deployment.

## Troubleshooting

### Common Issues

1. **Service not starting**: Check if dependencies are installed (`npm install` in service directory)
2. **Port conflicts**: Ensure ports 3001 and 3002 are available
3. **TypeScript errors**: Run `npm run build-mcp` and `npm run build-publication-api`
4. **Interactive mode issues**: Ensure terminal supports color and keyboard input

### Log Analysis

Use the interactive mode filtering to troubleshoot:
- Filter by service category to isolate issues
- Filter by error level to focus on problems
- Use search text to find specific error messages
- Check service uptime and API response times

### Development Tips

- Use `npm run run-all-services-interactive` for active development
- Use `npm run run-all-services-non-interactive` for CI/CD integration
- Monitor service health via the MCP Inspector in SGEX Workbench
- Check individual service documentation at their `/docs` endpoints

## Related Documentation

- [DAK FAQ MCP API Documentation](./dak-faq-mcp-api.md)
- [OpenAPI Specification](./openapi.yaml)
- [SGEX Workbench Requirements](../requirements.md)
- [Solution Architecture](../solution-architecture.md)