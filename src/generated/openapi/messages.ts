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
