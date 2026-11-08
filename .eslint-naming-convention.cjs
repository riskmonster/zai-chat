module.exports = [
  {
    selector: 'default',
    format: ['strictCamelCase'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'forbid',
  },
  {
    selector: 'import',
    format: ['camelCase', 'PascalCase'],
  },
  {
    selector: 'variable',
    modifiers: ['destructured'],
    format: null,
  },
  {
    selector: 'variable',
    types: ['boolean'],
    format: ['StrictPascalCase'],
    prefix: ['is', 'has', 'can', 'should', 'did', 'will'],
  },
  {
    selector: 'variable',
    format: ['strictCamelCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'forbid',
  },
  {
    selector: 'function',
    filter: {
      regex: '^use',
      match: true,
    },
    format: ['strictCamelCase'],
    custom: {
      regex: '^use[A-Z][A-Za-z0-9]*$',
      match: true,
    },
  },
  {
    selector: 'function',
    filter: {
      regex: '^[A-Z]',
      match: true,
    },
    format: ['StrictPascalCase'],
  },
  {
    selector: 'function',
    format: ['strictCamelCase'],
    leadingUnderscore: 'forbid',
    trailingUnderscore: 'forbid',
  },
  {
    selector: 'parameter',
    format: ['strictCamelCase'],
    leadingUnderscore: 'allow',
    trailingUnderscore: 'forbid',
  },
  {
    selector: 'typeLike',
    format: ['StrictPascalCase'],
    custom: {
      regex: '^I[A-Z]',
      match: false,
    },
  },
  {
    selector: 'typeParameter',
    format: ['StrictPascalCase'],
  },
  {
    selector: 'enumMember',
    format: ['UPPER_CASE'],
  },
  {
    selector: 'objectLiteralProperty',
    modifiers: ['requiresQuotes'],
    format: null,
  },
  {
    selector: 'objectLiteralProperty',
    filter: {
      regex: '^(Accept|Authorization|Content-Type|Retry-After)$',
      match: true,
    },
    format: null,
  },
  {
    selector: 'objectLiteralProperty',
    format: ['strictCamelCase'],
    leadingUnderscore: 'forbid',
    trailingUnderscore: 'forbid',
  },
  {
    selector: 'typeMethod',
    filter: {
      regex: '^randomUUID$',
      match: true,
    },
    format: null,
  },
  {
    selector: 'typeProperty',
    filter: {
      regex: '^(NODE_ENV|TARO_ENV|TARO_APP_[A-Z0-9_]+)$',
      match: true,
    },
    format: null,
  },
  {
    selector: 'memberLike',
    modifiers: ['private'],
    format: ['strictCamelCase'],
    leadingUnderscore: 'forbid',
    trailingUnderscore: 'forbid',
  },
]
