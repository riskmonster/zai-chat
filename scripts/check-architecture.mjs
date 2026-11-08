import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const eslintCli = path.join(rootDir, 'node_modules', 'eslint', 'bin', 'eslint.js')
const sourceDir = path.join(rootDir, 'src')
const filename = 'src/features/chat/model/__architecture_probe__.ts'
const source = "import { chatApi } from '@/features/chat/api/chat-api'\nexport { chatApi }\n"
const result = spawnSync(
  process.execPath,
  [eslintCli, '--stdin', '--stdin-filename', filename, '--format', 'json'],
  {
    cwd: rootDir,
    env: {
      ...process.env,
      ESLINT_USE_FLAT_CONFIG: 'false',
    },
    input: source,
    encoding: 'utf8',
  },
)

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

if (result.status === 0) {
  console.error('Architecture probe unexpectedly passed ESLint.')
  process.exit(1)
}

let output
try {
  output = JSON.parse(result.stdout)
} catch {
  console.error(result.stderr || result.stdout)
  process.exit(1)
}

const rules = new Set(output.flatMap((file) => file.messages.map((message) => message.ruleId)))
if (
  !rules.has('@typescript-eslint/no-restricted-imports') &&
  !rules.has('import/no-restricted-paths')
) {
  console.error('Architecture probe failed for an unrelated reason.')
  console.error(result.stdout || result.stderr)
  process.exit(1)
}

const allowedShellFiles = new Set(['src/shared/ui/shell.ts', 'src/app.ts'])
const requiredViewPairs = new Map([
  ['src/features/chat/ui/chat-composer/ChatComposer.tsx', 'src/features/chat/ui/chat-composer'],
  [
    'src/features/chat/ui/chat-message-list/ChatMessageList.tsx',
    'src/features/chat/ui/chat-message-list',
  ],
  [
    'src/features/chat/ui/conversation-list/ConversationList.tsx',
    'src/features/chat/ui/conversation-list',
  ],
  [
    'src/features/chat/ui/chat-empty-state/ChatEmptyState.tsx',
    'src/features/chat/ui/chat-empty-state',
  ],
])
const forbiddenTsxReactHooks = new Set([
  'useState',
  'useEffect',
  'useReducer',
  'useRef',
  'useMemo',
  'useCallback',
  'useLayoutEffect',
  'useImperativeHandle',
])
const forbiddenTsxImports = [
  /from\s+['"]@tarojs\/taro['"]/,
  /from\s+['"]@\/features\/[^'"]+\/(?:api|application|store)\//,
]
const violations = []

for (const file of listSourceFiles(sourceDir)) {
  const relative = path.relative(rootDir, file).replaceAll('\\', '/')
  const content = readFileSync(file, 'utf8')

  if (
    !allowedShellFiles.has(relative) &&
    /from\s+['"](?:@tarojs\/components|@taroify\/)/.test(content)
  ) {
    violations.push(`${relative}: import UI packages through @/shared/ui/shell`)
  }

  if (relative.endsWith('.tsx')) {
    const reactImports = [...content.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]react['"]/g)]
    const importedHooks = reactImports.flatMap((match) =>
      (match[1] ?? '')
        .split(',')
        .map((name) => name.trim().split(/\s+as\s+/)[0])
        .filter((name) => forbiddenTsxReactHooks.has(name)),
    )
    if (importedHooks.length > 0) {
      violations.push(`${relative}: move React hooks into use同名Hook.ts`)
    }

    if (forbiddenTsxImports.some((pattern) => pattern.test(content))) {
      violations.push(`${relative}: View must not import Taro APIs or feature internals`)
    }

    const componentDirectory = requiredViewPairs.get(relative)
    if (componentDirectory) {
      const componentName = path.basename(relative, '.tsx')
      for (const requiredFile of [`use${componentName}.ts`, `${componentName}.model.ts`]) {
        if (!existsSync(path.join(rootDir, componentDirectory, requiredFile))) {
          violations.push(`${relative}: missing ${requiredFile}`)
        }
      }
    }
  }
}

const injectedViewViolation = findViewViolations(
  'src/pages/example/index.tsx',
  "import { useState } from 'react'\nimport { View } from '@tarojs/components'\n",
)
if (injectedViewViolation.length < 2) {
  violations.push('View architecture probe did not detect injected violations')
}

if (violations.length > 0) {
  console.error(violations.join('\n'))
  process.exit(1)
}

console.log('Architecture boundary and View orchestration probes passed')

function listSourceFiles(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name))
    .map((entry) => path.join(entry.parentPath, entry.name))
}

function findViewViolations(relative, content) {
  const found = []
  if (!allowedShellFiles.has(relative) && /from\s+['"]@tarojs\/components/.test(content)) {
    found.push('direct-ui-import')
  }
  if (/import\s*\{[^}]*useState[^}]*\}\s*from\s*['"]react['"]/.test(content)) {
    found.push('react-hook-in-view')
  }
  return found
}
