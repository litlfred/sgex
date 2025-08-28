/**
 * CQL Services Integration Test
 * 
 * Tests the CQL execution, introspection, and validation services
 * to ensure they work correctly together for CQL editing functionality.
 */

import cqlExecutionService from '../services/cqlExecutionService';
import cqlIntrospectionService from '../services/cqlIntrospectionService';
import cqlValidationService from '../services/cqlValidationService';

describe('CQL Services Integration', () => {
  beforeEach(() => {
    // Clear services before each test
    cqlExecutionService.clear();
    cqlValidationService.clear();
  });

  describe('CQL Introspection Service', () => {
    test('should parse CQL text and extract data elements', () => {
      const cqlText = `
library TestLibrary version '1.0.0'

using FHIR version '4.0.1'

context Patient

define "Patient Age":
  [Patient] P
    return AgeInYears()

define "Active Conditions":
  [Condition] C
    where C.clinicalStatus = 'active'

define "Immunization History":
  [Immunization] I
    where I.status = 'completed'
      and I.vaccineCode in "Required Vaccines"
      `;

      const result = cqlIntrospectionService.parseCQLText(cqlText);

      expect(result.context).toBe('Patient');
      expect(result.dataElements).toContain('Patient');
      expect(result.dataElements).toContain('Condition');
      expect(result.dataElements).toContain('Immunization');
      expect(result.valueSets).toContain('Required Vaccines');
      expect(result.definitions).toContain('Patient Age');
      expect(result.definitions).toContain('Active Conditions');
      expect(result.definitions).toContain('Immunization History');
      expect(result.errors).toHaveLength(0);
    });

    test('should parse CQL with library includes', () => {
      const cqlText = `
library TestLibrary version '1.0.0'

include FHIRHelpers version '4.0.1' called FHIRHelpers
include CommonLibrary version '1.0.0' called Common

context Population

define "Population Measure":
  Count([Patient])
      `;

      const result = cqlIntrospectionService.parseCQLText(cqlText);

      expect(result.context).toBe('Population');
      expect(result.libraries).toContain('FHIRHelpers');
      expect(result.libraries).toContain('CommonLibrary');
      expect(result.dataElements).toContain('Patient');
      expect(result.definitions).toContain('Population Measure');
    });

    test('should extract library references with line numbers', () => {
      const cqlText = `
library TestLibrary version '1.0.0'

include FHIRHelpers version '4.0.1' called FHIRHelpers
include CommonLibrary version '1.0.0'

context Patient

define "Patient Data":
  FHIRHelpers.ToValue([Patient])

define "Common Calculation":
  CommonLibrary.CalculateAge()
      `;

      const references = cqlIntrospectionService.extractLibraryReferences(cqlText);

      expect(references).toHaveLength(4); // 2 includes + 2 function calls
      
      const includes = references.filter(ref => ref.type === 'include');
      expect(includes).toHaveLength(2);
      expect(includes[0].library).toBe('FHIRHelpers');
      expect(includes[0].alias).toBe('FHIRHelpers');
      expect(includes[1].library).toBe('CommonLibrary');

      const functionCalls = references.filter(ref => ref.type === 'function-call');
      expect(functionCalls).toHaveLength(2);
      expect(functionCalls[0].library).toBe('FHIRHelpers');
      expect(functionCalls[0].function).toBe('ToValue');
      expect(functionCalls[1].library).toBe('CommonLibrary');
      expect(functionCalls[1].function).toBe('CalculateAge');
    });

    test('should generate summary statistics', () => {
      const cqlText = `
library TestLibrary version '1.0.0'

context Patient

parameter "MeasurementPeriod" Interval<DateTime>

define "Active Patients":
  [Patient] P
    where P.active = true

define "Patient Count":
  Count("Active Patients")
      `;

      const summary = cqlIntrospectionService.getSummary(cqlText);

      expect(summary.context).toBe('Patient');
      expect(summary.dataElementCount).toBeGreaterThan(0);
      expect(summary.parameterCount).toBe(1);
      expect(summary.definitionCount).toBe(2);
      expect(summary.hasErrors).toBe(false);
    });
  });

  describe('CQL Validation Service', () => {
    test('should validate CQL against data dictionary', () => {
      const cqlText = `
context Patient

define "Patient Data":
  [Patient] P

define "Conditions":
  [Condition] C
    where C.code in "Test Value Set"
      `;

      const dataDictionary = {
        concepts: [
          { Code: 'Patient', Display: 'Patient Resource', Definition: 'FHIR Patient resource' },
          { Code: 'Condition', Display: 'Condition Resource', Definition: 'FHIR Condition resource' }
        ]
      };

      cqlValidationService.loadDataDictionary(dataDictionary);
      const result = cqlValidationService.validateCQL(cqlText);

      expect(result.isValid).toBe(true);
      expect(result.dataElementValidation).toHaveLength(2);
      
      const patientValidation = result.dataElementValidation.find(v => v.element === 'Patient');
      expect(patientValidation.isValid).toBe(true);
      expect(patientValidation.source).toBe('local');

      const conditionValidation = result.dataElementValidation.find(v => v.element === 'Condition');
      expect(conditionValidation.isValid).toBe(true);
      expect(conditionValidation.source).toBe('local');
    });

    test('should identify missing data elements', () => {
      const cqlText = `
context Patient

define "Missing Resource":
  [UnknownResource] R

define "Another Missing":
  [AnotherUnknown] A
      `;

      const dataDictionary = {
        concepts: [
          { Code: 'Patient', Display: 'Patient Resource' }
        ]
      };

      cqlValidationService.loadDataDictionary(dataDictionary);
      const result = cqlValidationService.validateCQL(cqlText);

      expect(result.isValid).toBe(false);
      expect(result.summary.invalidElements).toBe(2);
      expect(result.summary.missingElements).toBe(2);

      const unknownValidation = result.dataElementValidation.find(v => v.element === 'UnknownResource');
      expect(unknownValidation.isValid).toBe(false);
      expect(unknownValidation.issues.some(issue => issue.type === 'missing')).toBe(true);
    });

    test('should provide suggestions for similar elements', () => {
      const cqlText = `
context Patient

define "Patint Data":  // Typo: should be "Patient"
  [Patint] P
      `;

      const dataDictionary = {
        concepts: [
          { Code: 'Patient', Display: 'Patient Resource' },
          { Code: 'Practitioner', Display: 'Practitioner Resource' }
        ]
      };

      cqlValidationService.loadDataDictionary(dataDictionary);
      const result = cqlValidationService.validateCQL(cqlText);

      expect(result.isValid).toBe(false);
      const patintValidation = result.dataElementValidation.find(v => v.element === 'Patint');
      expect(patintValidation.isValid).toBe(false);
      expect(patintValidation.issues.some(issue => 
        issue.type === 'suggestion' && issue.message.includes('Patient')
      )).toBe(true);
    });

    test('should validate value sets', () => {
      const cqlText = `
context Patient

define "Conditions":
  [Condition] C
    where C.code in "http://example.org/valid-codes"
      and C.category in "Invalid Format"
      `;

      const result = cqlValidationService.validateCQL(cqlText);

      expect(result.valueSetValidation).toHaveLength(2);
      
      const validValueSet = result.valueSetValidation.find(v => v.valueSet === 'http://example.org/valid-codes');
      expect(validValueSet.isValid).toBe(true);

      const invalidValueSet = result.valueSetValidation.find(v => v.valueSet === 'Invalid Format');
      expect(invalidValueSet.isValid).toBe(false);
    });

    test('should generate validation report', () => {
      const cqlText = `
context Patient

define "Valid Data":
  [Patient] P

define "Invalid Data":
  [UnknownResource] R
      `;

      const dataDictionary = {
        concepts: [
          { Code: 'Patient', Display: 'Patient Resource' }
        ]
      };

      cqlValidationService.loadDataDictionary(dataDictionary);
      const result = cqlValidationService.validateCQL(cqlText);
      const report = cqlValidationService.generateReport(result);

      expect(report).toContain('=== CQL Validation Report ===');
      expect(report).toContain('Total Elements: 2');
      expect(report).toContain('Valid Elements: 1');
      expect(report).toContain('Invalid Elements: 1');
      expect(report).toContain('Overall Status: INVALID');
      expect(report).toContain('Invalid Data Elements:');
      expect(report).toContain('UnknownResource');
    });
  });

  describe('CQL Execution Service', () => {
    test('should initialize and load libraries', () => {
      cqlExecutionService.initialize();

      const mockElm = {
        library: {
          identifier: { id: 'TestLibrary', version: '1.0.0' },
          schemaIdentifier: { id: 'urn:hl7-org:elm', version: 'r1' },
          usings: {
            def: [{ localIdentifier: 'System', uri: 'urn:hl7-org:elm-types:r1' }]
          },
          statements: {
            def: [
              {
                name: 'Patient',
                context: 'Patient',
                expression: { type: 'SingletonFrom', operand: { dataType: '{http://hl7.org/fhir}Patient', type: 'Retrieve' } }
              }
            ]
          }
        }
      };

      const result = cqlExecutionService.loadLibrary('TestLibrary', mockElm);
      expect(result).toBe(true);

      const loadedLibraries = cqlExecutionService.getLoadedLibraries();
      expect(loadedLibraries).toContain('TestLibrary');

      const libraryInfo = cqlExecutionService.getLibraryInfo('TestLibrary');
      expect(libraryInfo.name).toBe('TestLibrary');
      expect(libraryInfo.identifier.id).toBe('TestLibrary');
      expect(libraryInfo.statements).toHaveLength(1);
    });

    test('should handle invalid ELM JSON', () => {
      expect(() => {
        cqlExecutionService.loadLibrary('InvalidLibrary', null);
      }).toThrow('Invalid ELM JSON provided');

      expect(() => {
        cqlExecutionService.loadLibrary('InvalidLibrary', 'not an object');
      }).toThrow('Invalid ELM JSON provided');
    });

    test('should prepare test data for execution', () => {
      const testData = [
        {
          resourceType: 'Patient',
          id: 'patient-1',
          name: [{ given: ['John'], family: 'Doe' }]
        },
        {
          resourceType: 'Condition',
          id: 'condition-1',
          subject: { reference: 'Patient/patient-1' }
        }
      ];

      const bundle = cqlExecutionService.prepareTestData(testData);

      expect(bundle.resourceType).toBe('Bundle');
      expect(bundle.type).toBe('collection');
      expect(bundle.entry).toHaveLength(2);
      expect(bundle.entry[0].resource.resourceType).toBe('Patient');
      expect(bundle.entry[1].resource.resourceType).toBe('Condition');
    });

    test('should load value sets', () => {
      const valueSets = [
        {
          id: 'test-value-set',
          codes: [
            { code: 'A01', system: 'http://example.org', display: 'Code A01' },
            { code: 'B02', system: 'http://example.org', display: 'Code B02' }
          ]
        }
      ];

      expect(() => {
        cqlExecutionService.loadValueSets(valueSets);
      }).not.toThrow();
    });

    test('should translate CQL placeholder', () => {
      const cqlText = `
library TestLibrary version '1.0.0'

context Patient

define "Patient Count":
  Count([Patient])
      `;

      const elmResult = cqlExecutionService.translateCQL(cqlText);

      expect(elmResult).toBeDefined();
      expect(elmResult.library).toBeDefined();
      expect(elmResult.library.identifier.id).toBe('Demo');
    });
  });

  describe('Service Integration', () => {
    test('should work together for complete CQL workflow', () => {
      const cqlText = `
library TestWorkflow version '1.0.0'

using FHIR version '4.0.1'

context Patient

define "Active Patients":
  [Patient] P
    where P.active = true

define "Patient Conditions":
  [Condition] C
    where C.clinicalStatus = 'active'
      `;

      // Step 1: Introspection
      const introspection = cqlIntrospectionService.parseCQLText(cqlText);
      expect(introspection.context).toBe('Patient');
      expect(introspection.dataElements).toContain('Patient');
      expect(introspection.dataElements).toContain('Condition');

      // Step 2: Validation
      const dataDictionary = {
        concepts: [
          { Code: 'Patient', Display: 'Patient Resource' },
          { Code: 'Condition', Display: 'Condition Resource' }
        ]
      };

      cqlValidationService.loadDataDictionary(dataDictionary);
      const validation = cqlValidationService.validateCQL(cqlText);
      expect(validation.isValid).toBe(true);

      // Step 3: Execution setup
      cqlExecutionService.initialize();
      const elmJson = cqlExecutionService.translateCQL(cqlText);
      const loadResult = cqlExecutionService.loadLibrary('TestWorkflow', elmJson);
      expect(loadResult).toBe(true);

      // Verify integration
      expect(cqlExecutionService.getLoadedLibraries()).toContain('TestWorkflow');
      expect(validation.summary.validElements).toBe(2);
      expect(introspection.definitions).toContain('Active Patients');
      expect(introspection.definitions).toContain('Patient Conditions');
    });
  });
});