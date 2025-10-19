/**
 * @fileoverview Editor Integration Service for DAK Component Objects
 * 
 * This service provides a bridge between editors (BPMN, DMN, etc.) and DAK Component Objects,
 * enabling gradual migration from legacy direct file editing to component-based editing.
 * 
 * @module editorIntegrationService
 */

/**
 * DAK Component Object interface representing a reusable DAK component
 * @interface DakComponentObject
 * @example
 * {
 *   id: "comp-001",
 *   type: "bpmn-process",
 *   name: "Patient Registration",
 *   content: "<bpmn:definitions>...</bpmn:definitions>"
 * }
 */
export interface DakComponentObject {
  /** Unique identifier for the component */
  id: string;
  /** Type of component (bpmn-process, dmn-decision, etc.) */
  type: string;
  /** Human-readable name */
  name: string;
  /** Component content (XML, JSON, etc.) */
  content: string;
  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Editor configuration for integrating with DAK objects
 * @interface EditorConfig
 * @example
 * {
 *   editorType: "bpmn",
 *   componentType: "bpmn-process",
 *   canEdit: true
 * }
 */
export interface EditorConfig {
  /** Type of editor (bpmn, dmn, form, etc.) */
  editorType: string;
  /** Corresponding component type */
  componentType: string;
  /** Whether editing is enabled */
  canEdit: boolean;
  /** Optional editor-specific settings */
  settings?: Record<string, any>;
}

/**
 * Result of loading a component for editing
 * @interface LoadComponentResult
 */
export interface LoadComponentResult {
  /** Whether load was successful */
  success: boolean;
  /** Loaded component (if successful) */
  component?: DakComponentObject;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Result of saving a component from editor
 * @interface SaveComponentResult
 */
export interface SaveComponentResult {
  /** Whether save was successful */
  success: boolean;
  /** Updated component (if successful) */
  component?: DakComponentObject;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Editor Integration Service
 * 
 * Provides methods to load and save DAK Component Objects from editors,
 * managing the transition from legacy file-based editing to component-based editing.
 */
class EditorIntegrationService {
  private mockComponents: Map<string, DakComponentObject> = new Map();

  /**
   * Load a DAK Component Object for editing
   * 
   * @param componentId - Unique identifier of the component to load
   * @param editorType - Type of editor requesting the component
   * @returns Promise resolving to load result
   * 
   * @example
   * const result = await editorIntegrationService.loadComponent('comp-001', 'bpmn');
   * if (result.success) {
   *   console.log('Component loaded:', result.component);
   * }
   */
  async loadComponent(
    componentId: string,
    editorType: string
  ): Promise<LoadComponentResult> {
    try {
      logger.info('Loading component for editor', { componentId, editorType });

      // Check mock components first
      const mockComponent = this.mockComponents.get(componentId);
      if (mockComponent) {
        return {
          success: true,
          component: mockComponent
        };
      }

      // In production, this would load from @sgex/dak-core
      // For now, return a mock component
      const component: DakComponentObject = {
        id: componentId,
        type: this.getComponentTypeForEditor(editorType),
        name: `Component ${componentId}`,
        content: this.getDefaultContent(editorType)
      };

      return {
        success: true,
        component
      };
    } catch (error) {
      logger.error('Failed to load component', { componentId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Save a DAK Component Object from editor
   * 
   * @param component - Component to save
   * @param editorType - Type of editor saving the component
   * @returns Promise resolving to save result
   * 
   * @example
   * const result = await editorIntegrationService.saveComponent(component, 'bpmn');
   * if (result.success) {
   *   console.log('Component saved:', result.component);
   * }
   */
  async saveComponent(
    component: DakComponentObject,
    editorType: string
  ): Promise<SaveComponentResult> {
    try {
      logger.info('Saving component from editor', { componentId: component.id, editorType });

      // Store in mock components
      this.mockComponents.set(component.id, component);

      // In production, this would save to @sgex/dak-core
      return {
        success: true,
        component
      };
    } catch (error) {
      logger.error('Failed to save component', { componentId: component.id, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new component from editor
   * 
   * @param name - Name for the new component
   * @param editorType - Type of editor creating the component
   * @param initialContent - Optional initial content
   * @returns Promise resolving to the created component
   */
  async createComponent(
    name: string,
    editorType: string,
    initialContent?: string
  ): Promise<DakComponentObject> {
    const component: DakComponentObject = {
      id: `comp-${Date.now()}`,
      type: this.getComponentTypeForEditor(editorType),
      name,
      content: initialContent || this.getDefaultContent(editorType)
    };

    this.mockComponents.set(component.id, component);
    logger.info('Created new component', { componentId: component.id, editorType });

    return component;
  }

  /**
   * Get component type for editor type
   * @private
   */
  private getComponentTypeForEditor(editorType: string): string {
    const typeMap: Record<string, string> = {
      'bpmn': 'bpmn-process',
      'dmn': 'dmn-decision',
      'form': 'json-form',
      'actor': 'actor-definition'
    };
    return typeMap[editorType] || 'unknown';
  }

  /**
   * Get default content for editor type
   * @private
   */
  private getDefaultContent(editorType: string): string {
    const defaultContent: Record<string, string> = {
      'bpmn': '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"></bpmn:definitions>',
      'dmn': '<?xml version="1.0" encoding="UTF-8"?>\n<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"></definitions>',
      'form': '{}',
      'actor': '{}'
    };
    return defaultContent[editorType] || '';
  }

  /**
   * Clear all mock components (for testing)
   */
  clearMockComponents(): void {
    this.mockComponents.clear();
  }
}

// Export singleton instance
export const editorIntegrationService = new EditorIntegrationService();
export default editorIntegrationService;
