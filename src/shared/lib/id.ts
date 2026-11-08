let fallbackCounter = 0

export function createClientMessageId(): string {
  const cryptoApi: unknown = Reflect.get(globalThis, 'crypto')
  if (isRandomUuidProvider(cryptoApi)) {
    return cryptoApi.randomUUID()
  }

  fallbackCounter += 1
  const timestamp = Date.now().toString(16).padStart(12, '0')
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(
    '',
  )
  const counter = (fallbackCounter % 0x10000).toString(16).padStart(4, '0')
  const hex = `${timestamp}${random}${counter}`
  const variantSource = hex[16] ?? '0'
  const variant = ((Number.parseInt(variantSource, 16) & 0x3) | 0x8).toString(16)

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-')
}

function isRandomUuidProvider(value: unknown): value is { randomUUID: () => string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'randomUUID' in value &&
    typeof value.randomUUID === 'function'
  )
}
