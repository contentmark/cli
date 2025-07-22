import * as yaml from 'js-yaml';
import { OutputFormatter, ValidationResult, CheckResult } from './types';

export class YamlFormatter extends OutputFormatter {
  formatValidation(result: ValidationResult): string {
    return yaml.dump({
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
      suggestions: result.suggestions,
      manifest: result.manifest
    });
  }

  formatCheck(result: CheckResult): string {
    return yaml.dump({
      found: result.found,
      method: result.method,
      manifestUrl: result.manifestUrl,
      errors: result.errors,
      manifest: result.manifest
    });
  }

  formatBatch(results: [string, CheckResult][]): string {
    const formatted = results.map(([url, result]) => ({
      url,
      found: result.found,
      method: result.method,
      manifestUrl: result.manifestUrl,
      errors: result.errors
    }));
    
    return yaml.dump({
      results: formatted,
      summary: {
        total: results.length,
        found: results.filter(([, r]) => r.found).length,
        notFound: results.filter(([, r]) => !r.found).length
      }
    });
  }
}
