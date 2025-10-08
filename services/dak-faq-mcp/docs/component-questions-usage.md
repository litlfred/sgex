# DAK Component Questions Usage Guide

## Overview

This document describes how to use the 9 newly implemented DAK component-level FAQ questions.

## Available Questions

All questions are at the `component` level and scan specific directories in a DAK repository:

1. **health-interventions** - Scans for health intervention and guideline files
2. **personas** - Scans for actor/persona definition files
3. **user-scenarios** - Scans for user scenario and use case files
4. **business-processes** - Scans for BPMN workflow files
5. **data-elements** - Scans for data dictionaries, value sets, and profiles
6. **decision-logic** - Scans for DMN decision tables and CQL logic files
7. **indicators** - Scans for program indicator and measure definitions
8. **requirements** - Scans for requirement specification files
9. **test-scenarios** - Scans for test scenarios and example data

## How to Use

### Via Question Catalog

List all available questions:
```bash
curl http://127.0.0.1:3001/faq/questions/catalog
```

Filter for component-level questions:
```bash
curl http://127.0.0.1:3001/faq/questions/catalog?level=component
```

### Via Question Execution

Execute a specific component question:
```bash
curl -X POST http://127.0.0.1:3001/faq/questions/execute \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "questionId": "health-interventions",
        "parameters": {
          "repository": "/path/to/dak-repo"
        }
      }
    ]
  }'
```

Execute multiple component questions:
```bash
curl -X POST http://127.0.0.1:3001/faq/questions/execute \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "questionId": "health-interventions",
        "parameters": {"repository": "/path/to/dak-repo"}
      },
      {
        "questionId": "personas",
        "parameters": {"repository": "/path/to/dak-repo"}
      },
      {
        "questionId": "business-processes",
        "parameters": {"repository": "/path/to/dak-repo"}
      }
    ]
  }'
```

## Response Format

Each question returns:

```json
{
  "success": true,
  "questionId": "health-interventions",
  "result": {
    "structured": {
      "interventions": [
        {
          "name": "L2 DAK Health Interventions",
          "file": "input/pagecontent/l2-dak.md",
          "type": "documentation"
        }
      ]
    },
    "narrative": "<h4>What health interventions...</h4><p>Found 1 interventions...</p>",
    "errors": [],
    "warnings": [],
    "meta": {
      "cacheHint": {
        "scope": "repository",
        "key": "health-interventions",
        "ttl": 3600
      }
    }
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

## Question Details

### health-interventions
- **Scans**: `input/pagecontent/l2-dak.md`, `input/iris-references/`, `input/pagecontent/*health*.md`
- **Returns**: List of health intervention files with names and paths

### personas  
- **Scans**: `input/actors/`, `input/**/persona*.{json,md}`
- **Returns**: List of persona definitions with names, roles, and paths

### user-scenarios
- **Scans**: `input/scenarios/`, `input/**/*scenario*.{json,md}`
- **Returns**: List of user scenario files with names, descriptions, and paths

### business-processes
- **Scans**: `input/process/*.bpmn`, `input/**/*.bpmn`, `input/**/*workflow*.md`
- **Returns**: List of BPMN workflows and process documentation

### data-elements
- **Scans**: `input/vocabulary/`, `input/profiles/`, `input/extensions/`
- **Returns**: List of data elements grouped by type (ValueSet, CodeSystem, StructureDefinition, etc.)

### decision-logic
- **Scans**: `input/decision-support/`, `input/cql/`, `input/**/*.dmn`, `input/**/PlanDefinition*.json`
- **Returns**: List of decision logic files grouped by type (DMN, CQL, PlanDefinition)

### indicators
- **Scans**: `input/indicators/`, `input/measures/`, `input/**/Measure*.json`
- **Returns**: List of program indicators grouped by type

### requirements
- **Scans**: `input/requirements/`, `input/**/Requirements*.json`, `input/pagecontent/*requirement*.md`
- **Returns**: List of requirements grouped by category (functional, non-functional, etc.)

### test-scenarios
- **Scans**: `input/tests/`, `input/examples/`, `input/**/TestScript*.json`, `input/pagecontent/*test*.md`
- **Returns**: List of test scenarios and examples grouped by type

## Integration with DAK Dashboard

These questions can be integrated into the DAK Dashboard FAQ tab to:

1. Display badges showing the count of items in each component
2. Allow users to click badges to see detailed lists
3. Provide links to the actual source files in the repository

Example badge display:
```
Health Interventions [3]
Personas [5]
Business Processes [7]
```

Clicking a badge executes the corresponding question and displays the results.
