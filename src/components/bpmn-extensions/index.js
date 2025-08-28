/**
 * Main module that exports all BPMN extensions
 * This module integrates all custom functionality specified in issue #159
 */

import customPaletteModule from './customPaletteProvider';
import customPropertiesProviderModule from './customPropertiesProvider';
import validationRendererModule from './validationRenderer';

// Export individual modules
export { 
  customPaletteModule, 
  customPropertiesProviderModule, 
  validationRendererModule 
};

// Export combined modules array for easy integration
export const allCustomModules = [
  customPaletteModule,
  customPropertiesProviderModule,
  validationRendererModule
];

// Export default combined module
export default allCustomModules;