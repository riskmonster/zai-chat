import Taro, { useRouter } from '@tarojs/taro'
import { useEffect } from 'react'

import { useAuthUser } from '@/features/auth/public'
import { chatController, useChatDetailModel } from '@/features/chat/public'

import { normalizeRouteParam, type ChatDetailPageController } from './chat-detail-page.model'

export function useChatDetailPage(): ChatDetailPageController {
  const router = useRouter()
  const user = useAuthUser()
  const routeConversationId = normalizeRouteParam(router.params.conversationId)
  const initialPrompt = normalizeRouteParam(router.params.prompt)
  const fallbackConversationId = user?.id ?? ''
  const conversationId =
    routeConversationId.length > 0 ? routeConversationId : fallbackConversationId
  const detailModel = useChatDetailModel(conversationId || null)

  useEffect(() => {
    if (user === null) {
      void Taro.reLaunch({ url: '/pages/login/index' })
      return
    }
    void chatController.loadPersistedMessages(user.id)
  }, [user])

  const reloadMessages = () => {
    if (user !== null) {
      void chatController.loadPersistedMessages(user.id)
    }
  }

  const retryGeneration = () => {
    if (detailModel.conversationId !== null) {
      void chatController.retryGeneration(detailModel.conversationId)
    }
  }

  const sendText = (text: string) => {
    return user === null ? Promise.resolve(false) : chatController.sendPersistedText(user.id, text)
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
