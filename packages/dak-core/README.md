# @sgex/dak-core

Core WHO SMART Guidelines DAK business logic and validation package.

## Overview

This package provides the foundational logic for working with WHO SMART Guidelines Digital Adaptation Kits (DAKs). It contains pure business logic with no dependencies on web services or MCP services.

## Features

- 🏥 **WHO SMART Guidelines Compliance**: Based on official DAK logical model
- 📋 **Repository Validation**: Validate DAK repository structure and content
- 🔍 **Component Discovery**: Automatically discover DAK components
- ✅ **Schema Validation**: JSON Schema validation against WHO standards
- 📁 **Asset Management**: Find and categorize DAK assets
- 🏗️ **Framework Agnostic**: No web or UI dependencies

## Installation

```bash
npm install @sgex/dak-core
```

## Quick Start

### Working with Local DAK Repository

```typescript
import { dakService, DAKComponentType, DAKAssetType } from '@sgex/dak-core';

// Load a local DAK repository
const dakRepo = await dakService.fromLocalRepository('/path/to/dak-repo');

// Validate the repository
const validation = await dakService.validateRepository(dakRepo);
console.log('Is valid DAK:', validation.isValid);

// Get DAK metadata
const metadata = await dakService.loadMetadata(dakRepo);
console.log('DAK title:', metadata?.title);

// Get available components
const components = await dakService.getComponents(dakRepo);
console.log('Available components:', components);

// Get BPMN assets
const bpmnFiles = await dakService.getAssets(dakRepo, DAKAssetType.BPMN);
console.log('BPMN files:', bpmnFiles);
```

### Working with GitHub DAK Repository

```typescript
import { dakService } from '@sgex/dak-core';

// Create reference to GitHub repository
const dakRepo = dakService.fromGitHubRepository('WorldHealthOrganization', 'smart-immunizations');

// Get summary information
const summary = await dakService.getSummary(dakRepo);
console.log('DAK Summary:', summary);
```

### Validating Individual Components

```typescript
import { dakService, DAKComponentType } from '@sgex/dak-core';

const dakRepo = await dakService.fromLocalRepository('/path/to/dak-repo');

// Validate a BPMN file
const result = await dakService.validateComponentFile(
  dakRepo,
  'input/business-processes/workflow.bpmn',
  DAKComponentType.BUSINESS_PROCESSES
);

console.log('Validation errors:', result.errors);
console.log('Validation warnings:', result.warnings);
```

## API Reference

### DAKService

Main service class for working with DAKs.

#### Methods

- `fromLocalRepository(path: string): Promise<DAKRepository>` - Load DAK from local filesystem
- `fromGitHubRepository(owner: string, repo: string, branch?: string): DAKRepository` - Create reference to GitHub DAK
- `validateRepository(dakRepo: DAKRepository): Promise<DAKValidationResult>` - Validate DAK repository
- `loadMetadata(dakRepo: DAKRepository): Promise<DAKMetadata | null>` - Load DAK metadata
- `getComponents(dakRepo: DAKRepository): Promise<DAKComponentType[]>` - Get available components
- `getAssets(dakRepo: DAKRepository, assetType: DAKAssetType): Promise<string[]>` - Get assets by type
- `getSummary(dakRepo: DAKRepository): Promise<DAKSummary>` - Get comprehensive DAK summary

### DAKValidationService

Specialized validation service for DAK compliance.

#### Methods

- `validateDAKRepository(path: string): Promise<DAKValidationResult>` - Validate repository structure
- `validateDAKObject(dak: DAK): DAKValidationResult` - Validate DAK object against schema
- `validateComponentFile(filePath: string, componentType: DAKComponentType): DAKValidationResult` - Validate component file

### Types

#### DAKComponentType

Enumeration of the 9 WHO SMART Guidelines DAK components:

- `HEALTH_INTERVENTIONS` - Health interventions and recommendations
- `PERSONAS` - Generic personas (human and system actors)
- `USER_SCENARIOS` - User interaction scenarios  
- `BUSINESS_PROCESSES` - Business processes and workflows
- `DATA_ELEMENTS` - Core data elements
- `DECISION_LOGIC` - Decision support logic
- `INDICATORS` - Program indicators
- `REQUIREMENTS` - Functional and non-functional requirements
- `TEST_SCENARIOS` - Test scenarios

#### DAKAssetType

Common asset types found in DAK repositories:

- `BPMN` - Business process diagrams
- `DMN` - Decision tables
- `FHIR_PROFILE` - FHIR profiles
- `FHIR_EXTENSION` - FHIR extensions
- `VALUE_SET` - Value sets
- `CODE_SYSTEM` - Code systems
- `QUESTIONNAIRE` - Questionnaires
- `MEASURE` - Measures
- `ACTOR_DEFINITION` - Actor definitions

## WHO SMART Guidelines Integration

This package is fully integrated with the WHO SMART Guidelines DAK logical model:

- **Schema**: https://worldhealthorganization.github.io/smart-base/StructureDefinition-DAK.schema.json
- **Logical Model**: https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/DAK.fsh
- **API Documentation**: https://worldhealthorganization.github.io/smart-base/dak-api.html

## License

Apache 2.0 - See LICENSE file for details.