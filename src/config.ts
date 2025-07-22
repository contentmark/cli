import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface ContentMarkConfig {
  validation?: {
    schemaUrl?: string;
    strictMode?: boolean;
    customRules?: string[];
  };
  output?: {
    format?: 'json' | 'yaml' | 'summary';
    verbose?: boolean;
    colors?: boolean;
  };
  batch?: {
    concurrency?: number;
    timeout?: number;
    retries?: number;
  };
}

const DEFAULT_CONFIG: ContentMarkConfig = {
  validation: {
    strictMode: false
  },
  output: {
    format: 'json',
    verbose: false,
    colors: true
  },
  batch: {
    concurrency: 5,
    timeout: 10000,
    retries: 2
  }
};

export class ConfigManager {
  private config: ContentMarkConfig;

  constructor(configPath?: string) {
    this.config = this.loadConfig(configPath);
  }

  private loadConfig(configPath?: string): ContentMarkConfig {
    const paths = [
      configPath,
      '.contentmarkrc.json',
      join(process.cwd(), '.contentmarkrc.json'),
      join(homedir(), '.contentmarkrc.json')
    ].filter(Boolean) as string[];

    for (const path of paths) {
      if (existsSync(path)) {
        try {
          const content = readFileSync(path, 'utf-8');
          const userConfig = JSON.parse(content);
          return this.mergeConfig(DEFAULT_CONFIG, userConfig);
        } catch (error) {
          console.warn(`Warning: Failed to parse config file ${path}: ${(error as Error).message}`);
        }
      }
    }

    return DEFAULT_CONFIG;
  }

  private mergeConfig(defaultConfig: ContentMarkConfig, userConfig: any): ContentMarkConfig {
    return {
      validation: { ...defaultConfig.validation, ...userConfig.validation },
      output: { ...defaultConfig.output, ...userConfig.output },
      batch: { ...defaultConfig.batch, ...userConfig.batch }
    };
  }

  get(key?: keyof ContentMarkConfig): any {
    if (key) {
      return this.config[key];
    }
    return this.config;
  }

  getValidationConfig() {
    return this.config.validation || {};
  }

  getOutputConfig() {
    return this.config.output || {};
  }

  getBatchConfig() {
    return this.config.batch || {};
  }
}
