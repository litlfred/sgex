import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from './framework';

const TestDashboard = () => {
  const navigate = useNavigate();

  // Mock data for testing
  const mockProfile = {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://github.com/testuser.png',
    token: 'mock_token'
  };

  const mockRepository = {
    name: 'test-dak-repo',
    full_name: 'testorg/test-dak-repo',
    owner: { login: 'testorg' },
    permissions: { push: false } // Simulate read-only access
  };

  const mockComponent = {
    id: 'business-processes',
    name: 'Generic Business Processes and Workflows',
    description: 'BPMN workflows and business process definitions that model clinical workflows and care pathways',
    icon: '🔄',
    type: 'Level 2',
    color: '#d13438'
  };

  const dakComponents = [
    {
      id: 'business-processes',
      name: 'Generic Business Processes and Workflows',
      description: 'BPMN workflows and business process definitions that model clinical workflows and care pathways',
      icon: '🔄',
      type: 'Level 2',
      color: '#d13438',
      fileTypes: ['BPMN', 'XML'],
      count: 12
    },
    {
      id: 'decision-support',
      name: 'Decision-Support Logic',
      description: 'DMN decision tables and clinical decision support rules that encode clinical logic',
      icon: '🎯',
      type: 'Level 2',
      color: '#00bcf2',
      fileTypes: ['DMN', 'XML'],
      count: 8
    },
    {
      id: 'indicators',
      name: 'Program Indicators',
      description: 'Performance indicators and measurement definitions for monitoring and evaluation',
      icon: '📊',
      type: 'Level 2',
      color: '#498205',
      fileTypes: ['Measure', 'Logic'],
      count: 15
    },
    {
      id: 'forms',
      name: 'FHIR Questionnaires',
      description: 'Structured forms and questionnaires for data collection',
      icon: '📋',
      type: 'Level 3',
      color: '#881798',
      fileTypes: ['Questionnaire', 'StructureMap'],
      count: 24
    }
  ];

  const handleComponentClick = (component) => {
    // For business processes, navigate to selection page without permission check
    if (component.id === 'business-processes') {
      navigate('/business-process-selection', {
        state: {
          profile: mockProfile,
          repository: mockRepository,
          component: mockComponent
        }
      });
      return;
    }

    // For other components, show alert for demo
    alert(`Would normally check permissions and navigate to ${component.name} editor`);
  };

  return (
    <PageLayout pageName="test-dashboard">
      <div className="test-dashboard">
        <div className="dashboard-content">
        <div className="breadcrumb">
          <span className="breadcrumb-current">DAK Components (Test Mode)</span>
        </div>

        <div className="dashboard-main">
          <div className="dashboard-intro">
            <h2>Digital Adaptation Kit Components</h2>
            <p>
              Select a component to test the new business process navigation. 
              <strong>Click "Generic Business Processes and Workflows" to test the new selection flow!</strong>
            </p>
          </div>

          <div className="components-grid">
            {dakComponents.map((component) => (
              <div 
                key={component.id}
                className={`component-card ${component.type.toLowerCase().replace(' ', '-')} ${component.id === 'business-processes' ? 'highlighted' : ''}`}
                onClick={() => handleComponentClick(component)}
                style={{ '--component-color': component.color }}
              >
                <div className="component-header">
                  <div className="component-icon" style={{ color: component.color }}>
                    {component.icon}
                  </div>
                  <div className="component-badge">
                    <span className={`level-badge ${component.type.toLowerCase().replace(' ', '-')}`}>
                      {component.type}
                    </span>
                  </div>
                </div>
                
                <div className="component-content">
                  <h3>{component.name}</h3>
                  <p>{component.description}</p>
                  
                  <div className="component-meta">
                    <div className="file-types">
                      {component.fileTypes.map((type) => (
                        <span key={type} className="file-type-tag">{type}</span>
                      ))}
                    </div>
                    <div className="file-count">
                      {component.count} files
                    </div>
                  </div>

                  {component.id === 'business-processes' && (
                    <div className="demo-badge">
                      ✨ NEW NAVIGATION FLOW
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      </div>
    </PageLayout>
  );
};

export default TestDashboard;