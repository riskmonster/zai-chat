import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const testsDir = path.join(rootDir, 'tests')

function versionFrom(baseDir, packageName) {
  const packageJsonPath = path.join(
    baseDir,
    'node_modules',
    ...packageName.split('/'),
    'package.json',
  )
  return JSON.parse(readFileSync(packageJsonPath, 'utf8')).version
}

const versions = {
  node: process.versions.node,
  taroCli: versionFrom(rootDir, '@tarojs/cli'),
  viteBuild: versionFrom(rootDir, 'vite'),
  viteReact: versionFrom(rootDir, '@vitejs/plugin-react'),
  vitest: versionFrom(testsDir, 'vitest'),
  viteTest: versionFrom(testsDir, 'vite'),
}

assert.equal(versions.taroCli, '4.3.2')
assert.equal(versions.viteBuild, '4.5.14')
assert.equal(versions.viteReact, '4.7.0')
assert.equal(versions.vitest, '5.1.0')
assert.equal(versions.viteTest, '8.3.6')

console.log(JSON.stringify(versions, null, 2))
