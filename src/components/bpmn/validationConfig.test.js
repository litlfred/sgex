import { validateId, validateName, validateElement } from './validationConfig';

describe('BPMN Validation Configuration', () => {
  describe('validateId', () => {
    test('should validate correct IDs', () => {
      expect(validateId('PatientRegistration', 'bpmn:Task')).toEqual({ isValid: true, error: null });
      expect(validateId('vaccination.workflow.step1', 'bpmn:Task')).toEqual({ isValid: true, error: null });
      expect(validateId('UserTask123', 'bpmn:UserTask')).toEqual({ isValid: true, error: null });
      expect(validateId('BusinessRule.DecisionTable', 'bpmn:BusinessRuleTask')).toEqual({ isValid: true, error: null });
    });

    test('should reject IDs starting with numbers', () => {
      const result = validateId('123Patient', 'bpmn:Task');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ID must start with a letter');
    });

    test('should reject IDs with invalid characters', () => {
      const result = validateId('patient-registration', 'bpmn:Task');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ID must consist of only alphanumeric characters and periods');
    });

    test('should reject IDs ending with period', () => {
      const result = validateId('workflow.', 'bpmn:Task');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ID must not end in a period');
    });

    test('should reject IDs longer than 55 characters', () => {
      const longId = 'a'.repeat(56);
      const result = validateId(longId, 'bpmn:Task');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ID must be 55 characters or less');
    });

    test('should reject empty IDs', () => {
      const result = validateId('', 'bpmn:Task');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('ID is required');
    });
  });

  describe('validateName', () => {
    test('should validate non-empty names', () => {
      expect(validateName('Patient Registration', 'bpmn:Task')).toEqual({ isValid: true, error: null });
    });

    test('should reject empty names', () => {
      const result = validateName('', 'bpmn:Task');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name is required');
    });
  });

  describe('validateElement', () => {
    test('should validate element with valid ID and name', () => {
      const mockElement = {
        type: 'bpmn:Task',
        businessObject: {
          id: 'PatientRegistration',
          name: 'Patient Registration',
          documentation: [
            { text: 'Definition: This task handles patient registration' }
          ]
        }
      };

      const result = validateElement(mockElement);
      expect(result.isValid).toBe(true);
    });

    test('should invalidate element with invalid ID', () => {
      const mockElement = {
        type: 'bpmn:Task',
        businessObject: {
          id: '123Invalid',
          name: 'Valid Name',
          documentation: [
            { text: 'Definition: This task handles patient registration' }
          ]
        }
      };

      const result = validateElement(mockElement);
      expect(result.isValid).toBe(false);
      expect(result.idError).toBe('ID must start with a letter');
    });

    test('should invalidate element without required documentation', () => {
      const mockElement = {
        type: 'bpmn:Task',
        businessObject: {
          id: 'ValidId',
          name: 'Valid Name',
          documentation: []
        }
      };

      const result = validateElement(mockElement);
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('definition');
    });
  });
});