module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking'
  ],
  env: {
    node: true,
    es2020: true,
    jest: true
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',

    // General JavaScript/TypeScript rules
    'no-console': 'off', // CLI tool needs console output
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
    'no-useless-concat': 'error',
    'prefer-template': 'error',

    // Code style
    'indent': ['error', 2, { 
      SwitchCase: 1,
      ignoredNodes: ['PropertyDefinition']
    }],
    'quotes': ['error', 'single', { 
      avoidEscape: true,
      allowTemplateLiterals: true
    }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'comma-spacing': ['error', { before: false, after: true }],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-blocks': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'max-len': ['warn', { 
      code: 100,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreComments: true
    }],

    // Function and variable naming
    'camelcase': ['error', { 
      properties: 'never',
      ignoreDestructuring: true,
      allow: ['^UNSAFE_']
    }],
    'new-cap': ['error', { 
      newIsCap: true,
      capIsNew: false
    }],

    // Error prevention
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-unused-expressions': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'error',
    'no-extra-boolean-cast': 'error',
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-inner-declarations': 'error',
    'no-invalid-regexp': 'error',
    'no-irregular-whitespace': 'error',
    'no-obj-calls': 'error',
    'no-sparse-arrays': 'error',
    'no-unexpected-multiline': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error',

    // Best practices
    'curly': ['error', 'all'],
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-fallthrough': 'error',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-octal': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': ['error', { props: false }],
    'no-proto': 'error',
    'no-redeclare': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unused-vars': 'off', // Handled by TypeScript rule
    'no-void': 'error',
    'no-with': 'error',
    'radix': 'error',
    'wrap-iife': ['error', 'any'],
    'yoda': 'error'
  },
  overrides: [
    {
      // Test files
      files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        'no-console': 'off',
        'max-len': 'off'
      }
    },
    {
      // CLI entry point
      files: ['src/cli.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-floating-promises': 'off'
      }
    },
    {
      // Configuration files
      files: [
        '*.config.js',
        '*.config.ts',
        '.eslintrc.js',
        'jest.config.js'
      ],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
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
