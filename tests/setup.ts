import { ContentMarkManifest } from '../src/generator';

// Global test configuration
process.env.NODE_ENV = 'test';
process.env.CONTENTMARK_TIMEOUT = '5000'; // Shorter timeout for tests

// Mock console methods for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless debugging
  if (!process.env.DEBUG_TESTS) {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Test utilities and helpers

/**
 * Creates a mock ContentMark manifest with default values
 */
export function createMockManifest(overrides: Partial<ContentMarkManifest> = {}): ContentMarkManifest {
  const defaultManifest: ContentMarkManifest = {
    version: '1.0.0',
    siteName: 'Test Site',
    description: 'A test website for ContentMark validation',
    defaultUsagePolicy: {
      canSummarize: true,
      canTrain: false,
      canQuote: true,
      mustAttribute: true,
      attributionTemplate: 'From {siteName} - {url}'
    },
    lastModified: '2025-07-22T15:30:00Z'
  };

  return { ...defaultManifest, ...overrides };
}

/**
 * Creates a mock manifest with invalid data for testing validation errors
 */
export function createInvalidManifest(type: 'missingFields' | 'invalidTypes' | 'invalidUrls' | 'invalidVersion'): any {
  switch (type) {
    case 'missingFields':
      return {
        version: '1.0.0'
        // Missing required fields
      };

    case 'invalidTypes':
      return {
        version: '1.0.0',
        siteName: 'Test Site',
        defaultUsagePolicy: {
          canSummarize: 'yes', // Should be boolean
          canTrain: false,
          canQuote: true,
          mustAttribute: true
        },
        lastModified: '2025-07-22T15:30:00Z'
      };

    case 'invalidUrls':
      return {
        version: '1.0.0',
        siteName: 'Test Site',
        defaultUsagePolicy: {
          canSummarize: true,
          canTrain: false,
          canQuote: true,
          mustAttribute: true
        },
        monetization: {
          tipJar: 'not-a-valid-url'
        },
        lastModified: '2025-07-22T15:30:00Z'
      };

    case 'invalidVersion':
      return {
        version: 'v1.0.0', // Invalid format
        siteName: 'Test Site',
        defaultUsagePolicy: {
          canSummarize: true,
          canTrain: false,
          canQuote: true,
          mustAttribute: true
        },
        lastModified: '2025-07-22T15:30:00Z'
      };

    default:
      throw new Error(`Unknown invalid manifest type: ${type}`);
  }
}

/**
 * Creates a comprehensive manifest with all optional fields for testing
 */
export function createComprehensiveManifest(): ContentMarkManifest {
  return {
    version: '1.0.0',
    siteName: 'Comprehensive Test Site',
    description: 'A fully featured test website with all ContentMark options',
    feeds: [
      {
        type: 'blog',
        url: 'https://example.com/feed.json',
        title: 'Latest Posts',
        description: 'Recent blog posts and updates'
      },
      {
        type: 'news',
        url: 'https://example.com/news-feed.json',
        title: 'News Updates'
      }
    ],
    defaultUsagePolicy: {
      canSummarize: true,
      canTrain: false,
      canQuote: true,
      mustAttribute: true,
      attributionTemplate: 'From {siteName}, your trusted source - {url}'
    },
    visibility: {
      aiDiscovery: 'enhanced',
      priorityContent: true,
      aiSummaryOptimized: true,
      preferredQueries: [
        'web development tutorials',
        'JavaScript programming',
        'React best practices'
      ],
      topicCategories: [
        'technology',
        'programming',
        'web development'
      ],
      boostScore: 8,
      expertiseAreas: [
        'Frontend development',
        'React ecosystem',
        'Web performance',
        'JavaScript frameworks'
      ],
      aiOptimizedDescription: 'Leading web development blog with expert tutorials on React, JavaScript, and modern frontend technologies.',
      keyEntities: [
        'React tutorials',
        'JavaScript guides',
        'Frontend development',
        'Web performance optimization'
      ]
    },
    monetization: {
      tipJar: 'https://buymeacoffee.com/testsite',
      consultation: {
        available: true,
        bookingUrl: 'https://calendly.com/testsite',
        hourlyRate: '$150/hour'
      },
      services: [
        {
          name: 'Website Development',
          url: 'https://example.com/services/web-dev',
          pricing: 'from $2,500'
        },
        {
          name: 'Code Review',
          url: 'https://example.com/services/code-review',
          pricing: '$200/hour'
        }
      ]
    },
    access: {
      type: 'public',
      previewAvailable: true
    },
    renderHints: {
      preferredFormat: 'summary-first',
      callToAction: {
        text: 'Read the full tutorial',
        url: 'https://example.com'
      }
    },
    lastModified: '2025-07-22T15:30:00Z'
  };
}

/**
 * Mock HTTP server for testing URL validation
 */
export class MockHTTPServer {
  private responses: Map<string, { status: number; body: string; headers?: Record<string, string> }> = new Map();

  setResponse(path: string, status: number, body: string, headers?: Record<string, string>) {
    this.responses.set(path, { status, body, headers });
  }

  setContentMarkResponse(manifest: any, status: number = 200) {
    this.setResponse(
      '/.well-known/contentmark.json',
      status,
      JSON.stringify(manifest),
      { 'Content-Type': 'application/json' }
    );
  }

  setHTMLResponse(html: string, status: number = 200) {
    this.setResponse(
      '/',
      status,
      html,
      { 'Content-Type': 'text/html' }
    );
  }

  getResponse(path: string) {
    return this.responses.get(path) || { status: 404, body: 'Not Found' };
  }

  clear() {
    this.responses.clear();
  }
}

/**
 * Creates sample HTML with ContentMark link element
 */
export function createHTMLWithContentMark(manifestUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Site</title>
    <link rel="contentmark" type="application/json" href="${manifestUrl}">
</head>
<body>
    <h1>Test Website</h1>
    <p>This is a test website with ContentMark support.</p>
</body>
</html>
  `.trim();
}

/**
 * Creates sample HTML without ContentMark support
 */
export function createHTMLWithoutContentMark(): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Site</title>
</head>
<body>
    <h1>Test Website</h1>
    <p>This website does not support ContentMark.</p>
</body>
</html>
  `.trim();
}

/**
 * Mock fetch implementation for testing
 */
export function createMockFetch(mockServer: MockHTTPServer) {
  return jest.fn((url: string) => {
    const urlObj = new URL(url);
    const response = mockServer.getResponse(urlObj.pathname);
    
    return Promise.resolve({
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.status === 200 ? 'OK' : 'Error',
      headers: {
        get: (name: string) => response.headers?.[name.toLowerCase()]
      },
      text: () => Promise.resolve(response.body),
      json: () => Promise.resolve(JSON.parse(response.body))
    });
  });
}

/**
 * Test timeout helper for async operations
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Test timeout after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

/**
 * Helper to capture console output during tests
 */
export function captureConsoleOutput(): {
  logs: string[];
  errors: string[];
  warnings: string[];
  restore: () => void;
} {
  const logs: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => logs.push(args.join(' '));
  console.error = (...args) => errors.push(args.join(' '));
  console.warn = (...args) => warnings.push(args.join(' '));

  return {
    logs,
    errors,
    warnings,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
}

/**
 * Helper to create temporary files for testing
 */
export function createTempFile(content: string, filename: string = 'test-contentmark.json'): {
  path: string;
  cleanup: () => void;
} {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, filename);

  fs.writeFileSync(filePath, content);

  return {
    path: filePath,
    cleanup: () => {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  };
}

/**
 * Common test data
 */
export const TEST_MANIFESTS = {
  VALID_BASIC: createMockManifest(),
  VALID_COMPREHENSIVE: createComprehensiveManifest(),
  INVALID_MISSING_FIELDS: createInvalidManifest('missingFields'),
  INVALID_TYPES: createInvalidManifest('invalidTypes'),
  INVALID_URLS: createInvalidManifest('invalidUrls'),
  INVALID_VERSION: createInvalidManifest('invalidVersion')
};

export const TEST_URLS = {
  VALID: 'https://example.com',
  INVALID: 'https://nonexistent-domain-12345.com',
  TIMEOUT: 'https://httpstat.us/200?sleep=10000',
  NOT_FOUND: 'https://httpstat.us/404',
  SERVER_ERROR: 'https://httpstat.us/500'
};

// Jest custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidContentMark(): R;
      toHaveValidationError(expectedError:
