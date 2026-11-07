# ADR-0003：API、状态与渲染分层

- 状态：Accepted
- 日期：2026-11-07

## 背景

聊天页已具备消息、流式状态、取消和重试契约，但页面仍直接持有请求状态并触发占位逻辑。继续演进会让 SSE、错误映射和业务状态散落在组件中。

## 决策

聊天链路按以下顺序分层：

```text
Page/Component
  -> Zustand action
  -> API Facade
  -> generated OpenAPI client + SSE transport
  -> pure domain reducer
  -> Zustand state
  -> selector
  -> Page/Component
```

具体边界：

- `src/api/`：面向业务的 API Facade，只做参数映射和调用编排，不依赖 React。
- `src/domain/chat/`：聊天状态、纯 reducer、事件合并和 ID 生成，不依赖 Taro UI。
- `src/store/chat.ts`：Zustand 状态和业务命令，负责调用 API、管理 SSE 连接和更新 reducer。
- `src/services/`：HTTP 与 SSE 传输适配。
- `src/service/`：OpenAPI 生成客户端，禁止手改。
- `src/components/`：展示组件，只接收 props 并向页面暴露用户意图。
- `src/pages/`：路由与组件组合，不直接调用 `Taro.request` 或拼接模型请求。

## 状态模型

- 加载状态使用显式 `LoadPhase`。
- 生成状态使用单一 `ChatRunPhase`：`idle`、`submitting`、`queued`、`streaming`、`stopping`、`completed`、`failed`、`cancelled`。
- 不组合多个布尔值表达同一业务状态。
- SSE 事件按 `sequence` 去重，`delta` 只追加 assistant 消息内容。
- 发送失败时移除临时消息并保留输入草稿，允许用户直接重试。
- SSE 完成后通过 `GET /runs/{runId}` 对账最终状态。

## 图标策略

Taroify Icon 在 Taro 4.3.2 + Vite 微信构建中会引用当前产物未导出的 `Image` 组件。项目保留 Taroify Core，但图标由 `src/components/ui/AppIcon.tsx` 提供，使用项目自有 CSS 图形，不直接依赖 `@taroify/icons`。

## 测试策略

- Domain reducer：流式增量、sequence 去重、完成和失败状态。
- API Facade：OpenAPI 参数映射。
- Zustand Store：创建会话、发送、流式更新、失败保留和取消。
- 组件：成功清空草稿、失败保留草稿、发送/停止切换。
- 微信开发者工具：真实请求、SSE 和 tabbar 的最终验收。
