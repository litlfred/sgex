/**
 * Repository Service Selector Component
 * 
 * Allows users to switch between GitHub (remote) and Local repository services
 * and provides service-specific configuration options
 */

import React, { useState, useEffect } from 'react';
import repoServiceFactory from '../services/repoServiceFactory';
import localRepoConfigService from '../services/localRepoConfigService';

const RepositoryServiceSelector = ({ onServiceChange, currentService }) => {
  const [selectedService, setSelectedService] = useState('github');
  const [availableServices, setAvailableServices] = useState([]);
  const [serviceCapabilities, setServiceCapabilities] = useState({});
  const [localDirectorySelected, setLocalDirectorySelected] = useState(false);
  const [lastUsedDirectories, setLastUsedDirectories] = useState([]);

  useEffect(() => {
    // Get available service types based on browser support
    const available = repoServiceFactory.getAvailableServiceTypes();
    setAvailableServices(available);

    // Get current service type
    const current = currentService || repoServiceFactory.getServiceType();
    setSelectedService(current);

    // Load local configuration
    const config = localRepoConfigService.getConfig();
    setLastUsedDirectories(config.lastUsedDirectories);
    setLocalDirectorySelected(!!config.selectedDirectory);

    // Update capabilities
    updateServiceCapabilities(current);
  }, [currentService]);

  const updateServiceCapabilities = (serviceType) => {
    const capabilities = repoServiceFactory.getServiceCapabilities(serviceType);
    setServiceCapabilities(capabilities);
  };

  const handleServiceChange = async (serviceType) => {
    try {
      const service = repoServiceFactory.switchToService(serviceType);
      setSelectedService(serviceType);
      updateServiceCapabilities(serviceType);
      
      // Update local configuration preference
      localRepoConfigService.setPreferredServiceType(serviceType);

      // Notify parent component
      if (onServiceChange) {
        onServiceChange(service, serviceType);
      }
    } catch (error) {
      console.error('Failed to switch service:', error);
      alert(`Failed to switch to ${serviceType} service: ${error.message}`);
    }
  };

  const handleLocalDirectorySelection = async () => {
    try {
      const localService = repoServiceFactory.createLocalService();
      const success = await localService.authenticate();
      
      if (success) {
        setLocalDirectorySelected(true);
        const config = localRepoConfigService.getConfig();
        setLastUsedDirectories(config.lastUsedDirectories);
        
        // Automatically switch to local service after successful directory selection
        if (selectedService !== 'local') {
          await handleServiceChange('local');
        }
      } else {
        alert('Failed to select local directory. Please ensure your browser supports the File System Access API and you have given permission.');
      }
    } catch (error) {
      console.error('Failed to select local directory:', error);
      alert(`Failed to select local directory: ${error.message}`);
    }
  };

  const ServiceCapabilityBadge = ({ capability, label, enabled }) => (
    <span 
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 mb-1 ${
        enabled 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
      title={enabled ? `${label} is supported` : `${label} is not supported`}
    >
      {enabled ? '✓' : '✗'} {label}
    </span>
  );

  return (
    <div className="repository-service-selector bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Repository Service Selection
      </h3>
      
      {/* Service Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose Repository Source:
        </label>
        
        <div className="space-y-3">
          {availableServices.includes('github') && (
            <label className="flex items-center">
              <input
                type="radio"
                name="service-type"
                value="github"
                checked={selectedService === 'github'}
                onChange={() => handleServiceChange('github')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3 flex items-center">
                <span className="text-sm font-medium text-gray-900">GitHub (Remote)</span>
                <span className="ml-2 text-xs text-gray-500">
                  Access repositories hosted on GitHub
                </span>
              </span>
            </label>
          )}
          
          {availableServices.includes('local') && (
            <label className="flex items-center">
              <input
                type="radio"
                name="service-type"
                value="local"
                checked={selectedService === 'local'}
                onChange={() => handleServiceChange('local')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3 flex items-center">
                <span className="text-sm font-medium text-gray-900">Local Repositories</span>
                <span className="ml-2 text-xs text-gray-500">
                  Access git repositories on your computer
                </span>
                {!localDirectorySelected && (
                  <span className="ml-2 text-xs text-amber-600 font-medium">
                    (No directory selected)
                  </span>
                )}
              </span>
            </label>
          )}
        </div>

        {availableServices.length === 1 && availableServices[0] === 'github' && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Local repository access requires a browser that supports the File System Access API 
              (Chrome, Edge, Opera). Your browser only supports GitHub repositories.
            </p>
          </div>
        )}
      </div>

      {/* Local Service Configuration */}
      {selectedService === 'local' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-3">
            Local Repository Configuration
          </h4>
          
          <button
            onClick={handleLocalDirectorySelection}
            className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            📁 Select Local Directory
          </button>
          
          {lastUsedDirectories.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-blue-700 mb-2">Recently used directories:</p>
              <ul className="text-xs text-blue-600 space-y-1">
                {lastUsedDirectories.slice(0, 3).map((dir, index) => (
                  <li key={index} className="truncate">📂 {dir}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Service Capabilities Display */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          {selectedService === 'github' ? 'GitHub Service' : 'Local Service'} Capabilities:
        </h4>
        
        <div className="flex flex-wrap">
          <ServiceCapabilityBadge 
            capability="authentication" 
            label="Authentication" 
            enabled={serviceCapabilities.hasAuthentication} 
          />
          <ServiceCapabilityBadge 
            capability="organizations" 
            label="Organizations" 
            enabled={serviceCapabilities.hasOrganizations} 
          />
          <ServiceCapabilityBadge 
            capability="collaboration" 
            label="Collaboration" 
            enabled={serviceCapabilities.hasCollaboration} 
          />
          <ServiceCapabilityBadge 
            capability="issues" 
            label="Issues" 
            enabled={serviceCapabilities.hasIssues} 
          />
          <ServiceCapabilityBadge 
            capability="pullRequests" 
            label="Pull Requests" 
            enabled={serviceCapabilities.hasPullRequests} 
          />
          <ServiceCapabilityBadge 
            capability="privateRepos" 
            label="Private Repos" 
            enabled={serviceCapabilities.supportsPrivateRepos} 
          />
          {serviceCapabilities.hasFileSystemAccess && (
            <ServiceCapabilityBadge 
              capability="fileSystemAccess" 
              label="File System Access" 
              enabled={true} 
            />
          )}
          {serviceCapabilities.hasLocalBranching && (
            <ServiceCapabilityBadge 
              capability="localBranching" 
              label="Local Branching" 
              enabled={true} 
            />
          )}
        </div>
      </div>

      {/* Current Service Status */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Current Service: <strong>{selectedService === 'github' ? 'GitHub' : 'Local Repositories'}</strong>
          </span>
          
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              selectedService === 'github' 
                ? 'bg-blue-500' 
                : localDirectorySelected 
                  ? 'bg-green-500' 
                  : 'bg-amber-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              {selectedService === 'github' 
                ? 'Ready for GitHub operations' 
                : localDirectorySelected 
                  ? 'Ready for local operations'
                  : 'Directory selection required'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryServiceSelector;