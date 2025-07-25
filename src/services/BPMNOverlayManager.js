/**
 * Manager for BPMN component overlays
 * Handles visual indicators and overlays for component links in BPMN diagrams
 */

import componentLinkService from './ComponentLinkService';

export class BPMNOverlayManager {
  constructor(bpmnViewer) {
    this.viewer = bpmnViewer;
    this.overlays = null;
    this.canvas = null;
    this.elementRegistry = null;
    this.overlayElements = new Map(); // Track created overlays
    
    this.initializeServices();
  }

  /**
   * Initialize BPMN.js services
   */
  initializeServices() {
    if (this.viewer) {
      try {
        this.overlays = this.viewer.get('overlays');
        this.canvas = this.viewer.get('canvas');
        this.elementRegistry = this.viewer.get('elementRegistry');
      } catch (error) {
        console.warn('BPMN services not ready yet:', error.message);
      }
    }
  }

  /**
   * Ensure services are initialized
   */
  ensureServicesReady() {
    if (!this.overlays || !this.canvas || !this.elementRegistry) {
      this.initializeServices();
    }
    
    return this.overlays && this.canvas && this.elementRegistry;
  }

  /**
   * Create overlay element for a component link
   * @param {Object} componentInfo - Component information
   * @param {Function} onClickCallback - Callback when overlay is clicked
   * @returns {HTMLElement} Overlay element
   */
  createOverlayElement(componentInfo, onClickCallback) {
    const config = componentLinkService.getVisualConfig(componentInfo.type);
    
    const overlayElement = document.createElement('div');
    overlayElement.className = 'component-link-overlay';
    overlayElement.style.cssText = `
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: ${config.backgroundColor};
      border: 2px solid ${config.borderColor};
      border-radius: 12px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      color: ${config.color};
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      white-space: nowrap;
      user-select: none;
      transition: all 0.2s ease;
      min-width: 60px;
      justify-content: center;
    `;

    // Add icon and label
    const iconSpan = document.createElement('span');
    iconSpan.textContent = config.icon;
    iconSpan.style.fontSize = '12px';
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = config.label;
    labelSpan.style.fontSize = '10px';
    
    overlayElement.appendChild(iconSpan);
    overlayElement.appendChild(labelSpan);

    // Add hover effects
    overlayElement.addEventListener('mouseenter', () => {
      overlayElement.style.transform = 'scale(1.05)';
      overlayElement.style.boxShadow = '0 3px 8px rgba(0,0,0,0.2)';
      overlayElement.style.background = config.color;
      overlayElement.style.color = 'white';
    });

    overlayElement.addEventListener('mouseleave', () => {
      overlayElement.style.transform = 'scale(1)';
      overlayElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      overlayElement.style.background = config.backgroundColor;
      overlayElement.style.color = config.color;
    });

    // Add click handler
    if (onClickCallback) {
      overlayElement.addEventListener('click', (event) => {
        event.stopPropagation();
        onClickCallback(componentInfo);
      });
    }

    // Add tooltip
    overlayElement.title = `${componentInfo.name}\n${componentInfo.description || 'Click to navigate to component'}`;

    return overlayElement;
  }

  /**
   * Add overlay for a BPMN element
   * @param {string} elementId - BPMN element ID
   * @param {Function} onClickCallback - Callback when overlay is clicked
   */
  addElementOverlay(elementId, onClickCallback) {
    if (!this.ensureServicesReady()) {
      console.warn('BPMN services not ready, cannot add overlay');
      return;
    }

    const componentInfo = componentLinkService.getComponentLink(elementId);
    if (!componentInfo) {
      return;
    }

    // Remove existing overlay if present
    this.removeElementOverlay(elementId);

    // Check if element exists in the diagram
    const element = this.elementRegistry.get(elementId);
    if (!element) {
      console.warn(`Element ${elementId} not found in diagram`);
      return;
    }

    try {
      const overlayElement = this.createOverlayElement(componentInfo, onClickCallback);
      
      // Position overlay in the top-right corner of the element
      const overlayId = this.overlays.add(elementId, {
        position: {
          top: -10,
          right: -10
        },
        html: overlayElement
      });

      // Track the overlay
      this.overlayElements.set(elementId, overlayId);
      
      console.log(`Added overlay for element ${elementId} with component ${componentInfo.type}`);
    } catch (error) {
      console.error(`Failed to add overlay for element ${elementId}:`, error);
    }
  }

  /**
   * Remove overlay for a BPMN element
   * @param {string} elementId - BPMN element ID
   */
  removeElementOverlay(elementId) {
    if (!this.ensureServicesReady()) {
      return;
    }

    const overlayId = this.overlayElements.get(elementId);
    if (overlayId) {
      try {
        this.overlays.remove(overlayId);
        this.overlayElements.delete(elementId);
        console.log(`Removed overlay for element ${elementId}`);
      } catch (error) {
        console.error(`Failed to remove overlay for element ${elementId}:`, error);
      }
    }
  }

  /**
   * Refresh all overlays based on current component links
   * @param {Function} onClickCallback - Callback when overlay is clicked
   */
  refreshAllOverlays(onClickCallback) {
    if (!this.ensureServicesReady()) {
      console.warn('BPMN services not ready, cannot refresh overlays');
      return;
    }

    // Clear all existing overlays
    this.clearAllOverlays();

    // Add overlays for all linked elements
    const allLinks = componentLinkService.getAllComponentLinks();
    for (const [elementId] of allLinks) {
      this.addElementOverlay(elementId, onClickCallback);
    }
  }

  /**
   * Clear all overlays
   */
  clearAllOverlays() {
    if (!this.ensureServicesReady()) {
      return;
    }

    for (const [, overlayId] of this.overlayElements) {
      try {
        this.overlays.remove(overlayId);
      } catch (error) {
        console.error(`Failed to remove overlay ${overlayId}:`, error);
      }
    }
    
    this.overlayElements.clear();
    console.log('Cleared all component overlays');
  }

  /**
   * Highlight elements that have component links
   * @param {boolean} highlight - Whether to highlight or remove highlighting
   */
  highlightLinkedElements(highlight = true) {
    if (!this.ensureServicesReady()) {
      return;
    }

    const allLinks = componentLinkService.getAllComponentLinks();
    
    for (const [elementId] of allLinks) {
      const element = this.elementRegistry.get(elementId);
      if (element) {
        if (highlight) {
          this.canvas.addMarker(elementId, 'component-linked');
        } else {
          this.canvas.removeMarker(elementId, 'component-linked');
        }
      }
    }
  }

  /**
   * Get statistics about current overlays
   * @returns {Object} Statistics object
   */
  getOverlayStatistics() {
    return {
      totalOverlays: this.overlayElements.size,
      elementIds: Array.from(this.overlayElements.keys())
    };
  }

  /**
   * Update viewer reference (useful when viewer is recreated)
   * @param {Object} bpmnViewer - New BPMN viewer instance
   */
  updateViewer(bpmnViewer) {
    this.viewer = bpmnViewer;
    this.overlays = null;
    this.canvas = null;
    this.elementRegistry = null;
    this.overlayElements.clear();
    this.initializeServices();
  }

  /**
   * Cleanup all overlays and references
   */
  destroy() {
    this.clearAllOverlays();
    this.viewer = null;
    this.overlays = null;
    this.canvas = null;
    this.elementRegistry = null;
  }
}

export default BPMNOverlayManager;