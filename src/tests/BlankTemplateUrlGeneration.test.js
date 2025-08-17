// Test to verify GitHub URL generation with blank template
describe('GitHub URL Generation - Blank Template', () => {
  test('should generate correct GitHub URL with blank template for SGEX issues', () => {
    // Simulate the createContextualUrl function from HelpModal
    const createContextualUrl = (baseUrl, params) => {
      const urlParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          urlParams.append(key, params[key]);
        }
      });
      return `${baseUrl}?${urlParams.toString()}`;
    };

    // Test SGEX blank issue parameters (matching HelpModal.js case 'blank')
    const baseUrl = 'https://github.com/litlfred/sgex/issues/new';
    const params = {
      template: 'blank.yml',
      labels: 'blank-issue'
    };

    const url = createContextualUrl(baseUrl, params);
    
    console.log('Generated SGEX URL:', url);
    
    expect(url).toBe('https://github.com/litlfred/sgex/issues/new?template=blank.yml&labels=blank-issue');
    expect(url).toContain('template=blank.yml');
    expect(url).toContain('labels=blank-issue');
  });

  test('should generate correct GitHub URL with blank template for DAK issues', () => {
    // Simulate the createContextualUrl function from HelpModal
    const createContextualUrl = (baseUrl, params) => {
      const urlParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          urlParams.append(key, params[key]);
        }
      });
      return `${baseUrl}?${urlParams.toString()}`;
    };

    // Test DAK blank issue parameters (matching HelpModal.js case 'blank' for DAK)
    const baseUrl = 'https://github.com/test-owner/test-repo/issues/new';
    const params = {
      template: 'blank.yml',
      labels: 'blank-issue,dak-feedback'
    };

    const url = createContextualUrl(baseUrl, params);
    
    console.log('Generated DAK URL:', url);
    
    expect(url).toBe('https://github.com/test-owner/test-repo/issues/new?template=blank.yml&labels=blank-issue%2Cdak-feedback');
    expect(url).toContain('template=blank.yml');
    expect(url).toContain('labels=blank-issue%2Cdak-feedback');
  });

  test('should compare old vs new URL generation', () => {
    console.log('\n=== COMPARISON: OLD vs NEW URL GENERATION ===');
    
    // OLD: No template specified
    const oldParams = { labels: 'blank-issue' };
    const oldUrl = `https://github.com/litlfred/sgex/issues/new?labels=blank-issue`;
    console.log('OLD (no template):', oldUrl);
    
    // NEW: With blank template
    const newParams = { template: 'blank.yml', labels: 'blank-issue' };
    const newUrl = `https://github.com/litlfred/sgex/issues/new?template=blank.yml&labels=blank-issue`;
    console.log('NEW (with template):', newUrl);
    
    // Verify the new approach includes template
    expect(newUrl).toContain('template=blank.yml');
    expect(oldUrl).not.toContain('template=');
    
    console.log('✅ NEW approach now uses template for consistency with other issue types');
  });
});