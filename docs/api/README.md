# API 约定

> Canonical schema：[openapi.yaml](./openapi.yaml) SSE 事件：[sse-events.md](./sse-events.md)

## 通用规则

- API 前缀：`/api/v1`
- 鉴权：`Authorization: Bearer <accessToken>`
- JSON 字段：camelCase
- 时间：ISO 8601 UTC
- 数据库字段：snake_case，仅后端内部使用
- 列表分页：游标分页，不使用页码偏移
- 写操作：支持客户端幂等键或 `clientMessageId`
- 错误：稳定业务码、HTTP 状态码和 `requestId`

## JSON 成功响应

普通 JSON 接口沿用当前前端请求适配器需要的 envelope：

```json
{
  "code": 0,
  "message": "ok",
  "requestId": "req_...",
  "data": {}
}
```

前端生成代码通过 `src/shared/api/openapi-request.ts` 解包 `data`。

## 错误响应

```json
{
  "code": "AUTH_EXPIRED",
  "message": "登录已过期",
  "requestId": "req_..."
}
```

HTTP 状态码与业务错误码同时存在。客户端不得依赖文本判断错误类型。

## 分页

请求：

- `cursor`：可选，不透明字符串；
- `limit`：默认 20，最大 50。

响应：

```json
{
  "items": [],
  "nextCursor": null
}
```

## 聊天写入

提交用户消息采用两阶段流程：

1. `POST /conversations/{id}/messages`：幂等创建用户消息和 run，返回 `201`；
2. `GET /runs/{runId}/events`：订阅 SSE；
3. `GET /runs/{runId}`：查询最终状态，用于断线恢复。

SSE 不是数据事实源，最终消息和状态必须落库。

## 代码生成

```bash
pnpm.cmd openapi
```

完整校验并重新生成：

```bash
pnpm.cmd contract:check
```

- 输入：`docs/api/openapi.yaml`
- 输出：`src/generated/openapi/**`
- 请求适配：`src/shared/api/openapi-request.ts`
- 生成目录禁止手改
- SSE 路径从普通生成代码中排除，由 `src/shared/api/sse/` 和 `src/features/chat/api/chat-stream.ts`
  分层适配

## 兼容性

- 新增字段保持向后兼容；
- 删除或重命名字段必须提升 API 路径版本；
- 枚举新增值需要确认旧客户端降级行为；
- OpenAPI 变更和前端生成代码应在同一个 PR 中提交。
