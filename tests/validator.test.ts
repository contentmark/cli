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
      expect(result.errors).toContain(expect.stringContaining('Invalid JSON'));
    });

    it('should require all mandatory fields', async () => {
      const incomplete = {
        version: '1.0.0'
        // Missing required fields
      };

      const result = await validator.validate(JSON.stringify(incomplete));
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('siteName'));
      expect(result.errors).toContain(expect.stringContaining('defaultUsagePolicy'));
      expect(result.errors).toContain(expect.stringContaining('lastModified'));
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
      expect(result.errors).toContain(expect.stringContaining('canSummarize must be a boolean'));
      expect(result.errors).toContain(expect.stringContaining('mustAttribute'));
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
      expect(result.errors).toContain(expect.stringContaining('semantic versioning'));
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
      expect(result.errors).toContain(expect.stringContaining('valid absolute URL'));
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
      expect(result.warnings).toContain(expect.stringContaining('Conflicting settings'));
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
      expect(result.suggestions).toContain(expect.stringContaining('monetization'));
      expect(result.suggestions).toContain(expect.stringContaining('visibility'));
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
      expect(result.errors).toContain(expect.stringContaining('loginUrl is required'));
    });
  });

  describe('validateURL', () => {
    it('should handle network errors gracefully', async () => {
      const result = await validator.validateURL('https://nonexistent-domain-12345.com');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Network error'));
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
