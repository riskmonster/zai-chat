/* eslint-disable */
// @ts-ignore
import request from '@/shared/api/openapi-request';
import type { CustomRequestOptions } from '@/shared/api/openapi-request';

import * as API from './types';

/** Get the current user GET /api/v1/users/me */
export function usersMeUsingGet({
  options,
}: {
  options?: CustomRequestOptions;
}) {
  return request<API.UserResponse>('/api/v1/users/me', {
    method: 'GET',
    ...(options || {}),
  });
}
