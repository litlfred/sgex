export { DAKPublicationServer } from './server';
export { TemplateService } from './services/templateService';
export { VariableService } from './services/variableService';
export { ContentService } from './services/contentService';
export { PublicationService } from './services/publicationService';
export { IntegrationService } from './services/integrationService';

export * from './types/template';
export * from './types/api';

// Main entry point for the application
import { DAKPublicationServer } from './server';

if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
  const server = new DAKPublicationServer(port);
  
  server.start().catch((error) => {
    console.error('Failed to start DAK Publication API server:', error);
    process.exit(1);
  });
}