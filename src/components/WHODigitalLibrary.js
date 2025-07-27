import React, { useState, useEffect, useRef } from 'react';
import whoDigitalLibraryService from '../services/whoDigitalLibraryService';
import './WHODigitalLibrary.css';

const WHODigitalLibrary = ({ onReferencesChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedReferences, setSelectedReferences] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [featuredItems, setFeaturedItems] = useState([]);
  const searchInputRef = useRef(null);

  // Load featured items on component mount
  useEffect(() => {
    loadFeaturedItems();
  }, []);

  // Load saved references from localStorage on mount
  useEffect(() => {
    const savedReferences = localStorage.getItem('whoDigitalLibraryReferences');
    if (savedReferences) {
      try {
        const references = JSON.parse(savedReferences);
        setSelectedReferences(references);
        if (onReferencesChange) {
          onReferencesChange(references);
        }
      } catch (error) {
        console.error('Error loading saved references:', error);
      }
    }
  }, []); // Remove onReferencesChange from dependency array to prevent infinite loop

  // Save references to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('whoDigitalLibraryReferences', JSON.stringify(selectedReferences));
    if (onReferencesChange) {
      onReferencesChange(selectedReferences);
    }
  }, [selectedReferences, onReferencesChange]);

  const loadFeaturedItems = async () => {
    try {
      const items = await whoDigitalLibraryService.getFeaturedItems(5);
      setFeaturedItems(items);
    } catch (error) {
      console.error('Error loading featured items:', error);
    }
  };

  const handleSearch = async (query = searchQuery, page = 0) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalPages(0);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const results = await whoDigitalLibraryService.search(query, page, 10);
      setSearchResults(results.items);
      setTotalPages(results.totalPages);
      setTotalResults(results.totalElements);
      setCurrentPage(page);
    } catch (error) {
      setError(error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Get suggestions for autocomplete
    if (value.length >= 2) {
      try {
        const suggestions = await whoDigitalLibraryService.getSuggestions(value);
        setSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    handleSearch();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      handleSearch(searchQuery, newPage);
    }
  };

  const addReference = (item) => {
    const isAlreadySelected = selectedReferences.some(ref => ref.id === item.id);
    if (!isAlreadySelected) {
      setSelectedReferences(prev => [...prev, item]);
    }
  };

  const removeReference = (itemId) => {
    setSelectedReferences(prev => prev.filter(ref => ref.id !== itemId));
  };

  const clearAllReferences = () => {
    setSelectedReferences([]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date not available';
    if (Array.isArray(dateStr)) {
      dateStr = dateStr[0];
    }
    try {
      const date = new Date(dateStr);
      return date.getFullYear();
    } catch {
      return dateStr;
    }
  };

  const formatAuthors = (creators) => {
    if (!creators) return 'Author not available';
    if (Array.isArray(creators)) {
      return creators.slice(0, 3).join(', ') + (creators.length > 3 ? ', et al.' : '');
    }
    return creators;
  };

  const renderSearchResult = (item) => (
    <div key={item.id} className="search-result-item">
      <div className="result-content">
        <h4 className="result-title">{item.title}</h4>
        <div className="result-meta">
          <span className="result-authors">{formatAuthors(item.creator)}</span>
          <span className="result-date">({formatDate(item.dateIssued)})</span>
          {item.type && <span className="result-type">{item.type}</span>}
        </div>
        {item.abstract && (
          <p className="result-abstract">
            {item.abstract.length > 200 
              ? `${item.abstract.substring(0, 200)}...` 
              : item.abstract}
          </p>
        )}
        {item.subject && (
          <div className="result-subjects">
            {(Array.isArray(item.subject) ? item.subject : [item.subject])
              .slice(0, 3)
              .map((subject, index) => (
                <span key={index} className="subject-tag">{subject}</span>
              ))}
          </div>
        )}
      </div>
      <div className="result-actions">
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-secondary small"
          title="View in WHO Digital Library"
        >
          View
        </a>
        <button 
          onClick={() => addReference(item)}
          className="btn-primary small"
          disabled={selectedReferences.some(ref => ref.id === item.id)}
        >
          {selectedReferences.some(ref => ref.id === item.id) ? 'Added' : 'Add'}
        </button>
      </div>
    </div>
  );

  const renderSelectedReference = (item) => (
    <div key={item.id} className="selected-reference-item">
      <div className="reference-content">
        <h5 className="reference-title">{item.title}</h5>
        <div className="reference-meta">
          <span className="reference-authors">{formatAuthors(item.creator)}</span>
          <span className="reference-date">({formatDate(item.dateIssued)})</span>
        </div>
        <div className="reference-citation">
          {whoDigitalLibraryService.formatCitation(item, 'apa')}
        </div>
      </div>
      <div className="reference-actions">
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-link small"
          title="View in WHO Digital Library"
        >
          View
        </a>
        <button 
          onClick={() => removeReference(item.id)}
          className="btn-danger small"
          title="Remove reference"
        >
          Remove
        </button>
      </div>
    </div>
  );

  return (
    <div className="who-digital-library">
      <div className="library-header">
        <div className="header-content">
          <h3>WHO Digital Library</h3>
          <p className="library-description">
            Search and select references from the WHO Institutional Repository for Health Information (IRIS)
          </p>
          <div className="library-help">
            <a 
              href="https://iris.who.int/help" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="help-link"
              title="Get help with WHO Digital Library search"
            >
              📖 Search Help & Documentation
            </a>
          </div>
        </div>
        <div className="library-stats">
          <div className="stat">
            <span className="stat-number">{selectedReferences.length}</span>
            <span className="stat-label">Selected</span>
          </div>
          {totalResults > 0 && (
            <div className="stat">
              <span className="stat-number">{totalResults.toLocaleString()}</span>
              <span className="stat-label">Results</span>
            </div>
          )}
        </div>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Search WHO digital library..."
              className="search-input"
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {error && (
          <div className="error-message">
            <strong>Search Error:</strong> {error}
            {error.includes('CORS policy') && (
              <div className="error-help">
                <p><strong>Note:</strong> This error occurs in development mode due to browser security restrictions.</p>
                <p>
                  For help with WHO Digital Library search, visit: {' '}
                  <a 
                    href="https://iris.who.int/help" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="help-link"
                  >
                    iris.who.int/help
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="library-content">
        <div className="search-results-section">
          <div className="section-header">
            <h4>Search Results</h4>
            {totalResults > 0 && (
              <span className="results-count">
                {totalResults.toLocaleString()} results found
              </span>
            )}
          </div>

          {searchResults.length === 0 && !isSearching && searchQuery === '' && (
            <div className="featured-items">
              <h5>Featured Items</h5>
              <p>Recent publications from the WHO Digital Library:</p>
              {featuredItems.length > 0 ? (
                <div className="featured-items-grid">
                  {featuredItems.map(item => renderSearchResult(item))}
                </div>
              ) : (
                <p className="no-results">Loading featured items...</p>
              )}
            </div>
          )}

          {searchResults.length === 0 && !isSearching && searchQuery !== '' && (
            <div className="no-results">
              <p>No results found for "{searchQuery}"</p>
              <p>Try different keywords or browse featured items above.</p>
            </div>
          )}

          {isSearching && (
            <div className="loading-results">
              <div className="loading-spinner"></div>
              <p>Searching WHO Digital Library...</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(item => renderSearchResult(item))}
              
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="selected-references-section">
          <div className="section-header">
            <h4>Selected References</h4>
            {selectedReferences.length > 0 && (
              <button 
                onClick={clearAllReferences}
                className="btn-danger small"
                title="Clear all references"
              >
                Clear All
              </button>
            )}
          </div>

          {selectedReferences.length === 0 ? (
            <div className="no-references">
              <p>No references selected yet.</p>
              <p>Search and add references from the WHO Digital Library to build your reference list.</p>
            </div>
          ) : (
            <div className="selected-references">
              {selectedReferences.map(item => renderSelectedReference(item))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WHODigitalLibrary;