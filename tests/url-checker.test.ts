import { URLChecker } from '../src/url-checker';
import { MockHTTPServer, createMockFetch, createHTMLWithContentMark, createHTMLWithoutContentMark, TEST_MANIFESTS } from './setup';

describe('URLChecker', () => {
  let checker: URLChecker;
  let mockServer: MockHTTPServer;
  let mockFetch: any;

  beforeEach(() => {
    mockServer = new MockHTTPServer();
    mockFetch = createMockFetch(mockServer);
    checker = new URLChecker(mockFetch);
  });

  afterEach(() => {
    mockServer.clear();
    if (jest.isMockFunction((global as any).fetch)) {
      ((global as any).fetch as jest.Mock).mockRestore();
    }
  });

  describe('checkWebsite', () => {
    it('should find ContentMark via well-known location', async () => {
      mockServer.setContentMarkResponse(TEST_MANIFESTS.VALID_BASIC);

      const result = await checker.checkWebsite('https://example.com');

      expect(result.found).toBe(true);
      expect(result.method).toBe('well-known');
      expect(result.manifestUrl).toBe('https://example.com/.well-known/contentmark.json');
      expect(result.manifest).toEqual(TEST_MANIFESTS.VALID_BASIC);
    });

    it('should find ContentMark via HTML link element', async () => {
      mockServer.setResponse('/.well-known/contentmark.json', 404, 'Not Found');
      mockServer.setHTMLResponse(createHTMLWithContentMark('/manifest.json'));
      mockServer.setResponse('/manifest.json', 200, JSON.stringify(TEST_MANIFESTS.VALID_BASIC), {
        'Content-Type': 'application/json'
      });

      const result = await checker.checkWebsite('https://example.com');

      expect(result.found).toBe(true);
      expect(result.method).toBe('html-link');
      expect(result.manifestUrl).toBe('https://example.com/manifest.json');
    });

    it('should find ContentMark via HTTP headers', async () => {
      mockServer.setResponse('/.well-known/contentmark.json', 404, 'Not Found');
      mockServer.setResponse('/', 200, createHTMLWithoutContentMark(), {
        'link': '</contentmark.json>; rel=contentmark'
      });
      mockServer.setResponse('/contentmark.json', 200, JSON.stringify(TEST_MANIFESTS.VALID_BASIC));

      const result = await checker.checkWebsite('https://example.com');

      expect(result.found).toBe(true);
      expect(result.method).toBe('http-header');
    });

    it('should return not found when no ContentMark support exists', async () => {
      mockServer.setResponse('/.well-known/contentmark.json', 404, 'Not Found');
      mockServer.setHTMLResponse(createHTMLWithoutContentMark());

      const result = await checker.checkWebsite('https://example.com');

      expect(result.found).toBe(false);
      expect(result.method).toBeUndefined();
      expect(result.manifestUrl).toBeUndefined();
    });

    it('should handle network errors gracefully', async () => {
      const errorChecker = new URLChecker(jest.fn(() => Promise.reject(new Error('Network error'))));

      const result = await errorChecker.checkWebsite('https://example.com');
      expect(result.found).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining(['Network error']));
    });

    it('should handle invalid URLs', async () => {
      const errorChecker = new URLChecker(jest.fn(() => Promise.reject(new Error('Invalid URL format'))));

      const result = await errorChecker.checkWebsite('https://example.com');
      expect(result.found).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining(['Invalid URL format']));
    });
  });

  describe('checkMultipleWebsites', () => {
    it('should process multiple URLs concurrently', async () => {
      const urls = ['https://site1.com', 'https://site2.com'];
      mockServer.setContentMarkResponse(TEST_MANIFESTS.VALID_BASIC);

      const results = await checker.checkMultipleWebsites(urls);

      expect(results).toHaveLength(2);
      expect(results[0][0]).toBe('https://site1.com');
      expect(results[1][0]).toBe('https://site2.com');
      expect(results[0][1].found).toBe(true);
      expect(results[1][1].found).toBe(true);
    });

    it('should handle mixed success and failure results', async () => {
      const urls = ['https://working.com', 'https://broken.com'];

      const mixedFetch = jest.fn((url: string) => {
        if (url.includes('working.com')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(JSON.stringify(TEST_MANIFESTS.VALID_BASIC)),
            json: () => Promise.resolve(TEST_MANIFESTS.VALID_BASIC),
            headers: { get: () => null }
          });
        } else {
          return Promise.reject(new Error('Network error'));
        }
      });

      const mixedChecker = new URLChecker(mixedFetch);
      const results = await mixedChecker.checkMultipleWebsites(urls);

      expect(results).toHaveLength(2);
      expect(results[0][1].found).toBe(true);
      expect(results[1][1].found).toBe(false);
      expect(results[1][1].errors).toEqual(expect.arrayContaining(['Network error']));
    });

    it('should handle empty URL list', async () => {
      const results = await checker.checkMultipleWebsites([]);
      expect(results).toHaveLength(0);
    });
  });
});
