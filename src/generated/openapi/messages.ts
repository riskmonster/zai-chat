/* eslint-disable */
// @ts-ignore
import request from '@/shared/api/openapi-request';
import type { CustomRequestOptions } from '@/shared/api/openapi-request';

import * as API from './types';

/** List messages using cursor pagination GET /api/v1/conversations/${param0}/messages */
export function conversationsConversationIdMessagesUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.ConversationsConversationIdMessagesUsingGetParams;
  options?: CustomRequestOptions;
}) {
  const { conversationId: param0, ...queryParams } = params;

  return request<API.MessagePageResponse>(
    `/api/v1/conversations/${param0}/messages`,
    {
      method: 'GET',
      params: {
        // limit has a default value: 20
        limit: '20',
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}

/** Persist a user message and create a generation run POST /api/v1/conversations/${param0}/messages */
export function conversationsConversationIdMessagesUsingPost({
  params,
  body,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.ConversationsConversationIdMessagesUsingPostParams;
  body: API.SendMessageRequest;
  options?: CustomRequestOptions;
}) {
  const { conversationId: param0, ...queryParams } = params;

  return request<API.SendMessageResponse>(
    `/api/v1/conversations/${param0}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** List messages in the authenticated user's default conversation Stage-one vertical-slice endpoint. The default conversation identifier isderived from the authenticated user and is never accepted from the client. GET /api/v1/messages */
export function messagesUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.MessagesUsingGetParams;
  options?: CustomRequestOptions;
}) {
  return request<API.PersistedMessagePageResponse>('/api/v1/messages', {
    method: 'GET',
    params: {
      // limit has a default value: 20
      limit: '20',
      ...params,
    },
    ...(options || {}),
  });
}

/** Persist one user message in the default conversation Stage-one vertical-slice endpoint. It does not create a generation run orimply an AI reply. The same clientMessageId with identical content isidempotent; reusing it with different content returns 409. POST /api/v1/messages */
export function messagesUsingPost({
  body,
  options,
}: {
  body: API.CreatePersistedMessageRequest;
  options?: CustomRequestOptions;
}) {
  return request<API.PersistedMessageResponse>('/api/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
