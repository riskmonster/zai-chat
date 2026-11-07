import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const executable = path.join(
  rootDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'eslint.cmd' : 'eslint',
)

const result = spawnSync(executable, ['src', 'tests', '--ext', '.ts,.tsx'], {
  cwd: rootDir,
  env: {
    ...process.env,
    ESLINT_USE_FLAT_CONFIG: 'false',
  },
  shell: process.platform === 'win32',
  stdio: 'inherit',
})

if (result.error) {
  console.error(result.error)
}

process.exit(result.status ?? 1)
