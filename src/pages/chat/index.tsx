import type { ReactElement } from 'react'

import { Button, Text, View } from '@/shared/ui/shell'

import { ChatEmptyState, ConversationList } from '@/features/chat/public'

import { CHAT_LIST_PAGE_COPY } from './chat-list-page.model'
import { useChatListPage } from './useChatListPage'

import './index.scss'

export default function ChatListPage(): ReactElement {
  const { model, suggestions, actions } = useChatListPage()

  return (
    <View className='chat-list-page'>
      <View className='chat-list-heading'>
        <Text className='chat-list-eyebrow'>{CHAT_LIST_PAGE_COPY.eyebrow}</Text>
        <Text className='chat-list-title'>{CHAT_LIST_PAGE_COPY.title}</Text>
        <Text className='chat-list-description'>{CHAT_LIST_PAGE_COPY.description}</Text>
      </View>

      <View className='chat-list-actions'>
        <Button
          block
          color='primary'
          onClick={() => {
            actions.startNewConversation()
          }}
        >
          {CHAT_LIST_PAGE_COPY.startConversation}
        </Button>
      </View>

      {model.conversationPhase === 'loading' ? (
        <Text className='chat-list-status'>{CHAT_LIST_PAGE_COPY.loading}</Text>
      ) : null}

      {model.conversationError !== null && model.conversationError.length > 0 ? (
        <View className='chat-list-error'>
          <Text className='chat-list-error__copy'>{model.conversationError}</Text>
          <Button
            className='chat-list-error__retry'
            variant='text'
            size='small'
            onClick={actions.reloadConversations}
          >
            {CHAT_LIST_PAGE_COPY.retry}
          </Button>
        </View>
      ) : null}

      {model.conversations.length > 0 ? (
        <ConversationList
          conversations={model.conversations}
          onOpen={actions.openHistoryConversation}
        />
      ) : (
        <ChatEmptyState
          suggestions={suggestions}
          onSelectSuggestion={actions.startNewConversation}
        />
      )}
    </View>
  )
}
