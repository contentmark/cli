import { ContentMarkGenerator } from '../src/generator';

describe('ContentMarkGenerator', () => {
  let generator: ContentMarkGenerator;

  beforeEach(() => {
    generator = new ContentMarkGenerator();
  });

  describe('generateTemplate', () => {
    it('should generate blog template', () => {
      const result = generator.generateTemplate('blog');
      expect(result.siteName).toBe('Your Blog Name');
      expect(result.feeds).toHaveLength(1);
      expect(result.feeds![0].type).toBe('blog');
      expect(result.defaultUsagePolicy.canSummarize).toBe(true);
      expect(result.monetization?.tipJar).toBeDefined();
      expect(result.access?.type).toBe('public');
    });

    it('should generate business template', () => {
      const result = generator.generateTemplate('business');
      expect(result.siteName).toBe('Your Business Name');
      expect(result.visibility?.aiDiscovery).toBe('enhanced');
      expect(result.monetization?.consultation).toBeDefined();
      expect(result.visibility?.boostScore).toBe(7);
    });

    it('should generate premium template', () => {
      const result = generator.generateTemplate('premium');
      expect(result.access?.type).toBe('paywall');
      expect(result.defaultUsagePolicy.canSummarize).toBe(false);
      expect(result.monetization?.subscription).toBeDefined();
    });

    it('should throw error for unknown template type', () => {
      expect(() => {
        generator.generateTemplate('unknown' as any);
      }).toThrow('Unknown template type: unknown');
    });

    it('should include timestamp in lastModified field', () => {
      const result = generator.generateTemplate('blog');
      expect(result.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('generateInteractive', () => {
    it('should handle basic interactive generation', async () => {
    }, 1000);

    it('should handle monetization options', async () => {
    }, 1000);
  });
});
