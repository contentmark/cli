import { ContentMarkValidator } from '../src/validator';

describe('ContentMarkValidator', () => {
  let validator: ContentMarkValidator;

  beforeEach(() => {
    validator = new ContentMarkValidator();
  });

  describe('validate', () => {
    it('should validate a valid basic manifest', async () => {
      const manifest = {
        version: '1.0.0',
        siteName: 'Test Site',
        defaultUsagePolicy: {
          canSummarize: true,
          canTrain: false,
          canQuote: true,
          mustAttribute: true
        },
        lastModified: '2025-07-22T15:30:00Z'
      };

      const result = await validator.validate(JSON.stringify(manifest));
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.manifest).toEqual(manifest);
    });

    it('should reject invalid JSON', async () => {
      const invalidJson = '{ invalid json }';
      
      const result = await validator.validate(invalidJson);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('Invalid JSON'))).toBe(true);
    });

    it('should require all mandatory fields', async () => {
      const incomplete = {
        version: '1.0.0'
        // Missing required fields
      };

      const result = await validator.validate(JSON.stringify(incomplete));
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('siteName'))).toBe(true);
      expect(result.errors.some(error => error.includes('defaultUsagePolicy'))).toBe(true);
      expect(result.errors.some(error => error.includes('lastModified'))).toBe(true);
    });

    it('should validate usage policy fields', async () => {
      const manifest = {
        version: '1.0.0',
        siteName: 'Test Site',
        defaultUsagePolicy: {
          canSummarize: 'yes', // Should be boolean
          canTrain: false,
          canQuote: true
          // Missing mustAttribute
        },
        lastModified: '2025-07-22T15:30:00Z'
      };

      const result = await validator.validate(JSON.stringify(manifest));
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('canSummarize must be a boolean'))).toBe(true);
      expect(result.errors.some(error => error.includes('mustAttribute'))).toBe(true);
    });

    it('should validate version format', async () => {
      const manifest = {
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

      const result = await validator.validate(JSON.stringify(manifest));
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('semantic versioning'))).toBe(true);
    });

    it('should validate URL formats', async () => {
      const manifest = {
        version: '1.0.0',
        siteName: 'Test Site',
        defaultUsagePolicy: {
          canSummarize: true,
          canTrain: false,
          canQuote: true,
          mustAttribute: true
        },
        monetization: {
          tipJar: 'invalid-url'
        },
        lastModified: '2025-07-22T15:30:00Z'
      };

      const result = await validator.validate(JSON.stringify(manifest));
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('valid absolute URL'))).toBe(true);
    });

    it('should detect logical inconsistencies', async () => {
      const manifest = {
        version: '1.0.0',
        siteName: 'Test Site',
        defaultUsagePolicy: {
          canSummarize: false,
          canTrain: false,
          canQuote: true,
          mustAttribute: true
        },
        visibility: {
          aiDiscovery: 'enhanced'
        },
        lastModified: '2025-07-22T15:30:00Z'
      };

      const result = await validator.validate(JSON.stringify(manifest));
      
      expect(result.valid).toBe(true); // Structure is valid
      expect(result.warnings.some(warning => warning.includes('Conflicting settings'))).toBe(true);
    });

    it('should provide optimization suggestions', async () => {
      const basicManifest = {
        version: '1.0.0',
        siteName: 'Test Site',
        defaultUsagePolicy: {
          canSummarize: true,
          canTrain: false,
          canQuote: true,
          mustAttribute: true
        },
        lastModified: '2025-07-22T15:30:00Z'
      };

      const result = await validator.validate(JSON.stringify(basicManifest));
      
      expect(result.valid).toBe(true);
      expect(result.suggestions.some(suggestion => suggestion.includes('monetization'))).toBe(true);
      expect(result.suggestions.some(suggestion => suggestion.includes('visibility'))).toBe(true);
    });

    it('should validate access type requirements', async () => {
      const manifest = {
        version: '1.0.0',
        siteName: 'Test Site',
        defaultUsagePolicy: {
          canSummarize: true,
          canTrain: false,
          canQuote: true,
          mustAttribute: true
        },
        access: {
          type: 'authenticated'
          // Missing loginUrl
        },
        lastModified: '2025-07-22T15:30:00Z'
      };

      const result = await validator.validate(JSON.stringify(manifest));
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('loginUrl is required'))).toBe(true);
    });
  });

  describe('validateURL', () => {
    it('should handle network errors gracefully', async () => {
      const result = await validator.validateURL('https://nonexistent-domain-12345.com');
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('Network error'))).toBe(true);
    });

    it('should handle HTTP errors', async () => {
      // This test would need a mock server or real test endpoint
      // For now, testing the error handling structure
      const result = await validator.validateURL('https://httpstat.us/404');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
