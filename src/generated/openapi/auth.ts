/* eslint-disable */
// @ts-ignore
import request from '@/shared/api/openapi-request';
import type { CustomRequestOptions } from '@/shared/api/openapi-request';

import * as API from './types';

/** Revoke the current refresh token POST /api/v1/auth/logout */
export function authLogoutUsingPost({
  options,
}: {
  options?: CustomRequestOptions;
}) {
  return request<unknown>('/api/v1/auth/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** Refresh an expired access token POST /api/v1/auth/refresh */
export function authRefreshUsingPost({
  body,
  options,
}: {
  body: API.RefreshTokenRequest;
  options?: CustomRequestOptions;
}) {
  return request<API.AuthSessionResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** Exchange a WeChat login code for an application session POST /api/v1/auth/wx-login */
export function authWxLoginUsingPost({
  body,
  options,
}: {
  body: API.WxLoginRequest;
  options?: CustomRequestOptions;
}) {
  return request<API.AuthSessionResponse>('/api/v1/auth/wx-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
