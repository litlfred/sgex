/**
 * Tests for SAML Error Handler utilities
 */

import { 
  isSAMLError, 
  extractOrganizationFromSAMLError, 
  createSAMLAuthorizationURL,
  createSAMLErrorInfo,
  canAttemptSAMLAuthorization 
} from '../utils/samlErrorHandler';

describe('SAML Error Handler', () => {
  describe('isSAMLError', () => {
    it('should detect SAML enforcement errors', () => {
      const samlError = {
        status: 403,
        message: 'Resource protected by organization SAML enforcement. You must grant your Personal Access token access to this organization.'
      };
      
      expect(isSAMLError(samlError)).toBe(true);
    });

    it('should detect SAML single sign-on errors', () => {
      const samlError = {
        status: 403,
        message: 'You must authenticate via SAML single sign-on to access this resource.'
      };
      
      expect(isSAMLError(samlError)).toBe(true);
    });

    it('should not detect non-SAML 403 errors', () => {
      const regularError = {
        status: 403,
        message: 'Forbidden'
      };
      
      expect(isSAMLError(regularError)).toBe(false);
    });

    it('should not detect non-403 errors', () => {
      const notFoundError = {
        status: 404,
        message: 'Not found'
      };
      
      expect(isSAMLError(notFoundError)).toBe(false);
    });

    it('should detect custom SAML authorization required errors', () => {
      const samlError = {
        status: 403,
        message: 'SAML authorization required for organization WorldHealthOrganization',
        isSAMLError: true
      };
      
      expect(isSAMLError(samlError)).toBe(true);
    });

    it('should detect SAML authorization required via message pattern', () => {
      const samlError = {
        status: 403,
        message: 'SAML authorization required for organization TestOrg'
      };
      
      expect(isSAMLError(samlError)).toBe(true);
    });

    it('should handle null/undefined errors', () => {
      expect(isSAMLError(null)).toBe(false);
      expect(isSAMLError(undefined)).toBe(false);
    });
  });

  describe('extractOrganizationFromSAMLError', () => {
    it('should extract organization name from error message', () => {
      const error = {
        message: 'Failed to fetch organization WorldHealthOrganization: HttpError'
      };
      
      expect(extractOrganizationFromSAMLError(error, 'fallback')).toBe('WorldHealthOrganization');
    });

    it('should return fallback when no organization found', () => {
      const error = {
        message: 'Some generic error message'
      };
      
      expect(extractOrganizationFromSAMLError(error, 'fallback')).toBe('fallback');
    });
  });

  describe('createSAMLAuthorizationURL', () => {
    it('should create correct SAML authorization URL', () => {
      const url = createSAMLAuthorizationURL('WorldHealthOrganization');
      expect(url).toBe('https://github.com/orgs/WorldHealthOrganization/sso');
    });
  });

  describe('createSAMLErrorInfo', () => {
    it('should create complete SAML error info object', () => {
      const error = new Error('SAML error');
      const info = createSAMLErrorInfo(error, 'WorldHealthOrganization', {
        isRequired: true,
        context: 'access organization data'
      });

      expect(info.type).toBe('saml_enforcement');
      expect(info.organization).toBe('WorldHealthOrganization');
      expect(info.isRequired).toBe(true);
      expect(info.severity).toBe('error');
      expect(info.authorizationURL).toBe('https://github.com/orgs/WorldHealthOrganization/sso');
      expect(info.instructions).toHaveLength(4);
    });

    it('should create optional SAML error info', () => {
      const error = new Error('SAML error');
      const info = createSAMLErrorInfo(error, 'TestOrg', { isRequired: false });

      expect(info.isRequired).toBe(false);
      expect(info.severity).toBe('warning');
      expect(info.title).toBe('SAML Authorization Available');
    });
  });

  describe('canAttemptSAMLAuthorization', () => {
    it('should allow valid organization names', () => {
      expect(canAttemptSAMLAuthorization('WorldHealthOrganization')).toBe(true);
      expect(canAttemptSAMLAuthorization('test-org')).toBe(true);
      expect(canAttemptSAMLAuthorization('org_name')).toBe(true);
    });

    it('should reject invalid organization names', () => {
      expect(canAttemptSAMLAuthorization('')).toBe(false);
      expect(canAttemptSAMLAuthorization(null)).toBe(false);
      expect(canAttemptSAMLAuthorization(undefined)).toBe(false);
      expect(canAttemptSAMLAuthorization('org with spaces')).toBe(false);
      expect(canAttemptSAMLAuthorization('org@special')).toBe(false);
    });
  });
});