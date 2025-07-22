# Contributing to ContentMark CLI

Thank you for your interest in contributing to ContentMark CLI! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Check the FAQ** in the main documentation
3. **Test with the latest version** of the CLI

When creating an issue, include:

- **Clear title** describing the problem
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (OS, Node.js version, CLI version)
- **Sample files** or commands that demonstrate the issue

**Issue Templates:**
- 🐛 **Bug Report** - Something isn't working correctly
- 💡 **Feature Request** - Suggest a new feature or improvement
- 📚 **Documentation** - Improvements to documentation
- ❓ **Question** - Ask for help or clarification

### Suggesting Features

We welcome feature suggestions! Before proposing:

1. **Check the roadmap** in GitHub Projects
2. **Search existing feature requests**
3. **Consider the scope** - does it align with ContentMark CLI's purpose?

Good feature requests include:
- **Use case description** - why is this needed?
- **Proposed solution** - how should it work?
- **Alternatives considered** - what other approaches exist?
- **Implementation ideas** - technical suggestions welcome

## 🛠️ Development Setup

### Prerequisites

- **Node.js 16+** (we test on 16, 18, 20)
- **npm 7+** 
- **Git**

### Local Development

1. **Fork and clone** the repository:
```bash
git clone https://github.com/yourusername/cli.git
cd cli
git remote add upstream https://github.com/contentmark/cli.git
```

2. **Install dependencies**:
```bash
npm install
```

3. **Build the project**:
```bash
npm run build
```

4. **Link for local testing**:
```bash
npm link
contentmark --version  # Should show your local version
```

5. **Run tests**:
```bash
npm test
npm run test:watch  # Watch mode for development
```

### Development Workflow

1. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** with tests
3. **Run the full test suite**:
```bash
npm run lint
npm run type-check
npm test
npm run build
```

4. **Test the CLI manually**:
```bash
contentmark validate test-files/valid.json
contentmark generate --type blog --output test.json
contentmark check contentmark.org
```

5. **Commit with conventional commits**:
```bash
git commit -m "feat: add new validation rule for X"
git commit -m "fix: resolve issue with URL validation"
git commit -m "docs: update README examples"
```

## 📋 Code Standards

### TypeScript Guidelines

- **Use strict TypeScript** - enable all strict checks
- **Explicit types** for public APIs and complex logic
- **Avoid `any`** - use proper typing or `unknown`
- **Document complex functions** with JSDoc comments

```typescript
/**
 * Validates a ContentMark manifest against the schema
 * @param content - JSON string to validate
 * @returns Promise with validation results
 */
async validate(content: string): Promise<ValidationResult> {
  // Implementation
}
```

### Code Style

We use ESLint and Prettier for consistent formatting:

```bash
npm run lint       # Check for issues
npm run lint:fix   # Auto-fix issues
```

**Key conventions:**
- **2 spaces** for indentation
- **Single quotes** for strings
- **Trailing commas** in multi-line structures
- **Semicolons** required
- **Max line length** 100 characters

### Testing Guidelines

- **Write tests** for all new functionality
- **Update tests** when changing existing code
- **Test edge cases** and error conditions
- **Use descriptive test names**

```typescript
describe('ContentMarkValidator', () => {
  describe('validate', () => {
    it('should reject manifests with invalid version format', async () => {
      // Test implementation
    });

    it('should provide helpful suggestions for basic manifests', async () => {
      // Test implementation
    });
  });
});
```

**Test Categories:**
- **Unit tests** - Test individual functions/classes
- **Integration tests** - Test CLI commands end-to-end
- **Network tests** - Test URL validation and checking

### Documentation Standards

- **Update README** for new features
- **Add JSDoc comments** for public APIs
- **Include examples** in documentation
- **Test documentation** examples to ensure they work

## 🏗️ Architecture Guidelines

### File Organization

```
src/
├── cli.ts           # Main CLI entry point
├── commands/        # Individual command implementations
├── lib/            # Shared utilities and helpers
├── types/          # TypeScript type definitions
└── __tests__/      # Co-located tests
```

### Adding New Commands

1. **Create command file** in `src/commands/`
2. **Add to CLI** in `src/cli.ts`
3. **Write tests** in `src/commands/__tests__/`
4. **Update documentation**

Example command structure:
```typescript
export interface CommandOptions {
  // Command-specific options
}

export async function commandHandler(
  args: string[],
  options: CommandOptions
): Promise<void> {
  // Implementation
}
```

