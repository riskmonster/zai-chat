import type { ConversationView } from '../../model/chat-view-model'

export interface ConversationListProps {
  conversations: ConversationView[]
  onOpen: (conversationId: string) => void
}

export interface ConversationListActions {
  handleOpen: (conversationId: string) => void
}
