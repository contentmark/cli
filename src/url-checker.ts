import { ContentMarkValidator } from './validator';

export interface CheckResult {
  found: boolean;
  method?: string;
  foundAt?: string;
  discoveryMethod?: 'well-known' | 'html-link' | 'http-header';
  manifestUrl?: string;
  httpStatus?: number;
  valid?: boolean;
  errors?: string[];
  manifest?: any;
}

export class URLChecker {
  private validator: ContentMarkValidator;
  private fetch: any;
  private options: { timeout?: number };

  constructor(fetchImpl?: any, options: { timeout?: number } = {}) {
    this.validator = new ContentMarkValidator();
    this.fetch = fetchImpl || (global as any).fetch || require('node-fetch');
    this.options = options;
  }

  async checkWebsite(url: string): Promise<CheckResult> {
    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const baseURL = new URL(url);
      const allErrors: string[] = [];

      // Method 1: Check .well-known location
      const wellKnownResult = await this.checkWellKnown(baseURL);
      if (wellKnownResult.found) {
        return wellKnownResult;
      }
      if (wellKnownResult.errors) {
        allErrors.push(...wellKnownResult.errors);
      }

      // Method 2: Check HTML <link> element
      const htmlLinkResult = await this.checkHTMLLink(baseURL);
      if (htmlLinkResult.found) {
        return htmlLinkResult;
      }
      if (htmlLinkResult.errors) {
        allErrors.push(...htmlLinkResult.errors);
      }

      // Method 3: Check HTTP headers
      const httpHeaderResult = await this.checkHTTPHeaders(baseURL);
      if (httpHeaderResult.found) {
        return httpHeaderResult;
      }
      if (httpHeaderResult.errors) {
        allErrors.push(...httpHeaderResult.errors);
      }

      return { found: false, errors: allErrors };

    } catch (error: any) {
      return {
        found: false,
        errors: [error.message]
      };
    }
  }

  private async checkWellKnown(baseURL: URL): Promise<CheckResult> {
    const manifestUrl = new URL('/.well-known/contentmark.json', baseURL).toString();

    try {
      const response = await this.fetch(manifestUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'ContentMark-CLI/1.0.0',
          'Accept': 'application/json'
        },
        timeout: this.options.timeout || 10000
      });

      if (response.ok) {
        const content = await response.text();
        const validation = await this.validator.validate(content);

        return {
          found: true,
          method: 'well-known',
          foundAt: manifestUrl,
          discoveryMethod: 'well-known',
          manifestUrl: manifestUrl,
          httpStatus: response.status,
          valid: validation.valid,
          errors: validation.errors,
          manifest: validation.manifest
        };
      }

      // If 404, continue to other methods silently
      if (response.status === 404) {
        return { found: false };
      }

      // Other HTTP errors
      return {
        found: true,
        foundAt: manifestUrl,
        discoveryMethod: 'well-known',
        manifestUrl: manifestUrl,
        httpStatus: response.status,
        valid: false,
        errors: [`HTTP ${response.status}: ${response.statusText}`]
      };

    } catch (error) {
      // Network error - return error for propagation
      return { found: false, errors: [(error as Error).message] };
    }
  }

  private async checkHTMLLink(baseURL: URL): Promise<CheckResult> {
    try {
      const response = await this.fetch(baseURL.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'ContentMark-CLI/1.0.0',
          'Accept': 'text/html'
        },
        timeout: this.options.timeout || 10000
      });

      if (!response.ok) {
        return { found: false };
      }

      const html = await response.text();

      // Look for <link rel="contentmark" ...> elements
      const linkRegex = /<link[^>]*rel=["']contentmark["'][^>]*>/gi;
      const hrefRegex = /href=["']([^"']+)["']/i;

      const linkMatches = html.match(linkRegex);
      if (!linkMatches) {
        return { found: false };
      }

      for (const linkMatch of linkMatches) {
        const hrefMatch = linkMatch.match(hrefRegex);
        if (hrefMatch) {
          let manifestUrl = hrefMatch[1];

          // Make relative URLs absolute
          if (!manifestUrl.startsWith('http')) {
            manifestUrl = new URL(manifestUrl, baseURL).toString();
          }

          // Try to fetch the manifest
          try {
            const manifestResponse = await this.fetch(manifestUrl, {
              method: 'GET',
              headers: {
                'User-Agent': 'ContentMark-CLI/1.0.0',
                'Accept': 'application/json'
              },
              timeout: this.options.timeout || 10000
            });

            if (manifestResponse.ok) {
              const content = await manifestResponse.text();
              const validation = await this.validator.validate(content);

              return {
                found: true,
                method: 'html-link',
                foundAt: baseURL.toString(),
                discoveryMethod: 'html-link',
                manifestUrl: manifestUrl,
                httpStatus: manifestResponse.status,
                valid: validation.valid,
                errors: validation.errors,
                manifest: validation.manifest
              };
            }
          } catch {
            // Continue to next link if this one fails
            continue;
          }
        }
      }

      return { found: false };

    } catch (error) {
      return { found: false, errors: [(error as Error).message] };
    }
  }

  private async checkHTTPHeaders(baseURL: URL): Promise<CheckResult> {
    try {
      const response = await this.fetch(baseURL.toString(), {
        method: 'HEAD',
        headers: {
          'User-Agent': 'ContentMark-CLI/1.0.0'
        },
        timeout: this.options.timeout || 10000
      });

      if (!response.ok) {
        return { found: false };
      }

      // Look for Link headers with rel=contentmark
      const linkHeaders = response.headers.get('link');
      if (!linkHeaders) {
        return { found: false };
      }

      // Parse Link headers (simplified)
      const linkRegex = /<([^>]+)>;\s*rel=["']?contentmark["']?/i;
      const match = linkHeaders.match(linkRegex);

      if (match) {
        let manifestUrl = match[1];

        // Make relative URLs absolute
        if (!manifestUrl.startsWith('http')) {
          manifestUrl = new URL(manifestUrl, baseURL).toString();
        }

        // Try to fetch the manifest
        try {
          const manifestResponse = await this.fetch(manifestUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'ContentMark-CLI/1.0.0',
              'Accept': 'application/json'
            },
            timeout: this.options.timeout || 10000
          });

          if (manifestResponse.ok) {
            const content = await manifestResponse.text();
            const validation = await this.validator.validate(content);

            return {
              found: true,
              method: 'http-header',
              foundAt: baseURL.toString(),
              discoveryMethod: 'http-header',
              manifestUrl: manifestUrl,
              httpStatus: manifestResponse.status,
              valid: validation.valid,
              errors: validation.errors,
              manifest: validation.manifest
            };
          }
        } catch {
          return { found: false };
        }
      }

      return { found: false };

    } catch (error) {
      return { found: false, errors: [(error as Error).message] };
    }
  }

  async analyzeManifest(url: string): Promise<{
    basicInfo: any;
    policies: any;
    monetization: any;
    optimization: any;
  }> {
    const result = await this.checkWebsite(url);

    if (!result.found || !result.manifest) {
      throw new Error('No ContentMark manifest found');
    }

    const manifest = result.manifest;

    return {
      basicInfo: {
        siteName: manifest.siteName,
        description: manifest.description,
        version: manifest.version,
        lastModified: manifest.lastModified
      },
      policies: {
        canSummarize: manifest.defaultUsagePolicy.canSummarize,
        canTrain: manifest.defaultUsagePolicy.canTrain,
        canQuote: manifest.defaultUsagePolicy.canQuote,
        mustAttribute: manifest.defaultUsagePolicy.mustAttribute,
        attributionTemplate: manifest.defaultUsagePolicy.attributionTemplate
      },
      monetization: {
        hasMonetization: !!manifest.monetization,
        tipJar: manifest.monetization?.tipJar,
        consultation: manifest.monetization?.consultation,
        services: manifest.monetization?.services,
        subscription: manifest.monetization?.subscription
      },
      optimization: {
        hasVisibility: !!manifest.visibility,
        aiDiscovery: manifest.visibility?.aiDiscovery,
        priorityContent: manifest.visibility?.priorityContent,
        boostScore: manifest.visibility?.boostScore,
        expertiseAreas: manifest.visibility?.expertiseAreas,
        preferredQueries: manifest.visibility?.preferredQueries
      }
    };
  }

  async batchCheck(urls: string[], options: {
    concurrency?: number,
    onProgress?: (completed: number, total: number) => void
  } = {}): Promise<Map<string, CheckResult>> {
    const results = new Map<string, CheckResult>();
    const concurrency = options.concurrency || 5;
    const chunks = this.chunkArray(urls, concurrency);
    let completed = 0;

    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        try {
          const result = await this.checkWebsite(url);
          completed++;
          if (options.onProgress) {
            options.onProgress(completed, urls.length);
          }
          return [url, result] as [string, CheckResult];
        } catch (error) {
          completed++;
          if (options.onProgress) {
            options.onProgress(completed, urls.length);
          }
          return [url, {
            found: false,
            errors: [(error as any).message]
          }] as [string, CheckResult];
        }
      });

      const chunkResults = await Promise.all(promises);
      chunkResults.forEach(([url, result]) => {
        results.set(url, result);
      });

      // Small delay between chunks to be respectful
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async checkMultipleWebsites(urls: string[]): Promise<[string, CheckResult][]> {
    const results: [string, CheckResult][] = [];

    for (const url of urls) {
      try {
        const result = await this.checkWebsite(url);
        results.push([url, result]);
      } catch (error) {
        results.push([url, {
          found: false,
          errors: [(error as Error).message]
        }]);
      }
    }

    return results;
  }
}
