import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const allowedTargets = new Set([
  'dist/weapp',
  'dist/h5',
  '.cache',
  '.temp',
  '.swc',
  '.pnpm-store',
  'node_modules/.cache',
  'node_modules/.vite',
])
const requestedTargets = process.argv.slice(2)

if (requestedTargets.length === 0) {
  console.error('No clean target provided.')
  process.exit(1)
}

for (const target of requestedTargets) {
  const normalized = target.replaceAll('\\', '/').replace(/\/$/, '')
  if (!allowedTargets.has(normalized)) {
    console.error(`Refusing to clean unapproved path: ${target}`)
    process.exit(1)
  }

  const absoluteTarget = path.resolve(rootDir, normalized)
  if (
    absoluteTarget === rootDir
    || !absoluteTarget.startsWith(`${rootDir}${path.sep}`)
  ) {
    console.error(`Refusing to clean path outside workspace: ${absoluteTarget}`)
    process.exit(1)
  }

  if (existsSync(absoluteTarget)) {
    rmSync(absoluteTarget, { recursive: true, force: true })
    console.log(`Removed ${normalized}`)
  }
}
