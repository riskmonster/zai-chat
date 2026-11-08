const namingRules = require('../.eslint-naming-convention.cjs')

const testNamingRules = namingRules.map((rule) => {
  if (rule.selector === 'variable' && Array.isArray(rule.format) && rule.types === undefined) {
    return {
      ...rule,
      format: [...rule.format, 'StrictPascalCase'],
    }
  }

  if (rule.selector === 'objectLiteralProperty' && Array.isArray(rule.format)) {
    return {
      ...rule,
      format: [...rule.format, 'StrictPascalCase'],
    }
  }

  return rule
})

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:@vitest/legacy-recommended',
    'plugin:testing-library/react',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectService: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ['import', 'react', '@typescript-eslint', '@vitest', 'testing-library'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
    react: {
      version: '18.3',
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
    'react/function-component-definition': [
      'error',
      {
        namedComponents: ['function-declaration', 'arrow-function'],
        unnamedComponents: ['function-expression', 'arrow-function'],
      },
    ],
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
    '@typescript-eslint/naming-convention': ['error', ...testNamingRules],
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
    '@vitest/max-nested-describe': [
      'error',
      {
        max: 3,
      },
    ],
    'testing-library/no-container': 'error',
    'testing-library/no-node-access': 'error',
    'testing-library/prefer-screen-queries': 'error',
  },
  ignorePatterns: ['node_modules/**', '.cache/**'],
}