### Error Handling

- **Use proper exit codes** (0=success, 1=error, 2=network, 3=usage)
- **Provide helpful error messages** with context
- **Log errors consistently** using chalk for coloring
- **Handle network timeouts** and connection issues gracefully

### Adding Dependencies

- **Justify new dependencies** - explain why existing solutions don't work
- **Prefer smaller packages** over large frameworks
- **Check security** with `npm audit`
- **Update package.json** with proper version constraints

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage

# Specific test file
npm test validator.test.ts
```

### Writing Good Tests

```typescript
describe('feature being tested', () => {
  beforeEach(() => {
    // Setup for each test
  });

  it('should handle the happy path', () => {
    // Test normal usage
  });

  it('should handle edge case X', () => {
    // Test edge cases
  });

  it('should throw error for invalid input Y', () => {
    // Test error conditions
  });
});
```

### Test Utilities

Use the shared test utilities in `tests/setup.ts`:

```typescript
import { createMockManifest, createTestServer } from '../tests/setup';

const manifest = createMockManifest({
  siteName: 'Test Site',
  canSummarize: true
});
```

## 📦 Release Process

### Version Management

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (0.1.0) - New features, backwards compatible
- **PATCH** (0.0.1) - Bug fixes, backwards compatible

### Release Checklist

1. **Update CHANGELOG.md** with new features and fixes
2. **Run full test suite** and ensure all tests pass
3. **Update version** in package.json
4. **Create release PR** with version bump
5. **Tag release** after merge to main
6. **GitHub Actions** will automatically publish to NPM

### Changelog Format

```markdown
## [1.2.0] - 2025-07-22

### Added
- New interactive generation mode
- Support for custom schema URLs

### Changed
- Improved error messages for validation
- Updated dependencies

### Fixed
- URL validation for edge cases
- Memory leak in batch processing

### Deprecated
- Old command syntax (will be removed in 2.0.0)
```

## 🎯 Contribution Areas

### High Priority
- [ ] **Windows compatibility** testing and fixes
- [ ] **Performance optimization** for large manifests
- [ ] **Plugin system** for custom validators
- [ ] **Batch processing** improvements

### Medium Priority
- [ ] **Config file support** (.contentmarkrc.json)
- [ ] **Additional output formats** (YAML, TOML)
- [ ] **Integration examples** for more platforms
- [ ] **Improved error recovery**

### Documentation
- [ ] **Video tutorials** for CLI usage
- [ ] **Platform-specific guides** expansion
- [ ] **Migration guides** from other tools
- [ ] **API documentation** for library usage

### Community
- [ ] **Discord bot** for CLI support
- [ ] **VS Code extension** integration
- [ ] **GitHub App** for automatic validation
- [ ] **Slack integration** for teams

## 🏆 Recognition

Contributors are recognized in several ways:

- **README credits** for significant contributions
- **Release notes** mention for features and fixes
- **GitHub contributors** page
- **Special thanks** in major releases

We follow the [All Contributors](https://allcontributors.org/) specification.

## 📞 Getting Help

### Development Questions
- **GitHub Discussions** - [Ask in Q&A category](https://github.com/contentmark/cli/discussions)
- **Discord** - Join our [developer channel](https://discord.gg/contentmark) *(coming soon)*

### Code Review
- **Request reviews** from maintainers
- **Be responsive** to feedback
- **Ask questions** if review comments are unclear

### Maintainer Contact
- **@username** - Lead maintainer
- **@username** - Core contributor
- **team@contentmark.org** - General inquiries

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](https://github.com/contentmark/spec/blob/main/CODE_OF_CONDUCT.md).

### Our Standards

**Positive behaviors:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behaviors:**
- Harassment, discrimination, or trolling
- Publishing private information without permission
- Other conduct inappropriate in a professional setting

## 🙏 Thank You

Every contribution helps make ContentMark CLI better for everyone. Whether you're fixing a typo, adding a feature, or helping with documentation - your effort is appreciated!

---

**Ready to contribute?** 

1. Check our [good first issues](https://github.com/contentmark/cli/labels/good%20first%20issue)
2. Join the [discussion](https://github.com/contentmark/cli/discussions)
3. Fork the repo and start coding!

*Let's build the future of ethical AI-content interaction together.* 🚀
