# Changelog

All notable changes to ContentMark CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Configuration file support (.contentmarkrc.json)
- Plugin system for custom validators
- Additional output formats (YAML, TOML)
- VS Code extension integration

## [1.0.0] - 2025-07-22

### Added
- **Initial release** of ContentMark CLI
- **Validation command** with comprehensive schema checking
  - Local file validation
  - Remote URL validation
  - JSON output for CI/CD integration
  - Verbose mode with optimization suggestions
- **Generation command** with template system
  - Interactive generation with guided prompts
  - Pre-built templates (blog, business, premium)
  - Custom output paths and overwrite protection
- **Check command** for website ContentMark discovery
  - Multiple discovery methods (.well-known, HTML links, HTTP headers)
  - Manifest analysis and policy summary
  - Discovery method reporting
- **Init command** for project initialization
  - Creates .well-known directory structure
  - Template selection and customization guidance
- **Info command** with protocol information and resources
- **Comprehensive error handling** with helpful messages
- **Professional CLI experience** with colored output and progress indicators
- **TypeScript support** with full type safety
- **Jest testing framework** with comprehensive test coverage
- **CI/CD integration** with GitHub Actions
- **Multiple platform support** (Windows, macOS, Linux)
- **Node.js 16+ compatibility**

### Technical Features
- JSON Schema validation using Ajv
- Network resilience with timeout handling
- Batch processing capabilities
- Custom schema URL support
- Environment variable configuration
- Exit codes for automation workflows

### Documentation
- Complete README with installation and usage guides
- Platform integration examples (Next.js, WordPress, Netlify, etc.)
- CI/CD integration examples (GitHub Actions, GitLab CI)
- Contributing guidelines
- Comprehensive API documentation

### Templates
- **Blog template** - Personal blogs and content sites
  - Public access with tip jar monetization
  - Allows summaries and quotes, blocks training
  - Basic attribution requirements
- **Business template** - Professional services
  - Enhanced AI visibility optimization
  - Consultation booking integration
  - Multiple service offerings
  - Professional attribution templates
- **Premium template** - Subscription/paid content
  - Paywall access controls
  - Restricted AI usage (preview only)
  - Subscription-focused monetization
  - Professional positioning

## [0.9.0] - 2025-07-15 (Beta)

### Added
- Beta release for community testing
- Core validation functionality
- Basic template generation
- Website checking capabilities

### Known Issues
- Windows path handling edge cases
- Network timeout inconsistencies on slow connections
- Limited error recovery for malformed JSON

### Fixed in 1.0.0
- All known beta issues resolved
- Enhanced error handling
- Improved cross-platform compatibility

## Development Milestones

### Pre-1.0.0 Development
- **June 2025** - Project initiated
- **July 2025** - Core architecture designed
- **July 2025** - Validation engine completed
- **July 2025** - Interactive generation implemented
- **July 2025** - Website checking functionality added
- **July 2025** - Comprehensive testing suite
- **July 2025** - Documentation and examples
- **July 2025** - v1.0.0 release

## Version Support

| Version | Status | Node.js Support | Maintenance |
|---------|--------|----------------|-------------|
| 1.x     | Active | 16.x, 18.x, 20.x | ✅ Full support |
| 0.9.x   | Beta   | 16.x, 18.x, 20.x | ⚠️ Beta only |

## Migration Guides

### From Beta (0.9.x) to 1.0.0

**Breaking Changes:**
- None - beta API is fully compatible with 1.0.0

**New Features:**
- Interactive generation mode
- Enhanced error messages
- CI/CD integration improvements

**Recommended Actions:**
```bash
# Update to latest version
npm update -g @contentmark/cli

# Re-validate existing manifests
contentmark validate .well-known/contentmark.json --verbose

# Regenerate with new templates if desired
contentmark generate --interactive
```

## Roadmap

### 1.1.0 (Q3 2025)
- Configuration file support
- Plugin system for custom validators
- Performance optimizations
- Additional platform integrations

### 1.2.0 (Q4 2025)
- Batch processing improvements
- Advanced reporting features
- VS Code extension integration
- Community-requested features

### 2.0.0 (2026)
- Major architecture improvements
- Breaking API changes (if needed)
- Advanced AI platform integrations
- Enterprise features

## Security Updates

We take security seriously. Security updates will be released as patch versions and documented here.

### Security Policy
- **Report vulnerabilities** to security@contentmark.org
- **Response time** within 48 hours for critical issues
- **Disclosure timeline** following responsible disclosure practices

## Community Contributions

Special thanks to community contributors:

### 1.0.0 Contributors
- ContentMark Alliance - Initial development and architecture
- Beta testers - Valuable feedback and issue reports
- Documentation reviewers - Clarity and accuracy improvements

### Recognition
Contributors are recognized in our [README](README.md#acknowledgments) and release notes.

## Technical Notes

### Dependencies
- **Commander.js** - CLI framework
- **Ajv** - JSON Schema validation
- **Chalk** - Terminal styling
- **Inquirer** - Interactive prompts
- **Ora** - Loading spinners
- **Node-fetch** - HTTP requests

### Build Process
- **TypeScript** compilation with strict checks
- **ESLint** code quality enforcement
- **Jest** testing with coverage reporting
- **GitHub Actions** automated CI/CD

### Performance Benchmarks
- **Validation** - <100ms for typical manifests
- **Generation** - <2s for interactive mode
- **Website checking** - <5s for most sites
- **Memory usage** - <50MB for typical operations

## Support

### Getting Help
- **Documentation** - https://contentmark.org/docs
- **GitHub Discussions** - Community support
- **Issues** - Bug reports and feature requests
- **Discord** - Real-time community chat *(coming soon)*

### Commercial Support
Enterprise support and custom implementation services available at: enterprise@contentmark.org

---

**Stay Updated:**
- ⭐ [Star the repository](https://github.com/contentmark/cli) for notifications
- 📢 [Follow releases](https://github.com/contentmark/cli/releases) for updates
- 💬 [Join discussions](https://github.com/contentmark/cli/discussions) for community

*Building the future of ethical AI-content interaction, one release at a time.* 🚀
