import type { ChatRunPhase } from '../../model/chat-types'

export interface ChatComposerProps {
  status: ChatRunPhase
  initialDraft?: string | undefined
  errorMessage?: string | undefined
  onSubmit: (text: string) => Promise<boolean> | boolean
  onStop: () => void
}

export interface ChatComposerInputEvent {
  detail: {
    value: string
  }
}

export interface ChatComposerState {
  draft: string
  isRunning: boolean
  isStopping: boolean
  isSubmitting: boolean
  canSubmit: boolean
  primaryLabel: string
}

interface ChatComposerActions {
  handleInput: (event: ChatComposerInputEvent) => void
  handlePrimaryAction: () => void
}

export type ChatComposerController = ChatComposerState & ChatComposerActions

export function getChatComposerLabels(
  status: ChatRunPhase,
  waitingForSubmit: boolean,
): Pick<ChatComposerState, 'isRunning' | 'isStopping' | 'isSubmitting' | 'primaryLabel'> {
  const isRunning = status === 'queued' || status === 'streaming'
  const isStopping = status === 'stopping'
  const isSubmitting = waitingForSubmit || status === 'submitting'

  let primaryLabel = '发送'
  if (isRunning) {
    primaryLabel = '停止'
  } else if (isStopping) {
    primaryLabel = '停止中'
  } else if (isSubmitting) {
    primaryLabel = '发送中'
  }

  return {
    isRunning,
    isStopping,
    isSubmitting,
    primaryLabel,
  }
}
