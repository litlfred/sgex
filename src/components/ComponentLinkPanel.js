import React, { useState } from 'react';
import componentLinkService from '../services/ComponentLinkService';
import './ComponentLinkPanel.css';

const ComponentLinkPanel = ({ 
  selectedElement, 
  onLinkAdded, 
  onLinkRemoved, 
  profile, 
  repository,
  onNavigateToComponent 
}) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedComponentType, setSelectedComponentType] = useState('');
  const [componentName, setComponentName] = useState('');
  const [componentDescription, setComponentDescription] = useState('');

  // Available components that can be linked
  const availableComponents = [
    {
      type: 'decision-support',
      name: 'Decision Support Logic',
      description: 'DMN decision tables and clinical decision support',
      icon: '🎯',
      examples: ['patient-eligibility.dmn', 'medication-dosage.dmn', 'risk-assessment.dmn']
    },
    {
      type: 'indicators',
      name: 'Indicators & Measures',
      description: 'Performance indicators and measurement definitions',
      icon: '📊',
      examples: ['vaccination-rate.json', 'patient-satisfaction.json', 'care-quality.json']
    },
    {
      type: 'forms',
      name: 'Data Entry Forms',
      description: 'Structured data collection forms and questionnaires',
      icon: '📋',
      examples: ['patient-registration.json', 'symptom-checklist.json', 'follow-up.json']
    }
  ];

  const handleAddLink = () => {
    if (!selectedElement) {
      alert('Please select a BPMN element first');
      return;
    }

    if (!selectedComponentType || !componentName.trim()) {
      alert('Please select a component type and enter a name');
      return;
    }

    const componentInfo = {
      type: selectedComponentType,
      id: componentName.toLowerCase().replace(/\s+/g, '-'),
      name: componentName,
      description: componentDescription || `Linked ${selectedComponentType} component`
    };

    try {
      componentLinkService.addComponentLink(selectedElement.id, componentInfo);
      
      if (onLinkAdded) {
        onLinkAdded(selectedElement.id, componentInfo);
      }

      // Reset form
      setSelectedComponentType('');
      setComponentName('');
      setComponentDescription('');
      setShowLinkDialog(false);

      console.log(`Added component link: ${selectedElement.id} -> ${componentInfo.name}`);
    } catch (error) {
      alert(`Failed to add component link: ${error.message}`);
    }
  };

  const handleRemoveLink = () => {
    if (!selectedElement) {
      return;
    }

    const removed = componentLinkService.removeComponentLink(selectedElement.id);
    if (removed && onLinkRemoved) {
      onLinkRemoved(selectedElement.id);
    }
  };

  const handleNavigateToComponent = () => {
    if (!selectedElement) {
      return;
    }

    const componentInfo = componentLinkService.getComponentLink(selectedElement.id);
    if (componentInfo && onNavigateToComponent) {
      onNavigateToComponent(componentInfo);
    }
  };

  const currentLink = selectedElement ? componentLinkService.getComponentLink(selectedElement.id) : null;
  const selectedComponent = availableComponents.find(comp => comp.type === selectedComponentType);

  if (!selectedElement) {
    return (
      <div className="component-link-panel">
        <div className="panel-header">
          <h4>Component Links</h4>
          <span className="panel-subtitle">Link DAK components to BPMN elements</span>
        </div>
        <div className="no-selection">
          <div className="no-selection-icon">🔗</div>
          <p>Select a BPMN element to manage component links</p>
        </div>
      </div>
    );
  }

  return (
    <div className="component-link-panel">
      <div className="panel-header">
        <h4>Component Links</h4>
        <span className="panel-subtitle">Element: {selectedElement.businessObject?.name || selectedElement.id}</span>
      </div>

      <div className="panel-content">
        {currentLink ? (
          <div className="current-link">
            <div className="link-info">
              <div className="link-header">
                <span className="link-icon">
                  {componentLinkService.getVisualConfig(currentLink.type).icon}
                </span>
                <div className="link-details">
                  <div className="link-name">{currentLink.name}</div>
                  <div className="link-type">{currentLink.type}</div>
                </div>
              </div>
              {currentLink.description && (
                <div className="link-description">{currentLink.description}</div>
              )}
            </div>
            
            <div className="link-actions">
              <button 
                className="action-btn primary-outline"
                onClick={handleNavigateToComponent}
                title="Navigate to component editor"
              >
                <span>📝</span>
                Edit Component
              </button>
              <button 
                className="action-btn danger-outline"
                onClick={handleRemoveLink}
                title="Remove component link"
              >
                <span>🗑️</span>
                Remove Link
              </button>
            </div>
          </div>
        ) : (
          <div className="no-link">
            <p>No component linked to this element.</p>
            <button 
              className="action-btn primary"
              onClick={() => setShowLinkDialog(true)}
            >
              <span>🔗</span>
              Add Component Link
            </button>
          </div>
        )}

        {showLinkDialog && (
          <div className="link-dialog">
            <div className="dialog-header">
              <h5>Link Component</h5>
              <button 
                className="dialog-close"
                onClick={() => setShowLinkDialog(false)}
              >
                ✕
              </button>
            </div>

            <div className="dialog-content">
              <div className="form-group">
                <label>Component Type</label>
                <div className="component-types">
                  {availableComponents.map(component => (
                    <div 
                      key={component.type}
                      className={`component-type-option ${selectedComponentType === component.type ? 'selected' : ''}`}
                      onClick={() => setSelectedComponentType(component.type)}
                    >
                      <div className="option-header">
                        <span className="option-icon">{component.icon}</span>
                        <span className="option-name">{component.name}</span>
                      </div>
                      <div className="option-description">{component.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedComponentType && (
                <>
                  <div className="form-group">
                    <label htmlFor="componentName">Component Name</label>
                    <input
                      id="componentName"
                      type="text"
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      placeholder={`Enter ${selectedComponent?.name.toLowerCase()} name`}
                      className="form-input"
                    />
                    {selectedComponent && (
                      <div className="input-help">
                        Examples: {selectedComponent.examples.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="componentDescription">Description (Optional)</label>
                    <textarea
                      id="componentDescription"
                      value={componentDescription}
                      onChange={(e) => setComponentDescription(e.target.value)}
                      placeholder="Describe how this component relates to the BPMN element"
                      className="form-textarea"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="dialog-actions">
              <button 
                className="action-btn secondary"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="action-btn primary"
                onClick={handleAddLink}
                disabled={!selectedComponentType || !componentName.trim()}
              >
                Add Link
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="panel-stats">
        <div className="stats-item">
          <span className="stats-label">Total Links:</span>
          <span className="stats-value">{componentLinkService.getAllComponentLinks().size}</span>
        </div>
      </div>
    </div>
  );
};

export default ComponentLinkPanel;