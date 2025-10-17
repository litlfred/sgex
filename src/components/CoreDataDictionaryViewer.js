import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, usePage } from './framework';
import { useDakComponent } from '../services/ComponentObjectProvider';
import './CoreDataDictionaryViewer.css';

/**
 * Core Data Dictionary Viewer - Clean Component Object Implementation
 * 
 * Uses CoreDataElementComponent for all data operations:
 * - Loading core data elements from repository
 * - No direct GitHub API or staging ground access
 * - Automatic dak.json source management
 */
const CoreDataDictionaryViewer = () => {
  return (
    <PageLayout pageName="core-data-dictionary-viewer">
      <CoreDataDictionaryViewerContent />
    </PageLayout>
  );
};

const CoreDataDictionaryViewerContent = () => {
  const navigate = useNavigate();
  const { profile, repository, branch } = usePage();
  
  // Component Object for core data elements
  const dataElementsComponent = useDakComponent('dataElements');
  
  const user = profile?.login;
  const repo = repository?.name;
  
  const [dataElements, setDataElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasPublishedDak, setHasPublishedDak] = useState(false);
  const [checkingPublishedDak, setCheckingPublishedDak] = useState(false);

  // Handle Escape key for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };
    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showModal]);

  // Generate base URL for IG Publisher artifacts
  const getBaseUrl = useCallback((branchName) => {
    const owner = user || repository?.owner?.login || repository?.full_name?.split('/')[0];
    const repoName = repo || repository?.name;
    
    if (branchName === (repository?.default_branch || 'main')) {
      return `https://${owner}.github.io/${repoName}`;
    } else {
      return `https://${owner}.github.io/${repoName}/branches/${branchName}`;
    }
  }, [user, repository, repo]);

  // Check for published DAK
  const checkPublishedDak = useCallback(async () => {
    if (!user || !repo || !branch) return;
    
    setCheckingPublishedDak(true);
    try {
      const baseUrl = getBaseUrl(branch);
      const dakJsonUrl = `${baseUrl}/dak.json`;
      
      const response = await fetch(dakJsonUrl);
      setHasPublishedDak(response.ok);
    } catch (err) {
      setHasPublishedDak(false);
    } finally {
      setCheckingPublishedDak(false);
    }
  }, [user, repo, branch, getBaseUrl]);

  // Load data elements using Component Object
  const loadDataElements = useCallback(async () => {
    if (!dataElementsComponent) {
      setError('Data elements component not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Retrieve all data elements through Component Object
      const elements = await dataElementsComponent.retrieveAll();
      setDataElements(elements || []);
    } catch (err) {
      console.error('Error loading data elements:', err);
      setError(err.message || 'Failed to load core data elements');
    } finally {
      setLoading(false);
    }
  }, [dataElementsComponent]);

  // Initial load
  useEffect(() => {
    if (dataElementsComponent && user && repo) {
      loadDataElements();
      checkPublishedDak();
    }
  }, [dataElementsComponent, user, repo, loadDataElements, checkPublishedDak]);

  // Navigation handlers
  const handleHomeNavigation = () => {
    navigate('/');
  };

  const handleBackToDashboard = () => {
    if (user && repo) {
      const dashboardPath = branch ? 
        `/dashboard/${user}/${repo}/${branch}` : 
        `/dashboard/${user}/${repo}`;
      navigate(dashboardPath);
    } else {
      navigate('/dashboard', { 
        state: { 
          selectedProfile: profile,
          selectedRepository: repository,
          selectedBranch: branch
        }
      });
    }
  };

  // Modal handlers
  const openModal = (element) => {
    setSelectedElement(element);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedElement(null);
  };

  // Filter data elements by search term
  const filteredElements = dataElements.filter(element => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      element.id?.toLowerCase().includes(search) ||
      element.canonical?.toLowerCase().includes(search) ||
      element.type?.toLowerCase().includes(search) ||
      element.description?.toLowerCase().includes(search)
    );
  });

  // Render loading state
  if (loading) {
    return (
      <div className="core-data-dictionary-container">
        <div className="core-data-dictionary-header">
          <div className="header-actions">
            <button onClick={handleHomeNavigation} className="home-button">
              🏠 Home
            </button>
            <button onClick={handleBackToDashboard} className="back-button">
              ← Back to Dashboard
            </button>
          </div>
          <h1>Core Data Dictionary</h1>
          <p className="header-subtitle">Loading core data elements...</p>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading core data elements from Component Object...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="core-data-dictionary-container">
        <div className="core-data-dictionary-header">
          <div className="header-actions">
            <button onClick={handleHomeNavigation} className="home-button">
              🏠 Home
            </button>
            <button onClick={handleBackToDashboard} className="back-button">
              ← Back to Dashboard
            </button>
          </div>
          <h1>Core Data Dictionary</h1>
        </div>
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
          <button onClick={loadDataElements} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <div className="core-data-dictionary-container">
      <div className="core-data-dictionary-header">
        <div className="header-actions">
          <button onClick={handleHomeNavigation} className="home-button">
            🏠 Home
          </button>
          <button onClick={handleBackToDashboard} className="back-button">
            ← Back to Dashboard
          </button>
        </div>
        <h1>Core Data Dictionary</h1>
        <p className="header-subtitle">
          {user && repo && (
            <>Repository: {user}/{repo} {branch && `(${branch})`}</>
          )}
        </p>
        {hasPublishedDak && (
          <div className="published-dak-banner">
            ✅ Published DAK available at{' '}
            <a 
              href={`${getBaseUrl(branch)}/dak.json`}
              target="_blank" 
              rel="noopener noreferrer"
            >
              {getBaseUrl(branch)}/dak.json
            </a>
          </div>
        )}
      </div>

      <div className="dictionary-content">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search data elements by ID, canonical, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="search-stats">
            Showing {filteredElements.length} of {dataElements.length} data elements
          </div>
        </div>

        {filteredElements.length === 0 ? (
          <div className="no-elements">
            {searchTerm ? (
              <p>No data elements match your search criteria</p>
            ) : (
              <p>No core data elements found in this repository</p>
            )}
          </div>
        ) : (
          <div className="elements-table-container">
            <table className="elements-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Canonical</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredElements.map((element, index) => (
                  <tr key={element.id || index}>
                    <td className="element-id">{element.id || 'N/A'}</td>
                    <td className="element-type">
                      <span className={`type-badge type-${element.type}`}>
                        {element.type || 'unknown'}
                      </span>
                    </td>
                    <td className="element-canonical">
                      {element.canonical ? (
                        <a
                          href={element.canonical}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={element.canonical}
                        >
                          {element.canonical}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="element-description">
                      {typeof element.description === 'string' 
                        ? element.description.substring(0, 100) + (element.description.length > 100 ? '...' : '')
                        : 'N/A'}
                    </td>
                    <td className="element-actions">
                      <button
                        onClick={() => openModal(element)}
                        className="view-button"
                        title="View details"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for viewing element details */}
      {showModal && selectedElement && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Core Data Element Details</h2>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="element-detail">
                <strong>ID:</strong>
                <span>{selectedElement.id || 'N/A'}</span>
              </div>
              <div className="element-detail">
                <strong>Type:</strong>
                <span className={`type-badge type-${selectedElement.type}`}>
                  {selectedElement.type || 'unknown'}
                </span>
              </div>
              <div className="element-detail">
                <strong>Canonical:</strong>
                {selectedElement.canonical ? (
                  <a
                    href={selectedElement.canonical}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedElement.canonical}
                  </a>
                ) : (
                  <span>N/A</span>
                )}
              </div>
              <div className="element-detail">
                <strong>Description:</strong>
                <div className="element-description-full">
                  {typeof selectedElement.description === 'string' 
                    ? selectedElement.description
                    : typeof selectedElement.description === 'object'
                    ? <a href={selectedElement.description.url} target="_blank" rel="noopener noreferrer">
                        {selectedElement.description.url}
                      </a>
                    : 'N/A'}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="modal-close-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreDataDictionaryViewer;
