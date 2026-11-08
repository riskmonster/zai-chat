import { CHAT_MESSAGE_LIST_COPY } from './ChatMessageList.model'
import type {
  ChatMessageListActions,
  ChatMessageListModel,
  ChatMessageListProps,
} from './ChatMessageList.model'

export function useChatMessageList({
  messages,
  canRetry,
  errorMessage,
  onRetry,
}: ChatMessageListProps): ChatMessageListModel & ChatMessageListActions {
  return {
    messages,
    isEmpty: messages.length === 0,
    canRetry,
    errorMessage: errorMessage ?? CHAT_MESSAGE_LIST_COPY.retryFallback,
    handleRetry: () => {
      if (canRetry) {
        onRetry()
      }
    },
  }
}
