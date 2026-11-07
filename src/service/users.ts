/* eslint-disable */
// @ts-ignore
import request from '@/services/openapi-request';
import type { CustomRequestOptions_ } from '@/services/openapi-request';

import * as API from './types';

/** Get the current user GET /api/v1/users/me */
export function usersMeUsingGet({
  options,
}: {
  options?: CustomRequestOptions_;
}) {
  return request<API.UserResponse>('/api/v1/users/me', {
    method: 'GET',
    ...(options || {}),
  });
}
