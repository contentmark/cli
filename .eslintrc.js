module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  env: {
    node: true,
    es2020: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: null // Disable type-checking for faster CI
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    
    // General rules
    'no-console': 'off', // CLI tool needs console output
    'no-var': 'error',
    'prefer-const': 'error',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    
    // Disable base rule in favor of TypeScript version
    'no-unused-vars': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off'
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
