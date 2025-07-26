import tokenManagerService, { ACCESS_LEVELS, DAK_COMPONENTS } from '../tokenManagerService';

describe('TokenManagerService', () => {
  beforeEach(() => {
    // Clear any cached data
    tokenManagerService.clearPermissionCache();
  });

  describe('ACCESS_LEVELS', () => {
    test('contains all required access levels', () => {
      expect(ACCESS_LEVELS).toHaveProperty('UNAUTHENTICATED');
      expect(ACCESS_LEVELS).toHaveProperty('READ_ONLY');
      expect(ACCESS_LEVELS).toHaveProperty('WRITE_ACCESS');
    });

    test('each access level has required properties', () => {
      Object.values(ACCESS_LEVELS).forEach(level => {
        expect(level).toHaveProperty('id');
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('description');
        expect(level).toHaveProperty('color');
        expect(level).toHaveProperty('icon');
        expect(level).toHaveProperty('capabilities');
        expect(Array.isArray(level.capabilities)).toBe(true);
      });
    });
  });

  describe('DAK_COMPONENTS', () => {
    test('contains all 8 DAK components', () => {
      const expectedComponents = [
        'business-processes',
        'decision-support',
        'indicators',
        'forms',
        'terminology',
        'profiles',
        'extensions',
        'test-data'
      ];

      expectedComponents.forEach(componentId => {
        expect(DAK_COMPONENTS).toHaveProperty(componentId);
      });

      expect(Object.keys(DAK_COMPONENTS)).toHaveLength(8);
    });

    test('each component has required properties', () => {
      Object.values(DAK_COMPONENTS).forEach(component => {
        expect(component).toHaveProperty('id');
        expect(component).toHaveProperty('name');
        expect(component).toHaveProperty('description');
        expect(component).toHaveProperty('readPermission');
        expect(component).toHaveProperty('writePermission');
        expect(component).toHaveProperty('paths');
        expect(component).toHaveProperty('fileExtensions');
        expect(Array.isArray(component.paths)).toBe(true);
        expect(Array.isArray(component.fileExtensions)).toBe(true);
      });
    });
  });

  describe('generateAuthorizationHelp', () => {
    test('generates help for valid component and operation', () => {
      const help = tokenManagerService.generateAuthorizationHelp('business-processes', 'read');
      
      expect(help).toHaveProperty('component');
      expect(help).toHaveProperty('operation', 'read');
      expect(help).toHaveProperty('requiredLevel', 'READ_ONLY');
      expect(help).toHaveProperty('accessLevel');
      expect(help).toHaveProperty('steps');
      expect(Array.isArray(help.steps)).toBe(true);
      expect(help.steps).toHaveLength(5);
    });

    test('generates help for write operation', () => {
      const help = tokenManagerService.generateAuthorizationHelp('business-processes', 'write');
      
      expect(help.operation).toBe('write');
      expect(help.requiredLevel).toBe('WRITE_ACCESS');
    });

    test('returns null for invalid component', () => {
      const help = tokenManagerService.generateAuthorizationHelp('invalid-component');
      expect(help).toBeNull();
    });
  });

  describe('validateComponentFilePath', () => {
    test('validates business processes files', () => {
      expect(tokenManagerService.validateComponentFilePath('business-processes', 'input/bpmn/test.bpmn')).toBe(true);
      expect(tokenManagerService.validateComponentFilePath('business-processes', 'test.bpmn2')).toBe(true);
      expect(tokenManagerService.validateComponentFilePath('business-processes', 'input/cql/test.cql')).toBe(false);
    });

    test('validates terminology files', () => {
      expect(tokenManagerService.validateComponentFilePath('terminology', 'fsh/test.fsh')).toBe(true);
      expect(tokenManagerService.validateComponentFilePath('terminology', 'input/vocabulary/test.json')).toBe(true);
      expect(tokenManagerService.validateComponentFilePath('terminology', 'input/bpmn/test.bpmn')).toBe(false);
    });

    test('validates test data files', () => {
      expect(tokenManagerService.validateComponentFilePath('test-data', 'input/tests/test.json')).toBe(true);
      expect(tokenManagerService.validateComponentFilePath('test-data', 'input/examples/example.xml')).toBe(true);
      expect(tokenManagerService.validateComponentFilePath('test-data', 'test.fhir')).toBe(true);
    });

    test('returns false for invalid component', () => {
      expect(tokenManagerService.validateComponentFilePath('invalid-component', 'any-file.txt')).toBe(false);
    });
  });

  describe('getComponentFromFilePath', () => {
    test('identifies component from file path', () => {
      expect(tokenManagerService.getComponentFromFilePath('input/bpmn/workflow.bpmn')).toBe('business-processes');
      expect(tokenManagerService.getComponentFromFilePath('fsh/profiles.fsh')).toBe('terminology'); // First match
      expect(tokenManagerService.getComponentFromFilePath('input/cql/logic.cql')).toBe('decision-support');
      
      // For paths that might match multiple components, test the actual behavior
      const testsJsonComponent = tokenManagerService.getComponentFromFilePath('input/tests/example.json');
      expect(['indicators', 'test-data']).toContain(testsJsonComponent);
      
      // Test specific file extensions
      expect(tokenManagerService.getComponentFromFilePath('test.fhir')).toBe('test-data');
      expect(tokenManagerService.getComponentFromFilePath('test.bpmn2')).toBe('business-processes');
    });

    test('returns null for unrecognized file path', () => {
      expect(tokenManagerService.getComponentFromFilePath('random/file.txt')).toBeNull();
    });
  });

  describe('getAvailableComponents', () => {
    test('returns all DAK components', () => {
      const components = tokenManagerService.getAvailableComponents();
      expect(components).toHaveLength(8);
      expect(components[0]).toHaveProperty('id');
      expect(components[0]).toHaveProperty('name');
    });
  });

  describe('getAccessLevels', () => {
    test('returns all access levels', () => {
      const levels = tokenManagerService.getAccessLevels();
      expect(levels).toHaveLength(3);
      expect(levels.map(l => l.id)).toEqual(['UNAUTHENTICATED', 'READ_ONLY', 'WRITE_ACCESS']);
    });
  });

  describe('clearPermissionCache', () => {
    test('clears permission cache without error', () => {
      expect(() => tokenManagerService.clearPermissionCache()).not.toThrow();
    });
  });
});