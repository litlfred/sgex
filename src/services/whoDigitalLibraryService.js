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
          // WHO Digital Library API access is restricted - provide fallback with clear explanation
          console.warn('WHO Digital Library API returned 403 - using demonstration data');
          return this.getMockSearchResults(query, page, size);
        } else if (response.status === 500) {
          // WHO Digital Library API server error - provide fallback with clear explanation
          console.warn('WHO Digital Library API returned 500 - using demonstration data');
          return this.getMockSearchResults(query, page, size);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded (HTTP 429): Too many requests to the WHO Digital Library API. Please wait a moment before searching again.`);
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
          // In development, provide mock data with explanation
          console.warn('Network error accessing WHO API, providing demonstration data');
          return this.getMockSearchResults(query, page, size);
        } else {
          throw new Error('Unable to access WHO Digital Library. This may be due to network restrictions or the service being temporarily unavailable.');
        }
      }
      
      // If we caught a 403 or 500 error and returned mock data, don't throw here
      if (error.message.includes('Access denied (HTTP 403)') || 
          error.message.includes('Server error (HTTP 500)') ||
          error.message.includes('demonstration data')) {
        return this.getMockSearchResults(query, page, size);
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
      
      // Return sample/mock data for API errors that prevent access
      if (error.message.includes('CORS policy') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Server error (HTTP 500)') ||
          error.message.includes('Access denied (HTTP 403)')) {
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
        id: 'featured-demo-1',
        title: 'World Health Report 2023: Building Health Systems for Equity',
        creator: 'World Health Organization',
        dateIssued: '2023',
        type: 'Annual Report',
        abstract: 'The World Health Report 2023 examines health equity and sustainable development, with a focus on strengthening health systems to achieve universal health coverage.',
        subject: ['Health Systems', 'Equity', 'Universal Health Coverage'],
        url: 'https://iris.who.int/browse',
        rawMetadata: {}
      },
      {
        id: 'featured-demo-2', 
        title: 'Global Health Observatory: Health SDG Monitor 2023',
        creator: 'World Health Organization',
        dateIssued: '2023',
        type: 'Statistical Report',
        abstract: 'Comprehensive monitoring of health-related Sustainable Development Goals (SDGs) with global, regional, and country-level data and analysis.',
        subject: ['SDGs', 'Global Health', 'Statistics', 'Monitoring'],
        url: 'https://iris.who.int/browse',
        rawMetadata: {}
      },
      {
        id: 'featured-demo-3',
        title: 'WHO Guidelines for Indoor Air Quality: Selected Pollutants',
        creator: 'World Health Organization',
        dateIssued: '2023',
        type: 'Health Guidelines',
        abstract: 'Evidence-based guidelines for indoor air quality standards, covering key pollutants and their health impacts, with recommendations for policy makers.',
        subject: ['Air Quality', 'Environmental Health', 'Guidelines'],
        url: 'https://iris.who.int/browse',
        rawMetadata: {}
      },
      {
        id: 'featured-demo-4',
        title: 'Mental Health Atlas 2023',
        creator: 'World Health Organization',
        dateIssued: '2023',
        type: 'Atlas',
        abstract: 'Global overview of mental health resources, services, and policies across WHO Member States, highlighting progress and gaps in mental health systems.',
        subject: ['Mental Health', 'Health Systems', 'Global Atlas'],
        url: 'https://iris.who.int/browse',
        rawMetadata: {}
      },
      {
        id: 'featured-demo-5',
        title: 'Immunization Agenda 2030: A Global Strategy',
        creator: 'World Health Organization',
        dateIssued: '2023',
        type: 'Strategy Document',
        abstract: 'Comprehensive strategy for achieving immunization goals by 2030, including approaches for reaching zero-dose children and strengthening immunization systems.',
        subject: ['Immunization', 'Vaccination', 'Global Strategy'],
        url: 'https://iris.who.int/browse',
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
    // Generate more realistic mock results based on the search query
    const baseResults = this.generateRelevantMockResults(query);
    
    return {
      items: baseResults.slice(page * size, (page + 1) * size),
      totalElements: baseResults.length,
      totalPages: Math.ceil(baseResults.length / size),
      currentPage: page,
      size: size,
      isDemo: true // Flag to indicate this is demonstration data
    };
  }

  /**
   * Generate relevant mock results based on search query
   * @param {string} query - Search query
   * @returns {Array} Array of mock items
   */
  generateRelevantMockResults(query) {
    const lowerQuery = query.toLowerCase();
    
    // Health-related mock results database
    const healthTopics = {
      'hiv': [
        {
          id: 'demo-hiv-1',
          title: 'Consolidated Guidelines on HIV Prevention, Testing and Treatment, Service Delivery and Monitoring',
          creator: 'World Health Organization',
          dateIssued: '2023',
          type: 'Guidelines',
          abstract: 'These consolidated guidelines provide updated recommendations on HIV prevention, testing, treatment, service delivery and monitoring for a public health approach.',
          subject: ['HIV', 'Prevention', 'Treatment', 'Guidelines'],
          url: 'https://iris.who.int/bitstream/handle/10665/375121/9789240073097-eng.pdf',
          rawMetadata: {}
        },
        {
          id: 'demo-hiv-2', 
          title: 'HIV Strategic Information for Impact: Cascade Data Use Manual',
          creator: 'World Health Organization',
          dateIssued: '2022',
          type: 'Technical Manual',
          abstract: 'This manual provides guidance on using HIV cascade data to inform program planning, implementation, and monitoring.',
          subject: ['HIV', 'Data Analysis', 'Program Management'],
          url: 'https://iris.who.int/handle/10665/354462',
          rawMetadata: {}
        }
      ],
      'covid': [
        {
          id: 'demo-covid-1',
          title: 'COVID-19 Clinical Management: Living Guidance',
          creator: 'World Health Organization',
          dateIssued: '2023',
          type: 'Clinical Guidelines',
          abstract: 'This living guidance provides evidence-based recommendations for the clinical management of COVID-19 in adults, children and adolescents.',
          subject: ['COVID-19', 'Clinical Management', 'Treatment'],
          url: 'https://iris.who.int/handle/10665/368745',
          rawMetadata: {}
        },
        {
          id: 'demo-covid-2',
          title: 'WHO Coronavirus (COVID-19) Dashboard',
          creator: 'World Health Organization',
          dateIssued: '2023',
          type: 'Data Resource',
          abstract: 'Real-time data and insights on the COVID-19 pandemic, including case numbers, vaccination rates, and epidemiological trends.',
          subject: ['COVID-19', 'Epidemiology', 'Surveillance'],
          url: 'https://iris.who.int/handle/10665/361234',
          rawMetadata: {}
        }
      ],
      'malaria': [
        {
          id: 'demo-malaria-1',
          title: 'World Malaria Report 2023',
          creator: 'World Health Organization',
          dateIssued: '2023',
          type: 'Annual Report',
          abstract: 'The World Malaria Report 2023 provides a comprehensive update on global progress towards malaria elimination goals.',
          subject: ['Malaria', 'Global Health', 'Elimination'],
          url: 'https://iris.who.int/handle/10665/374472',
          rawMetadata: {}
        }
      ],
      'tuberculosis': [
        {
          id: 'demo-tb-1',
          title: 'WHO Consolidated Guidelines on Tuberculosis: Module 4: Treatment',
          creator: 'World Health Organization',
          dateIssued: '2022',
          type: 'Treatment Guidelines',
          abstract: 'Updated recommendations for the treatment of drug-susceptible and drug-resistant tuberculosis in adults and children.',
          subject: ['Tuberculosis', 'Treatment', 'Drug Resistance'],
          url: 'https://iris.who.int/handle/10665/352984',
          rawMetadata: {}
        }
      ],
      'mental': [
        {
          id: 'demo-mental-1',
          title: 'Mental Health and Climate Change: Policy Brief',
          creator: 'World Health Organization',
          dateIssued: '2023',
          type: 'Policy Brief',
          abstract: 'This policy brief outlines the mental health impacts of climate change and provides recommendations for health systems.',
          subject: ['Mental Health', 'Climate Change', 'Health Policy'],
          url: 'https://iris.who.int/handle/10665/366756',
          rawMetadata: {}
        }
      ],
      'nutrition': [
        {
          id: 'demo-nutrition-1',
          title: 'Guideline: Sugars Intake for Adults and Children',
          creator: 'World Health Organization',
          dateIssued: '2023',
          type: 'Nutrition Guideline',
          abstract: 'WHO recommendations on free sugars intake for adults and children to reduce risk of noncommunicable diseases.',
          subject: ['Nutrition', 'Sugar', 'NCDs', 'Prevention'],
          url: 'https://iris.who.int/handle/10665/149782',
          rawMetadata: {}
        }
      ]
    };

    // Find relevant results based on query
    let results = [];
    
    // Check for specific health topics
    for (const [topic, items] of Object.entries(healthTopics)) {
      if (lowerQuery.includes(topic) || lowerQuery.includes(topic.slice(0, -1))) {
        results.push(...items);
      }
    }
    
    // If no specific matches, provide general WHO publications
    if (results.length === 0) {
      results = [
        {
          id: 'demo-general-1',
          title: `Global Health Observatory Data on ${query}`,
          creator: 'World Health Organization',
          dateIssued: '2023',
          type: 'Data Repository',
          abstract: `Global health statistics and data related to ${query}. This demonstration result shows how WHO publications would appear in search results.`,
          subject: [query, 'Global Health', 'Statistics'],
          url: 'https://iris.who.int/browse',
          rawMetadata: {}
        },
        {
          id: 'demo-general-2',
          title: `WHO Technical Report: ${query} Analysis`,
          creator: 'World Health Organization',
          dateIssued: '2022',
          type: 'Technical Report',
          abstract: `Technical analysis and recommendations related to ${query}. This is demonstration content showing the WHO Digital Library integration.`,
          subject: [query, 'Technical Analysis', 'WHO Publications'],
          url: 'https://iris.who.int/browse',
          rawMetadata: {}
        },
        {
          id: 'demo-general-3',
          title: `Policy Brief: ${query} and Global Health`,
          creator: 'World Health Organization',
          dateIssued: '2023',
          type: 'Policy Brief',
          abstract: `Policy recommendations and guidance on ${query} for health systems and policymakers.`,
          subject: [query, 'Policy', 'Health Systems'],
          url: 'https://iris.who.int/browse',
          rawMetadata: {}
        }
      ];
    }
    
    return results;
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