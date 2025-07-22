export { ValidationResult, CheckResult, OutputFormatter } from './types';
export { JsonFormatter } from './json';
export { YamlFormatter } from './yaml';
export { SummaryFormatter } from './summary';

import { OutputFormatter } from './types';
import { JsonFormatter } from './json';
import { YamlFormatter } from './yaml';
import { SummaryFormatter } from './summary';

export function getFormatter(format: string): OutputFormatter {
  switch (format.toLowerCase()) {
  case 'yaml': return new YamlFormatter();
  case 'summary': return new SummaryFormatter();
  case 'json':
  default: return new JsonFormatter();
  }
}
