export enum ErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_JSON = 'INVALID_JSON',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR'
}

export class ContentMarkError extends Error {
  public readonly code: ErrorCode;
  public readonly suggestions: string[];

  constructor(code: ErrorCode, message: string, suggestions: string[] = []) {
    super(message);
    this.name = 'ContentMarkError';
    this.code = code;
    this.suggestions = suggestions;
  }

  static validationFailed(details: string, suggestions: string[] = []): ContentMarkError {
    return new ContentMarkError(
      ErrorCode.VALIDATION_FAILED,
      `Validation failed: ${details}`,
      suggestions
    );
  }

  static networkError(url: string, originalError: Error): ContentMarkError {
    return new ContentMarkError(
      ErrorCode.NETWORK_ERROR,
      `Network error accessing ${url}: ${originalError.message}`,
      [
        'Check your internet connection',
        'Verify the URL is correct',
        'Try again later if the server is temporarily unavailable'
      ]
    );
  }

  static fileNotFound(path: string): ContentMarkError {
    return new ContentMarkError(
      ErrorCode.FILE_NOT_FOUND,
      `File not found: ${path}`,
      [
        'Check the file path is correct',
        'Ensure the file exists',
        'Verify you have read permissions'
      ]
    );
  }

  static invalidJson(details: string): ContentMarkError {
    return new ContentMarkError(
      ErrorCode.INVALID_JSON,
      `Invalid JSON: ${details}`,
      [
        'Check for syntax errors in your JSON',
        'Use a JSON validator to identify issues',
        'Ensure all strings are properly quoted'
      ]
    );
  }
}
