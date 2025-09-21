# ChatGPT Integration Guide for SGEX MCP Service

This guide explains how to integrate the deployed SGEX MCP service with ChatGPT and why CORS configuration is essential for the deployment.

## Overview

The SGEX MCP (Model Context Protocol) service provides ChatGPT with access to DAK (Digital Adaptation Kit) components and FAQ functionality. When deployed to Fly.io, it creates a publicly accessible endpoint that ChatGPT can use to retrieve WHO SMART Guidelines information.

## Why CORS is Required

The MCP service deployment includes CORS (Cross-Origin Resource Sharing) configuration for several critical reasons:

### 1. GitHub OAuth Authentication Flow
- **OAuth Callback**: GitHub redirects users back to the service after authentication
- **Cross-Origin Requests**: The OAuth flow involves requests between different origins
- **Web Browser Security**: CORS headers ensure proper authentication flow in browser environments

### 2. Public API Access
- **REST API Endpoints**: The service provides REST endpoints that may be called from web applications
- **Cross-Domain Requests**: External applications need to access the API from different domains
- **Security Control**: CORS allows controlled access while maintaining security

### 3. Future Integration Possibilities
- **Web Dashboard**: Potential web interface for managing the MCP service
- **Client Applications**: Other applications may need to access the REST API
- **Monitoring Tools**: Administrative interfaces for service monitoring

### 4. Development Flexibility
- **Local Development**: CORS enables local development against the deployed service
- **Testing Tools**: API testing tools can access the service from different origins
- **Integration Testing**: Cross-origin testing scenarios are supported

## ChatGPT Developer Mode Integration

### Prerequisites

1. **ChatGPT Plus Subscription**: Required for accessing developer mode
2. **GitHub Collaborator Access**: Must be a collaborator on `litlfred/sgex` repository
3. **Deployed MCP Service**: The service must be successfully deployed to Fly.io

### Step-by-Step Integration Process

#### 1. Access ChatGPT Developer Mode

1. **Open ChatGPT**: Go to [chat.openai.com](https://chat.openai.com)
2. **Access Settings**: Click on your profile → Settings
3. **Enable Developer Mode**: Navigate to "Beta Features" and enable "Developer mode"
4. **Create New Chat**: Start a new conversation in developer mode

#### 2. Add the MCP Service

1. **Open MCP Configuration**: In developer mode, look for the MCP/tools configuration option
2. **Add New Service**: Click "Add MCP Service" or similar option
3. **Configure Service Details**:
   ```
   Service Name: SGEX DAK FAQ
   Service URL: https://sgex-mcp-dev.fly.dev
   Protocol: HTTP
   Authentication: OAuth (GitHub)
   ```

#### 3. Authenticate with GitHub

1. **Initiate Authentication**: ChatGPT will redirect you to GitHub OAuth
2. **GitHub Authorization**: 
   - URL: `https://sgex-mcp-dev.fly.dev/auth/github`
   - You'll be redirected to GitHub to authorize the application
   - Grant permissions to the "SGEX MCP Server (Development)" application
3. **Collaborator Verification**: The service will verify you're a collaborator on `litlfred/sgex`
4. **Return to ChatGPT**: Complete the OAuth flow and return to ChatGPT

#### 4. Verify Integration

1. **Test Service Access**: ChatGPT should now show the SGEX MCP service as available
2. **Available Functions**: The service provides access to:
   - DAK component information
   - FAQ questions and answers
   - WHO SMART Guidelines data
   - Repository structure analysis

### Example Usage in ChatGPT

Once integrated, you can ask ChatGPT questions like:

```
"Can you help me understand the business processes in the ANC DAK?"
"What are the frequently asked questions about WHO SMART Guidelines?"
"Show me the decision support logic components available in DAKs"
"How do I implement FHIR profiles in a DAK?"
```

ChatGPT will use the MCP service to access real-time DAK information and provide accurate, up-to-date responses.

## Service Architecture

### Authentication Flow
```
User → ChatGPT → MCP Service → GitHub OAuth → GitHub API
                     ↓
               Collaborator Check → Service Access
```

### Data Flow
```
ChatGPT Query → MCP Service → DAK Repository Analysis → Response
                    ↓
               Cache & Process → Structured Data → ChatGPT
```

### Security Model
- **OAuth Authentication**: Users must authenticate via GitHub
- **Collaborator Authorization**: Only `litlfred/sgex` collaborators can access protected endpoints
- **No Persistent Data**: Authorization is checked dynamically via GitHub API
- **CORS Protection**: Controlled cross-origin access

## Troubleshooting

### Common Integration Issues

#### 1. Authentication Failures
```
Error: OAuth configuration not found
```
**Solution**: Ensure GitHub OAuth secrets are properly configured in the deployment

#### 2. Collaborator Access Denied
```
Error: User is not a collaborator on litlfred/sgex
```
**Solution**: Request collaborator access from @litlfred or verify your GitHub username

#### 3. CORS Errors
```
Error: Cross-origin request blocked
```
**Solution**: Verify CORS_ORIGIN is correctly set to allow ChatGPT's domain

#### 4. Service Unavailable
```
Error: Cannot connect to MCP service
```
**Solution**: Check service deployment status at `https://sgex-mcp-dev.fly.dev/health`

### Health Check

You can verify the service is running by visiting:
- **Health Endpoint**: `https://sgex-mcp-dev.fly.dev/health`
- **API Information**: `https://sgex-mcp-dev.fly.dev/`

Expected health check response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX T XX:XX:XX.XXXZ",
  "version": "1.0.0",
  "description": "DAK FAQ MCP Server",
  "environment": "production",
  "auth_configured": true
}
```

## Benefits of This Architecture

### 1. **Secure Access Control**
- Only authorized GitHub collaborators can access the service
- OAuth provides secure authentication without storing credentials
- Dynamic authorization checking via GitHub API

### 2. **Real-Time DAK Data**
- ChatGPT gets access to live DAK repository information
- No stale or cached data issues
- Direct access to WHO SMART Guidelines content

### 3. **Scalable Integration**
- Public deployment allows multiple users to access via ChatGPT
- No individual setup required for each user
- Centralized service management

### 4. **Comprehensive WHO SMART Guidelines Support**
- Access to all 8 DAK components
- FAQ functionality for common questions
- Standards-compliant information retrieval

## Deployment Dependencies

The MCP service deployment requires these components to function properly:

1. **Fly.io Infrastructure**: Hosting platform for public accessibility
2. **GitHub OAuth App**: For user authentication
3. **CORS Configuration**: For cross-origin request handling
4. **GitHub API Access**: For collaborator verification
5. **WHO SMART Guidelines Standards**: For DAK component understanding

This architecture ensures that ChatGPT can provide accurate, real-time information about WHO SMART Guidelines and DAK development while maintaining proper security controls.