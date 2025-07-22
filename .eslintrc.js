module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    // Basic JavaScript rules
    'no-console': 'off', // CLI tool needs console output
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
    'prefer-template': 'error',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'eol-last': 'error'
  },
  overrides: [
    {
      // TypeScript files - use basic parsing without TypeScript-specific rules
      files: ['**/*.ts'],
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          // Allow TypeScript syntax
        }
      },
      rules: {
        // Disable rules that don't work well with TypeScript syntax
        'no-undef': 'off', // TypeScript handles this
        'no-unused-vars': ['error', { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }]
      }
    },
    {
      // Test files
      files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off',
        'max-len': 'off'
      }
    }
  ],
  ignorePatterns: [
    'dist/',
    'build/',
    'coverage/',
    'node_modules/',
    '*.d.ts'
  ]
};
