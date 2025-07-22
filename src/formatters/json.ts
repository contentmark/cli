import { OutputFormatter, ValidationResult, CheckResult } from './types';

export class JsonFormatter extends OutputFormatter {
  formatValidation(result: ValidationResult): string {
    return JSON.stringify({
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
      suggestions: result.suggestions,
      manifest: result.manifest
    }, null, 2);
  }

  formatCheck(result: CheckResult): string {
    return JSON.stringify({
      found: result.found,
      method: result.method,
      manifestUrl: result.manifestUrl,
      errors: result.errors,
      manifest: result.manifest
    }, null, 2);
  }

  formatBatch(results: [string, CheckResult][]): string {
    const formatted = results.map(([url, result]) => ({
      url,
      found: result.found,
      method: result.method,
      manifestUrl: result.manifestUrl,
      errors: result.errors
    }));

    return JSON.stringify({
      results: formatted,
      summary: {
        total: results.length,
        found: results.filter(([, r]) => r.found).length,
        notFound: results.filter(([, r]) => !r.found).length
      }
    }, null, 2);
  }
}
