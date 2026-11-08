/* eslint-disable */
// @ts-ignore
import request from '@/shared/api/openapi-request';
import type { CustomRequestOptions } from '@/shared/api/openapi-request';

import * as API from './types';

/** Get the authoritative state of a generation run GET /api/v1/runs/${param0} */
export function runsRunIdUsingGet({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.RunsRunIdUsingGetParams;
  options?: CustomRequestOptions;
}) {
  const { runId: param0, ...queryParams } = params;

  return request<API.RunResponse>(`/api/v1/runs/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Request cancellation of a generation run POST /api/v1/runs/${param0}/cancel */
export function runsRunIdCancelUsingPost({
  params,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.RunsRunIdCancelUsingPostParams;
  options?: CustomRequestOptions;
}) {
  const { runId: param0, ...queryParams } = params;

  return request<API.RunResponse>(`/api/v1/runs/${param0}/cancel`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Create a new run from the original user message POST /api/v1/runs/${param0}/retry */
export function runsRunIdRetryUsingPost({
  params,
  body,
  options,
}: {
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.RunsRunIdRetryUsingPostParams;
  body: API.RetryRunRequest;
  options?: CustomRequestOptions;
}) {
  const { runId: param0, ...queryParams } = params;

  return request<API.RunResponse>(`/api/v1/runs/${param0}/retry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
