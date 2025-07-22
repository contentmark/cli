import chalk from 'chalk';
import { OutputFormatter, ValidationResult, CheckResult } from './types';

export class SummaryFormatter extends OutputFormatter {
  formatValidation(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.valid) {
      lines.push(chalk.green('✅ Valid ContentMark manifest'));
    } else {
      lines.push(chalk.red('❌ Invalid ContentMark manifest'));
    }

    if (result.errors.length > 0) {
      lines.push(chalk.red('\nErrors:'));
      result.errors.forEach(error => {
        lines.push(chalk.red(`  • ${error}`));
      });
    }

    if (result.warnings.length > 0) {
      lines.push(chalk.yellow('\nWarnings:'));
      result.warnings.forEach(warning => {
        lines.push(chalk.yellow(`  • ${warning}`));
      });
    }

    if (result.suggestions.length > 0) {
      lines.push(chalk.blue('\nSuggestions:'));
      result.suggestions.forEach(suggestion => {
        lines.push(chalk.blue(`  • ${suggestion}`));
      });
    }

    return lines.join('\n');
  }

  formatCheck(result: CheckResult): string {
    const lines: string[] = [];

    if (result.found) {
      lines.push(chalk.green('✅ ContentMark support found'));
      lines.push(`Method: ${result.method}`);
      lines.push(`Manifest URL: ${result.manifestUrl}`);
    } else {
      lines.push(chalk.red('❌ No ContentMark support found'));
    }

    if (result.errors && result.errors.length > 0) {
      lines.push(chalk.red('\nErrors:'));
      result.errors.forEach(error => {
        lines.push(chalk.red(`  • ${error}`));
      });
    }

    return lines.join('\n');
  }

  formatBatch(results: [string, CheckResult][]): string {
    const lines: string[] = [];
    const found = results.filter(([, r]) => r.found).length;
    const total = results.length;

    lines.push(chalk.blue(`\n📊 Batch Check Results: ${found}/${total} sites support ContentMark\n`));

    results.forEach(([url, result]) => {
      if (result.found) {
        lines.push(chalk.green(`✅ ${url} - ${result.method}`));
      } else {
        lines.push(chalk.red(`❌ ${url} - No support found`));
      }
    });

    return lines.join('\n');
  }
}
