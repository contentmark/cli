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
      toHaveValidationError(expectedError: string): R;
      toHaveValidationWarning(expectedWarning: string): R;
      toHaveSuggestion(expectedSuggestion: string): R;
    }
  }
}

// Custom Jest matchers implementation
expect.extend({
  toBeValidContentMark(received) {
    const pass = received && received.valid === true && received.errors.length === 0;
    
    if (pass) {
      return {
        message: () => `Expected validation result to be invalid, but it was valid`,
        pass: true
      };
    } else {
      const errors = received?.errors || [];
      return {
        message: () => `Expected validation result to be valid, but got errors: ${errors.join(', ')}`,
        pass: false
      };
    }
  },

  toHaveValidationError(received, expectedError) {
    const errors = received?.errors || [];
    const pass = errors.some((error: string) => error.includes(expectedError));
    
    if (pass) {
      return {
        message: () => `Expected validation result not to have error "${expectedError}", but it did`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected validation result to have error "${expectedError}", but got: ${errors.join(', ')}`,
        pass: false
      };
    }
  },

  toHaveValidationWarning(received, expectedWarning) {
    const warnings = received?.warnings || [];
    const pass = warnings.some((warning: string) => warning.includes(expectedWarning));
    
    if (pass) {
      return {
        message: () => `Expected validation result not to have warning "${expectedWarning}", but it did`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected validation result to have warning "${expectedWarning}", but got: ${warnings.join(', ')}`,
        pass: false
      };
    }
  },

  toHaveSuggestion(received, expectedSuggestion) {
    const suggestions = received?.suggestions || [];
    const pass = suggestions.some((suggestion: string) => suggestion.includes(expectedSuggestion));
    
    if (pass) {
      return {
        message: () => `Expected validation result not to have suggestion "${expectedSuggestion}", but it did`,
        pass: true
      };
    } else {
      return {
        message: () => `Expected validation result to have suggestion "${expectedSuggestion}", but got: ${suggestions.join(', ')}`,
        pass: false
      };
    }
  }
});

/**
 * Performance testing helper
 */
export async function measurePerformance<T>(
  operation: () => Promise<T>,
  maxTimeMs: number = 1000
): Promise<{ result: T; timeMs: number; withinLimit: boolean }> {
  const startTime = process.hrtime.bigint();
  const result = await operation();
  const endTime = process.hrtime.bigint();
  
  const timeMs = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
  const withinLimit = timeMs <= maxTimeMs;
  
  return { result, timeMs, withinLimit };
}

/**
 * Memory usage testing helper
 */
export function measureMemoryUsage<T>(operation: () => T): { result: T; memoryUsedMB: number } {
  const initialMemory = process.memoryUsage().heapUsed;
  const result = operation();
  const finalMemory = process.memoryUsage().heapUsed;
  
  const memoryUsedMB = (finalMemory - initialMemory) / 1024 / 1024;
  
  return { result, memoryUsedMB };
}

/**
 * Network simulation helpers for testing edge cases
 */
export class NetworkSimulator {
  static createSlowResponse(delayMs: number = 2000) {
    return jest.fn(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve('{"version":"1.0.0"}'),
            json: () => Promise.resolve({ version: '1.0.0' })
          });
        }, delayMs);
      })
    );
  }

  static createFailingResponse(errorMessage: string = 'Network error') {
    return jest.fn(() => Promise.reject(new Error(errorMessage)));
  }

  static createTimeoutResponse() {
    return jest.fn(() => 
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      })
    );
  }
}

/**
 * Test environment setup for different scenarios
 */
export class TestEnvironment {
  static setupOfflineMode() {
    // Mock fetch to simulate offline environment
    (global as any).fetch = jest.fn(() => 
      Promise.reject(new Error('Network unavailable'))
    );
  }

  static setupLimitedBandwidth() {
    // Mock fetch with artificial delays
    (global as any).fetch = NetworkSimulator.createSlowResponse(5000);
  }

  static restoreNetworking() {
    // Restore original fetch if it was mocked
    if (jest.isMockFunction((global as any).fetch)) {
      ((global as any).fetch as jest.Mock).mockRestore();
    }
  }
}

/**
 * File system test helpers
 */
export class FileSystemTestHelper {
  static createMockFileSystem(files: Record<string, string>) {
    const fs = require('fs');
    
    const originalReadFileSync = fs.readFileSync;
    const originalExistsSync = fs.existsSync;
    const originalWriteFileSync = fs.writeFileSync;

    fs.readFileSync = jest.fn((path: string) => {
      const normalizedPath = path.replace(/\\/g, '/');
      if (files[normalizedPath]) {
        return files[normalizedPath];
      }
      throw new Error(`ENOENT: no such file or directory, open '${path}'`);
    });

    fs.existsSync = jest.fn((path: string) => {
      const normalizedPath = path.replace(/\\/g, '/');
      return normalizedPath in files;
    });

    fs.writeFileSync = jest.fn((path: string, content: string) => {
      const normalizedPath = path.replace(/\\/g, '/');
      files[normalizedPath] = content;
    });

    return {
      restore: () => {
        fs.readFileSync = originalReadFileSync;
        fs.existsSync = originalExistsSync;
        fs.writeFileSync = originalWriteFileSync;
      },
      getFiles: () => ({ ...files })
    };
  }
}
