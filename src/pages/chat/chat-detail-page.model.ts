import type { ChatDetailModel } from '@/features/chat/public'

interface ChatDetailPageModel extends ChatDetailModel {
  initialPrompt: string
  composerError: string | undefined
}

interface ChatDetailPageActions {
  reloadMessages: () => void
  retryGeneration: () => void
  sendText: (text: string) => Promise<boolean>
  stopGeneration: () => void
}

export interface ChatDetailPageController {
  model: ChatDetailPageModel
  actions: ChatDetailPageActions
}

export const CHAT_DETAIL_PAGE_COPY = {
  reload: '重新加载',
} as const

export function normalizeRouteParam(value?: string): string {
  if (value === undefined || value.length === 0) {
    return ''
  }
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
