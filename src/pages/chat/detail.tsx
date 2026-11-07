import { Text, View } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { useEffect } from 'react'

import ChatComposer from '@/components/chat/ChatComposer'
import ChatMessageList from '@/components/chat/ChatMessageList'
import type { Message } from '@/service/types'
import { useChatStore } from '@/store/chat'

import './detail.scss'

const EMPTY_MESSAGES: Message[] = []

export default function ChatDetailPage() {
  const router = useRouter()
  const routeConversationId = normalizeParam(router.params.conversationId)
  const initialPrompt = normalizeParam(router.params.prompt)
  const activeConversationId = useChatStore(state => state.activeConversationId)
  const messages = useChatStore(state =>
    getMessages(state.messagesByConversation, activeConversationId),
  )
  const run = useChatStore(state =>
    activeConversationId
      ? state.runsByConversation[activeConversationId]
      : undefined,
  )
  const messageError = useChatStore(state =>
    activeConversationId
      ? state.messageErrorByConversation[activeConversationId] ?? null
      : null,
  )
  const openConversation = useChatStore(state => state.openConversation)
  const loadMessages = useChatStore(state => state.loadMessages)
  const sendText = useChatStore(state => state.sendText)
  const stopGeneration = useChatStore(state => state.stopGeneration)
  const retryGeneration = useChatStore(state => state.retryGeneration)

  useEffect(() => {
    if (routeConversationId) {
      void openConversation(routeConversationId)
    }
  }, [openConversation, routeConversationId])

  const conversationId = activeConversationId ?? routeConversationId ?? null
  const runPhase = run?.phase ?? 'idle'
  const runError = run?.error ?? null

  return (
    <View className='chat-detail-page'>
      <View className='chat-detail-messages'>
        {messageError
          ? (
              <View className='chat-detail-error'>
                <Text className='chat-detail-error__copy'>{messageError.message}</Text>
                {conversationId
                  ? (
                      <Text
                        className='chat-detail-error__retry'
                        onClick={() => void loadMessages(conversationId)}
                      >
                        重新加载
                      </Text>
                    )
                  : null}
              </View>
            )
          : null}
        <ChatMessageList
          messages={messages}
          runPhase={runPhase}
          runError={runError}
          onRetry={() => {
            if (conversationId) {
              void retryGeneration(conversationId)
            }
          }}
        />
      </View>

      <ChatComposer
        status={runPhase}
        initialDraft={initialPrompt}
        errorMessage={messages.length === 0 && runError ? runError.message : undefined}
        onSubmit={text => sendText(conversationId, text)}
        onStop={() => {
          if (conversationId) {
            void stopGeneration(conversationId)
          }
        }}
      />
    </View>
  )
}

function getMessages(
  messagesByConversation: Record<string, Message[]>,
  conversationId: string | null,
): Message[] {
  return conversationId
    ? messagesByConversation[conversationId] ?? EMPTY_MESSAGES
    : EMPTY_MESSAGES
}

function normalizeParam(value?: string): string {
  if (!value) {
    return ''
  }
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}
