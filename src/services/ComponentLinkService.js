/**
 * Service for managing component links in BPMN diagrams
 * Handles the relationships between BPMN elements and other DAK components
 */

export class ComponentLinkService {
  constructor() {
    // Store component links as a Map: elementId -> componentInfo
    this.componentLinks = new Map();
  }

  /**
   * Add a component link to a BPMN element
   * @param {string} elementId - BPMN element ID
   * @param {Object} componentInfo - Component information
   * @param {string} componentInfo.type - Component type (decision-support, indicators, forms)
   * @param {string} componentInfo.id - Component file ID or name
   * @param {string} componentInfo.name - Display name
   * @param {string} componentInfo.description - Description
   */
  addComponentLink(elementId, componentInfo) {
    if (!elementId || !componentInfo) {
      throw new Error('Element ID and component info are required');
    }

    // Validate component type
    const validTypes = ['decision-support', 'indicators', 'forms'];
    if (!validTypes.includes(componentInfo.type)) {
      throw new Error(`Invalid component type: ${componentInfo.type}`);
    }

    this.componentLinks.set(elementId, {
      ...componentInfo,
      linkedAt: new Date().toISOString()
    });
  }

  /**
   * Remove a component link from a BPMN element
   * @param {string} elementId - BPMN element ID
   */
  removeComponentLink(elementId) {
    return this.componentLinks.delete(elementId);
  }

  /**
   * Get component link for a BPMN element
   * @param {string} elementId - BPMN element ID
   * @returns {Object|null} Component info or null if not found
   */
  getComponentLink(elementId) {
    return this.componentLinks.get(elementId) || null;
  }

  /**
   * Get all component links
   * @returns {Map} Map of elementId -> componentInfo
   */
  getAllComponentLinks() {
    return new Map(this.componentLinks);
  }

  /**
   * Check if an element has a component link
   * @param {string} elementId - BPMN element ID
   * @returns {boolean}
   */
  hasComponentLink(elementId) {
    return this.componentLinks.has(elementId);
  }

  /**
   * Get all elements linked to a specific component
   * @param {string} componentType - Component type
   * @param {string} componentId - Component ID
   * @returns {string[]} Array of element IDs
   */
  getElementsLinkedToComponent(componentType, componentId) {
    const linkedElements = [];
    for (const [elementId, componentInfo] of this.componentLinks) {
      if (componentInfo.type === componentType && componentInfo.id === componentId) {
        linkedElements.push(elementId);
      }
    }
    return linkedElements;
  }

  /**
   * Export component links as JSON for persistence
   * @returns {string} JSON string of component links
   */
  exportLinks() {
    const linksArray = Array.from(this.componentLinks.entries()).map(([elementId, componentInfo]) => ({
      elementId,
      ...componentInfo
    }));
    return JSON.stringify(linksArray, null, 2);
  }

  /**
   * Import component links from JSON
   * @param {string} jsonData - JSON string of component links
   */
  importLinks(jsonData) {
    try {
      const linksArray = JSON.parse(jsonData);
      this.componentLinks.clear();
      
      linksArray.forEach(link => {
        const { elementId, ...componentInfo } = link;
        this.componentLinks.set(elementId, componentInfo);
      });
    } catch (error) {
      throw new Error(`Failed to import component links: ${error.message}`);
    }
  }

  /**
   * Get visual indicator configuration for a component type
   * @param {string} componentType - Component type
   * @returns {Object} Visual configuration
   */
  getVisualConfig(componentType) {
    const configs = {
      'decision-support': {
        icon: '🎯',
        color: '#107c10',
        borderColor: '#0f5c0f',
        backgroundColor: 'rgba(16, 124, 16, 0.1)',
        label: 'DMN'
      },
      'indicators': {
        icon: '📊',
        color: '#881798',
        borderColor: '#6b1276',
        backgroundColor: 'rgba(136, 23, 152, 0.1)',
        label: 'Indicator'
      },
      'forms': {
        icon: '📋',
        color: '#d13438',
        borderColor: '#a82a2e',
        backgroundColor: 'rgba(209, 52, 56, 0.1)',
        label: 'Form'
      }
    };

    return configs[componentType] || {
      icon: '🔗',
      color: '#666',
      borderColor: '#555',
      backgroundColor: 'rgba(102, 102, 102, 0.1)',
      label: 'Link'
    };
  }

  /**
   * Generate URL for navigating to component editor
   * @param {Object} componentInfo - Component information
   * @param {Object} context - Navigation context (profile, repository)
   * @returns {string} Navigation URL
   */
  getComponentEditorUrl(componentInfo, context) {
    // Map component types to editor routes
    const routeMap = {
      'decision-support': '/editor/decision-support',
      'indicators': '/editor/indicators', 
      'forms': '/editor/forms'
    };

    const baseRoute = routeMap[componentInfo.type] || `/editor/${componentInfo.type}`;
    
    // Include component-specific parameters
    const params = new URLSearchParams({
      component: componentInfo.id,
      name: componentInfo.name
    });

    return `${baseRoute}?${params.toString()}`;
  }

  /**
   * Clear all component links
   */
  clear() {
    this.componentLinks.clear();
  }

  /**
   * Get statistics about component links
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const stats = {
      total: this.componentLinks.size,
      byType: {
        'decision-support': 0,
        'indicators': 0,
        'forms': 0
      }
    };

    for (const [, componentInfo] of this.componentLinks) {
      if (stats.byType[componentInfo.type] !== undefined) {
        stats.byType[componentInfo.type]++;
      }
    }

    return stats;
  }
}

// Create a singleton instance for the application
export const componentLinkService = new ComponentLinkService();

export default componentLinkService;