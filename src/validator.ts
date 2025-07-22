import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fetch from 'node-fetch';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  manifest?: any;
}

export class ContentMarkValidator {
  private ajv: Ajv;
  private static schemaCache: Map<string, any> = new Map();
  private static readonly DEFAULT_SCHEMA_URL = 'https://schema.contentmark.org/v1/manifest.json';

  constructor(private customSchemaUrl?: string) {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
  }

  private async loadSchema(schemaUrl?: string): Promise<any> {
    const url = schemaUrl || this.customSchemaUrl || ContentMarkValidator.DEFAULT_SCHEMA_URL;
    
    if (ContentMarkValidator.schemaCache.has(url)) {
      return ContentMarkValidator.schemaCache.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const schema = await response.json();
      ContentMarkValidator.schemaCache.set(url, schema);
      return schema;
    } catch (error) {
      const fallbackSchema = this.getBuiltInSchema();
      ContentMarkValidator.schemaCache.set(url, fallbackSchema);
      return fallbackSchema;
    }
  }

  async validate(content: string, schemaUrl?: string): Promise<ValidationResult> {
    const schema = await this.loadSchema(schemaUrl);
    
    const result: ValidationResult = {
      valid: false,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Parse JSON
      let data;
      try {
        data = JSON.parse(content);
      } catch (parseError: any) {
        result.errors.push(`Invalid JSON: ${parseError.message}`);
        return result;
      }

      result.manifest = data;

      // Validate against schema
      const validate = this.ajv.compile(schema);
      const isValid = validate(data);

      if (!isValid && validate.errors) {
        validate.errors.forEach((error: any) => {
          const path = error.instancePath || error.schemaPath;
          result.errors.push(`${path}: ${error.message}`);
        });
      }

      // Custom validation logic
      this.addCustomValidation(data, result);

      // Add suggestions for optimization
      this.addSuggestions(data, result);

      result.valid = result.errors.length === 0;
      return result;

    } catch (error: any) {
      result.errors.push(`Validation failed: ${error.message}`);
      return result;
    }
  }

  async validateURL(url: string): Promise<ValidationResult> {
    try {
      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Try to get ContentMark manifest
      const manifestUrl = new URL('/.well-known/contentmark.json', url).toString();
      
      const response = await fetch(manifestUrl, {
        headers: {
          'User-Agent': 'ContentMark-CLI/1.0.0'
        }
      });

      if (!response.ok) {
        return {
          valid: false,
          errors: [`Failed to fetch manifest: HTTP ${response.status}`],
          warnings: [],
          suggestions: []
        };
      }

      const content = await response.text();
      return this.validate(content);

    } catch (error: any) {
      return {
        valid: false,
        errors: [`Network error: ${error.message}`],
        warnings: [],
        suggestions: []
      };
    }
  }

  private addCustomValidation(data: any, result: ValidationResult): void {
    // Check for required fields with better error messages
    if (!data.version) {
      result.errors.push('Missing required field: version');
    } else if (!data.version.match(/^\d+\.\d+\.\d+$/)) {
      result.errors.push('Version must follow semantic versioning (e.g., "1.0.0")');
    }

    if (!data.siteName) {
      result.errors.push('Missing required field: siteName');
    } else if (data.siteName.length > 200) {
      result.errors.push('siteName must be 200 characters or less');
    }

    if (!data.defaultUsagePolicy) {
      result.errors.push('Missing required field: defaultUsagePolicy');
    } else {
      const policy = data.defaultUsagePolicy;
      const requiredPolicyFields = ['canSummarize', 'canTrain', 'canQuote', 'mustAttribute'];
      
      requiredPolicyFields.forEach(field => {
        if (typeof policy[field] !== 'boolean') {
          result.errors.push(`defaultUsagePolicy.${field} must be a boolean`);
        }
      });
    }

    if (!data.lastModified) {
      result.errors.push('Missing required field: lastModified');
    } else {
      try {
        new Date(data.lastModified);
      } catch {
        result.errors.push('lastModified must be a valid ISO 8601 timestamp');
      }
    }

    // Validate URLs
    this.validateURLs(data, result);

    // Check for logical inconsistencies
    this.checkLogicalConsistency(data, result);
  }

