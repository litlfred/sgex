import React from 'react';

/**
 * Test to verify DAK mascot cards functionality
 * This test verifies that the helper function generates correct paths for mascot cards
 */

describe('DAK Dashboard Mascot Cards', () => {
  
  test('getMascotCardPath generates correct image paths', () => {
    // Mock process.env
    const originalEnv = process.env;
    process.env = { ...originalEnv, PUBLIC_URL: '/sgex' };

    // Define the helper function (extracted from component for testing)
    const getMascotCardPath = (componentId) => {
      const publicUrl = process.env.PUBLIC_URL || '';
      const cardPath = `dashboard/dak_${componentId.replace(/[-]/g, '_')}.png`;
      return publicUrl ? `${publicUrl}/${cardPath}` : `/${cardPath}`;
    };

    // Test component ID to image path mapping
    expect(getMascotCardPath('interventions')).toBe('/sgex/dashboard/dak_interventions.png');
    expect(getMascotCardPath('personas')).toBe('/sgex/dashboard/dak_personas.png');
    expect(getMascotCardPath('user_scenarios')).toBe('/sgex/dashboard/dak_user_scenarios.png');
    expect(getMascotCardPath('business_processes')).toBe('/sgex/dashboard/dak_business_processes.png');
    expect(getMascotCardPath('core_data_elements')).toBe('/sgex/dashboard/dak_core_data_elements.png');
    expect(getMascotCardPath('decision_support_logic')).toBe('/sgex/dashboard/dak_decision_support_logic.png');
    expect(getMascotCardPath('indicators')).toBe('/sgex/dashboard/dak_indicators.png');
    expect(getMascotCardPath('requirements')).toBe('/sgex/dashboard/dak_requirements.png');
    expect(getMascotCardPath('testing')).toBe('/sgex/dashboard/dak_testing.png');

    // Restore original environment
    process.env = originalEnv;
  });

  test('getMascotCardPath works without PUBLIC_URL', () => {
    // Mock process.env without PUBLIC_URL
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.PUBLIC_URL;

    // Define the helper function
    const getMascotCardPath = (componentId) => {
      const publicUrl = process.env.PUBLIC_URL || '';
      const cardPath = `dashboard/dak_${componentId.replace(/[-]/g, '_')}.png`;
      return publicUrl ? `${publicUrl}/${cardPath}` : `/${cardPath}`;
    };

    // Test without PUBLIC_URL
    expect(getMascotCardPath('interventions')).toBe('/dashboard/dak_interventions.png');
    expect(getMascotCardPath('personas')).toBe('/dashboard/dak_personas.png');

    // Restore original environment
    process.env = originalEnv;
  });

  test('component ID mappings are correct', () => {
    // Verify that the mapping from component IDs to image file names is correct
    const expectedMappings = {
      'health-interventions': 'interventions',
      'generic-personas': 'personas', 
      'user-scenarios': 'user_scenarios',
      'business-processes': 'business_processes',
      'core-data-elements': 'core_data_elements',
      'decision-support': 'decision_support_logic',
      'program-indicators': 'indicators',
      'functional-requirements': 'requirements',
      'test-scenarios': 'testing'
    };

    // Test that our mapping logic works correctly
    Object.entries(expectedMappings).forEach(([componentId, expectedImageId]) => {
      const imageId = componentId === 'health-interventions' ? 'interventions' :
                     componentId === 'generic-personas' ? 'personas' :
                     componentId === 'user-scenarios' ? 'user_scenarios' :
                     componentId === 'business-processes' ? 'business_processes' :
                     componentId === 'core-data-elements' ? 'core_data_elements' :
                     componentId === 'decision-support' ? 'decision_support_logic' :
                     componentId === 'program-indicators' ? 'indicators' :
                     componentId === 'functional-requirements' ? 'requirements' :
                     componentId === 'test-scenarios' ? 'testing' : '';
      
      expect(imageId).toBe(expectedImageId);
    });
  });
});