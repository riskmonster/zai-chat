/* eslint-disable */
// @ts-ignore
import request from '@/shared/api/openapi-request';
import type { CustomRequestOptions } from '@/shared/api/openapi-request';

import * as API from './types';

/** List conversations using cursor pagination GET /api/v1/conversations */
export function conversationsUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.ConversationsUsingGetParams;
  options?: CustomRequestOptions;
}) {
  return request<API.ConversationPageResponse>('/api/v1/conversations', {
    method: 'GET',
    params: {
      // limit has a default value: 20
      limit: '20',
      ...params,
    },
    ...(options || {}),
  });
}

/** Create a conversation POST /api/v1/conversations */
export function conversationsUsingPost({
  body,
  options,
}: {
  body: API.CreateConversationRequest;
  options?: CustomRequestOptions;
}) {
  return request<API.ConversationResponse>('/api/v1/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Get a conversation owned by the current user GET /api/v1/conversations/${param0} */
export function conversationsConversationIdUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.ConversationsConversationIdUsingGetParams;
  options?: CustomRequestOptions;
}) {
  const { conversationId: param0, ...queryParams } = params;

  return request<API.ConversationResponse>(`/api/v1/conversations/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Rename a conversation PUT /api/v1/conversations/${param0} */
export function conversationsConversationIdUsingPut({
  params,
  body,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.ConversationsConversationIdUsingPutParams;
  body: API.UpdateConversationRequest;
  options?: CustomRequestOptions;
}) {
  const { conversationId: param0, ...queryParams } = params;

  return request<API.ConversationResponse>(`/api/v1/conversations/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** Soft-delete a conversation DELETE /api/v1/conversations/${param0} */
export function conversationsConversationIdUsingDelete({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.ConversationsConversationIdUsingDeleteParams;
  options?: CustomRequestOptions;
}) {
  const { conversationId: param0, ...queryParams } = params;

  return request<unknown>(`/api/v1/conversations/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
