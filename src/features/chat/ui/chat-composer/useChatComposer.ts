import { useRef, useState } from 'react'

import {
  getChatComposerLabels,
  type ChatComposerController,
  type ChatComposerInputEvent,
  type ChatComposerProps,
} from './ChatComposer.model'

export function useChatComposer({
  status,
  initialDraft = '',
  onSubmit,
  onStop,
}: ChatComposerProps): ChatComposerController {
  const [draft, setDraft] = useState(initialDraft)
  const [isWaitingForSubmit, setIsWaitingForSubmit] = useState(false)
  const submittingRef = useRef(false)
  const labels = getChatComposerLabels(status, isWaitingForSubmit)
  const canSubmit =
    !labels.isRunning && !labels.isStopping && !labels.isSubmitting && draft.trim().length > 0

  const submit = async () => {
    if (submittingRef.current || !canSubmit) {
      return
    }

    const content = draft.trim()
    submittingRef.current = true
    setIsWaitingForSubmit(true)
    try {
      const didAccept = await onSubmit(content)
      if (didAccept) {
        setDraft('')
      }
    } finally {
      submittingRef.current = false
      setIsWaitingForSubmit(false)
    }
  }

  const handleInput = (event: ChatComposerInputEvent) => {
    setDraft(event.detail.value)
  }

  const handlePrimaryAction = () => {
    if (labels.isRunning) {
      onStop()
      return
    }
    void submit()
  }

  return {
    draft,
    ...labels,
    canSubmit,
    handleInput,
    handlePrimaryAction,
  }
}
