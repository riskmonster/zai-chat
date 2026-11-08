# ADR-0003：API、状态与渲染分层

- 状态：Accepted
- 日期：2026-11-07

## 背景

聊天页需要同时处理会话列表、消息分页、流式增量、取消、重试和断线对账。页面直接持有请求状态，或让 Store 同时管理网络连接，会造成难以测试的副作用。

## 决策

聊天链路按以下顺序分层：

```text
Page
  -> feature public hooks + controller commands
  -> application controller
  -> feature API Facade + chat stream mapper
  -> shared JSON/SSE transport + generated OpenAPI client
  -> pure domain reducer
  -> Zustand slice
  -> selector / ViewModel
  -> Page / Component
```

具体边界：

- `src/features/chat/api/`：业务 API Facade、OpenAPI DTO Mapper、聊天 SSE 事件映射。
- `src/features/chat/model/`：领域类型、事件、纯 reducer、selector 和 ViewModel 映射。
- `src/features/chat/store/`：只保存可序列化状态和同步 `applyDomainAction`。
- `src/features/chat/application/`：创建、发送、取消、重试、流连接和对账。
- `src/shared/api/`：普通 JSON 与通用 SSE 传输，不依赖任何 Zustand Store。
- `src/shared/lib/`：错误和 ID 等无业务含义能力。
- `src/generated/openapi/`：生成客户端，禁止手改。
- `src/pages/`：Taro 路由、生命周期和功能组合。

## 依赖规则

- Model 不依赖 React、Taro、Zustand、OpenAPI DTO 或传输层。
- Store 不依赖 API、Controller、UI 或页面。
- Shared 不依赖 features 或 pages。
- Feature UI 不依赖 Store、Controller、API 或生成 DTO。
- 页面只依赖 feature public API、shared UI 和 Taro 路由。
- Feature 之间禁止导入内部文件。

## 状态与传输

- 加载状态使用显式 `LoadPhase`。
- 生成状态使用单一
  `ChatRunPhase`：`idle`、`submitting`、`queued`、`streaming`、`stopping`、`completed`、`failed`、`cancelled`。
- 通用 SSE parser 只返回 `SseMessage`，聊天事件校验和 `sequence` 去重位于 `chat-stream.ts`。
- SSE 连接由 Controller 的 `RunConnectionRegistry` 管理，不进入 Store。
- 发送失败时移除临时消息并保留输入草稿，允许用户直接重试。
- SSE 完成后通过 `GET /runs/{runId}` 对账最终状态。

## 图标策略

基础组件与图标统一由 `src/shared/ui/shell.ts` 导出。发送、停止和重试分别使用 Taroify 的
`ArrowUp`、`StopCircle`、`Replay` 图标；微信生产构建和模拟器运行均已验证。

## 测试策略

- Model：纯 reducer 的流式增量、去重、完成和失败状态。
- API：OpenAPI 参数映射和 DTO 到领域模型转换。
- Stream：通用 SSE 解析、聊天事件校验和 sequence 去重。
- Store：只验证同步 transition。
- Controller：创建会话、发送、失败、取消和对账。
- UI：成功清空草稿、失败保留草稿、发送和停止切换。
- 微信开发者工具：Console、安全区、tabbar 和真实流式请求最终验收。
