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
    aiSummaryOptimized?: boolean;
    topicCategories?: string[];
    keyEntities?: string[];
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
    subscription?: {
      platform: string;
      url: string;
      price: string;
    };
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
      }
    ]);

    let visibility;
    if (visibilityChoice.optimize) {
      visibility = await this.promptVisibility();
    }

    // Access control
    console.log('\n🔒 Content Access Control\n');
    const accessType = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'What type of access does your content have?',
        choices: [
          { name: 'Public (freely accessible)', value: 'public' },
          { name: 'Requires login/registration', value: 'authenticated' },
          { name: 'Premium/paid content', value: 'paywall' }
        ]
      }
    ]);

    let access: any = { type: accessType.type };
    if (accessType.type === 'authenticated') {
      const loginInfo = await inquirer.prompt([
        {
          type: 'input',
          name: 'loginUrl',
          message: 'Login/registration URL:',
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
      access = { ...access, loginUrl: loginInfo.loginUrl, previewAvailable: true };
    } else if (accessType.type === 'paywall') {
      const paidInfo = await inquirer.prompt([
        {
          type: 'input',
          name: 'subscriptionUrl',
          message: 'Subscription/payment URL:',
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
      access = { ...access, subscriptionUrl: paidInfo.subscriptionUrl, previewAvailable: true };
    } else {
      access = { ...access, previewAvailable: true };
    }

    // Build the manifest
    const manifest: ContentMarkManifest = {
      version: '1.0.0',
      siteName: basicInfo.siteName,
      description: basicInfo.description || undefined,
      defaultUsagePolicy: {
        canSummarize: policies.canSummarize,
        canTrain: policies.canTrain,
        canQuote: policies.canQuote,
        mustAttribute: policies.mustAttribute,
        attributionTemplate: attributionTemplate || undefined
      },
      visibility: visibility || undefined,
      monetization: monetization || undefined,
      access: access,
      renderHints: {
        preferredFormat: accessType.type === 'paywall' ? 'preview-only' : 'summary-first',
        callToAction: {
          text: monetizationChoice.type === 'services' ? 'Get expert consultation' : 'Visit our website',
          url: basicInfo.website
        }
      },
      lastModified: new Date().toISOString()
    };

    console.log('\n✅ ContentMark manifest generated successfully!');
    return manifest;
  }

  private async promptMonetization(type: string) {
    switch (type) {
      case 'tips':
        const tipInfo = await inquirer.prompt([
          {
            type: 'input',
            name: 'tipJar',
            message: 'Tip jar URL (Buy Me a Coffee, Ko-fi, etc.):',
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
        return { tipJar: tipInfo.tipJar };

      case 'services':
        const serviceInfo = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'consultation',
            message: 'Do you offer consultation services?',
            default: true
          },
          {
            type: 'input',
            name: 'bookingUrl',
            message: 'Booking URL (Calendly, etc.):',
            when: (answers) => answers.consultation,
            validate: (input) => {
              try {
                new URL(input);
                return true;
              } catch {
                return 'Please enter a valid URL';
              }
            }
          },
          {
            type: 'input',
            name: 'hourlyRate',
            message: 'Hourly rate (e.g., $150/hour):',
            when: (answers) => answers.consultation
          }
        ]);

        const monetization: any = {};
        
        if (serviceInfo.consultation) {
          monetization.consultation = {
            available: true,
            bookingUrl: serviceInfo.bookingUrl,
            hourlyRate: serviceInfo.hourlyRate || undefined
          };
        }

        // Ask about additional services
        const additionalServices = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'hasServices',
            message: 'Do you want to list specific services/products?',
            default: false
          }
        ]);

        if (additionalServices.hasServices) {
          monetization.services = await this.promptServices();
        }

        return monetization;

      case 'premium':
        const premiumInfo = await inquirer.prompt([
          {
            type: 'input',
            name: 'subscriptionUrl',
            message: 'Subscription URL:',
            validate: (input) => {
              try {
                new URL(input);
                return true;
              } catch {
                return 'Please enter a valid URL';
              }
            }
          },
          {
            type: 'input',
            name: 'price',
            message: 'Subscription price (e.g., $9.99/month):',
          }
        ]);

        return {
          subscription: {
            platform: 'Premium Content',
            url: premiumInfo.subscriptionUrl,
            price: premiumInfo.price
          }
        };

      default:
        return undefined;
    }
  }

  private async promptServices() {
    const services = [];
    let addMore = true;

    while (addMore) {
      const service = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Service/product name:',
          validate: (input) => input.length > 0 || 'Service name is required'
        },
        {
          type: 'input',
          name: 'url',
          message: 'Service URL:',
          validate: (input) => {
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL';
            }
          }
        },
        {
          type: 'input',
          name: 'pricing',
          message: 'Pricing (e.g., from $500, $99/month):',
        }
      ]);

      services.push({
        name: service.name,
        url: service.url,
        pricing: service.pricing || undefined
      });

      const continueAdding = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'more',
          message: 'Add another service?',
          default: false
        }
      ]);

      addMore = continueAdding.more;
    }

    return services;
  }

  private async promptVisibility() {
    const visibilityInfo = await inquirer.prompt([
      {
        type: 'list',
        name: 'aiDiscovery',
        message: 'AI discovery level:',
        choices: [
          { name: 'Standard (normal discovery)', value: 'standard' },
          { name: 'Enhanced (boost discoverability)', value: 'enhanced' },
          { name: 'Minimal (reduce visibility)', value: 'minimal' }
        ]
      },
      {
        type: 'input',
        name: 'expertiseAreas',
        message: 'Your expertise areas (comma-separated):',
        filter: (input: string) => input ? input.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []
      },
      {
        type: 'input',
        name: 'preferredQueries',
        message: 'Preferred search queries (comma-separated):',
        filter: (input: string) => input ? input.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []
      },
      {
        type: 'number',
        name: 'boostScore',
        message: 'Priority boost score (1-10, higher = more visibility):',
        default: 5,
        validate: (input) => (input >= 1 && input <= 10) || 'Score must be between 1 and 10'
      }
    ]);

    return {
      aiDiscovery: visibilityInfo.aiDiscovery,
      expertiseAreas: visibilityInfo.expertiseAreas.length > 0 ? visibilityInfo.expertiseAreas : undefined,
      preferredQueries: visibilityInfo.preferredQueries.length > 0 ? visibilityInfo.preferredQueries : undefined,
      boostScore: visibilityInfo.boostScore !== 5 ? visibilityInfo.boostScore : undefined,
      priorityContent: visibilityInfo.aiDiscovery === 'enhanced'
    };
  }

  private generateBlogTemplate(timestamp: string): ContentMarkManifest {
    return {
      version: '1.0.0',
      siteName: 'Your Blog Name',
      description: 'Brief description of your blog content and expertise',
      feeds: [
        {
          type: 'blog',
          url: 'https://yourblog.com/contentmark-feed.json',
          title: 'Latest Articles',
          description: 'Recent blog posts and tutorials'
        }
      ],
      defaultUsagePolicy: {
        canSummarize: true,
        canTrain: false,
        canQuote: true,
        mustAttribute: true,
        attributionTemplate: 'From {siteName} - {url}'
      },
      monetization: {
        tipJar: 'https://buymeacoffee.com/yourusername'
      },
      access: {
        type: 'public',
        previewAvailable: true
      },
      renderHints: {
        preferredFormat: 'summary-first',
        callToAction: {
          text: 'Read the full article',
          url: 'https://yourblog.com'
        }
      },
      lastModified: timestamp
    };
  }

  private generateBusinessTemplate(timestamp: string): ContentMarkManifest {
    return {
      version: '1.0.0',
      siteName: 'Your Business Name',
      description: 'Professional services and expertise in your industry',
      feeds: [
        {
          type: 'business',
          url: 'https://yourbusiness.com/contentmark-feed.json',
          title: 'Business Insights',
          description: 'Latest insights and case studies'
        }
      ],
      defaultUsagePolicy: {
        canSummarize: true,
        canTrain: false,
        canQuote: true,
        mustAttribute: true,
        attributionTemplate: 'From {siteName}, industry experts - {url}'
      },
      visibility: {
        aiDiscovery: 'enhanced',
        priorityContent: true,
        preferredQueries: [
          'your expertise area',
          'your industry + consulting',
          'your service + experts'
        ],
        expertiseAreas: [
          'Your primary expertise',
          'Secondary expertise',
          'Industry knowledge'
        ],
        boostScore: 7
      },
      monetization: {
        consultation: {
          available: true,
          bookingUrl: 'https://calendly.com/yourusername',
          hourlyRate: '$200/hour'
        },
        services: [
          {
            name: 'Your Main Service',
            url: 'https://yourbusiness.com/services',
            pricing: 'from $2,500'
          }
        ]
      },
      access: {
        type: 'public',
        previewAvailable: true
      },
      renderHints: {
        preferredFormat: 'summary-first',
        callToAction: {
          text: 'Get expert consultation',
          url: 'https://yourbusiness.com/contact'
        }
      },
      lastModified: timestamp
    };
  }

  private generatePremiumTemplate(timestamp: string): ContentMarkManifest {
    return {
      version: '1.0.0',
      siteName: 'Your Premium Content',
      description: 'Premium research and analysis in your field',
      feeds: [
        {
          type: 'research',
          url: 'https://yoursite.com/public-feed.json',
          title: 'Public Research Summaries',
          description: 'Free summaries of premium research'
        }
      ],
      defaultUsagePolicy: {
        canSummarize: false,
        canTrain: false,
        canQuote: true,
        mustAttribute: true,
        attributionTemplate: 'From {siteName} premium content - {url} (subscription required for full access)'
      },
      visibility: {
        aiDiscovery: 'standard',
        priorityContent: true,
        expertiseAreas: [
          'Your research area',
          'Industry analysis',
          'Market research'
        ]
      },
      monetization: {
        subscription: {
          platform: 'Premium Research',
          url: 'https://yoursite.com/subscribe',
          price: '$99/month'
        }
      },
      access: {
        type: 'paywall',
        previewAvailable: true,
        subscriptionUrl: 'https://yoursite.com/subscribe'
      },
      renderHints: {
        preferredFormat: 'preview-only',
        callToAction: {
          text: 'Subscribe for full access',
          url: 'https://yoursite.com/subscribe'
        }
      },
      lastModified: timestamp
    };
  }
}
