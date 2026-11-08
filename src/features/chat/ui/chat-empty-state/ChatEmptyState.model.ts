export interface ChatEmptyStateProps {
  suggestions: readonly string[]
  onSelectSuggestion: (prompt: string) => void
}

export interface ChatEmptyStateActions {
  handleSelectSuggestion: (prompt: string) => void
}

export const CHAT_EMPTY_STATE_COPY = {
  title: '还没有对话',
  description: '试试这些问题，或直接开始输入。',
} as const
