/**
 * WHO Digital Library Service
 * 
 * Service for interacting with the WHO digital library (iris.who.int)
 * which uses DSpace software with Dublin Core metadata standards.
 */

class WHODigitalLibraryService {
  constructor() {
    this.baseUrl = 'https://iris.who.int';
    this.restApi = `${this.baseUrl}/rest`;
    this.searchEndpoint = `${this.restApi}/discover/search/objects`;
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
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.processSearchResults(data);
    } catch (error) {
      console.error('Error searching WHO digital library:', error);
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
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
    return `${this.baseUrl}/handle/${handle}`;
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
      return [];
    }
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