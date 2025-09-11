/**
 * DAK Local Integration Demo Component
 * 
 * Demonstrates how DAK components can integrate with local repository service
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dakLocalIntegrationService from '../services/dakLocalIntegrationService';
import RepositoryServiceSelector from './RepositoryServiceSelector';

const DAKLocalIntegrationDemo = () => {
  const navigate = useNavigate();
  const { user, repo, branch } = useParams();
  
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [repositoryContext, setRepositoryContext] = useState(null);
  const [validationResults, setValidationResults] = useState({});
  const [supportedOperations, setSupportedOperations] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('DAKDashboard');
  const [fileReadingDemo, setFileReadingDemo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    updateIntegrationStatus();
    if (user && repo) {
      updateRepositoryContext();
    }
  }, [user, repo, branch]);

  const updateIntegrationStatus = () => {
    const status = dakLocalIntegrationService.getIntegrationStatus();
    setIntegrationStatus(status);
    
    const operations = dakLocalIntegrationService.getSupportedOperations();
    setSupportedOperations(operations);
  };

  const updateRepositoryContext = () => {
    if (user && repo) {
      const context = dakLocalIntegrationService.createRepositoryContext(user, repo, branch);
      setRepositoryContext(context);
    }
  };

  const handleServiceChange = (service, serviceType) => {
    updateIntegrationStatus();
    if (user && repo) {
      updateRepositoryContext();
    }
    setValidationResults({});
    setFileReadingDemo(null);
    setError(null);
  };

  const handleValidateComponent = async (componentName) => {
    if (!user || !repo) {
      setError('Please provide user and repo parameters in the URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const validation = await dakLocalIntegrationService.validateLocalRepositoryForComponent(
        componentName,
        user,
        repo
      );
      
      setValidationResults(prev => ({
        ...prev,
        [componentName]: validation
      }));
    } catch (err) {
      setError(`Validation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestFileReading = async () => {
    if (!user || !repo) {
      setError('Please provide user and repo parameters in the URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fallbackPaths = dakLocalIntegrationService.getLocalFallbackPaths(selectedComponent);
      const result = await dakLocalIntegrationService.readFileWithFallback(
        user,
        repo,
        'README.md',
        ['readme.md', 'README.txt', ...fallbackPaths]
      );
      
      setFileReadingDemo(result);
    } catch (err) {
      setError(`File reading failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const dakComponents = [
    'DAKDashboard',
    'CoreDataDictionaryViewer', 
    'BPMNViewer',
    'BPMNEditor',
    'QuestionnaireEditor',
    'DecisionSupportLogicView',
    'TestingViewer'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            DAK Local Integration Demo
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore how DAK components integrate with local repository service. 
            Test component compatibility, file reading, and validation features.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Main Dashboard
            </button>
            <button
              onClick={() => navigate('/local-repository-demo')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Local Repository Demo →
            </button>
          </div>
        </div>

        {/* Service Selector */}
        <div className="mb-8">
          <RepositoryServiceSelector 
            onServiceChange={handleServiceChange}
          />
        </div>

        {/* Repository Context */}
        {repositoryContext && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Repository Context
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Service Type:</span>
                <span className="ml-2 font-medium">{repositoryContext.serviceType}</span>
              </div>
              <div>
                <span className="text-gray-600">Repository:</span>
                <span className="ml-2 font-medium">{repositoryContext.user}/{repositoryContext.repo}</span>
              </div>
              <div>
                <span className="text-gray-600">Branch:</span>
                <span className="ml-2 font-medium">{repositoryContext.branch}</span>
              </div>
              <div>
                <span className="text-gray-600">Mode:</span>
                <span className={`ml-2 font-medium ${
                  repositoryContext.isLocal ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {repositoryContext.isLocal ? 'Local' : 'GitHub'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* No Repository Context Warning */}
        {!repositoryContext && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <p className="text-amber-800 text-sm">
              <strong>Note:</strong> For full demonstration, visit this page with repository parameters: 
              <code className="ml-1 bg-amber-100 px-1 rounded">/dak-local-integration-demo/user/repo/branch</code>
            </p>
          </div>
        )}

        {/* Integration Status */}
        {integrationStatus && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Integration Status
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Supported Components ({integrationStatus.supportedComponents.length})
                </h3>
                <div className="space-y-1">
                  {integrationStatus.supportedComponents.map(component => (
                    <div key={component} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      {component}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Recommendations
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {integrationStatus.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Supported Operations */}
        {supportedOperations && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Supported Operations
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(supportedOperations).map(([operation, supported]) => (
                <div key={operation} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    supported ? 'bg-green-400' : 'bg-gray-300'
                  }`}></span>
                  <span className={`text-sm ${
                    supported ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {operation.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Component Validation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Component Validation
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Test Component Compatibility
              </h3>
              
              <div className="space-y-3">
                {dakComponents.map(component => (
                  <div key={component} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-3 ${
                        integrationStatus?.supportedComponents.includes(component)
                          ? 'bg-green-400' 
                          : 'bg-gray-300'
                      }`}></span>
                      <span className="text-sm font-medium">{component}</span>
                    </div>
                    
                    <button
                      onClick={() => handleValidateComponent(component)}
                      disabled={loading || !user || !repo}
                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      Validate
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Validation Results
              </h3>
              
              {Object.keys(validationResults).length === 0 ? (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500">
                  <p className="text-sm">Click "Validate" to test component compatibility</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(validationResults).map(([component, result]) => (
                    <div key={component} className={`p-3 border rounded-md ${
                      result.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{component}</span>
                        <span className={`text-xs font-medium ${
                          result.isValid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {result.isValid ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                      
                      {result.foundFiles && (
                        <div className="text-xs text-green-700 mb-1">
                          Found: {result.foundFiles.join(', ')}
                        </div>
                      )}
                      
                      {result.missingFiles && (
                        <div className="text-xs text-red-700 mb-1">
                          Missing: {result.missingFiles.join(', ')}
                        </div>
                      )}
                      
                      {result.recommendations && (
                        <div className="text-xs text-gray-600">
                          {result.recommendations.join('; ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Reading Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            File Reading with Fallback
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Component for Fallback Paths
                </label>
                <select
                  value={selectedComponent}
                  onChange={(e) => setSelectedComponent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dakComponents.map(component => (
                    <option key={component} value={component}>{component}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Fallback paths for {selectedComponent}:
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {dakLocalIntegrationService.getLocalFallbackPaths(selectedComponent).map((path, index) => (
                    <li key={index}>• {path}</li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={handleTestFileReading}
                disabled={loading || !user || !repo}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loading ? 'Reading...' : 'Test File Reading'}
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                File Content
              </h3>
              
              {fileReadingDemo ? (
                <div className="border border-gray-200 rounded-md">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                    Found at: {fileReadingDemo.actualPath}
                  </div>
                  <pre className="p-4 text-xs text-gray-800 overflow-auto max-h-48 bg-white">
                    {fileReadingDemo.content.substring(0, 1000)}
                    {fileReadingDemo.content.length > 1000 && '\n... (truncated)'}
                  </pre>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500">
                  <p className="text-sm">Click "Test File Reading" to read files with fallback</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-8">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            🐱 About DAK Local Integration
          </h2>
          
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>Purpose:</strong> This service enables seamless integration between DAK components 
              and local repository service, allowing offline DAK development workflows.
            </p>
            
            <p>
              <strong>Features:</strong> Component compatibility checking, file reading with fallbacks, 
              repository validation, and service-specific operation support.
            </p>
            
            <p>
              <strong>Usage:</strong> DAK components automatically use this service to determine 
              available operations and adapt their behavior based on the current repository service type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAKLocalIntegrationDemo;