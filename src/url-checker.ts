import fetch from 'node-fetch';
import { ContentMarkValidator } from './validator';

export interface CheckResult {
  found: boolean;
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

  constructor() {
    this.validator = new ContentMarkValidator();
  }

  async checkWebsite(url: string): Promise<CheckResult> {
    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const baseURL = new URL(url);
      
      // Method 1: Check .well-known location
      const wellKnownResult = await this.checkWellKnown(baseURL);
      if (wellKnownResult.found) {
        return wellKnownResult;
      }

      // Method 2: Check HTML <link> element
      const htmlLinkResult = await this.checkHTMLLink(baseURL);
      if (htmlLinkResult.found) {
        return htmlLinkResult;
      }

      // Method 3: Check HTTP headers
      const httpHeaderResult = await this.checkHTTPHeaders(baseURL);
      if (httpHeaderResult.found) {
        return httpHeaderResult;
      }

      return { found: false };

    } catch (error) {
      throw new Error(`Failed to check website: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async checkWellKnown(baseURL: URL): Promise<CheckResult> {
    const manifestUrl = new URL('/.well-known/contentmark.json', baseURL).toString();
    
    try {
      const response = await fetch(manifestUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'ContentMark-CLI/1.0.0',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const content = await response.text();
        const validation = await this.validator.validate(content);
        
        return {
          found: true,
          foundAt: manifestUrl,
          discoveryMethod: 'well-known',
          manifestUrl: manifestUrl,
          httpStatus: response.status,
          valid: validation.valid,
          errors: validation.errors,
          manifest: validation.manifest
        };
      }

      // If 404, continue to other methods
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
      // Network error, continue to other methods
      return { found: false };
    }
  }

  private async checkHTMLLink(baseURL: URL): Promise<CheckResult> {
    try {
      const response = await fetch(baseURL.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'ContentMark-CLI/1.0.0',
          'Accept': 'text/html'
        }
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
            const manifestResponse = await fetch(manifestUrl, {
              method: 'GET',
              headers: {
                'User-Agent': 'ContentMark-CLI/1.0.0',
                'Accept': 'application/json'
              }
            });

            if (manifestResponse.ok) {
              const content = await manifestResponse.text();
              const validation = await this.validator.validate(content);
              
              return {
                found: true,
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
      return { found: false };
    }
  }

  private async checkHTTPHeaders(baseURL: URL): Promise<CheckResult> {
    try {
      const response = await fetch(baseURL.toString(), {
        method: 'HEAD',
        headers: {
          'User-Agent': 'ContentMark-CLI/1.0.0'
        }
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
          const manifestResponse = await fetch(manifestUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'ContentMark-CLI/1.0.0',
              'Accept': 'application/json'
            }
          });

          if (manifestResponse.ok) {
            const content = await manifestResponse.text();
            const validation = await this.validator.validate(content);
            
            return {
              found: true,
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
      return { found: false };
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

  async batchCheck(urls: string[]): Promise<Map<string, CheckResult>> {
    const results = new Map<string, CheckResult>();
    
    // Process URLs in parallel with some concurrency limit
    const concurrency = 5;
    const chunks = this.chunkArray(urls, concurrency);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (url) => {
        try {
          const result = await this.checkWebsite(url);
          return [url, result] as [string, CheckResult];
        } catch (error) {
          return [url, { 
            found: false, 
            errors: [error instanceof Error ? error.message : String(error)] 
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
}
