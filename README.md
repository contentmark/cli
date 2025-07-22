# ContentMark CLI

> Professional command-line tools for the ContentMark protocol

[![npm version](https://badge.fury.io/js/%40contentmark%2Fcli.svg)](https://www.npmjs.com/package/@contentmark/cli)
[![CI/CD](https://github.com/contentmark/cli/workflows/CI%2FCD/badge.svg)](https://github.com/contentmark/cli/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/@contentmark/cli.svg)](https://www.npmjs.com/package/@contentmark/cli)

ContentMark CLI provides professional-grade tools for working with the [ContentMark protocol](https://contentmark.org) - validate manifests, generate configurations, and check website support with a single command.

## 🚀 Quick Start

```bash
# Install globally
npm install -g @contentmark/cli

# Or use without installing
npx @contentmark/cli --help
```

```bash
# Generate a ContentMark manifest interactively
contentmark generate --interactive

# Validate your manifest
contentmark validate .well-known/contentmark.json

# Check if a website supports ContentMark
contentmark check example.com
```

## ✨ Features

- **🔍 Validation** - Comprehensive schema validation with helpful error messages
- **🎯 Generation** - Interactive manifest creation with templates for different use cases
- **🌐 Discovery** - Check websites for ContentMark support across multiple discovery methods
- **⚙️ CI/CD Ready** - JSON output and exit codes for automation workflows
- **📋 Templates** - Pre-built configurations for blogs, businesses, and premium content
- **🛡️ Type Safe** - Built with TypeScript for reliability and IDE support

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g @contentmark/cli
contentmark --version
```

### Local Project Installation
```bash
npm install --save-dev @contentmark/cli
npx contentmark --help
```

### No Installation (npx)
```bash
npx @contentmark/cli generate --interactive
```

## 🎮 Commands

### `contentmark validate [file]`

Validate ContentMark manifests against the official schema.

```bash
# Validate local file
contentmark validate .well-known/contentmark.json

# Validate remote URL
contentmark validate --url https://example.com/.well-known/contentmark.json

# Get detailed suggestions
contentmark validate --verbose

# JSON output for CI/CD
contentmark validate --json
```

**Example Output:**
```
✅ Valid ContentMark manifest!

⚠️ Warnings:
  ⚠️  Attribution required but no attributionTemplate provided

💡 Suggestions:
  💡 Consider adding monetization options to benefit from AI traffic
  💡 Add preferredQueries to improve AI recommendation targeting
```

### `contentmark generate`

Create ContentMark manifests from templates or interactively.

```bash
# Interactive generation (recommended)
contentmark generate --interactive

# Quick templates
contentmark generate --type blog      # Personal blog
contentmark generate --type business  # Professional services  
contentmark generate --type premium   # Premium/paid content

# Custom output location
contentmark generate --output my-contentmark.json --overwrite
```

**Interactive Mode Preview:**
```
🚀 Welcome to ContentMark Interactive Generator!

? What is your website/brand name? › My Awesome Blog
? Briefly describe your website/content: › Tech tutorials and insights
? What is your website URL? › https://myawesomeblog.com
? Allow AI to create summaries of your content? › Yes
? Allow AI to use your content for model training? › No
? Allow AI to quote excerpts from your content? › Yes
? Require AI to provide attribution when using your content? › Yes
```

### `contentmark check <url>`

Discover and analyze ContentMark support on websites.

```bash
# Basic check
contentmark check example.com

# Show discovery details
contentmark check https://example.com --discovery
```

**Example Output:**
```
✅ ContentMark found at https://example.com/.well-known/contentmark.json
✅ Manifest is valid

📋 Manifest Summary:
  Site: Example Blog
  Can Summarize: ✅
  Can Train: ❌  
  Can Quote: ✅
  Must Attribute: ✅

💰 Monetization Available:
  Tip Jar: https://buymeacoffee.com/example
  Consultation: https://calendly.com/example
```

### `contentmark init`

Initialize ContentMark in your current project.

```bash
# Initialize with template selection
contentmark init --type blog

# Creates .well-known/contentmark.json with template
# Provides customization guidance
```

### `contentmark info`

Get information about the ContentMark protocol.

```bash
contentmark info
```

## 🎨 Templates

### Blog Template
Perfect for personal blogs and content sites:
- Public access with tip jar monetization
- Allows summaries and quotes, blocks training
- Basic attribution requirements

### Business Template  
Designed for professional services:
- Enhanced AI visibility optimization
- Consultation booking integration
- Multiple service offerings
- Professional attribution

### Premium Template
For subscription/paid content:
- Paywall access controls
- Restricted AI usage (preview only)
- Subscription-focused monetization
- Professional positioning

## 🔧 Platform Integration

### Static Site Generators

#### Next.js
```bash
contentmark generate --output public/.well-known/contentmark.json
# File automatically served at /.well-known/contentmark.json
```

#### Hugo
```bash
contentmark generate --output static/.well-known/contentmark.json
# Add to config: staticDir = "static"
```

#### Jekyll
```bash
contentmark generate --output .well-known/contentmark.json
# Add to _config.yml: include: [".well-known"]
```

#### Gatsby
```bash
contentmark generate --output static/.well-known/contentmark.json
# File copied to public during build
```

### Content Management Systems

#### WordPress
```bash
# Generate manifest
contentmark generate --type blog --output contentmark.json

# Upload to wp-content/ directory
# Add to functions.php:
# wp_head action to include <link> element
```

#### Ghost
```bash
# Generate manifest  
contentmark generate --type blog --output contentmark.json

# Upload to content/files/
# Add link element to default.hbs template
```

### Hosting Platforms

#### Netlify
```bash
contentmark generate --output public/.well-known/contentmark.json

# Optional: Add to netlify.toml
# [[headers]]
#   for = "/.well-known/contentmark.json"  
#   [headers.values]
#     Content-Type = "application/json"
```

#### Vercel
```bash
contentmark generate --output public/.well-known/contentmark.json
# Automatically served with correct headers
```

#### GitHub Pages
```bash
contentmark init
git add .well-known/contentmark.json
git commit -m "Add ContentMark support"
git push
```

## 🤖 CI/CD Integration

### GitHub Actions
```yaml
name: Validate ContentMark
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate ContentMark
        run: npx @contentmark/cli validate --json
```

### GitLab CI
```yaml
validate_contentmark:
  stage: test
  script:
    - npx @contentmark/cli validate --json .well-known/contentmark.json
  only:
    - merge_requests
    - main
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
if [ -f ".well-known/contentmark.json" ]; then
    npx @contentmark/cli validate .well-known/contentmark.json || exit 1
fi
```

## 📊 JSON Output

Perfect for automation and monitoring:

```bash
contentmark validate --json .well-known/contentmark.json
```

```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Attribution required but no attributionTemplate provided"
  ],
  "suggestions": [
    "Consider adding monetization options to benefit from AI traffic"
  ],
  "manifest": {
    "version": "1.0.0",
    "siteName": "Example Site",
    "defaultUsagePolicy": { ... }
  }
}
```

**Exit Codes:**
- `0` - Success/Valid
- `1` - Validation failed  
- `2` - Network error
- `3` - Invalid arguments

## 🛠️ Advanced Usage

### Custom Schema Validation
```bash
# Use custom schema URL
CONTENTMARK_SCHEMA_URL="https://my-org.com/schema.json" contentmark validate
```

### Batch Processing
```bash
# Validate multiple files
find . -name "contentmark.json" -exec contentmark validate {} \;

# Check multiple websites
for site in site1.com site2.com site3.com; do
  contentmark check $site
done
```

### Configuration
Set environment variables for customization:

```bash
export CONTENTMARK_TIMEOUT=30000        # Network timeout (ms)
export CONTENTMARK_SCHEMA_URL=https://... # Custom schema URL
```

## 🧪 Testing Your Implementation

### Step-by-Step Validation
```bash
# 1. Generate manifest
contentmark generate --interactive

# 2. Validate locally
contentmark validate .well-known/contentmark.json --verbose

# 3. Upload to your website
# (copy to your web server)

# 4. Test discovery
contentmark check yourdomain.com --discovery

# 5. Verify in CI/CD
contentmark validate --url https://yourdomain.com/.well-known/contentmark.json --json
```

### Common Issues & Solutions

#### File Not Found
```bash
# Ensure correct location
ls -la .well-known/contentmark.json

# Check web server configuration
curl https://yourdomain.com/.well-known/contentmark.json
```

#### Validation Errors
```bash
# Get detailed error information
contentmark validate --verbose

# Check JSON syntax
cat .well-known/contentmark.json | jq .
```

#### Network Issues
```bash
# Increase timeout for slow sites
CONTENTMARK_TIMEOUT=30000 contentmark check slow-site.com
```

## 🏗️ Development

### Building from Source
```bash
git clone https://github.com/contentmark/cli.git
cd cli
npm install
npm run build
npm link  # Makes 'contentmark' available globally
```

### Running Tests
```bash
npm test              # Run test suite
npm run test:watch    # Watch mode for development
npm run lint          # Code quality checks
npm run type-check    # TypeScript validation
```

### Contributing
We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run tests: `npm test`
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Submit pull request

## 📚 Resources

### ContentMark Protocol
- **Website**: https://contentmark.org
- **Documentation**: https://contentmark.org/docs
- **Specification**: https://github.com/contentmark/spec
- **Examples**: https://github.com/contentmark/spec/tree/main/examples

### Community
- **Discussions**: [GitHub Discussions](https://github.com/contentmark/spec/discussions)
- **Issues**: [Report bugs](https://github.com/contentmark/cli/issues)
- **Discord**: [Join community](https://discord.gg/contentmark) *(coming soon)*

### Support
- **Documentation**: [Getting Started Guide](https://contentmark.org/docs/getting-started)
- **Best Practices**: [Implementation Guide](https://contentmark.org/docs/best-practices)
- **FAQ**: [Common Questions](https://contentmark.org/docs/faq)

## 📈 Usage Examples

### Personal Blog
```bash
# Quick setup for personal blog
contentmark init --type blog
# Edit .well-known/contentmark.json with your details
# Upload to your website
contentmark check yourblog.com
```

### Professional Services
```bash
# Business-focused setup
contentmark generate --interactive
# Configure consultation booking and services
# Optimize for AI discovery
contentmark validate --verbose
```

### Premium Content
```bash
# Subscription/paywall content
contentmark generate --type premium
# Configure access controls and pricing
# Test with restricted policies
contentmark validate .well-known/contentmark.json
```

## 🔒 Security

### Secure Practices
- Always validate manifests before deployment
- Use HTTPS for all ContentMark URLs
- Regularly update CLI to latest version
- Monitor for policy compliance

### Reporting Security Issues
Please report security vulnerabilities to: security@contentmark.org

## 📄 License

MIT © ContentMark Alliance

See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js/) for CLI framework
- Validation powered by [Ajv](https://ajv.js.org/) JSON Schema validator
- Styled with [Chalk](https://github.com/chalk/chalk) for beautiful terminal output
- Thanks to all [contributors](https://github.com/contentmark/cli/contributors)

---

**Ready to take control of your AI-content relationship?**

```bash
npm install -g @contentmark/cli
contentmark generate --interactive
```

*Join thousands of creators using ContentMark to monetize and control AI usage of their content.*

[![Follow on Twitter](https://img.shields.io/twitter/follow/contentmark?style=social)](https://twitter.com/contentmarkai)
[![Star on GitHub](https://img.shields.io/github/stars/contentmark/cli?style=social)](https://github.com/contentmark/cli)
