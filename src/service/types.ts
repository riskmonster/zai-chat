/* eslint-disable */
// @ts-ignore

export type ApiResponseBase = {
  /** Business result code, 0 means success */
  code: number;
  message: string;
  requestId: string;
};

export type AuthLogoutUsingPostResponses = {
  /**
   * Session revoked
   */
  204: unknown;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type AuthRefreshUsingPostResponses = {
  /**
   * Refreshed session
   */
  200: AuthSessionResponse;
  /**
   * Invalid request
   */
  400: ErrorResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Rate limit or token quota exceeded
   */
  429: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type AuthSession = {
  accessToken: string;
  /** Lifetime in seconds */
  accessTokenExpiresIn: number;
  refreshToken: string;
  /** Lifetime in seconds */
  refreshTokenExpiresIn: number;
  user: User;
};

export type AuthSessionResponse =
  // #/components/schemas/ApiResponseBase
  ApiResponseBase & {
    data: AuthSession;
  };

export type AuthWxLoginUsingPostResponses = {
  /**
   * Authenticated session
   */
  200: AuthSessionResponse;
  /**
   * Invalid request
   */
  400: ErrorResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Rate limit or token quota exceeded
   */
  429: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type Conversation = {
  id: string;
  title: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationPage = {
  items: Conversation[];
  /** Omitted or null when there are no more items */
  nextCursor?: string;
};

export type ConversationPageResponse =
  // #/components/schemas/ApiResponseBase
  ApiResponseBase & {
    data: ConversationPage;
  };

export type ConversationResponse =
  // #/components/schemas/ApiResponseBase
  ApiResponseBase & {
    data: Conversation;
  };

export type ConversationsConversationIdMessagesUsingGetParams = {
  /** Opaque cursor returned by a previous page */
  cursor?: string;
  limit?: number;
  conversationId: string;
};

export type ConversationsConversationIdMessagesUsingGetResponses = {
  /**
   * Message page
   */
  200: MessagePageResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Resource does not exist or is not owned by the current user
   */
  404: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type ConversationsConversationIdMessagesUsingPostParams = {
  conversationId: string;
};

export type ConversationsConversationIdMessagesUsingPostResponses = {
  /**
   * Message and run created
   */
  201: SendMessageResponse;
  /**
   * Invalid request
   */
  400: ErrorResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Resource does not exist or is not owned by the current user
   */
  404: ErrorResponse;
  /**
   * Resource state conflict or duplicate idempotent request
   */
  409: ErrorResponse;
  /**
   * Rate limit or token quota exceeded
   */
  429: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type ConversationsConversationIdUsingDeleteParams = {
  conversationId: string;
};

export type ConversationsConversationIdUsingDeleteResponses = {
  /**
   * Conversation deleted
   */
  204: unknown;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Resource does not exist or is not owned by the current user
   */
  404: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type ConversationsConversationIdUsingGetParams = {
  conversationId: string;
};

export type ConversationsConversationIdUsingGetResponses = {
  /**
   * Conversation
   */
  200: ConversationResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Resource does not exist or is not owned by the current user
   */
  404: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type ConversationsConversationIdUsingPutParams = {
  conversationId: string;
};

export type ConversationsConversationIdUsingPutResponses = {
  /**
   * Updated conversation
   */
  200: ConversationResponse;
  /**
   * Invalid request
   */
  400: ErrorResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Resource does not exist or is not owned by the current user
   */
  404: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type ConversationsUsingGetParams = {
  /** Opaque cursor returned by a previous page */
  cursor?: string;
  limit?: number;
};

export type ConversationsUsingGetResponses = {
  /**
   * Conversation page
   */
  200: ConversationPageResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Rate limit or token quota exceeded
   */
  429: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type ConversationsUsingPostResponses = {
  /**
   * Created conversation
   */
  201: ConversationResponse;
  /**
   * Invalid request
   */
  400: ErrorResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Rate limit or token quota exceeded
   */
  429: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type CreateConversationRequest = {
  title?: string;
};

export type ErrorResponse = {
  /** Stable machine-readable error code */
  code: string;
  message: string;
  requestId: string;
};

export type Message = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: MessageContent;
  status: 'pending' | 'streaming' | 'completed' | 'cancelled' | 'failed';
  errorCode?: string;
  createdAt: string;
  completedAt?: string;
};

export type MessageContent = {
  type: 'text';
  text: string;
};

export type MessagePage = {
  items: Message[];
  /** Omitted or null when there are no more items */
  nextCursor?: string;
};

export type MessagePageResponse =
  // #/components/schemas/ApiResponseBase
  ApiResponseBase & {
    data: MessagePage;
  };

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RetryRunRequest = {
  modelAlias?: string;
};

export enum RoleEnum {
  user = 'user',
  assistant = 'assistant',
  system = 'system',
  tool = 'tool',
}

export type IRoleEnum = keyof typeof RoleEnum;

export type Run = {
  id: string;
  conversationId: string;
  userMessageId: string;
  assistantMessageId: string;
  status: 'queued' | 'streaming' | 'completed' | 'cancelled' | 'failed';
  modelAlias: string;
  errorCode?: string;
  createdAt: string;
  completedAt?: string;
};

export type RunResponse =
  // #/components/schemas/ApiResponseBase
  ApiResponseBase & {
    data: Run;
  };

export type RunsRunIdCancelUsingPostParams = {
  runId: string;
};

export type RunsRunIdCancelUsingPostResponses = {
  /**
   * Updated run state
   */
  200: RunResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Resource does not exist or is not owned by the current user
   */
  404: ErrorResponse;
  /**
   * Resource state conflict or duplicate idempotent request
   */
  409: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type RunsRunIdRetryUsingPostParams = {
  runId: string;
};

export type RunsRunIdRetryUsingPostResponses = {
  /**
   * New run created
   */
  201: RunResponse;
  /**
   * Invalid request
   */
  400: ErrorResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Resource does not exist or is not owned by the current user
   */
  404: ErrorResponse;
  /**
   * Resource state conflict or duplicate idempotent request
   */
  409: ErrorResponse;
  /**
   * Rate limit or token quota exceeded
   */
  429: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type RunsRunIdUsingGetParams = {
  runId: string;
};

export type RunsRunIdUsingGetResponses = {
  /**
   * Run state
   */
  200: RunResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Resource does not exist or is not owned by the current user
   */
  404: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type SendMessageAccepted = {
  userMessage: Message;
  assistantMessageId: string;
  runId: string;
};

export type SendMessageRequest = {
  clientMessageId: string;
  content: MessageContent;
  stream: boolean;
};

export type SendMessageResponse =
  // #/components/schemas/ApiResponseBase
  ApiResponseBase & {
    data: SendMessageAccepted;
  };

export enum StatusEnum {
  active = 'active',
  disabled = 'disabled',
}

export type IStatusEnum = keyof typeof StatusEnum;

export enum StatusEnum2 {
  pending = 'pending',
  streaming = 'streaming',
  completed = 'completed',
  cancelled = 'cancelled',
  failed = 'failed',
}

export type IStatusEnum2 = keyof typeof StatusEnum2;

export enum StatusEnum3 {
  queued = 'queued',
  streaming = 'streaming',
  completed = 'completed',
  cancelled = 'cancelled',
  failed = 'failed',
}

export type IStatusEnum3 = keyof typeof StatusEnum3;

export enum TypeEnum {
  text = 'text',
}

export type ITypeEnum = keyof typeof TypeEnum;

export type UpdateConversationRequest = {
  title: string;
};

export type User = {
  id: string;
  nickname: string;
  avatarUrl?: string;
  status: 'active' | 'disabled';
  createdAt: string;
};

export type UserResponse =
  // #/components/schemas/ApiResponseBase
  ApiResponseBase & {
    data: User;
  };

export type UsersMeUsingGetResponses = {
  /**
   * Current user
   */
  200: UserResponse;
  /**
   * Missing, invalid, or expired authentication
   */
  401: ErrorResponse;
  /**
   * Internal error without provider or secret details
   */
  500: ErrorResponse;
};

export type WxLoginRequest = {
  /** One-time code from uni.login or wx.login */
  code: string;
};
