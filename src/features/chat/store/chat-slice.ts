import { create, type StoreApi } from 'zustand'

import type { ChatDomainAction } from '../model/chat-reducer'
import { chatDomainReducer } from '../model/chat-reducer'
import { createInitialChatDomainState, type ChatDomainState } from '../model/chat-types'

export interface ChatStoreState extends ChatDomainState {
  applyDomainAction: (action: ChatDomainAction) => void
}

export const useChatStore = create<ChatStoreState>()((set) => ({
  ...createInitialChatDomainState(),
  applyDomainAction: (action) => {
    set((state) => chatDomainReducer(state, action))
  },
}))

export type ChatStoreApi = StoreApi<ChatStoreState>
