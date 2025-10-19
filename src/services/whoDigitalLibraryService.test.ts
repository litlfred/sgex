import whoDigitalLibraryService from '../services/whoDigitalLibraryService';

// Mock fetch globally
global.fetch = jest.fn();

describe('WHODigitalLibraryService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('search', () => {
    it('should construct correct search URL and process results', async () => {
      const mockResponse = {
        _embedded: {
          searchResult: {
            _embedded: {
              objects: [
                {
                  _embedded: {
                    indexableObject: {
                      uuid: '123-456-789',
                      handle: '10665/12345',
                      metadata: {
                        'dc.title': [{ value: 'Test Publication' }],
                        'dc.creator': [{ value: 'WHO Author' }],
                        'dc.date.issued': [{ value: '2023-01-01' }],
                        'dc.description.abstract': [{ value: 'Test abstract' }],
                        'dc.subject': [{ value: 'Health' }, { value: 'Guidelines' }]
                      }
                    }
                  }
                }
              ]
            },
            page: {
              totalElements: 1,
              totalPages: 1,
              number: 0,
              size: 10
            }
          }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await whoDigitalLibraryService.search('test query', 0, 10);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://iris.who.int/rest/discover/search/objects'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      );

      expect(result).toEqual({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: '123-456-789',
            title: 'Test Publication',
            creator: 'WHO Author',
            dateIssued: '2023-01-01',
            abstract: 'Test abstract',
            subject: ['Health', 'Guidelines'],
            publisher: 'World Health Organization',
            url: 'https://iris.who.int/handle/10665/12345'
          })
        ]),
        totalElements: 1,
        totalPages: 1,
        currentPage: 0,
        size: 10
      });
    });

    it('should handle search errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(whoDigitalLibraryService.search('test query'))
        .rejects
        .toThrow('Failed to search WHO digital library: Network error');
    });

    it('should handle empty search results', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await whoDigitalLibraryService.search('test query');

      expect(result).toEqual({
        items: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 0
      });
    });
  });

  describe('processDublinCoreMetadata', () => {
    it('should correctly process Dublin Core metadata', () => {
      const mockItem = {
        uuid: '123-456-789',
        handle: '10665/12345',
        metadata: {
          'dc.title': [{ value: 'Test Publication' }],
          'dc.creator': [{ value: 'WHO Author' }],
          'dc.date.issued': [{ value: '2023-01-01' }],
          'dc.description.abstract': [{ value: 'Test abstract' }],
          'dc.subject': [{ value: 'Health' }, { value: 'Guidelines' }],
          'dc.type': [{ value: 'Report' }],
          'dc.language': [{ value: 'en' }],
          'dc.identifier.doi': [{ value: '10.1234/test' }]
        }
      };

      const result = whoDigitalLibraryService.processDublinCoreMetadata(mockItem);

      expect(result).toMatchObject({
        id: '123-456-789',
        handle: '10665/12345',
        title: 'Test Publication',
        creator: 'WHO Author',
        dateIssued: '2023-01-01',
        abstract: 'Test abstract',
        subject: ['Health', 'Guidelines'],
        type: 'Report',
        language: 'en',
        doi: '10.1234/test',
        publisher: 'World Health Organization',
        url: 'https://iris.who.int/handle/10665/12345'
      });
    });

    it('should handle missing metadata gracefully', () => {
      const mockItem = {
        uuid: '123-456-789',
        metadata: {}
      };

      const result = whoDigitalLibraryService.processDublinCoreMetadata(mockItem);

      expect(result).toMatchObject({
        id: '123-456-789',
        title: 'Untitled',
        publisher: 'World Health Organization'
      });
    });
  });

  describe('formatCitation', () => {
    const mockItem = {
      title: 'Test Publication',
      creator: 'WHO Author',
      dateIssued: '2023',
      publisher: 'World Health Organization',
      url: 'https://iris.who.int/handle/10665/12345'
    };

    it('should format APA citation correctly', () => {
      const citation = whoDigitalLibraryService.formatCitation(mockItem, 'apa');
      expect(citation).toBe('WHO Author. (2023). Test Publication. World Health Organization. https://iris.who.int/handle/10665/12345');
    });

    it('should format Chicago citation correctly', () => {
      const citation = whoDigitalLibraryService.formatCitation(mockItem, 'chicago');
      expect(citation).toBe('WHO Author. "Test Publication." World Health Organization, 2023. https://iris.who.int/handle/10665/12345.');
    });

    it('should format Vancouver citation correctly', () => {
      const citation = whoDigitalLibraryService.formatCitation(mockItem, 'vancouver');
      expect(citation).toBe('WHO Author. Test Publication. World Health Organization; 2023. Available from: https://iris.who.int/handle/10665/12345');
    });

    it('should default to APA style for unknown styles', () => {
      const citation = whoDigitalLibraryService.formatCitation(mockItem, 'unknown');
      expect(citation).toBe('WHO Author. Test Publication. World Health Organization, 2023. Available from: https://iris.who.int/handle/10665/12345');
    });
  });

  describe('constructItemUrl', () => {
    it('should construct correct item URL', () => {
      const url = whoDigitalLibraryService.constructItemUrl('10665/12345');
      expect(url).toBe('https://iris.who.int/handle/10665/12345');
    });

    it('should return null for missing handle', () => {
      const url = whoDigitalLibraryService.constructItemUrl(null);
      expect(url).toBeNull();
    });
  });
});