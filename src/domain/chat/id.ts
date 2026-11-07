let fallbackCounter = 0

export function createClientMessageId(): string {
  const cryptoApi = globalThis.crypto
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID()
  }

  fallbackCounter += 1
  const timestamp = Date.now().toString(16).padStart(12, '0')
  const random = Array.from(
    { length: 16 },
    () => Math.floor(Math.random() * 16).toString(16),
  ).join('')
  const counter = (fallbackCounter % 0x10000).toString(16).padStart(4, '0')
  const hex = `${timestamp}${random}${counter}`
  const variant = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16)

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-')
}
