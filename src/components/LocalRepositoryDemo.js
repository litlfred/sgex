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
  const [gitStatus, setGitStatus] = useState(null);
  const [repositoryStats, setRepositoryStats] = useState(null);
  const [directoryListing, setDirectoryListing] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [dakValidation, setDakValidation] = useState(null);
  const [error, setError] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
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
    setGitStatus(null);
    setRepositoryStats(null);
    setDirectoryListing([]);
    setCurrentPath('');
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
    setGitStatus(null);
    setRepositoryStats(null);
    setDirectoryListing([]);
    setCurrentPath('');
    
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

    // Get git status
    try {
      const statusResult = await currentService.getGitStatus(repo.owner.login, repo.name);
      if (statusResult.success) {
        setGitStatus(statusResult.data);
      }
    } catch (err) {
      console.warn('Git status failed:', err);
    }

    // Get repository stats
    try {
      const statsResult = await currentService.getRepositoryStats(repo.owner.login, repo.name);
      if (statsResult.success) {
        setRepositoryStats(statsResult.data);
      }
    } catch (err) {
      console.warn('Repository stats failed:', err);
    }

    // List root directory files
    try {
      const filesResult = await currentService.listFiles(repo.owner.login, repo.name, '');
      if (filesResult.success) {
        setDirectoryListing(filesResult.data);
      }
    } catch (err) {
      console.warn('Directory listing failed:', err);
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

  const handleCreateFile = async () => {
    if (!selectedRepo || !currentService || !newFileName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const filePath = currentPath ? `${currentPath}/${newFileName}` : newFileName;
      const result = await currentService.createFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        filePath,
        newFileContent || '// New file created by SGEX Local Repository Service'
      );

      if (result.success) {
        setNewFileName('');
        setNewFileContent('');
        // Refresh directory listing
        const filesResult = await currentService.listFiles(
          selectedRepo.owner.login, 
          selectedRepo.name, 
          currentPath
        );
        if (filesResult.success) {
          setDirectoryListing(filesResult.data);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(`Failed to create file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToDirectory = async (dirPath) => {
    if (!selectedRepo || !currentService) return;

    setLoading(true);
    
    try {
      const filesResult = await currentService.listFiles(
        selectedRepo.owner.login,
        selectedRepo.name,
        dirPath
      );
      
      if (filesResult.success) {
        setDirectoryListing(filesResult.data);
        setCurrentPath(dirPath);
      } else {
        setError(filesResult.error);
      }
    } catch (err) {
      setError(`Failed to navigate to directory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoUpDirectory = () => {
    const pathParts = currentPath.split('/').filter(part => part.length > 0);
    pathParts.pop();
    const newPath = pathParts.join('/');
    handleNavigateToDirectory(newPath);
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

            {/* Repository Statistics */}
            {repositoryStats && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Repository Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Commits:</span>
                    <span className="ml-2 font-medium">{repositoryStats.commits}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Branches:</span>
                    <span className="ml-2 font-medium">{repositoryStats.branches}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Contributors:</span>
                    <span className="ml-2 font-medium">{repositoryStats.contributors}</span>
                  </div>
                </div>
                {repositoryStats.lastCommit && (
                  <div className="mt-2 text-xs text-gray-600">
                    Last commit: {repositoryStats.lastCommit.message} by {repositoryStats.lastCommit.author.name}
                  </div>
                )}
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Enhanced File Browser with Directory Navigation */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    File Browser
                  </h3>
                  {currentPath && (
                    <button
                      onClick={handleGoUpDirectory}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← Up
                    </button>
                  )}
                </div>
                
                <div className="mb-3 text-xs text-gray-500">
                  Path: /{currentPath || 'root'}
                </div>

                {/* Directory and File Listing */}
                <div className="space-y-1 max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                  {directoryListing.map((entry, index) => (
                    <button
                      key={index}
                      onClick={() => entry.type === 'dir' 
                        ? handleNavigateToDirectory(entry.path)
                        : handleReadFile(entry.path)
                      }
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 border-b border-gray-100 last:border-b-0"
                    >
                      {entry.type === 'dir' ? '📁' : '📄'} {entry.name}
                      {entry.size && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({entry.size} bytes)
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Quick Access Files */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Access</h4>
                  <div className="space-y-1">
                    {commonFiles.map((filePath) => (
                      <button
                        key={filePath}
                        onClick={() => handleReadFile(filePath)}
                        className="w-full text-left px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        📄 {filePath}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* File Content Viewer */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  File Content
                </h3>
                
                {fileContent ? (
                  <div className="border border-gray-200 rounded-md">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                      Content ({fileContent.length} characters)
                    </div>
                    <pre className="p-4 text-xs text-gray-800 overflow-auto max-h-96 bg-white">
                      {fileContent}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500">
                    <p className="text-sm">Select a file to view its content</p>
                  </div>
                )}
              </div>

              {/* File Operations Panel */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  File Operations
                </h3>
                
                {serviceType === 'local' && (
                  <div className="space-y-4">
                    {/* Create New File */}
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Create New File</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="Enter filename..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                          value={newFileContent}
                          onChange={(e) => setNewFileContent(e.target.value)}
                          placeholder="Enter file content..."
                          rows={4}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleCreateFile}
                          disabled={!newFileName.trim() || loading}
                          className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {loading ? 'Creating...' : 'Create File'}
                        </button>
                      </div>
                    </div>

                    {/* Git Status */}
                    {gitStatus && (
                      <div className="p-4 border border-gray-200 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Git Status</h4>
                        <div className="text-xs text-gray-600">
                          {gitStatus.length > 0 ? (
                            <p>{gitStatus.length} files tracked</p>
                          ) : (
                            <p>Git status available (details require enhanced implementation)</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Operation Status */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs text-green-800">
                        ✅ Local file operations enabled
                      </p>
                    </div>
                  </div>
                )}

                {serviceType !== 'local' && (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500">
                    <p className="text-sm">File operations available in local mode only</p>
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