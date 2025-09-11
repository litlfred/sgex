/**
 * Local Repository Demo Page
 * 
 * Demonstrates the local repository service functionality
 * Shows repository scanning, DAK validation, and file operations
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RepositoryServiceSelector from '../components/RepositoryServiceSelector';
import repoServiceFactory from '../services/repoServiceFactory';

const LocalRepositoryDemo = () => {
  const [currentService, setCurrentService] = useState(null);
  const [serviceType, setServiceType] = useState('github');
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [dakValidation, setDakValidation] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize with current service
    const service = repoServiceFactory.getCurrentService();
    setCurrentService(service);
    setServiceType(service.serviceType);
  }, []);

  const handleServiceChange = async (service, type) => {
    setCurrentService(service);
    setServiceType(type);
    setRepositories([]);
    setSelectedRepo(null);
    setFileContent('');
    setDakValidation(null);
    setError(null);
  };

  const handleScanRepositories = async () => {
    if (!currentService) return;

    setLoading(true);
    setError(null);

    try {
      if (serviceType === 'local') {
        // For local service, scan the selected directory
        const localService = currentService;
        const result = await localService.scanLocalDirectory('current');
        
        if (result.success) {
          setRepositories(result.data);
        } else {
          setError(result.error);
        }
      } else {
        // For GitHub service, we would list user's repositories
        // This is a simplified demo - in real implementation you'd get the authenticated user first
        setError('GitHub repository listing requires authentication - this is a demo page');
      }
    } catch (err) {
      setError(`Failed to scan repositories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRepositorySelect = async (repo) => {
    setSelectedRepo(repo);
    setFileContent('');
    setDakValidation(null);
    
    // Validate if it's a DAK repository
    try {
      const validation = await currentService.validateDAKRepository(
        repo.owner.login, 
        repo.name
      );
      setDakValidation(validation);
    } catch (err) {
      console.warn('DAK validation failed:', err);
    }
  };

  const handleReadFile = async (filePath) => {
    if (!selectedRepo || !currentService) return;

    setLoading(true);
    setError(null);

    try {
      const content = await currentService.getFileContent(
        selectedRepo.owner.login,
        selectedRepo.name,
        filePath
      );
      setFileContent(content);
    } catch (err) {
      setError(`Failed to read file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const commonFiles = [
    'README.md',
    'sushi-config.yaml',
    'package.json',
    'input/vocabulary.md',
    'input/profiles.md'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Local Repository Service Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore the local repository service functionality. Select a local directory 
            containing git repositories, scan for DAKs, and browse file contents.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Main Dashboard
          </button>
        </div>

        {/* Service Selector */}
        <div className="mb-8">
          <RepositoryServiceSelector 
            onServiceChange={handleServiceChange}
            currentService={serviceType}
          />
        </div>

        {/* Repository Scanner */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Repository Scanner
            </h2>
            
            <button
              onClick={handleScanRepositories}
              disabled={loading || !currentService || (serviceType === 'local' && !currentService.authenticated)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? '🔍 Scanning...' : '🔍 Scan Repositories'}
            </button>
          </div>

          {serviceType === 'local' && !currentService?.authenticated && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
              <p className="text-sm text-amber-800">
                Please select a local directory first using the service selector above.
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {repositories.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Found {repositories.length} Repositories
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {repositories.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => handleRepositorySelect(repo)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRepo?.id === repo.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {repo.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {repo.owner.login}
                        </p>
                        {repo.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center ml-2">
                        {serviceType === 'local' && (
                          <span className="inline-block w-2 h-2 bg-green-400 rounded-full" title="Local Repository"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Repository Details */}
        {selectedRepo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Repository: {selectedRepo.name}
              </h2>
              
              {dakValidation && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  dakValidation.isDak 
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {dakValidation.isDak ? '✅ Valid DAK' : '❌ Not a DAK'}
                </div>
              )}
            </div>

            {dakValidation && !dakValidation.isDak && dakValidation.validationError && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>DAK Validation:</strong> {dakValidation.validationError}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* File Browser */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Browse Files
                </h3>
                
                <div className="space-y-2">
                  {commonFiles.map((filePath) => (
                    <button
                      key={filePath}
                      onClick={() => handleReadFile(filePath)}
                      className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      📄 {filePath}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Content Viewer */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  File Content
                </h3>
                
                {fileContent ? (
                  <div className="border border-gray-200 rounded-md">
                    <pre className="p-4 text-xs text-gray-800 overflow-auto max-h-64 bg-gray-50">
                      {fileContent}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500">
                    <p className="text-sm">Select a file to view its content</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            🐱 About Local Repository Service
          </h2>
          
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>What it does:</strong> The local repository service allows SGEX to work with 
              git repositories stored on your computer, providing offline access to DAK development.
            </p>
            
            <p>
              <strong>Requirements:</strong> A modern browser with File System Access API support 
              (Chrome 86+, Edge 86+, Opera 72+). Local directories must contain valid git repositories.
            </p>
            
            <p>
              <strong>Features:</strong> Repository scanning, DAK validation, file browsing, 
              and future support for local commits and branching.
            </p>
            
            <p>
              <strong>Privacy:</strong> All operations are performed locally in your browser. 
              No data is transmitted to external servers unless you explicitly sync with GitHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalRepositoryDemo;