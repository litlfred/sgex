import { extractDAKComponentsFromRoutes, isValidDAKComponent, parseDAKUrl } from '../services/urlProcessorService';

describe('routeUtils', () => {
  describe('extractDAKComponentsFromRoutes', () => {
    it('should return an array of valid DAK components', () => {
      const components = extractDAKComponentsFromRoutes();
      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);
      expect(components).toContain('dashboard');
      expect(components).toContain('bpmn-viewer');
      expect(components).toContain('core-data-dictionary-viewer');
    });
  });

  describe('isValidDAKComponent', () => {
    it('should return true for valid DAK components', () => {
      expect(isValidDAKComponent('dashboard')).toBe(true);
      expect(isValidDAKComponent('bpmn-viewer')).toBe(true);
      expect(isValidDAKComponent('core-data-dictionary-viewer')).toBe(true);
      expect(isValidDAKComponent('health-interventions')).toBe(true);
      expect(isValidDAKComponent('actor-editor')).toBe(true);
      expect(isValidDAKComponent('business-process-selection')).toBe(true);
      expect(isValidDAKComponent('bpmn-editor')).toBe(true);
      expect(isValidDAKComponent('bpmn-source')).toBe(true);
      expect(isValidDAKComponent('decision-support-logic')).toBe(true);
      expect(isValidDAKComponent('questionnaire-editor')).toBe(true);
    });

    it('should return false for invalid DAK components', () => {
      expect(isValidDAKComponent('invalid-component')).toBe(false);
      expect(isValidDAKComponent('home')).toBe(false);
      expect(isValidDAKComponent('select_profile')).toBe(false);
      expect(isValidDAKComponent('')).toBe(false);
      expect(isValidDAKComponent(null)).toBe(false);
      expect(isValidDAKComponent(undefined)).toBe(false);
    });
  });

  describe('parseDAKUrl', () => {
    it('should parse valid DAK URLs correctly', () => {
      const result1 = parseDAKUrl('/dashboard/who/anc-dak/main');
      expect(result1).toEqual({
        component: 'dashboard',
        user: 'who',
        repo: 'anc-dak',
        branch: 'main',
        assetPath: [],
        isValid: true
      });

      const result2 = parseDAKUrl('/bpmn-viewer/litlfred/test-repo/feature-branch/process.bpmn');
      expect(result2).toEqual({
        component: 'bpmn-viewer',
        user: 'litlfred',
        repo: 'test-repo',
        branch: 'feature-branch',
        assetPath: ['process.bpmn'],
        isValid: true
      });

      const result3 = parseDAKUrl('/core-data-dictionary-viewer/user/repo');
      expect(result3).toEqual({
        component: 'core-data-dictionary-viewer',
        user: 'user',
        repo: 'repo',
        branch: undefined,
        assetPath: [],
        isValid: true
      });
    });

    it('should return null for invalid DAK URLs', () => {
      expect(parseDAKUrl('/invalid-component/user/repo')).toBe(null);
      expect(parseDAKUrl('/dashboard/user')).toBe(null); // Missing repo
      expect(parseDAKUrl('/dashboard')).toBe(null); // Missing user and repo
      expect(parseDAKUrl('/')).toBe(null);
      expect(parseDAKUrl('')).toBe(null);
      expect(parseDAKUrl('/home')).toBe(null);
      expect(parseDAKUrl('/select_profile')).toBe(null);
    });

    it('should handle URLs with asset paths', () => {
      const result = parseDAKUrl('/bpmn-viewer/user/repo/branch/folder/subfolder/asset.bpmn');
      expect(result).toEqual({
        component: 'bpmn-viewer',
        user: 'user',
        repo: 'repo',
        branch: 'branch',
        assetPath: ['folder', 'subfolder', 'asset.bpmn'],
        isValid: true
      });
    });

    it('should handle URLs without branches', () => {
      const result = parseDAKUrl('/dashboard/user/repo');
      expect(result).toEqual({
        component: 'dashboard',
        user: 'user',
        repo: 'repo',
        branch: undefined,
        assetPath: [],
        isValid: true
      });
    });
  });
});