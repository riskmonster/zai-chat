import type { ReactElement } from 'react'

import { Button, Text, View } from '@/shared/ui/shell'

import { ChatComposer, ChatMessageList } from '@/features/chat/public'

import { CHAT_DETAIL_PAGE_COPY } from './chat-detail-page.model'
import { useChatDetailPage } from './useChatDetailPage'

import './detail.scss'

export default function ChatDetailPage(): ReactElement {
  const { model, actions } = useChatDetailPage()

  return (
    <View className='chat-detail-page'>
      <View className='chat-detail-messages'>
        {model.messageError !== null && model.messageError.length > 0 ? (
          <View className='chat-detail-error'>
            <Text className='chat-detail-error__copy'>{model.messageError}</Text>
            {model.conversationId !== null ? (
              <Button
                className='chat-detail-error__retry'
                variant='text'
                size='small'
                onClick={actions.reloadMessages}
              >
                {CHAT_DETAIL_PAGE_COPY.reload}
              </Button>
            ) : null}
          </View>
        ) : null}
        <ChatMessageList
          messages={model.messages}
          canRetry={model.canRetry}
          errorMessage={model.runError}
          onRetry={actions.retryGeneration}
        />
      </View>

      <ChatComposer
        status={model.runPhase}
        initialDraft={model.initialPrompt}
        errorMessage={model.composerError}
        onSubmit={actions.sendText}
        onStop={actions.stopGeneration}
      />
    </View>
  )
}