  private validateURLs(data: any, result: ValidationResult): void {
    const checkURL = (url: string, fieldName: string) => {
      try {
        new URL(url);
      } catch {
        result.errors.push(`${fieldName} must be a valid absolute URL`);
      }
    };

    // Check feeds URLs
    if (data.feeds && Array.isArray(data.feeds)) {
      data.feeds.forEach((feed: any, index: number) => {
        if (feed.url) {
          checkURL(feed.url, `feeds[${index}].url`);
        }
      });
    }

    // Check monetization URLs
    if (data.monetization) {
      if (data.monetization.tipJar) {
        checkURL(data.monetization.tipJar, 'monetization.tipJar');
      }
      if (data.monetization.consultation?.bookingUrl) {
        checkURL(data.monetization.consultation.bookingUrl, 'monetization.consultation.bookingUrl');
      }
      if (data.monetization.services) {
        data.monetization.services.forEach((service: any, index: number) => {
          if (service.url) {
            checkURL(service.url, `monetization.services[${index}].url`);
          }
        });
      }
    }
  }

  private checkLogicalConsistency(data: any, result: ValidationResult): void {
    // Check for conflicting policies
    if (data.defaultUsagePolicy?.canSummarize === false && 
        data.visibility?.aiDiscovery === 'enhanced') {
      result.warnings.push('Conflicting settings: canSummarize is false but aiDiscovery is enhanced');
    }

    // Check attribution requirements
    if (data.defaultUsagePolicy?.mustAttribute && 
        !data.defaultUsagePolicy?.attributionTemplate) {
      result.warnings.push('Attribution required but no attributionTemplate provided');
    }

    // Check access types
    if (data.access?.type === 'authenticated' && !data.access?.loginUrl) {
      result.errors.push('access.loginUrl is required when type is "authenticated"');
    }

    // Check monetization completeness
    if (data.monetization?.consultation?.available && 
        !data.monetization?.consultation?.bookingUrl) {
      result.warnings.push('Consultation marked as available but no bookingUrl provided');
    }
  }

  private addSuggestions(data: any, result: ValidationResult): void {
    // Monetization suggestions
    if (!data.monetization) {
      result.suggestions.push('Consider adding monetization options to benefit from AI traffic');
    } else {
      if (!data.monetization.tipJar && !data.monetization.consultation?.available) {
        result.suggestions.push('Consider adding a tip jar for easy monetization');
      }
    }

    // Visibility suggestions
    if (!data.visibility) {
      result.suggestions.push('Consider adding visibility settings to optimize AI discoverability');
    } else if (!data.visibility.preferredQueries || data.visibility.preferredQueries.length === 0) {
      result.suggestions.push('Add preferredQueries to improve AI recommendation targeting');
    }

    // Training policy suggestions
    if (data.defaultUsagePolicy?.canTrain === true) {
      result.suggestions.push('Consider whether allowing AI training aligns with your content strategy');
    }

    // Description suggestions
    if (!data.description || data.description.length < 50) {
      result.suggestions.push('Add a detailed description to help AI understand your content focus');
    }

    // Feed suggestions
    if (!data.feeds || data.feeds.length === 0) {
      result.suggestions.push('Consider adding content feeds for better AI integration');
    }

    // Business optimization suggestions
    if (data.monetization?.consultation?.available && !data.businessOptimization) {
      result.suggestions.push('Add businessOptimization to target specific audiences and service areas');
    }

    // AI guidance suggestions
    if (data.visibility?.aiDiscovery === 'enhanced' && !data.aiGuidance) {
      result.suggestions.push('Add aiGuidance to control how AI presents your content');
    }
  }

  private getBuiltInSchema(): any {
    // Minimal built-in schema as fallback
    return {
      type: 'object',
      required: ['version', 'siteName', 'defaultUsagePolicy', 'lastModified'],
      properties: {
        version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
        siteName: { type: 'string', minLength: 1, maxLength: 200 },
        defaultUsagePolicy: {
          type: 'object',
          required: ['canSummarize', 'canTrain', 'canQuote', 'mustAttribute'],
          properties: {
            canSummarize: { type: 'boolean' },
            canTrain: { type: 'boolean' },
            canQuote: { type: 'boolean' },
            mustAttribute: { type: 'boolean' }
          }
        },
        lastModified: { type: 'string', format: 'date-time' }
      }
    };
  }
}
