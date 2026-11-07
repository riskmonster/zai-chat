export interface ChatRunEventBase<T extends string, D> {
  sequence: number
  type: T
  runId: string
  messageId?: string
  data: D
}

export type ChatRunEvent =
  | ChatRunEventBase<'meta', {
    messageId: string
    modelAlias: string
    requestId: string
  }>
  | ChatRunEventBase<'delta', { text: string }>
  | ChatRunEventBase<'usage', {
    inputTokens: number
    outputTokens: number
  }>
  | ChatRunEventBase<'done', {
    status: 'completed' | 'cancelled' | 'failed'
    completedAt: string
  }>
  | ChatRunEventBase<'error', {
    code: string
    message: string
    retryable: boolean
  }>
  | ChatRunEventBase<'heartbeat', { serverTime: string }>
