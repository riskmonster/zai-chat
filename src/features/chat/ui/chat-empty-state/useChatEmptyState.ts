import type { ChatEmptyStateActions, ChatEmptyStateProps } from './ChatEmptyState.model'

export function useChatEmptyState({
  onSelectSuggestion,
}: ChatEmptyStateProps): ChatEmptyStateActions {
  return {
    handleSelectSuggestion: (prompt) => {
      onSelectSuggestion(prompt)
    },
  }
}
