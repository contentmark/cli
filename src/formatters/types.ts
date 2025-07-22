export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  manifest?: any;
}

export interface CheckResult {
  found: boolean;
  method?: string;
  manifestUrl?: string;
  errors?: string[];
  manifest?: any;
}

export abstract class OutputFormatter {
  abstract formatValidation(result: ValidationResult): string;
  abstract formatCheck(result: CheckResult): string;
  abstract formatBatch(results: [string, CheckResult][]): string;
}
