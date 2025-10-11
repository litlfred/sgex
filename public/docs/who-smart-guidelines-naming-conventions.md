# WHO SMART Guidelines Asset Naming Conventions

## Overview

This document defines the naming conventions for all assets within WHO SMART Guidelines Digital Adaptation Kits (DAKs). These conventions are based on the [WHO SMART IG Starter Kit Authoring Conventions](https://smart.who.int/ig-starter-kit/authoring_conventions.html#naming-conventions).

## General ID Requirements

All asset IDs in WHO SMART Guidelines DAKs **MUST** follow these rules:

### ✅ Valid ID Patterns

1. **Must start with a capital letter** (A-Z)
2. **May contain**:
   - Capital and lowercase letters (A-Z, a-z)
   - Numbers (0-9)
   - Hyphens (-) - allowed but not preferred
3. **Must NOT contain**:
   - Underscores (_) - **strictly forbidden**
   - Spaces
   - Special characters

### Valid ID Examples

```
✅ Resourceid          (preferred - single word, capitalized)
✅ Resource-id         (valid - hyphenated, but not preferred)
✅ MyAssetId           (valid - CamelCase)
✅ Asset123            (valid - alphanumeric)
✅ Health-Worker-001   (valid - multiple hyphens)
```

### Invalid ID Examples

```
❌ resource_id         (contains underscore)
❌ Resource_Id         (contains underscore)
❌ resource-id         (does not start with capital letter)
❌ My Asset            (contains space)
❌ Resource@Id         (contains special character)
❌ _ResourceId         (starts with underscore)
```

## Asset-Specific Naming Conventions

### User Scenarios

**File Pattern**: `input/pagecontent/userscenario-{ID}.md`

**ID Requirements**:
- Must follow general ID requirements above
- Prefix: `userscenario-` (lowercase) followed by ID
- ID portion must start with capital letter

**Examples**:
```
✅ userscenario-Anc-registration-001.md
✅ userscenario-Health-check.md
✅ userscenario-VaccinationRecord.md
❌ userscenario-anc-registration.md      (ID doesn't start with capital)
❌ userscenario-Health_check.md          (contains underscore)
```

### Business Processes

**File Pattern**: `input/images/businessprocess-{ID}.bpmn` or `.bpmn.xml`

**ID Requirements**:
- Must follow general ID requirements above
- Prefix: `businessprocess-` (lowercase) followed by ID

**Examples**:
```
✅ businessprocess-Anc-registration.bpmn
✅ businessprocess-HealthCheck.bpmn
❌ businessprocess-health_check.bpmn     (contains underscore)
```

### Decision Support Logic

**File Pattern**: `input/decisionlogic-{ID}.dmn` or `.dmn.xml`

**ID Requirements**:
- Must follow general ID requirements above
- Prefix: `decisionlogic-` (lowercase) followed by ID

**Examples**:
```
✅ decisionlogic-Anc-risk-assessment.dmn
✅ decisionlogic-VaccinationSchedule.dmn
❌ decisionlogic-vaccination_schedule.dmn (contains underscore)
```

### Generic Personas

**File Pattern**: `input/fsh/actors/{ID}.fsh` or `input/actors/{ID}.json`

**ID Requirements**:
- Must follow general ID requirements above
- Used directly as filename (no prefix)

**Examples**:
```
✅ Healthcare-worker.fsh
✅ Midwife.fsh
✅ CommunityHealthWorker.json
❌ health_care_worker.fsh    (contains underscores)
❌ midwife.fsh               (doesn't start with capital)
```

### Core Data Elements

**File Pattern**: `input/fsh/{ID}.fsh`

**ID Requirements**:
- Must follow general ID requirements above
- Used in Profile, ValueSet, and CodeSystem definitions

**Examples**:
```
Profile: PatientDetails
ValueSet: AntenatalCareVisitType
CodeSystem: ImmunizationStatus
```

### FHIR Resources

**Resource ID Requirements**:
- All FHIR resource IDs must follow general ID requirements
- No underscores allowed
- Must start with capital letter

**Examples**:
```json
{
  "resourceType": "Patient",
  "id": "Example-patient-001"    ✅
}

{
  "resourceType": "Practitioner",
  "id": "example_practitioner"   ❌ (underscore)
}
```

## Validation

### Runtime Validation

The SGEX Workbench implements runtime validation for all asset IDs:

```javascript
function validateAssetId(id) {
  // Must start with capital letter
  if (!/^[A-Z]/.test(id)) {
    return 'ID must start with a capital letter';
  }

  // Can only contain letters, numbers, and hyphens (no underscores)
  if (!/^[A-Za-z0-9-]+$/.test(id)) {
    return 'ID can only contain letters, numbers, and hyphens (no underscores)';
  }

  return ''; // Valid
}
```

### Build-Time Validation

The FHIR IG Publisher will validate resource IDs during build:
- Invalid IDs will generate errors
- Build will fail if underscore characters are detected in IDs

## Best Practices

### Preferred Patterns

1. **Use CamelCase** for multi-word IDs:
   ```
   ✅ HealthcareWorker
   ✅ AncRegistration
   ```

2. **Avoid hyphens when possible**:
   ```
   ✅ HealthcareWorker     (preferred)
   ⚠️ Healthcare-Worker    (valid but not preferred)
   ```

3. **Use descriptive names**:
   ```
   ✅ AncRegistrationScenario
   ❌ Scenario1
   ```

4. **Be consistent** within your DAK:
   - If using hyphens, use them consistently
   - If using CamelCase, use it consistently

### Sequential Numbering

When using sequential numbers, prefer:
```
✅ Scenario-001, Scenario-002, Scenario-003
✅ UseCase01, UseCase02, UseCase03

Over:
❌ Scenario1, Scenario2, Scenario3  (inconsistent padding)
```

## Migration Guide

### Fixing Existing Assets with Underscores

If you have existing assets with underscores in their IDs:

1. **Identify affected assets**:
   ```bash
   # Find files with underscores
   find input/ -name "*_*"
   ```

2. **Update filenames**:
   ```bash
   # Example: rename user_scenario to UserScenario
   mv input/pagecontent/userscenario-user_scenario.md \
      input/pagecontent/userscenario-UserScenario.md
   ```

3. **Update references** in:
   - FSH files
   - Markdown documentation
   - BPMN/DMN files
   - JSON resources
   - sushi-config.yaml

4. **Test the build**:
   ```bash
   ./_genonce.sh
   ```

### Automated Migration

Consider using a script to automate the migration:

```bash
#!/bin/bash
# migrate-ids.sh - Replace underscores with hyphens in asset IDs

find input/ -type f -name "*_*" | while read file; do
  newname=$(echo "$file" | tr '_' '-')
  echo "Renaming: $file -> $newname"
  git mv "$file" "$newname"
done
```

## References

- [WHO SMART IG Starter Kit - Authoring Conventions](https://smart.who.int/ig-starter-kit/authoring_conventions.html#naming-conventions)
- [FHIR Resource Naming Guidelines](https://www.hl7.org/fhir/resource.html#id)
- [HL7 FHIR Implementation Guide Structure](https://www.hl7.org/fhir/implementationguide.html)

## Tools and Validation

### SGEX Workbench Validation

The SGEX Workbench validates IDs at creation time:
- User Scenarios: Validates on create and edit
- Business Processes: Validates on upload/create
- Decision Logic: Validates on upload/create
- Personas: Validates on create

### FHIR IG Publisher Validation

The FHIR IG Publisher validates during build:
- Checks all resource IDs
- Reports errors for invalid characters
- Fails build on validation errors

## Support

For questions or issues with naming conventions:
- Review the [WHO SMART IG Starter Kit](https://smart.who.int/ig-starter-kit/)
- Check the [SGEX Workbench Documentation](https://github.com/litlfred/sgex/tree/main/public/docs)
- Open an issue in the [SGEX repository](https://github.com/litlfred/sgex/issues)

---

**Last Updated**: 2024  
**Version**: 1.0  
**Status**: Official WHO SMART Guidelines Requirement
