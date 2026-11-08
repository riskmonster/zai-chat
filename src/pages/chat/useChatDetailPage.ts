import { useRouter } from '@tarojs/taro'
import { useEffect } from 'react'

import { chatController, useChatDetailModel } from '@/features/chat/public'

import { normalizeRouteParam, type ChatDetailPageController } from './chat-detail-page.model'

export function useChatDetailPage(): ChatDetailPageController {
  const router = useRouter()
  const routeConversationId = normalizeRouteParam(router.params.conversationId)
  const initialPrompt = normalizeRouteParam(router.params.prompt)
  const detailModel = useChatDetailModel(routeConversationId || null)

  useEffect(() => {
    if (routeConversationId.length > 0) {
      void chatController.openConversation(routeConversationId)
    } else {
      chatController.startNewConversation()
    }
  }, [routeConversationId])

  const reloadMessages = () => {
    if (detailModel.conversationId !== null) {
      void chatController.loadMessages(detailModel.conversationId)
    }
  }

  const retryGeneration = () => {
    if (detailModel.conversationId !== null) {
      void chatController.retryGeneration(detailModel.conversationId)
    }
  }

  const sendText = (text: string) => {
    return chatController.sendText(detailModel.conversationId, text)
  }

  const stopGeneration = () => {
    if (detailModel.conversationId !== null) {
      void chatController.stopGeneration(detailModel.conversationId)
    }
  }

  return {
    model: {
      ...detailModel,
      initialPrompt,
      composerError:
        detailModel.messages.length === 0 &&
        detailModel.runError !== null &&
        detailModel.runError.length > 0
          ? detailModel.runError
          : undefined,
    },
    actions: {
      reloadMessages,
      retryGeneration,
      sendText,
      stopGeneration,
    },
  }
}
