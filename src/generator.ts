import inquirer from 'inquirer';

export interface ContentMarkManifest {
  version: string;
  siteName: string;
  description?: string;
  feeds?: Array<{
    type: string;
    url: string;
    title: string;
    description?: string;
  }>;
  defaultUsagePolicy: {
    canSummarize: boolean;
    canTrain: boolean;
    canQuote: boolean;
    mustAttribute: boolean;
    attributionTemplate?: string;
  };
  visibility?: {
    aiDiscovery?: 'standard' | 'enhanced' | 'minimal';
    priorityContent?: boolean;
    preferredQueries?: string[];
    boostScore?: number;
    expertiseAreas?: string[];
    aiOptimizedDescription?: string;
  };
  monetization?: {
    tipJar?: string;
    consultation?: {
      available: boolean;
      bookingUrl?: string;
      hourlyRate?: string;
    };
    services?: Array<{
      name: string;
      url: string;
      pricing?: string;
    }>;
  };
  access?: {
    type: 'public' | 'authenticated' | 'paywall';
    loginUrl?: string;
    previewAvailable?: boolean;
    subscriptionUrl?: string;
  };
  renderHints?: {
    preferredFormat?: 'summary-first' | 'full-text' | 'preview-only';
    callToAction?: {
      text: string;
      url: string;
    };
  };
  lastModified: string;
}

export class ContentMarkGenerator {
  
  generateTemplate(type: string): ContentMarkManifest {
    const now = new Date().toISOString();
    
    switch (type.toLowerCase()) {
      case 'blog':
        return this.generateBlogTemplate(now);
      case 'business':
        return this.generateBusinessTemplate(now);
      case 'premium':
        return this.generatePremiumTemplate(now);
      default:
        throw new Error(`Unknown template type: ${type}. Available types: blog, business, premium`);
    }
  }

  async generateInteractive(): Promise<ContentMarkManifest> {
    console.log('\n🚀 Welcome to ContentMark Interactive Generator!\n');
    console.log('This will help you create a customized ContentMark manifest for your website.\n');

    // Basic information
    const basicInfo = await inquirer.prompt([
      {
        type: 'input',
        name: 'siteName',
        message: 'What is your website/brand name?',
        validate: (input) => input.length > 0 || 'Site name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Briefly describe your website/content:'
      },
      {
        type: 'input',
        name: 'website',
        message: 'What is your website URL? (e.g., https://example.com)',
        validate: (input) => {
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        }
      }
    ]);

    // Usage policies
    console.log('\n📋 AI Usage Policies\n');
    const policies = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'canSummarize',
        message: 'Allow AI to create summaries of your content?',
        default: true
      },
      {
        type: 'confirm',
        name: 'canTrain',
        message: 'Allow AI to use your content for model training?',
        default: false
      },
      {
        type: 'confirm',
        name: 'canQuote',
        message: 'Allow AI to quote excerpts from your content?',
        default: true
      },
      {
        type: 'confirm',
        name: 'mustAttribute',
        message: 'Require AI to provide attribution when using your content?',
        default: true
      }
    ]);

    let attributionTemplate;
    if (policies.mustAttribute) {
      const attribution = await inquirer.prompt([
        {
          type: 'input',
          name: 'template',
          message: 'Attribution template (use {siteName} and {url} as placeholders):',
          default: `From ${basicInfo.siteName} - {url}`
        }
      ]);
      attributionTemplate = attribution.template;
    }

    // Monetization
    console.log('\n💰 Monetization Options\n');
    const monetizationChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of monetization do you want to include?',
        choices: [
          { name: 'None (just attribution)', value: 'none' },
          { name: 'Tip jar only', value: 'tips' },
          { name: 'Professional services', value: 'services' },
          { name: 'Premium content/subscriptions', value: 'premium' }
        ]
      }
    ]);

    let monetization;
    if (monetizationChoice.type !== 'none') {
      monetization = await this.promptMonetization(monetizationChoice.type);
    }

    // Visibility optimization
    console.log('\n🎯 AI Visibility Optimization\n');
    const visibilityChoice = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'optimize',
        message: 'Do you want to optimize for AI discoverability?',
        default: false
