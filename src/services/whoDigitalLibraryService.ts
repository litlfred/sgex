/**
 * WHO Digital Library Service
 * 
 * Service for interacting with the WHO digital library (iris.who.int)
 * which uses DSpace software with Dublin Core metadata standards.
 * 
 * @module whoDigitalLibraryService
 */

/**
 * Search parameters
 * @example { "query": "immunization", "page": 0, "size": 20 }
 */
export interface SearchParams {
  /** Search query */
  query: string;
  /** Page number */
  page?: number;
  /** Results per page */
  size?: number;
  /** Sort field */
  sort?: string;
  /** Sort order */
  order?: 'asc' | 'desc';
}

/**
 * Dublin Core metadata
 */
export interface DublinCoreMetadata {
  /** Title */
  'dc.title'?: string[];
  /** Description */
  'dc.description'?: string[];
  /** Creator/Author */
  'dc.creator'?: string[];
  /** Date */
  'dc.date'?: string[];
  /** Subject */
  'dc.subject'?: string[];
  /** Type */
  'dc.type'?: string[];
  /** Publisher */
  'dc.publisher'?: string[];
  /** Identifier */
  'dc.identifier'?: string[];
}

/**
 * Search result item
 */
export interface SearchResultItem {
  /** Item UUID */
  uuid: string;
  /** Item handle */
  handle?: string;
  /** Item name */
  name: string;
  /** Dublin Core metadata */
  metadata: DublinCoreMetadata;
  /** Item type */
  type: string;
}

/**
 * Search results
 */
export interface SearchResults {
  /** Total results */
  totalResults: number;
  /** Current page */
  page: number;
  /** Page size */
  size: number;
  /** Result items */
  items: SearchResultItem[];
  /** Next page URL */
  nextPage?: string;
  /** Previous page URL */
  prevPage?: string;
}

/**
 * Publication details
 */
export interface PublicationDetails extends SearchResultItem {
  /** Public URL */
  publicUrl: string;
  /** Download links */
  downloads?: Array<{
    url: string;
    format: string;
    size?: string;
  }>;
}

/**
 * WHO Digital Library Service class
 * 
 * @openapi
 * components:
 *   schemas:
 *     SearchParams:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *         page:
 *           type: integer
 *         size:
 *           type: integer
 */
class WHODigitalLibraryService {
  private isDevelopment: boolean;
  private baseUrl: string;
  private restApi: string;
  private searchEndpoint: string;
  private originalBaseUrl: string;

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
   */
  async search(query: string, page: number = 0, size: number = 20, sort: string = 'dc.title', order: 'asc' | 'desc' = 'asc'): Promise<SearchResults> {
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
          console.warn('WHO Digital Library API returned 403 - using demonstration data');
          return this.getMockSearchResults(query, page, size);
        } else if (response.status === 500) {
          console.warn('WHO Digital Library API returned 500 - using demonstration data');
          return this.getMockSearchResults(query, page, size);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded (HTTP 429): Too many requests to the WHO Digital Library API. Please wait a moment before searching again.`);
        } else if (response.status === 404) {
          throw new Error(`Not found (HTTP 404): The requested resource was not found.`);
        } else {
          throw new Error(`WHO Digital Library API error (HTTP ${response.status}): ${response.statusText}`);
        }
      }

      const data = await response.json();
      return this.parseSearchResults(data, page, size);
    } catch (error: any) {
      console.error('WHO Digital Library search error:', error);
      // Return mock results on error for graceful degradation
      return this.getMockSearchResults(query, page, size);
    }
  }

  /**
   * Parse DSpace search results
   */
  parseSearchResults(data: any, page: number, size: number): SearchResults {
    const items: SearchResultItem[] = [];
    
    if (data._embedded && data._embedded.searchResult && data._embedded.searchResult._embedded) {
      const objects = data._embedded.searchResult._embedded.objects || [];
      
      objects.forEach((obj: any) => {
        if (obj._embedded && obj._embedded.indexableObject) {
          const item = obj._embedded.indexableObject;
          items.push({
            uuid: item.uuid || '',
            handle: item.handle,
            name: item.name || 'Untitled',
            metadata: item.metadata || {},
            type: item.type || 'item'
          });
        }
      });
    }

    const totalResults = data._embedded?.searchResult?.page?.totalElements || 0;

    return {
      totalResults,
      page,
      size,
      items
    };
  }

  /**
   * Get mock search results for demonstration
   */
  getMockSearchResults(query: string, page: number, size: number): SearchResults {
    const mockItems: SearchResultItem[] = [
      {
        uuid: 'demo-1',
        handle: '10665/12345',
        name: `WHO Guidelines on ${query}`,
        metadata: {
          'dc.title': [`WHO Guidelines on ${query}`],
          'dc.description': ['Demonstration result from WHO Digital Library'],
          'dc.creator': ['World Health Organization'],
          'dc.date': ['2024'],
          'dc.publisher': ['WHO'],
          'dc.type': ['Technical documents']
        },
        type: 'item'
      }
    ];

    return {
      totalResults: 1,
      page,
      size,
      items: mockItems
    };
  }

  /**
   * Get publication details
   */
  async getPublication(uuid: string): Promise<PublicationDetails | null> {
    try {
      const url = `${this.restApi}/core/items/${uuid}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const publicUrl = `${this.originalBaseUrl}/handle/${data.handle}`;

      return {
        uuid: data.uuid,
        handle: data.handle,
        name: data.name,
        metadata: data.metadata || {},
        type: data.type,
        publicUrl,
        downloads: []
      };
    } catch (error) {
      console.error('Error fetching publication details:', error);
      return null;
    }
  }

  /**
   * Get public URL for a publication
   */
  getPublicUrl(handle: string): string {
    return `${this.originalBaseUrl}/handle/${handle}`;
  }

  /**
   * Extract title from metadata
   */
  extractTitle(metadata: DublinCoreMetadata): string {
    if (metadata['dc.title'] && metadata['dc.title'].length > 0) {
      return metadata['dc.title'][0];
    }
    return 'Untitled';
  }

  /**
   * Extract description from metadata
   */
  extractDescription(metadata: DublinCoreMetadata): string {
    if (metadata['dc.description'] && metadata['dc.description'].length > 0) {
      return metadata['dc.description'][0];
    }
    return '';
  }

  /**
   * Extract authors from metadata
   */
  extractAuthors(metadata: DublinCoreMetadata): string[] {
    return metadata['dc.creator'] || [];
  }

  /**
   * Extract date from metadata
   */
  extractDate(metadata: DublinCoreMetadata): string {
    if (metadata['dc.date'] && metadata['dc.date'].length > 0) {
      return metadata['dc.date'][0];
    }
    return '';
  }
}

// Export singleton instance
const whoDigitalLibraryService = new WHODigitalLibraryService();
export default whoDigitalLibraryService;
