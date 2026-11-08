/** @type {import('prettier').Config} */
export default {
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  checkIgnorePragma: true,
  embeddedLanguageFormatting: 'auto',
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'strict',
  jsxSingleQuote: true,
  printWidth: 100,
  proseWrap: 'always',
  quoteProps: 'as-needed',
  semi: false,
  singleAttributePerLine: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
  overrides: [
    {
      files: ['*.md', '*.mdx'],
      options: {
        proseWrap: 'always',
      },
    },
    {
      files: ['*.{yml,yaml}'],
      options: {
        singleQuote: false,
      },
    },
  ],
}
