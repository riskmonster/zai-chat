import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const openapi = read('docs/api/openapi.yaml')
const generatedRuns = read('src/generated/openapi/runs.ts')
const generatedAuth = read('src/generated/openapi/auth.ts')

for (const operationId of [
  'wxLogin',
  'refreshAuthSession',
  'logout',
  'getCurrentUser',
  'listConversations',
  'createConversation',
  'getConversation',
  'updateConversation',
  'deleteConversation',
  'listMessages',
  'submitMessage',
  'getRun',
  'streamRunEvents',
  'cancelRun',
  'retryRun',
  'listPersistedMessages',
  'persistMessage',
]) {
  assert.match(
    openapi,
    new RegExp(`operationId: ${operationId}\\b`),
    `Missing operationId: ${operationId}`,
  )
}

assert.match(openapi, /x-codegen-exclude: true/)
assert.match(openapi, /text\/event-stream/)
assert.match(generatedRuns, /@\/shared\/api\/openapi-request/)
assert.doesNotMatch(generatedRuns, /runsRunIdEventsUsingGet/)
assert.match(generatedAuth, /AuthSessionResponse/)

console.log('API contract check passed')
