/**
 * Publication Rendering Route
 * Provides enhanced rendering support for DAK publication views
 */

import express, { Request, Response } from 'express';
import { ErrorResponse } from '../../types.js';

const router = express.Router();

interface RenderingOptions {
  format?: 'html' | 'markdown' | 'pdf-optimized';
  includeMetadata?: boolean;
  includeStyles?: boolean;
  pageSize?: 'A4' | 'Letter' | 'A3';
  orientation?: 'portrait' | 'landscape';
}

interface ComponentRenderRequest {
  componentType: 'business-processes' | 'decision-support' | 'core-data-dictionary' | 'testing' | 'actors';
  dakRepository?: string;
  branch?: string;
  options?: RenderingOptions;
}

interface RenderingResponse {
  success: boolean;
  timestamp: string;
  componentType: string;
  content: string;
  metadata?: any;
  styling?: string;
  renderingHints?: any;
}

/**
 * POST /mcp/faq/render/component
 * Render a specific DAK component for publication
 */
router.post('/component', (req: Request<{}, RenderingResponse | ErrorResponse, ComponentRenderRequest>, res: Response<RenderingResponse | ErrorResponse>): Response<RenderingResponse | ErrorResponse> | void => {
  try {
    const { componentType, dakRepository, branch = 'main', options = {} } = req.body;

    if (!componentType) {
      const errorResponse: ErrorResponse = {
        error: {
          message: 'Missing required field: componentType',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        }
      };
      return res.status(400).json(errorResponse);
    }

    // Generate enhanced content based on component type
    let content = '';
    let metadata = {};
    let styling = '';
    let renderingHints = {};

    switch (componentType) {
      case 'decision-support':
        content = generateDMNRenderingContent(options);
        styling = getDMNStyling();
        renderingHints = getDMNRenderingHints();
        metadata = {
          dmnTablesCount: 2,
          hasXSLTransform: true,
          supportedFormats: ['html', 'pdf']
        };
        break;

      case 'business-processes':
        content = generateBPMNRenderingContent(options);
        styling = getBPMNStyling();
        renderingHints = getBPMNRenderingHints();
        metadata = {
          bpmnDiagramsCount: 3,
          pageSplittingRequired: true,
          viewportSegmentation: true
        };
        break;

      case 'core-data-dictionary':
        content = generateFHIRRenderingContent(options);
        styling = getFHIRStyling();
        renderingHints = getFHIRRenderingHints();
        metadata = {
          profilesCount: 15,
          valueSetCount: 8,
          extensionsCount: 5
        };
        break;

      case 'testing':
        content = generateTestingRenderingContent(options);
        styling = getTestingStyling();
        renderingHints = getTestingRenderingHints();
        metadata = {
          scenariosCount: 12,
          testCasesCount: 24
        };
        break;

      case 'actors':
        content = generateActorsRenderingContent(options);
        styling = getActorsStyling();
        renderingHints = getActorsRenderingHints();
        metadata = {
          personasCount: 6,
          rolesCount: 4
        };
        break;

      default:
        const errorResponse: ErrorResponse = {
          error: {
            message: `Unsupported component type: ${componentType}`,
            code: 'UNSUPPORTED_COMPONENT',
            timestamp: new Date().toISOString()
          }
        };
        return res.status(400).json(errorResponse);
    }

    const response: RenderingResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      componentType,
      content,
      metadata,
      styling: options.includeStyles ? styling : undefined,
      renderingHints
    };

    res.json(response);

  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to render component',
        code: 'RENDERING_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /mcp/faq/render/dmn-xsl
 * Get DMN XSL transformation and CSS for enhanced rendering
 */
router.get('/dmn-xsl', (req: Request, res: Response) => {
  try {
    // This would integrate with WHO smart-base repository resources
    // For now, providing placeholder that references the need for WHO resources
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'DMN XSL/CSS resources should be integrated from WHO smart-base repository',
      resourceUrl: 'https://github.com/WorldHealthOrganization/smart-base/tree/main/input/includes',
      note: 'This endpoint needs to be updated with actual XSL and CSS from WHO smart-base',
      placeholderXSL: getDMNXSLPlaceholder(),
      placeholderCSS: getDMNStyling()
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to get DMN XSL resources',
        code: 'DMN_XSL_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

// Helper functions for generating content

function generateDMNRenderingContent(options: RenderingOptions): string {
  return `
    <div class="dmn-publication-content">
      <h3>Clinical Decision Support Logic</h3>
      <p>This section contains DMN decision tables that provide automated clinical decision support.</p>
      
      <div class="dmn-tables-overview">
        <h4>Decision Tables</h4>
        <div class="decision-table">
          <h5>ANC Contact Schedule</h5>
          <div class="dmn-table-placeholder">
            <!-- DMN table would be rendered here using WHO XSL transformation -->
            <p><em>DMN table rendering with WHO XSL transformation required</em></p>
          </div>
        </div>
      </div>
      
      <div class="clinical-rules">
        <h4>Clinical Rules Implementation</h4>
        <ul>
          <li>Risk assessment algorithms</li>
          <li>Treatment recommendation logic</li>
          <li>Follow-up scheduling rules</li>
        </ul>
      </div>
    </div>
  `;
}

function generateBPMNRenderingContent(options: RenderingOptions): string {
  return `
    <div class="bpmn-publication-content">
      <h3>Business Process Workflows</h3>
      <p>BPMN diagrams showing healthcare delivery workflows and care pathways.</p>
      
      <div class="bpmn-diagrams">
        <div class="bpmn-diagram-section">
          <h4>Antenatal Care Workflow</h4>
          <div class="bpmn-diagram-placeholder">
            <!-- BPMN diagram with viewport segmentation for print -->
            <p><em>BPMN diagram with page splitting support</em></p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateFHIRRenderingContent(options: RenderingOptions): string {
  return `
    <div class="fhir-publication-content">
      <h3>FHIR Implementation Specifications</h3>
      <p>FHIR profiles, value sets, and implementation guidance for the DAK.</p>
      
      <div class="fhir-profiles">
        <h4>FHIR Profiles</h4>
        <div class="profile-list">
          <!-- FHIR profile documentation -->
        </div>
      </div>
    </div>
  `;
}

function generateTestingRenderingContent(options: RenderingOptions): string {
  return `
    <div class="testing-publication-content">
      <h3>Testing and Validation</h3>
      <p>Test scenarios and validation criteria for DAK implementation.</p>
    </div>
  `;
}

function generateActorsRenderingContent(options: RenderingOptions): string {
  return `
    <div class="actors-publication-content">
      <h3>User Personas and Roles</h3>
      <p>Definitions of system users and their roles in the healthcare delivery process.</p>
    </div>
  `;
}

// Styling functions

function getDMNStyling(): string {
  return `
    .dmn-publication-content {
      font-family: 'Times New Roman', serif;
      line-height: 1.6;
    }
    
    .dmn-table-placeholder {
      border: 1px solid #ccc;
      padding: 20px;
      margin: 10px 0;
      background-color: #f9f9f9;
    }
    
    @media print {
      .dmn-publication-content {
        page-break-inside: avoid;
      }
    }
  `;
}

function getBPMNStyling(): string {
  return `
    .bpmn-publication-content {
      font-family: 'Times New Roman', serif;
    }
    
    .bpmn-diagram-placeholder {
      min-height: 400px;
      border: 1px solid #ddd;
      margin: 15px 0;
    }
    
    @media print {
      .bpmn-diagram-section {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
  `;
}

function getFHIRStyling(): string {
  return `
    .fhir-publication-content {
      font-family: 'Times New Roman', serif;
    }
  `;
}

function getTestingStyling(): string {
  return `
    .testing-publication-content {
      font-family: 'Times New Roman', serif;
    }
  `;
}

function getActorsStyling(): string {
  return `
    .actors-publication-content {
      font-family: 'Times New Roman', serif;
    }
  `;
}

// Rendering hints functions

function getDMNRenderingHints(): any {
  return {
    xslTransformRequired: true,
    whoSmartBaseIntegration: true,
    cssFramework: 'WHO styling guidelines',
    printOptimization: true
  };
}

function getBPMNRenderingHints(): any {
  return {
    viewportSegmentation: true,
    pageBreakHandling: 'auto',
    printOptimization: true,
    diagramScaling: 'responsive'
  };
}

function getFHIRRenderingHints(): any {
  return {
    structureDefinitionRendering: true,
    valueSetExpansion: true,
    narrativeGeneration: true
  };
}

function getTestingRenderingHints(): any {
  return {
    scenarioGrouping: true,
    testCaseFormatting: 'tabular'
  };
}

function getActorsRenderingHints(): any {
  return {
    personaCards: true,
    roleHierarchy: true
  };
}

function getDMNXSLPlaceholder(): string {
  return `
    <!-- Placeholder XSL for DMN transformation -->
    <!-- This should be replaced with actual XSL from WHO smart-base repository -->
    <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
      <xsl:template match="/">
        <!-- DMN transformation logic would go here -->
      </xsl:template>
    </xsl:stylesheet>
  `;
}

export { router as renderingRoute };