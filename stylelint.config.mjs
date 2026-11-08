/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: ['dist/**', 'node_modules/**', 'coverage/**'],
  rules: {
    'alpha-value-notation': 'number',
    'color-function-alias-notation': 'with-alpha',
    'color-function-notation': 'legacy',
    'selector-class-pattern': [
      '^[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+-?)+)?(?:--[a-z0-9-]+)?$',
      {
        resolveNestedSelectors: true,
      },
    ],
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['page'],
      },
    ],
  },
}
