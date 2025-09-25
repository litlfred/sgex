/**
 * WHO Digital Library Service
 * 
 * Integrates with WHO services including IRIS, OCL, and PCMT.
 * Extracted from whoDigitalLibraryService.js to provide clean API integration.
 */

export interface WHOPublication {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: string;
  published_date?: string;
}

export interface OCLConcept {
  id: string;
  concept_class: string;
  display_name: string;
  url: string;
}

export class WHOIntegrationService {
  private readonly irisBaseUrl = 'https://iris.who.int';
  private readonly oclBaseUrl = 'https://openconceptlab.org';
  private readonly pcmtBaseUrl = 'https://productcatalog.io';

  /**
   * Search WHO IRIS publications
   */
  async searchIRISPublications(query: string, limit: number = 10): Promise<WHOPublication[]> {
    try {
      const url = `${this.irisBaseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`IRIS API error: ${response.status}`);
      }

      const data = await response.json();
      return this.mapIRISResponse(data);
    } catch (error) {
      console.error('Failed to search IRIS publications:', error);
      return [];
    }
  }

  /**
   * Get OCL concepts
   */
  async getOCLConcepts(source: string, version?: string): Promise<OCLConcept[]> {
    try {
      const versionPath = version ? `/${version}` : '';
      const url = `${this.oclBaseUrl}/api/v2/sources/${source}${versionPath}/concepts/`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OCL API error: ${response.status}`);
      }

      const data = await response.json();
      return this.mapOCLResponse(data);
    } catch (error) {
      console.error('Failed to get OCL concepts:', error);
      return [];
    }
  }

  /**
   * Search PCMT products
   */
  async searchPCMTProducts(query: string): Promise<any[]> {
    try {
      const url = `${this.pcmtBaseUrl}/api/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`PCMT API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to search PCMT products:', error);
      return [];
    }
  }

  /**
   * Map IRIS API response to standard format
   */
  private mapIRISResponse(data: any): WHOPublication[] {
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: item.id || item.uri,
      title: item.title || 'Untitled',
      description: item.description,
      url: item.url || item.uri,
      type: item.type || 'publication',
      published_date: item.published_date
    }));
  }

  /**
   * Map OCL API response to standard format
   */
  private mapOCLResponse(data: any): OCLConcept[] {
    if (!Array.isArray(data)) return [];

    return data.map((concept: any) => ({
      id: concept.id || concept.concept_id,
      concept_class: concept.concept_class,
      display_name: concept.display_name || concept.name,
      url: concept.url
    }));
  }
}

export const whoIntegrationService = new WHOIntegrationService();