#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { readFileSync, existsSync, writeFileSync } from 'fs-extra';
import { ContentMarkValidator } from './validator';
import { ContentMarkGenerator } from './generator';
import { URLChecker } from './url-checker';
import { getFormatter } from './formatters';
import { ConfigManager } from './config';

const program = new Command();
const config = new ConfigManager();

program
  .name('contentmark')
  .description('ContentMark CLI - Tools for AI-readable content protocol')
  .version('1.0.0');

// Validate command
program
  .command('validate')
  .description('Validate a ContentMark manifest file')
  .argument('[file]', 'Path to contentmark.json file', '.well-known/contentmark.json')
  .option('-u, --url <url>', 'Validate remote URL instead of local file')
  .option('-v, --verbose', 'Show detailed validation output')
  .option('--json', 'Output results as JSON')
  .option('--format <format>', 'Output format (json, yaml, summary)')
  .action(async (file: string, options: any) => {
    const outputConfig = config.getOutputConfig();
    if (!options.format && !options.json) {
      options.format = outputConfig.format === 'json' ? undefined : outputConfig.format;
    }
    options.verbose = options.verbose || outputConfig.verbose;
    const spinner = ora('Validating ContentMark manifest...').start();

    try {
      const validationConfig = config.getValidationConfig();
      const validator = new ContentMarkValidator(validationConfig.schemaUrl);
      let result;

      if (options.url) {
        result = await validator.validateURL(options.url);
        spinner.succeed(`Validated ${options.url}`);
      } else {
        if (!existsSync(file)) {
          spinner.fail(`File not found: ${file}`);
          process.exit(1);
        }

        const content = readFileSync(file, 'utf-8');
        result = await validator.validate(content);
        spinner.succeed(`Validated ${file}`);
      }

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.valid ? 0 : 1);
      }

      if (options.format) {
        const formatter = getFormatter(options.format);
        console.log(formatter.formatValidation(result));
        process.exit(result.valid ? 0 : 1);
      }

      // Human-readable output
      console.log();
      if (result.valid) {
        console.log(chalk.green('✅ Valid ContentMark manifest!'));
      } else {
        console.log(chalk.red('❌ Invalid ContentMark manifest'));
      }

      if (result.errors.length > 0) {
        console.log(chalk.red('\nErrors:'));
        result.errors.forEach((error: string) => {
          console.log(chalk.red(`  • ${error}`));
        });
      }

      if (result.warnings.length > 0) {
        console.log(chalk.yellow('\nWarnings:'));
        result.warnings.forEach((warning: string) => {
          console.log(chalk.yellow(`  ⚠ ${warning}`));
        });
      }

      if (result.suggestions.length > 0 && options.verbose) {
        console.log(chalk.cyan('\nSuggestions:'));
        result.suggestions.forEach((suggestion: string) => {
          console.log(chalk.cyan(`  💡 ${suggestion}`));
        });
      }

      if (result.valid && !options.verbose) {
        console.log(chalk.gray('\nUse --verbose for optimization suggestions'));
      }

      process.exit(result.valid ? 0 : 1);

    } catch (error: any) {
      spinner.fail('Validation failed');
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Generate command
program
  .command('generate')
  .description('Generate a ContentMark manifest file')
  .option('-t, --type <type>', 'Template type (blog, business, premium, ecommerce, news, education, api)', 'blog')
  .option('-o, --output <file>', 'Output file path', '.well-known/contentmark.json')
  .option('-i, --interactive', 'Interactive generation with prompts')
  .option('--overwrite', 'Overwrite existing file')
  .action(async (options) => {
    try {
      if (existsSync(options.output) && !options.overwrite) {
        console.log(chalk.yellow(`File ${options.output} already exists. Use --overwrite to replace it.`));
        process.exit(1);
      }

      const generator = new ContentMarkGenerator();
      let manifest;

      if (options.interactive) {
        const spinner = ora('Starting interactive generation...').start();
        spinner.stop();
        manifest = await generator.generateInteractive();
      } else {
        manifest = generator.generateTemplate(options.type);
      }

      writeFileSync(options.output, JSON.stringify(manifest, null, 2));

      console.log(chalk.green(`✅ Generated ContentMark manifest: ${options.output}`));
      console.log(chalk.cyan('💡 Remember to customize the generated file with your information'));
      console.log(chalk.gray(`\nValidate with: contentmark validate ${options.output}`));

    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Check command
program
  .command('check')
  .description('Check if a website supports ContentMark')
  .argument('<url>', 'Website URL to check')
  .option('--discovery', 'Show discovery method details')
  .option('--timeout <ms>', 'Request timeout in milliseconds')
  .action(async (url, options) => {
    const batchConfig = config.getBatchConfig();
    const timeout = options.timeout || batchConfig.timeout;
    const spinner = ora(`Checking ${url} for ContentMark support...`).start();

    try {
      const checker = new URLChecker(undefined, { timeout });
      const result = await checker.checkWebsite(url);

      spinner.stop();
      console.log();

      if (result.found) {
        console.log(chalk.green(`✅ ContentMark found at ${result.foundAt}`));

        if (options.discovery) {
          console.log(chalk.cyan('\nDiscovery Details:'));
          console.log(`  Method: ${result.discoveryMethod}`);
          console.log(`  URL: ${result.manifestUrl}`);
          console.log(`  Status: ${result.httpStatus}`);
        }

        if (result.valid) {
          console.log(chalk.green('✅ Manifest is valid'));
        } else {
          console.log(chalk.yellow('⚠ Manifest has validation issues'));
          if (result.errors) {
            result.errors.forEach((error: string) => {
              console.log(chalk.red(`  • ${error}`));
            });
          }
        }

        if (result.manifest) {
          console.log(chalk.cyan('\nManifest Summary:'));
          console.log(`  Site: ${result.manifest.siteName}`);
          console.log(`  Can Summarize: ${result.manifest.defaultUsagePolicy.canSummarize ? '✅' : '❌'}`);
          console.log(`  Can Train: ${result.manifest.defaultUsagePolicy.canTrain ? '✅' : '❌'}`);
          console.log(`  Can Quote: ${result.manifest.defaultUsagePolicy.canQuote ? '✅' : '❌'}`);
          console.log(`  Must Attribute: ${result.manifest.defaultUsagePolicy.mustAttribute ? '✅' : '❌'}`);

          if (result.manifest.monetization) {
            console.log(chalk.green('\n💰 Monetization Available:'));
            if (result.manifest.monetization.tipJar) {
              console.log(`  Tip Jar: ${result.manifest.monetization.tipJar}`);
            }
            if (result.manifest.monetization.consultation?.available) {
              console.log(`  Consultation: ${result.manifest.monetization.consultation.bookingUrl}`);
            }
          }
        }
      } else {
        console.log(chalk.red(`❌ No ContentMark support found at ${url}`));
        console.log(chalk.gray('\nSuggestion: Add a ContentMark manifest to enable AI content control'));
        console.log(chalk.cyan('Generate one with: contentmark generate --interactive'));
      }

    } catch (error: any) {
      spinner.fail('Check failed');
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Init command
program
  .command('init')
  .description('Initialize ContentMark in current directory')
  .option('--type <type>', 'Template type (blog, business, premium, ecommerce, news, education, api)', 'blog')
  .action(async (options) => {
    try {
      const spinner = ora('Initializing ContentMark...').start();

      // Create .well-known directory if it doesn't exist
      const { ensureDirSync } = await import('fs-extra');
      ensureDirSync('.well-known');

      const generator = new ContentMarkGenerator();
      const manifest = generator.generateTemplate(options.type);

      writeFileSync('.well-known/contentmark.json', JSON.stringify(manifest, null, 2));

      spinner.succeed('ContentMark initialized!');

      console.log(chalk.green('\n✅ ContentMark has been initialized in your project'));
      console.log(chalk.cyan('\nNext steps:'));
      console.log('  1. Edit .well-known/contentmark.json with your information');
      console.log('  2. Upload to your website');
      console.log('  3. Validate with: contentmark validate');
      console.log('\nFor help: https://contentmark.org/docs/getting-started');

    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Batch check command
program
  .command('batch-check')
  .description('Check multiple websites for ContentMark support')
  .argument('<file>', 'File containing URLs (one per line)')
  .option('--concurrency <num>', 'Number of concurrent requests', '5')
  .option('--output <file>', 'Output results to file')
  .option('--format <format>', 'Output format (json, yaml, summary)', 'json')
  .action(async (file, options) => {
    try {
      if (!existsSync(file)) {
        console.error(chalk.red(`File not found: ${file}`));
        process.exit(1);
      }

      const content = readFileSync(file, 'utf-8');
      const urls = content.split('\n').filter(line => line.trim()).map(line => line.trim());

      if (urls.length === 0) {
        console.error(chalk.red('No URLs found in file'));
        process.exit(1);
      }

      console.log(chalk.blue(`🔍 Checking ${urls.length} websites for ContentMark support...\n`));

      const batchConfig = config.getBatchConfig();
      const concurrency = parseInt(options.concurrency) || batchConfig.concurrency || 5;
      const checker = new URLChecker(undefined, { timeout: batchConfig.timeout });

      const spinner = ora(`Checking websites... (0/${urls.length})`).start();

      const results = await checker.batchCheck(urls, {
        concurrency,
        onProgress: (done, total) => {
          spinner.text = `Checking websites... (${done}/${total})`;
        }
      });

      spinner.succeed(`Completed checking ${urls.length} websites`);

      const formatter = getFormatter(options.format);
      const resultArray = Array.from(results.entries());

      const output = formatter.formatBatch(resultArray);

      if (options.output) {
        writeFileSync(options.output, output);
        console.log(chalk.green(`✅ Results saved to ${options.output}`));
      } else {
        console.log(output);
      }

      const found = resultArray.filter(([, result]) => result.found).length;
      const notFound = resultArray.length - found;

      console.log(chalk.cyan('\n📊 Summary:'));
      console.log(`  ${chalk.green('✅ Found:')} ${found}`);
      console.log(`  ${chalk.red('❌ Not Found:')} ${notFound}`);
      console.log(`  ${chalk.blue('📈 Success Rate:')} ${((found / resultArray.length) * 100).toFixed(1)}%`);

    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Show information about ContentMark protocol')
  .action(() => {
    console.log(chalk.blue('📋 ContentMark Protocol Information\n'));
    console.log('ContentMark is an open protocol for ethical AI-content interaction.');
    console.log('It gives creators control over how AI uses their content while enabling');
    console.log('monetization and discoverability optimization.\n');

    console.log(chalk.cyan('🌐 Resources:'));
    console.log('  Website: https://contentmark.org');
    console.log('  Documentation: https://contentmark.org/docs');
    console.log('  GitHub: https://github.com/contentmark/spec');
    console.log('  Examples: https://github.com/contentmark/spec/tree/main/examples\n');

    console.log(chalk.cyan('🛠 CLI Commands:'));
    console.log('  contentmark validate [file]     Validate manifest file');
    console.log('  contentmark generate            Generate manifest template');
    console.log('  contentmark check <url>         Check website for ContentMark');
    console.log('  contentmark batch-check <file>  Check multiple websites from file');
    console.log('  contentmark init                Initialize in current directory');
    console.log('  contentmark info                Show this information\n');

    console.log(chalk.gray('For detailed help: contentmark <command> --help'));
  });

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\nUnexpected error occurred:'));
  console.error(error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('\nUnhandled promise rejection:'));
  console.error(reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
