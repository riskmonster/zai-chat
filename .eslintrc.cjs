module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'taro/react',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectService: {
      allowDefaultProject: ['src/features/*/model/__architecture_probe__.ts'],
    },
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'array-callback-return': 'error',
    curly: ['error', 'all'],
    'default-case-last': 'error',
    eqeqeq: ['error', 'always'],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
    'no-alert': 'error',
    'no-console': 'error',
    'no-else-return': ['error', { allowElseIf: false }],
    'no-implicit-coercion': 'error',
    'no-lone-blocks': 'error',
    'no-nested-ternary': 'error',
    'no-param-reassign': ['error', { props: true }],
    'no-promise-executor-return': 'error',
    'no-return-assign': 'error',
    'no-throw-literal': 'error',
    'no-unneeded-ternary': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-warning-comments': [
      'error',
      {
        location: 'anywhere',
        terms: ['todo', 'fixme', 'xxx'],
      },
    ],
    'object-shorthand': ['error', 'always'],
    'prefer-const': 'error',
    'prefer-object-spread': 'error',
    'prefer-template': 'error',
    radix: 'error',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-no-useless-fragment': 'error',
    'react/self-closing-comp': 'error',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'function-expression',
      },
    ],
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      ...require('./.eslint-naming-convention.cjs'),
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/prefer-readonly': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': [
      'error',
      {
        allowDefaultCaseForExhaustiveSwitch: false,
        considerDefaultExhaustiveForUnions: true,
        requireDefaultForNonUnion: true,
      },
    ],
    'import/no-cycle': [
      'error',
      {
        maxDepth: 10,
      },
    ],
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/shared',
            from: './src/features',
          },
          {
            target: './src/shared',
            from: './src/pages',
          },
          {
            target: './src/features/chat/model',
            from: './src/generated',
          },
          {
            target: './src/features/chat/model',
            from: './src/shared/api',
          },
          {
            target: './src/features/chat/model',
            from: './src/features/chat/api',
          },
          {
            target: './src/features/chat/model',
            from: './src/features/chat/application',
          },
          {
            target: './src/features/chat/model',
            from: './src/features/chat/store',
          },
          {
            target: './src/features/chat/model',
            from: './src/features/chat/ui',
          },
          {
            target: './src/features/chat/api',
            from: './src/features/chat/store',
          },
          {
            target: './src/features/chat/api',
            from: './src/features/chat/application',
          },
          {
            target: './src/features/chat/api',
            from: './src/features/chat/ui',
          },
          {
            target: './src/features/chat/store',
            from: './src/features/chat/api',
          },
          {
            target: './src/features/chat/store',
            from: './src/features/chat/application',
          },
          {
            target: './src/features/chat/store',
            from: './src/features/chat/ui',
          },
          {
            target: './src/features/chat/application',
            from: './src/features/chat/ui',
          },
          {
            target: './src/features/chat/ui',
            from: './src/features/chat/api',
          },
          {
            target: './src/features/chat/ui',
            from: './src/features/chat/application',
          },
          {
            target: './src/features/chat/ui',
            from: './src/features/chat/store',
          },
          {
            target: './src/features/chat',
            from: './src/features/auth',
          },
          {
            target: './src/features/auth',
            from: './src/features/chat',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['config/**/*.ts', 'scripts/**/*.mjs'],
      env: {
        node: true,
      },
    },
    {
      files: ['src/features/*/model/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/generated/**',
                  '@/service/**',
                  '@/services/**',
                  '@/shared/api/**',
                  '@/store/**',
                  '@/pages/**',
                  '@/features/**',
                  'react',
                  'react/*',
                  'zustand',
                  'zustand/*',
                  '@tarojs/*',
                  '@taroify/*',
                ],
                message: 'Feature model must stay framework-free and transport-free.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/features/*/api/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/features/*/store/**',
                  '@/features/*/application/**',
                  '@/features/*/ui/**',
                  '@/pages/**',
                  'react',
                  'react/*',
                ],
                message: 'Feature API may depend on transport and its own model only.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/features/*/store/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/generated/**',
                  '@/service/**',
                  '@/services/**',
                  '@/shared/api/**',
                  '@/features/*/api/**',
                  '@/features/*/application/**',
                  '@/features/*/ui/**',
                  '@/pages/**',
                  'react',
                  'react/*',
                  '@tarojs/*',
                ],
                message: 'Feature store must contain synchronous state only.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/features/*/application/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/generated/**', '@/features/*/ui/**', '@/pages/**'],
                message: 'Feature application may orchestrate its API, model and store only.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/features/*/ui/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/generated/**',
                  '@/service/**',
                  '@/services/**',
                  '@/shared/api/**',
                  '@/features/*/api/**',
                  '@/features/*/application/**',
                  '@/features/*/store/**',
                  '@/pages/**',
                ],
                message: 'Feature UI must render ViewModels and use shared UI only.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/shared/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/features/**', '@/pages/**'],
                message: 'Shared code cannot depend on application or feature code.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/pages/**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: [
                  '@/generated/**',
                  '@/service/**',
                  '@/services/**',
                  '@/shared/api/**',
                  '@/features/*/api/**',
                  '@/features/*/application/**',
                  '@/features/*/model/**',
                  '@/features/*/store/**',
                  '@/features/*/ui/**',
                ],
                message: 'Pages must compose feature public APIs and shared UI only.',
              },
            ],
          },
        ],
      },
    },
  ],
  ignorePatterns: ['dist/**', 'coverage/**', 'node_modules/**', 'src/generated/**', '.cache/**'],
}
