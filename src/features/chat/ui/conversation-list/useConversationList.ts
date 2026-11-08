import type { ConversationListActions, ConversationListProps } from './ConversationList.model'

export function useConversationList({ onOpen }: ConversationListProps): ConversationListActions {
  return {
    handleOpen: (conversationId) => {
      onOpen(conversationId)
    },
  }
}
