/**
 * WHO Digital Library Service
 * 
 * Service for interacting with the WHO digital library (iris.who.int)
 * which uses DSpace software with Dublin Core metadata standards.
 */

class WHODigitalLibraryService {
  constructor() {
    // Use proxy in development, direct API in production
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.baseUrl = this.isDevelopment ? '/api/who' : 'https://iris.who.int';
    this.restApi = `${this.baseUrl}/rest`;
    this.searchEndpoint = `${this.restApi}/discover/search/objects`;
    this.originalBaseUrl = 'https://iris.who.int'; // For constructing public URLs
  }

  /**
   * Search the WHO digital library
   * @param {string} query - Search query string
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Number of results per page (default: 20)
   * @param {string} sort - Sort field (default: 'dc.title')
   * @param {string} order - Sort order 'asc' or 'desc' (default: 'asc')
   * @returns {Promise<Object>} Search results with metadata
   */
  async search(query, page = 0, size = 20, sort = 'dc.title', order = 'asc') {
    try {
      const params = new URLSearchParams({
        query: query,
        page: page.toString(),
        size: size.toString(),
        sort: `${sort},${order}`
      });

      const url = `${this.searchEndpoint}?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'SGEX-Workbench/1.0 (WHO Digital Library Integration)',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 403) {
          throw new Error(`Access denied (HTTP 403): The WHO Digital Library API is currently restricting access. This may be due to rate limiting, API access policies, or temporary restrictions. Please try again later or contact WHO for API access guidelines.`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded (HTTP 429): Too many requests to the WHO Digital Library API. Please wait a moment before searching again.`);
        } else if (response.status === 500) {
          throw new Error(`Server error (HTTP 500): The WHO Digital Library API is experiencing technical difficulties. Please try again later.`);
        } else if (response.status === 404) {
          throw new Error(`Service not found (HTTP 404): The WHO Digital Library API endpoint may have changed. Please check for updates.`);
        } else {
          throw new Error(`HTTP error! status: ${response.status} - Unable to access WHO Digital Library API`);
        }
      }

      const data = await response.json();
      return this.processSearchResults(data);
    } catch (error) {
      console.error('Error searching WHO digital library:', error);
      
      // Check if this is a CORS-related error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        if (this.isDevelopment) {
          throw new Error('Unable to connect to WHO Digital Library. Please restart the development server to enable the API proxy. If the problem persists, the WHO IRIS service may be temporarily unavailable.');
        } else {
          throw new Error('Unable to access WHO Digital Library. This may be due to network restrictions or the service being temporarily unavailable.');
        }
      }
      
      // Check if this is a 403 access denied error
      if (error.message.includes('HTTP 403')) {
        // For development mode, we can suggest using mock data
        if (this.isDevelopment) {
          console.warn('WHO API returned 403 - using mock search results for development');
          return this.getMockSearchResults(query, page, size);
        }
      }
      
      throw new Error(`Failed to search WHO digital library: ${error.message}`);
    }
  }

  /**
   * Get detailed metadata for a specific item
   * @param {string} uuid - Item UUID
   * @returns {Promise<Object>} Item metadata
   */
  async getItemMetadata(uuid) {
    try {
      const url = `${this.restApi}/core/items/${uuid}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SGEX-Workbench/1.0 (WHO Digital Library Integration)',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        // Handle specific HTTP status codes  
        if (response.status === 403) {
          throw new Error(`Access denied (HTTP 403): Unable to fetch item metadata due to API access restrictions.`);
        } else if (response.status === 404) {
          throw new Error(`Item not found (HTTP 404): The requested item may have been removed or the identifier is invalid.`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      return this.processDublinCoreMetadata(data);
    } catch (error) {
      console.error('Error fetching item metadata:', error);
      throw new Error(`Failed to fetch item metadata: ${error.message}`);
    }
  }

  /**
   * Process search results and extract relevant information
   * @param {Object} rawData - Raw API response
   * @returns {Object} Processed search results
   */
  processSearchResults(rawData) {
    if (!rawData || !rawData._embedded || !rawData._embedded.searchResult) {
      return {
        items: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 0
      };
    }

    const searchResult = rawData._embedded.searchResult;
    const items = (searchResult._embedded?.objects || []).map(item => {
      return this.processDublinCoreMetadata(item._embedded?.indexableObject || item);
    });

    return {
      items,
      totalElements: searchResult.page?.totalElements || 0,
      totalPages: searchResult.page?.totalPages || 0,
      currentPage: searchResult.page?.number || 0,
      size: searchResult.page?.size || 0
    };
  }

  /**
   * Process Dublin Core metadata into a standardized format
   * @param {Object} item - Raw item data
   * @returns {Object} Processed item with Dublin Core metadata
   */
  processDublinCoreMetadata(item) {
    if (!item || !item.metadata) {
      return null;
    }

    const metadata = item.metadata;
    
    // Helper function to extract metadata values
    const getMetadataValue = (field) => {
      const fieldData = metadata[field];
      if (!fieldData || !Array.isArray(fieldData)) return null;
      if (fieldData.length === 0) return null;
      if (fieldData.length === 1) return fieldData[0].value;
      return fieldData.map(item => item.value);
    };

    // Extract Dublin Core fields
    const processed = {
      id: item.uuid || item.id,
      handle: item.handle,
      
      // Dublin Core Title
      title: getMetadataValue('dc.title') || 'Untitled',
      
      // Dublin Core Creator (Author)
      creator: getMetadataValue('dc.creator'),
      author: getMetadataValue('dc.contributor.author'),
      
      // Dublin Core Subject
      subject: getMetadataValue('dc.subject'),
      keywords: getMetadataValue('dc.subject.keyword'),
      
      // Dublin Core Description
      description: getMetadataValue('dc.description'),
      abstract: getMetadataValue('dc.description.abstract'),
      
      // Dublin Core Publisher
      publisher: getMetadataValue('dc.publisher') || 'World Health Organization',
      
      // Dublin Core Date
      date: getMetadataValue('dc.date'),
      dateIssued: getMetadataValue('dc.date.issued'),
      dateCreated: getMetadataValue('dc.date.created'),
      
      // Dublin Core Type
      type: getMetadataValue('dc.type'),
      
      // Dublin Core Format
      format: getMetadataValue('dc.format'),
      
      // Dublin Core Identifier
      identifier: getMetadataValue('dc.identifier'),
      doi: getMetadataValue('dc.identifier.doi'),
      isbn: getMetadataValue('dc.identifier.isbn'),
      uri: getMetadataValue('dc.identifier.uri'),
      
      // Dublin Core Source
      source: getMetadataValue('dc.source'),
      
      // Dublin Core Language
      language: getMetadataValue('dc.language') || getMetadataValue('dc.language.iso'),
      
      // Dublin Core Relation
      relation: getMetadataValue('dc.relation'),
      
      // Dublin Core Coverage
      coverage: getMetadataValue('dc.coverage'),
      
      // Dublin Core Rights
      rights: getMetadataValue('dc.rights'),
      
      // Additional WHO-specific fields
      whoRegion: getMetadataValue('who.region'),
      whoTopic: getMetadataValue('who.topic'),
      whoDocumentType: getMetadataValue('who.document.type'),
      
      // URLs
      url: this.constructItemUrl(item.handle),
      downloadUrl: this.constructDownloadUrl(item.uuid),
      
      // Raw metadata for advanced use cases
      rawMetadata: metadata
    };

    return processed;
  }

  /**
   * Construct URL for viewing item in WHO digital library
   * @param {string} handle - Item handle
   * @returns {string} Item URL
   */
  constructItemUrl(handle) {
    if (!handle) return null;
    // Always use the original WHO URL for public links, not the proxy
    return `${this.originalBaseUrl}/handle/${handle}`;
  }

  /**
   * Construct download URL for item
   * @param {string} uuid - Item UUID
   * @returns {string} Download URL
   */
  constructDownloadUrl(uuid) {
    if (!uuid) return null;
    return `${this.restApi}/core/bitstreams/search/findByItem?uuid=${uuid}`;
  }

  /**
   * Search suggestions for autocomplete
   * @param {string} query - Partial query string
   * @returns {Promise<Array>} Array of suggestion strings
   */
  async getSuggestions(query) {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      // Use a smaller search to get suggestions
      const results = await this.search(query, 0, 10);
      
      // Extract unique titles and subjects for suggestions
      const suggestions = new Set();
      
      results.items.forEach(item => {
        if (item.title) {
          suggestions.add(item.title);
        }
        if (item.subject) {
          if (Array.isArray(item.subject)) {
            item.subject.forEach(s => suggestions.add(s));
          } else {
            suggestions.add(item.subject);
          }
        }
      });

      return Array.from(suggestions).slice(0, 10);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular/featured items from WHO digital library
   * @param {number} limit - Number of items to return
   * @returns {Promise<Array>} Array of popular items
   */
  async getFeaturedItems(limit = 10) {
    try {
      // Search for recent or popular items
      // This could be enhanced based on WHO's specific API capabilities
      const results = await this.search('*', 0, limit, 'dc.date.issued', 'desc');
      return results.items;
    } catch (error) {
      console.error('Error fetching featured items:', error);
      
      // Return sample/mock data when API is not accessible
      if (error.message.includes('CORS policy') || 
          error.message.includes('HTTP 403') || 
          error.message.includes('Failed to fetch')) {
        console.warn('Using mock featured items due to API access issues');
        return this.getMockFeaturedItems();
      }
      
      return [];
    }
  }

  /**
   * Get mock featured items as fallback when API is not accessible
   * @returns {Array} Array of mock items with proper structure
   */
  getMockFeaturedItems() {
    return [
      {
        id: 'mock-1',
        title: 'WHO Digital Library Search Help',
        creator: 'World Health Organization',
        dateIssued: '2024',
        type: 'Documentation',
        abstract: 'This is a demonstration of the WHO Digital Library integration. In production, this would show real publications from iris.who.int.',
        subject: ['Digital Library', 'IRIS', 'WHO Publications'],
        url: 'https://iris.who.int/help',
        rawMetadata: {}
      },
      {
        id: 'mock-2', 
        title: 'How to Search WHO IRIS',
        creator: 'World Health Organization',
        dateIssued: '2024',
        type: 'Help Documentation',
        abstract: 'Learn how to effectively search the WHO Institutional Repository for Health Information (IRIS) for publications and resources.',
        subject: ['Search', 'IRIS', 'Help'],
        url: 'https://iris.who.int/help',
        rawMetadata: {}
      }
    ];
  }

  /**
   * Get mock search results as fallback when API returns 403 or other errors
   * @param {string} query - Search query
   * @param {number} page - Page number  
   * @param {number} size - Page size
   * @returns {Object} Mock search results structure
   */
  getMockSearchResults(query, page = 0, size = 10) {
    const mockItems = [
      {
        id: 'mock-search-1',
        title: `Mock Result: WHO Guidelines on ${query}`,
        creator: 'World Health Organization',
        dateIssued: '2023',
        type: 'Guidelines',
        abstract: `This is a mock search result for "${query}". The WHO Digital Library API is currently not accessible, but this demonstrates the expected result structure.`,
        subject: [query, 'WHO Guidelines', 'Health Policy'],
        url: 'https://iris.who.int/help',
        rawMetadata: {}
      },
      {
        id: 'mock-search-2',
        title: `Mock Result: ${query.toUpperCase()} Prevention and Control`,
        creator: 'World Health Organization', 
        dateIssued: '2023',
        type: 'Technical Report',
        abstract: `Mock technical report related to ${query}. This result is displayed because the WHO IRIS API is currently not accessible.`,
        subject: [query, 'Prevention', 'Public Health'],
        url: 'https://iris.who.int/help',
        rawMetadata: {}
      }
    ];

    return {
      items: mockItems.slice(page * size, (page + 1) * size),
      totalElements: mockItems.length,
      totalPages: Math.ceil(mockItems.length / size),
      currentPage: page,
      size: size
    };
  }

  /**
   * Format citation for a reference item
   * @param {Object} item - Processed item metadata
   * @param {string} style - Citation style ('apa', 'chicago', 'vancouver')
   * @returns {string} Formatted citation
   */
  formatCitation(item, style = 'apa') {
    if (!item) return '';

    const title = item.title || 'Untitled';
    const author = item.creator || item.author || 'World Health Organization';
    const date = item.dateIssued || item.date || 'n.d.';
    const publisher = item.publisher || 'World Health Organization';
    const url = item.url;

    switch (style.toLowerCase()) {
      case 'apa':
        return `${author}. (${date}). ${title}. ${publisher}. ${url}`;
      
      case 'chicago':
        return `${author}. "${title}." ${publisher}, ${date}. ${url}.`;
      
      case 'vancouver':
        return `${author}. ${title}. ${publisher}; ${date}. Available from: ${url}`;
      
      default:
        return `${author}. ${title}. ${publisher}, ${date}. Available from: ${url}`;
    }
  }
}

// Create singleton instance
const whoDigitalLibraryService = new WHODigitalLibraryService();

export default whoDigitalLibraryService;