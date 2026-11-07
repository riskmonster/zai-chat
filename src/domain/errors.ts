export type ErrorCode =
  | 'AUTH_EXPIRED'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED'
  | 'REQUEST_FAILED'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR'

export interface AppErrorOptions {
  code: string
  message: string
  requestId?: string
  statusCode?: number
  retryAfterSeconds?: number
  retryable?: boolean
}

export class AppError extends Error {
  readonly code: string
  readonly requestId?: string
  readonly statusCode?: number
  readonly retryAfterSeconds?: number
  readonly retryable: boolean

  constructor({
    code,
    message,
    requestId,
    statusCode,
    retryAfterSeconds,
    retryable = false,
  }: AppErrorOptions) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.requestId = requestId
    this.statusCode = statusCode
    this.retryAfterSeconds = retryAfterSeconds
    this.retryable = retryable
  }
}

export function toAppError(
  error: unknown,
  fallbackCode: ErrorCode = 'UNKNOWN_ERROR',
): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError({
      code: fallbackCode,
      message: error.message,
      retryable: fallbackCode === 'NETWORK_ERROR',
    })
  }

  return new AppError({
    code: fallbackCode,
    message: typeof error === 'string' ? error : '请求失败，请稍后重试',
  })
}
