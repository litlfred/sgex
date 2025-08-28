import {
  normalizePath,
  normalizeUrl,
  combineUrlParts,
  normalizeDAKPath,
  pathNeedsNormalization
} from '../utils/urlNormalizationUtils';

describe('URL Normalization Utils', () => {
  describe('normalizePath', () => {
    test('removes repeated slashes', () => {
      expect(normalizePath('/dashboard//user///repo')).toBe('/dashboard/user/repo');
      expect(normalizePath('//multiple///slashes////everywhere')).toBe('/multiple/slashes/everywhere');
      expect(normalizePath('no/leading/slash//here')).toBe('no/leading/slash/here');
    });

    test('preserves single slashes', () => {
      expect(normalizePath('/dashboard/user/repo')).toBe('/dashboard/user/repo');
      expect(normalizePath('/')).toBe('/');
      expect(normalizePath('')).toBe('/');
    });

    test('handles edge cases', () => {
      expect(normalizePath(null)).toBe('/');
      expect(normalizePath(undefined)).toBe('/');
      expect(normalizePath('///')).toBe('/');
    });

    test('preserves trailing slash when requested', () => {
      expect(normalizePath('/path//', true)).toBe('/path/');
      expect(normalizePath('/path///', true)).toBe('/path/');
      expect(normalizePath('/path', true)).toBe('/path');
    });
  });

  describe('normalizeUrl', () => {
    test('normalizes full URLs', () => {
      expect(normalizeUrl('https://example.com//path///to//resource'))
        .toBe('https://example.com/path/to/resource');
    });

    test('preserves protocol slashes', () => {
      expect(normalizeUrl('https://example.com/path'))
        .toBe('https://example.com/path');
    });

    test('handles relative paths', () => {
      expect(normalizeUrl('/path//to///resource'))
        .toBe('/path/to/resource');
    });
  });

  describe('combineUrlParts', () => {
    test('combines URL parts without double slashes', () => {
      expect(combineUrlParts('/sgex/', '/dashboard')).toBe('/sgex/dashboard');
      expect(combineUrlParts('/sgex', '/dashboard')).toBe('/sgex/dashboard');
      expect(combineUrlParts('/sgex/', 'dashboard')).toBe('/sgex/dashboard');
      expect(combineUrlParts('/sgex', 'dashboard')).toBe('/sgex/dashboard');
    });

    test('handles empty parts', () => {
      expect(combineUrlParts('', '/dashboard')).toBe('/dashboard');
      expect(combineUrlParts('/sgex', '')).toBe('/sgex');
      expect(combineUrlParts('', '')).toBe('/');
    });

    test('normalizes repeated slashes in both parts', () => {
      expect(combineUrlParts('/sgex///', '///dashboard//user'))
        .toBe('/sgex/dashboard/user');
    });
  });

  describe('normalizeDAKPath', () => {
    test('normalizes valid DAK paths', () => {
      const result = normalizeDAKPath('/dashboard//user///repo//branch');
      expect(result.normalizedPath).toBe('/dashboard/user/repo/branch');
      expect(result.isValid).toBe(true);
      expect(result.components.component).toBe('dashboard');
      expect(result.components.user).toBe('user');
      expect(result.components.repo).toBe('repo');
      expect(result.components.branch).toBe('branch');
    });

    test('handles invalid DAK paths', () => {
      const result = normalizeDAKPath('/invalid');
      expect(result.isValid).toBe(false);
    });
  });

  describe('pathNeedsNormalization', () => {
    test('detects paths with repeated slashes', () => {
      expect(pathNeedsNormalization('/path//to///resource')).toBe(true);
      expect(pathNeedsNormalization('/path/to/resource')).toBe(false);
      expect(pathNeedsNormalization('https://example.com/path')).toBe(false);
      expect(pathNeedsNormalization('https://example.com//path')).toBe(true);
    });
  });
});